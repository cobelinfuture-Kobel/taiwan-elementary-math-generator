import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = process.env.S96I_SITE_URL ?? "http://127.0.0.1:4174/index.html";
const SOURCE_ID = "g5a_u02_5a02";
const EXPECTED_KP_COUNT = 18;
const QUESTION_COUNT = 20;
const DEFAULT_SEED = "batch-a-browser";
const QUESTION_CARD_SELECTOR = ".g5a-u02-card--question, .worksheet-cell--question";
const ANSWER_CARD_SELECTOR = ".g5a-u02-card--answer, .worksheet-cell--answer-key";
const FAILURE_PATH = "/tmp/s96i-failure.json";

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

async function countPreviewCards(frame) {
  return {
    questionCards: await frame.locator(QUESTION_CARD_SELECTOR).count(),
    answerCards: await frame.locator(ANSWER_CARD_SELECTOR).count(),
    sharedQuestionCards: await frame.locator(".worksheet-cell--question").count(),
    sharedAnswerCards: await frame.locator(".worksheet-cell--answer-key").count(),
    legacyQuestionCards: await frame.locator(".g5a-u02-card--question").count(),
    legacyAnswerCards: await frame.locator(".g5a-u02-card--answer").count(),
  };
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
    const counts = await countPreviewCards(frame);
    if (counts.questionCards !== QUESTION_COUNT) {
      fail("S96I_PREVIEW_QUESTION_COUNT_MISMATCH", { knowledgePointId, label, ...counts });
    }
    if (counts.answerCards !== QUESTION_COUNT) {
      fail("S96I_PREVIEW_ANSWER_COUNT_MISMATCH", { knowledgePointId, label, ...counts });
    }

    results.push({ knowledgePointId, label, ...counts });
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
  const reportedCounts = await countPreviewCards(reportedFrame);
  if (reportedCounts.questionCards !== QUESTION_COUNT || reportedCounts.answerCards !== 0) {
    fail("S96I_REPORTED_PATH_COUNT_MISMATCH", reportedCounts);
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
    acceptedRendererSelectors: [QUESTION_CARD_SELECTOR, ANSWER_CARD_SELECTOR],
    allKnowledgePointsGenerated: results.length,
    reportedPath: {
      knowledgePoint: "多條件四位數推理",
      includeAnswerKey: false,
      ...reportedCounts,
      printCalled,
    },
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
  }, null, 2));
} catch (error) {
  const failure = {
    task: "S96I_G5A_U02_LiveBrowserGenerationIncidentRecovery",
    status: "FAIL",
    error: error.message,
    details: error.details ?? null,
    url: page.url(),
    consoleErrors,
    pageErrors,
  };
  await writeFile(FAILURE_PATH, `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  console.error(JSON.stringify({ consoleErrors, pageErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
