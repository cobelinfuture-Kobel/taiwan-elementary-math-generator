import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  G3A_U04_P04F1_GROUP_ID,
  G3A_U04_P04F1_KP_ID,
  G3A_U04_P04F1_SOURCE_ID,
  G3A_U04_P04F1_SPEC_ID,
} from "../../site/modules/curriculum/registry/g3a-u04-ruler-reading-selector-projection-p04f1.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = new URL(process.env.P04F1_BASE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const OUT = resolve(ROOT, "tmp/p04f-slice001-live-pages-e2e");
mkdirSync(OUT, { recursive: true });

const IMPLEMENTATION_ACCEPTANCE_HEAD_SHA = "dc09a21fb45d61b0bff0fc86bd92b747cff62e68";
const IMPLEMENTATION_MERGE_SHA = "8624658caac0bc3c61274083250642563635a67e";
const ASSETS = [
  ["site/assets/browser/public-capability-ui.js", "assets/browser/public-capability-ui.js"],
  ["site/assets/browser/state/public-pattern-group-selection.js", "assets/browser/state/public-pattern-group-selection.js"],
  ["site/assets/browser/state/query-state.js", "assets/browser/state/query-state.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-generator-p04f1.js", "modules/curriculum/batch-a/batch-a-browser-generator-p04f1.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-question-router-p04f1.js", "modules/curriculum/batch-a/batch-a-browser-question-router-p04f1.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-validator-p04f1.js", "modules/curriculum/batch-a/batch-a-browser-validator-p04f1.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-p04f1-extension.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-p04f1-extension.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
  ["site/modules/curriculum/batch-a/quantity-measurement-runtime-p04f1.js", "modules/curriculum/batch-a/quantity-measurement-runtime-p04f1.js"],
  ["site/modules/curriculum/batch-a/source-pattern-full-product-p04f1-extension.js", "modules/curriculum/batch-a/source-pattern-full-product-p04f1-extension.js"],
  ["site/modules/curriculum/batch-a/source-units-p04f1-extension.js", "modules/curriculum/batch-a/source-units-p04f1-extension.js"],
  ["site/modules/curriculum/batch-a/source-units.js", "modules/curriculum/batch-a/source-units.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p04f1.js", "modules/curriculum/public/public-ui-capability-binding-p04f1.js"],
  ["site/modules/curriculum/registry/batch-a-selector-extension.js", "modules/curriculum/registry/batch-a-selector-extension.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p04f1-extension.js", "modules/curriculum/registry/batch-a-selector-p04f1-extension.js"],
  ["site/modules/curriculum/registry/g3a-u04-ruler-reading-selector-projection-p04f1.js", "modules/curriculum/registry/g3a-u04-ruler-reading-selector-projection-p04f1.js"],
  ["site/modules/renderer/html-renderer.js", "modules/renderer/html-renderer.js"],
  ["site/modules/renderer/measurement-ruler.js", "modules/renderer/measurement-ruler.js"],
  ["site/pixel/pixel-public-capability-ui.js", "pixel/pixel-public-capability-ui.js"],
  ["site/pixel/pixel-registry-bridge.js", "pixel/pixel-registry-bridge.js"],
];

const hash = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function waitForExactDeployment() {
  const retries = Number(process.env.P04F1_DEPLOYMENT_RETRIES ?? 20);
  const delay = Number(process.env.P04F1_DEPLOYMENT_RETRY_DELAY_MS ?? 15000);
  let lastFailure = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const assets = [];
      for (const [repoPath, publicPath] of ASSETS) {
        const expectedSha256 = hash(readFileSync(resolve(ROOT, repoPath), "utf8"));
        const url = new URL(publicPath, BASE);
        url.searchParams.set("p04f1-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`P04F1_DEPLOYMENT_NOT_EXACT:${lastFailure?.message ?? "unknown"}`);
}

function caseUrl() {
  const url = new URL(BASE);
  for (const [key, value] of Object.entries({
    sourceId: G3A_U04_P04F1_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: "numeric",
    questionCount: "8",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: "p04f1-live-ruler",
    columns: "2",
    rowsPerPage: "4",
  })) url.searchParams.set(key, value);
  url.searchParams.append("kp", G3A_U04_P04F1_KP_ID);
  url.searchParams.append("pg", G3A_U04_P04F1_GROUP_ID);
  return url;
}

const report = {
  schemaName: "P04FSlice001LiveMainPagesE2EReportV1",
  status: "PENDING",
  implementationAcceptanceHeadSha: IMPLEMENTATION_ACCEPTANCE_HEAD_SHA,
  implementationMergeSha: IMPLEMENTATION_MERGE_SHA,
  deployment: null,
  ui: null,
  worksheet: null,
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
  serverErrors: [],
};

let browser = null;
try {
  report.deployment = await waitForExactDeployment();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("console", (message) => { if (message.type() === "error") report.consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
  page.on("requestfailed", (request) => report.requestFailures.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 500) report.serverErrors.push(`${response.status()}:${response.url()}`); });

  const response = await page.goto(caseUrl().href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P04F1_LIVE_PAGE:${response?.status() ?? "NO_RESPONSE"}`);
  await page.waitForFunction(
    ({ sourceId, kp }) => document.querySelector("#batch-a-source-select")?.value === sourceId
      && document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected === "true",
    { sourceId: G3A_U04_P04F1_SOURCE_ID, kp: G3A_U04_P04F1_KP_ID },
    { timeout: 120000 },
  );

  const live = await page.evaluate(async ({ sourceId, kp, pg, spec }) => {
    const nonce = String(Date.now());
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p04f1-live", nonce);
    const registry = (await import(registryUrl.href)).getCurrentPixelRegistrySnapshot();
    const worksheetUrl = new URL("modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", location.href);
    worksheetUrl.searchParams.set("p04f1-live", nonce);
    const { buildBatchABrowserWorksheetDocument } = await import(worksheetUrl.href);
    const result = buildBatchABrowserWorksheetDocument({
      sourceId,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [kp],
      selectedPatternGroupIds: [pg],
      patternSpecIds: [spec],
      requestedQuestionType: "numeric",
      questionMode: "numeric",
      questionCount: 8,
      generationSeed: "p04f1-live-ruler",
      includeAnswerKey: true,
      ordering: "groupedByPattern",
      printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
    });
    if (!result.ok || !result.worksheetDocument) return { ok: false, errors: result.errors ?? [] };
    const worksheetDoc = result.worksheetDocument;
    const source = registry.bySourceId[sourceId];
    const params = new URL(location.href).searchParams;
    return {
      ok: true,
      ui: {
        sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
        selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
        questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
        questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
        kpSelected: document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected ?? null,
        kpQuery: params.getAll("kp"),
        pgQuery: params.getAll("pg"),
        publicSourceCount: registry.sourceCount,
        visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
        sourceVisibleCount: source?.visibleKnowledgePoints?.length ?? 0,
        sourceHiddenCount: source?.hiddenPendingCount ?? 0,
        sourceNotSelectableCount: source?.notSelectableCount ?? 0,
      },
      worksheet: {
        questionCount: worksheetDoc.generatedQuestions.length,
        answerCount: worksheetDoc.answerKeyItems.length,
        questionPageCount: worksheetDoc.questionPages.length,
        answerPageCount: worksheetDoc.answerKeyPages.length,
        metadata: worksheetDoc.metadata,
        questions: worksheetDoc.generatedQuestions.map((q) => ({
          id: q.id,
          sourceId: q.sourceId,
          knowledgePointId: q.knowledgePointId,
          patternGroupId: q.patternGroupId,
          patternSpecId: q.patternSpecId,
          answer: q.answer,
          answerText: q.answerText,
          blankedDisplayText: q.blankedDisplayText,
          numberLine: q.numberLine,
          metadata: q.metadata,
        })),
        answers: worksheetDoc.answerKeyItems.map((item) => ({ questionId: item.questionId, answerText: item.answerText })),
      },
    };
  }, { sourceId: G3A_U04_P04F1_SOURCE_ID, kp: G3A_U04_P04F1_KP_ID, pg: G3A_U04_P04F1_GROUP_ID, spec: G3A_U04_P04F1_SPEC_ID });

  if (!live.ok) throw new Error(`P04F1_LIVE_WORKSHEET_FAILED:${JSON.stringify(live.errors)}`);
  report.ui = live.ui;
  report.worksheet = live.worksheet;

  const questions = live.worksheet.questions;
  const exactAnswerMismatchCount = questions.filter((q) => q.answer !== q.metadata?.targetMillimeters
    || q.answerText !== `${q.metadata?.targetMillimeters} 毫米`
    || q.numberLine?.endpointMillimeters !== q.metadata?.targetMillimeters).length;
  const tenSubdivisionMismatchCount = questions.filter((q) => q.numberLine?.millimetersPerCentimeter !== 10
    || q.numberLine?.tickCount !== 51
    || q.numberLine?.ticks?.length !== 51).length;
  const crossLayerMismatchCount = questions.filter((q, index) => live.worksheet.answers[index]?.questionId !== q.id
    || live.worksheet.answers[index]?.answerText !== q.answerText).length;
  const visualIdentityDuplicateCount = questions.length - new Set(questions.map((q) => `${q.blankedDisplayText}|${q.numberLine?.endpointMillimeters}`)).size;
  const scopeLeakCount = questions.filter((q) => q.sourceId !== G3A_U04_P04F1_SOURCE_ID
    || q.knowledgePointId !== G3A_U04_P04F1_KP_ID
    || q.patternGroupId !== G3A_U04_P04F1_GROUP_ID
    || q.patternSpecId !== G3A_U04_P04F1_SPEC_ID
    || q.metadata?.standaloneConversionQuestion !== false
    || q.metadata?.mixedUnitComparison !== false
    || q.metadata?.mixedUnitArithmetic !== false).length;
  const adapter = live.worksheet.metadata?.worksheetAdapter
    ?? live.worksheet.metadata?.p04f1WorksheetAdapter;

  Object.assign(report.worksheet, {
    exactAnswerMismatchCount,
    tenSubdivisionMismatchCount,
    crossLayerMismatchCount,
    visualIdentityDuplicateCount,
    scopeLeakCount,
    distinctEndpointCount: new Set(questions.map((q) => q.metadata?.targetMillimeters)).size,
  });

  const pass = report.deployment.assets.length === ASSETS.length
    && report.ui.sourceId === G3A_U04_P04F1_SOURCE_ID
    && report.ui.selectionMode === "singleKnowledgePoint"
    && report.ui.questionMode === "numeric"
    && report.ui.questionCount === "8"
    && report.ui.kpSelected === "true"
    && report.ui.kpQuery.includes(G3A_U04_P04F1_KP_ID)
    && report.ui.pgQuery.includes(G3A_U04_P04F1_GROUP_ID)
    && report.ui.publicSourceCount === 35
    && report.ui.visibleKnowledgePointCount === 260
    && report.ui.sourceVisibleCount === 1
    && report.ui.sourceHiddenCount === 0
    && report.ui.sourceNotSelectableCount === 0
    && report.worksheet.questionCount === 8
    && report.worksheet.answerCount === 8
    && report.worksheet.questionPageCount === 1
    && report.worksheet.answerPageCount === 1
    && report.worksheet.distinctEndpointCount === 8
    && exactAnswerMismatchCount === 0
    && tenSubdivisionMismatchCount === 0
    && crossLayerMismatchCount === 0
    && visualIdentityDuplicateCount === 0
    && scopeLeakCount === 0
    && adapter?.sharedQuantityMeasurementRuntime === true
    && adapter?.sharedScaleRepresentation === true
    && adapter?.sharedPagination === true
    && adapter?.sharedRenderer === true
    && adapter?.parallelPipeline === false
    && report.consoleErrors.length === 0
    && report.pageErrors.length === 0
    && report.requestFailures.length === 0
    && report.serverErrors.length === 0;

  report.status = pass ? "PASS_P04F1_DEPLOYED_MAIN_PAGES_E2E" : "FAIL_P04F1_DEPLOYED_MAIN_PAGES_E2E";
  if (!pass) throw new Error(`P04F1_LIVE_ASSERTION_FAILED:${JSON.stringify(report)}`);
} catch (error) {
  report.status = "FAIL_P04F1_DEPLOYED_MAIN_PAGES_E2E";
  report.error = String(error.message ?? error);
  throw error;
} finally {
  if (browser) await browser.close();
  writeFileSync(resolve(OUT, "p04f-slice001-live-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P04F1_LIVE_E2E=${JSON.stringify(report)}`);
}
