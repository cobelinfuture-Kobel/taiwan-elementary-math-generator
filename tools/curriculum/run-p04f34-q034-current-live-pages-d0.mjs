import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const SITE_URL = process.env.P04F34_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const SOURCE_ID = "g5a_u06_5a06";
const KP_ID = "kp_g5a_u06_measurement_difference_context";
const QUESTION_COUNT = 24;
const OUTPUT = path.resolve("tmp/p04f34-q034-current-live-pages-d0");
fs.mkdirSync(OUTPUT, { recursive: true });

function cacheBustedUrl() {
  const url = new URL(SITE_URL);
  url.searchParams.set("p04f34_live_acceptance", `${Date.now()}`);
  return url.toString();
}

const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];
let report = null;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("requestfailed", (request) => requestFailures.push({
    url: request.url(),
    failure: request.failure()?.errorText ?? "unknown",
  }));

  const requestedUrl = cacheBustedUrl();
  const response = await page.goto(requestedUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("#batch-a-grade-select", { timeout: 30_000 });
  await page.waitForSelector("#batch-a-semester-select", { timeout: 30_000 });
  await page.waitForSelector("#batch-a-source-select", { timeout: 30_000 });

  await page.selectOption("#batch-a-grade-select", "5");
  await page.waitForFunction(() => [...document.querySelectorAll("#batch-a-semester-select option")]
    .some((option) => option.value === "upper"));
  await page.selectOption("#batch-a-semester-select", "upper");
  await page.waitForFunction((sourceId) => [...document.querySelectorAll("#batch-a-source-select option")]
    .some((option) => option.value === sourceId), SOURCE_ID);
  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.waitForFunction((sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId, SOURCE_ID);
  await page.waitForFunction((knowledgePointId) => Boolean(document.querySelector(`[data-knowledge-point-id="${knowledgePointId}"]`)), KP_ID);

  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  await page.click(`[data-knowledge-point-id="${KP_ID}"]`);
  await page.waitForFunction((knowledgePointId) => document.querySelector(`[data-knowledge-point-id="${knowledgePointId}"]`)?.dataset.selected === "true", KP_ID);

  await page.fill("#batch-a-question-count-input", String(QUESTION_COUNT));
  await page.dispatchEvent("#batch-a-question-count-input", "change");
  await page.fill("#columns-input", "2");
  await page.dispatchEvent("#columns-input", "change");
  await page.fill("#rows-per-page-input", "4");
  await page.dispatchEvent("#rows-per-page-input", "change");

  const preGenerate = await page.evaluate(() => ({
    grade: document.querySelector("#batch-a-grade-select")?.value ?? null,
    semester: document.querySelector("#batch-a-semester-select")?.value ?? null,
    sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
    selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
    selectedKnowledgePointIds: [...document.querySelectorAll("[data-knowledge-point-id][data-selected='true']")]
      .map((node) => node.dataset.knowledgePointId),
    selectedPatternGroupIds: [...document.querySelectorAll("[data-pattern-group-id][data-selected='true']")]
      .map((node) => node.dataset.patternGroupId),
    questionCount: document.querySelector("#batch-a-question-count-input")?.value ?? null,
    columns: document.querySelector("#columns-input")?.value ?? null,
    rowsPerPage: document.querySelector("#rows-per-page-input")?.value ?? null,
    knowledgePointAvailabilitySummary: document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent ?? null,
  }));

  await page.click("#regenerate-button");
  await page.waitForFunction(() => {
    const text = document.querySelector("#status-panel")?.textContent ?? "";
    return text.includes("已產生") || text.includes("產生失敗");
  }, { timeout: 45_000 });
  await page.waitForTimeout(250);

  const postGenerate = await page.evaluate(() => {
    const frame = document.querySelector("#preview-frame");
    let worksheetPageCount = 0;
    let previewBodyText = "";
    try {
      worksheetPageCount = frame?.contentDocument?.querySelectorAll(".worksheet-page")?.length ?? 0;
      previewBodyText = frame?.contentDocument?.body?.textContent ?? "";
    } catch {
      // Cross-origin access is not expected for srcdoc, but keep evidence if it changes.
    }
    return {
      statusText: document.querySelector("#status-panel")?.textContent ?? "",
      statusTone: document.querySelector("#status-panel")?.dataset.tone ?? "",
      validationText: document.querySelector("#validation-panel")?.textContent ?? "",
      validationHasErrors: document.querySelector("#validation-panel")?.dataset.hasErrors ?? null,
      previewMeta: document.querySelector("#preview-meta")?.textContent ?? "",
      previewSrcdocLength: String(frame?.srcdoc ?? "").length,
      worksheetPageCount,
      previewBodyText: previewBodyText.slice(0, 1000),
      currentUrl: location.href,
    };
  });

  report = {
    schemaName: "P04F34Q034CurrentLivePagesFocusedD0AcceptanceV1",
    siteUrl: SITE_URL,
    requestedUrl,
    httpStatus: response?.status() ?? null,
    preGenerate,
    postGenerate,
    consoleErrors,
    pageErrors,
    requestFailures,
  };

  const pass = response?.ok() === true
    && preGenerate.grade === "5"
    && preGenerate.semester === "upper"
    && preGenerate.sourceId === SOURCE_ID
    && preGenerate.selectionMode === "singleKnowledgePoint"
    && preGenerate.selectedKnowledgePointIds.length === 1
    && preGenerate.selectedKnowledgePointIds[0] === KP_ID
    && preGenerate.questionCount === String(QUESTION_COUNT)
    && postGenerate.statusText.includes(`已產生 ${QUESTION_COUNT} 題`)
    && postGenerate.validationHasErrors === "false"
    && postGenerate.validationText.includes("驗證通過")
    && postGenerate.previewSrcdocLength > 0
    && postGenerate.worksheetPageCount > 0
    && pageErrors.length === 0;

  fs.writeFileSync(path.join(OUTPUT, "report.json"), `${JSON.stringify({ ...report, status: pass ? "PASS" : "FAIL" }, null, 2)}\n`);
  console.log(`P04F34_Q034_CURRENT_LIVE_PAGES_D0=${JSON.stringify({ ...report, status: pass ? "PASS" : "FAIL" })}`);

  if (!pass) {
    await page.screenshot({ path: path.join(OUTPUT, "failure.png"), fullPage: true });
    throw new Error(`P04F34_Q034_CURRENT_LIVE_PAGES_D0_FAILED:${JSON.stringify(report)}`);
  }
} catch (error) {
  if (!report) {
    report = {
      schemaName: "P04F34Q034CurrentLivePagesFocusedD0AcceptanceV1",
      siteUrl: SITE_URL,
      consoleErrors,
      pageErrors,
      requestFailures,
      fatalError: String(error?.stack ?? error),
    };
    fs.writeFileSync(path.join(OUTPUT, "report.json"), `${JSON.stringify({ ...report, status: "FAIL" }, null, 2)}\n`);
  }
  throw error;
} finally {
  await browser.close();
}
