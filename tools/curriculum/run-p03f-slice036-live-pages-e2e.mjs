import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice036-live-pages-e2e");
const EXACT_MERGE_SHA = "ccf0a9e6cd1f00a0b8fa3fc43739f9145add8c8b";
const EXACT_PAGES_RUN_ID = 31861998297;
const SOURCE_ID = "g5a_u01_5a01";
const KP_IDS = Object.freeze([
  "kp_g5a_u01_decimal_add_sub",
  "kp_g5a_u01_decimal_compare",
  "kp_g5a_u01_place_value_factor_relation",
]);
const GROUP_IDS = Object.freeze([
  "pg_g5a_u01_decimal_add_sub_numeric",
  "pg_g5a_u01_decimal_compare_numeric",
  "pg_g5a_u01_place_value_factor_relation_numeric",
]);
const SPEC_IDS = Object.freeze([
  "ps_g5a_u01_decimal_add_sub_result_numeric",
  "ps_g5a_u01_decimal_compare_comparison_numeric",
  "ps_g5a_u01_place_value_factor_relation_higher_place_value_numeric",
  "ps_g5a_u01_place_value_factor_relation_lower_place_value_numeric",
]);
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f36-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g5a-u01-rank9-decimal-selector-projection-p03f36.js",
    publicPath: "modules/curriculum/registry/g5a-u01-rank9-decimal-selector-projection-p03f36.js",
    requiredTokens: [SOURCE_ID, ...KP_IDS, ...GROUP_IDS, ...SPEC_IDS, "cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f36.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f36.js",
    requiredTokens: ["public-ui-capability-binding-p03f35.js", "g5a-u01-rank9-decimal-selector-projection-p03f36.js", "STRUCTURAL_FALLBACK_AVAILABLE"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g5a-u01-rank9-decimal-runtime-p03f36.js",
    publicPath: "modules/curriculum/batch-a/g5a-u01-rank9-decimal-runtime-p03f36.js",
    requiredTokens: ["G5A_U01_P03F36_ADD_SUB_SPEC_ID", "G5A_U01_P03F36_COMPARE_SPEC_ID", "factorQuestion", "P03F_W3DirectProductVerticalSlice036Implementation"],
  },
  {
    repoPath: "site/assets/browser/state/query-state.js",
    publicPath: "assets/browser/state/query-state.js",
    requiredTokens: ["batch-a-selector-p03f36-extension.js", "LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS", "approvedLatestKnowledgePoint"],
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f36.js"],
  },
];

function argument(name, fallback) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function repoPath(path) {
  return resolve(ROOT, path);
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function gcdBigInt(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a || 1n;
}

function parseDecimal(text) {
  const match = String(text).trim().match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) throw new Error(`invalid decimal: ${text}`);
  const fractional = match[3] ?? "";
  const denominator = 10n ** BigInt(fractional.length);
  const numerator = BigInt(`${match[2]}${fractional}`) * (match[1] === "-" ? -1n : 1n);
  return { numerator, denominator };
}

function canonicalTerminatingDecimal(numerator, denominator) {
  if (denominator <= 0n) throw new Error("invalid denominator");
  if (numerator === 0n) return "0";
  const sign = numerator < 0n ? "-" : "";
  let n = numerator < 0n ? -numerator : numerator;
  let d = denominator;
  const divisor = gcdBigInt(n, d);
  n /= divisor;
  d /= divisor;
  let twos = 0;
  let fives = 0;
  let rest = d;
  while (rest % 2n === 0n) { twos += 1; rest /= 2n; }
  while (rest % 5n === 0n) { fives += 1; rest /= 5n; }
  if (rest !== 1n) throw new Error("non-terminating decimal");
  const scale = Math.max(twos, fives);
  const multiplier = (2n ** BigInt(scale - twos)) * (5n ** BigInt(scale - fives));
  const scaled = String(n * multiplier).padStart(scale + 1, "0");
  if (scale === 0) return `${sign}${scaled}`;
  const integer = scaled.slice(0, -scale) || "0";
  const fraction = scaled.slice(-scale).replace(/0+$/, "");
  return fraction ? `${sign}${integer}.${fraction}` : `${sign}${integer}`;
}

function addOrSubtract(leftText, rightText, operation) {
  const left = parseDecimal(leftText);
  const right = parseDecimal(rightText);
  const numerator = operation === "add"
    ? left.numerator * right.denominator + right.numerator * left.denominator
    : left.numerator * right.denominator - right.numerator * left.denominator;
  return canonicalTerminatingDecimal(numerator, left.denominator * right.denominator);
}

function scaleDecimal(valueText, numeratorFactor, denominatorFactor) {
  const value = parseDecimal(valueText);
  return canonicalTerminatingDecimal(value.numerator * BigInt(numeratorFactor), value.denominator * BigInt(denominatorFactor));
}

function compareDecimals(leftText, rightText) {
  const left = parseDecimal(leftText);
  const right = parseDecimal(rightText);
  const leftCross = left.numerator * right.denominator;
  const rightCross = right.numerator * left.denominator;
  return leftCross < rightCross ? "<" : leftCross > rightCross ? ">" : "=";
}

function extractNumericAnswer(answerText) {
  const matches = [...String(answerText).matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => match[0]);
  return matches.at(-1) ?? null;
}

function extractComparisonAnswer(answerText) {
  const matches = [...String(answerText).matchAll(/[<=>]/g)].map((match) => match[0]);
  return matches.at(-1) ?? null;
}

function validateRenderedPair(prompt, answerText) {
  const arithmetic = String(prompt).match(/^(-?\d+(?:\.\d+)?)\s*([+−-])\s*(-?\d+(?:\.\d+)?)\s*=\s*[？?]/);
  if (arithmetic) {
    const operation = arithmetic[2] === "+" ? "add" : "sub";
    const expected = addOrSubtract(arithmetic[1], arithmetic[3], operation);
    const actual = extractNumericAnswer(answerText);
    return { family: "add_sub", operation, expected, actual, ok: actual === expected };
  }

  const compare = String(prompt).match(/^(-?\d+(?:\.\d+)?)\s*○\s*(-?\d+(?:\.\d+)?)/);
  if (compare) {
    const expected = compareDecimals(compare[1], compare[2]);
    const actual = extractComparisonAnswer(answerText);
    return { family: "compare", operation: "compare", expected, actual, ok: actual === expected };
  }

  const timesTen = String(prompt).match(/^(-?\d+(?:\.\d+)?)\s*的 10 倍是多少[？?]/);
  if (timesTen) {
    const expected = scaleDecimal(timesTen[1], 10, 1);
    const actual = extractNumericAnswer(answerText);
    return { family: "factor_times_10", operation: "times_10", expected, actual, ok: actual === expected };
  }

  const oneTenth = String(prompt).match(/^(-?\d+(?:\.\d+)?)\s*的十分之一是多少[？?]/);
  if (oneTenth) {
    const expected = scaleDecimal(oneTenth[1], 1, 10);
    const actual = extractNumericAnswer(answerText);
    return { family: "factor_one_tenth", operation: "one_tenth", expected, actual, ok: actual === expected };
  }

  return { family: "unrecognized", operation: null, expected: null, actual: null, ok: false };
}

const baseUrl = new URL(argument("base-url", process.env.P03F36_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F36_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F36_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F36_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
mkdirSync(outputDir, { recursive: true });

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store", headers: { "cache-control": "no-cache" } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

async function waitForExactDeployment() {
  let lastFailure = null;
  for (let attempt = 1; attempt <= deploymentRetryCount; attempt += 1) {
    try {
      const assets = [];
      for (const contract of assetContracts) {
        const localText = readFileSync(repoPath(contract.repoPath), "utf8");
        const expectedSha256 = sha256(localText);
        const assetUrl = new URL(contract.publicPath, baseUrl);
        assetUrl.searchParams.set("p03f36-sha", expectedSha256.slice(0, 16));
        const liveText = await fetchText(assetUrl);
        const liveSha256 = sha256(liveText);
        const missingTokens = contract.requiredTokens.filter((token) => !liveText.includes(token));
        if (liveSha256 !== expectedSha256 || missingTokens.length > 0) {
          throw new Error(`${contract.publicPath} deployment mismatch expected=${expectedSha256} actual=${liveSha256} missing=${missingTokens.join(",")}`);
        }
        assets.push({ repoPath: contract.repoPath, publicUrl: new URL(contract.publicPath, baseUrl).href, expectedSha256, liveSha256, missingTokenCount: 0 });
      }
      return { attempt, assets };
    } catch (error) {
      lastFailure = error;
      if (attempt < deploymentRetryCount) await sleep(deploymentRetryDelayMs);
    }
  }
  throw new Error(`Slice036 exact Pages deployment not observed: ${lastFailure?.message ?? "unknown"}`);
}

function buildLiveUrl() {
  const url = new URL(baseUrl);
  url.searchParams.set("sourceId", SOURCE_ID);
  url.searchParams.set("selectionMode", "mixedKnowledgePointsSameUnit");
  url.searchParams.set("questionCount", String(QUESTION_COUNT));
  url.searchParams.set("ordering", "groupedByPattern");
  url.searchParams.set("answerKey", "1");
  url.searchParams.set("generationSeed", GENERATION_SEED);
  url.searchParams.set("columns", "2");
  url.searchParams.set("rowsPerPage", "4");
  KP_IDS.forEach((id) => url.searchParams.append("kp", id));
  GROUP_IDS.forEach((id) => url.searchParams.append("pg", id));
  return url;
}

const liveUrl = buildLiveUrl();
const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];
const serverErrors = [];
let deployment = null;
let browser = null;
let page;

try {
  deployment = await waitForExactDeployment();
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push({ url: request.url(), errorText: request.failure()?.errorText ?? "unknown" }));
  page.on("response", (response) => { if (response.status() >= 500) serverErrors.push({ url: response.url(), status: response.status() }); });

  const mainResponse = await page.goto(liveUrl.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!mainResponse?.ok()) throw new Error(`Live Pages main response failed: ${mainResponse?.status() ?? "no-response"}`);
  await page.waitForFunction(() => document.querySelector("#batch-a-source-select")?.options?.length > 0, null, { timeout: 120000 });
  await page.waitForFunction(({ sourceId, kpIds }) => {
    const source = document.querySelector("#batch-a-source-select")?.value;
    const selected = kpIds.every((id) => document.querySelector(`[data-knowledge-point-id="${id}"]`)?.dataset?.selected === "true");
    return source === sourceId && selected && document.querySelector("#g5a-u08-question-mode")?.value === "numeric";
  }, { sourceId: SOURCE_ID, kpIds: KP_IDS }, { timeout: 120000 });

  const selectorState = await page.evaluate(({ sourceId, kpIds, groupIds }) => {
    const params = new URL(location.href).searchParams;
    const kpState = Object.fromEntries(kpIds.map((id) => [id, document.querySelector(`[data-knowledge-point-id="${id}"]`)?.dataset?.selected ?? null]));
    const groupState = Object.fromEntries(groupIds.map((id) => [id, document.querySelector(`[data-pattern-group-id="${id}"]`)?.dataset?.selected ?? null]));
    const groupQueryMatches = groupIds.every((id) => params.getAll("pg").includes(id));
    const patternGroupSelectionMode = Object.values(groupState).every((value) => value === "true")
      ? "visible-controls"
      : Object.values(groupState).every((value) => value == null) && groupQueryMatches
        ? "auto-applied-by-kp"
        : "unresolved";
    return {
      sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
      sourceMatches: document.querySelector("#batch-a-source-select")?.value === sourceId,
      selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
      questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
      ordering: document.querySelector("#batch-a-ordering-select")?.value ?? null,
      answerKey: Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),
      generationSeed: document.querySelector("#generation-seed-input")?.value ?? null,
      columns: document.querySelector("#columns-input")?.value ?? null,
      rowsPerPage: document.querySelector("#rows-per-page-input")?.value ?? null,
      kpState,
      groupState,
      patternGroupSelectionMode,
      kpQueryMatches: kpIds.every((id) => params.getAll("kp").includes(id)),
      groupQueryMatches,
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      publicCapabilityVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      availabilitySummary: document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim() ?? "",
    };
  }, { sourceId: SOURCE_ID, kpIds: KP_IDS, groupIds: GROUP_IDS });

  const selectorOk = selectorState.sourceMatches
    && selectorState.selectionMode === "mixedKnowledgePointsSameUnit"
    && selectorState.questionCount === String(QUESTION_COUNT)
    && selectorState.ordering === "groupedByPattern"
    && selectorState.answerKey === true
    && selectorState.generationSeed === GENERATION_SEED
    && selectorState.columns === "2"
    && selectorState.rowsPerPage === "4"
    && Object.values(selectorState.kpState).every((value) => value === "true")
    && ["visible-controls", "auto-applied-by-kp"].includes(selectorState.patternGroupSelectionMode)
    && selectorState.kpQueryMatches
    && selectorState.groupQueryMatches
    && selectorState.questionMode === "numeric"
    && selectorState.publicCapabilityVisible === "true"
    && selectorState.availabilitySummary.includes("本單元可選知識點：5")
    && selectorState.availabilitySummary.includes("已建立但尚未開放：3")
    && selectorState.availabilitySummary.includes("全部可選：234");
  if (!selectorOk) throw new Error(`Slice036 public selector binding mismatch: ${JSON.stringify(selectorState)}`);

  await page.locator("#regenerate-button").click();
  await page.waitForFunction(() => {
    const status = document.querySelector("#status-panel")?.textContent ?? "";
    return status.includes("已產生") || status.includes("產生失敗");
  }, null, { timeout: 120000 });

  const generationState = await page.evaluate(() => ({
    statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    statusTone: document.querySelector("#status-panel")?.dataset?.tone ?? "",
    validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    previewMeta: document.querySelector("#preview-meta")?.textContent?.trim() ?? "",
    previewSrcdocLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printButtonDisabled: Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if (!generationState.statusText.includes(`已產生 ${QUESTION_COUNT} 題`)
    || generationState.statusTone !== "success"
    || generationState.validationHasErrors !== "false"
    || !generationState.validationText.includes("驗證通過")
    || generationState.previewSrcdocLength <= 0
    || generationState.printButtonDisabled) {
    throw new Error(`Slice036 live generation/validator failed: ${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice036 preview iframe did not expose a content frame");
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const output = await frame.evaluate(() => {
    const questionCells = [...document.querySelectorAll(".worksheet-cell--question")];
    const answerCells = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    return {
      title: document.title,
      rendererProfile: document.body?.dataset?.rendererProfile ?? null,
      questionCount: questionCells.length,
      answerCount: answerCells.length,
      questionPageCount: document.querySelectorAll(".worksheet-page--questions").length,
      answerPageCount: document.querySelectorAll(".worksheet-page--answer-key").length,
      questionPrompts: questionCells.map((cell) => cell.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? ""),
      answerTexts: answerCells.map((cell) => cell.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? ""),
      allText: document.body?.innerText ?? "",
      sharedRenderer: document.querySelector(".worksheet-document") !== null,
    };
  });

  const answerChecks = output.questionPrompts.map((prompt, index) => ({ index, prompt, answerText: output.answerTexts[index], ...validateRenderedPair(prompt, output.answerTexts[index]) }));
  const familyCounts = Object.fromEntries(["add_sub", "compare", "factor_times_10", "factor_one_tenth"].map((family) => [family, answerChecks.filter((row) => row.family === family).length]));
  const operationCounts = {
    add: answerChecks.filter((row) => row.operation === "add").length,
    sub: answerChecks.filter((row) => row.operation === "sub").length,
  };
  const exactAnswerMismatchCount = answerChecks.filter((row) => !row.ok).length;
  const internalIdLeakage = [...KP_IDS, ...GROUP_IDS, ...SPEC_IDS].filter((token) => output.allText.includes(token));
  const balanced = Object.values(familyCounts).every((count) => count === 6) && operationCounts.add === 3 && operationCounts.sub === 3;

  if (output.questionCount !== QUESTION_COUNT
    || output.answerCount !== QUESTION_COUNT
    || output.questionPageCount !== 3
    || output.answerPageCount !== 3
    || !output.sharedRenderer
    || !balanced
    || exactAnswerMismatchCount !== 0
    || internalIdLeakage.length !== 0) {
    throw new Error(`Slice036 live worksheet/answer mismatch: ${JSON.stringify({ output: { ...output, allText: undefined }, familyCounts, operationCounts, exactAnswerMismatchCount, internalIdLeakage, answerChecks })}`);
  }

  await frame.evaluate(() => {
    window.__P03F36_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P03F36_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F36_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice036 print action did not reach preview frame: ${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F36_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F36_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F36_LIVE_PAGES_WORKSHEET.html"), await frame.content());

  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Slice036 browser diagnostics are not clean: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  const report = {
    schemaName: "P03FSlice036PostMergeMainPagesE2EV1",
    taskId: "P03F_W3DirectProductVerticalSlice036_PostMergeMainPagesE2E",
    status: "PASS_P03F36_POSTMERGE_MAIN_PAGES_E2E",
    exactMergeSha: EXACT_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    liveUrl: liveUrl.href,
    sourceId: SOURCE_ID,
    knowledgePointIds: KP_IDS,
    patternGroupIds: GROUP_IDS,
    patternSpecIds: SPEC_IDS,
    deployment,
    selectorState,
    generationState,
    worksheet: {
      title: output.title,
      rendererProfile: output.rendererProfile,
      questionCount: output.questionCount,
      answerCount: output.answerCount,
      questionPageCount: output.questionPageCount,
      answerPageCount: output.answerPageCount,
      familyCounts,
      operationCounts,
      exactAnswerMismatchCount,
      internalIdLeakage,
      sharedRenderer: output.sharedRenderer,
    },
    print: { invocationCount: printInvocationCount },
    browser: { consoleErrorCount: 0, pageErrorCount: 0, requestFailureCount: 0, serverErrorCount: 0 },
    forbiddenScope: { applicationExpansion: false, globalContextExpansion: false, parallelPipeline: false, siblingKnowledgePointPromotion: false, slice037Started: false },
  };
  writeFileSync(resolve(outputDir, "P03F36_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const failure = {
    schemaName: "P03FSlice036PostMergeMainPagesE2EV1",
    taskId: "P03F_W3DirectProductVerticalSlice036_PostMergeMainPagesE2E",
    status: "FAIL_P03F36_POSTMERGE_MAIN_PAGES_E2E",
    exactMergeSha: EXACT_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    liveUrl: liveUrl.href,
    deployment,
    error: error?.stack ?? String(error),
    browser: { consoleErrors, pageErrors, requestFailures, serverErrors },
  };
  writeFileSync(resolve(outputDir, "P03F36_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(failure, null, 2)}\n`);
  if (page) await page.screenshot({ path: resolve(outputDir, "P03F36_LIVE_PAGES_FAILURE.png"), fullPage: true }).catch(() => {});
  console.error(failure.error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
