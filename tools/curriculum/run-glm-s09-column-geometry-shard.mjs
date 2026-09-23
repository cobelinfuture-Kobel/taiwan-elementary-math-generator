import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchALayoutMode,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASelectionMode,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";
import { GLM_S06_SHARD_COUNT, scenariosForShard } from "./glm-s06-scenario-plan.mjs";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const outputRoot = path.join(repositoryRoot, "docs/curriculum/output/glm-s09-column-geometry");
const temporaryRoot = path.join("/tmp", "glm-s09-column-geometry");
const css = readFileSync(path.join(repositoryRoot, "site/assets/styles/print-styles.css"), "utf8");

function shardIndex() {
  const arg = process.argv.find((item) => item.startsWith("--shard="));
  const value = Number(arg?.slice(8));
  if (!Number.isInteger(value) || value < 0 || value >= GLM_S06_SHARD_COUNT) throw new Error(`GLM_S09_SHARD_INVALID:${arg}`);
  return value;
}

function stateFor(scenario) {
  const state = createConfigState();
  setBatchASourceId(state, scenario.sourceId);
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, scenario.questionCount);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, false);
  setBatchAGenerationSeed(state, `glm-s09:${scenario.sourceId}:${scenario.layoutId}`);
  setBatchAPrintLayout(state, { columns: scenario.requestedColumns, rowsPerPage: scenario.requestedRowsPerPage });
  setBatchALayoutMode(state, "custom_with_caps");
  return state;
}

function htmlFor(document, scenario) {
  const html = renderWorksheetDocumentToHtml(document, {
    title: `${scenario.unitCode} ${scenario.layoutId} GLM-S09`,
    stylesheetHref: "",
    debugDataAttributes: true,
  });
  return html.replace("</head>", `<style>${css}</style></head>`);
}

async function inspect(browser, htmlPath, expectedColumns) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  const result = await page.evaluate(({ expectedColumns }) => {
    const pages = [...document.querySelectorAll('[data-page-type="question"],.worksheet-page--questions')]
      .filter((node) => getComputedStyle(node).display !== "none");
    const pageResults = pages.map((questionPage, pageIndex) => {
      const cards = [...questionPage.querySelectorAll(".worksheet-cell--question,.g4b-u04-cell--question")]
        .filter((node) => getComputedStyle(node).display !== "none");
      const lefts = cards.map((card) => card.getBoundingClientRect().left);
      const sorted = [...lefts].sort((a, b) => a - b);
      const clusters = [];
      for (const value of sorted) {
        const existing = clusters.find((row) => Math.abs(row.center - value) <= 2);
        if (existing) {
          existing.values.push(value);
          existing.center = existing.values.reduce((sum, item) => sum + item, 0) / existing.values.length;
        } else clusters.push({ center: value, values: [value] });
      }
      const expected = Math.min(expectedColumns, cards.length);
      const grid = questionPage.querySelector(".worksheet-page__grid,.g4b-u04-grid");
      const computedColumns = grid ? getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length : 0;
      const widths = cards.map((card) => card.getBoundingClientRect().width);
      return {
        pageIndex,
        cardCount: cards.length,
        expectedColumnCount: expected,
        actualColumnCount: clusters.length,
        xClusters: clusters.map((row) => Number(row.center.toFixed(2))),
        computedGridColumnCount: computedColumns,
        geometryAuthority: grid?.matches(".worksheet-page__grid")
          ? "shared_worksheet_grid"
          : grid?.matches(".g4b-u04-grid")
            ? "g4b_u04_renderer_grid"
            : "missing_grid",
        maxCardWidth: widths.length ? Math.max(...widths) : 0,
        pageWidth: questionPage.getBoundingClientRect().width,
        pass: cards.length > 0 && clusters.length === expected && computedColumns === expectedColumns,
      };
    });
    return {
      pageCount: pages.length,
      pageResults,
      pass: pages.length > 0 && pageResults.every((row) => row.pass),
    };
  }, { expectedColumns });
  await page.close();
  return result;
}

const index = shardIndex();
const scenarios = scenariosForShard(index);
const outputDir = path.join(outputRoot, `shard-${index}`);
const tempDir = path.join(temporaryRoot, `shard-${index}`);
rmSync(outputDir, { recursive: true, force: true });
rmSync(tempDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
mkdirSync(tempDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--allow-file-access-from-files"] });
const results = [];
try {
  for (const scenario of scenarios) {
    const generation = buildWorksheetDocumentFromState(stateFor(scenario));
    const document = generation?.worksheetDocument;
    if (!generation?.ok || !document) {
      results.push({ ...scenario, status: "GENERATION_BLOCKED", issueCodes: (generation?.errors ?? []).map((row) => row?.code).filter(Boolean) });
      continue;
    }
    const htmlPath = path.join(tempDir, `${scenario.sourceId}-${scenario.layoutId}.html`);
    writeFileSync(htmlPath, htmlFor(document, scenario), "utf8");
    const geometry = await inspect(browser, htmlPath, scenario.requestedColumns);
    results.push({
      ...scenario,
      status: geometry.pass ? "PASS" : "COLUMN_GEOMETRY_MISMATCH",
      geometry,
      rendererProfileId: document?.rendererProfile?.profileId ?? null,
      layoutMode: document?.layoutResolution?.layoutMode ?? null,
      layoutExact: document?.layoutResolution?.layoutExact ?? null,
    });
  }
} finally {
  await browser.close();
}

const manifest = {
  schemaVersion: "glm-s09-column-geometry-shard-v1",
  task: "GLM-S09_ActualColumnGeometryAuditAndRendererFullFix",
  shardIndex: index,
  scenarioCount: results.length,
  passCount: results.filter((row) => row.status === "PASS").length,
  failureCount: results.filter((row) => row.status !== "PASS").length,
  status: results.every((row) => row.status === "PASS") ? "PASS" : "FAIL",
  results,
};
writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ...manifest, results: undefined }, null, 2));
if (manifest.status !== "PASS") process.exitCode = 1;
