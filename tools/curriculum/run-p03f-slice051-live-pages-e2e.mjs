import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  G6A_U04_P03F51_GROUP_ID,
  G6A_U04_P03F51_KP_ID,
  G6A_U04_P03F51_SOURCE_ID,
  G6A_U04_P03F51_SPEC_ID,
} from "../../site/modules/curriculum/registry/g6a-u04-rank11-decimal-divided-by-decimal-selector-projection-p03f51.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = new URL(process.env.P03F51_BASE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const OUT = resolve(ROOT, "tmp/p03f-slice051-live-pages-e2e");
mkdirSync(OUT, { recursive: true });

const EXACT_IMPLEMENTATION_HEAD_SHA = "c233cee8bebbaa10358e43411c623f0706741e0e";
const EXACT_IMPLEMENTATION_MERGE_SHA = "3828fc01f3633805548d74eb15825a3597855cd7";

const ASSETS = [
  ["site/modules/curriculum/registry/g6a-u04-rank11-decimal-divided-by-decimal-selector-projection-p03f51.js", "modules/curriculum/registry/g6a-u04-rank11-decimal-divided-by-decimal-selector-projection-p03f51.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p03f51.js", "modules/curriculum/public/public-ui-capability-binding-p03f51.js"],
  ["site/modules/curriculum/batch-a/g6a-u04-rank11-decimal-divided-by-decimal-runtime-p03f51.js", "modules/curriculum/batch-a/g6a-u04-rank11-decimal-divided-by-decimal-runtime-p03f51.js"],
  ["site/assets/browser/state/query-state.js", "assets/browser/state/query-state.js"],
  ["site/assets/browser/state/public-pattern-group-selection.js", "assets/browser/state/public-pattern-group-selection.js"],
  ["site/assets/browser/public-capability-ui.js", "assets/browser/public-capability-ui.js"],
  ["site/pixel/pixel-registry-bridge.js", "pixel/pixel-registry-bridge.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
];

const hash = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

function decimalFraction(text) {
  const normalized = String(text).trim();
  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [whole, fraction = ""] = unsigned.split(".");
  if (!/^\d+$/u.test(whole || "0") || !/^\d*$/u.test(fraction)) throw new Error(`P03F51_LIVE_DECIMAL_INVALID:${text}`);
  const denominator = 10n ** BigInt(fraction.length);
  const coefficient = BigInt(`${whole || "0"}${fraction}`) * (negative ? -1n : 1n);
  const divisor = gcd(coefficient, denominator);
  return { numerator: coefficient / divisor, denominator: denominator / divisor };
}

function exactDecimalDivision(dividend, divisor) {
  const a = decimalFraction(dividend);
  const b = decimalFraction(divisor);
  if (b.numerator === 0n) throw new Error("P03F51_LIVE_ZERO_DIVISOR");
  let numerator = a.numerator * b.denominator;
  let denominator = a.denominator * b.numerator;
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const common = gcd(numerator, denominator);
  numerator /= common;
  denominator /= common;
  let probe = denominator;
  let twos = 0;
  let fives = 0;
  while (probe % 2n === 0n) {
    probe /= 2n;
    twos += 1;
  }
  while (probe % 5n === 0n) {
    probe /= 5n;
    fives += 1;
  }
  if (probe !== 1n) throw new Error(`P03F51_LIVE_NON_TERMINATING:${dividend}/${divisor}`);
  const scale = Math.max(twos, fives);
  if (twos < scale) numerator *= 2n ** BigInt(scale - twos);
  if (fives < scale) numerator *= 5n ** BigInt(scale - fives);
  const negative = numerator < 0n;
  const absolute = negative ? -numerator : numerator;
  const digits = absolute.toString().padStart(scale + 1, "0");
  const raw = scale === 0 ? digits : `${digits.slice(0, -scale) || "0"}.${digits.slice(-scale)}`;
  const canonical = raw.replace(/\.0+$/u, "").replace(/(\.\d*?)0+$/u, "$1");
  return `${negative ? "-" : ""}${canonical}`;
}

function verifyQuestion(prompt, answer) {
  const match = String(prompt).trim().match(/^(\d+(?:\.\d+)?)\s*÷\s*(\d+(?:\.\d+)?)\s*=\s*？$/u);
  if (!match) return { ok: false, operandShapeOk: false, witness: false, expected: null, dividend: null, divisor: null };
  const [, dividend, divisor] = match;
  const expected = exactDecimalDivision(dividend, divisor);
  const actual = String(answer).trim();
  return {
    ok: actual === expected,
    operandShapeOk: dividend.includes(".") && divisor.includes(".") && Number(divisor) > 0,
    witness: dividend === "2.46" && divisor === "0.06" && actual === "41",
    expected,
    dividend,
    divisor,
  };
}

async function waitForExactDeployment() {
  const retries = Number(process.env.P03F51_DEPLOYMENT_RETRIES ?? 20);
  const delay = Number(process.env.P03F51_DEPLOYMENT_RETRY_DELAY_MS ?? 15000);
  let lastFailure = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const assets = [];
      for (const [repoPath, publicPath] of ASSETS) {
        const local = readFileSync(resolve(ROOT, repoPath), "utf8");
        const expectedSha256 = hash(local);
        const url = new URL(publicPath, BASE);
        url.searchParams.set("p03f51-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`P03F51_DEPLOYMENT_NOT_EXACT:${lastFailure?.message ?? "unknown"}`);
}

function caseUrl() {
  const url = new URL(BASE);
  for (const [key, value] of Object.entries({
    sourceId: G6A_U04_P03F51_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: "numeric",
    questionCount: "24",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: "source-witness-p03f51-product-acceptance",
    columns: "2",
    rowsPerPage: "4",
  })) url.searchParams.set(key, value);
  url.searchParams.append("kp", G6A_U04_P03F51_KP_ID);
  url.searchParams.append("pg", G6A_U04_P03F51_GROUP_ID);
  return url;
}

async function runCase(browser) {
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  const serverErrors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 500) serverErrors.push(`${response.status()}:${response.url()}`); });

  const response = await page.goto(caseUrl().href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P03F51_LIVE_PAGE:${response?.status() ?? "NO_RESPONSE"}`);

  await page.waitForFunction(({ sourceId, kp }) =>
    document.querySelector("#batch-a-source-select")?.value === sourceId
    && document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected === "true"
    && document.querySelector("#g5a-u08-question-mode")?.value === "numeric",
  { sourceId: G6A_U04_P03F51_SOURCE_ID, kp: G6A_U04_P03F51_KP_ID }, { timeout: 120000 });

  const ui = await page.evaluate(async ({ sourceId, kp, pg }) => {
    const params = new URL(location.href).searchParams;
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f51-e2e", String(Date.now()));
    const registry = (await import(registryUrl.href)).getCurrentPixelRegistrySnapshot();
    const source = registry.bySourceId[sourceId];
    return {
      sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
      selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
      ordering: document.querySelector("#batch-a-ordering-select")?.value ?? null,
      answerKey: Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),
      columns: document.querySelector("#columns-input")?.value ?? null,
      rowsPerPage: document.querySelector("#rows-per-page-input")?.value ?? null,
      kpSelected: document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected ?? null,
      publicControlsVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      kpQuery: params.getAll("kp"),
      pgQuery: params.getAll("pg"),
      publicSourceCount: registry.sourceCount,
      visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
      sourceVisibleCount: source?.visibleKnowledgePoints?.length ?? 0,
      sourceHiddenCount: source?.hiddenPendingCount ?? 0,
      sourceNotSelectableCount: source?.notSelectableCount ?? 0,
    };
  }, { sourceId: G6A_U04_P03F51_SOURCE_ID, kp: G6A_U04_P03F51_KP_ID, pg: G6A_U04_P03F51_GROUP_ID });

  const uiOk = ui.sourceId === G6A_U04_P03F51_SOURCE_ID
    && ui.selectionMode === "singleKnowledgePoint"
    && ui.questionMode === "numeric"
    && ui.questionCount === "24"
    && ui.ordering === "groupedByPattern"
    && ui.answerKey
    && ui.columns === "2"
    && ui.rowsPerPage === "4"
    && ui.kpSelected === "true"
    && ui.publicControlsVisible === "true"
    && ui.kpQuery.includes(G6A_U04_P03F51_KP_ID)
    && ui.pgQuery.includes(G6A_U04_P03F51_GROUP_ID)
    && ui.publicSourceCount === 34
    && ui.visibleKnowledgePointCount === 255
    && ui.sourceVisibleCount === 1
    && ui.sourceHiddenCount === 4
    && ui.sourceNotSelectableCount === 4;
  if (!uiOk) throw new Error(`P03F51_LIVE_UI:${JSON.stringify(ui)}`);

  await page.click("#regenerate-button");
  await page.waitForFunction(() => document.querySelector("#status-panel")?.dataset?.tone === "success", null, { timeout: 120000 });
  const generation = await page.evaluate(() => ({
    statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    previewLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if (!generation.statusText.includes("已產生 24 題") || generation.validationHasErrors !== "false" || !generation.validationText.includes("驗證通過") || generation.previewLength <= 0 || generation.printDisabled) {
    throw new Error(`P03F51_LIVE_GENERATION:${JSON.stringify(generation)}`);
  }

  const frame = await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if (!frame) throw new Error("P03F51_LIVE_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-cell--question", { timeout: 120000 });
  const rendered = await frame.evaluate(() => ({
    questions: [...document.querySelectorAll(".worksheet-cell--question")].map((node) => ({
      id: node.dataset.questionId ?? "",
      patternId: node.dataset.patternId ?? "",
      prompt: node.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? "",
    })),
    answers: [...document.querySelectorAll(".worksheet-cell--answer-key")].map((node) => ({
      id: node.dataset.questionId ?? "",
      patternId: node.dataset.patternId ?? "",
      answer: node.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? "",
    })),
    pages: [...document.querySelectorAll(".worksheet-page")].map((node) => ({
      overflowX: node.scrollWidth > node.clientWidth + 1,
      overflowY: node.scrollHeight > node.clientHeight + 1,
    })),
    bodyText: document.body.innerText,
  }));

  for (let index = 0; index < rendered.pages.length; index += 1) {
    await frame.locator(".worksheet-page").nth(index).screenshot({ path: resolve(OUT, `page-${String(index + 1).padStart(2, "0")}.png`) });
  }

  const answerById = new Map(rendered.answers.map((row) => [row.id, row]));
  const checks = rendered.questions.map((question) => ({
    ...question,
    answer: answerById.get(question.id)?.answer ?? "",
    ...verifyQuestion(question.prompt, answerById.get(question.id)?.answer ?? ""),
  }));

  await frame.evaluate(() => { window.__p03f51Print = 0; window.print = () => { window.__p03f51Print += 1; }; });
  await page.click("#print-button");
  await page.waitForTimeout(100);
  const printInvocationCount = await frame.evaluate(() => window.__p03f51Print ?? 0);
  await page.close();

  return {
    ui,
    questionCount: rendered.questions.length,
    answerCount: rendered.answers.length,
    pageCount: rendered.pages.length,
    sourceWitnessExpressionRendered: checks.some((row) => row.witness),
    sourceWitnessExactQuotient: checks.find((row) => row.witness)?.answer ?? null,
    exactAnswerMismatchCount: checks.filter((row) => !row.ok).length,
    decimalOperandShapeMismatchCount: checks.filter((row) => !row.operandShapeOk).length,
    unexpectedPatternCount: rendered.questions.filter((row) => row.patternId !== G6A_U04_P03F51_SPEC_ID).length + rendered.answers.filter((row) => row.patternId !== G6A_U04_P03F51_SPEC_ID).length,
    duplicatePromptCount: rendered.questions.length - new Set(rendered.questions.map((row) => row.prompt)).size,
    questionAnswerIdMismatchCount: rendered.questions.filter((row) => !answerById.has(row.id)).length,
    internalIdLeakageCount: (rendered.bodyText.match(/\b(?:kp_|pg_|ps_|P03F51_)/gu) ?? []).length,
    q052LeakageCount: (rendered.bodyText.match(/\bP03F52_/gu) ?? []).length,
    q053LeakageCount: (rendered.bodyText.match(/\bP03F53_/gu) ?? []).length,
    overflowFindingCount: rendered.pages.filter((row) => row.overflowX || row.overflowY).length,
    printInvocationCount,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    requestFailureCount: requestFailures.length,
    serverErrorCount: serverErrors.length,
    checks,
  };
}

let browser = null;
let report = null;
let failure = null;
try {
  const deployment = await waitForExactDeployment();
  browser = await chromium.launch({ headless: true });
  const result = await runCase(browser);
  report = {
    schemaName: "P03FSlice051LivePagesE2EReportV1",
    status: "PASS_P03F51_POSTMERGE_MAIN_PAGES_E2E",
    exactImplementationHeadSha: EXACT_IMPLEMENTATION_HEAD_SHA,
    exactImplementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA,
    deploymentAttempt: deployment.attempt,
    deployedAssetCount: deployment.assets.length,
    deployedAssetShaMismatchCount: deployment.assets.filter((row) => row.expectedSha256 !== row.liveSha256).length,
    publicSourceCount: result.ui.publicSourceCount,
    visibleKnowledgePointCount: result.ui.visibleKnowledgePointCount,
    sourceVisibleCount: result.ui.sourceVisibleCount,
    sourceHiddenCount: result.ui.sourceHiddenCount,
    sourceNotSelectableCount: result.ui.sourceNotSelectableCount,
    questionCount: result.questionCount,
    answerCount: result.answerCount,
    pageCount: result.pageCount,
    sourceWitnessExpressionRendered: result.sourceWitnessExpressionRendered,
    sourceWitnessExactQuotient: result.sourceWitnessExactQuotient,
    exactAnswerMismatchCount: result.exactAnswerMismatchCount,
    decimalOperandShapeMismatchCount: result.decimalOperandShapeMismatchCount,
    unexpectedPatternCount: result.unexpectedPatternCount,
    duplicatePromptCount: result.duplicatePromptCount,
    questionAnswerIdMismatchCount: result.questionAnswerIdMismatchCount,
    internalIdLeakageCount: result.internalIdLeakageCount,
    q052LeakageCount: result.q052LeakageCount,
    q053LeakageCount: result.q053LeakageCount,
    overflowFindingCount: result.overflowFindingCount,
    printInvocationCount: result.printInvocationCount,
    consoleErrorCount: result.consoleErrorCount,
    pageErrorCount: result.pageErrorCount,
    requestFailureCount: result.requestFailureCount,
    serverErrorCount: result.serverErrorCount,
    globalContextExpansion: false,
    slice052Expansion: false,
    slice053Expansion: false,
    parallelPipeline: false,
    assets: deployment.assets,
    result,
  };

  const pass = report.deployedAssetCount === 8
    && report.deployedAssetShaMismatchCount === 0
    && report.publicSourceCount === 34
    && report.visibleKnowledgePointCount === 255
    && report.sourceVisibleCount === 1
    && report.sourceHiddenCount === 4
    && report.sourceNotSelectableCount === 4
    && report.questionCount === 24
    && report.answerCount === 24
    && report.pageCount === 6
    && report.sourceWitnessExpressionRendered
    && report.sourceWitnessExactQuotient === "41"
    && report.exactAnswerMismatchCount === 0
    && report.decimalOperandShapeMismatchCount === 0
    && report.unexpectedPatternCount === 0
    && report.duplicatePromptCount === 0
    && report.questionAnswerIdMismatchCount === 0
    && report.internalIdLeakageCount === 0
    && report.q052LeakageCount === 0
    && report.q053LeakageCount === 0
    && report.overflowFindingCount === 0
    && report.printInvocationCount === 1
    && report.consoleErrorCount === 0
    && report.pageErrorCount === 0
    && report.requestFailureCount === 0
    && report.serverErrorCount === 0
    && !report.globalContextExpansion
    && !report.slice052Expansion
    && !report.slice053Expansion
    && !report.parallelPipeline;
  if (!pass) throw new Error(`P03F51_LIVE_ASSERT:${JSON.stringify(report)}`);
} catch (error) {
  failure = error;
  report = report
    ? { ...report, status: "FAIL_P03F51_POSTMERGE_MAIN_PAGES_E2E", error: String(error.message ?? error) }
    : { schemaName: "P03FSlice051LivePagesE2EReportV1", status: "FAIL_P03F51_POSTMERGE_MAIN_PAGES_E2E", error: String(error.message ?? error) };
} finally {
  if (browser) await browser.close();
  writeFileSync(resolve(OUT, "p03f-slice051-live-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`P03F51_LIVE_PAGES_E2E=${JSON.stringify(report)}`);
if (failure) throw failure;
