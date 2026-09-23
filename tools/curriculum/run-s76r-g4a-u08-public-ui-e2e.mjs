import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.S76R_SITE_URL ?? "http://127.0.0.1:4174/index.html";
const SOURCE_ID = "g4a_u08_4a08";
const QUESTION_COUNT = 112;
const ARTIFACT_ROOT = resolve("artifacts/s76r-g4a-u08");
const DIAGNOSTIC_PATH = resolve(ARTIFACT_ROOT, "S76R_G4A_U08_PublicUIE2E.failure.json");
const SCREENSHOT_PATH = resolve(ARTIFACT_ROOT, "S76R_G4A_U08_PublicUIE2E.failure.png");

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
  await page.goto(`${BASE_URL}?s76r=${Date.now()}`, { waitUntil: "networkidle", timeout: 120000 });
  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "mixedKnowledgePointsSameUnit");

  const kpButtons = page.locator("#batch-a-knowledge-point-panel [data-knowledge-point-id]");
  await kpButtons.first().waitFor({ state: "visible" });
  const knowledgePointCount = await kpButtons.count();
  if (knowledgePointCount !== 15) fail("S76R_VISIBLE_KP_COUNT_MISMATCH", { knowledgePointCount });
  const selectedKnowledgePointCount = await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]').count();
  if (selectedKnowledgePointCount !== 15) fail("S76R_SELECTED_KP_COUNT_MISMATCH", { selectedKnowledgePointCount });

  let clickCount = 0;
  while (true) {
    const unselected = page.locator('#batch-a-pattern-group-panel [data-pattern-group-id][data-selected="false"]');
    if (await unselected.count() === 0) break;
    await unselected.first().click();
    clickCount += 1;
    if (clickCount > 40) fail("S76R_PATTERN_GROUP_SELECTION_LOOP_EXCEEDED");
  }

  let url = new URL(page.url());
  const selectedKnowledgePointIds = url.searchParams.getAll("kp");
  const selectedPatternGroupIds = url.searchParams.getAll("pg");
  if (new Set(selectedKnowledgePointIds).size !== 15) fail("S76R_QUERY_KP_COUNT_MISMATCH", { selectedKnowledgePointIds });
  if (new Set(selectedPatternGroupIds).size !== 28) fail("S76R_QUERY_GROUP_COUNT_MISMATCH", { selectedPatternGroupIds });

  await page.reload({ waitUntil: "networkidle", timeout: 120000 });
  if (await page.locator("#batch-a-source-select").inputValue() !== SOURCE_ID) fail("S76R_QUERY_SOURCE_REPLAY_FAILED");
  if (await page.locator("#batch-a-selection-mode-select").inputValue() !== "mixedKnowledgePointsSameUnit") fail("S76R_QUERY_MODE_REPLAY_FAILED");
  const replayKpButtons = page.locator("#batch-a-knowledge-point-panel [data-knowledge-point-id]");
  await replayKpButtons.first().waitFor({ state: "visible" });
  if (await replayKpButtons.count() !== 15) fail("S76R_QUERY_KP_REPLAY_COUNT_MISMATCH");
  if (await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]').count() !== 15) fail("S76R_QUERY_KP_REPLAY_SELECTION_MISMATCH");
  url = new URL(page.url());
  if (new Set(url.searchParams.getAll("pg")).size !== 28) fail("S76R_QUERY_GROUP_REPLAY_COUNT_MISMATCH");

  await page.fill("#batch-a-question-count-input", String(QUESTION_COUNT));
  await page.fill("#generation-seed-input", "s76r-g4a-u08-public-ui");
  await page.check("#batch-a-answer-key-input");
  await page.click("#regenerate-button");
  await page.waitForFunction(() => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone), null, { timeout: 120000 });

  const statusTone = await page.locator("#status-panel").getAttribute("data-tone");
  const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
  const validation = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
  if (statusTone !== "success") fail("S76R_PUBLIC_GENERATION_FAILED", { status, validation });
  if (status !== `已產生 ${QUESTION_COUNT} 題，可預覽與列印。`) fail("S76R_PUBLIC_STATUS_MISMATCH", { status });

  const frame = page.frameLocator("#preview-frame");
  await frame.locator("body").waitFor({ state: "attached" });
  const questionCards = await frame.locator(".worksheet-cell--question").count();
  const answerCards = await frame.locator(".worksheet-cell--answer-key").count();
  const questionPages = await frame.locator(".worksheet-page--questions").count();
  const answerPages = await frame.locator(".worksheet-page--answer-key").count();
  if (questionCards !== QUESTION_COUNT || answerCards !== QUESTION_COUNT) {
    fail("S76R_PUBLIC_PREVIEW_COUNT_MISMATCH", { questionCards, answerCards });
  }
  if (questionPages < 1 || answerPages < 1) fail("S76R_PUBLIC_PREVIEW_PAGE_MISSING", { questionPages, answerPages });

  const publicText = await frame.locator("body").innerText();
  if (/\b(?:kp|pg|ps|tpl)_g4a_u08_[a-z0-9_]+\b/i.test(publicText)) fail("S76R_PUBLIC_INTERNAL_ID_LEAK");
  if (/\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(publicText)) fail("S76R_PUBLIC_PLACEHOLDER_LEAK");

  await page.locator("#preview-frame").evaluate((iframe) => {
    iframe.contentWindow.__s76rPrintCalled = false;
    iframe.contentWindow.print = () => { iframe.contentWindow.__s76rPrintCalled = true; };
  });
  await page.click("#print-button");
  const printCalled = await page.locator("#preview-frame").evaluate((iframe) => iframe.contentWindow.__s76rPrintCalled);
  if (!printCalled) fail("S76R_PUBLIC_PRINT_TARGET_NOT_INVOKED");
  if (consoleErrors.length || pageErrors.length) fail("S76R_PUBLIC_BROWSER_ERRORS", { consoleErrors, pageErrors });

  console.log(JSON.stringify({
    task: "S76R_G4A_U08_PublicUIE2E",
    status: "PASS",
    sourceId: SOURCE_ID,
    knowledgePointCount,
    selectedPatternGroupCount: new Set(selectedPatternGroupIds).size,
    questionCount: questionCards,
    answerKeyItemCount: answerCards,
    questionPageCount: questionPages,
    answerPageCount: answerPages,
    publicStatus: status,
    printCalled,
    queryStateReplay: "pass",
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
  }, null, 2));
} catch (error) {
  mkdirSync(ARTIFACT_ROOT, { recursive: true });
  const diagnostic = {
    task: "S76R_G4A_U08_PublicUIE2E",
    status: "FAIL",
    message: error.message,
    details: error.details ?? null,
    pageUrl: page.url(),
    consoleErrors,
    pageErrors,
  };
  writeFileSync(DIAGNOSTIC_PATH, `${JSON.stringify(diagnostic, null, 2)}\n`, "utf8");
  try {
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  } catch (screenshotError) {
    diagnostic.screenshotError = screenshotError.message;
    writeFileSync(DIAGNOSTIC_PATH, `${JSON.stringify(diagnostic, null, 2)}\n`, "utf8");
  }
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  console.error(JSON.stringify({ consoleErrors, pageErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
