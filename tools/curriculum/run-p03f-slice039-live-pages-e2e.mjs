import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice039-live-pages-e2e");
const EXACT_MERGE_SHA = "bb015c5c85bb45da4eba3c4f2f8f58b6add49a3f";
const EXACT_PAGES_RUN_ID = 31924186578;
const SOURCE_ID = "g5b_u04_5b04";
const KP_ID = "kp_g5b_u04_integer_times_decimal";
const GROUP_ID = "pg_g5b_u04_integer_times_decimal_numeric";
const SPEC_ID = "ps_g5b_u04_integer_times_decimal_product_numeric";
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f39-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g5b-u04-rank9-integer-times-decimal-selector-projection-p03f39.js",
    publicPath: "modules/curriculum/registry/g5b-u04-rank9-integer-times-decimal-selector-projection-p03f39.js",
    requiredTokens: [SOURCE_ID, KP_ID, GROUP_ID, SPEC_ID, "cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f39.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f39.js",
    requiredTokens: ["public-ui-capability-binding-p03f38.js", "g5b-u04-rank9-integer-times-decimal-selector-projection-p03f39.js", "STRUCTURAL_FALLBACK_AVAILABLE"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g5b-u04-rank9-integer-times-decimal-runtime-p03f39.js",
    publicPath: "modules/curriculum/batch-a/g5b-u04-rank9-integer-times-decimal-runtime-p03f39.js",
    requiredTokens: ["generateG5BU04P03F31Questions", "integer_times_decimal", "P03F_W3DirectProductVerticalSlice039Implementation"],
  },
  {
    repoPath: "site/assets/browser/state/query-state.js",
    publicPath: "assets/browser/state/query-state.js",
    requiredTokens: ["batch-a-selector-p03f39-extension.js", "G5B_U04_SOURCE_ID", "LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS"],
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f39.js"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    publicPath: "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    requiredTokens: ["batch-a-browser-worksheet-p03f39-extension.js", "requestsP03F39"],
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

function extractNumericAnswer(answerText) {
  const matches = [...String(answerText).matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => match[0]);
  return matches.at(-1) ?? null;
}

function validateRenderedPair(prompt, answerText) {
  const match = String(prompt).trim().match(/^(\d+)\s*×\s*(\d+\.\d{3})\s*=\s*[？?]$/);
  if (!match) return { family: "unrecognized", integerFactor: null, decimalFactor: null, expected: null, actual: extractNumericAnswer(answerText), ok: false };
  const integerFactor = BigInt(match[1]);
  const decimal = parseDecimal(match[2]);
  const expected = canonicalTerminatingDecimal(integerFactor * decimal.numerator, decimal.denominator);
  const actual = extractNumericAnswer(answerText);
  return {
    family: "integer_times_decimal",
    integerFactor: match[1],
    decimalFactor: match[2],
    expected,
    actual,
    ok: actual === expected,
  };
}

const baseUrl = new URL(argument("base-url", process.env.P03F39_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F39_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F39_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F39_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        assetUrl.searchParams.set("p03f39-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`Slice039 exact Pages deployment not observed: ${lastFailure?.message ?? "unknown"}`);
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
  await page.waitForFunction(({ sourceId, kpId }) => {
    const source = document.querySelector("#batch-a-source-select")?.value;
    const selected = document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected === "true";
    return source === sourceId && selected && document.querySelector("#g5a-u08-question-mode")?.value === "numeric";
  }, { sourceId: SOURCE_ID, kpId: KP_ID }, { timeout: 120000 });

  const selectorState = await page.evaluate(({ sourceId, kpId, groupId }) => {
    const params = new URL(location.href).searchParams;
    const kpState = document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected ?? null;
    const groupState = document.querySelector(`[data-pattern-group-id="${groupId}"]`)?.dataset?.selected ?? null;
    const groupQueryMatches = params.getAll("pg").includes(groupId);
    const patternGroupSelectionMode = groupState === "true"
      ? "visible-controls"
      : groupState == null && groupQueryMatches
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
      kpQueryMatches: params.getAll("kp").includes(kpId),
      groupQueryMatches,
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      publicCapabilityVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      availabilitySummary: document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim() ?? "",
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
    && selectorState.kpState === "true"
    && ["visible-controls", "auto-applied-by-kp"].includes(selectorState.patternGroupSelectionMode)
    && selectorState.kpQueryMatches
    && selectorState.groupQueryMatches
    && selectorState.questionMode === "numeric"
    && selectorState.publicCapabilityVisible === "true"
    && selectorState.availabilitySummary.includes("本單元可選知識點：2")
    && selectorState.availabilitySummary.includes("全部可選：237");
  if (!selectorOk) throw new Error(`Slice039 public selector binding mismatch: ${JSON.stringify(selectorState)}`);

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
    throw new Error(`Slice039 live generation/validator failed: ${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice039 preview iframe did not expose a content frame");
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
  const exactAnswerMismatchCount = answerChecks.filter((row) => !row.ok).length;
  const orientationFindingCount = answerChecks.filter((row) => row.family !== "integer_times_decimal").length;
  const duplicatePromptCount = output.questionPrompts.length - new Set(output.questionPrompts).size;
  const internalIdLeakage = [KP_ID, GROUP_ID, SPEC_ID].filter((token) => output.allText.includes(token));

  if (output.questionCount !== QUESTION_COUNT
    || output.answerCount !== QUESTION_COUNT
    || output.questionPageCount !== 3
    || output.answerPageCount !== 3
    || !output.sharedRenderer
    || exactAnswerMismatchCount !== 0
    || orientationFindingCount !== 0
    || duplicatePromptCount !== 0
    || internalIdLeakage.length !== 0) {
    throw new Error(`Slice039 live worksheet/answer mismatch: ${JSON.stringify({ output: { ...output, allText: undefined }, exactAnswerMismatchCount, orientationFindingCount, duplicatePromptCount, internalIdLeakage, answerChecks })}`);
  }

  await frame.evaluate(() => {
    window.__P03F39_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P03F39_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F39_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice039 print action did not reach preview frame: ${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F39_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F39_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F39_LIVE_PAGES_WORKSHEET.html"), await frame.content());

  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Slice039 browser diagnostics failed: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  const report = {
    schemaName: "P03FSlice039PostMergeMainPagesE2EV1",
    taskId: "P03F_W3DirectProductVerticalSlice039_PostMergeMainPagesE2E",
    status: "PASS_P03F39_POSTMERGE_MAIN_PAGES_E2E",
    exactImplementationMergeSha: EXACT_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    sourceId: SOURCE_ID,
    knowledgePointId: KP_ID,
    patternGroupId: GROUP_ID,
    patternSpecId: SPEC_ID,
    deployment,
    selector: selectorState,
    generation: generationState,
    worksheet: {
      rendererProfile: output.rendererProfile,
      questionCount: output.questionCount,
      answerCount: output.answerCount,
      questionPageCount: output.questionPageCount,
      answerPageCount: output.answerPageCount,
      exactAnswerMismatchCount,
      orientationFindingCount,
      duplicatePromptCount,
      internalIdLeakage,
      sharedRenderer: output.sharedRenderer,
      sharedP03F31DecimalRuntime: true,
      patternGroupSelectionMode: selectorState.patternGroupSelectionMode,
    },
    print: { invocationCount: printInvocationCount },
    browser: { consoleErrorCount: 0, pageErrorCount: 0, requestFailureCount: 0, serverErrorCount: 0 },
    forbiddenScope: {
      applicationExpansion: false,
      globalContextExpansion: false,
      parallelPipeline: false,
      decimalTimesDecimalExpansion: false,
      estimationExpansion: false,
      siblingKnowledgePointPromotion: false,
      slice040Started: false,
    },
  };
  writeFileSync(resolve(outputDir, "P03F39_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P03F39_POSTMERGE_MAIN_PAGES_E2E=${JSON.stringify(report)}`);
} finally {
  if (browser) await browser.close();
}
