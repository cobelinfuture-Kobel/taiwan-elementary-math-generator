import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "tmp/p05f-w5-q001-live-pages-e2e");
const EXACT_MERGE_SHA = "3ab43f1081c500aa3df814ee776be4dc529d0667";
const EXACT_PAGES_RUN_ID = 33763778770;
const SOURCE_ID = "g3a_u05_3a05";
const KP_ID = "kp_angle_parts_identification";
const GROUP_ID = "pg_g3a_u05_angle_parts_identification";
const SPEC_IDS = Object.freeze([
  "ps_g3a_u05_identify_vertex_from_marker",
  "ps_g3a_u05_identify_side_from_highlight",
  "ps_g3a_u05_identify_angle_from_arc",
  "ps_g3a_u05_match_part_label_to_diagram_marker",
]);
const QUESTION_COUNT = 24;
const GENERATION_SEED = "p05f-w5-q001-postmerge-pages-e2e";

const assetContracts = [
  {
    repoPath: "site/modules/curriculum/registry/g3a-u05-angle-parts-selector-projection-p05f1.js",
    publicPath: "modules/curriculum/registry/g3a-u05-angle-parts-selector-projection-p05f1.js",
    requiredTokens: [SOURCE_ID, KP_ID, GROUP_ID, ...SPEC_IDS, "ANGLE_PART_IDENTIFICATION", "diagram"],
  },
  {
    repoPath: "site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
    publicPath: "modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
    requiredTokens: ["batch-a-selector-p05f1-extension.js", "currentBrowserSelectorActive"],
  },
  {
    repoPath: "site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",
    publicPath: "modules/curriculum/public/public-ui-capability-binding-p04f33.js",
    requiredTokens: ["public-ui-capability-binding-p05f1.js", "currentBrowserBindingActive"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g3a-u05-angle-parts-runtime-p05f1.js",
    publicPath: "modules/curriculum/batch-a/g3a-u05-angle-parts-runtime-p05f1.js",
    requiredTokens: [],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f1-extension.js",
    publicPath: "modules/curriculum/batch-a/batch-a-browser-worksheet-p05f1-extension.js",
    requiredTokens: ["generateBatchABrowserQuestions", "geometryDiagram", "questionCountMax:240"],
  },
  {
    repoPath: "site/assets/browser/state/config-state.js",
    publicPath: "assets/browser/state/config-state.js",
    requiredTokens: [SOURCE_ID, "questionMode: \"diagram\"", "genericFallback: false", "freeFormAI: false"],
  },
  {
    repoPath: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    publicPath: "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    requiredTokens: ["batch-a-browser-worksheet-p05f1-extension.js"],
  },
];

function argument(name, fallback) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function repoPath(path) { return resolve(ROOT, path); }
function sleep(ms) { return new Promise((done) => setTimeout(done, ms)); }

const baseUrl = new URL(argument("base-url", process.env.P05F1_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.P05F1_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.P05F1_DEPLOYMENT_RETRIES ?? "20"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.P05F1_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));
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
        assetUrl.searchParams.set("p05f1-sha", expectedSha256.slice(0, 16));
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
  throw new Error(`Q001 exact Pages deployment not observed: ${lastFailure?.message ?? "unknown"}`);
}

function parseLayout(meta) {
  const question = String(meta).match(/題目\s*(\d+)\s*欄\s*[×x]\s*(\d+)\s*列/);
  const answer = String(meta).match(/答案\s*(\d+)\s*欄\s*[×x]\s*(\d+)\s*列/);
  if (!question || !answer) return null;
  return {
    questionColumns: Number(question[1]),
    questionRows: Number(question[2]),
    answerColumns: Number(answer[1]),
    answerRows: Number(answer[2]),
  };
}

const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];
const serverErrors = [];
let deployment = null;
let browser = null;

try {
  deployment = await waitForExactDeployment();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push({ url: request.url(), errorText: request.failure()?.errorText ?? "unknown" }));
  page.on("response", (response) => { if (response.status() >= 500) serverErrors.push({ url: response.url(), status: response.status() }); });

  const liveUrl = new URL(baseUrl);
  liveUrl.searchParams.set("p05f1-postmerge", String(Date.now()));
  const mainResponse = await page.goto(liveUrl.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!mainResponse?.ok()) throw new Error(`Q001 Live Pages main response failed: ${mainResponse?.status() ?? "no-response"}`);

  await page.waitForFunction(() => [...document.querySelectorAll("#batch-a-grade-select option")].some((option) => option.value === "3"), null, { timeout: 120000 });
  await page.selectOption("#batch-a-grade-select", "3");
  await page.waitForFunction(() => [...document.querySelectorAll("#batch-a-semester-select option")].some((option) => option.value === "upper"), null, { timeout: 120000 });
  await page.selectOption("#batch-a-semester-select", "upper");
  await page.waitForFunction((sourceId) => [...document.querySelectorAll("#batch-a-source-select option")].some((option) => option.value === sourceId), SOURCE_ID, { timeout: 120000 });
  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.waitForFunction((sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId, SOURCE_ID, { timeout: 120000 });
  await page.waitForFunction((kpId) => Boolean(document.querySelector(`[data-knowledge-point-id="${kpId}"]`)), KP_ID, { timeout: 120000 });

  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  await page.locator(`[data-knowledge-point-id="${KP_ID}"]`).click();
  await page.waitForFunction((kpId) => document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected === "true", KP_ID, { timeout: 120000 });
  await page.waitForFunction((groupId) => Boolean(document.querySelector(`[data-pattern-group-id="${groupId}"]`)), GROUP_ID, { timeout: 120000 });
  const groupSelected = await page.locator(`[data-pattern-group-id="${GROUP_ID}"]`).getAttribute("data-selected");
  if (groupSelected !== "true") await page.locator(`[data-pattern-group-id="${GROUP_ID}"]`).click();

  await page.fill("#batch-a-question-count-input", String(QUESTION_COUNT));
  await page.dispatchEvent("#batch-a-question-count-input", "change");
  await page.selectOption("#batch-a-ordering-select", "groupedByPattern");
  await page.fill("#generation-seed-input", GENERATION_SEED);
  await page.dispatchEvent("#generation-seed-input", "change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input", "2");
  await page.dispatchEvent("#columns-input", "change");
  await page.fill("#rows-per-page-input", "4");
  await page.dispatchEvent("#rows-per-page-input", "change");

  const selectorState = await page.evaluate(({ sourceId, kpId, groupId }) => ({
    grade: document.querySelector("#batch-a-grade-select")?.value ?? null,
    semester: document.querySelector("#batch-a-semester-select")?.value ?? null,
    sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
    selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
    selectedKnowledgePointIds: [...document.querySelectorAll("[data-knowledge-point-id][data-selected='true']")].map((node) => node.dataset.knowledgePointId),
    selectedPatternGroupIds: [...document.querySelectorAll("[data-pattern-group-id][data-selected='true']")].map((node) => node.dataset.patternGroupId),
    questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
    ordering: document.querySelector("#batch-a-ordering-select")?.value ?? null,
    answerKey: Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),
    generationSeed: document.querySelector("#generation-seed-input")?.value ?? null,
    columns: document.querySelector("#columns-input")?.value ?? null,
    rowsPerPage: document.querySelector("#rows-per-page-input")?.value ?? null,
    availabilitySummary: document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim() ?? "",
    targetKnowledgePointSelected: document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected === "true",
    targetPatternGroupSelected: document.querySelector(`[data-pattern-group-id="${groupId}"]`)?.dataset?.selected === "true",
  }), { sourceId: SOURCE_ID, kpId: KP_ID, groupId: GROUP_ID });

  const selectorOk = selectorState.grade === "3"
    && selectorState.semester === "upper"
    && selectorState.sourceId === SOURCE_ID
    && selectorState.selectionMode === "singleKnowledgePoint"
    && selectorState.selectedKnowledgePointIds.length === 1
    && selectorState.selectedKnowledgePointIds[0] === KP_ID
    && selectorState.selectedPatternGroupIds.includes(GROUP_ID)
    && selectorState.questionCount === String(QUESTION_COUNT)
    && selectorState.ordering === "groupedByPattern"
    && selectorState.answerKey === true
    && selectorState.generationSeed === GENERATION_SEED
    && selectorState.columns === "2"
    && selectorState.rowsPerPage === "4"
    && selectorState.targetKnowledgePointSelected
    && selectorState.targetPatternGroupSelected
    && selectorState.availabilitySummary.includes("可選知識點：1")
    && selectorState.availabilitySummary.includes("尚未開放：3")
    && selectorState.availabilitySummary.includes("不可選：3")
    && selectorState.availabilitySummary.includes("全部可選：313");
  if (!selectorOk) throw new Error(`Q001 public selector binding mismatch: ${JSON.stringify(selectorState)}`);

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
    throw new Error(`Q001 live generation/validator failed: ${JSON.stringify(generationState)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Q001 preview iframe did not expose a content frame");
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const output = await frame.evaluate(() => {
    const questionCells = [...document.querySelectorAll(".worksheet-cell--question")];
    const answerCells = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    const pages = [...document.querySelectorAll(".worksheet-page")];
    return {
      rendererProfile: document.body?.dataset?.rendererProfile ?? null,
      questionCount: questionCells.length,
      answerCount: answerCells.length,
      questionPageCount: document.querySelectorAll(".worksheet-page--questions").length,
      answerPageCount: document.querySelectorAll(".worksheet-page--answer-key").length,
      diagramCount: document.querySelectorAll(".worksheet-angle-parts-diagram").length,
      sideLineCount: document.querySelectorAll(".angle-parts-diagram__side").length,
      vertexMarkerCount: document.querySelectorAll(".angle-parts-diagram__marker--vertex").length,
      angleArcCount: document.querySelectorAll(".angle-parts-diagram__marker--arc").length,
      labelPointCount: document.querySelectorAll(".angle-parts-diagram__marker--label-point").length,
      highlightedSideCount: document.querySelectorAll('.angle-parts-diagram__side[stroke-width="7"]').length,
      questionSignatures: questionCells.map((cell) => `${cell.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? ""}::${cell.querySelector("svg")?.outerHTML ?? ""}`),
      answerTexts: answerCells.map((cell) => cell.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? ""),
      allText: document.body?.innerText ?? "",
      overflowFindingCount: pages.filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).length,
      sharedRenderer: document.querySelector(".worksheet-document") !== null,
    };
  });

  const answerLabels = output.answerTexts.map((text) => ["頂點", "邊", "角"].find((label) => text.includes(label)) ?? null);
  const answerLabelSet = [...new Set(answerLabels.filter(Boolean))].sort();
  const duplicateSignatureCount = output.questionSignatures.length - new Set(output.questionSignatures).size;
  const internalIdLeakage = [SOURCE_ID, KP_ID, GROUP_ID, ...SPEC_IDS].filter((token) => output.allText.includes(token));
  const forbiddenVocabularyCount = (output.allText.match(/射線/g) ?? []).length;
  const layout = parseLayout(generationState.previewMeta);
  const expectedQuestionPages = layout ? Math.ceil(QUESTION_COUNT / (layout.questionColumns * layout.questionRows)) : null;
  const expectedAnswerPages = layout ? Math.ceil(QUESTION_COUNT / (layout.answerColumns * layout.answerRows)) : null;

  if (output.questionCount !== QUESTION_COUNT
    || output.answerCount !== QUESTION_COUNT
    || output.diagramCount !== 48
    || output.sideLineCount !== 96
    || output.vertexMarkerCount !== 12
    || output.angleArcCount !== 12
    || output.labelPointCount !== 12
    || output.highlightedSideCount !== 12
    || duplicateSignatureCount !== 0
    || answerLabels.some((label) => label == null)
    || JSON.stringify(answerLabelSet) !== JSON.stringify(["角", "邊", "頂點"].sort())
    || internalIdLeakage.length !== 0
    || forbiddenVocabularyCount !== 0
    || output.overflowFindingCount !== 0
    || !output.sharedRenderer
    || !layout
    || output.questionPageCount !== expectedQuestionPages
    || output.answerPageCount !== expectedAnswerPages) {
    throw new Error(`Q001 live worksheet/answer mismatch: ${JSON.stringify({ output: { ...output, allText: undefined, questionSignatures: undefined }, answerLabels, answerLabelSet, duplicateSignatureCount, internalIdLeakage, forbiddenVocabularyCount, layout, expectedQuestionPages, expectedAnswerPages })}`);
  }

  await frame.evaluate(() => {
    window.__P05F1_PRINT_INVOKED__ = 0;
    window.print = () => { window.__P05F1_PRINT_INVOKED__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocationCount = await frame.evaluate(() => window.__P05F1_PRINT_INVOKED__ ?? 0);
  if (printInvocationCount !== 1) throw new Error(`Q001 print action did not reach preview frame: ${printInvocationCount}`);

  await page.screenshot({ path: resolve(outputDir, "P05F1_LIVE_PAGES_UI.png"), fullPage: true });
  await frame.locator(".worksheet-document").screenshot({ path: resolve(outputDir, "P05F1_LIVE_PAGES_WORKSHEET.png") });
  writeFileSync(resolve(outputDir, "P05F1_LIVE_PAGES_WORKSHEET.html"), await frame.content());

  if (consoleErrors.length || pageErrors.length || requestFailures.length || serverErrors.length) {
    throw new Error(`Q001 browser diagnostics failed: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures, serverErrors })}`);
  }

  const report = {
    schemaName: "P05FW5Q001PostMergeMainPagesE2EV1",
    taskId: "P05F_W5_Q001_PostMergeMainPagesE2EEvidence",
    status: "PASS_P05F_W5_Q001_POSTMERGE_MAIN_PAGES_E2E",
    exactImplementationMergeSha: EXACT_MERGE_SHA,
    exactPagesRunId: EXACT_PAGES_RUN_ID,
    sourceId: SOURCE_ID,
    knowledgePointId: KP_ID,
    patternGroupId: GROUP_ID,
    patternSpecIds: SPEC_IDS,
    deployment,
    selector: selectorState,
    generation: generationState,
    worksheet: {
      rendererProfile: output.rendererProfile,
      questionCount: output.questionCount,
      answerCount: output.answerCount,
      questionPageCount: output.questionPageCount,
      answerPageCount: output.answerPageCount,
      diagramCount: output.diagramCount,
      sideLineCount: output.sideLineCount,
      vertexMarkerCount: output.vertexMarkerCount,
      angleArcCount: output.angleArcCount,
      labelPointCount: output.labelPointCount,
      highlightedSideCount: output.highlightedSideCount,
      answerLabelSet,
      duplicateSignatureCount,
      internalIdLeakage,
      forbiddenVocabularyCount,
      overflowFindingCount: output.overflowFindingCount,
      layout,
      sharedRenderer: output.sharedRenderer,
    },
    print: { invocationCount: printInvocationCount },
    browser: { consoleErrorCount: 0, pageErrorCount: 0, requestFailureCount: 0, serverErrorCount: 0 },
    forbiddenScope: {
      q001ProductMutation: false,
      q002Started: false,
      rightAngleExpansion: false,
      angleSizeComparisonExpansion: false,
      constructionExpansion: false,
      applicationExpansion: false,
      fullRepositoryRegression: false,
      globalBrowserReplay: false,
    },
  };
  writeFileSync(resolve(outputDir, "P05F1_POSTMERGE_MAIN_PAGES_E2E.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P05F1_POSTMERGE_MAIN_PAGES_E2E=${JSON.stringify(report)}`);
} finally {
  if (browser) await browser.close();
}
