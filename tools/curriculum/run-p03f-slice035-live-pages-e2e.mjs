import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice035-live-pages-e2e");
const EXACT_MERGE_SHA = "f4a56d4fd35ed0d69cf2174b68e62ac427acfd01";
const EXACT_PAGES_RUN_ID = 31820503061;
const SOURCE_ID = "g4b_u06_4b06";
const KP_ID = "kp_g4b_u06_decimal_scale_ten_hundred";
const GROUP_ID = "pg_g4b_u06_decimal_scale_ten_hundred_numeric";
const PATTERN_SPEC_ID = "ps_g4b_u06_decimal_scale_ten_hundred_result_numeric";
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f35-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g4b-u06-rank9-decimal-scale-selector-projection-p03f35.js",
    publicPath: "modules/curriculum/registry/g4b-u06-rank9-decimal-scale-selector-projection-p03f35.js",
    requiredTokens: [SOURCE_ID, KP_ID, GROUP_ID, PATTERN_SPEC_ID, "cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"]
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f35.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f35.js",
    requiredTokens: ["public-ui-capability-binding-p03f34.js", "g4b-u06-rank9-decimal-scale-selector-projection-p03f35.js", "STRUCTURAL_FALLBACK_AVAILABLE"]
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g4b-u06-rank9-decimal-scale-runtime-p03f35.js",
    publicPath: "modules/curriculum/batch-a/g4b-u06-rank9-decimal-scale-runtime-p03f35.js",
    requiredTokens: [PATTERN_SPEC_ID, "decimal_scale", "APPLICATION_NOT_APPLICABLE", "SHARED_OPERATION_FAMILY_VALIDATOR_V1"]
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f35.js"]
  }
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

function parseDecimal(text) {
  const match = String(text).trim().match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) throw new Error(`invalid decimal: ${text}`);
  const fractional = match[3] ?? "";
  const denominator = 10n ** BigInt(fractional.length);
  const numerator = BigInt(`${match[2]}${fractional}`) * (match[1] === "-" ? -1n : 1n);
  return { numerator, denominator };
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

function canonicalTerminatingDecimal(numerator, denominator) {
  if (denominator <= 0n) throw new Error("invalid denominator");
  if (numerator === 0n) return "0";
  const sign = numerator < 0n ? "-" : "";
  let n = numerator < 0n ? -numerator : numerator;
  let d = denominator;
  const gcd = gcdBigInt(n, d);
  n /= gcd;
  d /= gcd;
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

function expectedProduct(valueText, factorText) {
  const value = parseDecimal(valueText);
  const factor = parseDecimal(factorText);
  return canonicalTerminatingDecimal(value.numerator * factor.numerator, value.denominator * factor.denominator);
}

function extractPromptOperands(prompt) {
  const match = String(prompt).match(/(-?\d+(?:\.\d+)?)\s*×\s*(10|100|0\.1|0\.01)\s*=\s*[？?]/);
  return match ? { value: match[1], factor: match[2] } : null;
}

function extractAnswerDecimal(answerText) {
  const matches = [...String(answerText).matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => match[0]);
  return matches.at(-1) ?? null;
}

const baseUrl = new URL(argument("base-url", process.env.P03F35_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F35_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F35_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F35_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        const liveUrl = new URL(contract.publicPath, baseUrl);
        liveUrl.searchParams.set("p03f35-sha", expectedSha256.slice(0, 16));
        const liveText = await fetchText(liveUrl);
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
  throw new Error(`Slice035 exact Pages deployment not observed: ${lastFailure?.message ?? "unknown"}`);
}

function buildLiveUrl() {
  const url = new URL(baseUrl);
  url.searchParams.set("sourceId", SOURCE_ID);
  url.searchParams.set("selectionMode", "singleKnowledgePoint");
  url.searchParams.set("questionCount", String(QUESTION_COUNT));
  url.searchParams.set("ordering", "groupedByPattern");
  url.searchParams.set("answerKey", "1");
  url.searchParams.set("generationSeed", GENERATION_SEED);
  url.searchParams.set("columns", "2");
  url.searchParams.set("rowsPerPage", "4");
  url.searchParams.append("kp", KP_ID);
  url.searchParams.append("pg", GROUP_ID);
  return url;
}

const deployment = await waitForExactDeployment();
const liveUrl = buildLiveUrl();
const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];
const serverErrors = [];
const browser = await chromium.launch({ headless: true });
let page;
let report;

try {
  page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push({ url: request.url(), errorText: request.failure()?.errorText ?? "unknown" }));
  page.on("response", (response) => { if (response.status() >= 500) serverErrors.push({ url: response.url(), status: response.status() }); });

  const mainResponse = await page.goto(liveUrl.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!mainResponse?.ok()) throw new Error(`Live Pages main response failed: ${mainResponse?.status() ?? "no-response"}`);
  await page.waitForFunction(() => document.querySelector("#batch-a-source-select")?.options?.length > 0, null, { timeout: 120000 });
  await page.waitForFunction(({ sourceId, kpId }) => {
    const source = document.querySelector("#batch-a-source-select")?.value;
    const kp = document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected;
    const questionMode = document.querySelector("#g5a-u08-question-mode")?.value;
    return source === sourceId && kp === "true" && questionMode === "numeric";
  }, { sourceId: SOURCE_ID, kpId: KP_ID }, { timeout: 120000 });

  const selectorState = await page.evaluate(({ sourceId, kpId, groupId }) => {
    const groupButton = document.querySelector(`[data-pattern-group-id="${groupId}"]`);
    const groupSection = document.querySelector("#batch-a-pattern-group-selector");
    const groupHelp = document.querySelector("#batch-a-pattern-group-help")?.textContent?.trim() ?? "";
    const groupQueryMatches = new URL(location.href).searchParams.getAll("pg").includes(groupId);
    const autoAppliedGroup = !groupButton
      && groupSection?.dataset?.visible === "false"
      && groupHelp.includes("只有一種題目形式，系統已自動套用")
      && groupQueryMatches;
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
      selectedKnowledgePoint: document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected ?? null,
      selectedPatternGroup: groupButton?.dataset?.selected ?? (autoAppliedGroup ? "true" : null),
      patternGroupSelectionMode: groupButton ? "visible-control" : autoAppliedGroup ? "auto-applied-single-representation" : "unresolved",
      groupQueryMatches,
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      publicCapabilityVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      availabilitySummary: document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim() ?? ""
    };
  }, { sourceId: SOURCE_ID, kpId: KP_ID, groupId: GROUP_ID });

  const selectorOk = selectorState.sourceMatches
    && selectorState.selectionMode === "singleKnowledgePoint"
    && selectorState.questionCount === String(QUESTION_COUNT)
    && selectorState.ordering === "groupedByPattern"
    && selectorState.answerKey === true
    && selectorState.generationSeed === GENERATION_SEED
    && selectorState.columns === "2"
    && selectorState.rowsPerPage === "4"
    && selectorState.selectedKnowledgePoint === "true"
    && selectorState.selectedPatternGroup === "true"
    && selectorState.groupQueryMatches === true
    && selectorState.questionMode === "numeric"
    && selectorState.publicCapabilityVisible === "true"
    && selectorState.availabilitySummary.includes("本單元可選知識點：4")
    && selectorState.availabilitySummary.includes("已建立但尚未開放：2")
    && selectorState.availabilitySummary.includes("全部可選：231");
  if (!selectorOk) throw new Error(`Slice035 public selector binding mismatch: ${JSON.stringify(selectorState)}`);

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
    printButtonText: document.querySelector("#print-button")?.textContent?.trim() ?? ""
  }));
  if (!generationState.statusText.includes(`已產生 ${QUESTION_COUNT} 題`)
    || generationState.statusTone !== "success"
    || generationState.validationHasErrors !== "false"
    || !generationState.validationText.includes("驗證通過")
    || generationState.previewSrcdocLength <= 0
    || generationState.printButtonDisabled) {
    throw new Error(`Slice035 live generation/validator failed: ${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice035 preview iframe did not expose a content frame");
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
      sharedRenderer: document.querySelector(".worksheet-document") !== null
    };
  });

  const factorCounts = { "10": 0, "100": 0, "0.1": 0, "0.01": 0 };
  const answerChecks = [];
  for (let index = 0; index < output.questionPrompts.length; index += 1) {
    const operands = extractPromptOperands(output.questionPrompts[index]);
    const actual = extractAnswerDecimal(output.answerTexts[index]);
    if (!operands) {
      answerChecks.push({ index, prompt: output.questionPrompts[index], actual, expected: null, ok: false, reason: "prompt-unparseable" });
      continue;
    }
    factorCounts[operands.factor] += 1;
    const expected = expectedProduct(operands.value, operands.factor);
    answerChecks.push({ index, prompt: output.questionPrompts[index], actual, expected, ok: actual === expected });
  }
  const exactAnswerMismatchCount = answerChecks.filter((row) => !row.ok).length;
  const factorBalanceOk = JSON.stringify(factorCounts) === JSON.stringify({ "10": 6, "100": 6, "0.1": 6, "0.01": 6 });
  const internalIdLeakage = [KP_ID, GROUP_ID, PATTERN_SPEC_ID].filter((token) => output.allText.includes(token));

  if (output.questionCount !== QUESTION_COUNT
    || output.answerCount !== QUESTION_COUNT
    || output.questionPageCount !== 3
    || output.answerPageCount !== 3
    || !output.sharedRenderer
    || !factorBalanceOk
    || exactAnswerMismatchCount !== 0
    || internalIdLeakage.length !== 0) {
    throw new Error(`Slice035 live worksheet/answer mismatch: ${JSON.stringify({ output: { ...output, allText: undefined }, factorCounts, exactAnswerMismatchCount, internalIdLeakage, answerChecks })}`);
  }

  await frame.evaluate(() => {
    window.__P03F35_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P03F35_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F35_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice035 print action did not reach preview frame: ${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F35_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F35_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F35_LIVE_PAGES_WORKSHEET.html"), await frame.content());

  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Slice035 browser diagnostics are not clean: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  report = {
    schemaName: "P03FSlice035PostMergeMainPagesE2EV1",
    taskId: "P03F_W3DirectProductVerticalSlice035_PostMergeMainPagesE2E",
    status: "PASS_P03F35_POSTMERGE_MAIN_PAGES_E2E",
    exactMergeSha: EXACT_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    liveUrl: liveUrl.href,
    sourceId: SOURCE_ID,
    knowledgePointId: KP_ID,
    patternGroupId: GROUP_ID,
    patternSpecId: PATTERN_SPEC_ID,
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
      factorCounts,
      exactAnswerMismatchCount,
      internalIdLeakage,
      sharedRenderer: output.sharedRenderer
    },
    print: { buttonEnabled: !generationState.printButtonDisabled, invocationCount: printInvocationCount },
    browser: { consoleErrorCount: 0, pageErrorCount: 0, requestFailureCount: 0, serverErrorCount: 0 },
    forbiddenScope: { applicationExpansion: false, globalContextExpansion: false, parallelPipeline: false, siblingKnowledgePointPromotion: false, slice036Started: false }
  };
  writeFileSync(resolve(outputDir, "P03F35_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const failure = {
    schemaName: "P03FSlice035PostMergeMainPagesE2EV1",
    taskId: "P03F_W3DirectProductVerticalSlice035_PostMergeMainPagesE2E",
    status: "FAIL_P03F35_POSTMERGE_MAIN_PAGES_E2E",
    exactMergeSha: EXACT_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    liveUrl: liveUrl.href,
    error: error?.stack ?? String(error),
    browser: { consoleErrors, pageErrors, requestFailures, serverErrors }
  };
  writeFileSync(resolve(outputDir, "P03F35_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(failure, null, 2)}\n`);
  if (page) await page.screenshot({ path: resolve(outputDir, "P03F35_LIVE_PAGES_FAILURE.png"), fullPage: true }).catch(() => {});
  console.error(failure.error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
