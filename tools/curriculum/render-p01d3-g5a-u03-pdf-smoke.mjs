import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  G5A_U03_SOURCE_ID,
  G5A_U03A1_SOURCE_ID,
  getP01D3PatternSpecIdsForSource,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p01d3-extension.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const OUTPUT_DIR = path.join(ROOT, "tmp/p01d3-g5a-u03-pdf-smoke");
const REPORT_PATH = path.join(OUTPUT_DIR, "report.json");
const CASES = Object.freeze([
  { sourceId: G5A_U03_SOURCE_ID, slug: "g5a-u03a-multiples", title: "五年級｜倍數與整除", questionCount: 28 },
  { sourceId: G5A_U03A1_SOURCE_ID, slug: "g5a-u03a1-common-multiples", title: "五年級｜公倍數與最小公倍數", questionCount: 20 },
]);

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const style = `<style>
@page { size: A4; margin: 8mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, "Noto Sans TC", sans-serif; color: #111; }
.worksheet-section__header, .worksheet-page__meta { display: none; }
.worksheet-page { width: 194mm; height: 281mm; padding: 8mm; overflow: hidden; break-after: page; page-break-after: always; }
.worksheet-page__grid { display: grid; grid-template-columns: repeat(var(--worksheet-columns), minmax(0, 1fr)); gap: 4mm; align-content: start; }
.worksheet-cell { border: 1px solid #777; border-radius: 3mm; padding: 3.5mm; min-height: 42mm; break-inside: avoid; page-break-inside: avoid; }
.worksheet-cell__number { font-weight: 700; margin-bottom: 2mm; }
.worksheet-cell__prompt { font-size: 12pt; line-height: 1.45; overflow-wrap: anywhere; }
.worksheet-cell__answer { margin-top: 2mm; font-size: 10.5pt; line-height: 1.35; overflow-wrap: anywhere; }
</style>`;

const browser = await chromium.launch({ headless: true });
const reports = [];
try {
  for (const config of CASES) {
    const result = buildBatchABrowserWorksheetDocument({
      sourceId: config.sourceId,
      selectionMode: "sourceUnit",
      questionCount: config.questionCount,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `p01d3-chromium-${config.sourceId}`,
      title: config.title,
      printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true },
    });
    if (!result.ok || !result.worksheetDocument) throw new Error(`P01D3_WORKSHEET_BUILD_FAILED:${config.sourceId}:${JSON.stringify(result.errors ?? [])}`);
    const document = result.worksheetDocument;
    const expectedPatterns = getP01D3PatternSpecIdsForSource(config.sourceId);
    if (document.generatedQuestions.length !== config.questionCount || document.answerKeyItems.length !== config.questionCount) throw new Error(`P01D3_WORKSHEET_COUNT_INVALID:${config.sourceId}`);
    if (new Set(document.generatedQuestions.map((row) => row.patternSpecId)).size !== expectedPatterns.length) throw new Error(`P01D3_PATTERN_COVERAGE_INVALID:${config.sourceId}`);

    const htmlPath = path.join(OUTPUT_DIR, `${config.slug}.html`);
    const pdfPath = path.join(OUTPUT_DIR, `${config.slug}.pdf`);
    const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }).replace("</head>", `${style}</head>`);
    fs.writeFileSync(htmlPath, html, "utf8");

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
    const overflow = pageMetrics.filter((row) => row.overflowX || row.overflowY);
    if (pageMetrics.length !== document.questionPages.length + document.answerKeyPages.length) throw new Error(`P01D3_PAGE_COUNT_MISMATCH:${config.sourceId}`);
    if (overflow.length > 0) throw new Error(`P01D3_PAGE_OVERFLOW:${config.sourceId}:${JSON.stringify(overflow)}`);
    if (consoleErrors.length > 0 || pageErrors.length > 0) throw new Error(`P01D3_BROWSER_ERRORS:${config.sourceId}`);
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true, margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }, preferCSSPageSize: true });
    const pdfSizeBytes = fs.statSync(pdfPath).size;
    if (pdfSizeBytes < 10000) throw new Error(`P01D3_PDF_TOO_SMALL:${config.sourceId}:${pdfSizeBytes}`);
    await page.close();

    reports.push({
      sourceId: config.sourceId,
      questionCount: document.generatedQuestions.length,
      answerKeyItemCount: document.answerKeyItems.length,
      questionPageCount: document.questionPages.length,
      answerKeyPageCount: document.answerKeyPages.length,
      renderedPageCount: pageMetrics.length,
      overflowFindingCount: overflow.length,
      consoleErrorCount: consoleErrors.length,
      pageErrorCount: pageErrors.length,
      patternSpecCount: expectedPatterns.length,
      htmlPath: path.relative(ROOT, htmlPath).replaceAll("\\", "/"),
      pdfPath: path.relative(ROOT, pdfPath).replaceAll("\\", "/"),
      pdfSizeBytes,
      pageMetrics,
    });
  }
} finally {
  await browser.close();
}

const report = {
  schemaName: "P01D3G5AU03ChromiumPdfSmokeReportV1",
  taskId: "P01D3_G5AU03FactorMultipleVerticalSlice",
  status: "PASS",
  sourceCount: reports.length,
  totalQuestionCount: reports.reduce((sum, row) => sum + row.questionCount, 0),
  totalAnswerKeyItemCount: reports.reduce((sum, row) => sum + row.answerKeyItemCount, 0),
  totalRenderedPageCount: reports.reduce((sum, row) => sum + row.renderedPageCount, 0),
  totalOverflowFindingCount: reports.reduce((sum, row) => sum + row.overflowFindingCount, 0),
  totalConsoleErrorCount: reports.reduce((sum, row) => sum + row.consoleErrorCount, 0),
  totalPageErrorCount: reports.reduce((sum, row) => sum + row.pageErrorCount, 0),
  cases: reports,
};
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`P01D3_CHROMIUM_PDF_READBACK=${JSON.stringify(report)}\n`);
