import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.S96S_SITE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const DEPLOYMENT_SHA = process.env.S96S_DEPLOYMENT_SHA ?? "unknown";
const SOURCE_ID = "g5a_u02_5a02";
const EXPECTED_TITLE = "因數與公因數";
const EXPECTED_KP_COUNT = 18;
const QUESTION_COUNT = 20;
const DEFAULT_SEED = "batch-a-browser";
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/s96s-deployed-pages");

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

async function sha256Url(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) fail("S96S_ASSET_FETCH_FAILED", { url, status: response.status });
  const bytes = Buffer.from(await response.arrayBuffer());
  return { url, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

function expectedStatus() {
  return `已產生 ${QUESTION_COUNT} 題，可預覽與列印。`;
}

function expectedPreviewMeta(includeAnswerKey) {
  return `${EXPECTED_TITLE}｜${QUESTION_COUNT} 題｜${includeAnswerKey ? "含答案頁" : "不含答案頁"}`;
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const consoleErrors = [];
const pageErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  const testedUrl = `${BASE_URL}?s96s=${encodeURIComponent(DEPLOYMENT_SHA)}-${Date.now()}`;
  const response = await page.goto(testedUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) fail("S96S_DEPLOYED_PAGE_HTTP_FAILED", { status: response?.status(), testedUrl });

  const moduleSrcs = await page.locator('script[type="module"][src]').evaluateAll((nodes) => nodes.map((node) => new URL(node.getAttribute("src"), document.baseURI).href));
  if (!moduleSrcs.length) fail("S96S_DEPLOYED_MODULE_ENTRY_MISSING");
  const mainAsset = await sha256Url(moduleSrcs.find((url) => url.endsWith("/assets/browser/main.js")) ?? moduleSrcs[0]);
  const runtimeAsset = await sha256Url(new URL("./modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js", BASE_URL).href);

  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  const kpButtons = page.locator("#batch-a-knowledge-point-panel [data-knowledge-point-id]");
  await kpButtons.first().waitFor({ state: "visible" });
  const kpCount = await kpButtons.count();
  if (kpCount !== EXPECTED_KP_COUNT) fail("S96S_DEPLOYED_KP_COUNT_MISMATCH", { kpCount });

  await page.fill("#batch-a-question-count-input", String(QUESTION_COUNT));
  await page.fill("#generation-seed-input", DEFAULT_SEED);
  const generated = [];
  for (let index = 0; index < kpCount; index += 1) {
    const button = kpButtons.nth(index);
    const knowledgePointId = await button.getAttribute("data-knowledge-point-id");
    const label = (await button.locator("strong").textContent())?.replace(/^已選｜/, "").trim();
    await button.click();
    await page.check("#batch-a-answer-key-input");
    await page.click("#regenerate-button");
    await page.waitForFunction(() => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone));
    const tone = await page.locator("#status-panel").getAttribute("data-tone");
    const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
    const previewMeta = (await page.locator("#preview-meta").textContent())?.trim() ?? "";
    if (tone !== "success") {
      fail("S96S_DEPLOYED_KP_GENERATION_FAILED", {
        knowledgePointId,
        label,
        status,
        validation: (await page.locator("#validation-panel").textContent())?.trim(),
        testedUrl,
      });
    }
    if (status !== expectedStatus()) {
      fail("S96S_DEPLOYED_PUBLIC_COUNT_STATUS_MISMATCH", { knowledgePointId, label, status, expectedStatus: expectedStatus() });
    }
    if (previewMeta !== expectedPreviewMeta(true)) {
      fail("S96S_DEPLOYED_PUBLIC_PREVIEW_META_MISMATCH", { knowledgePointId, label, previewMeta, expectedPreviewMeta: expectedPreviewMeta(true) });
    }
    const frame = page.frameLocator("#preview-frame");
    await frame.locator("body").waitFor({ state: "attached" });
    const questionCards = await frame.locator(".g5a-u02-card--question").count();
    const answerCards = await frame.locator(".g5a-u02-card--answer").count();
    if (questionCards !== QUESTION_COUNT || answerCards !== QUESTION_COUNT) {
      fail("S96S_DEPLOYED_CARD_COUNT_MISMATCH", { knowledgePointId, label, questionCards, answerCards });
    }
    if (await page.locator("#print-button").isDisabled()) fail("S96S_DEPLOYED_PRINT_DISABLED", { knowledgePointId, label });
    generated.push({ knowledgePointId, label, questionCards, answerCards, status, previewMeta });
  }

  const reportedButton = kpButtons.filter({ hasText: "多條件四位數推理" });
  if (await reportedButton.count() !== 1) fail("S96S_REPORTED_KP_NOT_FOUND");
  await reportedButton.click();
  await page.selectOption("#g5a-u08-question-mode", "reasoning");
  await page.selectOption("#g5a-u08-depth-mode", "extended");
  await page.selectOption("#g5a-u08-context-mode", "abstract_math");
  await page.uncheck("#batch-a-answer-key-input");
  await page.click("#regenerate-button");
  await page.waitForFunction(() => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone));
  const reportedStatus = (await page.locator("#status-panel").textContent())?.trim() ?? "";
  const reportedPreviewMeta = (await page.locator("#preview-meta").textContent())?.trim() ?? "";
  if (await page.locator("#status-panel").getAttribute("data-tone") !== "success") {
    fail("S96S_REPORTED_CONTROL_PATH_FAILED", {
      status: reportedStatus,
      validation: (await page.locator("#validation-panel").textContent())?.trim(),
      testedUrl,
    });
  }
  if (reportedStatus !== expectedStatus()) {
    fail("S96S_REPORTED_PUBLIC_COUNT_STATUS_MISMATCH", { reportedStatus, expectedStatus: expectedStatus() });
  }
  if (reportedPreviewMeta !== expectedPreviewMeta(false)) {
    fail("S96S_REPORTED_PUBLIC_PREVIEW_META_MISMATCH", { reportedPreviewMeta, expectedPreviewMeta: expectedPreviewMeta(false) });
  }

  const frame = page.frameLocator("#preview-frame");
  const reportedQuestions = await frame.locator(".g5a-u02-card--question").count();
  const reportedAnswers = await frame.locator(".g5a-u02-card--answer").count();
  const bodyControls = await frame.locator("body").evaluate((body) => ({
    questionMode: body.dataset.publicQuestionMode,
    depthMode: body.dataset.publicDepthMode,
    contextMode: body.dataset.publicContextMode,
    genericFallback: body.dataset.publicGenericFallback,
  }));
  if (reportedQuestions !== QUESTION_COUNT || reportedAnswers !== 0) fail("S96S_REPORTED_OUTPUT_COUNT_MISMATCH", { reportedQuestions, reportedAnswers });
  if (bodyControls.questionMode !== "reasoning" || bodyControls.depthMode !== "extended" || bodyControls.contextMode !== "abstract_math" || bodyControls.genericFallback !== "false") {
    fail("S96S_REPORTED_CONTROL_METADATA_MISMATCH", bodyControls);
  }

  await page.locator("#preview-frame").evaluate((iframe) => {
    iframe.contentWindow.__s96sPrintCalled = false;
    iframe.contentWindow.print = () => { iframe.contentWindow.__s96sPrintCalled = true; };
  });
  await page.click("#print-button");
  const printCalled = await page.locator("#preview-frame").evaluate((iframe) => iframe.contentWindow.__s96sPrintCalled);
  if (!printCalled) fail("S96S_DEPLOYED_PRINT_TARGET_NOT_INVOKED");
  if (consoleErrors.length || pageErrors.length) fail("S96S_DEPLOYED_BROWSER_ERRORS", { consoleErrors, pageErrors });

  const manifest = {
    task: "S96S_G5A_U02_DeployedGitHubPagesSmoke",
    status: "PASS",
    deploymentSha: DEPLOYMENT_SHA,
    testedUrl,
    sourceId: SOURCE_ID,
    expectedTitle: EXPECTED_TITLE,
    knowledgePointCount: kpCount,
    generatedKnowledgePointCount: generated.length,
    questionCount: QUESTION_COUNT,
    publicCountStatusVerified: true,
    publicPreviewTitleVerified: true,
    generationSeed: DEFAULT_SEED,
    deployedAssets: { mainAsset, runtimeAsset },
    reportedPath: {
      knowledgePoint: "多條件四位數推理",
      questionMode: "reasoning",
      depthMode: "extended",
      contextMode: "abstract_math",
      includeAnswerKey: false,
      questionCards: reportedQuestions,
      answerCards: reportedAnswers,
      status: reportedStatus,
      previewMeta: reportedPreviewMeta,
      printCalled,
      bodyControls,
    },
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    genericFallback: false,
    freeFormAI: false,
  };
  await writeFile(resolve(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest, null, 2));
} catch (error) {
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  console.error(JSON.stringify({ consoleErrors, pageErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
