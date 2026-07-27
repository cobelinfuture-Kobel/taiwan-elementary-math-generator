import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { G3A_U08_SOURCE_ID, G3A_U08_PART_WHOLE_KP_ID, G3A_U08_PART_WHOLE_PATTERN_GROUP_ID } from "../../site/modules/curriculum/registry/g3a-u08-part-whole-fraction-selector-projection.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const OUTPUT_DIR = path.join(ROOT, "tmp/p03f-slice001-product-acceptance");
const HTML_PATH = path.join(OUTPUT_DIR, "g3a-u08-part-whole-fraction.html");
const PDF_PATH = path.join(OUTPUT_DIR, "g3a-u08-part-whole-fraction.pdf");
const REPORT_PATH = path.join(OUTPUT_DIR, "report.json");
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const plan = {
  sourceId: G3A_U08_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G3A_U08_PART_WHOLE_KP_ID],
  selectedPatternGroupIds: [G3A_U08_PART_WHOLE_PATTERN_GROUP_ID],
  questionMode: "numeric",
  questionCount: 8,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f-slice001-chromium",
  title: "三年級｜等分整體與分數意義",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
};
const result = buildWorksheetDocumentFromPlan(plan);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`P03F_WORKSHEET_BUILD_FAILED:${JSON.stringify(result.errors ?? [])}`);
}
const document = result.worksheetDocument;
if (document.generatedQuestions.length !== 8 || document.answerKeyItems.length !== 8) {
  throw new Error(`P03F_WORKSHEET_COUNT_INVALID:${document.generatedQuestions.length}:${document.answerKeyItems.length}`);
}
if (!document.generatedQuestions.some((row) => row.representationMode === "CONTINUOUS_EQUAL_PARTITION")
  || !document.generatedQuestions.some((row) => row.representationMode === "DISCRETE_SET_PARTITION")) {
  throw new Error("P03F_REPRESENTATION_COVERAGE_INVALID");
}

const baseHtml = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
const style = `<style>
@page { size: A4; margin: 8mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, "Noto Sans TC", sans-serif; color: #111; }
.worksheet-section__header, .worksheet-page__meta { display: none; }
.worksheet-page { width: 194mm; height: 281mm; padding: 8mm; overflow: hidden; break-after: page; page-break-after: always; }
.worksheet-page__grid { display: grid; grid-template-columns: repeat(var(--worksheet-columns), minmax(0, 1fr)); gap: 6mm; align-content: start; }
.worksheet-cell { border: 1px solid #777; border-radius: 3mm; padding: 4mm; min-height: 48mm; break-inside: avoid; page-break-inside: avoid; }
.worksheet-cell__number { font-weight: 700; margin-bottom: 2mm; }
.worksheet-cell__prompt { font-size: 15pt; line-height: 1.65; letter-spacing: .02em; overflow-wrap: anywhere; }
.worksheet-cell__answer { margin-top: 3mm; font-size: 13pt; line-height: 1.45; overflow-wrap: anywhere; }
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
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
    overflowY: node.scrollHeight > node.clientHeight + 1,
    overflowX: node.scrollWidth > node.clientWidth + 1,
  })));
  const overflowFindings = pageMetrics.filter((row) => row.overflowY || row.overflowX);
  if (pageMetrics.length !== document.questionPages.length + document.answerKeyPages.length) throw new Error(`P03F_PAGE_COUNT_MISMATCH:${pageMetrics.length}`);
  if (overflowFindings.length > 0) throw new Error(`P03F_PAGE_OVERFLOW:${JSON.stringify(overflowFindings)}`);
  if (consoleErrors.length > 0 || pageErrors.length > 0) throw new Error(`P03F_BROWSER_ERRORS:${JSON.stringify({ consoleErrors, pageErrors })}`);
  const bodyText = await page.textContent("body");
  if (!bodyText.includes("等分") && !bodyText.includes("平均分成")) throw new Error("P03F_VISIBLE_CONTENT_MISSING");
  await page.pdf({ path: PDF_PATH, format: "A4", printBackground: true, margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }, preferCSSPageSize: true });
  const pdfSizeBytes = fs.statSync(PDF_PATH).size;
  if (pdfSizeBytes < 10000) throw new Error(`P03F_PDF_TOO_SMALL:${pdfSizeBytes}`);
  const report = {
    schemaName: "P03FSlice001ChromiumProductAcceptanceReportV1",
    taskId: "P03F_W3DirectProductVerticalSlice001Implementation",
    status: "PASS",
    sourceId: G3A_U08_SOURCE_ID,
    knowledgePointId: G3A_U08_PART_WHOLE_KP_ID,
    questionCount: document.generatedQuestions.length,
    answerKeyItemCount: document.answerKeyItems.length,
    questionPageCount: document.questionPages.length,
    answerKeyPageCount: document.answerKeyPages.length,
    renderedPageCount: pageMetrics.length,
    representationModes: [...new Set(document.generatedQuestions.map((row) => row.representationMode))].sort(),
    overflowFindingCount: overflowFindings.length,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    htmlPath: path.relative(ROOT, HTML_PATH).replaceAll("\\", "/"),
    pdfPath: path.relative(ROOT, PDF_PATH).replaceAll("\\", "/"),
    htmlSizeBytes: fs.statSync(HTML_PATH).size,
    pdfSizeBytes,
    patternSpecIds: document.batchA.patternSpecIds,
    pageMetrics,
  };
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`P03F_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}\n`);
} finally {
  await browser.close();
}
