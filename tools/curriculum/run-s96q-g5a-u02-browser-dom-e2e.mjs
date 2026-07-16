import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = process.env.S96Q_SITE_URL ?? "http://127.0.0.1:4174/index.html";
const SOURCE_ID = "g5a_u02_5a02";
const QUESTION_CARD_SELECTOR = ".g5a-u02-card--question, .worksheet-cell--question";
const FAILURE_PATH = "/tmp/s96q-failure.json";

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const consoleErrors = [];
const pageErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  await page.goto(`${BASE_URL}?s96q=${Date.now()}`, { waitUntil: "networkidle" });
  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "mixedKnowledgePointsSameUnit");

  const controls = page.locator("#g5a-u08-public-controls");
  await controls.waitFor({ state: "visible" });
  if (await controls.getAttribute("data-source-id") !== SOURCE_ID) fail("S96Q_CONTROL_PROFILE_SOURCE_MISMATCH");

  await page.selectOption("#g5a-u08-question-mode", "reasoning");
  await page.selectOption("#g5a-u08-depth-mode", "extended");
  await page.selectOption("#g5a-u08-context-mode", "abstract_math");
  await page.fill("#batch-a-question-count-input", "12");
  await page.click("#regenerate-button");
  await page.waitForFunction(() => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone));
  if (await page.locator("#status-panel").getAttribute("data-tone") !== "success") {
    fail("S96Q_NON_EMPTY_INTERSECTION_FAILED", {
      status: await page.locator("#status-panel").textContent(),
      validation: await page.locator("#validation-panel").textContent(),
    });
  }

  const url = new URL(page.url());
  for (const [key, expected] of [["questionMode", "reasoning"], ["depthMode", "extended"], ["contextMode", "abstract_math"]]) {
    if (url.searchParams.get(key) !== expected) fail("S96Q_QUERY_STATE_MISMATCH", { key, expected, actual: url.searchParams.get(key) });
  }

  const frame = page.frameLocator("#preview-frame");
  await frame.locator("body").waitFor({ state: "attached" });
  const body = frame.locator("body");
  if (await body.getAttribute("data-public-question-mode") !== "reasoning") fail("S96Q_PREVIEW_QUESTION_MODE_MISMATCH");
  if (await body.getAttribute("data-public-depth-mode") !== "extended") fail("S96Q_PREVIEW_DEPTH_MODE_MISMATCH");
  if (await body.getAttribute("data-public-context-mode") !== "abstract_math") fail("S96Q_PREVIEW_CONTEXT_MODE_MISMATCH");
  const questionCards = await frame.locator(QUESTION_CARD_SELECTOR).count();
  if (questionCards !== 12) {
    fail("S96Q_PREVIEW_COUNT_MISMATCH", {
      questionCards,
      sharedQuestionCards: await frame.locator(".worksheet-cell--question").count(),
      legacyQuestionCards: await frame.locator(".g5a-u02-card--question").count(),
    });
  }

  const questionModes = ["concept", "numeric", "application", "reasoning"];
  const depthModes = ["basic", "extended"];
  const contextModes = ["abstract_math", "daily_life", "geometry_context"];
  let blocked = null;
  for (const questionMode of questionModes) {
    for (const depthMode of depthModes) {
      for (const contextMode of contextModes) {
        await page.selectOption("#g5a-u08-question-mode", questionMode);
        await page.selectOption("#g5a-u08-depth-mode", depthMode);
        await page.selectOption("#g5a-u08-context-mode", contextMode);
        await page.click("#regenerate-button");
        await page.waitForFunction(() => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone));
        const tone = await page.locator("#status-panel").getAttribute("data-tone");
        if (tone === "error") {
          blocked = { questionMode, depthMode, contextMode, validation: await page.locator("#validation-panel").textContent() };
          break;
        }
      }
      if (blocked) break;
    }
    if (blocked) break;
  }
  if (!blocked) fail("S96Q_EMPTY_INTERSECTION_NOT_FOUND");
  if (!(await page.locator("#print-button").isDisabled())) fail("S96Q_BLOCKED_PRINT_BUTTON_ENABLED", blocked);
  if (consoleErrors.length || pageErrors.length) fail("S96Q_BROWSER_ERRORS", { consoleErrors, pageErrors });

  console.log(JSON.stringify({
    task: "S96Q_G5A_U02_BrowserDOME2E",
    status: "PASS",
    sourceId: SOURCE_ID,
    acceptedQuestionSelector: QUESTION_CARD_SELECTOR,
    successfulControls: { questionMode: "reasoning", depthMode: "extended", contextMode: "abstract_math" },
    blockedControls: blocked,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
  }, null, 2));
} catch (error) {
  const failure = {
    task: "S96Q_G5A_U02_BrowserDOME2E",
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
  process.exitCode = 1;
} finally {
  await browser.close();
}
