import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice038-live-pages-e2e");
const EXACT_MERGE_SHA = "f7e7888881aaff1b926905021db53a3b7e1542bd";
const EXACT_PAGES_RUN_ID = 31878384810;
const SOURCE_ID = "g5a_u06_5a06";
const KP_ID = "kp_g5a_u06_mixed_improper_add_sub";
const GROUP_ID = "pg_g5a_u06_mixed_improper_add_sub_numeric";
const SPEC_ID = "ps_g5a_u06_mixed_improper_add_sub_result_numeric";
const HIDDEN_APPLICATION_SPEC_ID = "ps_g5a_u06_mixed_improper_add_sub_result_application";
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f38-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g5a-u06-rank9-mixed-improper-add-sub-selector-projection-p03f38.js",
    publicPath: "modules/curriculum/registry/g5a-u06-rank9-mixed-improper-add-sub-selector-projection-p03f38.js",
    requiredTokens: [SOURCE_ID, KP_ID, GROUP_ID, SPEC_ID, HIDDEN_APPLICATION_SPEC_ID, "cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f38.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f38.js",
    requiredTokens: ["public-ui-capability-binding-p03f37.js", "g5a-u06-rank9-mixed-improper-add-sub-selector-projection-p03f38.js", "STRUCTURAL_FALLBACK_AVAILABLE"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g5a-u06-rank9-mixed-improper-add-sub-runtime-p03f38.js",
    publicPath: "modules/curriculum/batch-a/g5a-u06-rank9-mixed-improper-add-sub-runtime-p03f38.js",
    requiredTokens: ["fraction_add_sub", "P03F_W3DirectProductVerticalSlice038Implementation", KP_ID, SPEC_ID],
  },
  {
    repoPath: "site/assets/browser/state/query-state.js",
    publicPath: "assets/browser/state/query-state.js",
    requiredTokens: ["batch-a-selector-p03f38-extension.js", "G5A_U06_SOURCE_ID", "LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS"],
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f38.js"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    publicPath: "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    requiredTokens: ["batch-a-browser-worksheet-p03f38-extension.js"],
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

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

function normalizeRational(numerator, denominator) {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator === 0) return null;
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator * sign / divisor, denominator: Math.abs(denominator) / divisor };
}

function parseOperand(text) {
  const value = String(text).trim();
  let match = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (match) {
    const whole = Number(match[1]);
    const numerator = Number(match[2]);
    const denominator = Number(match[3]);
    return denominator > 0 && numerator >= 0 && numerator < denominator
      ? { kind: "mixed", numerator: whole * denominator + numerator, denominator }
      : null;
  }
  match = value.match(/^(\d+)\/(\d+)$/);
  if (match) {
    const numerator = Number(match[1]);
    const denominator = Number(match[2]);
    return denominator > 0 ? { kind: "improper", numerator, denominator } : null;
  }
  match = value.match(/^(\d+)$/);
  if (match) return { kind: "integer", numerator: Number(match[1]), denominator: 1 };
  return null;
}

function extractAnswerValue(text) {
  const value = String(text).trim();
  const fraction = value.match(/(-?\d+)\s*\/\s*(\d+)\s*$/);
  if (fraction) return normalizeRational(Number(fraction[1]), Number(fraction[2]));
  const integer = value.match(/(-?\d+)\s*$/);
  if (integer) return { numerator: Number(integer[1]), denominator: 1 };
  return null;
}

function validateRenderedPair(prompt, answerText) {
  const match = String(prompt).trim().match(/^(.+?)\s*([+−-])\s*(.+?)\s*=\s*[?？]$/);
  if (!match) return { ok: false, operation: "unrecognized", leftKind: "unrecognized", rightKind: "unrecognized", expected: null, actual: null };
  const left = parseOperand(match[1]);
  const right = parseOperand(match[3]);
  if (!left || !right) return { ok: false, operation: "unrecognized", leftKind: left?.kind ?? "unrecognized", rightKind: right?.kind ?? "unrecognized", expected: null, actual: extractAnswerValue(answerText) };
  const operation = match[2] === "+" ? "add" : "sub";
  const rawNumerator = operation === "add"
    ? left.numerator * right.denominator + right.numerator * left.denominator
    : left.numerator * right.denominator - right.numerator * left.denominator;
  const expected = normalizeRational(rawNumerator, left.denominator * right.denominator);
  const actual = extractAnswerValue(answerText);
  return {
    ok: Boolean(expected && actual && expected.numerator === actual.numerator && expected.denominator === actual.denominator),
    operation,
    leftKind: left.kind,
    rightKind: right.kind,
    expected,
    actual,
  };
}

const baseUrl = new URL(argument("base-url", process.env.P03F38_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F38_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F38_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F38_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        assetUrl.searchParams.set("p03f38-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`Slice038 exact Pages deployment not observed: ${lastFailure?.message ?? "unknown"}`);
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
    return source === sourceId && selected;
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
    && selectorState.availabilitySummary.includes("本單元可選知識點：5")
    && selectorState.availabilitySummary.includes("已建立但尚未開放：2")
    && selectorState.availabilitySummary.includes("全部可選：236");
  if (!selectorOk) throw new Error(`Slice038 public selector binding mismatch: ${JSON.stringify(selectorState)}`);

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
    throw new Error(`Slice038 live generation/validator failed: ${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice038 preview iframe did not expose a content frame");
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
  const operationCounts = Object.fromEntries(["add", "sub"].map((operation) => [operation, answerChecks.filter((row) => row.operation === operation).length]));
  const representationCounts = Object.fromEntries(["mixed", "improper", "integer"].map((kind) => [kind, answerChecks.filter((row) => row.leftKind === kind || row.rightKind === kind).length]));
  const representationPairCounts = {};
  for (const row of answerChecks) {
    const key = `${row.leftKind}->${row.rightKind}`;
    representationPairCounts[key] = (representationPairCounts[key] ?? 0) + 1;
  }
  const exactAnswerMismatchCount = answerChecks.filter((row) => !row.ok).length;
  const duplicatePromptCount = output.questionPrompts.length - new Set(output.questionPrompts).size;
  const internalIdLeakage = [KP_ID, GROUP_ID, SPEC_ID, HIDDEN_APPLICATION_SPEC_ID].filter((token) => output.allText.includes(token));

  if (output.questionCount !== QUESTION_COUNT
    || output.answerCount !== QUESTION_COUNT
    || output.questionPageCount !== 3
    || output.answerPageCount !== 3
    || !output.sharedRenderer
    || operationCounts.add !== 12
    || operationCounts.sub !== 12
    || Object.values(representationCounts).some((count) => count <= 0)
    || exactAnswerMismatchCount !== 0
    || duplicatePromptCount !== 0
    || internalIdLeakage.length !== 0) {
    throw new Error(`Slice038 live worksheet/answer mismatch: ${JSON.stringify({ output: { ...output, allText: undefined }, operationCounts, representationCounts, representationPairCounts, exactAnswerMismatchCount, duplicatePromptCount, internalIdLeakage, answerChecks })}`);
  }

  await frame.evaluate(() => {
    window.__P03F38_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P03F38_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F38_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice038 print action did not reach preview frame: ${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F38_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F38_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F38_LIVE_PAGES_WORKSHEET.html"), await frame.content());

  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Slice038 browser diagnostics failed: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  const report = {
    schemaName: "P03FSlice038PostMergeMainPagesE2EV1",
    taskId: "P03F_W3DirectProductVerticalSlice038_PostMergeMainPagesE2E",
    status: "PASS_P03F38_POSTMERGE_MAIN_PAGES_E2E",
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
      operationCounts,
      representationCounts,
      representationPairCounts,
      exactAnswerMismatchCount,
      duplicatePromptCount,
      internalIdLeakage,
      sharedRenderer: output.sharedRenderer,
      patternGroupSelectionMode: selectorState.patternGroupSelectionMode,
    },
    print: { invocationCount: printInvocationCount },
    browser: { consoleErrorCount: 0, pageErrorCount: 0, requestFailureCount: 0, serverErrorCount: 0 },
    forbiddenScope: { applicationExpansion: false, globalContextExpansion: false, parallelPipeline: false, siblingKnowledgePointPromotion: false, slice039Started: false },
  };
  writeFileSync(resolve(outputDir, "P03F38_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P03F38_POSTMERGE_MAIN_PAGES_E2E=${JSON.stringify(report)}`);
} finally {
  if (browser) await browser.close();
}
