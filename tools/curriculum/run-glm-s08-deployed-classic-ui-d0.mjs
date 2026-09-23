import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "playwright";

import {
  GLM_S08_BOUNDARY_LAYOUT_IDS,
  buildGLMS08DeployedScenarioPlan,
  readGLMS08Contract,
} from "./glm-s08-deployed-scenario-plan.mjs";

const BASE_URL = process.env.GLM_S08_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const DEPLOYMENT_SHA = process.env.GLM_S08_DEPLOYMENT_SHA ?? "unknown";
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/glm-s08-deployed-classic-ui-d0");
const FAILURE_JSON = resolve(OUTPUT_DIR, "failure.json");
const FAILURE_SCREENSHOT = resolve(OUTPUT_DIR, "failure.png");
const MANIFEST_JSON = resolve(OUTPUT_DIR, "manifest.json");
const contract = readGLMS08Contract();
const scenarios = buildGLMS08DeployedScenarioPlan();
const expectedSourceIds = contract.publicUnits.map((unit) => unit.sourceId);
const expectedSourceLabels = contract.publicUnits.map((unit) => `${unit.unitCode} ${unit.title}`);
const boundaryLayoutSet = new Set(GLM_S08_BOUNDARY_LAYOUT_IDS);
const columnMaximumRows = Object.freeze({ 3: 5, 2: 6, 1: 7 });
const criticalAssets = Object.freeze([
  "index.html",
  "assets/browser/main.js",
  "assets/browser/state/query-state.js",
  "assets/browser/global-public-layout-controls.js",
  "modules/curriculum/batch-a/global-public-layout-contract.js",
  "modules/curriculum/batch-a/global-public-layout-overlay.js",
  "modules/curriculum/batch-a/g4a-u08-generator-validator-domain-fullfix.js",
]);

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function scenarioUrl(scenario, suffix = "run") {
  const url = new URL(BASE_URL);
  url.searchParams.set("sourceId", scenario.sourceId);
  url.searchParams.set("questionCount", String(scenario.questionCount));
  url.searchParams.set("ordering", "groupedByPattern");
  url.searchParams.set("answerKey", scenario.includeAnswerKey ? "1" : "0");
  url.searchParams.set("generationSeed", scenario.generationSeed);
  url.searchParams.set("columns", String(scenario.columns));
  url.searchParams.set("rowsPerPage", String(scenario.rowsPerPage));
  url.searchParams.set("glmS08", `${DEPLOYMENT_SHA}-${scenario.scenarioId}-${suffix}`);
  return url.href;
}

async function deployedAssetEvidence() {
  const evidence = [];
  for (const assetPath of criticalAssets) {
    const localPath = resolve("site", assetPath);
    const localBytes = await readFile(localPath);
    const remoteUrl = new URL(assetPath === "index.html" ? "./index.html" : `./${assetPath}`, BASE_URL);
    remoteUrl.searchParams.set("glmS08Asset", `${DEPLOYMENT_SHA}-${Date.now()}-${evidence.length}`);
    const response = await fetch(remoteUrl, { cache: "no-store" });
    if (!response.ok) fail("GLM_S08_DEPLOYED_ASSET_FETCH_FAILED", {
      assetPath,
      remoteUrl: remoteUrl.href,
      status: response.status,
    });
    const remoteBytes = Buffer.from(await response.arrayBuffer());
    const row = {
      assetPath,
      remoteUrl: remoteUrl.href,
      localBytes: localBytes.length,
      remoteBytes: remoteBytes.length,
      localSha256: sha256(localBytes),
      remoteSha256: sha256(remoteBytes),
    };
    row.exact = row.localBytes === row.remoteBytes && row.localSha256 === row.remoteSha256;
    if (!row.exact) fail("GLM_S08_DEPLOYED_ASSET_IDENTITY_MISMATCH", row);
    evidence.push(row);
  }
  return evidence;
}

function attachBrowserErrorCapture(page, label, consoleErrors, pageErrors) {
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${label}: ${message.text()}`);
  });
  page.on("pageerror", (error) => pageErrors.push(`${label}: ${String(error?.message ?? error)}`));
}

async function waitForHydration(page, scenario) {
  await page.waitForFunction(
    ({ sourceId, questionCount, includeAnswerKey, columns, rowsPerPage }) => {
      const source = document.querySelector("#batch-a-source-select");
      const mode = document.querySelector("#batch-a-selection-mode-select");
      const count = document.querySelector("#batch-a-question-count-input");
      const answer = document.querySelector("#batch-a-answer-key-input");
      const columnsInput = document.querySelector("#columns-input");
      const rowsInput = document.querySelector("#rows-per-page-input");
      const params = new URL(window.location.href).searchParams;
      return source?.value === sourceId
        && source?.options?.length === 15
        && mode?.value === "sourceUnit"
        && count?.value === String(questionCount)
        && answer?.checked === includeAnswerKey
        && columnsInput?.value === String(columns)
        && rowsInput?.value === String(rowsPerPage)
        && params.get("sourceId") === sourceId
        && params.get("questionCount") === String(questionCount)
        && params.get("answerKey") === (includeAnswerKey ? "1" : "0")
        && params.get("columns") === String(columns)
        && params.get("rowsPerPage") === String(rowsPerPage);
    },
    scenario,
    { timeout: 120000 },
  );
}

async function controlReadback(page) {
  return page.evaluate(() => ({
    sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
    sourceIds: [...(document.querySelector("#batch-a-source-select")?.options ?? [])].map((option) => option.value),
    sourceLabels: [...(document.querySelector("#batch-a-source-select")?.options ?? [])].map((option) => option.textContent?.trim() ?? ""),
    selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
    questionCount: Number(document.querySelector("#batch-a-question-count-input")?.value),
    answerKey: Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),
    columns: Number(document.querySelector("#columns-input")?.value),
    rowsPerPage: Number(document.querySelector("#rows-per-page-input")?.value),
    rowsMax: Number(document.querySelector("#rows-per-page-input")?.max),
    layoutHelp: document.querySelector("#global-layout-help")?.textContent?.trim() ?? "",
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled),
    query: Object.fromEntries(new URL(window.location.href).searchParams.entries()),
  }));
}

async function regenerate(page, scenario) {
  await page.click("#regenerate-button");
  await page.waitForFunction(
    () => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone),
    null,
    { timeout: 120000 },
  );
  const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
  const validation = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
  const previewMeta = (await page.locator("#preview-meta").textContent())?.trim() ?? "";
  const tone = await page.locator("#status-panel").getAttribute("data-tone");
  const layoutMode = await page.locator("#preview-meta").getAttribute("data-layout-mode");
  const layoutCapped = await page.locator("#preview-meta").getAttribute("data-layout-capped");
  if (
    tone !== "success"
    || !status.includes(`已產生 ${scenario.questionCount} 題`)
    || layoutMode !== "exact_approved_matrix"
    || layoutCapped !== "false"
    || !previewMeta.includes(`題目 ${scenario.columns} 欄 × ${scenario.rowsPerPage} 列`)
  ) {
    fail("GLM_S08_DEPLOYED_GENERATION_STATUS_FAILED", {
      scenario,
      tone,
      status,
      validation,
      previewMeta,
      layoutMode,
      layoutCapped,
      url: page.url(),
    });
  }
  await page.waitForFunction(
    (expectedCount) => {
      const frame = document.querySelector("#preview-frame");
      const doc = frame?.contentDocument;
      if (!doc?.body) return false;
      const selectors = [
        ".worksheet-cell--question",
        ".g4b-u04-cell--question",
        ".g5a-u08-cell--question",
        ".g5a-u02-card--question",
      ];
      const cards = new Set(selectors.flatMap((selector) => [...doc.querySelectorAll(selector)]));
      return cards.size === expectedCount;
    },
    scenario.questionCount,
    { timeout: 120000 },
  );
  return { tone, status, validation, previewMeta, layoutMode, layoutCapped };
}

async function auditPreviewFrame(page, scenario) {
  return page.locator("#preview-frame").evaluate((iframe, expected) => {
    const doc = iframe.contentDocument;
    if (!doc?.body) return { ready: false };
    function uniqueElements(selectors) {
      return [...new Set(selectors.flatMap((selector) => [...doc.querySelectorAll(selector)]))];
    }
    const visible = (node) => getComputedStyle(node).display !== "none";
    const questionPages = uniqueElements([
      '[data-page-type="question"]',
      ".worksheet-page--questions",
      ".g4b-u04-page--questions",
      ".g5a-u08-page--questions",
      ".g5a-u02-page--questions",
    ]).filter(visible);
    const answerPages = uniqueElements([
      '[data-page-type="answer"]',
      '[data-page-type="answer-key"]',
      ".worksheet-page--answer-key",
      ".worksheet-page--answers",
      ".g4b-u04-page--answers",
      ".g5a-u08-page--answers",
      ".g5a-u02-page--answers",
    ]).filter(visible);
    const questionCards = uniqueElements([
      ".worksheet-cell--question",
      ".g4b-u04-cell--question",
      ".g5a-u08-cell--question",
      ".g5a-u02-card--question",
    ]).filter(visible);
    const answerCards = uniqueElements([
      ".worksheet-cell--answer-key",
      ".worksheet-cell--answer",
      ".g4b-u04-cell--answer",
      ".g5a-u08-cell--answer",
      ".g5a-u02-card--answer",
    ]).filter(visible);
    const questionPrompts = uniqueElements([
      ".worksheet-cell--question .worksheet-cell__prompt",
      ".g4b-u04-cell--question .g4b-u04-cell__prompt",
      ".g5a-u08-cell--question .g5a-u08-cell__prompt",
      ".g5a-u02-card--question .g5a-u02-card__prompt",
    ]).filter(visible);
    const answerTexts = uniqueElements([
      ".worksheet-cell--answer-key .worksheet-cell__answer",
      ".worksheet-cell--answer .worksheet-cell__answer",
      ".g4b-u04-cell--answer .g4b-u04-cell__answer",
      ".g5a-u08-cell--answer .g5a-u08-cell__answer",
      ".g5a-u02-card--answer .g5a-u02-card__answer",
    ]).filter(visible);
    const pages = [...questionPages, ...answerPages];
    const cards = [...questionCards, ...answerCards];
    const textNodes = [...questionPrompts, ...answerTexts];
    const cardOverflow = cards.filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);
    const textOverflow = textNodes.filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);
    const pageOverflow = pages.filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);
    const missingQuestionPrompts = questionPrompts.filter((node) => !node.textContent?.trim());
    const missingAnswerTexts = answerTexts.filter((node) => !node.textContent?.trim());
    let overlapCount = 0;
    for (const worksheetPage of pages) {
      const pageCards = cards.filter((card) => worksheetPage.contains(card));
      for (let leftIndex = 0; leftIndex < pageCards.length; leftIndex += 1) {
        const left = pageCards[leftIndex].getBoundingClientRect();
        for (let rightIndex = leftIndex + 1; rightIndex < pageCards.length; rightIndex += 1) {
          const right = pageCards[rightIndex].getBoundingClientRect();
          const horizontal = Math.min(left.right, right.right) - Math.max(left.left, right.left);
          const vertical = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
          if (horizontal > 0.5 && vertical > 0.5) overlapCount += 1;
        }
      }
    }
    return {
      ready: true,
      questionPageCount: questionPages.length,
      answerPageCount: answerPages.length,
      questionCardCount: questionCards.length,
      answerCardCount: answerCards.length,
      questionPromptCount: questionPrompts.length,
      answerTextCount: answerTexts.length,
      cardOverflowCount: cardOverflow.length,
      textOverflowCount: textOverflow.length,
      pageOverflowCount: pageOverflow.length,
      interCardOverlapCount: overlapCount,
      missingQuestionPromptCount: missingQuestionPrompts.length,
      missingAnswerTextCount: missingAnswerTexts.length,
      publicLayoutMode: doc.body.dataset.publicLayoutMode ?? "",
      layoutMode: doc.body.dataset.g4bU04LayoutMode ?? "",
      layoutCapped: doc.body.dataset.g4bU04LayoutCapped ?? "",
      requestedColumns: Number(doc.body.dataset.g4bU04RequestedColumns),
      requestedRows: Number(doc.body.dataset.g4bU04RequestedRows),
      resolvedColumns: Number(doc.body.dataset.g4bU04ResolvedColumns),
      resolvedRows: Number(doc.body.dataset.g4bU04ResolvedRows),
      answerColumns: Number(doc.body.dataset.g4bU04AnswerColumns),
      answerRows: Number(doc.body.dataset.g4bU04AnswerRows),
      appliedLayoutMeta: doc.querySelector('meta[name="g4b-u04-applied-layout"]')?.content ?? "",
      expected,
    };
  }, scenario);
}

function validateAudit(scenario, audit) {
  const expectedAnswerCount = scenario.includeAnswerKey ? scenario.questionCount : 0;
  const failures = [];
  if (!audit.ready) failures.push("PREVIEW_NOT_READY");
  if (audit.questionPageCount < 1) failures.push("QUESTION_PAGE_MISSING");
  if (audit.questionCardCount !== scenario.questionCount) failures.push("QUESTION_CARD_COUNT_MISMATCH");
  if (audit.questionPromptCount !== scenario.questionCount) failures.push("QUESTION_PROMPT_COUNT_MISMATCH");
  if (audit.answerCardCount !== expectedAnswerCount) failures.push("ANSWER_CARD_COUNT_MISMATCH");
  if (audit.answerTextCount !== expectedAnswerCount) failures.push("ANSWER_TEXT_COUNT_MISMATCH");
  if (scenario.includeAnswerKey && audit.answerPageCount < 1) failures.push("ANSWER_PAGE_MISSING");
  if (!scenario.includeAnswerKey && audit.answerPageCount !== 0) failures.push("ANSWER_PAGE_OFF_LEAK");
  if (audit.cardOverflowCount || audit.textOverflowCount || audit.pageOverflowCount) failures.push("OVERFLOW");
  if (audit.interCardOverlapCount) failures.push("OVERLAP");
  if (audit.missingQuestionPromptCount) failures.push("QUESTION_PROMPT_MISSING");
  if (audit.missingAnswerTextCount) failures.push("ANSWER_TEXT_MISSING");
  if (audit.publicLayoutMode !== "exact_approved_matrix") failures.push("PUBLIC_LAYOUT_MODE_INVALID");
  if (audit.layoutMode !== "exact_approved_matrix") failures.push("LAYOUT_MODE_INVALID");
  if (audit.layoutCapped !== "false") failures.push("LAYOUT_CAPPED");
  if (audit.requestedColumns !== scenario.columns || audit.resolvedColumns !== scenario.columns) failures.push("COLUMN_READBACK_MISMATCH");
  if (audit.requestedRows !== scenario.rowsPerPage || audit.resolvedRows !== scenario.rowsPerPage) failures.push("ROW_READBACK_MISMATCH");
  if (!Number.isInteger(audit.answerColumns) || audit.answerColumns < 1) failures.push("ANSWER_COLUMNS_INVALID");
  if (!Number.isInteger(audit.answerRows) || audit.answerRows < 1) failures.push("ANSWER_ROWS_INVALID");
  if (!audit.appliedLayoutMeta.includes(`題目 ${scenario.columns} 欄 × ${scenario.rowsPerPage} 列`)) failures.push("APPLIED_LAYOUT_META_MISMATCH");
  return failures;
}

async function invokePrint(page, scenario) {
  await page.locator("#preview-frame").evaluate((iframe, marker) => {
    iframe.contentWindow.__glmS08PrintMarker = null;
    iframe.contentWindow.print = () => { iframe.contentWindow.__glmS08PrintMarker = marker; };
  }, scenario.scenarioId);
  if (await page.locator("#print-button").isDisabled()) {
    fail("GLM_S08_DEPLOYED_PRINT_BUTTON_DISABLED", { scenario, url: page.url() });
  }
  await page.click("#print-button");
  const marker = await page.locator("#preview-frame").evaluate((iframe) => iframe.contentWindow.__glmS08PrintMarker);
  if (marker !== scenario.scenarioId) fail("GLM_S08_DEPLOYED_PRINT_TARGET_NOT_INVOKED", { scenario, marker });
  return true;
}

async function auditInventoryAndSourceSwitch(browser, consoleErrors, pageErrors) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  attachBrowserErrorCapture(page, "inventory", consoleErrors, pageErrors);
  const first = scenarios[0];
  const response = await page.goto(scenarioUrl(first, "inventory"), { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) fail("GLM_S08_DEPLOYED_INDEX_HTTP_FAILED", { status: response?.status() });
  await waitForHydration(page, first);
  const initial = await controlReadback(page);
  if (JSON.stringify(initial.sourceIds) !== JSON.stringify(expectedSourceIds)) {
    fail("GLM_S08_DEPLOYED_SOURCE_INVENTORY_ID_MISMATCH", { expectedSourceIds, actual: initial.sourceIds });
  }
  if (JSON.stringify(initial.sourceLabels) !== JSON.stringify(expectedSourceLabels)) {
    fail("GLM_S08_DEPLOYED_SOURCE_INVENTORY_LABEL_MISMATCH", { expectedSourceLabels, actual: initial.sourceLabels });
  }

  const dependentRows = [];
  for (const columns of [3, 2, 1]) {
    await page.locator("#columns-input").evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, columns);
    await page.waitForFunction(
      ({ columns, maximum }) => document.querySelector("#columns-input")?.value === String(columns)
        && document.querySelector("#rows-per-page-input")?.max === String(maximum)
        && document.querySelector("#global-layout-help")?.textContent?.includes(`1～${maximum} 列`),
      { columns, maximum: columnMaximumRows[columns] },
      { timeout: 120000 },
    );
    dependentRows.push({ columns, maximum: Number(await page.locator("#rows-per-page-input").getAttribute("max")) });
  }

  const sourceSwitchResults = [];
  for (const sourceId of expectedSourceIds) {
    await page.selectOption("#batch-a-source-select", sourceId);
    await page.waitForFunction(
      (expected) => document.querySelector("#batch-a-source-select")?.value === expected
        && new URL(window.location.href).searchParams.get("sourceId") === expected,
      sourceId,
      { timeout: 120000 },
    );
    sourceSwitchResults.push({
      sourceId,
      controlValue: await page.locator("#batch-a-source-select").inputValue(),
      queryValue: new URL(page.url()).searchParams.get("sourceId"),
    });
  }
  await page.close();
  return { initial, dependentRows, sourceSwitchResults };
}

async function runScenario(browser, scenario, index, consoleErrors, pageErrors) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const label = `${index + 1}/${scenarios.length}:${scenario.scenarioId}`;
  attachBrowserErrorCapture(page, label, consoleErrors, pageErrors);
  const testedUrl = scenarioUrl(scenario, `scenario-${index + 1}`);
  const response = await page.goto(testedUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) fail("GLM_S08_DEPLOYED_SCENARIO_HTTP_FAILED", {
    scenario,
    status: response?.status(),
    testedUrl,
  });
  await waitForHydration(page, scenario);
  const controls = await controlReadback(page);
  const expectedRowsMax = columnMaximumRows[scenario.columns];
  if (
    controls.sourceId !== scenario.sourceId
    || controls.selectionMode !== "sourceUnit"
    || controls.questionCount !== scenario.questionCount
    || controls.answerKey !== scenario.includeAnswerKey
    || controls.columns !== scenario.columns
    || controls.rowsPerPage !== scenario.rowsPerPage
    || controls.rowsMax !== expectedRowsMax
  ) fail("GLM_S08_DEPLOYED_CONTROL_HYDRATION_MISMATCH", { scenario, controls, expectedRowsMax });

  const generation = await regenerate(page, scenario);
  const audit = await auditPreviewFrame(page, scenario);
  const findings = validateAudit(scenario, audit);
  if (findings.length > 0) fail("GLM_S08_DEPLOYED_PREVIEW_CONTRACT_FAILED", {
    scenario,
    findings,
    controls,
    generation,
    audit,
    testedUrl,
  });
  let printCalled = false;
  if (scenario.printRequired) printCalled = await invokePrint(page, scenario);

  let reloadHydration = null;
  if (scenario.reloadRequired) {
    await page.reload({ waitUntil: "networkidle", timeout: 120000 });
    await waitForHydration(page, scenario);
    reloadHydration = await controlReadback(page);
    if (
      reloadHydration.sourceId !== scenario.sourceId
      || reloadHydration.answerKey !== scenario.includeAnswerKey
      || reloadHydration.columns !== scenario.columns
      || reloadHydration.rowsPerPage !== scenario.rowsPerPage
    ) fail("GLM_S08_DEPLOYED_RELOAD_HYDRATION_FAILED", { scenario, reloadHydration, url: page.url() });
  }

  const result = {
    scenarioId: scenario.scenarioId,
    sourceId: scenario.sourceId,
    layoutId: scenario.layoutId,
    answerStateId: scenario.answerStateId,
    testedUrl,
    queryReplayPass: true,
    generationPass: true,
    previewPass: true,
    printPass: scenario.printRequired ? printCalled : null,
    reloadPass: scenario.reloadRequired ? Boolean(reloadHydration) : null,
    controls,
    generation,
    audit,
    findings: [],
  };
  await page.close();
  return result;
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];
let activePage = null;
try {
  const assets = await deployedAssetEvidence();
  const inventory = await auditInventoryAndSourceSwitch(browser, consoleErrors, pageErrors);
  const scenarioResults = [];
  for (const [index, scenario] of scenarios.entries()) {
    scenarioResults.push(await runScenario(browser, scenario, index, consoleErrors, pageErrors));
  }
  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    fail("GLM_S08_DEPLOYED_BROWSER_ERRORS", { consoleErrors, pageErrors });
  }

  const answerOffResults = scenarioResults.filter((row) => row.answerStateId === "answer-off");
  const answerOnResults = scenarioResults.filter((row) => row.answerStateId === "answer-on");
  const printResults = scenarioResults.filter((row) => row.printPass !== null);
  const reloadResults = scenarioResults.filter((row) => row.reloadPass !== null);
  const sourceSummaries = contract.publicUnits.map((unit) => {
    const rows = scenarioResults.filter((row) => row.sourceId === unit.sourceId);
    return {
      sourceId: unit.sourceId,
      unitCode: unit.unitCode,
      scenarioCount: rows.length,
      passCount: rows.filter((row) => row.queryReplayPass && row.generationPass && row.previewPass).length,
      printPassCount: rows.filter((row) => row.printPass === true).length,
      reloadPassCount: rows.filter((row) => row.reloadPass === true).length,
    };
  });
  const layoutSummaries = contract.approvedLayouts.map((layout) => {
    const rows = answerOffResults.filter((row) => row.layoutId === layout.layoutId);
    return {
      layoutId: layout.layoutId,
      scenarioCount: rows.length,
      passCount: rows.filter((row) => row.previewPass).length,
    };
  });
  const manifest = {
    schemaVersion: "glm-s08-deployed-classic-ui-d0-v1",
    task: "GLM-S08_DeployedClassicUIAndD0Closeout",
    status: "PASS_ACCEPTED",
    globalStatus: "D0_GLOBAL_COMPLETED_UNITS_18_LAYOUT_MATRIX_CLOSED",
    productionUse: "allowed_deployed_classic_ui_query_preview_print",
    deploymentSha: DEPLOYMENT_SHA,
    deployedUrl: BASE_URL,
    publicUnitCount: contract.scope.publicUnitCount,
    approvedLayoutCountPerUnit: contract.scope.approvedLayoutCountPerUnit,
    scenarioCount: scenarioResults.length,
    queryReplayPassCount: scenarioResults.length,
    generationPassCount: scenarioResults.length,
    previewPassCount: scenarioResults.length,
    answerOffScenarioCount: answerOffResults.length,
    answerOnScenarioCount: answerOnResults.length,
    printScenarioCount: printResults.length,
    printPassCount: printResults.filter((row) => row.printPass).length,
    reloadScenarioCount: reloadResults.length,
    reloadPassCount: reloadResults.filter((row) => row.reloadPass).length,
    sourceSwitchCount: inventory.sourceSwitchResults.length,
    sourceSwitchPassCount: inventory.sourceSwitchResults.filter((row) => row.controlValue === row.sourceId && row.queryValue === row.sourceId).length,
    assetCount: assets.length,
    assetIdentityPassCount: assets.filter((row) => row.exact).length,
    consoleErrorCount: 0,
    pageErrorCount: 0,
    renderFindingCount: 0,
    genericFallback: false,
    freeFormAI: false,
    boundaryLayoutIds: GLM_S08_BOUNDARY_LAYOUT_IDS,
    assets,
    inventory,
    sourceSummaries,
    layoutSummaries,
    scenarioResults,
    nextTask: null,
  };
  if (
    manifest.scenarioCount !== 315
    || manifest.answerOffScenarioCount !== 270
    || manifest.answerOnScenarioCount !== 45
    || manifest.printScenarioCount !== 90
    || manifest.printPassCount !== 90
    || manifest.reloadScenarioCount !== 15
    || manifest.reloadPassCount !== 15
    || manifest.sourceSwitchPassCount !== 15
    || manifest.assetIdentityPassCount !== criticalAssets.length
    || sourceSummaries.some((row) => row.scenarioCount !== 21 || row.passCount !== 21 || row.printPassCount !== 6 || row.reloadPassCount !== 1)
    || layoutSummaries.some((row) => row.scenarioCount !== 15 || row.passCount !== 15)
  ) fail("GLM_S08_DEPLOYED_TERMINAL_COUNTS_INVALID", manifest);
  await writeFile(MANIFEST_JSON, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    status: manifest.status,
    globalStatus: manifest.globalStatus,
    deploymentSha: manifest.deploymentSha,
    scenarioCount: manifest.scenarioCount,
    queryReplayPassCount: manifest.queryReplayPassCount,
    generationPassCount: manifest.generationPassCount,
    previewPassCount: manifest.previewPassCount,
    printPassCount: manifest.printPassCount,
    reloadPassCount: manifest.reloadPassCount,
    sourceSwitchPassCount: manifest.sourceSwitchPassCount,
    assetIdentityPassCount: manifest.assetIdentityPassCount,
    consoleErrorCount: manifest.consoleErrorCount,
    pageErrorCount: manifest.pageErrorCount,
  }, null, 2));
} catch (error) {
  try {
    if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: FAILURE_SCREENSHOT, fullPage: true });
  } catch {}
  const failure = {
    schemaVersion: "glm-s08-deployed-classic-ui-d0-v1",
    task: "GLM-S08_DeployedClassicUIAndD0Closeout",
    status: "FAIL",
    deploymentSha: DEPLOYMENT_SHA,
    deployedUrl: BASE_URL,
    message: error.message,
    details: error.details ?? null,
    consoleErrors,
    pageErrors,
    verifiedAt: new Date().toISOString(),
  };
  await writeFile(FAILURE_JSON, `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  console.error(JSON.stringify(failure, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
