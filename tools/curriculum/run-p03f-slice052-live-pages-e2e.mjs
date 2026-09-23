import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  G6A_U04_P03F52_PRECISION_GROUP_ID,
  G6A_U04_P03F52_PRECISION_KP_ID,
  G6A_U04_P03F52_PRECISION_SPEC_ID,
  G6A_U04_P03F52_RATE_GROUP_ID,
  G6A_U04_P03F52_RATE_KP_ID,
  G6A_U04_P03F52_RATE_SPEC_ID,
  G6A_U04_P03F52_SHIFT_GROUP_ID,
  G6A_U04_P03F52_SHIFT_KP_ID,
  G6A_U04_P03F52_SHIFT_SPEC_ID,
  G6A_U04_P03F52_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g6a-u04-rank12-shift-precision-rate-selector-projection-p03f52.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = new URL(process.env.P03F52_BASE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const OUT = resolve(ROOT, "tmp/p03f-slice052-live-pages-e2e");
mkdirSync(OUT, { recursive: true });

const EXACT_IMPLEMENTATION_HEAD_SHA = "88d61daf5e2b3c0c0942342a25040e953c870d29";
const EXACT_IMPLEMENTATION_MERGE_SHA = "5e1d396977095f0764dee6cb33b9f2e46eda8dd6";

const ASSETS = [
  ["site/modules/curriculum/registry/g6a-u04-rank12-shift-precision-rate-selector-projection-p03f52.js", "modules/curriculum/registry/g6a-u04-rank12-shift-precision-rate-selector-projection-p03f52.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p03f52-extension.js", "modules/curriculum/registry/batch-a-selector-p03f52-extension.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p03f52.js", "modules/curriculum/public/public-ui-capability-binding-p03f52.js"],
  ["site/modules/curriculum/batch-a/g6a-u04-rank12-shift-precision-rate-runtime-p03f52.js", "modules/curriculum/batch-a/g6a-u04-rank12-shift-precision-rate-runtime-p03f52.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-generator-p03f52.js", "modules/curriculum/batch-a/batch-a-browser-generator-p03f52.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f52.js", "modules/curriculum/batch-a/batch-a-browser-question-router-p03f52.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-validator-p03f52.js", "modules/curriculum/batch-a/batch-a-browser-validator-p03f52.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
  ["site/assets/browser/state/query-state.js", "assets/browser/state/query-state.js"],
  ["site/assets/browser/state/public-pattern-group-selection.js", "assets/browser/state/public-pattern-group-selection.js"],
  ["site/assets/browser/public-capability-ui.js", "assets/browser/public-capability-ui.js"],
  ["site/pixel/pixel-registry-bridge.js", "pixel/pixel-registry-bridge.js"],
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
  if (!/^\d+$/u.test(whole || "0") || !/^\d*$/u.test(fraction)) throw new Error(`P03F52_LIVE_DECIMAL_INVALID:${text}`);
  const denominator = 10n ** BigInt(fraction.length);
  const coefficient = BigInt(`${whole || "0"}${fraction}`) * (negative ? -1n : 1n);
  const divisor = gcd(coefficient, denominator);
  return { numerator: coefficient / divisor, denominator: denominator / divisor };
}

function exactDecimalDivision(dividend, divisor) {
  const a = decimalFraction(dividend);
  const b = decimalFraction(divisor);
  if (b.numerator === 0n) throw new Error("P03F52_LIVE_ZERO_DIVISOR");
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
  if (probe !== 1n) throw new Error(`P03F52_LIVE_NON_TERMINATING:${dividend}/${divisor}`);
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

function padScale(text, scale) {
  const [whole, fraction = ""] = String(text).split(".");
  if (scale === 0) return whole;
  return `${whole}.${fraction.padEnd(scale, "0")}`;
}

function decimalPlaces(text) {
  return (String(text).split(".")[1] ?? "").length;
}

function verifyShift(prompt, answer) {
  const match = String(prompt).trim().match(/^要把\s*(\d+(?:\.\d+)?)\s*÷\s*(\d+(?:\.\d+)?)\s*的除數變成整數，被除數和除數的小數點要同時向右移幾位？$/u);
  if (!match) return { ok: false, kind: "shift", shapeOk: false, expected: null };
  const [, dividend, divisor] = match;
  const expected = String(decimalPlaces(divisor));
  return {
    ok: String(answer).trim() === expected && decimalPlaces(divisor) >= 1,
    kind: "shift",
    shapeOk: decimalPlaces(divisor) >= 1,
    dividend,
    divisor,
    expected,
  };
}

function verifyPrecision(prompt, answer) {
  const match = String(prompt).trim().match(/^(\d+(?:\.\d+)?)\s*÷\s*(\d+(?:\.\d+)?)\s*的商要完整寫到小數第\s*(\d+)\s*位；不足位用\s*0\s*補齊。商是多少？$/u);
  if (!match) return { ok: false, kind: "precision", shapeOk: false, expected: null };
  const [, dividend, divisor, scaleText] = match;
  const requestedScale = Number(scaleText);
  const canonical = exactDecimalDivision(dividend, divisor);
  const expected = padScale(canonical, requestedScale);
  const actual = String(answer).trim();
  return {
    ok: actual === expected && decimalPlaces(actual) === requestedScale && actual.endsWith("0"),
    kind: "precision",
    shapeOk: requestedScale >= 1 && requestedScale <= 3,
    dividend,
    divisor,
    requestedScale,
    canonical,
    expected,
  };
}

function verifyRate(prompt, answer) {
  const text = String(prompt).trim();
  const patterns = [
    /^(\d+(?:\.\d+)?)\s*小時共行進\s*(\d+(?:\.\d+)?)\s*公里，平均每小時行進多少公里？$/u,
    /^(\d+(?:\.\d+)?)\s*公斤的物品共花\s*(\d+(?:\.\d+)?)\s*元，平均每公斤多少元？$/u,
    /^(\d+(?:\.\d+)?)\s*公尺的材料共花\s*(\d+(?:\.\d+)?)\s*元，平均每公尺多少元？$/u,
  ];
  const match = patterns.map((pattern) => text.match(pattern)).find(Boolean);
  if (!match) return { ok: false, kind: "rate", shapeOk: false, expected: null };
  const [, groupCount, totalAmount] = match;
  const expected = exactDecimalDivision(totalAmount, groupCount);
  return {
    ok: String(answer).trim() === expected && decimalPlaces(groupCount) >= 1,
    kind: "rate",
    shapeOk: decimalPlaces(groupCount) >= 1,
    groupCount,
    totalAmount,
    expected,
  };
}

async function waitForExactDeployment() {
  const retries = Number(process.env.P03F52_DEPLOYMENT_RETRIES ?? 20);
  const delay = Number(process.env.P03F52_DEPLOYMENT_RETRY_DELAY_MS ?? 15000);
  let lastFailure = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const assets = [];
      for (const [repoPath, publicPath] of ASSETS) {
        const expectedSha256 = hash(readFileSync(resolve(ROOT, repoPath), "utf8"));
        const url = new URL(publicPath, BASE);
        url.searchParams.set("p03f52-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`P03F52_DEPLOYMENT_NOT_EXACT:${lastFailure?.message ?? "unknown"}`);
}

const CASES = [
  {
    id: "numeric",
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    questionMode: "numeric",
    questionCount: 24,
    generationSeed: "p03f52-live-numeric",
    knowledgePointIds: [G6A_U04_P03F52_SHIFT_KP_ID, G6A_U04_P03F52_PRECISION_KP_ID],
    patternGroupIds: [G6A_U04_P03F52_SHIFT_GROUP_ID, G6A_U04_P03F52_PRECISION_GROUP_ID],
    expectedPatternSpecIds: [G6A_U04_P03F52_SHIFT_SPEC_ID, G6A_U04_P03F52_PRECISION_SPEC_ID],
    expectedPageCount: 6,
  },
  {
    id: "application",
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: "application",
    questionCount: 12,
    generationSeed: "p03f52-live-rate",
    knowledgePointIds: [G6A_U04_P03F52_RATE_KP_ID],
    patternGroupIds: [G6A_U04_P03F52_RATE_GROUP_ID],
    expectedPatternSpecIds: [G6A_U04_P03F52_RATE_SPEC_ID],
    expectedPageCount: 4,
  },
];

function caseUrl(config) {
  const url = new URL(BASE);
  for (const [key, value] of Object.entries({
    sourceId: config.sourceId,
    selectionMode: config.selectionMode,
    questionMode: config.questionMode,
    questionCount: String(config.questionCount),
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: config.generationSeed,
    columns: "2",
    rowsPerPage: "4",
  })) url.searchParams.set(key, value);
  for (const kp of config.knowledgePointIds) url.searchParams.append("kp", kp);
  for (const pg of config.patternGroupIds) url.searchParams.append("pg", pg);
  return url;
}

async function runCase(browser, config) {
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  const serverErrors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 500) serverErrors.push(`${response.status()}:${response.url()}`); });

  const response = await page.goto(caseUrl(config).href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P03F52_LIVE_PAGE_${config.id}:${response?.status() ?? "NO_RESPONSE"}`);

  await page.waitForFunction(({ sourceId, knowledgePointIds, questionMode }) =>
    document.querySelector("#batch-a-source-select")?.value === sourceId
    && knowledgePointIds.every((kp) => document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected === "true")
    && document.querySelector("#g5a-u08-question-mode")?.value === questionMode,
  { sourceId: config.sourceId, knowledgePointIds: config.knowledgePointIds, questionMode: config.questionMode }, { timeout: 120000 });

  const ui = await page.evaluate(async ({ sourceId, knowledgePointIds }) => {
    const params = new URL(location.href).searchParams;
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f52-e2e", String(Date.now()));
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
      kpSelected: Object.fromEntries(knowledgePointIds.map((kp) => [kp, document.querySelector(`[data-knowledge-point-id="${kp}"]`)?.dataset?.selected ?? null])),
      publicControlsVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      kpQuery: params.getAll("kp"),
      pgQuery: params.getAll("pg"),
      publicSourceCount: registry.sourceCount,
      visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
      sourceVisibleCount: source?.visibleKnowledgePoints?.length ?? 0,
      sourceHiddenCount: source?.hiddenPendingCount ?? 0,
      sourceNotSelectableCount: source?.notSelectableCount ?? 0,
    };
  }, { sourceId: config.sourceId, knowledgePointIds: config.knowledgePointIds });

  const uiOk = ui.sourceId === config.sourceId
    && ui.selectionMode === config.selectionMode
    && ui.questionMode === config.questionMode
    && ui.questionCount === String(config.questionCount)
    && ui.ordering === "groupedByPattern"
    && ui.answerKey
    && ui.columns === "2"
    && ui.rowsPerPage === "4"
    && config.knowledgePointIds.every((kp) => ui.kpSelected[kp] === "true" && ui.kpQuery.includes(kp))
    && config.patternGroupIds.every((pg) => ui.pgQuery.includes(pg))
    && ui.publicControlsVisible === "true"
    && ui.publicSourceCount === 34
    && ui.visibleKnowledgePointCount === 258
    && ui.sourceVisibleCount === 4
    && ui.sourceHiddenCount === 1
    && ui.sourceNotSelectableCount === 1;
  if (!uiOk) throw new Error(`P03F52_LIVE_UI_${config.id}:${JSON.stringify(ui)}`);

  await page.click("#regenerate-button");
  await page.waitForFunction(() => document.querySelector("#status-panel")?.dataset?.tone === "success", null, { timeout: 120000 });
  const generation = await page.evaluate(() => ({
    statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    previewLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if (!generation.statusText.includes(`已產生 ${config.questionCount} 題`) || generation.validationHasErrors !== "false" || !generation.validationText.includes("驗證通過") || generation.previewLength <= 0 || generation.printDisabled) {
    throw new Error(`P03F52_LIVE_GENERATION_${config.id}:${JSON.stringify(generation)}`);
  }

  const frame = await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if (!frame) throw new Error(`P03F52_LIVE_FRAME_MISSING_${config.id}`);
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
    await frame.locator(".worksheet-page").nth(index).screenshot({ path: resolve(OUT, `${config.id}-page-${String(index + 1).padStart(2, "0")}.png`) });
  }

  const answerById = new Map(rendered.answers.map((row) => [row.id, row]));
  const checks = rendered.questions.map((question) => {
    const answer = answerById.get(question.id)?.answer ?? "";
    let verification;
    if (question.patternId === G6A_U04_P03F52_SHIFT_SPEC_ID) verification = verifyShift(question.prompt, answer);
    else if (question.patternId === G6A_U04_P03F52_PRECISION_SPEC_ID) verification = verifyPrecision(question.prompt, answer);
    else if (question.patternId === G6A_U04_P03F52_RATE_SPEC_ID) verification = verifyRate(question.prompt, answer);
    else verification = { ok: false, kind: "unexpected", shapeOk: false, expected: null };
    return { ...question, answer, ...verification };
  });

  const printKey = `__p03f52Print_${config.id}`;
  await frame.evaluate((key) => { window[key] = 0; window.print = () => { window[key] += 1; }; }, printKey);
  await page.click("#print-button");
  await page.waitForTimeout(100);
  const printInvocationCount = await frame.evaluate((key) => window[key] ?? 0, printKey);
  await page.close();

  const expectedPatternSet = new Set(config.expectedPatternSpecIds);
  const patternCounts = Object.fromEntries(config.expectedPatternSpecIds.map((patternId) => [patternId, checks.filter((row) => row.patternId === patternId).length]));
  return {
    id: config.id,
    ui,
    questionCount: rendered.questions.length,
    answerCount: rendered.answers.length,
    pageCount: rendered.pages.length,
    exactAnswerMismatchCount: checks.filter((row) => !row.ok).length,
    operandOrPromptShapeMismatchCount: checks.filter((row) => !row.shapeOk).length,
    unexpectedPatternCount: rendered.questions.filter((row) => !expectedPatternSet.has(row.patternId)).length + rendered.answers.filter((row) => !expectedPatternSet.has(row.patternId)).length,
    duplicatePromptCount: rendered.questions.length - new Set(rendered.questions.map((row) => row.prompt)).size,
    questionAnswerIdMismatchCount: rendered.questions.filter((row) => !answerById.has(row.id)).length,
    internalIdLeakageCount: (rendered.bodyText.match(/\b(?:kp_|pg_|ps_|P03F5\d_)/gu) ?? []).length,
    q053SemanticLeakageCount: (rendered.bodyText.match(/四捨五入|取概數|約到小數/gu) ?? []).length,
    overflowFindingCount: rendered.pages.filter((row) => row.overflowX || row.overflowY).length,
    printInvocationCount,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    requestFailureCount: requestFailures.length,
    serverErrorCount: serverErrors.length,
    patternCounts,
    checks,
  };
}

let browser = null;
let report = null;
let failure = null;
try {
  const deployment = await waitForExactDeployment();
  browser = await chromium.launch({ headless: true });
  const results = [];
  for (const config of CASES) results.push(await runCase(browser, config));
  const numeric = results.find((row) => row.id === "numeric");
  const application = results.find((row) => row.id === "application");
  report = {
    schemaName: "P03FSlice052LivePagesE2EReportV1",
    status: "PASS_P03F52_POSTMERGE_MAIN_PAGES_E2E",
    exactImplementationHeadSha: EXACT_IMPLEMENTATION_HEAD_SHA,
    exactImplementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA,
    deploymentAttempt: deployment.attempt,
    deployedAssetCount: deployment.assets.length,
    deployedAssetShaMismatchCount: deployment.assets.filter((row) => row.expectedSha256 !== row.liveSha256).length,
    publicSourceCount: numeric.ui.publicSourceCount,
    visibleKnowledgePointCount: numeric.ui.visibleKnowledgePointCount,
    sourceVisibleCount: numeric.ui.sourceVisibleCount,
    sourceHiddenCount: numeric.ui.sourceHiddenCount,
    sourceNotSelectableCount: numeric.ui.sourceNotSelectableCount,
    numericQuestionCount: numeric.questionCount,
    numericAnswerCount: numeric.answerCount,
    shiftQuestionCount: numeric.patternCounts[G6A_U04_P03F52_SHIFT_SPEC_ID] ?? 0,
    precisionQuestionCount: numeric.patternCounts[G6A_U04_P03F52_PRECISION_SPEC_ID] ?? 0,
    numericPageCount: numeric.pageCount,
    applicationQuestionCount: application.questionCount,
    applicationAnswerCount: application.answerCount,
    rateQuestionCount: application.patternCounts[G6A_U04_P03F52_RATE_SPEC_ID] ?? 0,
    applicationPageCount: application.pageCount,
    totalQuestionCount: numeric.questionCount + application.questionCount,
    totalAnswerCount: numeric.answerCount + application.answerCount,
    totalPageCount: numeric.pageCount + application.pageCount,
    exactAnswerMismatchCount: numeric.exactAnswerMismatchCount + application.exactAnswerMismatchCount,
    operandOrPromptShapeMismatchCount: numeric.operandOrPromptShapeMismatchCount + application.operandOrPromptShapeMismatchCount,
    unexpectedPatternCount: numeric.unexpectedPatternCount + application.unexpectedPatternCount,
    duplicatePromptCount: numeric.duplicatePromptCount + application.duplicatePromptCount,
    questionAnswerIdMismatchCount: numeric.questionAnswerIdMismatchCount + application.questionAnswerIdMismatchCount,
    internalIdLeakageCount: numeric.internalIdLeakageCount + application.internalIdLeakageCount,
    q053SemanticLeakageCount: numeric.q053SemanticLeakageCount + application.q053SemanticLeakageCount,
    overflowFindingCount: numeric.overflowFindingCount + application.overflowFindingCount,
    printInvocationCount: numeric.printInvocationCount + application.printInvocationCount,
    consoleErrorCount: numeric.consoleErrorCount + application.consoleErrorCount,
    pageErrorCount: numeric.pageErrorCount + application.pageErrorCount,
    requestFailureCount: numeric.requestFailureCount + application.requestFailureCount,
    serverErrorCount: numeric.serverErrorCount + application.serverErrorCount,
    zeroFillExtensionRouteCovered: (numeric.patternCounts[G6A_U04_P03F52_PRECISION_SPEC_ID] ?? 0) > 0,
    rateExtensionRouteCovered: (application.patternCounts[G6A_U04_P03F52_RATE_SPEC_ID] ?? 0) > 0,
    globalContextExpansion: false,
    slice053Expansion: false,
    roundingExpansion: false,
    parallelPipeline: false,
    assets: deployment.assets,
    results,
  };

  const pass = report.deployedAssetCount === ASSETS.length
    && report.deployedAssetShaMismatchCount === 0
    && report.publicSourceCount === 34
    && report.visibleKnowledgePointCount === 258
    && report.sourceVisibleCount === 4
    && report.sourceHiddenCount === 1
    && report.sourceNotSelectableCount === 1
    && report.numericQuestionCount === 24
    && report.numericAnswerCount === 24
    && report.shiftQuestionCount === 12
    && report.precisionQuestionCount === 12
    && report.numericPageCount === 6
    && report.applicationQuestionCount === 12
    && report.applicationAnswerCount === 12
    && report.rateQuestionCount === 12
    && report.applicationPageCount === 4
    && report.totalQuestionCount === 36
    && report.totalAnswerCount === 36
    && report.totalPageCount === 10
    && report.exactAnswerMismatchCount === 0
    && report.operandOrPromptShapeMismatchCount === 0
    && report.unexpectedPatternCount === 0
    && report.duplicatePromptCount === 0
    && report.questionAnswerIdMismatchCount === 0
    && report.internalIdLeakageCount === 0
    && report.q053SemanticLeakageCount === 0
    && report.overflowFindingCount === 0
    && report.printInvocationCount === 2
    && report.consoleErrorCount === 0
    && report.pageErrorCount === 0
    && report.requestFailureCount === 0
    && report.serverErrorCount === 0
    && report.zeroFillExtensionRouteCovered
    && report.rateExtensionRouteCovered
    && !report.globalContextExpansion
    && !report.slice053Expansion
    && !report.roundingExpansion
    && !report.parallelPipeline;
  if (!pass) throw new Error(`P03F52_LIVE_ASSERT:${JSON.stringify(report)}`);
} catch (error) {
  failure = error;
  report = report
    ? { ...report, status: "FAIL_P03F52_POSTMERGE_MAIN_PAGES_E2E", error: String(error.message ?? error) }
    : { schemaName: "P03FSlice052LivePagesE2EReportV1", status: "FAIL_P03F52_POSTMERGE_MAIN_PAGES_E2E", error: String(error.message ?? error) };
} finally {
  if (browser) await browser.close();
  writeFileSync(resolve(OUT, "p03f-slice052-live-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`P03F52_LIVE_PAGES_E2E=${JSON.stringify(report)}`);
if (failure) throw failure;
