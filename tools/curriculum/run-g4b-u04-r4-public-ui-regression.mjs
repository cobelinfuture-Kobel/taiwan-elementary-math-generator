import { chromium } from "playwright";

const BASE_URL = process.env.G4B_U04_R4_SITE_URL ?? "http://127.0.0.1:4174/index.html";
const SOURCE_ID = "g4b_u04_4b04";
const OTHER_SOURCE_ID = "g5a_u08_5a08";
const KPS = Object.freeze([
  "kp_g4b_u04_inverse_rounding_unknown_digit",
  "kp_g4b_u04_inverse_rounding_possible_original",
]);
const GROUPS = Object.freeze([
  "pg_g4b_u04_inverse_digit_set",
  "pg_g4b_u04_inverse_original_values",
]);
const MAX_LAYOUTS = Object.freeze([
  Object.freeze({ id: "3x5", columns: 3, rowsPerPage: 5, questionCount: 15 }),
  Object.freeze({ id: "2x6", columns: 2, rowsPerPage: 6, questionCount: 12 }),
  Object.freeze({ id: "1x7", columns: 1, rowsPerPage: 7, questionCount: 7 }),
]);

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

function g4Url({ columns = 4, rowsPerPage = 10, questionCount = 12 } = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set("sourceId", SOURCE_ID);
  url.searchParams.set("selectionMode", "mixedKnowledgePointsSameUnit");
  url.searchParams.set("questionMode", "reasoning");
  url.searchParams.set("layoutMode", "auto_safe");
  url.searchParams.set("questionCount", String(questionCount));
  url.searchParams.set("ordering", "groupedByPattern");
  url.searchParams.set("answerKey", "0");
  url.searchParams.set("generationSeed", "g4b-u04-r4-public-ui");
  url.searchParams.set("columns", String(columns));
  url.searchParams.set("rowsPerPage", String(rowsPerPage));
  for (const kp of KPS) url.searchParams.append("kp", kp);
  for (const group of GROUPS) url.searchParams.append("pg", group);
  return url.href;
}

async function waitForG4(page) {
  await page.waitForFunction(
    (sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId
      && document.querySelector("#g4b-u04-layout-mode")?.value === "auto_safe",
    SOURCE_ID,
    { timeout: 120000 },
  );
}

async function regenerate(page, expectedCount) {
  await page.click("#regenerate-button");
  await page.waitForFunction(
    () => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone),
    null,
    { timeout: 120000 },
  );
  const tone = await page.locator("#status-panel").getAttribute("data-tone");
  const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
  const validation = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
  if (tone !== "success" || !status.includes(`已產生 ${expectedCount} 題`)) {
    fail("G4B_U04_R4_GENERATION_FAILED", { tone, status, validation, url: page.url() });
  }
}

async function setNumericControl(page, selector, value) {
  await page.locator(selector).evaluate((element, nextValue) => {
    element.value = String(nextValue);
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];
try {
  const sourcePage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  sourcePage.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  sourcePage.on("pageerror", (error) => pageErrors.push(error.message));
  await sourcePage.goto(g4Url(), { waitUntil: "networkidle", timeout: 120000 });
  await waitForG4(sourcePage);
  await regenerate(sourcePage, 12);
  await sourcePage.selectOption("#batch-a-source-select", OTHER_SOURCE_ID);
  await sourcePage.waitForFunction(
    (sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId
      && new URL(window.location.href).searchParams.get("sourceId") === sourceId,
    OTHER_SOURCE_ID,
    { timeout: 120000 },
  );
  await sourcePage.waitForTimeout(250);
  const switched = {
    controlSourceId: await sourcePage.locator("#batch-a-source-select").inputValue(),
    querySourceId: new URL(sourcePage.url()).searchParams.get("sourceId"),
    g4Visible: await sourcePage.locator("#g4b-u04-public-controls").getAttribute("data-visible"),
  };
  if (switched.controlSourceId !== OTHER_SOURCE_ID || switched.querySourceId !== OTHER_SOURCE_ID) {
    fail("G4B_U04_R4_SOURCE_SWITCH_RECLAIMED", switched);
  }
  await sourcePage.close();

  const layoutResults = [];
  for (const scenario of MAX_LAYOUTS) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(`${scenario.id}: ${message.text()}`); });
    page.on("pageerror", (error) => pageErrors.push(`${scenario.id}: ${error.message}`));
    await page.goto(g4Url({ questionCount: scenario.questionCount }), { waitUntil: "networkidle", timeout: 120000 });
    await waitForG4(page);
    await setNumericControl(page, "#columns-input", scenario.columns);
    await setNumericControl(page, "#rows-per-page-input", scenario.rowsPerPage);
    await page.waitForFunction(
      ({ columns, rowsPerPage }) => document.querySelector("#g4b-u04-layout-mode")?.value === "custom_with_caps"
        && document.querySelector("#columns-input")?.value === String(columns)
        && document.querySelector("#rows-per-page-input")?.value === String(rowsPerPage)
        && new URL(window.location.href).searchParams.get("layoutMode") === "custom_with_caps",
      scenario,
      { timeout: 120000 },
    );
    await regenerate(page, scenario.questionCount);
    const frame = page.frameLocator("#preview-frame");
    await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
    const output = await frame.locator("body").evaluate(() => ({
      questionCards: document.querySelectorAll(".g4b-u04-cell--question").length,
      answerCards: document.querySelectorAll(".g4b-u04-cell--answer").length,
      responsePrompts: document.querySelectorAll(".g4b-u04-cell__response").length,
      requestedColumns: Number(document.body.dataset.g4bU04RequestedColumns),
      requestedRows: Number(document.body.dataset.g4bU04RequestedRows),
      resolvedColumns: Number(document.body.dataset.g4bU04ResolvedColumns),
      resolvedRows: Number(document.body.dataset.g4bU04ResolvedRows),
      layoutMode: document.body.dataset.g4bU04LayoutMode,
      layoutCapped: document.body.dataset.g4bU04LayoutCapped,
    }));
    if (output.questionCards !== scenario.questionCount
      || output.answerCards !== 0
      || output.responsePrompts !== 0
      || output.requestedColumns !== scenario.columns
      || output.requestedRows !== scenario.rowsPerPage
      || output.resolvedColumns !== scenario.columns
      || output.resolvedRows !== scenario.rowsPerPage
      || output.layoutMode !== "custom_with_caps"
      || output.layoutCapped !== "false") {
      fail("G4B_U04_R4_LAYOUT_UI_MISMATCH", { scenario, output, url: page.url() });
    }
    layoutResults.push({ scenario, output, url: page.url() });
    await page.close();
  }

  if (consoleErrors.length || pageErrors.length) {
    fail("G4B_U04_R4_BROWSER_ERRORS", { consoleErrors, pageErrors });
  }
  console.log(JSON.stringify({
    status: "PASS",
    sourceSwitch: { from: SOURCE_ID, to: OTHER_SOURCE_ID },
    layoutResults,
    consoleErrorCount: 0,
    pageErrorCount: 0,
  }, null, 2));
} catch (error) {
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
