import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice037-live-pages-e2e");
const EXACT_MERGE_SHA = "be5ac90b8708cb2764eaae7ed2b0b2bd25e6c982";
const EXACT_PAGES_RUN_ID = 31868596524;
const SOURCE_ID = "g5a_u04_5a04";
const KP_ID = "kp_g5a_u04_equivalent_mixed_selection";
const GROUP_ID = "pg_g5a_u04_equivalent_mixed_selection_numeric";
const SPEC_IDS = Object.freeze([
  "ps_g5a_u04_equivalent_mixed_selection_whole_numeric",
  "ps_g5a_u04_equivalent_mixed_selection_remainder_numeric",
  "ps_g5a_u04_equivalent_mixed_selection_improper_numerator_numeric",
]);
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f37-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g5a-u04-rank9-equivalent-mixed-selector-projection-p03f37.js",
    publicPath: "modules/curriculum/registry/g5a-u04-rank9-equivalent-mixed-selector-projection-p03f37.js",
    requiredTokens: [SOURCE_ID, KP_ID, GROUP_ID, ...SPEC_IDS, "cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f37.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f37.js",
    requiredTokens: ["public-ui-capability-binding-p03f36.js", "g5a-u04-rank9-equivalent-mixed-selector-projection-p03f37.js", "STRUCTURAL_FALLBACK_AVAILABLE"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g5a-u04-rank9-equivalent-mixed-runtime-p03f37.js",
    publicPath: "modules/curriculum/batch-a/g5a-u04-rank9-equivalent-mixed-runtime-p03f37.js",
    requiredTokens: ["improper_mixed_conversion", "requestedUnknownRole", "P03F_W3DirectProductVerticalSlice037Implementation"],
  },
  {
    repoPath: "site/assets/browser/state/query-state.js",
    publicPath: "assets/browser/state/query-state.js",
    requiredTokens: ["batch-a-selector-p03f37-extension.js", "LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS", "approvedLatestKnowledgePoint"],
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f37.js"],
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

function extractIntegerAnswer(answerText) {
  const matches = [...String(answerText).matchAll(/-?\d+/g)].map((match) => Number(match[0]));
  return matches.length ? matches.at(-1) : null;
}

function validateRenderedPair(prompt, answerText) {
  const text = String(prompt).trim();
  const whole = text.match(/^(\d+)\/(\d+)\s*化成帶分數或整數後，整數部分是多少[？?]$/);
  if (whole) {
    const numerator = Number(whole[1]);
    const denominator = Number(whole[2]);
    const expected = Math.floor(numerator / denominator);
    const actual = extractIntegerAnswer(answerText);
    return { family: "whole", expected, actual, ok: denominator > 0 && actual === expected, integerEquivalenceWitness: numerator % denominator === 0 };
  }

  const remainder = text.match(/^(\d+)\/(\d+)\s*化成帶分數或整數後，分數部分的分子是多少[？?]$/);
  if (remainder) {
    const numerator = Number(remainder[1]);
    const denominator = Number(remainder[2]);
    const expected = numerator % denominator;
    const actual = extractIntegerAnswer(answerText);
    return { family: "remainder", expected, actual, ok: denominator > 0 && expected >= 0 && expected < denominator && actual === expected, integerEquivalenceWitness: expected === 0 };
  }

  const improperInteger = text.match(/^(\d+)\s*=\s*□\/(\d+)，□\s*是多少[？?]$/);
  if (improperInteger) {
    const integer = Number(improperInteger[1]);
    const denominator = Number(improperInteger[2]);
    const expected = integer * denominator;
    const actual = extractIntegerAnswer(answerText);
    return { family: "improperNumerator", expected, actual, ok: denominator > 0 && actual === expected, integerEquivalenceWitness: true };
  }

  const improperMixed = text.match(/^(\d+)又(\d+)\/(\d+)\s*=\s*□\/(\d+)，□\s*是多少[？?]$/);
  if (improperMixed) {
    const integer = Number(improperMixed[1]);
    const remainderValue = Number(improperMixed[2]);
    const denominator = Number(improperMixed[3]);
    const answerDenominator = Number(improperMixed[4]);
    const expected = integer * denominator + remainderValue;
    const actual = extractIntegerAnswer(answerText);
    return {
      family: "improperNumerator",
      expected,
      actual,
      ok: denominator > 0 && remainderValue >= 0 && remainderValue < denominator && answerDenominator === denominator && actual === expected,
      integerEquivalenceWitness: false,
    };
  }

  return { family: "unrecognized", expected: null, actual: extractIntegerAnswer(answerText), ok: false, integerEquivalenceWitness: false };
}

const baseUrl = new URL(argument("base-url", process.env.P03F37_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F37_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F37_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F37_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        assetUrl.searchParams.set("p03f37-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`Slice037 exact Pages deployment not observed: ${lastFailure?.message ?? "unknown"}`);
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
    && selectorState.availabilitySummary.includes("本單元可選知識點：6")
    && selectorState.availabilitySummary.includes("已建立但尚未開放：1")
    && selectorState.availabilitySummary.includes("全部可選：235");
  if (!selectorOk) throw new Error(`Slice037 public selector binding mismatch: ${JSON.stringify(selectorState)}`);

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
    throw new Error(`Slice037 live generation/validator failed: ${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice037 preview iframe did not expose a content frame");
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
  const familyCounts = Object.fromEntries(["whole", "remainder", "improperNumerator"].map((family) => [family, answerChecks.filter((row) => row.family === family).length]));
  const integerEquivalenceWitnessCount = answerChecks.filter((row) => row.integerEquivalenceWitness).length;
  const exactAnswerMismatchCount = answerChecks.filter((row) => !row.ok).length;
  const internalIdLeakage = [KP_ID, GROUP_ID, ...SPEC_IDS].filter((token) => output.allText.includes(token));
  const balanced = Object.values(familyCounts).every((count) => count === 8);

  if (output.questionCount !== QUESTION_COUNT
    || output.answerCount !== QUESTION_COUNT
    || output.questionPageCount !== 3
    || output.answerPageCount !== 3
    || !output.sharedRenderer
    || !balanced
    || integerEquivalenceWitnessCount <= 0
    || exactAnswerMismatchCount !== 0
    || internalIdLeakage.length !== 0) {
    throw new Error(`Slice037 live worksheet/answer mismatch: ${JSON.stringify({ output: { ...output, allText: undefined }, familyCounts, integerEquivalenceWitnessCount, exactAnswerMismatchCount, internalIdLeakage, answerChecks })}`);
  }

  await frame.evaluate(() => {
    window.__P03F37_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P03F37_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F37_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice037 print action did not reach preview frame: ${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F37_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F37_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F37_LIVE_PAGES_WORKSHEET.html"), await frame.content());

  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Slice037 browser diagnostics are not clean: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  const report = {
    schemaName: "P03FSlice037PostMergeMainPagesE2EV1",
    taskId: "P03F_W3DirectProductVerticalSlice037_PostMergeMainPagesE2E",
    status: "PASS_P03F37_POSTMERGE_MAIN_PAGES_E2E",
    exactMergeSha: EXACT_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    liveUrl: liveUrl.href,
    sourceId: SOURCE_ID,
    knowledgePointIds: [KP_ID],
    patternGroupIds: [GROUP_ID],
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
      integerEquivalenceWitnessCount,
      exactAnswerMismatchCount,
      internalIdLeakage,
      sharedRenderer: output.sharedRenderer,
    },
    print: { invocationCount: printInvocationCount },
    browser: { consoleErrorCount: 0, pageErrorCount: 0, requestFailureCount: 0, serverErrorCount: 0 },
    forbiddenScope: { applicationExpansion: false, globalContextExpansion: false, parallelPipeline: false, siblingKnowledgePointPromotion: false, slice038Started: false },
  };
  writeFileSync(resolve(outputDir, "P03F37_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const failure = {
    schemaName: "P03FSlice037PostMergeMainPagesE2EV1",
    taskId: "P03F_W3DirectProductVerticalSlice037_PostMergeMainPagesE2E",
    status: "FAIL_P03F37_POSTMERGE_MAIN_PAGES_E2E",
    exactMergeSha: EXACT_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    liveUrl: liveUrl.href,
    deployment,
    error: error?.stack ?? String(error),
    browser: { consoleErrors, pageErrors, requestFailures, serverErrors },
  };
  writeFileSync(resolve(outputDir, "P03F37_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(failure, null, 2)}\n`);
  if (page) await page.screenshot({ path: resolve(outputDir, "P03F37_LIVE_PAGES_FAILURE.png"), fullPage: true }).catch(() => {});
  console.error(failure.error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
