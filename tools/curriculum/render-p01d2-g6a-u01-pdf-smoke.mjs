import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { G6A_U01_SOURCE_ID } from "../../site/modules/curriculum/registry/g6a-u01-selector-projection.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const OUTPUT_DIR = path.join(ROOT, "tmp/p01d2-g6a-u01-pdf-smoke");
const HTML_PATH = path.join(OUTPUT_DIR, "g6a-u01-number-theory.html");
const PDF_PATH = path.join(OUTPUT_DIR, "g6a-u01-number-theory.pdf");
const REPORT_PATH = path.join(OUTPUT_DIR, "report.json");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const worksheetResult = buildBatchABrowserWorksheetDocument({
  sourceId: G6A_U01_SOURCE_ID,
  selectionMode: "sourceUnit",
  questionCount: 20,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p01d2-chromium-pdf",
  title: "六年級｜質因數、最大公因數與最小公倍數",
  printLayout: {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
  },
});

if (!worksheetResult.ok || !worksheetResult.worksheetDocument) {
  throw new Error(`P01D2_WORKSHEET_BUILD_FAILED:${JSON.stringify(worksheetResult.errors ?? [])}`);
}

const document = worksheetResult.worksheetDocument;
if (document.generatedQuestions.length !== 20 || document.answerKeyItems.length !== 20) {
  throw new Error(`P01D2_WORKSHEET_COUNT_INVALID:${document.generatedQuestions.length}:${document.answerKeyItems.length}`);
}

const baseHtml = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
const style = `<style>
@page { size: A4; margin: 8mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, "Noto Sans TC", sans-serif; color: #111; }
.worksheet-section__header, .worksheet-page__meta { display: none; }
.worksheet-page { width: 194mm; height: 281mm; padding: 8mm; overflow: hidden; break-after: page; page-break-after: always; }
.worksheet-page__grid { display: grid; grid-template-columns: repeat(var(--worksheet-columns), minmax(0, 1fr)); gap: 5mm; align-content: start; }
.worksheet-cell { border: 1px solid #777; border-radius: 3mm; padding: 4mm; min-height: 48mm; break-inside: avoid; page-break-inside: avoid; }
.worksheet-cell__number { font-weight: 700; margin-bottom: 2mm; }
.worksheet-cell__prompt { font-size: 13pt; line-height: 1.5; overflow-wrap: anywhere; }
.worksheet-cell__answer { margin-top: 3mm; font-size: 11.5pt; line-height: 1.4; overflow-wrap: anywhere; }
</style>`;
const html = baseHtml.replace("</head>", `${style}</head>`);
fs.writeFileSync(HTML_PATH, html, "utf8");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setContent(html, { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });

  const pageMetrics = await page.$$eval(".worksheet-page", (pages) => pages.map((node, index) => ({
    index,
    className: node.className,
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
    overflowY: node.scrollHeight > node.clientHeight + 1,
    overflowX: node.scrollWidth > node.clientWidth + 1,
  })));
  const overflowFindings = pageMetrics.filter((row) => row.overflowY || row.overflowX);
  if (pageMetrics.length !== document.questionPages.length + document.answerKeyPages.length) {
    throw new Error(`P01D2_PAGE_COUNT_MISMATCH:${pageMetrics.length}:${document.questionPages.length + document.answerKeyPages.length}`);
  }
  if (overflowFindings.length > 0) throw new Error(`P01D2_PAGE_OVERFLOW:${JSON.stringify(overflowFindings)}`);
  if (consoleErrors.length > 0 || pageErrors.length > 0) throw new Error(`P01D2_BROWSER_ERRORS:${JSON.stringify({ consoleErrors, pageErrors })}`);

  await page.pdf({ path: PDF_PATH, format: "A4", printBackground: true, margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }, preferCSSPageSize: true });
  const pdfSizeBytes = fs.statSync(PDF_PATH).size;
  if (pdfSizeBytes < 10000) throw new Error(`P01D2_PDF_TOO_SMALL:${pdfSizeBytes}`);

  const report = {
    schemaName: "P01D2G6AU01ChromiumPdfSmokeReportV1",
    taskId: "P01D2_G6AU01NumberTheoryVerticalSlice",
    status: "PASS",
    sourceId: G6A_U01_SOURCE_ID,
    questionCount: document.generatedQuestions.length,
    answerKeyItemCount: document.answerKeyItems.length,
    questionPageCount: document.questionPages.length,
    answerKeyPageCount: document.answerKeyPages.length,
    renderedPageCount: pageMetrics.length,
    overflowFindingCount: overflowFindings.length,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    htmlPath: path.relative(ROOT, HTML_PATH).replaceAll("\\", "/"),
    pdfPath: path.relative(ROOT, PDF_PATH).replaceAll("\\", "/"),
    pdfSizeBytes,
    patternSpecIds: document.batchA.patternSpecIds,
    pageMetrics,
  };
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`P01D2_CHROMIUM_PDF_READBACK=${JSON.stringify(report)}\n`);
} finally {
  await browser.close();
}
