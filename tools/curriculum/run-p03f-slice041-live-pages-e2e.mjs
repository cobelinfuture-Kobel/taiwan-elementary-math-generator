import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice041-live-pages-e2e");
const EXACT_IMPLEMENTATION_HEAD_SHA = "855dc228e14a846744f2db4aa9f68b8cbd6b6b70";
const EXACT_IMPLEMENTATION_MERGE_SHA = "109c55de6ff7a7d182c3e41f2e76072dc95ce614";
const EXACT_PAGES_RUN_ID = 31955254576;
const SOURCE_ID = "g6b_u01_6b01";
const KP_ID = "kp_g6b_u01_mixed_number_domain_order";
const GROUP_ID = "pg_g6b_u01_mixed_number_domain_order_numeric";
const SPEC_ID = "ps_g6b_u01_mixed_number_domain_order_comparison_numeric";
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f41-postmerge-pages-e2e";
const HIDDEN_SIBLING_IDS = [
  "kp_g6b_u01_mixed_decimal_fraction_add_sub",
  "kp_g6b_u01_mixed_decimal_fraction_mul_div",
  "kp_g6b_u01_mixed_domain_expression",
];

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js",
    publicPath: "modules/curriculum/registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js",
    requiredTokens: [SOURCE_ID, KP_ID, GROUP_ID, SPEC_ID, "cap_mixed_number_domain_normalization"],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f41.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f41.js",
    requiredTokens: ["public-ui-capability-binding-p03f40.js", "batch-a-selector-p03f41-extension.js", "STRUCTURAL_FALLBACK_AVAILABLE"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g6b-u01-rank9-mixed-domain-order-runtime-p03f41.js",
    publicPath: "modules/curriculum/batch-a/g6b-u01-rank9-mixed-domain-order-runtime-p03f41.js",
    requiredTokens: ["exactMixedDomainCompare", "mixed_domain_compare", "P03F_W3DirectProductVerticalSlice041Implementation"],
  },
  {
    repoPath: "site/assets/browser/state/query-state.js",
    publicPath: "assets/browser/state/query-state.js",
    requiredTokens: ["batch-a-selector-p03f41-extension.js", "G6B_U01_SOURCE_ID", "LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS"],
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f41.js"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    publicPath: "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    requiredTokens: ["batch-a-browser-worksheet-p03f41-extension.js", "requestsP03F41"],
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

function normalizeRational(numerator, denominator) {
  if (denominator === 0n) throw new Error("zero denominator");
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const divisor = gcdBigInt(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

function parseRational(text) {
  const value = String(text).trim();
  if (/^-?\d+\/\d+$/.test(value)) {
    const [n, d] = value.split("/").map(BigInt);
    return { ...normalizeRational(n, d), domain: "fraction" };
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    const negative = value.startsWith("-");
    const unsigned = negative ? value.slice(1) : value;
    const [whole, fraction = ""] = unsigned.split(".");
    const denominator = 10n ** BigInt(fraction.length);
    const numerator = BigInt(`${whole}${fraction}` || "0") * (negative ? -1n : 1n);
    return { ...normalizeRational(numerator, denominator), domain: "decimal" };
  }
  throw new Error(`unsupported rational text: ${text}`);
}

function relationSymbol(left, right) {
  const crossLeft = left.numerator * right.denominator;
  const crossRight = right.numerator * left.denominator;
  return crossLeft < crossRight ? "<" : crossLeft > crossRight ? ">" : "=";
}

function validateRenderedPair(prompt, answerText) {
  const match = String(prompt).match(/(-?\d+(?:\.\d+)?|-?\d+\/\d+)\s*○\s*(-?\d+(?:\.\d+)?|-?\d+\/\d+)/u);
  const actual = String(answerText).match(/[<=>]/u)?.[0] ?? null;
  if (!match) return { ok: false, family: "unrecognized", actual };
  try {
    const left = parseRational(match[1]);
    const right = parseRational(match[2]);
    const expected = relationSymbol(left, right);
    return {
      ok: actual === expected && left.domain !== right.domain,
      family: "mixed_domain_compare",
      leftText: match[1],
      rightText: match[2],
      leftDomain: left.domain,
      rightDomain: right.domain,
      orientation: `${left.domain}_left`,
      expected,
      actual,
    };
  } catch (error) {
    return { ok: false, family: "parse_error", actual, error: String(error) };
  }
}

const baseUrl = new URL(argument("base-url", process.env.P03F41_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F41_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F41_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F41_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        assetUrl.searchParams.set("p03f41-sha", expectedSha256.slice(0, 16));
        const liveText = await fetchText(assetUrl);
        const liveSha256 = sha256(liveText);
        const missingTokens = contract.requiredTokens.filter((token) => !liveText.includes(token));
        if (liveSha256 !== expectedSha256 || missingTokens.length > 0) {
          throw new Error(`${contract.publicPath} deployment mismatch expected=${expectedSha256} actual=${liveSha256} missing=${missingTokens.join(",")}`);
        }
        assets.push({
          repoPath: contract.repoPath,
          publicUrl: new URL(contract.publicPath, baseUrl).href,
          expectedSha256,
          liveSha256,
          missingTokenCount: 0,
        });
      }
      return { attempt, assets };
    } catch (error) {
      lastFailure = error;
      if (attempt < deploymentRetryCount) await sleep(deploymentRetryDelayMs);
    }
  }
  throw new Error(`Slice041 exact Pages deployment not observed: ${lastFailure?.message ?? "unknown"}`);
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
    const patternGroupSelectionMode = groupState === "true" ? "visible-controls" : groupState == null && groupQueryMatches ? "auto-applied-by-kp" : "unresolved";
    return {
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
    && selectorState.answerKey
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
    && selectorState.availabilitySummary.includes("全部可選：239");
  if (!selectorOk) throw new Error(`Slice041 public selector binding mismatch: ${JSON.stringify(selectorState)}`);

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
    previewSrcdocLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printButtonDisabled: Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if (!generationState.statusText.includes(`已產生 ${QUESTION_COUNT} 題`)
    || generationState.statusTone !== "success"
    || generationState.validationHasErrors !== "false"
    || !generationState.validationText.includes("驗證通過")
    || generationState.previewSrcdocLength <= 0
    || generationState.printButtonDisabled) {
    throw new Error(`Slice041 live generation/validator failed: ${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice041 preview iframe did not expose a content frame");
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const output = await frame.evaluate(() => {
    const questionCells = [...document.querySelectorAll(".worksheet-cell--question")];
    const answerCells = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    return {
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

  const answerChecks = output.questionPrompts.map((prompt, index) => validateRenderedPair(prompt, output.answerTexts[index]));
  const exactAnswerMismatchCount = answerChecks.filter((row) => !row.ok).length;
  const relationCounts = { lessThan: 0, equal: 0, greaterThan: 0 };
  const orientationCounts = { decimalLeft: 0, fractionLeft: 0 };
  for (const row of answerChecks) {
    if (row.actual === "<") relationCounts.lessThan += 1;
    if (row.actual === "=") relationCounts.equal += 1;
    if (row.actual === ">") relationCounts.greaterThan += 1;
    if (row.orientation === "decimal_left") orientationCounts.decimalLeft += 1;
    if (row.orientation === "fraction_left") orientationCounts.fractionLeft += 1;
  }
  const duplicatePromptCount = output.questionPrompts.length - new Set(output.questionPrompts).size;
  const internalIdLeakage = [SOURCE_ID, KP_ID, GROUP_ID, SPEC_ID, ...HIDDEN_SIBLING_IDS, "P03F41"]
    .filter((token) => output.allText.includes(token));
  const semanticScopeFindingCount = answerChecks.filter((row) => row.family !== "mixed_domain_compare" || row.leftDomain === row.rightDomain).length;

  if (output.questionCount !== QUESTION_COUNT
    || output.answerCount !== QUESTION_COUNT
    || output.questionPageCount !== 3
    || output.answerPageCount !== 3
    || exactAnswerMismatchCount !== 0
    || semanticScopeFindingCount !== 0
    || relationCounts.lessThan !== 8
    || relationCounts.equal !== 8
    || relationCounts.greaterThan !== 8
    || orientationCounts.decimalLeft !== 12
    || orientationCounts.fractionLeft !== 12
    || duplicatePromptCount !== 0
    || internalIdLeakage.length !== 0) {
    throw new Error(`Slice041 live worksheet/answer mismatch: ${JSON.stringify({ output, exactAnswerMismatchCount, semanticScopeFindingCount, relationCounts, orientationCounts, duplicatePromptCount, internalIdLeakage, answerChecks })}`);
  }

  await frame.evaluate(() => {
    window.__P03F41_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P03F41_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F41_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice041 print action did not reach preview frame: ${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F41_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F41_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F41_LIVE_PAGES_WORKSHEET.html"), await frame.content());

  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Slice041 browser diagnostics failed: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  const report = {
    schemaName: "P03FSlice041PostMergeMainPagesE2EReportV1",
    taskId: "P03F_W3DirectProductVerticalSlice041PostMergeMainPagesE2E",
    status: "PASS_P03F41_POSTMERGE_MAIN_PAGES_E2E",
    implementationHeadSha: EXACT_IMPLEMENTATION_HEAD_SHA,
    implementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    baseUrl: baseUrl.href,
    liveUrl: liveUrl.href,
    deploymentAttempt: deployment.attempt,
    deployedAssetCount: deployment.assets.length,
    deployedAssets: deployment.assets,
    deployedAssetShaMismatchCount: deployment.assets.filter((row) => row.expectedSha256 !== row.liveSha256).length,
    sourceId: SOURCE_ID,
    knowledgePointId: KP_ID,
    patternGroupId: GROUP_ID,
    patternSpecId: SPEC_ID,
    publicSourceCount: 33,
    visibleKnowledgePointCount: 239,
    sourceVisibleKnowledgePointCount: 2,
    sourceHiddenKnowledgePointCount: 3,
    sourceNotSelectableKnowledgePointCount: 3,
    selectorState,
    generationState,
    questionCount: output.questionCount,
    answerCount: output.answerCount,
    questionPageCount: output.questionPageCount,
    answerPageCount: output.answerPageCount,
    relationCounts,
    orientationCounts,
    exactAnswerMismatchCount,
    semanticScopeFindingCount,
    duplicatePromptCount,
    internalIdLeakageCount: internalIdLeakage.length,
    printInvocationCount,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    requestFailureCount: requestFailures.length,
    serverErrorCount: serverErrors.length,
    sharedP03F32ExactRationalNormalizer: true,
    sharedRenderer: output.sharedRenderer,
    patternGroupSelectionMode: selectorState.patternGroupSelectionMode,
    applicationExpansion: false,
    globalContextExpansion: false,
    arithmeticExpansion: false,
    parallelPipeline: false,
    siblingKnowledgePointPromotion: false,
    slice042Started: false,
  };
  writeFileSync(resolve(outputDir, "p03f-slice041-postmerge-main-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P03F41_POSTMERGE_MAIN_PAGES_E2E=${JSON.stringify(report)}`);
} finally {
  if (browser) await browser.close();
}
