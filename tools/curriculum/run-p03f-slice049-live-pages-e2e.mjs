import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  G5B_U04_P03F49_APPLICATION_GROUP_ID,
  G5B_U04_P03F49_APPLICATION_KP_ID,
  G5B_U04_P03F49_APPLICATION_SPEC_ID,
  G5B_U04_P03F49_ESTIMATION_GROUP_ID,
  G5B_U04_P03F49_ESTIMATION_KP_ID,
  G5B_U04_P03F49_ESTIMATION_SPEC_ID,
  G5B_U04_P03F49_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5b-u04-rank11-application-estimation-selector-projection-p03f49.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = new URL(process.env.P03F49_BASE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const OUT = resolve(ROOT, "tmp/p03f-slice049-live-pages-e2e");
mkdirSync(OUT, { recursive: true });
const EXACT_IMPLEMENTATION_HEAD_SHA = "de61a7f4d1a16dd4f052534ebf96f1b0cfcd8fc1";
const EXACT_IMPLEMENTATION_MERGE_SHA = "67355e0ab7bb6e26611bb068cbf7b4e5d3d4d4fa";

const ASSETS = [
  ["site/modules/curriculum/registry/g5b-u04-rank11-application-estimation-selector-projection-p03f49.js", "modules/curriculum/registry/g5b-u04-rank11-application-estimation-selector-projection-p03f49.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p03f49.js", "modules/curriculum/public/public-ui-capability-binding-p03f49.js"],
  ["site/modules/curriculum/batch-a/g5b-u04-rank11-application-estimation-runtime-p03f49.js", "modules/curriculum/batch-a/g5b-u04-rank11-application-estimation-runtime-p03f49.js"],
  ["site/assets/browser/state/query-state.js", "assets/browser/state/query-state.js"],
  ["site/assets/browser/state/public-pattern-group-selection.js", "assets/browser/state/public-pattern-group-selection.js"],
  ["site/assets/browser/public-capability-ui.js", "assets/browser/public-capability-ui.js"],
  ["site/pixel/pixel-registry-bridge.js", "pixel/pixel-registry-bridge.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
];
const CASES = [
  { id: "application", kp: G5B_U04_P03F49_APPLICATION_KP_ID, pg: G5B_U04_P03F49_APPLICATION_GROUP_ID, ps: G5B_U04_P03F49_APPLICATION_SPEC_ID, mode: "application", seed: "p03f49-application-product-acceptance" },
  { id: "estimation", kp: G5B_U04_P03F49_ESTIMATION_KP_ID, pg: G5B_U04_P03F49_ESTIMATION_GROUP_ID, ps: G5B_U04_P03F49_ESTIMATION_SPEC_ID, mode: "numeric", seed: "p03f49-estimation-product-acceptance" },
];
const hash = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

function parseDecimal(token) {
  const match = String(token).trim().match(/^(\d+)(?:\.(\d+))?$/u);
  if (!match) throw new Error(`P03F49_LIVE_DECIMAL_INVALID:${token}`);
  const fraction = match[2] ?? "";
  return { coefficient: BigInt(`${match[1]}${fraction}`), scale: fraction.length };
}
function canonicalDecimal(coefficient, scale) {
  const raw = coefficient.toString().padStart(scale + 1, "0");
  if (!scale) return raw;
  const fraction = raw.slice(-scale).replace(/0+$/u, "");
  return fraction ? `${raw.slice(0, -scale) || "0"}.${fraction}` : raw.slice(0, -scale) || "0";
}
function exactProduct(left, right) {
  const a = parseDecimal(left), b = parseDecimal(right);
  return canonicalDecimal(a.coefficient * b.coefficient, a.scale + b.scale);
}
function roundHalfUpInteger(token) {
  const value = parseDecimal(token);
  if (!value.scale) return value.coefficient;
  const divisor = 10n ** BigInt(value.scale), whole = value.coefficient / divisor, remainder = value.coefficient % divisor;
  return whole + (remainder * 2n >= divisor ? 1n : 0n);
}
function verifyApplication(prompt, answer) {
  const match = String(prompt).match(/^每(.+?)\s+(\d+(?:\.\d+)?)\s+(.+?)，買\s+(\d+(?:\.\d+)?)\s+(.+?)，共多少(.+?)？$/u);
  if (!match) return { ok: false, dimensionOk: false, witness: false, expected: null };
  const [, unitA, price, priceUnit, quantity, unitB, totalUnit] = match;
  const expected = exactProduct(price, quantity), actual = String(answer).trim();
  return { ok: actual === expected, dimensionOk: unitA === unitB && priceUnit === totalUnit, witness: price === "12.5" && quantity === "2.4" && actual === "30", expected };
}
function verifyEstimation(prompt, answer) {
  const values = String(prompt).match(/\d+(?:\.\d+)?/gu) ?? [];
  if (values.length < 4) return { ok: false, instructionOk: false, witness: false, expected: null };
  const [left, right, leftAgain, rightAgain] = values;
  const expected = (roundHalfUpInteger(left) * roundHalfUpInteger(right)).toString(), actual = String(answer).trim();
  return { ok: actual === expected, instructionOk: String(prompt).includes("四捨五入到整數") && left === leftAgain && right === rightAgain, witness: left === "12.6" && right === "3.9" && actual === "52", expected };
}

async function waitForExactDeployment() {
  const retries = Number(process.env.P03F49_DEPLOYMENT_RETRIES ?? 20), delay = Number(process.env.P03F49_DEPLOYMENT_RETRY_DELAY_MS ?? 15000);
  let lastFailure = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const assets = [];
      for (const [repoPath, publicPath] of ASSETS) {
        const local = readFileSync(resolve(ROOT, repoPath), "utf8"), expectedSha256 = hash(local), url = new URL(publicPath, BASE);
        url.searchParams.set("p03f49-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`P03F49_DEPLOYMENT_NOT_EXACT:${lastFailure?.message ?? "unknown"}`);
}
function caseUrl(entry) {
  const url = new URL(BASE);
  for (const [key, value] of Object.entries({ sourceId: G5B_U04_P03F49_SOURCE_ID, selectionMode: "singleKnowledgePoint", questionMode: entry.mode, questionCount: "12", ordering: "groupedByPattern", answerKey: "1", generationSeed: entry.seed, columns: "2", rowsPerPage: "4" })) url.searchParams.set(key, value);
  url.searchParams.append("kp", entry.kp); url.searchParams.append("pg", entry.pg);
  return url;
}

async function runCase(browser, entry) {
  const consoleErrors = [], pageErrors = [], requestFailures = [], serverErrors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 500) serverErrors.push(`${response.status()}:${response.url()}`); });
  const response = await page.goto(caseUrl(entry).href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P03F49_${entry.id.toUpperCase()}_PAGE:${response?.status() ?? "NO_RESPONSE"}`);
  await page.waitForFunction(({ sourceId, kp, mode }) => document.querySelector("#batch-a-source-select")?.value === sourceId && document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected === "true" && document.querySelector("#g5a-u08-question-mode")?.value === mode, { sourceId: G5B_U04_P03F49_SOURCE_ID, kp: entry.kp, mode: entry.mode }, { timeout: 120000 });
  const ui = await page.evaluate(async ({ sourceId, kp, pg }) => {
    const params = new URL(location.href).searchParams, registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f49-e2e", String(Date.now()));
    const registry = (await import(registryUrl.href)).getCurrentPixelRegistrySnapshot(), source = registry.bySourceId[sourceId];
    return { sourceId: document.querySelector("#batch-a-source-select")?.value ?? null, selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null, questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null, questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null, kpSelected: document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected ?? null, publicControlsVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null, kpQuery: params.getAll("kp"), pgQuery: params.getAll("pg"), publicSourceCount: registry.sourceCount, visibleKnowledgePointCount: registry.visibleKnowledgePointCount, sourceVisibleCount: source?.visibleKnowledgePoints?.length ?? 0, sourceHiddenCount: source?.hiddenPendingCount ?? 0, sourceNotSelectableCount: source?.notSelectableCount ?? 0 };
  }, { sourceId: G5B_U04_P03F49_SOURCE_ID, kp: entry.kp, pg: entry.pg });
  if (!(ui.sourceId === G5B_U04_P03F49_SOURCE_ID && ui.selectionMode === "singleKnowledgePoint" && ui.questionMode === entry.mode && ui.questionCount === "12" && ui.kpSelected === "true" && ui.publicControlsVisible === "true" && ui.kpQuery.includes(entry.kp) && ui.pgQuery.includes(entry.pg) && ui.publicSourceCount === 33 && ui.visibleKnowledgePointCount === 251 && ui.sourceVisibleCount === 5 && ui.sourceHiddenCount === 0 && ui.sourceNotSelectableCount === 0)) throw new Error(`P03F49_${entry.id.toUpperCase()}_UI:${JSON.stringify(ui)}`);
  await page.click("#regenerate-button");
  await page.waitForFunction(() => document.querySelector("#status-panel")?.dataset?.tone === "success", null, { timeout: 120000 });
  const generation = await page.evaluate(() => ({ statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? "", validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? "", validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null, previewLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0, printDisabled: Boolean(document.querySelector("#print-button")?.disabled) }));
  if (!generation.statusText.includes("已產生 12 題") || generation.validationHasErrors !== "false" || !generation.validationText.includes("驗證通過") || generation.previewLength <= 0 || generation.printDisabled) throw new Error(`P03F49_${entry.id.toUpperCase()}_GENERATION:${JSON.stringify(generation)}`);
  const frame = await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if (!frame) throw new Error(`P03F49_${entry.id.toUpperCase()}_FRAME_MISSING`);
  await frame.waitForSelector(".worksheet-cell--question", { timeout: 120000 });
  const rendered = await frame.evaluate(() => ({ questions: [...document.querySelectorAll(".worksheet-cell--question")].map((node) => ({ id: node.dataset.questionId ?? "", patternId: node.dataset.patternId ?? "", prompt: node.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? "" })), answers: [...document.querySelectorAll(".worksheet-cell--answer-key")].map((node) => ({ id: node.dataset.questionId ?? "", patternId: node.dataset.patternId ?? "", answer: node.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? "" })), pages: [...document.querySelectorAll(".worksheet-page")].map((node) => ({ overflowX: node.scrollWidth > node.clientWidth + 1, overflowY: node.scrollHeight > node.clientHeight + 1 })), bodyText: document.body.innerText }));
  for (let index = 0; index < rendered.pages.length; index += 1) await frame.locator(".worksheet-page").nth(index).screenshot({ path: resolve(OUT, `${entry.id}-page-${String(index + 1).padStart(2, "0")}.png`) });
  const answerById = new Map(rendered.answers.map((row) => [row.id, row])), checks = rendered.questions.map((question) => ({ ...question, answer: answerById.get(question.id)?.answer ?? "", ...(entry.id === "application" ? verifyApplication(question.prompt, answerById.get(question.id)?.answer ?? "") : verifyEstimation(question.prompt, answerById.get(question.id)?.answer ?? "")) }));
  await frame.evaluate(() => { window.__p03f49Print = 0; window.print = () => { window.__p03f49Print += 1; }; }); await page.click("#print-button"); await page.waitForTimeout(100);
  const printInvocationCount = await frame.evaluate(() => window.__p03f49Print ?? 0); await page.close();
  return { id: entry.id, ui, questionCount: rendered.questions.length, answerCount: rendered.answers.length, pageCount: rendered.pages.length, exactAnswerMismatchCount: checks.filter((row) => !row.ok).length, applicationDimensionMismatchCount: entry.id === "application" ? checks.filter((row) => !row.dimensionOk).length : 0, estimationInstructionMismatchCount: entry.id === "estimation" ? checks.filter((row) => !row.instructionOk).length : 0, witnessRendered: checks.some((row) => row.witness), unexpectedPatternCount: rendered.questions.filter((row) => row.patternId !== entry.ps).length + rendered.answers.filter((row) => row.patternId !== entry.ps).length, duplicatePromptCount: rendered.questions.length - new Set(rendered.questions.map((row) => row.prompt)).size, questionAnswerIdMismatchCount: rendered.questions.filter((row) => !answerById.has(row.id)).length, internalIdLeakageCount: (rendered.bodyText.match(/\b(?:kp_|pg_|ps_|P03F49_)/gu) ?? []).length, q050LeakageCount: (rendered.bodyText.match(/\bP03F50_/gu) ?? []).length, overflowFindingCount: rendered.pages.filter((row) => row.overflowX || row.overflowY).length, printInvocationCount, consoleErrorCount: consoleErrors.length, pageErrorCount: pageErrors.length, requestFailureCount: requestFailures.length, serverErrorCount: serverErrors.length, checks };
}

let browser = null, report = null, failure = null;
try {
  const deployment = await waitForExactDeployment(); browser = await chromium.launch({ headless: true });
  const cases = []; for (const entry of CASES) cases.push(await runCase(browser, entry));
  const application = cases[0], estimation = cases[1];
  report = { schemaName: "P03FSlice049LivePagesE2EReportV1", status: "PASS_P03F49_POSTMERGE_MAIN_PAGES_E2E", exactImplementationHeadSha: EXACT_IMPLEMENTATION_HEAD_SHA, exactImplementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA, deploymentAttempt: deployment.attempt, deployedAssetCount: deployment.assets.length, deployedAssetShaMismatchCount: deployment.assets.filter((row) => row.expectedSha256 !== row.liveSha256).length, publicSourceCount: application.ui.publicSourceCount, visibleKnowledgePointCount: application.ui.visibleKnowledgePointCount, sourceVisibleCount: application.ui.sourceVisibleCount, sourceHiddenCount: application.ui.sourceHiddenCount, sourceNotSelectableCount: application.ui.sourceNotSelectableCount, applicationQuestionCount: application.questionCount, estimationQuestionCount: estimation.questionCount, totalQuestionCount: cases.reduce((sum, row) => sum + row.questionCount, 0), totalAnswerCount: cases.reduce((sum, row) => sum + row.answerCount, 0), totalPageCount: cases.reduce((sum, row) => sum + row.pageCount, 0), operatorApprovedApplicationWitnessRendered: application.witnessRendered, operatorApprovedEstimationWitnessRendered: estimation.witnessRendered, exactAnswerMismatchCount: cases.reduce((sum, row) => sum + row.exactAnswerMismatchCount, 0), applicationDimensionMismatchCount: application.applicationDimensionMismatchCount, estimationInstructionMismatchCount: estimation.estimationInstructionMismatchCount, unexpectedPatternCount: cases.reduce((sum, row) => sum + row.unexpectedPatternCount, 0), duplicatePromptCount: cases.reduce((sum, row) => sum + row.duplicatePromptCount, 0), questionAnswerIdMismatchCount: cases.reduce((sum, row) => sum + row.questionAnswerIdMismatchCount, 0), internalIdLeakageCount: cases.reduce((sum, row) => sum + row.internalIdLeakageCount, 0), q050LeakageCount: cases.reduce((sum, row) => sum + row.q050LeakageCount, 0), overflowFindingCount: cases.reduce((sum, row) => sum + row.overflowFindingCount, 0), printInvocationCount: cases.reduce((sum, row) => sum + row.printInvocationCount, 0), consoleErrorCount: cases.reduce((sum, row) => sum + row.consoleErrorCount, 0), pageErrorCount: cases.reduce((sum, row) => sum + row.pageErrorCount, 0), requestFailureCount: cases.reduce((sum, row) => sum + row.requestFailureCount, 0), serverErrorCount: cases.reduce((sum, row) => sum + row.serverErrorCount, 0), applicationExpansion: true, operatorApprovedApplication: true, operatorApprovedEstimation: true, directTextbookApplicationExampleClaimed: false, directTextbookEstimationMethodClaimed: false, globalContextExpansion: false, slice050Expansion: false, parallelPipeline: false, assets: deployment.assets, cases };
  const pass = report.deployedAssetCount === 8 && report.deployedAssetShaMismatchCount === 0 && report.publicSourceCount === 33 && report.visibleKnowledgePointCount === 251 && report.sourceVisibleCount === 5 && report.sourceHiddenCount === 0 && report.sourceNotSelectableCount === 0 && report.applicationQuestionCount === 12 && report.estimationQuestionCount === 12 && report.totalQuestionCount === 24 && report.totalAnswerCount === 24 && report.totalPageCount === 8 && report.operatorApprovedApplicationWitnessRendered && report.operatorApprovedEstimationWitnessRendered && report.exactAnswerMismatchCount === 0 && report.applicationDimensionMismatchCount === 0 && report.estimationInstructionMismatchCount === 0 && report.unexpectedPatternCount === 0 && report.duplicatePromptCount === 0 && report.questionAnswerIdMismatchCount === 0 && report.internalIdLeakageCount === 0 && report.q050LeakageCount === 0 && report.overflowFindingCount === 0 && report.printInvocationCount === 2 && report.consoleErrorCount === 0 && report.pageErrorCount === 0 && report.requestFailureCount === 0 && report.serverErrorCount === 0 && report.applicationExpansion && report.operatorApprovedApplication && report.operatorApprovedEstimation && !report.directTextbookApplicationExampleClaimed && !report.directTextbookEstimationMethodClaimed && !report.globalContextExpansion && !report.slice050Expansion && !report.parallelPipeline;
  if (!pass) throw new Error(`P03F49_LIVE_ASSERT:${JSON.stringify(report)}`);
} catch (error) { failure = error; report = report ? { ...report, status: "FAIL_P03F49_POSTMERGE_MAIN_PAGES_E2E", error: String(error.message ?? error) } : { schemaName: "P03FSlice049LivePagesE2EReportV1", status: "FAIL_P03F49_POSTMERGE_MAIN_PAGES_E2E", error: String(error.message ?? error) }; }
finally { if (browser) await browser.close(); writeFileSync(resolve(OUT, "p03f-slice049-live-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`); }
console.log(`P03F49_LIVE_PAGES_E2E=${JSON.stringify(report)}`); if (failure) throw failure;
