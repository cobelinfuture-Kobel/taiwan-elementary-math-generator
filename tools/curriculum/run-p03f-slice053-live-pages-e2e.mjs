import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  G6A_U04_P03F53_ROUNDING_GROUP_ID,
  G6A_U04_P03F53_ROUNDING_KP_ID,
  G6A_U04_P03F53_ROUNDING_SPEC_ID,
  G6A_U04_P03F53_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g6a-u04-rank13-rounding-selector-projection-p03f53.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = new URL(process.env.P03F53_BASE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const OUT = resolve(ROOT, "tmp/p03f-slice053-live-pages-e2e");
mkdirSync(OUT, { recursive: true });

const EXACT_IMPLEMENTATION_HEAD_SHA = "9f16ee474df95f357dde1f76daad64cdeffc627c";
const EXACT_IMPLEMENTATION_MERGE_SHA = "d0bb3b875fa7a6646588b68ef289268313e43cdc";
const ASSETS = [
  ["site/modules/curriculum/registry/g6a-u04-rank13-rounding-selector-projection-p03f53.js", "modules/curriculum/registry/g6a-u04-rank13-rounding-selector-projection-p03f53.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p03f53-extension.js", "modules/curriculum/registry/batch-a-selector-p03f53-extension.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p03f53.js", "modules/curriculum/public/public-ui-capability-binding-p03f53.js"],
  ["site/modules/curriculum/batch-a/g6a-u04-rank13-rounding-runtime-p03f53.js", "modules/curriculum/batch-a/g6a-u04-rank13-rounding-runtime-p03f53.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-generator-p03f53.js", "modules/curriculum/batch-a/batch-a-browser-generator-p03f53.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f53.js", "modules/curriculum/batch-a/batch-a-browser-question-router-p03f53.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-validator-p03f53.js", "modules/curriculum/batch-a/batch-a-browser-validator-p03f53.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f53-extension.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-p03f53-extension.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
  ["site/assets/browser/state/query-state.js", "assets/browser/state/query-state.js"],
  ["site/assets/browser/state/public-pattern-group-selection.js", "assets/browser/state/public-pattern-group-selection.js"],
  ["site/assets/browser/public-capability-ui.js", "assets/browser/public-capability-ui.js"],
  ["site/pixel/pixel-registry-bridge.js", "pixel/pixel-registry-bridge.js"],
];

const hash = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function waitForExactDeployment() {
  const retries = Number(process.env.P03F53_DEPLOYMENT_RETRIES ?? 20);
  const delay = Number(process.env.P03F53_DEPLOYMENT_RETRY_DELAY_MS ?? 15000);
  let lastFailure = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const assets = [];
      for (const [repoPath, publicPath] of ASSETS) {
        const expectedSha256 = hash(readFileSync(resolve(ROOT, repoPath), "utf8"));
        const url = new URL(publicPath, BASE);
        url.searchParams.set("p03f53-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`P03F53_DEPLOYMENT_NOT_EXACT:${lastFailure?.message ?? "unknown"}`);
}

function decimalFraction(text) {
  const [whole, fraction = ""] = String(text).split(".");
  return { numerator: BigInt(`${whole}${fraction}`), denominator: 10n ** BigInt(fraction.length) };
}
function expectedHalfUp(dividend, divisor, scale) {
  const a = decimalFraction(dividend), b = decimalFraction(divisor);
  const numerator = a.numerator * b.denominator;
  const denominator = a.denominator * b.numerator;
  const factor = 10n ** BigInt(scale);
  const scaled = numerator * factor;
  const kept = scaled / denominator;
  const remainder = scaled % denominator;
  const rounded = kept + (remainder !== 0n && remainder * 2n >= denominator ? 1n : 0n);
  const digits = rounded.toString();
  if (scale === 0) return digits;
  const padded = digits.padStart(scale + 1, "0");
  return `${padded.slice(0, -scale)}.${padded.slice(-scale)}`;
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
    generationSeed: "p03f53-live-rounding",
    columns: "2",
    rowsPerPage: "4",
  })) url.searchParams.set(key, value);
  url.searchParams.append("kp", G6A_U04_P03F53_ROUNDING_KP_ID);
  url.searchParams.append("pg", G6A_U04_P03F53_ROUNDING_GROUP_ID);
  return url;
}

const report = {
  schemaName: "P03FSlice053LiveMainPagesE2EReportV1",
  status: "PENDING",
  implementationHeadSha: EXACT_IMPLEMENTATION_HEAD_SHA,
  implementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA,
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
  if (!response?.ok()) throw new Error(`P03F53_LIVE_PAGE:${response?.status() ?? "NO_RESPONSE"}`);
  await page.waitForFunction(({ sourceId, kp }) => document.querySelector("#batch-a-source-select")?.value === sourceId && document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected === "true", { sourceId: G6A_U04_P03F53_SOURCE_ID, kp: G6A_U04_P03F53_ROUNDING_KP_ID }, { timeout: 120000 });

  const live = await page.evaluate(async ({ sourceId, kp, pg, spec }) => {
    const nonce = String(Date.now());
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f53-live", nonce);
    const registry = (await import(registryUrl.href)).getCurrentPixelRegistrySnapshot();
    const worksheetUrl = new URL("modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", location.href);
    worksheetUrl.searchParams.set("p03f53-live", nonce);
    const { buildBatchABrowserWorksheetDocument } = await import(worksheetUrl.href);
    const result = buildBatchABrowserWorksheetDocument({
      sourceId,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [kp],
      selectedPatternGroupIds: [pg],
      patternSpecIds: [spec],
      requestedQuestionType: "numeric",
      questionMode: "numeric",
      questionCount: 24,
      generationSeed: "p03f53-live-rounding",
      includeAnswerKey: true,
      ordering: "groupedByPattern",
      printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
    });
    if (!result.ok || !result.worksheetDocument) return { ok: false, errors: result.errors ?? [] };
    const document = result.worksheetDocument;
    const source = registry.bySourceId[sourceId];
    return {
      ok: true,
      ui: {
        sourceId: document.querySelector ? null : globalThis.document.querySelector("#batch-a-source-select")?.value ?? null,
        selectionMode: globalThis.document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
        questionMode: globalThis.document.querySelector("#g5a-u08-question-mode")?.value ?? null,
        publicSourceCount: registry.sourceCount,
        visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
        sourceVisibleCount: source?.visibleKnowledgePoints?.length ?? 0,
        sourceHiddenCount: source?.hiddenPendingCount ?? 0,
        sourceNotSelectableCount: source?.notSelectableCount ?? 0,
      },
      worksheet: {
        questionCount: document.generatedQuestions.length,
        answerCount: document.answerKeyItems.length,
        questionPageCount: document.questionPages.length,
        answerPageCount: document.answerKeyPages.length,
        metadata: document.metadata,
        questions: document.generatedQuestions.map((q) => ({
          id: q.id,
          sourceId: q.sourceId,
          knowledgePointId: q.knowledgePointId,
          patternSpecId: q.patternSpecId,
          patternGroupId: q.patternGroupId,
          decimalDividend: q.decimalDividend,
          decimalDivisor: q.decimalDivisor,
          requestedScale: q.requestedScale,
          requestedPlaceLabel: q.requestedPlaceLabel,
          roundingRelation: q.roundingRelation,
          roundingDirection: q.roundingDirection,
          approximationSymbol: q.approximationSymbol,
          blankedDisplayText: q.blankedDisplayText,
          promptText: q.promptText,
          answerText: q.answerText,
          finalAnswer: q.finalAnswer,
          globalContextProduction: q.globalContextProduction,
          metadata: q.metadata,
        })),
        answers: document.answerKeyItems.map((item) => ({ questionId: item.questionId, answerText: item.answerText })),
      },
    };
  }, { sourceId: G6A_U04_P03F53_SOURCE_ID, kp: G6A_U04_P03F53_ROUNDING_KP_ID, pg: G6A_U04_P03F53_ROUNDING_GROUP_ID, spec: G6A_U04_P03F53_ROUNDING_SPEC_ID });

  if (!live.ok) throw new Error(`P03F53_LIVE_WORKSHEET_FAILED:${JSON.stringify(live.errors)}`);
  report.ui = live.ui;
  report.worksheet = live.worksheet;
  const questions = live.worksheet.questions;
  const exactAnswerMismatchCount = questions.filter((q) => q.answerText !== expectedHalfUp(q.decimalDividend, q.decimalDivisor, q.requestedScale)).length;
  const crossLayerMismatchCount = questions.filter((q, index) => live.worksheet.answers[index]?.questionId !== q.id || live.worksheet.answers[index]?.answerText !== q.answerText).length;
  const requestedScales = [...new Set(questions.map((q) => q.requestedScale))].sort();
  const relationClasses = [...new Set(questions.map((q) => q.roundingRelation))].sort();
  const scopeLeakCount = questions.filter((q) => q.sourceId !== G6A_U04_P03F53_SOURCE_ID || q.knowledgePointId !== G6A_U04_P03F53_ROUNDING_KP_ID || q.patternSpecId !== G6A_U04_P03F53_ROUNDING_SPEC_ID || q.patternGroupId !== G6A_U04_P03F53_ROUNDING_GROUP_ID || q.globalContextProduction !== null || q.metadata?.operatorApprovedExtension !== false || q.metadata?.generatedExampleClaimedAsTextbook !== false || q.metadata?.floatingPointAuthorityUsed !== false || q.metadata?.slice053RoundingExpansion !== true || q.metadata?.globalContextExpansion !== false).length;
  const approximationMismatchCount = questions.filter((q) => q.approximationSymbol !== "≈" || !q.blankedDisplayText.includes("≈") || !q.promptText.includes("四捨五入") || !q.promptText.includes("概數") || q.finalAnswer?.exact !== false).length;
  const adapter = live.worksheet.metadata?.worksheetAdapter;
  Object.assign(report.worksheet, { exactAnswerMismatchCount, crossLayerMismatchCount, requestedScales, relationClasses, scopeLeakCount, approximationMismatchCount, duplicatePromptCount: questions.length - new Set(questions.map((q) => q.blankedDisplayText)).size });

  const pass = report.deployment.assets.length === ASSETS.length
    && report.ui.sourceId === G6A_U04_P03F53_SOURCE_ID
    && report.ui.selectionMode === "singleKnowledgePoint"
    && report.ui.questionMode === "numeric"
    && report.ui.publicSourceCount === 34
    && report.ui.visibleKnowledgePointCount === 259
    && report.ui.sourceVisibleCount === 5
    && report.ui.sourceHiddenCount === 0
    && report.ui.sourceNotSelectableCount === 0
    && report.worksheet.questionCount === 24
    && report.worksheet.answerCount === 24
    && report.worksheet.questionPageCount === 3
    && report.worksheet.answerPageCount === 3
    && JSON.stringify(requestedScales) === JSON.stringify([0, 1, 2])
    && JSON.stringify(relationClasses) === JSON.stringify(["EXACT_HALF", "GREATER_THAN_HALF", "LESS_THAN_HALF"])
    && exactAnswerMismatchCount === 0
    && crossLayerMismatchCount === 0
    && scopeLeakCount === 0
    && approximationMismatchCount === 0
    && report.worksheet.duplicatePromptCount === 0
    && adapter?.sharedExactRationalNormalizer === true
    && adapter?.sharedDecimalDivisionFamily === true
    && adapter?.sharedPagination === true
    && adapter?.sharedRenderer === true
    && adapter?.parallelPipeline === false
    && report.worksheet.metadata?.roundingExpansion === true
    && report.worksheet.metadata?.slice053Expansion === true
    && report.worksheet.metadata?.globalContextExpansion !== true
    && report.pageErrors.length === 0
    && report.serverErrors.length === 0;
  report.status = pass ? "PASS_P03F53_DEPLOYED_MAIN_PAGES_E2E" : "FAIL_P03F53_DEPLOYED_MAIN_PAGES_E2E";
  if (!pass) throw new Error(`P03F53_LIVE_ASSERTION_FAILED:${JSON.stringify(report)}`);
} catch (error) {
  report.status = "FAIL_P03F53_DEPLOYED_MAIN_PAGES_E2E";
  report.error = String(error.message ?? error);
  throw error;
} finally {
  if (browser) await browser.close();
  writeFileSync(resolve(OUT, "p03f-slice053-live-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P03F53_LIVE_PAGES_E2E=${JSON.stringify(report)}`);
}
