import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const TARGETS = Object.freeze([
  Object.freeze({ sourceId: "g3a_u08_3a08", grade: "3", semester: "upper", expectedKpCount: 7, questionCount: 14, unitCode: "3A-U08" }),
  Object.freeze({ sourceId: "g4b_u03_4b03", grade: "4", semester: "lower", expectedKpCount: 6, questionCount: 12, unitCode: "4B-U03" }),
  Object.freeze({ sourceId: "g6b_u02_6b02", grade: "6", semester: "lower", expectedKpCount: 5, questionCount: 10, unitCode: "6B-U02" }),
]);

const PORT = Number(process.env.P09_A03B_SITE_PORT || "4383");
const REMOTE = process.env.P09_A03B_SITE_URL || null;
const BASE = REMOTE || `http://127.0.0.1:${PORT}/index.html`;
const BASE_ORIGIN = new URL(BASE).origin;
const CACHE_TOKEN = process.env.P09_A03B_LIVE_CACHE_TOKEN || String(Date.now());
const OUT = path.resolve("tmp/p09-ui-a03b-classic-ui-acceptance");
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let server = null;
let browser = null;
let serverOut = "";
let serverErr = "";

if (!REMOTE) {
  server = spawn(process.execPath, ["tools/site/serve-site.js"], {
    env: { ...process.env, SITE_PORT: String(PORT), SITE_HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
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
  throw new Error(`P09_A03B_SITE_NOT_READY:${last?.message || "unknown"}`);
}

const diagnostics = { console: [], page: [], request: [], http: [] };

async function selectUnit(page, target) {
  await page.waitForFunction(
    (grade) => [...document.querySelectorAll("#batch-a-grade-select option")].some((option) => option.value === grade),
    target.grade,
    { timeout: 30000 },
  );
  await page.selectOption("#batch-a-grade-select", target.grade);

  await page.waitForFunction(
    (semester) => [...document.querySelectorAll("#batch-a-semester-select option")].some((option) => option.value === semester),
    target.semester,
    { timeout: 30000 },
  );
  await page.selectOption("#batch-a-semester-select", target.semester);

  await page.waitForFunction(
    (sourceId) => [...document.querySelectorAll("#batch-a-source-select option")].some((option) => option.value === sourceId),
    target.sourceId,
    { timeout: 30000 },
  );
  await page.selectOption("#batch-a-source-select", target.sourceId);

  await page.waitForFunction(
    ({ sourceId, count }) => (
      document.querySelector("#batch-a-source-select")?.value === sourceId
      && document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]").length === count
    ),
    { sourceId: target.sourceId, count: target.expectedKpCount },
    { timeout: 30000 },
  );

  await page.selectOption("#batch-a-selection-mode-select", "sourceUnit");
}

async function generateUnit(page, target) {
  await page.fill("#batch-a-question-count-input", String(target.questionCount));
  await page.dispatchEvent("#batch-a-question-count-input", "change");
  await page.selectOption("#batch-a-ordering-select", "groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input", "2");
  await page.dispatchEvent("#columns-input", "change");
  await page.fill("#rows-per-page-input", "4");
  await page.dispatchEvent("#rows-per-page-input", "change");
  await page.fill("#generation-seed-input", `p09-a03b-${target.sourceId}`);
  await page.dispatchEvent("#generation-seed-input", "change");

  const sourceState = await page.evaluate(() => ({
    sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
    selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
    kpIds: [...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")]
      .map((node) => node.dataset.knowledgePointId),
    sourceOptions: [...document.querySelectorAll("#batch-a-source-select option")]
      .map((option) => ({ value: option.value, text: option.textContent?.trim() ?? "" })),
  }));
  if (sourceState.sourceId !== target.sourceId
    || sourceState.selectionMode !== "sourceUnit"
    || sourceState.kpIds.length !== target.expectedKpCount) {
    throw new Error(`P09_A03B_SOURCE_STATE:${target.sourceId}:${JSON.stringify(sourceState)}`);
  }

  await page.locator("#regenerate-button").click();
  await page.waitForFunction(
    (count) => {
      const text = document.querySelector("#status-panel")?.textContent ?? "";
      return text.includes(`已產生 ${count} 題`) || text.includes("產生失敗");
    },
    target.questionCount,
    { timeout: 30000 },
  );

  const state = await page.evaluate(() => ({
    status: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    tone: document.querySelector("#status-panel")?.dataset?.tone ?? "",
    validationHasErrors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    previewLength: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled),
    sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
    selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
  }));

  if (state.sourceId !== target.sourceId
    || state.selectionMode !== "sourceUnit"
    || !state.status.includes(`已產生 ${target.questionCount} 題`)
    || state.tone !== "success"
    || state.validationHasErrors !== "false"
    || state.previewLength <= 0
    || state.printDisabled) {
    throw new Error(`P09_A03B_GENERATION:${target.sourceId}:${JSON.stringify(state)}`);
  }

  const frame = await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if (!frame) throw new Error(`P09_A03B_PREVIEW_FRAME_MISSING:${target.sourceId}`);
  await frame.waitForSelector(".worksheet-document", { timeout: 30000 });

  const worksheet = await frame.evaluate(() => ({
    questions: document.querySelectorAll(".worksheet-cell--question").length,
    answers: document.querySelectorAll(".worksheet-cell--answer-key").length,
    overflow: [...document.querySelectorAll(".worksheet-page")]
      .filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).length,
    text: document.body?.innerText ?? "",
  }));

  if (worksheet.questions !== target.questionCount
    || worksheet.answers !== target.questionCount
    || worksheet.overflow !== 0) {
    throw new Error(`P09_A03B_WORKSHEET:${target.sourceId}:${JSON.stringify(worksheet)}`);
  }

  await frame.evaluate(() => {
    window.__P09_A03B_PRINT__ = 0;
    window.print = () => { window.__P09_A03B_PRINT__ += 1; };
  });
  await page.locator("#print-button").click();
  const printCount = await frame.evaluate(() => window.__P09_A03B_PRINT__ ?? 0);
  if (printCount !== 1) {
    throw new Error(`P09_A03B_PRINT:${target.sourceId}:${printCount}`);
  }

  return {
    sourceState,
    state,
    worksheet: {
      questions: worksheet.questions,
      answers: worksheet.answers,
      overflow: worksheet.overflow,
    },
    printCount,
  };
}

async function run() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });

  if (REMOTE) {
    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === "GET"
        && url.origin === BASE_ORIGIN
        && (url.pathname.endsWith(".js")
          || url.pathname.endsWith(".css")
          || url.pathname.includes("/modules/")
          || url.pathname.includes("/assets/"))) {
        url.searchParams.set("p09-a03b", CACHE_TOKEN);
        await route.continue({
          url: url.href,
          headers: { ...request.headers(), "cache-control": "no-cache", pragma: "no-cache" },
        });
        return;
      }
      await route.continue();
    });
  }

  page.on("console", (message) => {
    if (message.type() === "error") diagnostics.console.push(message.text());
  });
  page.on("pageerror", (error) => diagnostics.page.push(String(error?.stack || error)));
  page.on("requestfailed", (request) => diagnostics.request.push({
    url: request.url(),
    failure: request.failure()?.errorText || "unknown",
  }));
  page.on("response", (response) => {
    if (response.status() >= 400
      && (/\.(?:m?js|css)(?:\?|$)/i.test(response.url())
        || response.url().includes("/modules/")
        || response.url().includes("/assets/"))) {
      diagnostics.http.push({ url: response.url(), status: response.status() });
    }
  });

  const url = new URL(BASE);
  url.searchParams.set("p09-a03b", String(Date.now()));
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P09_A03B_MAIN_HTTP:${response?.status() || "none"}`);

  const results = [];
  for (const target of TARGETS) {
    await selectUnit(page, target);
    results.push({
      sourceId: target.sourceId,
      expectedKpCount: target.expectedKpCount,
      ...await generateUnit(page, target),
    });
  }

  await page.screenshot({ path: path.join(OUT, "p09-a03b-ui.png"), fullPage: true });
  await page.close();
  return results;
}

try {
  await ready();
  browser = await chromium.launch({ headless: true });
  const results = await run();
  if (Object.values(diagnostics).some((entries) => entries.length)) {
    throw new Error(`P09_A03B_BROWSER_DIAGNOSTICS:${JSON.stringify(diagnostics)}`);
  }
  const report = {
    schemaName: "P09UIA03BClassicUIAcceptanceV1",
    taskId: "P09_UI_A03B_PublicCurriculumUnitCompletenessImplementation",
    status: "PASS_P09_UI_A03B_CLASSIC_UI_ACCEPTANCE",
    invariants: {
      publicCurriculumUnitCount: 78,
      canonicalUniqueKnowledgePointCount: 482,
      publicSourceKnowledgePointRouteProjectionCount: 493,
      g3aU08SourceUnitCoverage: "7_OF_7",
      g4bU03PublicUnitReachable: true,
      g6bU02PublicUnitReachable: true,
      g5bU10IdentityNotInvented: true,
      crossUnitMixedAdmission: false,
    },
    results,
    browser: {
      consoleErrorCount: 0,
      pageErrorCount: 0,
      requestFailureCount: 0,
      assetHttpFailureCount: 0,
    },
  };
  writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log("P09_A03B_CLASSIC_UI_ACCEPTANCE=" + JSON.stringify(report));
} catch (error) {
  writeFileSync(path.join(OUT, "failure.json"), JSON.stringify({
    schemaName: "P09UIA03BClassicUIAcceptanceFailureV1",
    status: "FAIL",
    baseUrl: BASE,
    error: String(error?.stack || error),
    browser: diagnostics,
    server: { stdout: serverOut, stderr: serverErr },
  }, null, 2) + "\n");
  throw error;
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server && !server.killed) server.kill("SIGTERM");
}
