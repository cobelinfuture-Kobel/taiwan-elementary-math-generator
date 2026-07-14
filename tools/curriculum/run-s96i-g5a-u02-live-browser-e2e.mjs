import { chromium } from "playwright";

const BASE_URL = process.env.S96I_SITE_URL ?? "http://127.0.0.1:4174/index.html";
const SOURCE_ID = "g5a_u02_5a02";
const EXPECTED_KP_COUNT = 18;
const QUESTION_COUNT = 20;
const DEFAULT_SEED = "batch-a-browser";

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const consoleErrors = [];
const pageErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  await page.goto(`${BASE_URL}?s96i=${Date.now()}`, { waitUntil: "networkidle" });
  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");

  const kpButtons = page.locator("#batch-a-knowledge-point-panel [data-knowledge-point-id]");
  await kpButtons.first().waitFor({ state: "visible" });
  const kpCount = await kpButtons.count();
  if (kpCount !== EXPECTED_KP_COUNT) fail("S96I_KP_COUNT_MISMATCH", { kpCount });

  await page.fill("#batch-a-question-count-input", String(QUESTION_COUNT));
  await page.fill("#generation-seed-input", DEFAULT_SEED);

  const results = [];
  for (let index = 0; index < kpCount; index += 1) {
    const button = kpButtons.nth(index);
    const knowledgePointId = await button.getAttribute("data-knowledge-point-id");
    const label = (await button.locator("strong").textContent())?.replace(/^已選｜/, "").trim();

    await button.click();
    await page.check("#batch-a-answer-key-input");
    await page.click("#regenerate-button");

    await page.waitForFunction(() => {
      const panel = document.querySelector("#status-panel");
      return panel?.dataset.tone === "success" || panel?.dataset.tone === "error";
    });

    const status = (await page.locator("#status-panel").textContent())?.trim();
    const tone = await page.locator("#status-panel").getAttribute("data-tone");
    const validation = (await page.locator("#validation-panel").textContent())?.trim();
    if (tone !== "success") {
      fail("S96I_PUBLIC_GENERATION_FAILED", {
        knowledgePointId,
        label,
        status,
        validation,
        url: page.url(),
      });
    }

    const printDisabled = await page.locator("#print-button").isDisabled();
    if (printDisabled) fail("S96I_PRINT_BUTTON_NOT_ENABLED", { knowledgePointId, label });

    const frame = page.frameLocator("#preview-frame");
    await frame.locator("body").waitFor({ state: "attached" });
    const questionCards = await frame.locator(".g5a-u02-card--question").count();
    const answerCards = await frame.locator(".g5a-u02-card--answer").count();
    if (questionCards !== QUESTION_COUNT) {
      fail("S96I_PREVIEW_QUESTION_COUNT_MISMATCH", { knowledgePointId, label, questionCards });
    }
    if (answerCards !== QUESTION_COUNT) {
      fail("S96I_PREVIEW_ANSWER_COUNT_MISMATCH", { knowledgePointId, label, answerCards });
    }

    results.push({ knowledgePointId, label, questionCards, answerCards });
  }

  const reportedButton = kpButtons.filter({ hasText: "多條件四位數推理" });
  if (await reportedButton.count() !== 1) fail("S96I_REPORTED_KP_NOT_FOUND");
  await reportedButton.click();
  await page.uncheck("#batch-a-answer-key-input");
  await page.click("#regenerate-button");
  await page.waitForFunction(() => document.querySelector("#status-panel")?.dataset.tone !== "");

  const reportedTone = await page.locator("#status-panel").getAttribute("data-tone");
  const reportedStatus = (await page.locator("#status-panel").textContent())?.trim();
  const reportedValidation = (await page.locator("#validation-panel").textContent())?.trim();
  if (reportedTone !== "success") {
    fail("S96I_REPORTED_PATH_FAILED", { reportedStatus, reportedValidation, url: page.url() });
  }

  const reportedFrame = page.frameLocator("#preview-frame");
  const reportedQuestions = await reportedFrame.locator(".g5a-u02-card--question").count();
  const reportedAnswers = await reportedFrame.locator(".g5a-u02-card--answer").count();
  if (reportedQuestions !== QUESTION_COUNT || reportedAnswers !== 0) {
    fail("S96I_REPORTED_PATH_COUNT_MISMATCH", { reportedQuestions, reportedAnswers });
  }

  await page.locator("#preview-frame").evaluate((iframe) => {
    iframe.contentWindow.__s96iPrintCalled = false;
    iframe.contentWindow.print = () => {
      iframe.contentWindow.__s96iPrintCalled = true;
    };
  });
  await page.click("#print-button");
  const printCalled = await page.locator("#preview-frame").evaluate((iframe) => iframe.contentWindow.__s96iPrintCalled);
  if (!printCalled) fail("S96I_PRINT_TARGET_NOT_INVOKED");

  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    fail("S96I_BROWSER_ERROR_DETECTED", { consoleErrors, pageErrors });
  }

  console.log(JSON.stringify({
    task: "S96I_G5A_U02_LiveBrowserGenerationIncidentRecovery",
    status: "PASS",
    sourceId: SOURCE_ID,
    knowledgePointCount: kpCount,
    questionCount: QUESTION_COUNT,
    generationSeed: DEFAULT_SEED,
    allKnowledgePointsGenerated: results.length,
    reportedPath: {
      knowledgePoint: "多條件四位數推理",
      includeAnswerKey: false,
      questionCards: reportedQuestions,
      answerCards: reportedAnswers,
      printCalled,
    },
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
  }, null, 2));
} catch (error) {
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  console.error(JSON.stringify({ consoleErrors, pageErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
