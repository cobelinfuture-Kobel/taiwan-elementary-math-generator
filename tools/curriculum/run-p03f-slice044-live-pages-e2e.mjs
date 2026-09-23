import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice044-live-pages-e2e");
const EXACT_IMPLEMENTATION_HEAD_SHA = "ba6ead551f67edef74c14ae4f41e156d89c437d2";
const EXACT_IMPLEMENTATION_MERGE_SHA = "3db2a0255a45e8242a921ba156aa6892ebc43a58";
const SOURCE_ID = "g5a_u01_5a01";
const ROUND_KP_ID = "kp_g5a_u01_decimal_round_estimate";
const MISSING_KP_ID = "kp_g5a_u01_missing_digit_inequality";
const HIDDEN_INVERSE_KP_ID = "kp_g5a_u01_inverse_rounding_range";
const ROUND_GROUP_ID = "pg_g5a_u01_decimal_round_estimate_numeric";
const MISSING_GROUP_ID = "pg_g5a_u01_missing_digit_inequality_numeric";
const ROUNDED_SPEC_ID = "ps_g5a_u01_decimal_round_estimate_rounded_numeric";
const ESTIMATE_SPEC_ID = "ps_g5a_u01_decimal_round_estimate_estimate_numeric";
const MISSING_SPEC_ID = "ps_g5a_u01_missing_digit_inequality_possible_digits_numeric";
const HIDDEN_APPLICATION_SPEC_IDS = Object.freeze([
  "ps_g5a_u01_decimal_round_estimate_rounded_application",
  "ps_g5a_u01_decimal_round_estimate_estimate_application",
]);
const KP_IDS = Object.freeze([ROUND_KP_ID, MISSING_KP_ID]);
const GROUP_IDS = Object.freeze([ROUND_GROUP_ID, MISSING_GROUP_ID]);
const SPEC_IDS = Object.freeze([ROUNDED_SPEC_ID, ESTIMATE_SPEC_ID, MISSING_SPEC_ID]);
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f44-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g5a-u01-rank10-decimal-selector-projection-p03f44.js",
    publicPath: "modules/curriculum/registry/g5a-u01-rank10-decimal-selector-projection-p03f44.js",
    requiredTokens: ["P03F_W3DirectProductVerticalSlice044Implementation", ...KP_IDS, ...GROUP_IDS, ...SPEC_IDS, HIDDEN_INVERSE_KP_ID, "cap_decimal_domain_validator", "cap_decimal_number_system"],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f44.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f44.js",
    requiredTokens: ["public-ui-capability-binding-p03f43.js", "batch-a-selector-p03f44-extension.js"],
    forbiddenTokens: ["p03f45"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g5a-u01-rank10-decimal-runtime-p03f44.js",
    publicPath: "modules/curriculum/batch-a/g5a-u01-rank10-decimal-runtime-p03f44.js",
    requiredTokens: ["P03F_W3DirectProductVerticalSlice044Implementation", "round_estimate", "missing_digit_inequality", "possibleDigits"],
  },
  {
    repoPath: "site/assets/browser/state/query-state.js",
    publicPath: "assets/browser/state/query-state.js",
    requiredTokens: ["batch-a-selector-p03f44-extension.js", "LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS"],
    forbiddenTokens: ["p03f45"],
  },
  {
    repoPath: "site/assets/browser/state/public-pattern-group-selection.js",
    publicPath: "assets/browser/state/public-pattern-group-selection.js",
    requiredTokens: ["batch-a-selector-p03f44-extension.js"],
    forbiddenTokens: ["p03f45"],
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f44.js"],
    forbiddenTokens: ["p03f45"],
  },
  {
    repoPath: "site/pixel/pixel-registry-bridge.js",
    publicPath: "pixel/pixel-registry-bridge.js",
    requiredTokens: ["batch-a-selector-p03f44-extension.js"],
    forbiddenTokens: ["p03f45"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    publicPath: "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    requiredTokens: ["batch-a-browser-worksheet-p03f44-extension.js"],
    forbiddenTokens: ["p03f45"],
  },
];

const argument = (name, fallback) => {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const repoPath = (path) => resolve(ROOT, path);
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const pow10 = (n) => 10n ** BigInt(n);

function parseDecimal(text) {
  const match = String(text ?? "").trim().match(/^(-?)(\d+)(?:\.(\d+))?$/u);
  if (!match) throw new Error(`invalid decimal:${text}`);
  const fraction = match[3] ?? "";
  const sign = match[1] === "-" ? -1n : 1n;
  return {
    scaled: sign * BigInt(`${match[2]}${fraction}`),
    decimals: fraction.length,
  };
}

function formatScaled(scaled, decimals) {
  const sign = scaled < 0n ? "-" : "";
  const value = scaled < 0n ? -scaled : scaled;
  const factor = pow10(decimals);
  const whole = value / factor;
  const fraction = String(value % factor).padStart(decimals, "0");
  return decimals ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
}

function roundDecimal(text, targetDecimals) {
  const parsed = parseDecimal(text);
  if (parsed.decimals <= targetDecimals) {
    const scaled = parsed.scaled * pow10(targetDecimals - parsed.decimals);
    return { scaled, text: formatScaled(scaled, targetDecimals) };
  }
  const divisor = pow10(parsed.decimals - targetDecimals);
  const magnitude = parsed.scaled < 0n ? -parsed.scaled : parsed.scaled;
  const roundedMagnitude = (magnitude + divisor / 2n) / divisor;
  const scaled = parsed.scaled < 0n ? -roundedMagnitude : roundedMagnitude;
  return { scaled, text: formatScaled(scaled, targetDecimals) };
}

function compareDecimalText(leftText, rightText) {
  const left = parseDecimal(leftText);
  const right = parseDecimal(rightText);
  const scale = Math.max(left.decimals, right.decimals);
  const leftScaled = left.scaled * pow10(scale - left.decimals);
  const rightScaled = right.scaled * pow10(scale - right.decimals);
  return leftScaled < rightScaled ? -1 : leftScaled > rightScaled ? 1 : 0;
}

function verifyRenderedPair(prompt, answerText, patternId) {
  const cleanPrompt = String(prompt ?? "").trim();
  const cleanAnswer = String(answerText ?? "").trim();
  if (patternId === ROUNDED_SPEC_ID) {
    const match = cleanPrompt.match(/^把\s*(-?\d+(?:\.\d+)?)\s*用四捨五入法取到小數第\s*(\d+)\s*位。?$/u);
    if (!match) return { ok: false, family: "rounded", reason: "rounded_prompt_parse" };
    const expected = roundDecimal(match[1], Number(match[2])).text;
    return { ok: cleanAnswer === expected, family: "rounded", expected, actual: cleanAnswer };
  }
  if (patternId === ESTIMATE_SPEC_ID) {
    const match = cleanPrompt.match(/^先把\s*(-?\d+(?:\.\d+)?)\s*和\s*(-?\d+(?:\.\d+)?)\s*都四捨五入到小數第\s*(\d+)\s*位，再估算(加法|減法)結果。?$/u);
    if (!match) return { ok: false, family: "estimate", reason: "estimate_prompt_parse" };
    const decimals = Number(match[3]);
    const left = roundDecimal(match[1], decimals).scaled;
    const right = roundDecimal(match[2], decimals).scaled;
    const expectedScaled = match[4] === "加法" ? left + right : left - right;
    const expected = formatScaled(expectedScaled, decimals);
    return { ok: cleanAnswer === expected, family: "estimate", operation: match[4] === "加法" ? "add" : "sub", expected, actual: cleanAnswer };
  }
  if (patternId === MISSING_SPEC_ID) {
    const match = cleanPrompt.match(/^([0-9.]*□[0-9.]*)\s*([<>])\s*(-?\d+(?:\.\d+)?)，□\s*可以填哪些數字？$/u);
    if (!match) return { ok: false, family: "missing_digit", reason: "missing_prompt_parse" };
    const possible = Array.from({ length: 10 }, (_, digit) => digit).filter((digit) => {
      const left = match[1].replace("□", String(digit));
      const comparison = compareDecimalText(left, match[3]);
      return match[2] === "<" ? comparison < 0 : comparison > 0;
    });
    const expected = possible.join("、");
    return { ok: possible.length > 0 && possible.length < 10 && cleanAnswer === expected, family: "missing_digit", expected, actual: cleanAnswer, possibleDigits: possible };
  }
  return { ok: false, family: "unexpected", reason: `unexpected_pattern:${patternId}` };
}

const baseUrl = new URL(argument("base-url", process.env.P03F44_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F44_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F44_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F44_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        assetUrl.searchParams.set("p03f44-sha", expectedSha256.slice(0, 16));
        const liveText = await fetchText(assetUrl);
        const liveSha256 = sha256(liveText);
        const missingTokens = (contract.requiredTokens ?? []).filter((token) => !liveText.includes(token));
        const forbiddenTokens = (contract.forbiddenTokens ?? []).filter((token) => liveText.includes(token));
        if (liveSha256 !== expectedSha256 || missingTokens.length || forbiddenTokens.length) {
          throw new Error(`${contract.publicPath} deployment mismatch expected=${expectedSha256} actual=${liveSha256} missing=${missingTokens.join(",")} forbidden=${forbiddenTokens.join(",")}`);
        }
        assets.push({ repoPath: contract.repoPath, publicUrl: new URL(contract.publicPath, baseUrl).href, expectedSha256, liveSha256, missingTokenCount: 0, forbiddenTokenCount: 0 });
      }
      return { attempt, assets };
    } catch (error) {
      lastFailure = error;
      if (attempt < deploymentRetryCount) await sleep(deploymentRetryDelayMs);
    }
  }
  throw new Error(`Slice044 exact Pages deployment not observed:${lastFailure?.message ?? "unknown"}`);
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
let diagnosticContext = {};

try {
  deployment = await waitForExactDeployment();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push({ url: request.url(), errorText: request.failure()?.errorText ?? "unknown" }));
  page.on("response", (response) => { if (response.status() >= 500) serverErrors.push({ url: response.url(), status: response.status() }); });

  const mainResponse = await page.goto(liveUrl.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!mainResponse?.ok()) throw new Error(`Live Pages main response failed:${mainResponse?.status() ?? "no-response"}`);
  await page.waitForFunction(() => document.querySelector("#batch-a-source-select")?.options?.length > 0, null, { timeout: 120000 });
  await page.waitForFunction(({ sourceId, kpIds }) => document.querySelector("#batch-a-source-select")?.value === sourceId
    && kpIds.every((kpId) => document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected === "true"),
  { sourceId: SOURCE_ID, kpIds: KP_IDS }, { timeout: 120000 });

  const selectorState = await page.evaluate(async ({ sourceId, kpIds, groupIds, inverseKpId }) => {
    const params = new URL(location.href).searchParams;
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f44-e2e", String(Date.now()));
    const registryModule = await import(registryUrl.href);
    const registry = registryModule.getCurrentPixelRegistrySnapshot();
    const sourceSummary = registry.bySourceId[sourceId];
    const kpState = Object.fromEntries(kpIds.map((id) => [id, document.querySelector(`[data-knowledge-point-id="${id}"]`)?.dataset?.selected ?? null]));
    const groupState = Object.fromEntries(groupIds.map((id) => [id, document.querySelector(`[data-pattern-group-id="${id}"]`)?.dataset?.selected ?? null]));
    const groupQueryMatches = groupIds.every((id) => params.getAll("pg").includes(id));
    const patternGroupSelectionMode = Object.values(groupState).every((value) => value === "true")
      ? "visible-controls"
      : Object.values(groupState).every((value) => value == null) && groupQueryMatches
        ? "auto-applied-by-kp"
        : "unresolved";
    return {
      sourceMatches: document.querySelector("#batch-a-source-select")?.value === sourceId,
      selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
      questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
      ordering: document.querySelector("#batch-a-ordering-select")?.value ?? null,
      answerKey: Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),
      generationSeed: document.querySelector("#generation-seed-input")?.value ?? null,
      columns: document.querySelector("#columns-input")?.value ?? null,
      rowsPerPage: document.querySelector("#rows-per-page-input")?.value ?? null,
      kpStates: kpState,
      groupStates: groupState,
      kpQueryMatches: kpIds.every((id) => params.getAll("kp").includes(id)),
      groupQueryMatches,
      patternGroupSelectionMode,
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      publicCapabilityVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      inverseKpVisibleInDom: document.querySelector(`[data-knowledge-point-id="${inverseKpId}"]`)?.dataset?.selected != null,
      publicSourceCount: registry.sourceCount,
      visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
      sourceVisibleKnowledgePointCount: sourceSummary?.visibleKnowledgePoints?.length ?? 0,
      sourceHiddenKnowledgePointCount: sourceSummary?.hiddenPendingCount ?? 0,
      sourceNotSelectableKnowledgePointCount: sourceSummary?.notSelectableCount ?? 0,
    };
  }, { sourceId: SOURCE_ID, kpIds: KP_IDS, groupIds: GROUP_IDS, inverseKpId: HIDDEN_INVERSE_KP_ID });

  const selectorOk = selectorState.sourceMatches
    && selectorState.selectionMode === "mixedKnowledgePointsSameUnit"
    && selectorState.questionCount === String(QUESTION_COUNT)
    && selectorState.ordering === "groupedByPattern"
    && selectorState.answerKey
    && selectorState.generationSeed === GENERATION_SEED
    && selectorState.columns === "2"
    && selectorState.rowsPerPage === "4"
    && Object.values(selectorState.kpStates).every((value) => value === "true")
    && selectorState.kpQueryMatches
    && selectorState.groupQueryMatches
    && ["visible-controls", "auto-applied-by-kp"].includes(selectorState.patternGroupSelectionMode)
    && selectorState.questionMode === "numeric"
    && selectorState.publicCapabilityVisible === "true"
    && !selectorState.inverseKpVisibleInDom
    && selectorState.publicSourceCount === 33
    && selectorState.visibleKnowledgePointCount === 245
    && selectorState.sourceVisibleKnowledgePointCount === 7
    && selectorState.sourceHiddenKnowledgePointCount === 1
    && selectorState.sourceNotSelectableKnowledgePointCount === 0;
  if (!selectorOk) throw new Error(`Slice044 public selector binding mismatch:${JSON.stringify(selectorState)}`);

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
    throw new Error(`Slice044 live generation/validator failed:${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice044 preview iframe did not expose a content frame");
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const output = await frame.evaluate(() => {
    const questionCells = [...document.querySelectorAll(".worksheet-cell--question")];
    const answerCells = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    const row = (cell) => ({
      questionId: cell.dataset.questionId ?? null,
      patternId: cell.dataset.patternId ?? null,
      prompt: cell.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? "",
      answerText: cell.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? "",
    });
    return {
      questionCount: questionCells.length,
      answerCount: answerCells.length,
      questionPageCount: document.querySelectorAll(".worksheet-page--questions").length,
      answerPageCount: document.querySelectorAll(".worksheet-page--answer-key").length,
      questionRows: questionCells.map(row),
      answerRows: answerCells.map(row),
      sharedRenderer: document.querySelector(".worksheet-document") !== null,
      allText: document.body?.innerText ?? "",
    };
  });

  const checks = output.questionRows.map((question, index) => {
    const answer = output.answerRows[index];
    const verified = verifyRenderedPair(question.prompt, answer?.answerText ?? "", question.patternId);
    return {
      index,
      patternId: question.patternId,
      ok: Boolean(answer)
        && answer.questionId === question.questionId
        && answer.patternId === question.patternId
        && answer.prompt === question.prompt
        && verified.ok,
      ...verified,
    };
  });
  const patternCounts = Object.fromEntries(SPEC_IDS.map((id) => [id, output.questionRows.filter((row) => row.patternId === id).length]));
  const familyCounts = {
    rounded: checks.filter((row) => row.family === "rounded").length,
    estimate: checks.filter((row) => row.family === "estimate").length,
    missingDigit: checks.filter((row) => row.family === "missing_digit").length,
  };
  const operationCounts = {
    add: checks.filter((row) => row.operation === "add").length,
    sub: checks.filter((row) => row.operation === "sub").length,
  };
  const exactAnswerMismatchCount = checks.filter((row) => !row.ok).length;
  const duplicateProblemCount = output.questionRows.length - new Set(output.questionRows.map((row) => `${row.patternId}|${row.prompt}`)).size;
  const unexpectedPatternCount = output.questionRows.filter((row) => !SPEC_IDS.includes(row.patternId)).length;
  const forbiddenVisibleTokens = [SOURCE_ID, ...KP_IDS, ...GROUP_IDS, ...SPEC_IDS, ...HIDDEN_APPLICATION_SPEC_IDS, HIDDEN_INVERSE_KP_ID, "P03F44", "p03f45", "p03f48"]
    .filter((token) => output.allText.includes(token));

  diagnosticContext = { deployment, selectorState, generationState, output, checks, patternCounts, familyCounts, operationCounts, exactAnswerMismatchCount, duplicateProblemCount, unexpectedPatternCount, forbiddenVisibleTokens };
  writeFileSync(resolve(outputDir, "p03f-slice044-live-pages-e2e-diagnostic.json"), `${JSON.stringify(diagnosticContext, null, 2)}\n`);

  if (output.questionCount !== QUESTION_COUNT
      || output.answerCount !== QUESTION_COUNT
      || output.questionPageCount !== 3
      || output.answerPageCount !== 3
      || patternCounts[ROUNDED_SPEC_ID] !== 8
      || patternCounts[ESTIMATE_SPEC_ID] !== 8
      || patternCounts[MISSING_SPEC_ID] !== 8
      || familyCounts.rounded !== 8
      || familyCounts.estimate !== 8
      || familyCounts.missingDigit !== 8
      || operationCounts.add !== 4
      || operationCounts.sub !== 4
      || exactAnswerMismatchCount !== 0
      || duplicateProblemCount !== 0
      || unexpectedPatternCount !== 0
      || forbiddenVisibleTokens.length !== 0) {
    throw new Error(`Slice044 live worksheet/answer mismatch:${JSON.stringify(diagnosticContext)}`);
  }

  await frame.evaluate(() => {
    window.__P03F44_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P03F44_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F44_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice044 print action did not reach preview frame:${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F44_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F44_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F44_LIVE_PAGES_WORKSHEET.html"), await frame.content());
  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Slice044 browser diagnostics failed:${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  const report = {
    schemaName: "P03FSlice044PostMergeMainPagesE2EReportV1",
    taskId: "P03F_W3DirectProductVerticalSlice044PostMergeMainPagesE2E",
    status: "PASS_P03F44_POSTMERGE_MAIN_PAGES_E2E",
    implementationHeadSha: EXACT_IMPLEMENTATION_HEAD_SHA,
    implementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA,
    baseUrl: baseUrl.href,
    liveUrl: liveUrl.href,
    deploymentAttempt: deployment.attempt,
    deployedAssetCount: deployment.assets.length,
    deployedAssets: deployment.assets,
    deployedAssetShaMismatchCount: deployment.assets.filter((row) => row.expectedSha256 !== row.liveSha256).length,
    sourceId: SOURCE_ID,
    knowledgePointIds: KP_IDS,
    patternGroupIds: GROUP_IDS,
    patternSpecIds: SPEC_IDS,
    publicSourceCount: selectorState.publicSourceCount,
    visibleKnowledgePointCount: selectorState.visibleKnowledgePointCount,
    sourceVisibleKnowledgePointCount: selectorState.sourceVisibleKnowledgePointCount,
    sourceHiddenKnowledgePointCount: selectorState.sourceHiddenKnowledgePointCount,
    sourceNotSelectableKnowledgePointCount: selectorState.sourceNotSelectableKnowledgePointCount,
    selectorState,
    generationState,
    questionCount: output.questionCount,
    answerCount: output.answerCount,
    questionPageCount: output.questionPageCount,
    answerPageCount: output.answerPageCount,
    patternCounts,
    familyCounts,
    operationCounts,
    exactAnswerMismatchCount,
    unexpectedPatternCount,
    duplicateProblemCount,
    internalIdLeakageCount: forbiddenVisibleTokens.length,
    printInvocationCount,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    requestFailureCount: requestFailures.length,
    serverErrorCount: serverErrors.length,
    sharedRenderer: output.sharedRenderer,
    patternGroupSelectionMode: selectorState.patternGroupSelectionMode,
    applicationExpansion: false,
    globalContextExpansion: false,
    decimalArithmeticCapabilityExpansion: false,
    inverseRoundingRangeExpansion: false,
    parallelPipeline: false,
    siblingKnowledgePointPromotion: false,
    slice045Started: false,
    slice048Started: false,
  };
  writeFileSync(resolve(outputDir, "p03f-slice044-postmerge-main-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P03F44_POSTMERGE_MAIN_PAGES_E2E=${JSON.stringify(report)}`);
} catch (error) {
  writeFileSync(resolve(outputDir, "P03F44_LIVE_PAGES_FAILURE.json"), `${JSON.stringify({ status: "FAIL", error: String(error), implementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA, diagnosticContext, consoleErrors, pageErrors, requestFailures, serverErrors }, null, 2)}\n`);
  throw error;
} finally {
  if (browser) await browser.close();
}
