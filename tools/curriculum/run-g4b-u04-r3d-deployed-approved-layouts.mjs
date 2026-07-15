import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.G4B_U04_R3D_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const DEPLOYMENT_SHA = process.env.G4B_U04_R3D_DEPLOYMENT_SHA ?? "unknown";
const SOURCE_ID = "g4b_u04_4b04";
const INVERSE_KP = "kp_g4b_u04_inverse_rounding_possible_original";
const INVERSE_GROUP = "pg_g4b_u04_inverse_original_values";
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/g4b-u04-r3d-deployed-approved-layouts");
const FAILURE_JSON = resolve(OUTPUT_DIR, "failure.json");
const FAILURE_SCREENSHOT = resolve(OUTPUT_DIR, "failure.png");

const SCENARIOS = Object.freeze([
  Object.freeze({
    id: "auto-safe-3x5",
    layoutMode: "auto_safe",
    requestedColumns: 4,
    requestedRows: 10,
    resolvedColumns: 3,
    resolvedRows: 5,
    questionCount: 15,
    expectedQuestionPages: 1,
    expectedPreviewText: "題目 3 欄 × 5 列；答案 1 欄 × 5 列",
  }),
  Object.freeze({
    id: "custom-2x6",
    layoutMode: "custom_with_caps",
    requestedColumns: 2,
    requestedRows: 6,
    resolvedColumns: 2,
    resolvedRows: 6,
    questionCount: 12,
    expectedQuestionPages: 1,
    expectedPreviewText: "題目 2 欄 × 6 列；答案 1 欄 × 5 列",
  }),
]);

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

function scenarioUrl(scenario) {
  const url = new URL(BASE_URL);
  url.searchParams.set("sourceId", SOURCE_ID);
  url.searchParams.set("selectionMode", "singleKnowledgePoint");
  url.searchParams.set("questionMode", "reasoning");
  url.searchParams.set("layoutMode", scenario.layoutMode);
  url.searchParams.set("questionCount", String(scenario.questionCount));
  url.searchParams.set("ordering", "groupedByPattern");
  url.searchParams.set("answerKey", "0");
  url.searchParams.set("generationSeed", `g4b-u04-r3d-${scenario.id}`);
  url.searchParams.set("columns", String(scenario.requestedColumns));
  url.searchParams.set("rowsPerPage", String(scenario.requestedRows));
  url.searchParams.append("kp", INVERSE_KP);
  url.searchParams.append("pg", INVERSE_GROUP);
  url.searchParams.set("g4bU04R3D", `${DEPLOYMENT_SHA}-${scenario.id}-${Date.now()}`);
  return url.href;
}

async function sha256Url(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) fail("G4B_U04_R3D_ASSET_FETCH_FAILED", { url, status: response.status });
  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    url,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

async function waitForControlReplay(page, scenario) {
  await page.waitForFunction(
    ({ sourceId, layoutMode }) => (
      document.querySelector("#batch-a-source-select")?.value === sourceId
      && document.querySelector("#batch-a-selection-mode-select")?.value === "singleKnowledgePoint"
      && document.querySelector("#g4b-u04-question-mode")?.value === "reasoning"
      && document.querySelector("#g4b-u04-layout-mode")?.value === layoutMode
    ),
    { sourceId: SOURCE_ID, layoutMode: scenario.layoutMode },
    { timeout: 120000 },
  );
  const values = {
    sourceId: await page.locator("#batch-a-source-select").inputValue(),
    selectionMode: await page.locator("#batch-a-selection-mode-select").inputValue(),
    questionMode: await page.locator("#g4b-u04-question-mode").inputValue(),
    layoutMode: await page.locator("#g4b-u04-layout-mode").inputValue(),
    columns: Number(await page.locator("#columns-input").inputValue()),
    rowsPerPage: Number(await page.locator("#rows-per-page-input").inputValue()),
    answerKeyChecked: await page.locator("#batch-a-answer-key-input").isChecked(),
  };
  if (values.columns !== scenario.requestedColumns || values.rowsPerPage !== scenario.requestedRows) {
    fail("G4B_U04_R3D_CONTROL_LAYOUT_REPLAY_MISMATCH", { scenario, values, url: page.url() });
  }
  if (values.answerKeyChecked) {
    fail("G4B_U04_R3D_ANSWER_KEY_QUERY_REPLAY_MISMATCH", { scenario, values });
  }
  const url = new URL(page.url());
  if (url.searchParams.get("sourceId") !== SOURCE_ID
    || url.searchParams.get("selectionMode") !== "singleKnowledgePoint"
    || url.searchParams.get("questionMode") !== "reasoning"
    || url.searchParams.getAll("kp").filter((value) => value === INVERSE_KP).length !== 1
    || url.searchParams.getAll("pg").filter((value) => value === INVERSE_GROUP).length !== 1) {
    fail("G4B_U04_R3D_QUERY_AUTHORITY_MISMATCH", { scenario, url: page.url() });
  }
  return values;
}

async function auditRenderedWorksheet(page, scenario) {
  const frame = page.frameLocator("#preview-frame");
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  return frame.locator("body").evaluate(() => {
    const questionCards = [...document.querySelectorAll(".g4b-u04-cell--question")];
    const answerCards = [...document.querySelectorAll(".g4b-u04-cell--answer")];
    const questionPages = [...document.querySelectorAll(".g4b-u04-page--questions")];
    const answerPages = [...document.querySelectorAll(".g4b-u04-page--answers")];
    const overflowCards = questionCards.filter((node) => (
      node.scrollHeight > node.clientHeight + 1
      || node.scrollWidth > node.clientWidth + 1
    ));
    let interCardOverlapCount = 0;
    let firstOverlap = null;
    for (const page of questionPages) {
      const cards = [...page.querySelectorAll(".g4b-u04-cell--question")];
      for (let leftIndex = 0; leftIndex < cards.length; leftIndex += 1) {
        const left = cards[leftIndex].getBoundingClientRect();
        for (let rightIndex = leftIndex + 1; rightIndex < cards.length; rightIndex += 1) {
          const right = cards[rightIndex].getBoundingClientRect();
          const horizontal = Math.min(left.right, right.right) - Math.max(left.left, right.left);
          const vertical = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
          if (horizontal > 1 && vertical > 1) {
            interCardOverlapCount += 1;
            firstOverlap ??= {
              leftIndex,
              rightIndex,
              horizontal,
              vertical,
              left: { x: left.x, y: left.y, width: left.width, height: left.height },
              right: { x: right.x, y: right.y, width: right.width, height: right.height },
            };
          }
        }
      }
    }
    return {
      questionCardCount: questionCards.length,
      answerCardCount: answerCards.length,
      questionPageCount: questionPages.length,
      answerPageCount: answerPages.length,
      responsePromptCount: document.querySelectorAll(".g4b-u04-cell__response").length,
      overflowCount: overflowCards.length,
      firstOverflow: overflowCards[0]?.outerHTML.slice(0, 500) ?? null,
      interCardOverlapCount,
      firstOverlap,
      requestedColumns: Number(document.body.dataset.g4bU04RequestedColumns),
      requestedRows: Number(document.body.dataset.g4bU04RequestedRows),
      resolvedColumns: Number(document.body.dataset.g4bU04ResolvedColumns),
      resolvedRows: Number(document.body.dataset.g4bU04ResolvedRows),
      answerColumns: Number(document.body.dataset.g4bU04AnswerColumns),
      answerRows: Number(document.body.dataset.g4bU04AnswerRows),
      layoutMode: document.body.dataset.g4bU04LayoutMode ?? "",
      layoutProfile: document.body.dataset.g4bU04LayoutProfile ?? "",
      layoutCapped: document.body.dataset.g4bU04LayoutCapped ?? "",
      publicText: document.body.innerText,
    };
  });
}

async function runScenario(browser, scenario, browserErrors) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.consoleErrors.push(`${scenario.id}: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.pageErrors.push(`${scenario.id}: ${error.message}`));
  const testedUrl = scenarioUrl(scenario);
  try {
    const response = await page.goto(testedUrl, { waitUntil: "networkidle", timeout: 120000 });
    if (!response?.ok()) fail("G4B_U04_R3D_DEPLOYED_PAGE_HTTP_FAILED", { scenario, status: response?.status(), testedUrl });
    const replayedControls = await waitForControlReplay(page, scenario);
    await page.click("#regenerate-button");
    await page.waitForFunction(
      () => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone),
      null,
      { timeout: 120000 },
    );
    const tone = await page.locator("#status-panel").getAttribute("data-tone");
    const statusText = (await page.locator("#status-panel").textContent())?.trim() ?? "";
    const validationText = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
    const previewMeta = (await page.locator("#preview-meta").textContent())?.trim() ?? "";
    if (tone !== "success" || !statusText.includes(`已產生 ${scenario.questionCount} 題`)) {
      fail("G4B_U04_R3D_DEPLOYED_GENERATION_FAILED", {
        scenario,
        tone,
        statusText,
        validationText,
        previewMeta,
      });
    }
    const audit = await auditRenderedWorksheet(page, scenario);
    if (audit.questionCardCount !== scenario.questionCount
      || audit.answerCardCount !== 0
      || audit.questionPageCount !== scenario.expectedQuestionPages
      || audit.answerPageCount !== 0) {
      fail("G4B_U04_R3D_RENDERED_COUNT_MISMATCH", { scenario, audit });
    }
    if (audit.responsePromptCount !== 0) fail("G4B_U04_R3D_RESPONSE_PROMPT_PRESENT", { scenario, audit });
    if (audit.overflowCount !== 0 || audit.interCardOverlapCount !== 0) {
      fail("G4B_U04_R3D_LAYOUT_CONTAINMENT_FAILED", { scenario, audit });
    }
    if (audit.requestedColumns !== scenario.requestedColumns
      || audit.requestedRows !== scenario.requestedRows
      || audit.resolvedColumns !== scenario.resolvedColumns
      || audit.resolvedRows !== scenario.resolvedRows
      || audit.answerColumns !== 1
      || audit.answerRows !== 5
      || audit.layoutMode !== scenario.layoutMode
      || audit.layoutProfile !== "g4b_u04_inverse_long_answer_v1"
      || audit.layoutCapped !== "false") {
      fail("G4B_U04_R3D_LAYOUT_METADATA_MISMATCH", { scenario, audit });
    }
    if (!previewMeta.includes(scenario.expectedPreviewText)) {
      fail("G4B_U04_R3D_PREVIEW_LAYOUT_READBACK_MISMATCH", { scenario, previewMeta, audit });
    }
    if (/\b(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_[a-z0-9_]+\b/i.test(audit.publicText)
      || /\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(audit.publicText)) {
      fail("G4B_U04_R3D_PUBLIC_TEXT_LEAK", { scenario, publicText: audit.publicText.slice(0, 1200) });
    }
    if (await page.locator("#print-button").isDisabled()) fail("G4B_U04_R3D_PRINT_DISABLED", { scenario });
    await page.locator("#preview-frame").evaluate((iframe, scenarioId) => {
      iframe.contentWindow.__g4bU04R3DPrintCalled = false;
      iframe.contentWindow.print = () => { iframe.contentWindow.__g4bU04R3DPrintCalled = scenarioId; };
    }, scenario.id);
    await page.click("#print-button");
    const printCalled = await page.locator("#preview-frame").evaluate(
      (iframe) => iframe.contentWindow.__g4bU04R3DPrintCalled,
    );
    if (printCalled !== scenario.id) fail("G4B_U04_R3D_PRINT_TARGET_NOT_INVOKED", { scenario, printCalled });
    return {
      scenarioId: scenario.id,
      testedUrl,
      replayedControls,
      statusText,
      validationText,
      previewMeta,
      ...audit,
      printCalled: true,
    };
  } catch (error) {
    error.scenarioId = scenario.id;
    error.pageUrl = page.url();
    try {
      await page.screenshot({ path: FAILURE_SCREENSHOT, fullPage: true });
    } catch {
      // Failure evidence remains useful without a screenshot.
    }
    throw error;
  } finally {
    await page.close();
  }
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const browserErrors = { consoleErrors: [], pageErrors: [] };
try {
  const deployedAssets = {
    layoutResolver: await sha256Url(new URL("./modules/curriculum/batch-b/g4b-u04-layout-resolution.js", BASE_URL).href),
    renderer: await sha256Url(new URL("./modules/renderer/html-renderer-s73-extension.js", BASE_URL).href),
    worksheet: await sha256Url(new URL("./modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", BASE_URL).href),
  };
  const scenarios = [];
  for (const scenario of SCENARIOS) scenarios.push(await runScenario(browser, scenario, browserErrors));
  if (browserErrors.consoleErrors.length || browserErrors.pageErrors.length) {
    fail("G4B_U04_R3D_BROWSER_ERRORS", browserErrors);
  }
  const manifest = {
    schemaVersion: "g4b-u04-r3d-deployed-approved-layouts-v1",
    task: "G4B_U04_R3D_DeployedQuestionOnly3x5And2x6Audit",
    status: "PASS",
    productionUse: "allowed_deployed_ui_print",
    deploymentSha: DEPLOYMENT_SHA,
    sourceId: SOURCE_ID,
    questionOnly: true,
    responsePromptCount: 0,
    approvedLayouts: [
      { columns: 3, rowsPerPage: 5, questionsPerFullPage: 15, mode: "auto_safe" },
      { columns: 2, rowsPerPage: 6, questionsPerFullPage: 12, mode: "custom_with_caps" },
    ],
    scenarioCount: scenarios.length,
    scenarios,
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
    schemaVersion: "g4b-u04-r3d-deployed-approved-layouts-v1",
    task: "G4B_U04_R3D_DeployedQuestionOnly3x5And2x6Audit",
    status: "FAIL",
    deploymentSha: DEPLOYMENT_SHA,
    scenarioId: error.scenarioId ?? null,
    pageUrl: error.pageUrl ?? null,
    message: error.message,
    details: error.details ?? null,
    ...browserErrors,
  };
  await writeFile(FAILURE_JSON, `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
