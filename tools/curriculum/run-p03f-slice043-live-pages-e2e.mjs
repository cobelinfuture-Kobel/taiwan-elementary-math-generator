import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p03f-slice043-live-pages-e2e");
const EXACT_IMPLEMENTATION_HEAD_SHA = "f1a7246a19c2febd14aaf312d9188f32b4c56793";
const EXACT_IMPLEMENTATION_MERGE_SHA = "7fe42337ccfac8d5489525ef02f5605af37a5a16";
const SOURCE_ID = "g4b_u08_4b08";
const NUMBER_LINE_KP_ID = "kp_g4b_u08_fraction_number_line_distance";
const BOUNDS_KP_ID = "kp_g4b_u08_mixed_fraction_order_constraints";
const NUMBER_LINE_GROUP_ID = "pg_g4b_u08_fraction_number_line_distance_numeric";
const BOUNDS_GROUP_ID = "pg_g4b_u08_mixed_fraction_order_constraints_numeric";
const COORDINATE_SPEC_ID = "ps_g4b_u08_fraction_number_line_distance_coordinate_numeric";
const DISTANCE_SPEC_ID = "ps_g4b_u08_fraction_number_line_distance_distance_numeric";
const BOUNDS_SPEC_ID = "ps_g4b_u08_mixed_fraction_order_constraints_possible_values_numeric";
const HIDDEN_APPLICATION_SPEC_ID = "ps_g4b_u08_mixed_fraction_order_constraints_possible_values_application";
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p03f43-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js",
    publicPath: "modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js",
    requiredTokens: [NUMBER_LINE_KP_ID, BOUNDS_KP_ID, COORDINATE_SPEC_ID, DISTANCE_SPEC_ID, BOUNDS_SPEC_ID],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p03f43.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p03f43.js",
    requiredTokens: ["public-ui-capability-binding-p03f42.js", "batch-a-selector-p03f43-extension.js"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g4b-u08-rank10-fraction-runtime-p03f43.js",
    publicPath: "modules/curriculum/batch-a/g4b-u08-rank10-fraction-runtime-p03f43.js",
    requiredTokens: ["P03F_W3DirectProductVerticalSlice043Implementation", "fraction_number_line", "fraction_bounds"],
  },
  {
    repoPath: "site/assets/browser/state/query-state.js",
    publicPath: "assets/browser/state/query-state.js",
    requiredTokens: ["batch-a-selector-p03f43-extension.js", "LATEST_FIRST_QUERY_SELECTOR_SOURCE_IDS"],
  },
  {
    repoPath: "site/assets/browser/state/public-pattern-group-selection.js",
    publicPath: "assets/browser/state/public-pattern-group-selection.js",
    requiredTokens: ["batch-a-selector-p03f43-extension.js"],
  },
  {
    repoPath: "site/assets/browser/public-capability-ui.js",
    publicPath: "assets/browser/public-capability-ui.js",
    requiredTokens: ["public-ui-capability-binding-p03f43.js"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    publicPath: "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    requiredTokens: ["batch-a-browser-worksheet-p03f43-extension.js", "requestsP03F43"],
  },
  {
    repoPath: "site/modules/renderer/html-renderer.js",
    publicPath: "modules/renderer/html-renderer.js",
    requiredTokens: ["fraction-number-line.js", "renderFractionNumberLine"],
  },
  {
    repoPath: "site/modules/renderer/fraction-number-line.js",
    publicPath: "modules/renderer/fraction-number-line.js",
    requiredTokens: ["fraction_number_line", "data-representation=\"fraction-number-line\""],
  },
];

const argument = (name, fallback) => {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const repoPath = (path) => resolve(ROOT, path);
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
};
const normalize = (numerator, denominator) => {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator === 0) throw new Error("invalid rational");
  const sign = denominator < 0 ? -1 : 1;
  const n = numerator * sign;
  const d = Math.abs(denominator);
  const g = gcd(n, d);
  return { numerator: n / g, denominator: d / g };
};
const parseRationalText = (text) => {
  const value = String(text ?? "").trim();
  let match = value.match(/^(\d+)\s+(\d+)\/(\d+)$/u);
  if (match) return normalize(Number(match[1]) * Number(match[3]) + Number(match[2]), Number(match[3]));
  match = value.match(/^(\d+)\/(\d+)$/u);
  if (match) return normalize(Number(match[1]), Number(match[2]));
  match = value.match(/^(\d+)$/u);
  if (match) return { numerator: Number(match[1]), denominator: 1 };
  throw new Error(`unsupported rational text:${value}`);
};
const rationalText = ({ numerator, denominator }) => {
  const value = normalize(numerator, denominator);
  if (value.denominator === 1) return String(value.numerator);
  if (value.numerator < value.denominator) return `${value.numerator}/${value.denominator}`;
  const whole = Math.floor(value.numerator / value.denominator);
  const remainder = value.numerator % value.denominator;
  return remainder === 0 ? String(whole) : `${whole} ${remainder}/${value.denominator}`;
};
const compare = (left, right) => left.numerator * right.denominator - right.numerator * left.denominator;

const baseUrl = new URL(argument("base-url", process.env.P03F43_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P03F43_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P03F43_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P03F43_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        assetUrl.searchParams.set("p03f43-sha", expectedSha256.slice(0, 16));
        const liveText = await fetchText(assetUrl);
        const liveSha256 = sha256(liveText);
        const missingTokens = contract.requiredTokens.filter((token) => !liveText.includes(token));
        if (liveSha256 !== expectedSha256 || missingTokens.length) {
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
  throw new Error(`Slice043 exact Pages deployment not observed:${lastFailure?.message ?? "unknown"}`);
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
  for (const kp of [NUMBER_LINE_KP_ID, BOUNDS_KP_ID]) url.searchParams.append("kp", kp);
  for (const pg of [NUMBER_LINE_GROUP_ID, BOUNDS_GROUP_ID]) url.searchParams.append("pg", pg);
  return url;
}

function verifyAnswer(prompt, answerText, patternId) {
  if (patternId === COORDINATE_SPEC_ID) {
    const match = prompt.match(/1\/(\d+).*第\s*(\d+)\s*格/u);
    if (!match) return { ok: false, reason: "coordinate_prompt_parse" };
    const expected = normalize(Number(match[2]), Number(match[1]));
    return { ok: answerText === rationalText(expected), expectedText: rationalText(expected) };
  }
  if (patternId === DISTANCE_SPEC_ID) {
    const match = prompt.match(/A=([^、]+)、B=([^，]+)，/u);
    if (!match) return { ok: false, reason: "distance_prompt_parse" };
    const left = parseRationalText(match[1]);
    const right = parseRationalText(match[2]);
    const raw = normalize(Math.abs(right.numerator * left.denominator - left.numerator * right.denominator), left.denominator * right.denominator);
    return { ok: answerText === rationalText(raw), expectedText: rationalText(raw) };
  }
  if (patternId === BOUNDS_SPEC_ID) {
    const match = prompt.match(/已知\s*(.+?)\s*<\s*□\/(\d+)\s*<\s*(.+?)，/u);
    if (!match) return { ok: false, reason: "bounds_prompt_parse" };
    const lower = parseRationalText(match[1]);
    const denominator = Number(match[2]);
    const upper = parseRationalText(match[3]);
    const possible = [];
    for (let candidate = 0; candidate <= 200; candidate += 1) {
      const value = { numerator: candidate, denominator };
      if (compare(value, lower) > 0 && compare(value, upper) < 0) possible.push(candidate);
    }
    const expectedText = possible.join("、");
    return { ok: possible.length > 0 && answerText === expectedText, expectedText };
  }
  return { ok: false, reason: `unexpected_pattern:${patternId}` };
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
    { sourceId: SOURCE_ID, kpIds: [NUMBER_LINE_KP_ID, BOUNDS_KP_ID] }, { timeout: 120000 });

  const selectorState = await page.evaluate(async ({ sourceId, kpIds, groupIds }) => {
    const params = new URL(location.href).searchParams;
    const registryUrl = new URL("pixel/pixel-registry-bridge.js", location.href);
    registryUrl.searchParams.set("p03f43-e2e", String(Date.now()));
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
      kpStates: Object.fromEntries(kpIds.map((kpId) => [kpId, document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected ?? null])),
      groupStates: Object.fromEntries(groupIds.map((groupId) => [groupId, document.querySelector(`[data-pattern-group-id="${groupId}"]`)?.dataset?.selected ?? null])),
      kpQueryMatches: kpIds.every((id) => params.getAll("kp").includes(id)),
      groupQueryMatches: groupIds.every((id) => params.getAll("pg").includes(id)),
      questionMode: document.querySelector("#g5a-u08-question-mode")?.value ?? null,
      publicCapabilityVisible: document.querySelector("#g5a-u08-public-controls")?.dataset?.visible ?? null,
      publicSourceCount: registry.sourceCount,
      visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
      sourceVisibleKnowledgePointCount: sourceSummary?.visibleKnowledgePoints?.length ?? 0,
      sourceHiddenKnowledgePointCount: sourceSummary?.hiddenPendingCount ?? 0,
      sourceNotSelectableKnowledgePointCount: sourceSummary?.notSelectableCount ?? 0,
    };
  }, { sourceId: SOURCE_ID, kpIds: [NUMBER_LINE_KP_ID, BOUNDS_KP_ID], groupIds: [NUMBER_LINE_GROUP_ID, BOUNDS_GROUP_ID] });

  const selectorOk = selectorState.sourceMatches && selectorState.selectionMode === "mixedKnowledgePointsSameUnit"
    && selectorState.questionCount === String(QUESTION_COUNT) && selectorState.ordering === "groupedByPattern" && selectorState.answerKey
    && selectorState.generationSeed === GENERATION_SEED && selectorState.columns === "2" && selectorState.rowsPerPage === "4"
    && Object.values(selectorState.kpStates).every((value) => value === "true") && selectorState.kpQueryMatches && selectorState.groupQueryMatches
    && selectorState.questionMode === "numeric" && selectorState.publicCapabilityVisible === "true"
    && selectorState.publicSourceCount === 33 && selectorState.visibleKnowledgePointCount === 243
    && selectorState.sourceVisibleKnowledgePointCount === 7 && selectorState.sourceHiddenKnowledgePointCount === 0
    && selectorState.sourceNotSelectableKnowledgePointCount === 0;
  if (!selectorOk) throw new Error(`Slice043 public selector binding mismatch:${JSON.stringify(selectorState)}`);

  await page.locator("#regenerate-button").click();
  await page.waitForFunction(() => { const status = document.querySelector("#status-panel")?.textContent ?? ""; return status.includes("已產生") || status.includes("產生失敗"); }, null, { timeout: 120000 });
  const generationState = await page.evaluate(() => ({
    statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    statusTone: document.querySelector("#status-panel")?.dataset?.tone ?? "",
    validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    previewSrcdocLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printButtonDisabled: Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if (!generationState.statusText.includes(`已產生 ${QUESTION_COUNT} 題`) || generationState.statusTone !== "success"
      || generationState.validationHasErrors !== "false" || !generationState.validationText.includes("驗證通過")
      || generationState.previewSrcdocLength <= 0 || generationState.printButtonDisabled) throw new Error(`Slice043 live generation/validator failed:${JSON.stringify(generationState)}`);

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Slice043 preview iframe did not expose a content frame");
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const output = await frame.evaluate(() => {
    const questionCells = [...document.querySelectorAll(".worksheet-cell--question")];
    const answerCells = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    const row = (cell) => ({
      questionId: cell.dataset.questionId ?? null,
      patternId: cell.dataset.patternId ?? null,
      prompt: cell.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? "",
      answerText: cell.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? "",
      representationCount: cell.querySelectorAll('[data-representation="fraction-number-line"]').length,
      svgCount: cell.querySelectorAll("svg.worksheet-number-line").length,
      pointMarkerCount: cell.querySelectorAll("svg.worksheet-number-line circle").length,
    });
    return {
      questionCount: questionCells.length, answerCount: answerCells.length,
      questionPageCount: document.querySelectorAll(".worksheet-page--questions").length,
      answerPageCount: document.querySelectorAll(".worksheet-page--answer-key").length,
      questionRows: questionCells.map(row), answerRows: answerCells.map(row),
      representationCount: document.querySelectorAll('[data-representation="fraction-number-line"]').length,
      numberLineSvgCount: document.querySelectorAll("svg.worksheet-number-line").length,
      pointMarkerCount: document.querySelectorAll("svg.worksheet-number-line circle").length,
      sharedRenderer: document.querySelector(".worksheet-document") !== null,
      allText: document.body?.innerText ?? "",
    };
  });

  const checks = output.questionRows.map((question, index) => {
    const answer = output.answerRows[index];
    const verified = verifyAnswer(question.prompt, answer?.answerText ?? "", question.patternId);
    return { index, patternId: question.patternId,
      ok: Boolean(answer) && answer.questionId === question.questionId && answer.patternId === question.patternId && answer.prompt === question.prompt && verified.ok,
      expectedText: verified.expectedText ?? null, actualText: answer?.answerText ?? null, reason: verified.reason ?? null };
  });
  const patternCounts = Object.fromEntries([COORDINATE_SPEC_ID, DISTANCE_SPEC_ID, BOUNDS_SPEC_ID].map((id) => [id, output.questionRows.filter((row) => row.patternId === id).length]));
  const exactAnswerMismatchCount = checks.filter((row) => !row.ok).length;
  const duplicateProblemCount = output.questionRows.length - new Set(output.questionRows.map((row) => `${row.patternId}|${row.prompt}`)).size;
  const internalIdLeakage = [SOURCE_ID, NUMBER_LINE_KP_ID, BOUNDS_KP_ID, NUMBER_LINE_GROUP_ID, BOUNDS_GROUP_ID, COORDINATE_SPEC_ID, DISTANCE_SPEC_ID, BOUNDS_SPEC_ID, HIDDEN_APPLICATION_SPEC_ID, "P03F43"].filter((token) => output.allText.includes(token));
  const unexpectedPatternCount = output.questionRows.filter((row) => ![COORDINATE_SPEC_ID, DISTANCE_SPEC_ID, BOUNDS_SPEC_ID].includes(row.patternId)).length;
  const representationMismatchCount = output.questionRows.reduce((sum, row) => {
    if (row.patternId === COORDINATE_SPEC_ID) return sum + Number(row.representationCount !== 1 || row.svgCount !== 1 || row.pointMarkerCount !== 1);
    if (row.patternId === DISTANCE_SPEC_ID) return sum + Number(row.representationCount !== 1 || row.svgCount !== 1 || row.pointMarkerCount !== 2);
    return sum + Number(row.representationCount !== 0 || row.svgCount !== 0 || row.pointMarkerCount !== 0);
  }, 0);

  diagnosticContext = { deployment, selectorState, generationState, output, checks, patternCounts, exactAnswerMismatchCount, duplicateProblemCount, internalIdLeakage, unexpectedPatternCount, representationMismatchCount };
  writeFileSync(resolve(outputDir, "p03f-slice043-live-pages-e2e-diagnostic.json"), `${JSON.stringify(diagnosticContext, null, 2)}\n`);

  if (output.questionCount !== QUESTION_COUNT || output.answerCount !== QUESTION_COUNT || output.questionPageCount !== 3 || output.answerPageCount !== 3
      || patternCounts[COORDINATE_SPEC_ID] !== 8 || patternCounts[DISTANCE_SPEC_ID] !== 8 || patternCounts[BOUNDS_SPEC_ID] !== 8
      || output.representationCount !== 32 || output.numberLineSvgCount !== 32 || output.pointMarkerCount !== 48
      || exactAnswerMismatchCount !== 0 || duplicateProblemCount !== 0 || internalIdLeakage.length !== 0 || unexpectedPatternCount !== 0 || representationMismatchCount !== 0) {
    throw new Error(`Slice043 live worksheet/answer mismatch:${JSON.stringify(diagnosticContext)}`);
  }

  await frame.evaluate(() => { window.__P03F43_PRINT_INVOKED__ = 0; window.print = () => { window.__P03F43_PRINT_INVOKED__ += 1; }; });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P03F43_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Slice043 print action did not reach preview frame:${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P03F43_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P03F43_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P03F43_LIVE_PAGES_WORKSHEET.html"), await frame.content());
  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) throw new Error(`Slice043 browser diagnostics failed:${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);

  const report = {
    schemaName: "P03FSlice043PostMergeMainPagesE2EReportV1", taskId: "P03F_W3DirectProductVerticalSlice043PostMergeMainPagesE2E",
    status: "PASS_P03F43_POSTMERGE_MAIN_PAGES_E2E", implementationHeadSha: EXACT_IMPLEMENTATION_HEAD_SHA, implementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA,
    baseUrl: baseUrl.href, liveUrl: liveUrl.href, deploymentAttempt: deployment.attempt, deployedAssetCount: deployment.assets.length, deployedAssets: deployment.assets,
    deployedAssetShaMismatchCount: deployment.assets.filter((row) => row.expectedSha256 !== row.liveSha256).length,
    sourceId: SOURCE_ID, knowledgePointIds: [NUMBER_LINE_KP_ID, BOUNDS_KP_ID], patternGroupIds: [NUMBER_LINE_GROUP_ID, BOUNDS_GROUP_ID],
    patternSpecIds: [COORDINATE_SPEC_ID, DISTANCE_SPEC_ID, BOUNDS_SPEC_ID], publicSourceCount: selectorState.publicSourceCount,
    visibleKnowledgePointCount: selectorState.visibleKnowledgePointCount, sourceVisibleKnowledgePointCount: selectorState.sourceVisibleKnowledgePointCount,
    sourceHiddenKnowledgePointCount: selectorState.sourceHiddenKnowledgePointCount, sourceNotSelectableKnowledgePointCount: selectorState.sourceNotSelectableKnowledgePointCount,
    selectorState, generationState, questionCount: output.questionCount, answerCount: output.answerCount, questionPageCount: output.questionPageCount, answerPageCount: output.answerPageCount,
    patternCounts, representationCount: output.representationCount, numberLineSvgCount: output.numberLineSvgCount, pointMarkerCount: output.pointMarkerCount,
    exactAnswerMismatchCount, representationMismatchCount, unexpectedPatternCount, duplicateProblemCount, internalIdLeakageCount: internalIdLeakage.length,
    printInvocationCount, consoleErrorCount: consoleErrors.length, pageErrorCount: pageErrors.length, requestFailureCount: requestFailures.length, serverErrorCount: serverErrors.length,
    sharedRenderer: output.sharedRenderer, patternGroupSelectionMode: "auto-or-visible-by-kp", applicationExpansion: false, globalContextExpansion: false,
    fractionArithmeticExpansion: false, parallelPipeline: false, siblingKnowledgePointPromotion: false, slice044Started: false,
  };
  writeFileSync(resolve(outputDir, "p03f-slice043-postmerge-main-pages-e2e-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P03F43_POSTMERGE_MAIN_PAGES_E2E=${JSON.stringify(report)}`);
} catch (error) {
  writeFileSync(resolve(outputDir, "P03F43_LIVE_PAGES_FAILURE.json"), `${JSON.stringify({ status: "FAIL", error: String(error), implementationMergeSha: EXACT_IMPLEMENTATION_MERGE_SHA, diagnosticContext, consoleErrors, pageErrors, requestFailures, serverErrors }, null, 2)}\n`);
  throw error;
} finally {
  if (browser) await browser.close();
}
