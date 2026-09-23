import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/full-product/p01e/w1-public-ui-html-pdf-print-closeout.json",
);
const STYLE_PATH = path.join(ROOT, "site/assets/styles/print-styles.css");
const OUT_DIR = path.join(ROOT, "tmp/p01e-w1-public-closeout");
const SITE_PORT = 4191;
const CLASSIC_URL = `http://127.0.0.1:${SITE_PORT}/index.html`;
const PIXEL_URL = `http://127.0.0.1:${SITE_PORT}/pixel/index.html`;
const contract = JSON.parse(await readFile(CONTRACT_PATH, "utf8"));
const sourceIds = contract.publicFleet.newPublicSourceIds;
const sourceById = new Map([
  ["g5b_u05_5b05a", { grade: 5, semester: "lower", unitCode: "5B-U05", title: "億以上的數" }],
  ["g6a_u01_6a01", { grade: 6, semester: "upper", unitCode: "6A-U01", title: "最大公因數與最小公倍數" }],
  ["g5a_u03_5a03a", { grade: 5, semester: "upper", unitCode: "5A-U03A", title: "倍數" }],
  ["g5a_u03_5a03a1", { grade: 5, semester: "upper", unitCode: "5A-U03A1", title: "公倍數" }],
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function plan(sourceId, questionMode, questionCount = 4) {
  return {
    sourceId,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    questionMode,
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p01e-chromium-${sourceId}-${questionMode}`,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
  };
}

function documentQuestionCount(document) {
  return document?.summary?.questionCount
    ?? document?.questionCount
    ?? document?.generatedQuestions?.length
    ?? document?.questions?.length
    ?? 0;
}

function documentAnswerCount(document) {
  return document?.answerKeyItems?.length ?? 0;
}

function assertDocument(document, sourceId, questionMode) {
  const questionCount = documentQuestionCount(document);
  const answerCount = documentAnswerCount(document);
  if (questionCount !== 4 || answerCount !== 4) {
    throw new Error(`P01E_DOCUMENT_COUNT_INVALID:${sourceId}:${questionMode}:${questionCount}:${answerCount}`);
  }
  if ((document?.questionPages?.length ?? 0) < 1 || (document?.answerKeyPages?.length ?? 0) < 1) {
    throw new Error(`P01E_DOCUMENT_PAGE_MISSING:${sourceId}:${questionMode}`);
  }
  if (document?.batchA?.sourceId !== sourceId) {
    throw new Error(`P01E_DOCUMENT_SOURCE_MISMATCH:${sourceId}:${document?.batchA?.sourceId}`);
  }
  const questions = document.generatedQuestions ?? document.questions ?? [];
  if (questionMode === "application") {
    if (!questions.every((question) => (
      question.applicationText === true
      && question.questionMode === "application"
      && question.globalContextProduction?.runtimeResolvable === true
      && question.p01eApplicationAdmission?.productionSelectable === true
      && !/(?:算式|_{2,}|答\s*[:：])/.test(question.promptText ?? "")
    ))) {
      throw new Error(`P01E_APPLICATION_LINEAGE_INVALID:${sourceId}`);
    }
  } else if (questions.some((question) => question.applicationText === true)) {
    throw new Error(`P01E_NUMERIC_APPLICATION_LEAK:${sourceId}`);
  }
}

async function waitForServer(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry until the bounded timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`P01E_SITE_SERVER_TIMEOUT:${url}`);
}

async function pageOverflowFindings(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll(".worksheet-page, .print-page")];
    return nodes.flatMap((node, index) => {
      const vertical = node.scrollHeight > node.clientHeight + 3;
      const horizontal = node.scrollWidth > node.clientWidth + 3;
      return vertical || horizontal
        ? [{
          index,
          vertical,
          horizontal,
          scrollHeight: node.scrollHeight,
          clientHeight: node.clientHeight,
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
        }]
        : [];
    });
  });
}

async function renderPdfCases(browser) {
  const rows = [];
  const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const sourceId of sourceIds) {
    for (const questionMode of ["numeric", "application"]) {
      const result = buildWorksheetDocumentFromPlan(plan(sourceId, questionMode));
      if (!result?.ok || !result.worksheetDocument) {
        throw new Error(`P01E_WORKSHEET_BUILD_FAILED:${sourceId}:${questionMode}:${JSON.stringify(result?.errors ?? [])}`);
      }
      const document = result.worksheetDocument;
      assertDocument(document, sourceId, questionMode);
      const source = sourceById.get(sourceId);
      const html = renderWorksheetDocumentToHtml(document, {
        title: `${source.unitCode} ${source.title} ${questionMode}`,
        stylesheetHref: pathToFileURL(STYLE_PATH).href,
        debugDataAttributes: true,
      });
      const stem = `${sourceId}-${questionMode}`;
      const htmlPath = path.join(OUT_DIR, `${stem}.html`);
      const pdfPath = path.join(OUT_DIR, `${stem}.pdf`);
      await writeFile(htmlPath, html);
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "print" });
      const overflowFindings = await pageOverflowFindings(page);
      if (overflowFindings.length > 0) {
        throw new Error(`P01E_PDF_OVERFLOW:${sourceId}:${questionMode}:${JSON.stringify(overflowFindings)}`);
      }
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      });
      if (pdf.length < 5000 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
        throw new Error(`P01E_PDF_INVALID:${sourceId}:${questionMode}:${pdf.length}`);
      }
      await writeFile(pdfPath, pdf);
      rows.push({
        sourceId,
        unitCode: source.unitCode,
        questionMode,
        questionCount: documentQuestionCount(document),
        answerKeyItemCount: documentAnswerCount(document),
        questionPageCount: document.questionPages.length,
        answerKeyPageCount: document.answerKeyPages.length,
        renderedPageCount: document.questionPages.length + document.answerKeyPages.length,
        htmlPath: path.relative(ROOT, htmlPath).replaceAll("\\", "/"),
        pdfPath: path.relative(ROOT, pdfPath).replaceAll("\\", "/"),
        htmlBytes: Buffer.byteLength(html),
        htmlSha256: sha256(html),
        pdfBytes: pdf.length,
        pdfSha256: sha256(pdf),
        overflowFindingCount: overflowFindings.length,
        status: "PASS",
      });
    }
  }
  await page.close();
  return {
    rows,
    consoleErrors,
    pageErrors,
  };
}

async function assertPreviewFrame(page, sourceId, questionMode, frameSelector) {
  const frame = page.frameLocator(frameSelector);
  const pageCount = await frame.locator(".worksheet-page, .print-page").count();
  if (pageCount < 1) {
    throw new Error(`P01E_UI_PREVIEW_PAGE_MISSING:${sourceId}:${questionMode}`);
  }
  return pageCount;
}

async function classicLiveUiSmoke(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(CLASSIC_URL, { waitUntil: "networkidle" });
  const sourceOptions = await page.locator("#batch-a-source-select option")
    .evaluateAll((options) => options.map((option) => option.value));
  if (sourceOptions.length !== 19) {
    throw new Error(`P01E_CLASSIC_SOURCE_COUNT_INVALID:${sourceOptions.length}`);
  }
  let generationCount = 0;
  let previewPageCount = 0;
  for (const sourceId of sourceIds) {
    if (!sourceOptions.includes(sourceId)) {
      throw new Error(`P01E_CLASSIC_SOURCE_MISSING:${sourceId}`);
    }
    await page.selectOption("#batch-a-source-select", sourceId);
    await page.waitForFunction(
      (expected) => document.querySelector("#g5a-u08-public-controls")?.dataset.sourceId === expected,
      sourceId,
    );
    const modeOptions = await page.locator("#g5a-u08-question-mode option")
      .evaluateAll((options) => options.map((option) => option.value));
    if (JSON.stringify(modeOptions) !== JSON.stringify(["numeric", "application"])) {
      throw new Error(`P01E_CLASSIC_MODE_OPTIONS_INVALID:${sourceId}:${JSON.stringify(modeOptions)}`);
    }
    for (const questionMode of ["numeric", "application"]) {
      await page.selectOption("#g5a-u08-question-mode", questionMode);
      await page.fill("#batch-a-question-count-input", "4");
      await page.click("#regenerate-button");
      await page.waitForFunction(
        () => document.querySelector("#status-panel")?.dataset.tone === "success",
        null,
        { timeout: 30000 },
      );
      if (await page.locator("#print-button").isDisabled()) {
        throw new Error(`P01E_CLASSIC_PRINT_DISABLED:${sourceId}:${questionMode}`);
      }
      previewPageCount += await assertPreviewFrame(
        page,
        sourceId,
        questionMode,
        "#preview-frame",
      );
      generationCount += 1;
    }
  }
  await page.close();
  return {
    sourceOptionCount: sourceOptions.length,
    generationCount,
    previewPageCount,
    printEnabledCount: generationCount,
    consoleErrors,
    pageErrors,
    status: consoleErrors.length === 0 && pageErrors.length === 0 ? "PASS" : "FAIL",
  };
}

async function pixelLiveUiSmoke(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(PIXEL_URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.body.dataset.pixelRegistrySourceCount === "19");
  let generationCount = 0;
  let previewPageCount = 0;
  for (const sourceId of sourceIds) {
    const source = sourceById.get(sourceId);
    await page.selectOption("#pixel-grade-select", String(source.grade));
    await page.waitForFunction(
      (semester) => [...document.querySelectorAll("#pixel-semester-select option")]
        .some((option) => option.value === semester),
      source.semester,
    );
    await page.selectOption("#pixel-semester-select", source.semester);
    await page.waitForFunction(
      (expected) => [...document.querySelectorAll("#pixel-source-select option")]
        .some((option) => option.value === expected),
      sourceId,
    );
    await page.selectOption("#pixel-source-select", sourceId);
    await page.waitForFunction(
      (expected) => document.body.dataset.pixelPublicControlSourceId === expected,
      sourceId,
    );
    const modeOptions = await page.locator("#pixel-g5a-question-mode option")
      .evaluateAll((options) => options.map((option) => option.value));
    if (JSON.stringify(modeOptions) !== JSON.stringify(["numeric", "application"])) {
      throw new Error(`P01E_PIXEL_MODE_OPTIONS_INVALID:${sourceId}:${JSON.stringify(modeOptions)}`);
    }
    for (const questionMode of ["numeric", "application"]) {
      await page.selectOption("#pixel-g5a-question-mode", questionMode);
      await page.fill("#pixel-question-count", "4");
      await page.click("#pixel-generate-button");
      await page.waitForFunction(
        () => document.body.dataset.pixelGenerationStatus === "success",
        null,
        { timeout: 30000 },
      );
      if (await page.locator("#pixel-print-button").isDisabled()) {
        throw new Error(`P01E_PIXEL_PRINT_DISABLED:${sourceId}:${questionMode}`);
      }
      previewPageCount += await assertPreviewFrame(
        page,
        sourceId,
        questionMode,
        "#pixel-preview-frame",
      );
      generationCount += 1;
    }
  }
  await page.close();
  return {
    sourceOptionCount: 19,
    generationCount,
    previewPageCount,
    printEnabledCount: generationCount,
    consoleErrors,
    pageErrors,
    status: consoleErrors.length === 0 && pageErrors.length === 0 ? "PASS" : "FAIL",
  };
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
  cwd: ROOT,
  env: {
    ...process.env,
    SITE_PORT: String(SITE_PORT),
    SITE_HOST: "127.0.0.1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

const browser = await chromium.launch({ headless: true });
try {
  await waitForServer(CLASSIC_URL);
  const pdf = await renderPdfCases(browser);
  const classic = await classicLiveUiSmoke(browser);
  const pixel = await pixelLiveUiSmoke(browser);
  const report = {
    schemaName: "P01EW1PublicUIHtmlPdfPrintChromiumAcceptanceV1",
    programId: contract.programId,
    taskId: contract.taskId,
    status: "PASS",
    publicSourceCount: 19,
    w1SourceCount: 4,
    w1KnowledgePointCount: 21,
    applicationEligibleKnowledgePointCount: 13,
    applicationIneligibleKnowledgePointCount: 8,
    expectedPdfCaseCount: 8,
    actualPdfCaseCount: pdf.rows.length,
    numericPdfPass: pdf.rows.filter((row) => row.questionMode === "numeric").length,
    applicationPdfPass: pdf.rows.filter((row) => row.questionMode === "application").length,
    pblAdmissionCount: 0,
    totalRenderedPageCount: pdf.rows.reduce((sum, row) => sum + row.renderedPageCount, 0),
    overflowFindingCount: pdf.rows.reduce((sum, row) => sum + row.overflowFindingCount, 0),
    consoleErrorCount: pdf.consoleErrors.length
      + classic.consoleErrors.length
      + pixel.consoleErrors.length,
    pageErrorCount: pdf.pageErrors.length
      + classic.pageErrors.length
      + pixel.pageErrors.length,
    classic,
    pixel,
    rows: pdf.rows,
  };
  if (report.actualPdfCaseCount !== 8
    || report.numericPdfPass !== 4
    || report.applicationPdfPass !== 4
    || report.overflowFindingCount !== 0
    || report.consoleErrorCount !== 0
    || report.pageErrorCount !== 0
    || classic.status !== "PASS"
    || classic.generationCount !== 8
    || pixel.status !== "PASS"
    || pixel.generationCount !== 8) {
    throw new Error(`P01E_CHROMIUM_ACCEPTANCE_INVALID:${JSON.stringify(report)}`);
  }
  await writeFile(
    path.join(OUT_DIR, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  process.stdout.write(`P01E_CHROMIUM_READBACK=${JSON.stringify(report)}\n`);
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
