import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  G6A_U04_P03F53_ROUNDING_GROUP_ID,
  G6A_U04_P03F53_ROUNDING_KP_ID,
  G6A_U04_P03F53_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g6a-u04-rank13-rounding-selector-projection-p03f53.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = new URL(process.env.P03F53_BASE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const OUT = resolve(ROOT, "tmp/p03f-slice053-live-pages-e2e");
mkdirSync(OUT, { recursive: true });

const ASSETS = [
  ["site/assets/browser/public-capability-ui.js", "assets/browser/public-capability-ui.js"],
  ["site/assets/browser/state/public-pattern-group-selection.js", "assets/browser/state/public-pattern-group-selection.js"],
  ["site/assets/browser/state/query-state.js", "assets/browser/state/query-state.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-generator-p03f53.js", "modules/curriculum/batch-a/batch-a-browser-generator-p03f53.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f53.js", "modules/curriculum/batch-a/batch-a-browser-question-router-p03f53.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-validator-p03f53.js", "modules/curriculum/batch-a/batch-a-browser-validator-p03f53.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f53-extension.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-p03f53-extension.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
  ["site/modules/curriculum/batch-a/g6a-u04-rank13-rounding-runtime-p03f53.js", "modules/curriculum/batch-a/g6a-u04-rank13-rounding-runtime-p03f53.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p03f53.js", "modules/curriculum/public/public-ui-capability-binding-p03f53.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p03f53-extension.js", "modules/curriculum/registry/batch-a-selector-p03f53-extension.js"],
  ["site/modules/curriculum/registry/g6a-u04-rank13-rounding-selector-projection-p03f53.js", "modules/curriculum/registry/g6a-u04-rank13-rounding-selector-projection-p03f53.js"],
  ["site/pixel/pixel-public-capability-ui.js", "pixel/pixel-public-capability-ui.js"],
  ["site/pixel/pixel-registry-bridge.js", "pixel/pixel-registry-bridge.js"],
];

const hash = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function waitForExactDependencyClosure() {
  const retries = Number(process.env.P03F53_DEPLOYMENT_RETRIES ?? 20);
  const delay = Number(process.env.P03F53_DEPLOYMENT_RETRY_DELAY_MS ?? 15000);
  let lastFailure = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const assets = [];
      for (const [repoPath, publicPath] of ASSETS) {
        const expectedSha256 = hash(readFileSync(resolve(ROOT, repoPath), "utf8"));
        const url = new URL(publicPath, BASE);
        url.searchParams.set("p03f53-preflight", expectedSha256.slice(0, 16));
        const response = await fetch(url, { cache: "no-store", headers: { "cache-control": "no-cache" } });
        if (!response.ok) throw new Error(`HTTP_${response.status}:${publicPath}`);
        const liveSha256 = hash(await response.text());
        if (liveSha256 !== expectedSha256) throw new Error(`SHA_MISMATCH:${publicPath}`);
        assets.push({ repoPath, publicPath, expectedSha256, liveSha256 });
      }
      return { attempt, assets };
    } catch (error) {
      lastFailure = error;
      if (attempt < retries) await sleep(delay);
    }
  }
  throw new Error(`P03F53_DEPENDENCY_CLOSURE_NOT_EXACT:${lastFailure?.message ?? "unknown"}`);
}

function caseUrl() {
  const url = new URL(BASE);
  for (const [key, value] of Object.entries({
    sourceId: G6A_U04_P03F53_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: "numeric",
    questionCount: "24",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: "p03f53-live-preflight-rounding",
    columns: "2",
    rowsPerPage: "4",
  })) url.searchParams.set(key, value);
  url.searchParams.append("kp", G6A_U04_P03F53_ROUNDING_KP_ID);
  url.searchParams.append("pg", G6A_U04_P03F53_ROUNDING_GROUP_ID);
  return url;
}

const report = {
  schemaName: "P03FSlice053LivePagesPreflightV1",
  status: "PENDING",
  dependencyClosure: null,
  ui: null,
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
  serverErrors: [],
};

let browser = null;
try {
  report.dependencyClosure = await waitForExactDependencyClosure();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("console", (message) => { if (message.type() === "error") report.consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
  page.on("requestfailed", (request) => report.requestFailures.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 500) report.serverErrors.push(`${response.status()}:${response.url()}`); });

  const response = await page.goto(caseUrl().href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P03F53_PREFLIGHT_PAGE:${response?.status() ?? "NO_RESPONSE"}`);
  await page.waitForTimeout(3000);

  report.ui = await page.evaluate(async ({ sourceId, kp }) => {
    const params = new URL(location.href).searchParams;
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f53-preflight", String(Date.now()));
    const registry = (await import(registryUrl.href)).getCurrentPixelRegistrySnapshot();
    const source = registry.bySourceId[sourceId];
    const kpNode = document.querySelector(`[data-knowledge-point-id="${kp}"]`);
    return {
      readyState: document.readyState,
      sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
      selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
      kpExists: Boolean(kpNode),
      kpSelected: kpNode?.dataset?.selected ?? null,
      kpQuery: params.getAll("kp"),
      pgQuery: params.getAll("pg"),
      publicSourceCount: registry.sourceCount,
      visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
      sourceVisibleCount: source?.visibleKnowledgePoints?.length ?? 0,
      sourceHiddenCount: source?.hiddenPendingCount ?? 0,
      sourceNotSelectableCount: source?.notSelectableCount ?? 0,
    };
  }, { sourceId: G6A_U04_P03F53_SOURCE_ID, kp: G6A_U04_P03F53_ROUNDING_KP_ID });

  const ui = report.ui;
  const pass = report.dependencyClosure.assets.length === ASSETS.length
    && ui.sourceId === G6A_U04_P03F53_SOURCE_ID
    && ui.selectionMode === "singleKnowledgePoint"
    && ui.questionMode === "numeric"
    && ui.questionCount === "24"
    && ui.kpExists
    && ui.kpSelected === "true"
    && ui.kpQuery.includes(G6A_U04_P03F53_ROUNDING_KP_ID)
    && ui.pgQuery.includes(G6A_U04_P03F53_ROUNDING_GROUP_ID)
    && ui.publicSourceCount === 34
    && ui.visibleKnowledgePointCount === 259
    && ui.sourceVisibleCount === 5
    && ui.sourceHiddenCount === 0
    && ui.sourceNotSelectableCount === 0
    && report.pageErrors.length === 0
    && report.serverErrors.length === 0;

  report.status = pass ? "PASS_P03F53_DEPLOYED_DEPENDENCY_AND_UI_PREFLIGHT" : "FAIL_P03F53_DEPLOYED_DEPENDENCY_AND_UI_PREFLIGHT";
  if (!pass) throw new Error(`P03F53_PREFLIGHT_UI:${JSON.stringify(report.ui)}`);
} catch (error) {
  report.status = "FAIL_P03F53_DEPLOYED_DEPENDENCY_AND_UI_PREFLIGHT";
  report.error = String(error.message ?? error);
  throw error;
} finally {
  if (browser) await browser.close();
  writeFileSync(resolve(OUT, "p03f-slice053-live-pages-preflight-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P03F53_LIVE_PREFLIGHT=${JSON.stringify(report)}`);
}
