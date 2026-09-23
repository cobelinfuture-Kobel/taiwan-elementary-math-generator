import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { G3B_U07_CURRENT_KP_IDS } from "../../site/modules/curriculum/batch-a/g3b-u07-current-coordinator.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/g3b-u07-current-capacity-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const physicalPages = (file) => (fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const options = {
  sourceId: "g3b_u07_3b07",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: G3B_U07_CURRENT_KP_IDS,
  questionMode: "numeric",
  questionCount: 240,
  ordering: "shuffleAcrossPatterns",
  generationSeed: "g3b-u07-current-targeted-browser",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true },
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) throw new Error(`G3B_U07_TARGETED_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const questions = document.questions;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }).replace("</head>", `<style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g3b-u07-current.html");
const pdfPath = path.join(OUTPUT, "g3b-u07-current.pdf");
fs.writeFileSync(htmlPath, html);

const consoleErrors = [];
const pageErrors = [];
let pageMetrics = [];
let renderedWorksheetPageCount = 0;
let renderedFractionCount = 0;
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil: "networkidle" });
  renderedWorksheetPageCount = await page.locator(".worksheet-page").count();
  renderedFractionCount = await page.locator(".math-fraction").count();
  await page.emulateMedia({ media: "print" });
  pageMetrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node, index) => ({ index, overflowY: node.scrollHeight > node.clientHeight + 1, overflowX: node.scrollWidth > node.clientWidth + 1 })));
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
} finally {
  await browser.close();
}

const representedKnowledgePointIds = [...new Set(questions.map((question) => question.metadata.knowledgePointId))];
const duplicatePromptCount = questions.length - new Set(questions.map((question) => question.blankedDisplayText)).size;
const crossLayerMismatchCount = questions.filter((question, index) =>
  document.questionDisplayModels[index]?.questionId !== question.id
  || document.answerKeyItems[index]?.questionId !== question.id
  || document.answerKeyItems[index]?.answerText !== question.answerText,
).length;
const missingInlineFractionCount = questions.filter((question, index) =>
  (/\d+\/\d+/.test(question.blankedDisplayText) && !document.questionDisplayModels[index]?.promptInlineMath)
  || (/\d+\/\d+/.test(question.answerText) && !document.answerKeyItems[index]?.answerInlineMath),
).length;

const report = {
  schemaName: "G3BU07CurrentCapacityAcceptanceV1",
  questionCount: questions.length,
  answerCount: document.answerKeyItems.length,
  representedKnowledgePointIds,
  duplicatePromptCount,
  crossLayerMismatchCount,
  missingInlineFractionCount,
  renderedFractionCount,
  questionPageCount: document.questionPages.length,
  answerPageCount: document.answerKeyPages.length,
  renderedWorksheetPageCount,
  physicalPdfPageCount: physicalPages(pdfPath),
  overflowFindingCount: pageMetrics.filter((metric) => metric.overflowX || metric.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
};
const pass = report.questionCount === 240
  && report.answerCount === 240
  && G3B_U07_CURRENT_KP_IDS.every((id) => representedKnowledgePointIds.includes(id))
  && report.duplicatePromptCount === 0
  && report.crossLayerMismatchCount === 0
  && report.missingInlineFractionCount === 0
  && report.renderedFractionCount > 0
  && report.questionPageCount === 24
  && report.answerPageCount === 24
  && report.renderedWorksheetPageCount === 48
  && report.physicalPdfPageCount === 48
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0;
fs.writeFileSync(path.join(OUTPUT, "report.json"), `${JSON.stringify({ ...report, status: pass ? "PASS" : "FAIL" }, null, 2)}\n`);
if (!pass) throw new Error(`G3B_U07_TARGETED_ROUTE_REPLAY_FAILED:${JSON.stringify(report)}`);
console.log(`G3B_U07_TARGETED_ROUTE_REPLAY=${JSON.stringify(report)}`);
