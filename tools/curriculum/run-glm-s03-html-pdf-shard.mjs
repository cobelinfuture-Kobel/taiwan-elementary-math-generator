import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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
import {
  GLM_S03_SHARD_COUNT,
  scenariosForShard,
} from "./glm-s03-scenario-plan.mjs";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const outputRoot = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s03-270-html-pdf-baseline",
);
const temporaryRoot = path.join("/tmp", "glm-s03-270-html-pdf-baseline");
const basePrintCss = readFileSync(
  path.join(repositoryRoot, "site/assets/styles/print-styles.css"),
  "utf8",
);
const g5aU02CanonicalHtml = readFileSync(
  path.join(repositoryRoot, "docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.html"),
  "utf8",
);

function parseShardIndex() {
  const argument = process.argv.find((item) => item.startsWith("--shard="));
  const value = Number(argument?.slice("--shard=".length));
  if (!Number.isInteger(value) || value < 0 || value >= GLM_S03_SHARD_COUNT) {
    throw new Error(`GLM_S03_SHARD_ARGUMENT_INVALID:${argument ?? "missing"}`);
  }
  return value;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function issueCodes(result) {
  const issues = [
    ...(result?.errors ?? []),
    ...(result?.validation?.errors ?? []),
    ...(result?.warnings ?? []),
    ...(result?.validation?.warnings ?? []),
  ];
  return unique(issues.map((issue) => issue?.code));
}

function createScenarioState(scenario) {
  const state = createConfigState();
  setBatchASourceId(state, scenario.sourceId);
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, scenario.questionCount);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, false);
  setBatchAGenerationSeed(state, scenario.generationSeed);
  setBatchAPrintLayout(state, {
    columns: scenario.requestedColumns,
    rowsPerPage: scenario.requestedRowsPerPage,
  });
  setBatchALayoutMode(state, "custom_with_caps");
  return state;
}

function resolvedQuestionLayout(document) {
  const resolved = document?.layoutResolution?.resolvedQuestionLayout;
  const printOptions = document?.printOptions;
  const snapshot = document?.configSnapshot?.printLayout;
  const columns = Number(resolved?.columns ?? printOptions?.columns ?? snapshot?.columns);
  const rowsPerPage = Number(
    resolved?.rowsPerPage ?? printOptions?.rowsPerPage ?? snapshot?.rowsPerPage,
  );
  return {
    columns: Number.isInteger(columns) && columns > 0 ? columns : null,
    rowsPerPage: Number.isInteger(rowsPerPage) && rowsPerPage > 0 ? rowsPerPage : null,
    authority: resolved
      ? "layoutResolution.resolvedQuestionLayout"
      : printOptions
        ? "printOptions"
        : snapshot
          ? "configSnapshot.printLayout"
          : "missing",
  };
}

function classifyDocument(result, requested, resolved) {
  if (!result?.ok || !result?.worksheetDocument) return "GENERATION_BLOCKED";
  if (resolved.columns === requested.columns && resolved.rowsPerPage === requested.rowsPerPage) {
    return "PASS";
  }
  if (resolved.columns === null || resolved.rowsPerPage === null) return "IGNORED";
  if (resolved.columns < requested.columns || resolved.rowsPerPage < requested.rowsPerPage) {
    return "SILENTLY_CAPPED";
  }
  return "IGNORED";
}

function injectBaseCss(html) {
  return html.replace("</head>", `<style id="glm-s03-base-print-css">${basePrintCss}</style></head>`);
}

function staticG5AU02Html() {
  const suppression = [
    "<style id=\"glm-s03-g5a-u02-question-only\">",
    ".g5a-u02-section--answers,[data-page-type=\"answer\"],.g5a-u02-page--answers{display:none!important}",
    "</style>",
  ].join("");
  return g5aU02CanonicalHtml.replace("</head>", `${suppression}</head>`);
}

function renderedHtml(result, scenario) {
  if (scenario.sourceId === "g5a_u02_5a02") return staticG5AU02Html();
  return injectBaseCss(renderWorksheetDocumentToHtml(result.worksheetDocument, {
    title: `${scenario.unitCode} ${scenario.unitTitle}｜${scenario.layoutId}｜GLM-S03`,
    stylesheetHref: "",
  }));
}

function generatedQuestionCount(document) {
  return document?.summary?.questionCount
    ?? document?.generatedQuestions?.length
    ?? document?.questionDisplayModels?.length
    ?? 0;
}

function buildScenario(scenario) {
  let result;
  let exception = null;
  try {
    result = buildWorksheetDocumentFromState(createScenarioState(scenario));
  } catch (error) {
    exception = {
      name: error?.name ?? "Error",
      message: String(error?.message ?? error),
    };
    result = { ok: false, errors: [{ code: "GLM_S03_GENERATION_EXCEPTION" }] };
  }

  const document = result?.worksheetDocument ?? null;
  const requested = {
    columns: scenario.requestedColumns,
    rowsPerPage: scenario.requestedRowsPerPage,
  };
  const resolved = resolvedQuestionLayout(document);
  const documentClassification = classifyDocument(result, requested, resolved);
  const base = {
    ...clone(scenario),
    requestedLayout: requested,
    resolvedLayout: resolved,
    documentClassification,
    generationOk: Boolean(result?.ok && document),
    generationIssueCodes: issueCodes(result),
    generationException: exception,
    generatedQuestionCount: generatedQuestionCount(document),
    documentQuestionPageCount: document?.summary?.questionPageCount
      ?? document?.questionPages?.length
      ?? 0,
    rendererProfileId: document?.rendererProfile?.profileId ?? null,
    layoutMode: document?.layoutResolution?.layoutMode
      ?? document?.batchA?.layoutMode
      ?? null,
    layoutCapped: document?.layoutResolution?.capped
      ?? document?.summary?.layoutCapped
      ?? null,
    renderAttempted: false,
    renderFindings: [],
  };
  if (!result?.ok || !document) return { scenario: base, html: null };
  const html = renderedHtml(result, scenario);
  return {
    scenario: {
      ...base,
      htmlSha256: sha256(html),
      htmlBytes: Buffer.byteLength(html),
    },
    html,
  };
}

async function inspectHtmlAndCreatePdf(browser, htmlPath, pdfPath, screenshotPath) {
  const consoleErrors = [];
  const pageErrors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
  await page.emulateMedia({ media: "print" });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  const dom = await page.evaluate(() => {
    function uniqueElements(selectors) {
      return [...new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]))];
    }
    const questionPages = uniqueElements([
      '[data-page-type="question"]',
      ".worksheet-page--questions",
      ".g4b-u04-page--questions",
      ".g5a-u08-page--questions",
      ".g5a-u02-page--questions",
    ]).filter((node) => getComputedStyle(node).display !== "none");
    const questionCards = uniqueElements([
      ".worksheet-cell--question",
      ".g4b-u04-cell--question",
      ".g5a-u08-cell--question",
      ".g5a-u02-card--question",
    ]).filter((node) => getComputedStyle(node).display !== "none");
    const promptNodes = uniqueElements([
      ".worksheet-cell--question .worksheet-cell__prompt",
      ".g4b-u04-cell--question .g4b-u04-cell__prompt",
      ".g5a-u08-cell--question .g5a-u08-cell__prompt",
      ".g5a-u02-card--question .g5a-u02-card__prompt",
    ]).filter((node) => getComputedStyle(node).display !== "none");
    const responseNodes = uniqueElements([
      ".worksheet-cell--question .worksheet-cell__response",
      ".g4b-u04-cell--question .g4b-u04-cell__response",
      ".g5a-u08-cell--question .g5a-u08-cell__response",
      ".g5a-u02-card--question .g5a-u02-card__response",
    ]).filter((node) => getComputedStyle(node).display !== "none");
    const overflowNodes = questionCards.filter((node) => (
      node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1
    ));
    const textOverflowNodes = [...promptNodes, ...responseNodes].filter((node) => (
      node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1
    ));
    const pageOverflowNodes = questionPages.filter((node) => (
      node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1
    ));
    const missingPromptNodes = promptNodes.filter((node) => !node.textContent?.trim());
    const overlaps = [];
    for (const questionPage of questionPages) {
      const cards = questionCards.filter((card) => questionPage.contains(card));
      const rectangles = cards.map((card, index) => ({
        index,
        text: card.textContent?.trim().slice(0, 80) ?? "",
        rect: card.getBoundingClientRect(),
      }));
      for (let left = 0; left < rectangles.length; left += 1) {
        for (let right = left + 1; right < rectangles.length; right += 1) {
          const a = rectangles[left].rect;
          const b = rectangles[right].rect;
          const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapWidth > 0.5 && overlapHeight > 0.5) {
            overlaps.push({
              left: rectangles[left].text,
              right: rectangles[right].text,
              overlapWidth,
              overlapHeight,
            });
          }
        }
      }
    }
    return {
      questionPageCount: questionPages.length,
      questionCardCount: questionCards.length,
      promptCount: promptNodes.length,
      responsePromptCount: responseNodes.length,
      cardOverflowCount: overflowNodes.length,
      textOverflowCount: textOverflowNodes.length,
      pageOverflowCount: pageOverflowNodes.length,
      interCardOverlapCount: overlaps.length,
      missingPromptCount: missingPromptNodes.length,
      firstCardOverflow: overflowNodes[0]?.outerHTML.slice(0, 800) ?? null,
      firstTextOverflow: textOverflowNodes[0]?.outerHTML.slice(0, 800) ?? null,
      firstOverlap: overlaps[0] ?? null,
    };
  });

  const visualFailure = dom.cardOverflowCount > 0
    || dom.textOverflowCount > 0
    || dom.pageOverflowCount > 0
    || dom.interCardOverlapCount > 0
    || dom.missingPromptCount > 0;
  if (visualFailure) {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  });
  await page.close();
  return {
    ...dom,
    consoleErrorCount: consoleErrors.length,
    consoleErrors: consoleErrors.slice(0, 10),
    pageErrorCount: pageErrors.length,
    pageErrors: pageErrors.slice(0, 10),
    screenshotCreated: visualFailure,
  };
}

function runPythonInspector(inputPath, outputPath) {
  const result = spawnSync(
    "python3",
    ["tools/curriculum/inspect-glm-s03-pdfs.py", inputPath, outputPath],
    { cwd: repositoryRoot, encoding: "utf8", stdio: "inherit" },
  );
  if (result.status !== 0) {
    throw new Error(`GLM_S03_PDF_INSPECTOR_FAILED:${result.status}`);
  }
}

function renderFindingCodes(dom, pdf, scenario) {
  const findings = [];
  if (dom.cardOverflowCount > 0 || dom.textOverflowCount > 0 || dom.pageOverflowCount > 0) {
    findings.push("OVERFLOW");
  }
  if (dom.interCardOverlapCount > 0) findings.push("OVERLAP");
  if (pdf.blankPdfPageCount > 0) findings.push("BLANK_PAGE");
  if (pdf.pdfBoundingBoxOverflowCount > 0) findings.push("PDF_BOUNDING_BOX_OVERFLOW");
  if (pdf.pdfPageCount !== dom.questionPageCount) findings.push("PDF_PAGE_COUNT_MISMATCH");
  if (dom.questionCardCount !== scenario.generatedQuestionCount) findings.push("QUESTION_CARD_COUNT_MISMATCH");
  if (dom.missingPromptCount > 0) findings.push("QUESTION_PROMPT_MISSING");
  if (dom.consoleErrorCount > 0) findings.push("CONSOLE_ERROR");
  if (dom.pageErrorCount > 0) findings.push("PAGE_ERROR");
  return findings;
}

const shardIndex = parseShardIndex();
const shardScenarios = scenariosForShard(shardIndex);
const shardOutputDirectory = path.join(outputRoot, `shard-${shardIndex}`);
const shardTemporaryDirectory = path.join(temporaryRoot, `shard-${shardIndex}`);
rmSync(shardOutputDirectory, { recursive: true, force: true });
rmSync(shardTemporaryDirectory, { recursive: true, force: true });
mkdirSync(shardOutputDirectory, { recursive: true });
mkdirSync(shardTemporaryDirectory, { recursive: true });

const built = shardScenarios.map(buildScenario);
const htmlCache = new Map();
const browser = await chromium.launch({
  headless: true,
  args: ["--allow-file-access-from-files"],
});
try {
  for (const entry of built) {
    if (!entry.html) continue;
    const htmlHash = entry.scenario.htmlSha256;
    let cached = htmlCache.get(htmlHash);
    if (!cached) {
      const cacheId = `render-${htmlCache.size + 1}`;
      const htmlPath = path.join(shardTemporaryDirectory, `${cacheId}.html`);
      const pdfPath = path.join(shardTemporaryDirectory, `${cacheId}.pdf`);
      const screenshotPath = path.join(
        shardOutputDirectory,
        `${entry.scenario.sourceId}-${entry.scenario.layoutId}-failure.png`,
      );
      writeFileSync(htmlPath, `${entry.html}\n`, "utf8");
      const dom = await inspectHtmlAndCreatePdf(browser, htmlPath, pdfPath, screenshotPath);
      cached = { htmlPath, pdfPath, screenshotPath, dom };
      htmlCache.set(htmlHash, cached);
    }
    entry.scenario.renderAttempted = true;
    entry.scenario.dom = clone(cached.dom);
    entry.scenario.transientPdfPath = cached.pdfPath;
    entry.scenario.failureScreenshot = cached.dom.screenshotCreated
      ? path.relative(repositoryRoot, cached.screenshotPath)
      : null;
  }
} finally {
  await browser.close();
}

const uniquePdfs = [...new Set(
  built.map((entry) => entry.scenario.transientPdfPath).filter(Boolean),
)];
const pdfInputPath = path.join(shardTemporaryDirectory, "pdf-input.json");
const pdfOutputPath = path.join(shardTemporaryDirectory, "pdf-output.json");
writeFileSync(
  pdfInputPath,
  `${JSON.stringify({ pdfs: uniquePdfs.map((pdfPath) => ({ pdfPath })) }, null, 2)}\n`,
  "utf8",
);
if (uniquePdfs.length > 0) runPythonInspector(pdfInputPath, pdfOutputPath);
const pdfInspection = uniquePdfs.length > 0
  ? JSON.parse(readFileSync(pdfOutputPath, "utf8")).results
  : {};

for (const entry of built) {
  const scenario = entry.scenario;
  if (!scenario.renderAttempted) continue;
  const pdf = pdfInspection[path.resolve(scenario.transientPdfPath)];
  if (!pdf) throw new Error(`GLM_S03_PDF_RESULT_MISSING:${scenario.scenarioId}`);
  scenario.pdf = pdf;
  scenario.renderFindings = renderFindingCodes(scenario.dom, pdf, scenario);
  scenario.renderStatus = scenario.renderFindings.length === 0 ? "PASS" : "DEFECTS_DETECTED";
  delete scenario.transientPdfPath;
}

const classificationCounts = Object.fromEntries(
  ["PASS", "SILENTLY_CAPPED", "GENERATION_BLOCKED", "IGNORED"].map((code) => [
    code,
    built.filter((entry) => entry.scenario.documentClassification === code).length,
  ]),
);
const renderFindingCounts = {};
for (const entry of built) {
  for (const code of entry.scenario.renderFindings) {
    renderFindingCounts[code] = (renderFindingCounts[code] ?? 0) + 1;
  }
}
const manifest = {
  schemaVersion: "glm-s03-html-pdf-shard-v1",
  task: "GLM-S03_270ScenarioHTMLPDFBaseline",
  status: "SHARD_BASELINE_CAPTURED",
  shardIndex,
  shardCount: GLM_S03_SHARD_COUNT,
  scenarioCount: built.length,
  unitSourceIds: unique(built.map((entry) => entry.scenario.sourceId)),
  generatedScenarioCount: built.filter((entry) => entry.scenario.generationOk).length,
  renderedScenarioCount: built.filter((entry) => entry.scenario.renderAttempted).length,
  uniqueRenderedHtmlCount: htmlCache.size,
  classificationCounts,
  renderFindingCounts,
  scenarios: built.map((entry) => entry.scenario),
};
const manifestPath = path.join(shardOutputDirectory, "manifest.json");
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: manifest.status,
  shardIndex,
  scenarioCount: manifest.scenarioCount,
  generatedScenarioCount: manifest.generatedScenarioCount,
  renderedScenarioCount: manifest.renderedScenarioCount,
  uniqueRenderedHtmlCount: manifest.uniqueRenderedHtmlCount,
  classificationCounts,
  renderFindingCounts,
  manifestPath: path.relative(repositoryRoot, manifestPath),
}, null, 2));
