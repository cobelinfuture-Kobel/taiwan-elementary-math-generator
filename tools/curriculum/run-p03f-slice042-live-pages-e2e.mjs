import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice042-live-pages-e2e");
const EXACT_IMPLEMENTATION_HEAD_SHA = "e7b8808df6c1d7982bd1327211cc25cdadf7701b";
const EXACT_IMPLEMENTATION_MERGE_SHA = "f7ccdde3a661aa131445884ea25c7dea87e7539e";
const EXACT_PAGES_RUN_ID = 31983281031;
const SOURCE_ID = "g4b_u06_4b06";
const KP_ID = "kp_g4b_u06_decimal_number_line";
const GROUP_ID = "pg_g4b_u06_decimal_number_line_numeric";
const SPEC_ID = "ps_g4b_u06_decimal_number_line_distance_numeric";
const HIDDEN_SIBLING_ID = "kp_g4b_u06_infer_decimal_product";
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f42-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g4b-u06-rank10-decimal-number-line-selector-projection-p03f42.js",
    publicPath: "modules/curriculum/registry/g4b-u06-rank10-decimal-number-line-selector-projection-p03f42.js",
    requiredTokens: [SOURCE_ID, KP_ID, GROUP_ID, SPEC_ID, "cap_number_line_representation"],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f42.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f42.js",
    requiredTokens: ["public-ui-capability-binding-p03f41.js", "batch-a-selector-p03f42-extension.js"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g4b-u06-rank10-decimal-number-line-runtime-p03f42.js",
    publicPath: "modules/curriculum/batch-a/g4b-u06-rank10-decimal-number-line-runtime-p03f42.js",
    requiredTokens: ["P03F_W3DirectProductVerticalSlice042Implementation", "MEASURE_DISTANCE", "number_line_distance"],
  },
  {
    repoPath: "site/assets/browser/state/query-state.js",
    publicPath: "assets/browser/state/query-state.js",
    requiredTokens: ["batch-a-selector-p03f42-extension.js", "LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS"],
  },
  {
    repoPath: "site/assets/browser/state/public-pattern-group-selection.js",
    publicPath: "assets/browser/state/public-pattern-group-selection.js",
    requiredTokens: ["batch-a-selector-p03f42-extension.js"],
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f42.js"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    publicPath: "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    requiredTokens: ["batch-a-browser-worksheet-p03f42-extension.js", "requestsP03F42"],
  },
  {
    repoPath: "site/modules/renderer/html-renderer.js",
    publicPath: "modules/renderer/html-renderer.js",
    requiredTokens: ["decimal-number-line", "worksheet-number-line", "小數數線，標示 A、B 兩點"],
  },
];

const argument = (name, fallback) => {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const repoPath = (path) => resolve(ROOT, path);
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const parseTenths = (text) => {
  const match = String(text).trim().match(/^(\d+)(?:\.(\d))?$/u);
  if (!match) throw new Error(`unsupported decimal tick:${text}`);
  return Number(match[1]) * 10 + Number(match[2] ?? "0");
};
const canonicalTenths = (scaled) => scaled % 10 === 0
  ? String(Math.trunc(scaled / 10))
  : `${Math.trunc(scaled / 10)}.${scaled % 10}`;

const baseUrl = new URL(argument("base-url", process.env.P03F42_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F42_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F42_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F42_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        assetUrl.searchParams.set("p03f42-sha", expectedSha256.slice(0, 16));
        const liveText = await fetchText(assetUrl);
        const liveSha256 = sha256(liveText);
        const missingTokens = contract.requiredTokens.filter((token) => !liveText.includes(token));
        if (liveSha256 !== expectedSha256 || missingTokens.length) {
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
  throw new Error(`Slice042 exact Pages deployment not observed:${lastFailure?.message ?? "unknown"}`);
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
  await page.waitForFunction(
    ({ sourceId, kpId }) => document.querySelector("#batch-a-source-select")?.value === sourceId
      && document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected === "true",
    { sourceId: SOURCE_ID, kpId: KP_ID },
    { timeout: 120000 },
  );

  const selectorState = await page.evaluate(async ({ sourceId, kpId, groupId }) => {
    const params = new URL(location.href).searchParams;
    const kpState = document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected ?? null;
    const groupState = document.querySelector(`[data-pattern-group-id="${groupId}"]`)?.dataset?.selected ?? null;
    const groupQueryMatches = params.getAll("pg").includes(groupId);
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f42-e2e", String(Date.now()));
    const registryModule = await import(registryUrl.href);
    const registry = registryModule.getCurrentPixelRegistrySnapshot();
    const sourceSummary = registry.bySourceId[sourceId];
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
      patternGroupSelectionMode: groupState === "true"
        ? "visible-controls"
        : groupState == null && groupQueryMatches ? "auto-applied-by-kp" : "unresolved",
      kpQueryMatches: params.getAll("kp").includes(kpId),
      groupQueryMatches,
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      publicCapabilityVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      publicSourceCount: registry.sourceCount,
      visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
      sourceVisibleKnowledgePointCount: sourceSummary?.visibleKnowledgePoints?.length ?? 0,
      sourceHiddenKnowledgePointCount: sourceSummary?.hiddenPendingCount ?? 0,
      sourceNotSelectableKnowledgePointCount: sourceSummary?.notSelectableCount ?? 0,
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
    && selectorState.publicSourceCount === 33
    && selectorState.visibleKnowledgePointCount === 240
    && selectorState.sourceVisibleKnowledgePointCount === 5
    && selectorState.sourceHiddenKnowledgePointCount === 1
    && selectorState.sourceNotSelectableKnowledgePointCount === 0;
  if (!selectorOk) throw new Error(`Slice042 public selector binding mismatch:${JSON.stringify(selectorState)}`);

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
    throw new Error(`Slice042 live generation/validator failed:${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice042 preview iframe did not expose a content frame");
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const output = await frame.evaluate(() => {
    const parseLine = (cell) => {
      const svg = cell.querySelector('svg.worksheet-number-line[aria-label="小數數線，標示 A、B 兩點"]');
      if (!svg) return { ok: false, error: "missing_svg" };
      const tickTexts = [...svg.querySelectorAll("text")]
        .map((node) => ({ x: node.getAttribute("x"), y: node.getAttribute("y"), text: node.textContent?.trim() ?? "" }))
        .filter((row) => row.y === "76" && /^\d+(?:\.\d)?$/u.test(row.text));
      const labels = [...svg.querySelectorAll("text")]
        .map((node) => ({ x: node.getAttribute("x"), y: node.getAttribute("y"), text: node.textContent?.trim() ?? "" }))
        .filter((row) => row.y === "40" && (row.text === "A" || row.text === "B"));
      const valueFor = (label) => tickTexts.find((tick) => tick.x === label.x)?.text ?? null;
      const a = labels.find((row) => row.text === "A");
      const b = labels.find((row) => row.text === "B");
      return {
        ok: Boolean(a && b && valueFor(a) && valueFor(b)),
        aText: a ? valueFor(a) : null,
        bText: b ? valueFor(b) : null,
        tickTexts: tickTexts.map((row) => row.text),
        circleCount: svg.querySelectorAll("circle").length,
        representationCount: cell.querySelectorAll('[data-representation="decimal-number-line"]').length,
      };
    };
    const questionCells = [...document.querySelectorAll(".worksheet-cell--question")];
    const answerCells = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    return {
      questionCount: questionCells.length,
      answerCount: answerCells.length,
      questionPageCount: document.querySelectorAll(".worksheet-page--questions").length,
      answerPageCount: document.querySelectorAll(".worksheet-page--answer-key").length,
      questionRows: questionCells.map((cell) => ({
        questionId: cell.dataset.questionId ?? null,
        patternId: cell.dataset.patternId ?? null,
        prompt: cell.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? "",
        numberLine: parseLine(cell),
      })),
      answerRows: answerCells.map((cell) => ({
        questionId: cell.dataset.questionId ?? null,
        patternId: cell.dataset.patternId ?? null,
        prompt: cell.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? "",
        answerText: cell.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? "",
        numberLine: parseLine(cell),
      })),
      representationCount: document.querySelectorAll('[data-representation="decimal-number-line"]').length,
      numberLineSvgCount: document.querySelectorAll('svg.worksheet-number-line[aria-label="小數數線，標示 A、B 兩點"]').length,
      pointMarkerCount: [...document.querySelectorAll('svg.worksheet-number-line[aria-label="小數數線，標示 A、B 兩點"]')]
        .reduce((total, svg) => total + svg.querySelectorAll("circle").length, 0),
      sharedRenderer: document.querySelector(".worksheet-document") !== null,
      allText: document.body?.innerText ?? "",
    };
  });

  const checks = output.questionRows.map((question, index) => {
    const answer = output.answerRows[index];
    const line = question.numberLine;
    if (!line.ok || !answer?.numberLine?.ok) return { ok: false, index, error: "invalid_number_line" };
    try {
      const aScaled = parseTenths(line.aText);
      const bScaled = parseTenths(line.bText);
      const expectedScaled = Math.abs(bScaled - aScaled);
      const expectedText = canonicalTenths(expectedScaled);
      const tickScaled = line.tickTexts.map(parseTenths);
      const stepScaled = tickScaled.length > 1 ? tickScaled[1] - tickScaled[0] : null;
      const representationMatch = JSON.stringify(line) === JSON.stringify(answer.numberLine);
      return {
        ok: answer.questionId === question.questionId
          && answer.patternId === SPEC_ID
          && question.patternId === SPEC_ID
          && answer.prompt === question.prompt
          && answer.answerText === expectedText
          && representationMatch
          && line.circleCount === 2
          && line.representationCount === 1
          && [1, 2].includes(stepScaled),
        index,
        aScaled,
        bScaled,
        expectedScaled,
        expectedText,
        actualText: answer.answerText,
        stepScaled,
        direction: bScaled > aScaled ? "rightward" : bScaled < aScaled ? "leftward" : "same",
        representationMatch,
      };
    } catch (error) {
      return { ok: false, index, error: String(error) };
    }
  });

  const exactAnswerMismatchCount = checks.filter((row) => !row.ok).length;
  const step01WitnessCount = checks.filter((row) => row.stepScaled === 1).length;
  const step02WitnessCount = checks.filter((row) => row.stepScaled === 2).length;
  const rightwardWitnessCount = checks.filter((row) => row.direction === "rightward").length;
  const leftwardWitnessCount = checks.filter((row) => row.direction === "leftward").length;
  const duplicateProblemCount = output.questionRows.length - new Set(output.questionRows.map(
    (row) => `${row.prompt}|${row.numberLine.aText}|${row.numberLine.bText}|${row.numberLine.tickTexts.join(",")}`,
  )).size;
  const internalIdLeakage = [SOURCE_ID, KP_ID, GROUP_ID, SPEC_ID, HIDDEN_SIBLING_ID, "P03F42"]
    .filter((token) => output.allText.includes(token));
  const semanticScopeFindingCount = output.questionRows
    .filter((row) => row.patternId !== SPEC_ID || !row.prompt.includes("A、B 兩點的距離是多少")).length;

  diagnosticContext = {
    deployment,
    selectorState,
    generationState,
    output,
    checks,
    exactAnswerMismatchCount,
    step01WitnessCount,
    step02WitnessCount,
    rightwardWitnessCount,
    leftwardWitnessCount,
    duplicateProblemCount,
    internalIdLeakage,
    semanticScopeFindingCount,
  };
  writeFileSync(
    resolve(outputDir, "p03f-slice042-live-pages-e2e-diagnostic.json"),
    `${JSON.stringify(diagnosticContext, null, 2)}\n`,
  );

  if (output.questionCount !== QUESTION_COUNT
      || output.answerCount !== QUESTION_COUNT
      || output.questionPageCount !== 3
      || output.answerPageCount !== 3
      || output.representationCount !== 48
      || output.numberLineSvgCount !== 48
      || output.pointMarkerCount !== 96
      || exactAnswerMismatchCount !== 0
      || step01WitnessCount !== 12
      || step02WitnessCount !== 12
      || rightwardWitnessCount <= 0
      || leftwardWitnessCount <= 0
      || duplicateProblemCount !== 0
      || internalIdLeakage.length !== 0
      || semanticScopeFindingCount !== 0) {
    throw new Error(`Slice042 live worksheet/answer mismatch:${JSON.stringify({
      output,
      checks,
      exactAnswerMismatchCount,
      step01WitnessCount,
      step02WitnessCount,
      rightwardWitnessCount,
      leftwardWitnessCount,
      duplicateProblemCount,
      internalIdLeakage,
      semanticScopeFindingCount,
    })}`);
  }

  await frame.evaluate(() => {
    window.__P03F42_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P03F42_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F42_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice042 print action did not reach preview frame:${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F42_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F42_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F42_LIVE_PAGES_WORKSHEET.html"), await frame.content());

  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Slice042 browser diagnostics failed:${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  const report = {
    schemaName: "P03FSlice042PostMergeMainPagesE2EReportV1",
    taskId: "P03F_W3DirectProductVerticalSlice042PostMergeMainPagesE2E",
    status: "PASS_P03F42_POSTMERGE_MAIN_PAGES_E2E",
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
    representationCount: output.representationCount,
    numberLineSvgCount: output.numberLineSvgCount,
    pointMarkerCount: output.pointMarkerCount,
    step01WitnessCount,
    step02WitnessCount,
    rightwardWitnessCount,
    leftwardWitnessCount,
    exactAnswerMismatchCount,
    semanticScopeFindingCount,
    duplicateProblemCount,
    internalIdLeakageCount: internalIdLeakage.length,
    printInvocationCount,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    requestFailureCount: requestFailures.length,
    serverErrorCount: serverErrors.length,
    sharedNumberLineRendererAdapter: true,
    sharedRenderer: output.sharedRenderer,
    patternGroupSelectionMode: selectorState.patternGroupSelectionMode,
    applicationExpansion: false,
    globalContextExpansion: false,
    arithmeticExpansion: false,
    parallelPipeline: false,
    siblingKnowledgePointPromotion: false,
    slice043Started: false,
  };
  writeFileSync(
    resolve(outputDir, "p03f-slice042-postmerge-main-pages-e2e-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(`P03F42_POSTMERGE_MAIN_PAGES_E2E=${JSON.stringify(report)}`);
} catch (error) {
  writeFileSync(
    resolve(outputDir, "P03F42_LIVE_PAGES_FAILURE.json"),
    `${JSON.stringify({
      status: "FAIL",
      error: String(error),
      implementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA,
      exactPagesRunId: EXACT_PAGES_RUN_ID,
      diagnosticContext,
      consoleErrors,
      pageErrors,
      requestFailures,
      serverErrors,
    }, null, 2)}\n`,
  );
  throw error;
} finally {
  if (browser) await browser.close();
}
