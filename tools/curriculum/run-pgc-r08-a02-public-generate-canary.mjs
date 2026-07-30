import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A02.public-generate-canary-harness.json",
);
const CAPACITY_PATH = path.join(
  ROOT,
  "data/curriculum/public-generation/generator_capacity_contract.json",
);
const OUTPUT_DIR = path.join(ROOT, "tmp/pgc-r08-a02-public-generate-canary");
const HTML_DIR = path.join(OUTPUT_DIR, "html");
const PDF_DIR = path.join(OUTPUT_DIR, "pdfs");
const FAILURE_DIR = path.join(OUTPUT_DIR, "failures");
const REPORT_PATH = path.join(OUTPUT_DIR, "report.json");
const SITE_PORT = 4195;
const SITE_ORIGIN = `http://127.0.0.1:${SITE_PORT}`;

const SELECTORS = Object.freeze({
  source: "#batch-a-source-select",
  selectionMode: "#batch-a-selection-mode-select",
  kpPanel: "#batch-a-knowledge-point-panel",
  pgPanel: "#batch-a-pattern-group-panel",
  questionType: "#g5a-u08-question-mode",
  depthMode: "#g5a-u08-depth-mode",
  contextMode: "#g5a-u08-context-mode",
  capabilitySection: "#g5a-u08-public-controls",
  questionCount: "#batch-a-question-count-input",
  answerKey: "#batch-a-answer-key-input",
  seed: "#generation-seed-input",
  generate: "#regenerate-button",
  print: "#print-button",
  status: "#status-panel",
  validation: "#validation-panel",
  previewMeta: "#preview-meta",
  previewFrame: "#preview-frame",
});

const QUESTION_CELL_SELECTOR = [
  ".worksheet-cell--question",
  '[data-cell-type="question"]',
  ".g5a-u08-cell--question",
  ".g4b-u04-cell--question",
].join(",");
const ANSWER_CELL_SELECTOR = [
  ".worksheet-cell--answer-key",
  '[data-cell-type="answerKey"]',
  ".g5a-u08-cell--answer",
  ".g4b-u04-cell--answer",
].join(",");
const QUESTION_PAGE_SELECTOR = [
  ".worksheet-page--questions",
  '[data-page-type="questions"]',
  ".g5a-u08-page--questions",
  ".g4b-u04-page--questions",
].join(",");
const ANSWER_PAGE_SELECTOR = [
  ".worksheet-page--answer-key",
  '[data-page-type="answerKey"]',
  ".g5a-u08-page--answers",
  ".g4b-u04-page--answers",
].join(",");

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function safeStem(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
}

async function waitForServer(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // Retry while the static server starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R08_A02_SITE_SERVER_TIMEOUT", { url });
}

async function optionValues(page, selector) {
  return page.locator(selector).evaluate((select) => [...select.options].map((option) => option.value));
}

async function selectAvailableOption(page, selector, value) {
  await page.waitForFunction(
    ({ selector: target, value: expected }) => [...(document.querySelector(target)?.options ?? [])]
      .some((option) => option.value === expected),
    { selector, value },
    { timeout: 120000 },
  );
  await page.selectOption(selector, value);
  await page.waitForFunction(
    ({ selector: target, value: expected }) => document.querySelector(target)?.value === expected,
    { selector, value },
    { timeout: 120000 },
  );
}

async function setKnowledgePoints(page, route) {
  if (route.selectionMode === "sourceUnit") return;
  const desired = new Set(route.selectedKnowledgePointIds);
  await page.locator(`${SELECTORS.kpPanel} [data-knowledge-point-id]`).first()
    .waitFor({ state: "visible", timeout: 120000 });
  for (const knowledgePointId of desired) {
    const button = page.locator(
      `${SELECTORS.kpPanel} [data-knowledge-point-id="${knowledgePointId}"]`,
    );
    await button.waitFor({ state: "visible", timeout: 120000 });
    if (await button.isDisabled()) {
      fail("PGC_R08_A02_KP_NOT_SELECTABLE", { routeId: route.routeId, knowledgePointId });
    }
    if (await button.getAttribute("data-selected") !== "true") await button.click();
  }

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const extraIds = await page.locator(
      `${SELECTORS.kpPanel} [data-knowledge-point-id][data-selected="true"]`,
    ).evaluateAll((buttons, expectedIds) => buttons
      .map((button) => button.dataset.knowledgePointId)
      .filter((id) => id && !expectedIds.includes(id)), [...desired]);
    if (extraIds.length === 0) break;
    await page.locator(
      `${SELECTORS.kpPanel} [data-knowledge-point-id="${extraIds[0]}"]`,
    ).click();
  }

  const actual = await page.locator(
    `${SELECTORS.kpPanel} [data-knowledge-point-id][data-selected="true"]`,
  ).evaluateAll((buttons) => buttons.map((button) => button.dataset.knowledgePointId).filter(Boolean).sort());
  const expected = [...desired].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail("PGC_R08_A02_KP_SELECTION_MISMATCH", { routeId: route.routeId, expected, actual });
  }
}

async function routeIdsFromUi(page) {
  const value = await page.locator(SELECTORS.questionCount).getAttribute("data-capacity-route-ids");
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

async function selectCompatiblePatternGroupsUntilBound(page, routeId) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const routeIds = await routeIdsFromUi(page);
    if (routeIds.includes(routeId)) return routeIds;
    const candidate = page.locator(
      `${SELECTORS.pgPanel} [data-pattern-group-id][data-compatible="true"][data-selected="false"]:not([hidden]):not([disabled])`,
    ).first();
    if (await candidate.count() === 0) break;
    await candidate.click();
    await page.waitForTimeout(0);
  }
  const routeIds = await routeIdsFromUi(page);
  if (!routeIds.includes(routeId)) {
    fail("PGC_R08_A02_TARGET_CAPACITY_ROUTE_NOT_BOUND", { routeId, routeIds });
  }
  return routeIds;
}

async function configureRoute(page, route) {
  await selectAvailableOption(page, SELECTORS.source, route.sourceId);
  await selectAvailableOption(page, SELECTORS.selectionMode, route.selectionMode);
  await setKnowledgePoints(page, route);

  await page.waitForFunction(
    ({ selector, sourceId }) => document.querySelector(selector)?.dataset.sourceId === sourceId,
    { selector: SELECTORS.capabilitySection, sourceId: route.sourceId },
    { timeout: 120000 },
  );
  await selectAvailableOption(page, SELECTORS.questionType, route.questionType);
  if (route.depthMode !== null) await selectAvailableOption(page, SELECTORS.depthMode, route.depthMode);
  if (route.contextMode !== null) await selectAvailableOption(page, SELECTORS.contextMode, route.contextMode);
  const routeIds = await selectCompatiblePatternGroupsUntilBound(page, route.routeId);

  await page.fill(SELECTORS.questionCount, String(route.requestedQuestionCount));
  await page.check(SELECTORS.answerKey);
  const actualQuestionCountInput = Number(await page.locator(SELECTORS.questionCount).inputValue());
  const maxQuestionCount = Number(await page.locator(SELECTORS.questionCount).getAttribute("max"));
  const capacityStatus = await page.locator(SELECTORS.questionCount).getAttribute("data-capacity-status");
  const availableQuestionTypes = await optionValues(page, SELECTORS.questionType);
  const availableDepthModes = await optionValues(page, SELECTORS.depthMode);
  const availableContextModes = await optionValues(page, SELECTORS.contextMode);

  return {
    routeIds,
    actualQuestionCountInput,
    maxQuestionCount,
    capacityStatus,
    availableQuestionTypes,
    availableDepthModes,
    availableContextModes,
  };
}

async function waitForGeneration(page, previousHash = null) {
  await page.waitForFunction(
    () => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone),
    null,
    { timeout: 120000 },
  );
  if (previousHash) {
    await page.waitForFunction(
      ({ selector, previous }) => {
        const frame = document.querySelector(selector);
        const text = frame?.contentDocument?.body?.innerText ?? "";
        let hash = 0;
        for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
        return String(hash) !== previous;
      },
      { selector: SELECTORS.previewFrame, previous: previousHash },
      { timeout: 120000 },
    );
  }
}

async function previewFrame(page) {
  const handle = await page.locator(SELECTORS.previewFrame).elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) fail("PGC_R08_A02_PREVIEW_FRAME_MISSING");
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  return frame;
}

async function readPreview(page) {
  const frame = await previewFrame(page);
  const questionCells = frame.locator(QUESTION_CELL_SELECTOR);
  const answerCells = frame.locator(ANSWER_CELL_SELECTOR);
  const questionTexts = (await questionCells.allInnerTexts()).map((value) => value.trim()).filter(Boolean);
  const answerTexts = (await answerCells.allInnerTexts()).map((value) => value.trim()).filter(Boolean);
  const questionIds = await questionCells.evaluateAll((cells) => cells.map((cell, index) => (
    cell.dataset.questionId
    ?? cell.dataset.questionNumber
    ?? cell.querySelector(".worksheet-cell__number,.g5a-u08-cell__number,.g4b-u04-cell__number")?.textContent?.trim()
    ?? String(index + 1)
  )));
  const answerIds = await answerCells.evaluateAll((cells) => cells.map((cell, index) => (
    cell.dataset.questionId
    ?? cell.dataset.questionNumber
    ?? cell.querySelector(".worksheet-cell__number,.g5a-u08-cell__number,.g4b-u04-cell__number")?.textContent?.trim()
    ?? String(index + 1)
  )));
  const html = await frame.content();
  const publicText = await frame.locator("body").innerText();
  return {
    questionCount: questionCells.count ? await questionCells.count() : questionTexts.length,
    answerCount: answerCells.count ? await answerCells.count() : answerTexts.length,
    questionPageCount: await frame.locator(QUESTION_PAGE_SELECTOR).count(),
    answerPageCount: await frame.locator(ANSWER_PAGE_SELECTOR).count(),
    questionTexts,
    answerTexts,
    questionIds,
    answerIds,
    questionIdentitySha256: sha256(JSON.stringify(questionTexts)),
    answerIdentitySha256: sha256(JSON.stringify(answerTexts)),
    html,
    htmlSha256: sha256(html),
    publicText,
  };
}

function injectBaseHref(html) {
  const base = `<base href="${SITE_ORIGIN}/index.html">`;
  return html.includes("<head>") ? html.replace("<head>", `<head>${base}`) : `${base}${html}`;
}

async function writePdf(browser, html, stem) {
  const printPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await printPage.setContent(injectBaseHref(html), { waitUntil: "networkidle", timeout: 120000 });
    await printPage.emulateMedia({ media: "print" });
    await printPage.evaluate(async () => document.fonts?.ready);
    const pdf = await printPage.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    if (pdf.length < 5000 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      fail("PGC_R08_A02_PDF_INVALID", { stem, bytes: pdf.length });
    }
    const pdfPath = path.join(PDF_DIR, `${stem}.pdf`);
    await writeFile(pdfPath, pdf);
    return {
      pdfPath: path.relative(ROOT, pdfPath),
      pdfBytes: pdf.length,
      pdfSha256: sha256(pdf),
    };
  } finally {
    await printPage.close();
  }
}

async function assertPrintTarget(page, routeId) {
  await page.locator(SELECTORS.previewFrame).evaluate((iframe) => {
    iframe.contentWindow.__pgcR08PrintCalled = false;
    iframe.contentWindow.print = () => {
      iframe.contentWindow.__pgcR08PrintCalled = true;
    };
  });
  if (await page.locator(SELECTORS.print).isDisabled()) {
    fail("PGC_R08_A02_PRINT_DISABLED", { routeId });
  }
  await page.click(SELECTORS.print);
  const called = await page.locator(SELECTORS.previewFrame).evaluate(
    (iframe) => iframe.contentWindow.__pgcR08PrintCalled === true,
  );
  if (!called) fail("PGC_R08_A02_PRINT_TARGET_NOT_INVOKED", { routeId });
  return called;
}

function gateMap(value = "PENDING") {
  return {
    UI_OPTIONS_PASS: value,
    GENERATE_BUTTON_PASS: value,
    QUESTION_COUNT_PASS: value,
    QUESTION_IDENTITY_PASS: value,
    ANSWER_VALIDATION_PASS: value,
    REGENERATE_PASS: value,
    HTML_PASS: value,
    PDF_PASS: value,
    ANSWER_KEY_PASS: value,
  };
}

async function executeRoute(browser, route) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const gates = gateMap();
  const stem = safeStem(route.canaryId);
  try {
    const response = await page.goto(`${SITE_ORIGIN}/index.html?pgcR08A02=${encodeURIComponent(route.canaryId)}-${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    if (!response?.ok()) fail("PGC_R08_A02_PUBLIC_UI_HTTP_FAILED", { routeId: route.routeId, status: response?.status() });

    const ui = await configureRoute(page, route);
    gates.UI_OPTIONS_PASS = "PASS";
    await page.fill(SELECTORS.seed, `pgc-r08-a02-${route.canaryId}-seed-a`);
    await page.click(SELECTORS.generate);
    await waitForGeneration(page);
    const tone = await page.locator(SELECTORS.status).getAttribute("data-tone");
    const statusText = (await page.locator(SELECTORS.status).textContent())?.trim() ?? "";
    const validationText = (await page.locator(SELECTORS.validation).textContent())?.trim() ?? "";
    const previewMeta = (await page.locator(SELECTORS.previewMeta).textContent())?.trim() ?? "";
    if (tone !== "success") {
      fail("PGC_R08_A02_GENERATE_BUTTON_FAILED", { routeId: route.routeId, tone, statusText, validationText, previewMeta, ui });
    }
    gates.GENERATE_BUTTON_PASS = "PASS";
    const first = await readPreview(page);
    const expectedPositive = route.expectedDisposition === "PASS_ALL_NINE_GATES";
    const effectiveCount = ui.actualQuestionCountInput;

    if (expectedPositive) {
      if (effectiveCount !== 20 || first.questionCount !== 20) {
        fail("PGC_R08_A02_POSITIVE_QUESTION_COUNT_FAILED", { routeId: route.routeId, effectiveCount, preview: first, ui });
      }
      gates.QUESTION_COUNT_PASS = "PASS";
    } else {
      if (!(effectiveCount === route.verifiedMaxQuestionCount && effectiveCount < route.requestedQuestionCount)) {
        fail("PGC_R08_A02_LIMITED_CAPACITY_DIAGNOSTIC_NOT_CAPTURED", { routeId: route.routeId, effectiveCount, route, ui });
      }
      gates.QUESTION_COUNT_PASS = "FAIL_EXPECTED_CAPACITY_GAP";
    }

    if (first.questionCount !== effectiveCount || first.questionTexts.length !== effectiveCount) {
      fail("PGC_R08_A02_RENDERED_QUESTION_COUNT_MISMATCH", { routeId: route.routeId, effectiveCount, preview: first });
    }
    if (first.answerCount !== effectiveCount || first.answerTexts.length !== effectiveCount) {
      fail("PGC_R08_A02_RENDERED_ANSWER_COUNT_MISMATCH", { routeId: route.routeId, effectiveCount, preview: first });
    }
    if (first.questionPageCount < 1 || first.answerPageCount < 1) {
      fail("PGC_R08_A02_PAGE_PROJECTION_MISSING", { routeId: route.routeId, preview: first });
    }
    if (first.questionIdentitySha256 === sha256("[]")) {
      fail("PGC_R08_A02_QUESTION_IDENTITY_EMPTY", { routeId: route.routeId });
    }
    gates.QUESTION_IDENTITY_PASS = "PASS";

    const normalizedQuestionIds = first.questionIds.map(String);
    const normalizedAnswerIds = first.answerIds.map(String);
    if (JSON.stringify(normalizedQuestionIds) !== JSON.stringify(normalizedAnswerIds)) {
      fail("PGC_R08_A02_ANSWER_BIJECTION_FAILED", { routeId: route.routeId, normalizedQuestionIds, normalizedAnswerIds });
    }
    if (/undefined|null|\{\{[^}]+\}\}|\[[A-Z_]+\]/.test(first.publicText)) {
      fail("PGC_R08_A02_PUBLIC_OUTPUT_LEAK", { routeId: route.routeId });
    }
    gates.ANSWER_VALIDATION_PASS = "PASS";
    gates.ANSWER_KEY_PASS = "PASS";

    const htmlPath = path.join(HTML_DIR, `${stem}.html`);
    await writeFile(htmlPath, first.html, "utf8");
    if (!first.html.includes("<html") || !first.html.includes("worksheet") || /undefined|null/.test(first.html)) {
      fail("PGC_R08_A02_HTML_INVALID", { routeId: route.routeId });
    }
    gates.HTML_PASS = "PASS";
    const pdf = await writePdf(browser, first.html, stem);
    gates.PDF_PASS = "PASS";
    const printCalled = await assertPrintTarget(page, route.routeId);

    const previousBrowserHash = await page.locator(SELECTORS.previewFrame).evaluate((iframe) => {
      const text = iframe.contentDocument?.body?.innerText ?? "";
      let hash = 0;
      for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
      return String(hash);
    });
    await page.fill(SELECTORS.seed, `pgc-r08-a02-${route.canaryId}-seed-b`);
    await page.click(SELECTORS.generate);
    await waitForGeneration(page, previousBrowserHash);
    const secondTone = await page.locator(SELECTORS.status).getAttribute("data-tone");
    if (secondTone !== "success") fail("PGC_R08_A02_REGENERATE_FAILED", { routeId: route.routeId, secondTone });
    const second = await readPreview(page);
    if (expectedPositive && second.questionIdentitySha256 === first.questionIdentitySha256) {
      fail("PGC_R08_A02_REGENERATE_IDENTITY_UNCHANGED", { routeId: route.routeId, identity: first.questionIdentitySha256 });
    }
    gates.REGENERATE_PASS = expectedPositive ? "PASS" : "PASS_DIAGNOSTIC_CAPACITY_GAP_PRESERVED";

    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      fail("PGC_R08_A02_BROWSER_ERRORS", { routeId: route.routeId, consoleErrors, pageErrors });
    }

    return {
      canaryId: route.canaryId,
      routeId: route.routeId,
      sourceId: route.sourceId,
      selectionMode: route.selectionMode,
      questionType: route.questionType,
      capacityStatus: route.capacityStatus,
      expectedDisposition: route.expectedDisposition,
      actualDisposition: expectedPositive ? "PASS_ALL_NINE_GATES" : "CAPTURED_EXPECTED_20_QUESTION_CAPACITY_GAP",
      requestedQuestionCount: route.requestedQuestionCount,
      effectiveQuestionCount: effectiveCount,
      verifiedMaxQuestionCount: route.verifiedMaxQuestionCount,
      gateStatus: gates,
      uiBinding: ui,
      firstGeneration: {
        questionCount: first.questionCount,
        answerCount: first.answerCount,
        questionPageCount: first.questionPageCount,
        answerPageCount: first.answerPageCount,
        questionIdentitySha256: first.questionIdentitySha256,
        answerIdentitySha256: first.answerIdentitySha256,
        htmlPath: path.relative(ROOT, htmlPath),
        htmlSha256: first.htmlSha256,
        ...pdf,
        printCalled,
      },
      secondGeneration: {
        questionCount: second.questionCount,
        answerCount: second.answerCount,
        questionIdentitySha256: second.questionIdentitySha256,
        answerIdentitySha256: second.answerIdentitySha256,
      },
      consoleErrorCount: 0,
      pageErrorCount: 0,
      status: "PASS",
    };
  } catch (error) {
    const failure = {
      canaryId: route.canaryId,
      routeId: route.routeId,
      status: "FAIL",
      message: error.message,
      details: error.details ?? null,
      pageUrl: page.url(),
      consoleErrors,
      pageErrors,
    };
    await writeFile(path.join(FAILURE_DIR, `${stem}.json`), `${JSON.stringify(failure, null, 2)}\n`, "utf8");
    try {
      await page.screenshot({ path: path.join(FAILURE_DIR, `${stem}.png`), fullPage: true });
    } catch {
      // Preserve the primary failure.
    }
    return failure;
  } finally {
    await page.close();
  }
}

const contract = JSON.parse(await readFile(CONTRACT_PATH, "utf8"));
const capacity = JSON.parse(await readFile(CAPACITY_PATH, "utf8"));
const capacityByRouteId = new Map(capacity.routes.map((route) => [route.routeId, route]));
for (const canary of contract.canaryRoutes) {
  const authority = capacityByRouteId.get(canary.routeId);
  if (!authority || authority.legalRoute !== true) {
    fail("PGC_R08_A02_CANARY_ROUTE_NOT_LEGAL", { canary });
  }
  for (const field of [
    "sourceId",
    "selectionMode",
    "questionType",
    "depthMode",
    "contextMode",
    "capacityStatus",
    "verifiedMaxQuestionCount",
  ]) {
    if ((authority[field] ?? null) !== (canary[field] ?? null)) {
      fail("PGC_R08_A02_CANARY_ROUTE_AUTHORITY_DRIFT", { routeId: canary.routeId, field, authority: authority[field], canary: canary[field] });
    }
  }
  if (JSON.stringify([...(authority.selectedKnowledgePointIds ?? [])].sort()) !== JSON.stringify([...canary.selectedKnowledgePointIds].sort())) {
    fail("PGC_R08_A02_CANARY_KP_AUTHORITY_DRIFT", { routeId: canary.routeId });
  }
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(HTML_DIR, { recursive: true });
await mkdir(PDF_DIR, { recursive: true });
await mkdir(FAILURE_DIR, { recursive: true });

const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
  cwd: ROOT,
  env: { ...process.env, SITE_PORT: String(SITE_PORT), SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let browser;
try {
  await waitForServer(`${SITE_ORIGIN}/index.html`);
  browser = await chromium.launch({ headless: true });
  const rows = [];
  for (const route of contract.canaryRoutes) rows.push(await executeRoute(browser, route));

  const positiveRows = rows.filter((row) => row.expectedDisposition === "PASS_ALL_NINE_GATES");
  const diagnosticRows = rows.filter((row) => row.expectedDisposition === "CAPTURE_EXPECTED_20_QUESTION_CAPACITY_GAP");
  const positivePassCount = positiveRows.filter((row) => (
    row.status === "PASS"
    && Object.values(row.gateStatus ?? {}).every((value) => value === "PASS")
  )).length;
  const diagnosticPassCount = diagnosticRows.filter((row) => (
    row.status === "PASS"
    && row.actualDisposition === "CAPTURED_EXPECTED_20_QUESTION_CAPACITY_GAP"
    && row.gateStatus?.QUESTION_COUNT_PASS === "FAIL_EXPECTED_CAPACITY_GAP"
  )).length;
  const failedRows = rows.filter((row) => row.status !== "PASS");
  const report = {
    schemaName: "PGCR08A02PublicGenerateCanaryReportV1",
    schemaVersion: 1,
    programId: contract.programId,
    taskId: contract.taskId,
    status: positivePassCount === contract.canaryPolicy.positiveRouteCount
      && diagnosticPassCount === contract.canaryPolicy.diagnosticRouteCount
      && failedRows.length === 0
      ? "PASS_HARNESS_QUALIFIED_WITH_EXPECTED_LIMITED_CAPACITY_PRODUCT_GAP"
      : "FAIL_CANARY_HARNESS_NOT_QUALIFIED",
    summary: {
      canaryRouteCount: rows.length,
      positiveRouteCount: positiveRows.length,
      positivePassCount,
      diagnosticRouteCount: diagnosticRows.length,
      diagnosticPassCount,
      failedHarnessRouteCount: failedRows.length,
      realChromiumPdfCount: rows.filter((row) => row.firstGeneration?.pdfPath).length,
      browserConsoleErrorCount: rows.reduce((sum, row) => sum + (row.consoleErrorCount ?? row.consoleErrors?.length ?? 0), 0),
      browserPageErrorCount: rows.reduce((sum, row) => sum + (row.pageErrorCount ?? row.pageErrors?.length ?? 0), 0),
      productRepairQueueCount: diagnosticPassCount,
    },
    productRepairQueue: diagnosticRows.map((row) => ({
      routeId: row.routeId,
      blockerCode: "PUBLIC_UI_20_QUESTION_CAPACITY_GAP",
      verifiedMaxQuestionCount: row.verifiedMaxQuestionCount,
      requestedQuestionCount: row.requestedQuestionCount,
      effectiveQuestionCount: row.effectiveQuestionCount,
      targetMilestone: "PGC-R08-A04_FailedCombinationFullFixAndReplay",
    })),
    rows,
    goalDistance: {
      before: "D1_R08_PUBLIC_GENERATE_BUTTON_CANARY_PENDING_BROWSER_QUALIFICATION",
      after: "D1_R08_PUBLIC_GENERATE_BUTTON_HARNESS_QUALIFIED",
      distanceReduced: "qualified a reusable real-browser harness across every public question type, all selection modes and both capacity statuses",
      remainingBlockers: [
        "ALL_793_LEGAL_ROUTES_NOT_EXECUTED",
        "FAILED_COMBINATION_QUEUE_NOT_RECONCILED",
      ],
      nextShortestStep: "PGC-R08-A03_AllLegalRoutesBrowserAcceptanceExecution",
    },
  };
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (report.status.startsWith("FAIL")) fail("PGC_R08_A02_CANARY_GATE_FAILED", report);
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
