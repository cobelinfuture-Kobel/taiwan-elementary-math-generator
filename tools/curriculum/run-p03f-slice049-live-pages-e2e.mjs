import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = new URL(process.env.P03F49_BASE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const OUT = resolve(ROOT, "tmp/p03f-slice049-live-pages-e2e");
mkdirSync(OUT, { recursive: true });

const EXACT_IMPLEMENTATION_HEAD_SHA = "de61a7f4d1a16dd4f052534ebf96f1b0cfcd8fc1";
const EXACT_IMPLEMENTATION_MERGE_SHA = "67355e0ab7bb6e26611bb068cbf7b4e5d3d4d4fa";
const SOURCE_ID = "g5b_u04_5b04";
const APPLICATION_KP_ID = "kp_g5b_u04_decimal_multiplication_application";
const APPLICATION_GROUP_ID = "pg_g5b_u04_decimal_multiplication_application";
const APPLICATION_SPEC_ID = "ps_g5b_u04_decimal_multiplication_application_contextual";
const ESTIMATION_KP_ID = "kp_g5b_u04_decimal_multiplication_estimation";
const ESTIMATION_GROUP_ID = "pg_g5b_u04_decimal_multiplication_estimation";
const ESTIMATION_SPEC_ID = "ps_g5b_u04_decimal_multiplication_estimation_round_integer";

const assetContracts = [
  ["site/modules/curriculum/registry/g5b-u04-rank11-application-estimation-selector-projection-p03f49.js", "modules/curriculum/registry/g5b-u04-rank11-application-estimation-selector-projection-p03f49.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p03f49.js", "modules/curriculum/public/public-ui-capability-binding-p03f49.js"],
  ["site/modules/curriculum/batch-a/g5b-u04-rank11-application-estimation-runtime-p03f49.js", "modules/curriculum/batch-a/g5b-u04-rank11-application-estimation-runtime-p03f49.js"],
  ["site/assets/browser/state/query-state.js", "assets/browser/state/query-state.js"],
  ["site/assets/browser/state/public-pattern-group-selection.js", "assets/browser/state/public-pattern-group-selection.js"],
  ["site/assets/browser/public-capability-ui.js", "assets/browser/public-capability-ui.js"],
  ["site/pixel/pixel-registry-bridge.js", "pixel/pixel-registry-bridge.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
];

const CASES = Object.freeze([
  Object.freeze({
    id: "application",
    knowledgePointId: APPLICATION_KP_ID,
    patternGroupId: APPLICATION_GROUP_ID,
    patternSpecId: APPLICATION_SPEC_ID,
    questionMode: "application",
    seed: "p03f49-application-product-acceptance",
  }),
  Object.freeze({
    id: "estimation",
    knowledgePointId: ESTIMATION_KP_ID,
    patternGroupId: ESTIMATION_GROUP_ID,
    patternSpecId: ESTIMATION_SPEC_ID,
    questionMode: "numeric",
    seed: "p03f49-estimation-product-acceptance",
  }),
]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

function parseDecimal(token) {
  const text = String(token).trim();
  const match = text.match(/^(\d+)(?:\.(\d+))?$/u);
  if (!match) throw new Error(`P03F49_LIVE_DECIMAL_INVALID:${text}`);
  const fraction = match[2] ?? "";
  return { coefficient: BigInt(`${match[1]}${fraction}`), scale: fraction.length };
}

function canonicalDecimal(coefficient, scale) {
  const raw = coefficient.toString().padStart(scale + 1, "0");
  if (scale === 0) return raw;
  const whole = raw.slice(0, -scale) || "0";
  const fraction = raw.slice(-scale).replace(/0+$/u, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

function exactProduct(left, right) {
  const a = parseDecimal(left);
  const b = parseDecimal(right);
  return canonicalDecimal(a.coefficient * b.coefficient, a.scale + b.scale);
}

function roundHalfUpInteger(token) {
  const value = parseDecimal(token);
  if (value.scale === 0) return value.coefficient;
  const divisor = 10n ** BigInt(value.scale);
  const whole = value.coefficient / divisor;
  const remainder = value.coefficient % divisor;
  return whole + (remainder * 2n >= divisor ? 1n : 0n);
}

function verifyApplication(prompt, answer) {
  const match = String(prompt).match(/^每(.+?)\s+(\d+(?:\.\d+)?)\s+(.+?)，買\s+(\d+(?:\.\d+)?)\s+(.+?)，共多少(.+?)？$/u);
  if (!match) return { ok: false, dimensionOk: false, witness: false, expected: null };
  const [, unitA, unitPrice, priceUnit, quantity, unitB, totalUnit] = match;
  const expected = exactProduct(unitPrice, quantity);
  return {
    ok: String(answer).trim() === expected,
    dimensionOk: unitA === unitB && priceUnit === totalUnit,
    witness: unitPrice === "12.5" && quantity === "2.4" && expected === "30" && String(answer).trim() === "30",
    expected,
  };
}

function verifyEstimation(prompt, answer) {
  const numbers = String(prompt).match(/\d+(?:\.\d+)?/gu) ?? [];
  if (numbers.length < 4) return { ok: false, instructionOk: false, witness: false, expected: null };
  const [left, right, repeatedLeft, repeatedRight] = numbers;
  const instructionOk = String(prompt).includes("四捨五入到整數") && left === repeatedLeft && right === repeatedRight;
  const expected = (roundHalfUpInteger(left) * roundHalfUpInteger(right)).toString();
  return {
    ok: String(answer).trim() === expected,
    instructionOk,
    witness: left === "12.6" && right === "3.9" && expected === "52" && String(answer).trim() === "52",
    expected,
  };
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store", headers: { "cache-control": "no-cache" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}:${url.pathname}`);
  return response.text();
}

async function waitForExactDeployment() {
  const retries = Number(process.env.P03F49_DEPLOYMENT_RETRIES ?? 20);
  const delay = Number(process.env.P03F49_DEPLOYMENT_RETRY_DELAY_MS ?? 15000);
  let lastFailure = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const assets = [];
      for (const [repoPath, publicPath] of assetContracts) {
        const localText = readFileSync(resolve(ROOT, repoPath), "utf8");
        const expectedSha256 = sha256(localText);
        const url = new URL(publicPath, BASE);
        url.searchParams.set("p03f49-sha", expectedSha256.slice(0, 16));
        const liveText = await fetchText(url);
        const liveSha256 = sha256(liveText);
        if (liveSha256 !== expectedSha256) throw new Error(`SHA_MISMATCH:${publicPath}`);
        assets.push({ repoPath, publicPath, expectedSha256, liveSha256 });
      }
      return { attempt, assets };
    } catch (error) {
      lastFailure = error;
      if (attempt < retries) await sleep(delay);
    }
  }
  throw new Error(`P03F49_DEPLOYMENT_NOT_EXACT:${lastFailure?.message ?? "unknown"}`);
}

function buildCaseUrl(entry) {
  const url = new URL(BASE);
  for (const [key, value] of Object.entries({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: entry.questionMode,
    questionCount: "12",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: entry.seed,
    columns: "2",
    rowsPerPage: "4",
  })) url.searchParams.set(key, value);
  url.searchParams.append("kp", entry.knowledgePointId);
  url.searchParams.append("pg", entry.patternGroupId);
  return url;
}

async function runCase(browser, entry) {
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  const serverErrors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 500) serverErrors.push(`${response.status()}:${response.url()}`); });

  const url = buildCaseUrl(entry);
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P03F49_${entry.id.toUpperCase()}_PAGE:${response?.status() ?? "NO_RESPONSE"}`);
  await page.waitForFunction(
    ({ sourceId, knowledgePointId, questionMode }) => document.querySelector("#batch-a-source-select")?.value === sourceId
      && document.querySelector(`[data-knowledge-point-id="${knowledgePointId}"]`)?.dataset?.selected === "true"
      && document.querySelector("#g5a-u08-question-mode")?.value === questionMode,
    { sourceId: SOURCE_ID, knowledgePointId: entry.knowledgePointId, questionMode: entry.questionMode },
    { timeout: 120000 },
  );

  const ui = await page.evaluate(async ({ sourceId, knowledgePointId, patternGroupId }) => {
    const params = new URL(location.href).searchParams;
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f49-live-e2e", String(Date.now()));
    const registryModule = await import(registryUrl.href);
    const registry = registryModule.getCurrentPixelRegistrySnapshot();
    const source = registry.bySourceId[sourceId];
    return {
      sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
      selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
      kpSelected: document.querySelector(`[data-knowledge-point-id="${knowledgePointId}"]`)?.dataset?.selected ?? null,
      pgSelected: document.querySelector(`[data-pattern-group-id="${patternGroupId}"]`)?.dataset?.selected ?? null,
      publicControlsVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      kpQuery: params.getAll("kp"),
      pgQuery: params.getAll("pg"),
      publicSourceCount: registry.sourceCount,
      visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
      sourceVisibleCount: source?.visibleKnowledgePoints?.length ?? 0,
      sourceHiddenCount: source?.hiddenPendingCount ?? 0,
      sourceNotSelectableCount: source?.notSelectableCount ?? 0,
    };
  }, { sourceId: SOURCE_ID, knowledgePointId: entry.knowledgePointId, patternGroupId: entry.patternGroupId });

  const uiPass = ui.sourceId === SOURCE_ID
    && ui.selectionMode === "singleKnowledgePoint"
    && ui.questionMode === entry.questionMode
    && ui.questionCount === "12"
    && ui.kpSelected === "true"
    && ["true", null].includes(ui.pgSelected)
    && ui.publicControlsVisible === "true"
    && ui.kpQuery.includes(entry.knowledgePointId)
    && ui.pgQuery.includes(entry.patternGroupId)
    && ui.publicSourceCount === 33
    && ui.visibleKnowledgePointCount === 251
    && ui.sourceVisibleCount === 5
    && ui.sourceHiddenCount === 0
    && ui.sourceNotSelectableCount === 0;
  if (!uiPass) throw new Error(`P03F49_${entry.id.toUpperCase()}_UI:${JSON.stringify(ui)}`);

  await page.click("#regenerate-button");
  await page.waitForFunction(() => document.querySelector("#status-panel")?.dataset?.tone === "success", null, { timeout: 120000 });
  const generation = await page.evaluate(() => ({
    statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    previewSrcdocLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if (!generation.statusText.includes("已產生 12 題") || generation.validationHasErrors !== "false" || !generation.validationText.includes("驗證通過") || generation.previewSrcdocLength <= 0 || generation.printDisabled) {
    throw new Error(`P03F49_${entry.id.toUpperCase()}_GENERATION:${JSON.stringify(generation)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error(`P03F49_${entry.id.toUpperCase()}_FRAME_MISSING`);
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
    await frame.locator(".worksheet-page").nth(index).screenshot({ path: resolve(OUT, `${entry.id}-page-${String(index + 1).padStart(2, "0")}.png`) });
  }

  const answersById = new Map(rendered.answers.map((row) => [row.id, row]));
  const checks = rendered.questions.map((question) => {
    const answer = answersById.get(question.id)?.answer ?? "";
    const verification = entry.id === "application" ? verifyApplication(question.prompt, answer) : verifyEstimation(question.prompt, answer);
    return { id: question.id, prompt: question.prompt, answer, ...verification };
  });
  await frame.evaluate(() => { window.__p03f49PrintCount = 0; window.print = () => { window.__p03f49PrintCount += 1; }; });
  await page.click("#print-button");
  await page.waitForTimeout(100);
  const printInvocationCount = await frame.evaluate(() => window.__p03f49PrintCount ?? 0);
  await page.close();

  return {
    id: entry.id,
    ui,
    questionCount: rendered.questions.length,
    answerCount: rendered.answers.length,
    pageCount: rendered.pages.length,
    exactAnswerMismatchCount: checks.filter((row) => !row.ok).length,
    applicationDimensionMismatchCount: entry.id === "application" ? checks.filter((row) => !row.dimensionOk).length : 0,
    estimationInstructionMismatchCount: entry.id === "estimation" ? checks.filter((row) => !row.instructionOk).length : 0,
    witnessRendered: checks.some((row) => row.witness),
    unexpectedPatternCount: rendered.questions.filter((row) => row.patternId !== entry.patternSpecId).length + rendered.answers.filter((row) => row.patternId !== entry.patternSpecId).length,
    duplicatePromptCount: rendered.questions.length - new Set(rendered.questions.map((row) => row.prompt)).size,
    questionAnswerIdMismatchCount: rendered.questions.filter((row) => !answersById.has(row.id)).length,
    internalIdLeakageCount: (rendered.bodyText.match(/\b(?:kp_|pg_|ps_|P03F49_)/gu) ?? []).length,
    q050LeakageCount: (rendered.bodyText.match(/\b(?:P03F50_|p03f50-|kp_g6a_|pg_g6a_|ps_g6a_)/gu) ?? []).length,
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
  const cases = [];
  for (const entry of CASES) cases.push(await runCase(browser, entry));
  const application = cases.find((row) => row.id === "application");
  const estimation = cases.find((row) => row.id === "estimation");
  report = {
    schemaName: "P03FSlice049LivePagesE2EReportV1",
    status: "PASS_P03F49_POSTMERGE_MAIN_PAGES_E2E",
    exactImplementationHeadSha: EXACT_IMPLEMENTATION_HEAD_SHA,
    exactImplementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA,
    deploymentAttempt: deployment.attempt,
    deployedAssetCount: deployment.assets.length,
    deployedAssetShaMismatchCount: deployment.assets.filter((row) => row.expectedSha256 !== row.liveSha256).length,
    publicSourceCount: application.ui.publicSourceCount,
    visibleKnowledgePointCount: application.ui.visibleKnowledgePointCount,
    sourceVisibleCount: application.ui.sourceVisibleCount,
    sourceHiddenCount: application.ui.sourceHiddenCount,
    sourceNotSelectableCount: application.ui.sourceNotSelectableCount,
    applicationQuestionCount: application.questionCount,
    estimationQuestionCount: estimation.questionCount,
    totalQuestionCount: cases.reduce((sum, row) => sum + row.questionCount, 0),
    totalAnswerCount: cases.reduce((sum, row) => sum + row.answerCount, 0),
    totalPageCount: cases.reduce((sum, row) => sum + row.pageCount, 0),
    operatorApprovedApplicationWitnessRendered: application.witnessRendered,
    operatorApprovedEstimationWitnessRendered: estimation.witnessRendered,
    exactAnswerMismatchCount: cases.reduce((sum, row) => sum + row.exactAnswerMismatchCount, 0),
    applicationDimensionMismatchCount: application.applicationDimensionMismatchCount,
    estimationInstructionMismatchCount: estimation.estimationInstructionMismatchCount,
    unexpectedPatternCount: cases.reduce((sum, row) => sum + row.unexpectedPatternCount, 0),
    duplicatePromptCount: cases.reduce((sum, row) => sum + row.duplicatePromptCount, 0),
    questionAnswerIdMismatchCount: cases.reduce((sum, row) => sum + row.questionAnswerIdMismatchCount, 0),
    internalIdLeakageCount: cases.reduce((sum, row) => sum + row.internalIdLeakageCount, 0),
    q050LeakageCount: cases.reduce((sum, row) => sum + row.q050LeakageCount, 0),
    overflowFindingCount: cases.reduce((sum, row) => sum + row.overflowFindingCount, 0),
    printInvocationCount: cases.reduce((sum, row) => sum + row.printInvocationCount, 0),
    consoleErrorCount: cases.reduce((sum, row) => sum + row.consoleErrorCount, 0),
    pageErrorCount: cases.reduce((sum, row) => sum + row.pageErrorCount, 0),
    requestFailureCount: cases.reduce((sum, row) => sum + row.requestFailureCount, 0),
    serverErrorCount: cases.reduce((sum, row) => sum + row.serverErrorCount, 0),
    applicationExpansion: true,
    operatorApprovedApplication: true,
    operatorApprovedEstimation: true,
    directTextbookApplicationExampleClaimed: false,
    directTextbookEstimationMethodClaimed: false,
    globalContextExpansion: false,
    slice050Expansion: false,
    parallelPipeline: false,
    assets: deployment.assets,
    cases,
  };
  const pass = report.deployedAssetCount === 8
    && report.deployedAssetShaMismatchCount === 0
    && report.publicSourceCount === 33
    && report.visibleKnowledgePointCount === 251
    && report.sourceVisibleCount === 5
    && report.sourceHiddenCount === 0
    && report.sourceNotSelectableCount === 0
    && report.applicationQuestionCount === 12
    && report.estimationQuestionCount === 12
    && report.totalQuestionCount === 24
    && report.totalAnswerCount === 24
    && report.totalPageCount === 8
    && report.operatorApprovedApplicationWitnessRendered
    && report.operatorApprovedEstimationWitnessRendered
    && report.exactAnswerMismatchCount === 0
    && report.applicationDimensionMismatchCount === 0
    && report.estimationInstructionMismatchCount === 0
    && report.unexpectedPatternCount === 0
    && report.duplicatePromptCount === 0
    && report.questionAnswerIdMismatchCount === 0
    && report.internalIdLeakageCount === 0
    && report.q050LeakageCount === 0
    && report.overflowFindingCount === 0
    && report.printInvocationCount === 2
    && report.consoleErrorCount === 0
    && report.pageErrorCount === 0
    && report.requestFailureCount === 0
    && report.serverErrorCount === 0
    && report.applicationExpansion
    && report.operatorApprovedApplication
    && report.operatorApprovedEstimation
    && !report.directTextbookApplicationExampleClaimed
    && !report.directTextbookEstimationMethodClaimed
    && !report.globalContextExpansion
    && !report.slice050Expansion
    && !report.parallelPipeline;
  if (!pass) throw new Error(`P03F49_LIVE_ASSERT:${JSON.stringify(report)}`);
} catch (error) {
  failure = error;
  if (!report) report = { schemaName: "P03FSlice049LivePagesE2EReportV1", status: "FAIL_P03F49_POSTMERGE_MAIN_PAGES_E2E", error: String(error.message ?? error) };
  else {
    report.status = "FAIL_P03F49_POSTMERGE_MAIN_PAGES_E2E";
    report.error = String(error.message ?? error);
  }
} finally {
  if (browser) await browser.close();
  writeFileSync(resolve(OUT, "p03f-slice049-live-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`P03F49_LIVE_PAGES_E2E=${JSON.stringify(report)}`);
if (failure) throw failure;
