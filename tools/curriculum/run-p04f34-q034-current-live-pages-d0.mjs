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

function writeReport(payload) {
  fs.writeFileSync(path.join(OUTPUT, "report.json"), `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`P04F34_Q034_CURRENT_LIVE_PAGES_D0=${JSON.stringify(payload)}`);
}

async function collectBootSnapshot(page) {
  return page.evaluate(() => ({
    readyState: document.readyState,
    currentUrl: location.href,
    moduleScripts: [...document.querySelectorAll("script[type='module']")].map((node) => ({
      src: node.src,
      textLength: String(node.textContent ?? "").length,
    })),
    gradeOptions: [...document.querySelectorAll("#batch-a-grade-select option")].map((option) => ({ value: option.value, text: option.textContent })),
    semesterOptions: [...document.querySelectorAll("#batch-a-semester-select option")].map((option) => ({ value: option.value, text: option.textContent })),
    sourceOptions: [...document.querySelectorAll("#batch-a-source-select option")].map((option) => ({ value: option.value, text: option.textContent })),
    statusText: document.querySelector("#status-panel")?.textContent ?? "",
    validationText: document.querySelector("#validation-panel")?.textContent ?? "",
    resourceEntries: performance.getEntriesByType("resource")
      .map((entry) => ({ name: entry.name, initiatorType: entry.initiatorType, duration: Math.round(entry.duration) }))
      .filter((entry) => entry.name.includes("/assets/browser/") || entry.name.includes("/modules/curriculum/"))
      .slice(-300),
  }));
}

async function crawlStaticModuleGraph(page) {
  return page.evaluate(async () => {
    const startUrl = new URL("./assets/browser/main.js", location.href).href;
    const queue = [startUrl];
    const seen = new Set();
    const records = [];
    const importPattern = /(?:import|export)\s+(?:[^'\"]*?\sfrom\s*)?["']([^"']+)["']/g;
    while (queue.length > 0 && seen.size < 500) {
      const url = queue.shift();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      try {
        const response = await fetch(url, { cache: "no-store" });
        const contentType = response.headers.get("content-type") ?? "";
        const text = await response.text();
        const imports = [];
        if (response.ok && /javascript|ecmascript|text\/plain/i.test(contentType)) {
          for (const match of text.matchAll(importPattern)) {
            const specifier = match[1];
            if (!specifier?.startsWith(".")) continue;
            const resolved = new URL(specifier, url).href;
            imports.push(resolved);
            if (!seen.has(resolved)) queue.push(resolved);
          }
        }
        records.push({ url, status: response.status, ok: response.ok, contentType, byteLength: text.length, imports });
      } catch (error) {
        records.push({ url, status: null, ok: false, contentType: null, byteLength: 0, imports: [], fetchError: String(error) });
      }
    }
    return {
      startUrl,
      moduleCount: records.length,
      failedModules: records.filter((record) => !record.ok),
      nonJavascriptModules: records.filter((record) => record.ok && !/javascript|ecmascript|text\/plain/i.test(record.contentType ?? "")),
      records,
    };
  });
}

async function probeExplicitMainImport(page) {
  return page.evaluate(async () => {
    const url = new URL("./assets/browser/main.js", location.href);
    url.searchParams.set("p04f34_boot_probe", String(Date.now()));
    try {
      await import(url.href);
      return { ok: true, url: url.href, error: null };
    } catch (error) {
      return { ok: false, url: url.href, error: String(error?.stack ?? error) };
    }
  });
}

const consoleErrors = [];
const consoleMessages = [];
const pageErrors = [];
const requestFailures = [];
const httpFailures = [];
const javascriptResponses = [];
let report = null;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on("console", (message) => {
    const row = { type: message.type(), text: message.text() };
    consoleMessages.push(row);
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error?.stack ?? error)));
  page.on("requestfailed", (request) => requestFailures.push({
    url: request.url(),
    resourceType: request.resourceType(),
    failure: request.failure()?.errorText ?? "unknown",
  }));
  page.on("response", (response) => {
    const request = response.request();
    const row = {
      url: response.url(),
      status: response.status(),
      resourceType: request.resourceType(),
      contentType: response.headers()["content-type"] ?? null,
    };
    if (response.status() >= 400) httpFailures.push(row);
    if (request.resourceType() === "script" || /\.(?:m?js)(?:\?|$)/i.test(response.url())) javascriptResponses.push(row);
  });

  const requestedUrl = cacheBustedUrl();
  const response = await page.goto(requestedUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("#batch-a-grade-select", { timeout: 30_000 });
  await page.waitForSelector("#batch-a-semester-select", { timeout: 30_000 });
  await page.waitForSelector("#batch-a-source-select", { timeout: 30_000 });

  let bootReady = true;
  try {
    await page.waitForFunction(() => [...document.querySelectorAll("#batch-a-grade-select option")]
      .some((option) => option.value === "5"), { timeout: 15_000 });
  } catch {
    bootReady = false;
  }

  const bootSnapshotBeforeProbe = await collectBootSnapshot(page);
  let staticModuleGraph = null;
  let explicitMainImportProbe = null;
  let bootSnapshotAfterProbe = null;
  if (!bootReady) {
    staticModuleGraph = await crawlStaticModuleGraph(page);
    explicitMainImportProbe = await probeExplicitMainImport(page);
    await page.waitForTimeout(500);
    bootSnapshotAfterProbe = await collectBootSnapshot(page);
    report = {
      schemaName: "P04F34Q034CurrentLivePagesFocusedD0AcceptanceV2",
      phase: "CLASSIC_UI_BOOT",
      siteUrl: SITE_URL,
      requestedUrl,
      httpStatus: response?.status() ?? null,
      bootReady,
      bootSnapshotBeforeProbe,
      explicitMainImportProbe,
      bootSnapshotAfterProbe,
      staticModuleGraphSummary: staticModuleGraph ? {
        startUrl: staticModuleGraph.startUrl,
        moduleCount: staticModuleGraph.moduleCount,
        failedModules: staticModuleGraph.failedModules,
        nonJavascriptModules: staticModuleGraph.nonJavascriptModules,
      } : null,
      javascriptResponses,
      httpFailures,
      consoleErrors,
      consoleMessages,
      pageErrors,
      requestFailures,
      status: "FAIL",
    };
    writeReport(report);
    await page.screenshot({ path: path.join(OUTPUT, "failure.png"), fullPage: true });
    throw new Error(`P04F34_Q034_CLASSIC_UI_BOOT_FAILED:${JSON.stringify(report)}`);
  }

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
    schemaName: "P04F34Q034CurrentLivePagesFocusedD0AcceptanceV2",
    phase: "Q034_GENERATION",
    siteUrl: SITE_URL,
    requestedUrl,
    httpStatus: response?.status() ?? null,
    bootReady,
    bootSnapshotBeforeProbe,
    preGenerate,
    postGenerate,
    javascriptResponses,
    httpFailures,
    consoleErrors,
    consoleMessages,
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

  writeReport({ ...report, status: pass ? "PASS" : "FAIL" });

  if (!pass) {
    await page.screenshot({ path: path.join(OUTPUT, "failure.png"), fullPage: true });
    throw new Error(`P04F34_Q034_CURRENT_LIVE_PAGES_D0_FAILED:${JSON.stringify(report)}`);
  }
} catch (error) {
  if (!report) {
    report = {
      schemaName: "P04F34Q034CurrentLivePagesFocusedD0AcceptanceV2",
      phase: "UNCLASSIFIED_FATAL",
      siteUrl: SITE_URL,
      javascriptResponses,
      httpFailures,
      consoleErrors,
      consoleMessages,
      pageErrors,
      requestFailures,
      fatalError: String(error?.stack ?? error),
      status: "FAIL",
    };
    writeReport(report);
  }
  throw error;
} finally {
  await browser.close();
}
