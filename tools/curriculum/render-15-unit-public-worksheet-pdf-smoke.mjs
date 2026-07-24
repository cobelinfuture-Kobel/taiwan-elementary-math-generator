import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONTRACT_PATH = path.join(ROOT, "data/curriculum/public/15-unit-public-worksheet-closeout.json");
const STYLE_PATH = path.join(ROOT, "site/assets/styles/print-styles.css");
const OUT_DIR = path.join(ROOT, "tmp/15-unit-public-worksheet-pdf-smoke");
const SITE_PORT = 4187;
const SITE_URL = `http://127.0.0.1:${SITE_PORT}/index.html`;

const contract = JSON.parse(await readFile(CONTRACT_PATH, "utf8"));
const pblSources = new Set(contract.units.filter((row) => row.pblRequired).map((row) => row.sourceId));

function plan(sourceId, questionMode) {
  return {
    sourceId,
    questionCount: questionMode === "pbl" ? 2 : 4,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `chromium-${sourceId}-${questionMode}`,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    questionMode,
    depthMode: "mixed",
    contextMode: "mixed",
    printLayout: {
      paperSize: "A4",
      columns: questionMode === "pbl" ? 1 : 2,
      rowsPerPage: questionMode === "pbl" ? 1 : 4,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function cases() {
  return contract.units.flatMap((unit) => [
    { ...unit, questionMode: "numeric" },
    { ...unit, questionMode: "application" },
    ...(unit.pblRequired ? [{ ...unit, questionMode: "pbl" }] : []),
  ]);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function questionCount(document) {
  return document?.summary?.questionCount
    ?? document?.report?.summary?.questionCount
    ?? document?.questionCount
    ?? document?.questions?.length
    ?? document?.generatedQuestions?.length
    ?? 0;
}

function answerKeyCount(document) {
  return document?.answerKeyItems?.length
    ?? document?.answerKeyPages?.reduce((sum, page) => sum + (page?.cells ?? []).filter((cell) => cell?.cellType !== "filler").length, 0)
    ?? 0;
}

function assertDocument(document, testCase) {
  if (!document || questionCount(document) <= 0) throw new Error(`WORKSHEET_EMPTY:${testCase.sourceId}:${testCase.questionMode}`);
  if (answerKeyCount(document) <= 0) throw new Error(`ANSWER_KEY_EMPTY:${testCase.sourceId}:${testCase.questionMode}`);
  const corpus = JSON.stringify(document).toLowerCase();
  if (testCase.questionMode === "application" && (!corpus.includes("application") || !corpus.includes("globalcontext"))) {
    throw new Error(`APPLICATION_GLOBAL_CONTEXT_EVIDENCE_MISSING:${testCase.sourceId}`);
  }
  if (testCase.questionMode === "pbl" && (!corpus.includes("pbl") || !corpus.includes("completeprojection"))) {
    throw new Error(`PBL_COMPLETE_PROJECTION_MISSING:${testCase.sourceId}`);
  }
}

async function waitForServer(url, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`SITE_SERVER_TIMEOUT:${url}`);
}

async function renderPdfCases(browser) {
  const rows = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.emulateMedia({ media: "print" });
  for (const testCase of cases()) {
    const result = buildWorksheetDocumentFromPlan(plan(testCase.sourceId, testCase.questionMode));
    if (!result?.ok || !result?.worksheetDocument) {
      throw new Error(`WORKSHEET_BUILD_FAILED:${testCase.sourceId}:${testCase.questionMode}:${JSON.stringify(result?.errors ?? [])}`);
    }
    const document = result.worksheetDocument;
    assertDocument(document, testCase);
    const html = renderWorksheetDocumentToHtml(document, {
      title: `${testCase.unitCode} ${testCase.title} ${testCase.questionMode}`,
      stylesheetHref: pathToFileURL(STYLE_PATH).href,
      debugDataAttributes: true,
    });
    if (!html.includes("<html") || !html.includes("worksheet")) {
      throw new Error(`HTML_RENDER_INVALID:${testCase.sourceId}:${testCase.questionMode}`);
    }
    const stem = `${testCase.sourceId}-${testCase.questionMode}`;
    const htmlPath = path.join(OUT_DIR, `${stem}.html`);
    const pdfPath = path.join(OUT_DIR, `${stem}.pdf`);
    await writeFile(htmlPath, html);
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const overflowFindings = await page.evaluate(() => {
      const elements = [...document.querySelectorAll(".worksheet-page, .print-page")];
      return elements.flatMap((element, index) => {
        const vertical = element.scrollHeight > element.clientHeight + 3;
        const horizontal = element.scrollWidth > element.clientWidth + 3;
        return vertical || horizontal ? [{ index, vertical, horizontal, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }] : [];
      });
    });
    if (overflowFindings.length > 0) {
      throw new Error(`PDF_PAGE_OVERFLOW:${testCase.sourceId}:${testCase.questionMode}:${JSON.stringify(overflowFindings)}`);
    }
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    if (pdf.length < 5000 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new Error(`PDF_INVALID:${testCase.sourceId}:${testCase.questionMode}:${pdf.length}`);
    }
    await writeFile(pdfPath, pdf);
    rows.push({
      sourceId: testCase.sourceId,
      unitCode: testCase.unitCode,
      questionMode: testCase.questionMode,
      questionCount: questionCount(document),
      answerKeyCount: answerKeyCount(document),
      htmlBytes: Buffer.byteLength(html),
      htmlSha256: sha256(html),
      pdfBytes: pdf.length,
      pdfSha256: sha256(pdf),
      overflowFindingCount: 0,
      status: "PASS",
    });
  }
  await page.close();
  return rows;
}

async function liveUiSmoke(browser) {
  const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
    cwd: ROOT,
    env: { ...process.env, SITE_PORT: String(SITE_PORT), SITE_HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await waitForServer(SITE_URL);
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(SITE_URL, { waitUntil: "networkidle" });
    const sourceOptions = await page.locator("#batch-a-source-select option").evaluateAll((options) => options.map((option) => option.value));
    for (const unit of contract.units) {
      if (!sourceOptions.includes(unit.sourceId)) throw new Error(`UI_SOURCE_OPTION_MISSING:${unit.sourceId}`);
      await page.selectOption("#batch-a-source-select", unit.sourceId);
      await page.waitForFunction((sourceId) => document.querySelector("#g5a-u08-public-controls")?.dataset.sourceId === sourceId, unit.sourceId);
      const modeOptions = await page.locator("#g5a-u08-question-mode option").evaluateAll((options) => options.map((option) => option.value));
      if (!modeOptions.includes("numeric") || !modeOptions.includes("application")) throw new Error(`UI_MODE_OPTION_MISSING:${unit.sourceId}`);
      if (modeOptions.includes("pbl") !== unit.pblRequired) throw new Error(`UI_PBL_ELIGIBILITY_MISMATCH:${unit.sourceId}`);

      for (const questionMode of ["application", ...(unit.pblRequired ? ["pbl"] : [])]) {
        await page.selectOption("#g5a-u08-question-mode", questionMode);
        await page.fill("#batch-a-question-count-input", questionMode === "pbl" ? "2" : "4");
        await page.click("#regenerate-button");
        await page.waitForFunction(() => document.querySelector("#status-panel")?.dataset.tone === "success", null, { timeout: 30000 });
        const printDisabled = await page.locator("#print-button").isDisabled();
        if (printDisabled) throw new Error(`UI_PRINT_DISABLED:${unit.sourceId}:${questionMode}`);
        const previewMeta = await page.locator("#preview-meta").textContent();
        if (!previewMeta?.includes("題") || !previewMeta.includes("答案頁")) throw new Error(`UI_PREVIEW_META_INVALID:${unit.sourceId}:${questionMode}:${previewMeta}`);
        const frame = page.frames().find((candidate) => candidate !== page.mainFrame());
        if (!frame) throw new Error(`UI_PREVIEW_FRAME_MISSING:${unit.sourceId}:${questionMode}`);
        const pageCount = await frame.locator(".worksheet-page, .print-page").count();
        if (pageCount <= 0) throw new Error(`UI_PREVIEW_PAGE_MISSING:${unit.sourceId}:${questionMode}`);
      }
    }
    await page.close();
    return {
      sourceOptionCount: sourceOptions.length,
      testedUnitCount: contract.units.length,
      applicationGenerationCount: contract.units.length,
      pblGenerationCount: pblSources.size,
      previewAndPrintEnabledCount: contract.units.length + pblSources.size,
      status: "PASS",
    };
  } finally {
    server.kill("SIGTERM");
  }
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
let report;
try {
  const pdfRows = await renderPdfCases(browser);
  const ui = await liveUiSmoke(browser);
  report = {
    schemaName: "FifteenUnitPublicWorksheetChromiumAcceptanceV1",
    programId: contract.programId,
    status: "PASS",
    expectedCaseCount: 35,
    actualCaseCount: pdfRows.length,
    numericPdfPass: pdfRows.filter((row) => row.questionMode === "numeric").length,
    applicationPdfPass: pdfRows.filter((row) => row.questionMode === "application").length,
    pblPdfPass: pdfRows.filter((row) => row.questionMode === "pbl").length,
    overflowFindingCount: pdfRows.reduce((sum, row) => sum + row.overflowFindingCount, 0),
    ui,
    rows: pdfRows,
  };
  if (report.actualCaseCount !== report.expectedCaseCount
    || report.numericPdfPass !== 15
    || report.applicationPdfPass !== 15
    || report.pblPdfPass !== 5
    || report.overflowFindingCount !== 0
    || report.ui.status !== "PASS") {
    throw new Error(`CHROMIUM_ACCEPTANCE_COUNT_MISMATCH:${JSON.stringify(report)}`);
  }
  await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
