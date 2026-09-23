import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.G4B_U04_R4_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const DEPLOYMENT_SHA = process.env.G4B_U04_R4_DEPLOYMENT_SHA ?? "unknown";
const SOURCE_ID = "g4b_u04_4b04";
const OTHER_SOURCE_ID = "g5a_u08_5a08";
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/g4b-u04-r4-deployed-pages");
const FAILURE_JSON = resolve(OUTPUT_DIR, "failure.json");
const FAILURE_SCREENSHOT = resolve(OUTPUT_DIR, "failure.png");
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

function g4Url({ columns = 4, rowsPerPage = 10, questionCount = 12, suffix = "base" } = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set("sourceId", SOURCE_ID);
  url.searchParams.set("selectionMode", "mixedKnowledgePointsSameUnit");
  url.searchParams.set("questionMode", "reasoning");
  url.searchParams.set("layoutMode", "auto_safe");
  url.searchParams.set("questionCount", String(questionCount));
  url.searchParams.set("ordering", "groupedByPattern");
  url.searchParams.set("answerKey", "0");
  url.searchParams.set("generationSeed", `g4b-u04-r4-deployed-${suffix}`);
  url.searchParams.set("columns", String(columns));
  url.searchParams.set("rowsPerPage", String(rowsPerPage));
  for (const kp of KPS) url.searchParams.append("kp", kp);
  for (const group of GROUPS) url.searchParams.append("pg", group);
  url.searchParams.set("g4bU04R4", `${DEPLOYMENT_SHA}-${suffix}-${Date.now()}`);
  return url.href;
}

async function sha256Url(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) fail("G4B_U04_R4_ASSET_FETCH_FAILED", { url, status: response.status });
  const bytes = Buffer.from(await response.arrayBuffer());
  return { url, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

async function waitForG4(page) {
  await page.waitForFunction(
    (sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId
      && document.querySelector("#g4b-u04-layout-mode")?.value === "auto_safe",
    SOURCE_ID,
    { timeout: 120000 },
  );
}

async function regenerate(page, expectedCount, label) {
  await page.click("#regenerate-button");
  await page.waitForFunction(
    () => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone),
    null,
    { timeout: 120000 },
  );
  const tone = await page.locator("#status-panel").getAttribute("data-tone");
  const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
  const validation = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
  const previewMeta = (await page.locator("#preview-meta").textContent())?.trim() ?? "";
  if (tone !== "success" || !status.includes(`已產生 ${expectedCount} 題`)) {
    fail("G4B_U04_R4_DEPLOYED_GENERATION_FAILED", { label, tone, status, validation, previewMeta, url: page.url() });
  }
  return { status, validation, previewMeta };
}

async function setNumericControl(page, selector, value) {
  await page.locator(selector).evaluate((element, nextValue) => {
    element.value = String(nextValue);
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function auditFrame(page) {
  const frame = page.frameLocator("#preview-frame");
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  return frame.locator("body").evaluate(() => {
    const cards = [...document.querySelectorAll(".g4b-u04-cell--question")];
    const pages = [...document.querySelectorAll(".g4b-u04-page--questions")];
    const overflow = cards.filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);
    let interCardOverlapCount = 0;
    for (const page of pages) {
      const pageCards = [...page.querySelectorAll(".g4b-u04-cell--question")];
      for (let leftIndex = 0; leftIndex < pageCards.length; leftIndex += 1) {
        const left = pageCards[leftIndex].getBoundingClientRect();
        for (let rightIndex = leftIndex + 1; rightIndex < pageCards.length; rightIndex += 1) {
          const right = pageCards[rightIndex].getBoundingClientRect();
          const horizontal = Math.min(left.right, right.right) - Math.max(left.left, right.left);
          const vertical = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
          if (horizontal > 1 && vertical > 1) interCardOverlapCount += 1;
        }
      }
    }
    return {
      questionCardCount: cards.length,
      questionPageCount: pages.length,
      answerCardCount: document.querySelectorAll(".g4b-u04-cell--answer").length,
      answerPageCount: document.querySelectorAll(".g4b-u04-page--answers").length,
      responsePromptCount: document.querySelectorAll(".g4b-u04-cell__response").length,
      overflowCount: overflow.length,
      interCardOverlapCount,
      requestedColumns: Number(document.body.dataset.g4bU04RequestedColumns),
      requestedRows: Number(document.body.dataset.g4bU04RequestedRows),
      resolvedColumns: Number(document.body.dataset.g4bU04ResolvedColumns),
      resolvedRows: Number(document.body.dataset.g4bU04ResolvedRows),
      layoutMode: document.body.dataset.g4bU04LayoutMode ?? "",
      layoutCapped: document.body.dataset.g4bU04LayoutCapped ?? "",
    };
  });
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];
let activePage = null;
try {
  const deployedAssets = {
    controls: await sha256Url(new URL("./assets/browser/g4b-u04-public-controls.js", BASE_URL).href),
    resolver: await sha256Url(new URL("./modules/curriculum/batch-b/g4b-u04-layout-resolution.js", BASE_URL).href),
    worksheetProfile: await sha256Url(new URL("./modules/curriculum/registry/g4b-u04-worksheet-promotion.js", BASE_URL).href),
  };

  const sourcePage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  activePage = sourcePage;
  sourcePage.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  sourcePage.on("pageerror", (error) => pageErrors.push(error.message));
  const sourceTestedUrl = g4Url({ suffix: "source-switch" });
  const sourceResponse = await sourcePage.goto(sourceTestedUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (!sourceResponse?.ok()) fail("G4B_U04_R4_DEPLOYED_PAGE_HTTP_FAILED", { status: sourceResponse?.status(), sourceTestedUrl });
  await waitForG4(sourcePage);
  await regenerate(sourcePage, 12, "source-switch-precondition");
  await sourcePage.selectOption("#batch-a-source-select", OTHER_SOURCE_ID);
  await sourcePage.waitForFunction(
    (sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId
      && new URL(window.location.href).searchParams.get("sourceId") === sourceId,
    OTHER_SOURCE_ID,
    { timeout: 120000 },
  );
  await sourcePage.waitForTimeout(500);
  const sourceSwitch = {
    from: SOURCE_ID,
    to: OTHER_SOURCE_ID,
    controlSourceId: await sourcePage.locator("#batch-a-source-select").inputValue(),
    querySourceId: new URL(sourcePage.url()).searchParams.get("sourceId"),
    g4ControlsVisible: await sourcePage.locator("#g4b-u04-public-controls").getAttribute("data-visible"),
  };
  if (sourceSwitch.controlSourceId !== OTHER_SOURCE_ID || sourceSwitch.querySourceId !== OTHER_SOURCE_ID) {
    fail("G4B_U04_R4_DEPLOYED_SOURCE_SWITCH_RECLAIMED", sourceSwitch);
  }
  await sourcePage.close();
  activePage = null;

  const layoutResults = [];
  for (const scenario of MAX_LAYOUTS) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    activePage = page;
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(`${scenario.id}: ${message.text()}`); });
    page.on("pageerror", (error) => pageErrors.push(`${scenario.id}: ${error.message}`));
    const testedUrl = g4Url({ questionCount: scenario.questionCount, suffix: scenario.id });
    const response = await page.goto(testedUrl, { waitUntil: "networkidle", timeout: 120000 });
    if (!response?.ok()) fail("G4B_U04_R4_DEPLOYED_PAGE_HTTP_FAILED", { scenario, status: response?.status(), testedUrl });
    await waitForG4(page);
    await setNumericControl(page, "#columns-input", scenario.columns);
    await setNumericControl(page, "#rows-per-page-input", scenario.rowsPerPage);
    await page.waitForFunction(
      ({ columns, rowsPerPage }) => document.querySelector("#g4b-u04-layout-mode")?.value === "custom_with_caps"
        && new URL(window.location.href).searchParams.get("layoutMode") === "custom_with_caps"
        && document.querySelector("#columns-input")?.value === String(columns)
        && document.querySelector("#rows-per-page-input")?.value === String(rowsPerPage),
      scenario,
      { timeout: 120000 },
    );
    const generation = await regenerate(page, scenario.questionCount, scenario.id);
    const audit = await auditFrame(page);
    if (audit.questionCardCount !== scenario.questionCount
      || audit.questionPageCount !== 1
      || audit.answerCardCount !== 0
      || audit.answerPageCount !== 0
      || audit.responsePromptCount !== 0
      || audit.overflowCount !== 0
      || audit.interCardOverlapCount !== 0
      || audit.requestedColumns !== scenario.columns
      || audit.requestedRows !== scenario.rowsPerPage
      || audit.resolvedColumns !== scenario.columns
      || audit.resolvedRows !== scenario.rowsPerPage
      || audit.layoutMode !== "custom_with_caps"
      || audit.layoutCapped !== "false") {
      fail("G4B_U04_R4_DEPLOYED_LAYOUT_CONTRACT_FAILED", { scenario, generation, audit, url: page.url() });
    }
    await page.locator("#preview-frame").evaluate((iframe, scenarioId) => {
      iframe.contentWindow.__g4bU04R4PrintCalled = false;
      iframe.contentWindow.print = () => { iframe.contentWindow.__g4bU04R4PrintCalled = scenarioId; };
    }, scenario.id);
    await page.click("#print-button");
    const printCalled = await page.locator("#preview-frame").evaluate((iframe) => iframe.contentWindow.__g4bU04R4PrintCalled);
    if (printCalled !== scenario.id) fail("G4B_U04_R4_DEPLOYED_PRINT_TARGET_NOT_INVOKED", { scenario, printCalled });
    layoutResults.push({ scenarioId: scenario.id, testedUrl, generation, audit, printCalled: true });
    await page.close();
    activePage = null;
  }

  if (consoleErrors.length || pageErrors.length) {
    fail("G4B_U04_R4_DEPLOYED_BROWSER_ERRORS", { consoleErrors, pageErrors });
  }

  const manifest = {
    schemaVersion: "g4b-u04-r4-deployed-pages-smoke-v1",
    task: "G4B_U04_R4_SourceSwitchAndFlexibleCustomLayoutRepair",
    status: "PASS",
    productionUse: "allowed_deployed_ui_print",
    deploymentSha: DEPLOYMENT_SHA,
    sourceId: SOURCE_ID,
    otherSourceId: OTHER_SOURCE_ID,
    sourceSwitch,
    approvedCustomLayoutCount: 18,
    approvedRanges: { "3": [1, 5], "2": [1, 6], "1": [1, 7] },
    layoutResults,
    responsePromptCount: 0,
    answerCardCount: 0,
    domOverflowCount: 0,
    interCardOverlapCount: 0,
    printCalledCount: layoutResults.length,
    consoleErrorCount: 0,
    pageErrorCount: 0,
    genericFallback: false,
    freeFormAI: false,
    deployedAssets,
  };
  await writeFile(resolve(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest, null, 2));
} catch (error) {
  const failure = {
    schemaVersion: "g4b-u04-r4-deployed-pages-smoke-v1",
    task: "G4B_U04_R4_SourceSwitchAndFlexibleCustomLayoutRepair",
    status: "FAIL",
    deploymentSha: DEPLOYMENT_SHA,
    message: error.message,
    details: error.details ?? null,
    pageUrl: activePage?.url() ?? null,
    consoleErrors,
    pageErrors,
  };
  await writeFile(FAILURE_JSON, `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  try {
    await activePage?.screenshot({ path: FAILURE_SCREENSHOT, fullPage: true });
  } catch {
    // Structured evidence remains authoritative without a screenshot.
  }
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
