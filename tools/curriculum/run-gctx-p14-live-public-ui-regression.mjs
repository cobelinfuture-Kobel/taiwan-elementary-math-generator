import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_BASE_URL = "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const DEFAULT_OUTPUT_DIR = resolve(ROOT, "docs/curriculum/output/gctx/p14-live");
const REVIEW_SHA256 = "777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0";
const P13_PDF_SHA256 = "ab94e9b6d3c53227e9524d9b21aa4d05022272d191e8c8a078fc243ca79d57fa";
const SOURCE_ID = "g3b_u04_3b04";
const KP_ID = "kp_g3b_u04_add_then_divide";
const GROUP_ID = "pg_g3b_u04_add_then_divide";
const REQUIRED_PHRASES = ["班級園遊會", "戶外學習", "運動練習", "社區清潔活動", "露營活動"];
const LEGACY_TARGET_PHRASES = [
  "三明治費用共",
  "果汁費用共",
  "筆記本費用共",
  "彩色筆費用共",
  "門票費用共",
  "帳篷租金共"
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

const baseUrl = new URL(argument("base-url", process.env.GCTX_P14_BASE_URL ?? DEFAULT_BASE_URL));
const outputDir = resolve(argument("output-dir", process.env.GCTX_P14_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR));
const deploymentRetryCount = Number(argument("deployment-retries", process.env.GCTX_P14_DEPLOYMENT_RETRIES ?? "40"));
const deploymentRetryDelayMs = Number(argument("deployment-retry-delay-ms", process.env.GCTX_P14_DEPLOYMENT_RETRY_DELAY_MS ?? "15000"));

const assetContracts = [
  {
    repoPath: "site/assets/browser/pipeline/build-worksheet-document.js",
    publicPath: "assets/browser/pipeline/build-worksheet-document.js",
    requiredTokens: [
      "batch-a-browser-worksheet-r2e-entry.js",
      "applyG3BU04GlobalContextPublicWorksheetAdmission"
    ]
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g3b-u04-global-context-production-registry.js",
    publicPath: "modules/curriculum/batch-a/g3b-u04-global-context-production-registry.js",
    requiredTokens: [
      "gctx_p13_review_20260719_all_five_approved",
      REVIEW_SHA256,
      "productionAdmitted: true"
    ]
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g3b-u04-human-semantic-readback-quality-v2.js",
    publicPath: "modules/curriculum/batch-a/g3b-u04-human-semantic-readback-quality-v2.js",
    requiredTokens: [
      "G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_SHA256",
      REVIEW_SHA256,
      "reviewedPromptCompatibility"
    ]
  },
  {
    repoPath: "site/modules/curriculum/batch-a/g3b-u04-global-context-production-admission.js",
    publicPath: "modules/curriculum/batch-a/g3b-u04-global-context-production-admission.js",
    requiredTokens: [
      "production_admitted_public_route_active",
      "publicQuerySelectable: true",
      "GCTX_P13_MATHEMATICAL_WITNESS_INVALID"
    ]
  }
];

async function fetchText(url) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "cache-control": "no-cache" }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

async function waitForExactDeployment() {
  let lastFailure = null;
  for (let attempt = 1; attempt <= deploymentRetryCount; attempt += 1) {
    try {
      const rows = [];
      for (const contract of assetContracts) {
        const local = readFileSync(repoPath(contract.repoPath));
        const expectedSha256 = sha256(local);
        const url = new URL(contract.publicPath, baseUrl);
        url.searchParams.set("gctx-p14-sha", expectedSha256.slice(0, 16));
        const liveText = await fetchText(url);
        const liveBuffer = Buffer.from(liveText, "utf8");
        const liveSha256 = sha256(liveBuffer);
        const missingTokens = contract.requiredTokens.filter((token) => !liveText.includes(token));
        if (liveSha256 !== expectedSha256 || missingTokens.length > 0) {
          throw new Error(`${contract.publicPath} not deployed exactly: expected=${expectedSha256} actual=${liveSha256} missing=${missingTokens.join(",")}`);
        }
        rows.push({
          repoPath: contract.repoPath,
          publicUrl: new URL(contract.publicPath, baseUrl).href,
          expectedSha256,
          liveSha256,
          byteLength: liveBuffer.length,
          missingTokenCount: 0
        });
      }
      return { attempt, assets: rows };
    } catch (error) {
      lastFailure = error;
      if (attempt < deploymentRetryCount) await sleep(deploymentRetryDelayMs);
    }
  }
  throw new Error(`P13 live deployment did not match repository assets: ${lastFailure?.message ?? "unknown"}`);
}

function buildLiveQueryUrl() {
  const url = new URL(baseUrl);
  url.searchParams.set("sourceId", SOURCE_ID);
  url.searchParams.set("selectionMode", "singleKnowledgePoint");
  url.searchParams.set("questionCount", "25");
  url.searchParams.set("ordering", "groupedByPattern");
  url.searchParams.set("answerKey", "1");
  url.searchParams.set("generationSeed", "gctx-p14-live-public-ui-d0");
  url.searchParams.set("columns", "2");
  url.searchParams.set("rowsPerPage", "4");
  url.searchParams.append("kp", KP_ID);
  url.searchParams.append("pg", GROUP_ID);
  return url;
}

mkdirSync(outputDir, { recursive: true });
const deployment = await waitForExactDeployment();
const liveUrl = buildLiveQueryUrl();
const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];

const browser = await chromium.launch({ headless: true });
let page;
try {
  page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    requestFailures.push({ url: request.url(), errorText: request.failure()?.errorText ?? "unknown" });
  });

  await page.goto(liveUrl.href, { waitUntil: "networkidle", timeout: 120000 });
  try {
    await page.waitForFunction(
      () => document.querySelector("#batch-a-source-select")?.options?.length > 0,
      null,
      { timeout: 120000 }
    );
  } catch (error) {
    const readiness = await page.evaluate(() => ({
      readyState: document.readyState,
      sourceSelectExists: Boolean(document.querySelector("#batch-a-source-select")),
      sourceOptionCount: document.querySelector("#batch-a-source-select")?.options?.length ?? null,
      statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? null,
      validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? null,
      bodyTextLength: document.body?.innerText?.length ?? 0,
      scriptCount: document.scripts.length
    }));
    throw new Error(`Live UI source hydration timeout: ${JSON.stringify(readiness)}; ${error.message}`);
  }

  const selectorStateBeforeGeneration = await page.evaluate(({ sourceId, kpId, groupId }) => {
    const patternGroupButton = document.querySelector(`[data-pattern-group-id="${groupId}"]`);
    const patternGroupSection = document.querySelector("#batch-a-pattern-group-selector");
    const patternGroupHelp = document.querySelector("#batch-a-pattern-group-help")?.textContent?.trim() ?? "";
    const patternGroupQueryMatches = new URL(location.href).searchParams.getAll("pg").includes(groupId);
    const autoAppliedSingleRepresentation = !patternGroupButton
      && patternGroupSection?.dataset?.visible === "false"
      && patternGroupHelp.includes("只有一種題目形式，系統已自動套用")
      && patternGroupQueryMatches;
    return {
      sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
      selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
      questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
      ordering: document.querySelector("#batch-a-ordering-select")?.value ?? null,
      answerKey: Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),
      generationSeed: document.querySelector("#generation-seed-input")?.value ?? null,
      columns: document.querySelector("#columns-input")?.value ?? null,
      rowsPerPage: document.querySelector("#rows-per-page-input")?.value ?? null,
      selectedKnowledgePoint: document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected ?? null,
      selectedPatternGroup: patternGroupButton?.dataset?.selected ?? (autoAppliedSingleRepresentation ? "true" : null),
      patternGroupSelectionMode: patternGroupButton
        ? "visible-control"
        : autoAppliedSingleRepresentation
          ? "auto-applied-single-representation"
          : "unresolved",
      patternGroupSelectorVisible: patternGroupSection?.dataset?.visible ?? null,
      patternGroupHelp,
      patternGroupQueryMatches,
      sourceMatches: document.querySelector("#batch-a-source-select")?.value === sourceId
    };
  }, { sourceId: SOURCE_ID, kpId: KP_ID, groupId: GROUP_ID });

  if (!selectorStateBeforeGeneration.sourceMatches
    || selectorStateBeforeGeneration.selectionMode !== "singleKnowledgePoint"
    || selectorStateBeforeGeneration.questionCount !== "25"
    || selectorStateBeforeGeneration.ordering !== "groupedByPattern"
    || selectorStateBeforeGeneration.answerKey !== true
    || selectorStateBeforeGeneration.columns !== "2"
    || selectorStateBeforeGeneration.rowsPerPage !== "4"
    || selectorStateBeforeGeneration.selectedKnowledgePoint !== "true"
    || selectorStateBeforeGeneration.selectedPatternGroup !== "true"
    || selectorStateBeforeGeneration.patternGroupQueryMatches !== true
    || !["visible-control", "auto-applied-single-representation"].includes(selectorStateBeforeGeneration.patternGroupSelectionMode)) {
    throw new Error(`Public query did not bind the expected selector state: ${JSON.stringify(selectorStateBeforeGeneration)}`);
  }

  await page.locator("#regenerate-button").click();
  try {
    await page.waitForFunction(() => {
      const status = document.querySelector("#status-panel")?.textContent ?? "";
      return status.includes("已產生") || status.includes("產生失敗");
    }, null, { timeout: 120000 });
  } catch (error) {
    const generationReadiness = await page.evaluate(() => ({
      statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? null,
      statusTone: document.querySelector("#status-panel")?.dataset?.tone ?? null,
      validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? null,
      validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
      previewMeta: document.querySelector("#preview-meta")?.textContent?.trim() ?? null,
      previewSrcdocLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
      printButtonDisabled: Boolean(document.querySelector("#print-button")?.disabled)
    }));
    throw new Error(`Live UI generation terminal-state timeout: ${JSON.stringify({ generationReadiness, consoleErrors, pageErrors, requestFailures })}; ${error.message}`);
  }

  const generationState = await page.evaluate(() => ({
    statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    statusTone: document.querySelector("#status-panel")?.dataset?.tone ?? "",
    validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    previewMeta: document.querySelector("#preview-meta")?.textContent?.trim() ?? "",
    previewSrcdocLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printButtonDisabled: Boolean(document.querySelector("#print-button")?.disabled)
  }));
  if (!generationState.statusText.includes("已產生 25 題")
    || generationState.validationHasErrors !== "false"
    || generationState.statusTone !== "success"
    || generationState.printButtonDisabled !== false) {
    throw new Error(`Live UI generation did not pass: ${JSON.stringify({ generationState, consoleErrors, pageErrors, requestFailures })}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("Live preview iframe did not expose a content frame.");
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const output = await frame.evaluate(({ requiredPhrases, legacyTargetPhrases }) => {
    const questionCells = [...document.querySelectorAll(".worksheet-cell--question")];
    const answerCells = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    const questionPrompts = questionCells.map((cell) => cell.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? "");
    const answerRows = answerCells.map((cell) => ({
      promptText: cell.querySelector(".worksheet-cell__prompt")?.textContent?.trim() ?? "",
      answerText: cell.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? ""
    }));
    const targetQuestions = questionPrompts.filter((prompt) => requiredPhrases.some((phrase) => prompt.includes(phrase)));
    const targetAnswers = answerRows.filter((row) => requiredPhrases.some((phrase) => row.promptText.includes(phrase)));
    const allText = document.body?.innerText ?? "";
    return {
      title: document.title,
      rendererProfile: document.body?.dataset?.rendererProfile ?? null,
      questionCount: questionCells.length,
      answerCount: answerCells.length,
      questionPageCount: document.querySelectorAll(".worksheet-page--questions").length,
      answerPageCount: document.querySelectorAll(".worksheet-page--answer-key").length,
      targetQuestionCount: targetQuestions.length,
      targetAnswerCount: targetAnswers.length,
      uniqueRequiredPhraseCount: requiredPhrases.filter((phrase) => targetQuestions.some((prompt) => prompt.includes(phrase))).length,
      missingRequiredPhrases: requiredPhrases.filter((phrase) => !targetQuestions.some((prompt) => prompt.includes(phrase))),
      leakedLegacyTargetPhrases: legacyTargetPhrases.filter((phrase) => allText.includes(phrase)),
      targetQuestions,
      targetAnswers,
      targetAnswersWithEquationAndAnswer: targetAnswers.filter((row) => row.answerText.includes("算式：") && row.answerText.includes("答案：")).length,
      internalIdLeakage: ["kp_g3b_u04_", "pg_g3b_u04_", "ps_g3b_u04_", "tpl_g3b_u04_"].filter((prefix) => allText.includes(prefix)),
      bodyTextLength: allText.length
    };
  }, { requiredPhrases: REQUIRED_PHRASES, legacyTargetPhrases: LEGACY_TARGET_PHRASES });

  const shellState = await page.evaluate(() => ({
    statusText: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    statusTone: document.querySelector("#status-panel")?.dataset?.tone ?? "",
    validationText: document.querySelector("#validation-panel")?.textContent?.trim() ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    previewMeta: document.querySelector("#preview-meta")?.textContent?.trim() ?? "",
    printButtonDisabled: Boolean(document.querySelector("#print-button")?.disabled),
    currentUrl: location.href
  }));

  const currentQuery = new URL(shellState.currentUrl).searchParams;
  const forbiddenQueryKeys = ["pilotMode", "globalContextPilot", "hiddenPattern", "freeFormAI"];
  const presentForbiddenQueryKeys = forbiddenQueryKeys.filter((key) => currentQuery.has(key));

  if (output.rendererProfile !== "g3b_u04_semantic_long_text_v1"
    || output.questionCount !== 25
    || output.answerCount !== 25
    || output.questionPageCount !== 4
    || output.answerPageCount !== 4
    || output.targetQuestionCount !== 5
    || output.targetAnswerCount !== 5
    || output.uniqueRequiredPhraseCount !== 5
    || output.missingRequiredPhrases.length !== 0
    || output.leakedLegacyTargetPhrases.length !== 0
    || output.targetAnswersWithEquationAndAnswer !== 5
    || output.internalIdLeakage.length !== 0
    || shellState.validationHasErrors !== "false"
    || shellState.printButtonDisabled !== false
    || presentForbiddenQueryKeys.length !== 0
    || consoleErrors.length !== 0
    || pageErrors.length !== 0
    || requestFailures.length !== 0) {
    throw new Error(`Live public UI D0 gate failed: ${JSON.stringify({ output, shellState, presentForbiddenQueryKeys, consoleErrors, pageErrors, requestFailures })}`);
  }

  const pageScreenshotPath = resolve(outputDir, "GCTX_P14_LIVE_PUBLIC_UI.png");
  const previewScreenshotPath = resolve(outputDir, "GCTX_P14_LIVE_PUBLIC_PREVIEW.png");
  const previewHtmlPath = resolve(outputDir, "GCTX_P14_LIVE_PUBLIC_PREVIEW.html");
  const evidencePath = resolve(outputDir, "GCTX_P14_LIVE_PUBLIC_UI.json");

  await page.screenshot({ path: pageScreenshotPath, fullPage: true });
  await frame.locator("body").screenshot({ path: previewScreenshotPath });
  const previewHtml = `${await frame.content()}\n`;
  writeFileSync(previewHtmlPath, previewHtml, "utf8");

  const pageScreenshot = readFileSync(pageScreenshotPath);
  const previewScreenshot = readFileSync(previewScreenshotPath);
  const evidence = {
    schemaName: "GCTXG3BU04LivePublicUID0Evidence",
    schemaVersion: 1,
    task: "GCTX-P14_G3BU04LivePublicUIProductionRegressionAndD0Closeout",
    status: "live_public_ui_production_regression_pass",
    evidenceLevel: "E6_D0_COMPLETE",
    baseUrl: baseUrl.href,
    liveQueryUrl: liveUrl.href,
    sourceId: SOURCE_ID,
    knowledgePointId: KP_ID,
    patternGroupId: GROUP_ID,
    reviewArtifactSha256: REVIEW_SHA256,
    p13PublicPdfSha256: P13_PDF_SHA256,
    deploymentAttempt: deployment.attempt,
    deployedAssetIdentityVerified: true,
    deployedAssets: deployment.assets,
    selectorState: selectorStateBeforeGeneration,
    shellState,
    output,
    forbiddenQueryKeys: presentForbiddenQueryKeys,
    consoleErrors,
    pageErrors,
    requestFailures,
    pageScreenshotPath: "docs/curriculum/output/gctx/p14-live/GCTX_P14_LIVE_PUBLIC_UI.png",
    previewScreenshotPath: "docs/curriculum/output/gctx/p14-live/GCTX_P14_LIVE_PUBLIC_PREVIEW.png",
    previewHtmlPath: "docs/curriculum/output/gctx/p14-live/GCTX_P14_LIVE_PUBLIC_PREVIEW.html",
    pageScreenshotSha256: sha256(pageScreenshot),
    previewScreenshotSha256: sha256(previewScreenshot),
    previewHtmlSha256: sha256(Buffer.from(previewHtml, "utf8")),
    fullPipeline: {
      sourceReady: true,
      knowledgePointReady: true,
      tagRegistryReady: true,
      formalMappingReady: true,
      patternSpecReady: true,
      generatorReady: true,
      validatorReady: true,
      worksheetOutputReady: true,
      publicUIReady: true,
      productionAdmitted: true,
      d0Complete: true
    }
  };
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({
    evidencePath,
    pageScreenshotPath,
    previewScreenshotPath,
    previewHtmlPath,
    deploymentAttempt: deployment.attempt,
    questionCount: output.questionCount,
    answerCount: output.answerCount,
    targetQuestionCount: output.targetQuestionCount,
    targetAnswerCount: output.targetAnswerCount,
    patternGroupSelectionMode: selectorStateBeforeGeneration.patternGroupSelectionMode,
    d0Complete: true
  }, null, 2));
} finally {
  await browser.close();
}
