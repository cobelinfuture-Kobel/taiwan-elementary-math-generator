import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const SRC = "g5a_u09_5a09";
const TRAP = "kp_g5a_u09_trapezoid_area_formula";
const TRI = "kp_g5a_u09_triangle_area_formula";
const PARA = "kp_g5a_u09_parallelogram_area_formula";
const FUTURE = ["kp_g5a_u09_area_unknown_dimension", "kp_g5a_u09_composite_polygon_area"];
const COUNT = 12;
const PORT = Number(process.env.P05F46_SITE_PORT ?? "4226");
const REMOTE = process.env.P05F46_SITE_URL ?? null;
const BASE = REMOTE ?? `http://127.0.0.1:${PORT}/index.html`;
const OUT = path.resolve("tmp/p05f-w5-slice046-classic-ui-acceptance");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

mkdirSync(OUT, { recursive: true });
let server = null;
let serverOut = "";
let serverErr = "";
let browser;
const browserErrors = { console: [], page: [], request: [], http: [] };

if (!REMOTE) {
  server = spawn(process.execPath, ["tools/site/serve-site.js"], {
    env: { ...process.env, SITE_PORT: String(PORT), SITE_HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  server.stdout.on("data", (chunk) => { serverOut += chunk; });
  server.stderr.on("data", (chunk) => { serverErr += chunk; });
}

async function ready() {
  let last;
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(BASE, { cache: "no-store" });
      if (response.ok) return;
    } catch (error) {
      last = error;
    }
    await sleep(250);
  }
  throw new Error(`P05F46_SITE_NOT_READY:${last?.message ?? "unknown"}`);
}

async function selectOnly(page, kp) {
  if ((await page.locator("#batch-a-selection-mode-select").inputValue()) !== "singleKnowledgePoint") {
    await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  }
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active && active !== document.body && typeof active.blur === "function") active.blur();
  });
  await sleep(50);
  const target = page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`);
  await target.click();
  await page.waitForFunction((id) => {
    const panel = document.querySelector("#batch-a-knowledge-point-panel");
    const selected = [...panel.querySelectorAll("[data-knowledge-point-id][data-selected='true']")]
      .map((node) => node.dataset.knowledgePointId);
    return selected.length === 1
      && selected[0] === id
      && panel.querySelector(`[data-knowledge-point-id="${id}"]`)?.dataset?.selected === "true";
  }, kp, { timeout: 120000 });
}

async function generate(page, kp, modes, label) {
  await selectOnly(page, kp);
  await page.fill("#generation-seed-input", `p05f46-${label}`);
  await page.dispatchEvent("#generation-seed-input", "change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction((count) => {
    const text = document.querySelector("#status-panel")?.textContent ?? "";
    return text.includes(`已產生 ${count} 題`) || text.includes("產生失敗");
  }, COUNT, { timeout: 120000 });
  const state = await page.evaluate(() => ({
    status: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    tone: document.querySelector("#status-panel")?.dataset?.tone ?? "",
    valid: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    preview: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled)
  }));
  if (!state.status.includes(`已產生 ${COUNT} 題`) || state.tone !== "success" || state.valid !== "false" || state.preview <= 0 || state.printDisabled) {
    throw new Error(`P05F46_GENERATION_${label}:${JSON.stringify(state)}`);
  }
  const handle = await page.locator("#preview-frame").elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error(`P05F46_PREVIEW_MISSING_${label}`);
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });
  const worksheet = await frame.evaluate((modeList) => ({
    questions: document.querySelectorAll(".worksheet-cell--question").length,
    answers: document.querySelectorAll(".worksheet-cell--answer-key").length,
    representations: document.querySelectorAll('[data-representation="triangle-trapezoid-area-formula-diagram"]').length,
    modes: Object.fromEntries(modeList.map((mode) => [mode, document.querySelectorAll(`[data-diagram-mode="${mode}"]`).length])),
    allText: document.body?.innerText ?? "",
    overflow: [...document.querySelectorAll(".worksheet-page")]
      .filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).length
  }), modes);
  if (worksheet.questions !== COUNT || worksheet.answers !== COUNT || worksheet.representations !== COUNT * 2 || worksheet.overflow !== 0 || Object.values(worksheet.modes).some((count) => count !== 8) || worksheet.allText.includes("kp_g5a_u09_") || worksheet.allText.includes("ps_g5a_u09_")) {
    throw new Error(`P05F46_WORKSHEET_${label}:${JSON.stringify({ ...worksheet, allText: undefined })}`);
  }
  await frame.locator(".worksheet-document").screenshot({ path: path.join(OUT, `${label}-worksheet.png`) });
  return { state, worksheet: { questions: worksheet.questions, answers: worksheet.answers, representations: worksheet.representations, modes: worksheet.modes, overflow: worksheet.overflow } };
}

try {
  await ready();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") browserErrors.console.push(message.text()); });
  page.on("pageerror", (error) => browserErrors.page.push(String(error?.stack ?? error)));
  page.on("requestfailed", (request) => browserErrors.request.push({ url: request.url(), failure: request.failure()?.errorText ?? "unknown" }));
  page.on("response", (response) => {
    if (response.status() >= 400 && (/\.(?:m?js|css)(?:\?|$)/i.test(response.url()) || response.url().includes("/modules/") || response.url().includes("/assets/"))) {
      browserErrors.http.push({ url: response.url(), status: response.status() });
    }
  });

  const url = new URL(BASE);
  url.searchParams.set("p05f46", String(Date.now()));
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P05F46_MAIN_RESPONSE:${response?.status()}`);
  await page.waitForFunction(() => [...document.querySelectorAll("#batch-a-grade-select option")].some((option) => option.value === "5"), null, { timeout: 120000 });
  await page.selectOption("#batch-a-grade-select", "5");
  await page.selectOption("#batch-a-semester-select", "upper");
  await page.waitForFunction((id) => [...document.querySelectorAll("#batch-a-source-select option")].some((option) => option.value === id), SRC, { timeout: 120000 });
  await page.selectOption("#batch-a-source-select", SRC);
  for (const id of [PARA, TRAP, TRI]) {
    await page.waitForFunction((kp) => Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)), id, { timeout: 120000 });
  }
  for (const id of FUTURE) {
    if (await page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`).count()) throw new Error(`P05F46_FUTURE_VISIBLE:${id}`);
  }

  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  await page.fill("#batch-a-question-count-input", String(COUNT));
  await page.dispatchEvent("#batch-a-question-count-input", "change");
  await page.selectOption("#batch-a-ordering-select", "groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input", "2");
  await page.dispatchEvent("#columns-input", "change");
  await page.fill("#rows-per-page-input", "4");
  await page.dispatchEvent("#rows-per-page-input", "change");

  const selector = await page.evaluate(() => ({
    summary: document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim() ?? "",
    sourceId: document.querySelector("#batch-a-source-select")?.value,
    selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value
  }));
  if (selector.sourceId !== SRC || selector.selectionMode !== "singleKnowledgePoint" || !selector.summary.includes("可選知識點：3") || !selector.summary.includes("尚未開放：2") || !selector.summary.includes("不可選：2")) {
    throw new Error(`P05F46_SELECTOR:${JSON.stringify(selector)}`);
  }

  const trapezoid = await generate(page, TRAP, ["TRAPEZOID_PARALLEL_BASES_HEIGHT_AREA", "TRAPEZOID_PERPENDICULAR_HEIGHT", "TRAPEZOID_CONGRUENT_PAIR"], "trapezoid");
  const triangle = await generate(page, TRI, ["TRIANGLE_BASE_HEIGHT_AREA", "TRIANGLE_PERPENDICULAR_HEIGHT", "TRIANGLE_HALF_PARALLELOGRAM"], "triangle");
  const handle = await page.locator("#preview-frame").elementHandle();
  const frame = await handle?.contentFrame();
  await frame.evaluate(() => { window.__P05F46_PRINT__ = 0; window.print = () => { window.__P05F46_PRINT__ += 1; }; });
  await page.locator("#print-button").click();
  const printCount = await frame.evaluate(() => window.__P05F46_PRINT__ ?? 0);
  if (printCount !== 1) throw new Error(`P05F46_PRINT:${printCount}`);
  await page.screenshot({ path: path.join(OUT, "q046-ui.png"), fullPage: true });
  if (browserErrors.console.length || browserErrors.page.length || browserErrors.request.length || browserErrors.http.length) {
    throw new Error(`P05F46_BROWSER_DIAGNOSTICS:${JSON.stringify(browserErrors)}`);
  }

  const report = {
    schemaName: "P05FW5Q046ClassicUIAcceptanceV1",
    taskId: "P05F_W5DirectProductVerticalSlice046Implementation",
    status: "PASS_P05F_W5_Q046_CLASSIC_UI_ACCEPTANCE",
    sourceId: SRC,
    selector,
    targets: { trapezoid, triangle },
    printCount,
    browser: { consoleErrorCount: 0, pageErrorCount: 0, requestFailureCount: 0, assetHttpFailureCount: 0 },
    forbiddenScope: { q037Reowned: false, q057UnknownDimension: false, q062CompositePolygon: false, rhombusSpecific: false, application: false, sameUnitMixed: false, crossUnitMixed: false, q047OrLater: false, fullRepositoryRegression: false, globalBrowserReplay: false }
  };
  writeFileSync(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P05F46_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`);
} finally {
  if (browser) await browser.close();
  if (server) {
    server.kill("SIGTERM");
    await Promise.race([new Promise((resolve) => server.once("exit", resolve)), sleep(1500)]);
    if (!server.killed) server.kill("SIGKILL");
    writeFileSync(path.join(OUT, "server.stdout.log"), serverOut);
    writeFileSync(path.join(OUT, "server.stderr.log"), serverErr);
  }
}
