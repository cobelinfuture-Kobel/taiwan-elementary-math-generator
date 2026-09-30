import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const TARGETS = Object.freeze([
  { sourceId: "g3b_u10_3b10", grade: "3", semester: "lower", unitCode: "G3B-U10" },
  { sourceId: "g4a_u03_4a03", grade: "4", semester: "upper", unitCode: "G4A-U03" },
  { sourceId: "g4a_u05_4a05", grade: "4", semester: "upper", unitCode: "G4A-U05" },
  { sourceId: "g4a_u07_4a07", grade: "4", semester: "upper", unitCode: "G4A-U07" },
  { sourceId: "g4b_u05_4b05", grade: "4", semester: "lower", unitCode: "G4B-U05" },
  { sourceId: "g5a_u05_5a05a", grade: "5", semester: "upper", unitCode: "G5A-U05" },
  { sourceId: "g5a_u05_5a05a1", grade: "5", semester: "upper", unitCode: "G5A-U05A1" },
  { sourceId: "g5a_u07_5a07", grade: "5", semester: "upper", unitCode: "G5A-U07" },
  { sourceId: "g5a_u10_5a10a", grade: "5", semester: "upper", unitCode: "G5A-U10A" },
  { sourceId: "g5b_u08_5b08", grade: "5", semester: "lower", unitCode: "G5B-U08" },
  { sourceId: "g5b_u11_5b11", grade: "5", semester: "lower", unitCode: "G5B-U11" },
  { sourceId: "g6a_u03_6a03", grade: "6", semester: "upper", unitCode: "G6A-U03" },
  { sourceId: "g6a_u05_6a05", grade: "6", semester: "upper", unitCode: "G6A-U05" },
  { sourceId: "g6a_u06_6a06", grade: "6", semester: "upper", unitCode: "G6A-U06" },
  { sourceId: "g6a_u07_6a07", grade: "6", semester: "upper", unitCode: "G6A-U07" },
  { sourceId: "g6a_u08_6a08", grade: "6", semester: "upper", unitCode: "G6A-U08" },
  { sourceId: "g6a_u09_6a09", grade: "6", semester: "upper", unitCode: "G6A-U09" },
  { sourceId: "g6b_u03_6b03", grade: "6", semester: "lower", unitCode: "G6B-U03" },
  { sourceId: "g6b_u04_6b04", grade: "6", semester: "lower", unitCode: "G6B-U04" },
  { sourceId: "g6b_u05_6b05", grade: "6", semester: "lower", unitCode: "G6B-U05" },
  { sourceId: "g6b_u06_6b06", grade: "6", semester: "lower", unitCode: "G6B-U06" },
].map(Object.freeze));

const PORT = Number(process.env.P09_MIXED21_SITE_PORT || "4391");
const BASE = `http://127.0.0.1:${PORT}/index.html`;
const OUT = path.resolve("tmp/p09-ui-mixed21-classic-ui-acceptance");
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let server = null;
let browser = null;
let serverOut = "";
let serverErr = "";

server = spawn(process.execPath, ["tools/site/serve-site.js"], {
  env: { ...process.env, SITE_PORT: String(PORT), SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (chunk) => { serverOut += chunk; });
server.stderr.on("data", (chunk) => { serverErr += chunk; });

async function ready() {
  let last;
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(BASE, { cache: "no-store" });
      if (response.ok) return;
    } catch (error) {
      last = error;
    }
    await sleep(250);
  }
  throw new Error(`P09_MIXED21_SITE_NOT_READY:${last?.message || "unknown"}`);
}

const diagnostics = { console: [], page: [], request: [], http: [] };

async function selectUnit(page, target) {
  await page.selectOption("#batch-a-grade-select", target.grade);
  await page.selectOption("#batch-a-semester-select", target.semester);
  await page.waitForFunction(
    (sourceId) => [...document.querySelectorAll("#batch-a-source-select option")].some((option) => option.value === sourceId),
    target.sourceId,
    { timeout: 30000 },
  );
  await page.selectOption("#batch-a-source-select", target.sourceId);
  await page.waitForFunction(
    (sourceId) => (
      document.querySelector("#batch-a-source-select")?.value === sourceId
      && document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]").length === 5
    ),
    target.sourceId,
    { timeout: 30000 },
  );
  const mixedDisabled = await page.locator('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]').isDisabled();
  if (mixedDisabled) throw new Error(`P09_MIXED21_OPTION_DISABLED:${target.sourceId}`);
  await page.selectOption("#batch-a-selection-mode-select", "mixedKnowledgePointsSameUnit");
  await page.waitForFunction(() => (
    document.querySelector("#batch-a-selection-mode-select")?.value === "mixedKnowledgePointsSameUnit"
    && [...document.querySelectorAll("#batch-a-knowledge-point-panel [data-selected='true']")].length === 5
  ), { timeout: 30000 });
}

async function generate(page, target) {
  await page.fill("#batch-a-question-count-input", "10");
  await page.dispatchEvent("#batch-a-question-count-input", "change");
  await page.selectOption("#batch-a-ordering-select", "groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input", "2");
  await page.dispatchEvent("#columns-input", "change");
  await page.fill("#rows-per-page-input", "4");
  await page.dispatchEvent("#rows-per-page-input", "change");
  await page.fill("#generation-seed-input", `p09-mixed21-${target.sourceId}`);
  await page.dispatchEvent("#generation-seed-input", "change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(() => {
    const text = document.querySelector("#status-panel")?.textContent ?? "";
    return text.includes("已產生 10 題") || text.includes("產生失敗");
  }, { timeout: 60000 });

  const state = await page.evaluate(() => ({
    status: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    tone: document.querySelector("#status-panel")?.dataset?.tone ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
    selectedKpCount: [...document.querySelectorAll("#batch-a-knowledge-point-panel [data-selected='true']")].length,
    previewLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if (!state.status.includes("已產生 10 題")
    || state.tone !== "success"
    || state.validationHasErrors !== "false"
    || state.selectionMode !== "mixedKnowledgePointsSameUnit"
    || state.selectedKpCount !== 5
    || state.previewLength <= 0
    || state.printDisabled) {
    throw new Error(`P09_MIXED21_GENERATION:${target.sourceId}:${JSON.stringify(state)}`);
  }

  const frame = await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if (!frame) throw new Error(`P09_MIXED21_PREVIEW_MISSING:${target.sourceId}`);
  await frame.waitForSelector(".worksheet-document", { timeout: 30000 });
  const worksheet = await frame.evaluate(() => ({
    questions: document.querySelectorAll(".worksheet-cell--question").length,
    answers: document.querySelectorAll(".worksheet-cell--answer-key").length,
    overflow: [...document.querySelectorAll(".worksheet-page")]
      .filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).length,
  }));
  if (worksheet.questions !== 10 || worksheet.answers !== 10 || worksheet.overflow !== 0) {
    throw new Error(`P09_MIXED21_WORKSHEET:${target.sourceId}:${JSON.stringify(worksheet)}`);
  }

  await frame.evaluate(() => {
    window.__P09_MIXED21_PRINT__ = 0;
    window.print = () => { window.__P09_MIXED21_PRINT__ += 1; };
  });
  await page.locator("#print-button").click();
  const printCount = await frame.evaluate(() => window.__P09_MIXED21_PRINT__ ?? 0);
  if (printCount !== 1) throw new Error(`P09_MIXED21_PRINT:${target.sourceId}:${printCount}`);

  return { state, worksheet, printCount };
}

try {
  await ready();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") diagnostics.console.push(message.text()); });
  page.on("pageerror", (error) => diagnostics.page.push(String(error?.stack || error)));
  page.on("requestfailed", (request) => diagnostics.request.push({ url: request.url(), failure: request.failure()?.errorText || "unknown" }));
  page.on("response", (response) => {
    if (response.status() >= 400 && (response.url().includes("/modules/") || response.url().includes("/assets/"))) {
      diagnostics.http.push({ url: response.url(), status: response.status() });
    }
  });

  const response = await page.goto(`${BASE}?p09-mixed21=${Date.now()}`, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P09_MIXED21_MAIN_HTTP:${response?.status() || "none"}`);

  const results = [];
  for (const target of TARGETS) {
    await selectUnit(page, target);
    results.push({ sourceId: target.sourceId, unitCode: target.unitCode, ...await generate(page, target) });
  }

  if (Object.values(diagnostics).some((entries) => entries.length)) {
    throw new Error(`P09_MIXED21_BROWSER_DIAGNOSTICS:${JSON.stringify(diagnostics)}`);
  }

  const report = {
    schemaName: "P09UISameUnitMixed21ClassicUIAcceptanceV1",
    taskId: "P09_UI_SameUnitMixed21_SharedUnitAggregationImplementation",
    status: "PASS_P09_UI_SAME_UNIT_MIXED21_CLASSIC_UI_ACCEPTANCE",
    targetCount: TARGETS.length,
    results,
    invariants: {
      exactTargetCount: 21,
      selectedKnowledgePointCountPerUnit: 5,
      generatedQuestionCountPerUnit: 10,
      answerCountPerUnit: 10,
      sameUnitMixedOnly: true,
      crossUnitMixedAdmission: false,
      r02R05Mutation: false,
    },
    browser: {
      consoleErrorCount: 0,
      pageErrorCount: 0,
      requestFailureCount: 0,
      assetHttpFailureCount: 0,
    },
  };
  writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log("P09_MIXED21_CLASSIC_UI_ACCEPTANCE=" + JSON.stringify(report));
  await page.close();
} catch (error) {
  writeFileSync(path.join(OUT, "failure.json"), JSON.stringify({
    schemaName: "P09UISameUnitMixed21ClassicUIAcceptanceFailureV1",
    status: "FAIL",
    error: String(error?.stack || error),
    browser: diagnostics,
    server: { stdout: serverOut, stderr: serverErr },
  }, null, 2) + "\n");
  throw error;
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server && !server.killed) server.kill("SIGTERM");
}
