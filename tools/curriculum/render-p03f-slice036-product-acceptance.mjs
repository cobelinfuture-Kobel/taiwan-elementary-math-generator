import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  G5A_U01_P03F36_ADD_SUB_SPEC_ID,
  G5A_U01_P03F36_KP_IDS,
  G5A_U01_P03F36_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U01_P03F36_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5a-u01-rank9-decimal-selector-projection-p03f36.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice036-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8").replace(
  /url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,
  (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`,
);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const result = buildBatchABrowserWorksheetDocument({
  sourceId: G5A_U01_P03F36_SOURCE_ID,
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: G5A_U01_P03F36_KP_IDS,
  patternSpecIds: G5A_U01_P03F36_NUMERIC_PATTERN_SPEC_IDS,
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f36-acceptance",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F36_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" })
  .replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g5a-u01-rank9-decimal.html");
const pdfPath = path.join(OUTPUT, "g5a-u01-rank9-decimal.pdf");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({ headless: true });
const consoleErrors = [], pageErrors = [];
let pageMetrics = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil: "networkidle" });
  const pages = page.locator(".worksheet-page");
  for (let index = 0; index < await pages.count(); index += 1) {
    await pages.nth(index).screenshot({ path: path.join(OUTPUT, `rank9-decimal-page-${String(index + 1).padStart(2, "0")}.png`) });
  }
  await page.emulateMedia({ media: "print" });
  pageMetrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node, index) => ({
    index,
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
    overflowY: node.scrollHeight > node.clientHeight + 1,
    overflowX: node.scrollWidth > node.clientWidth + 1,
  })));
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  await page.close();
} finally {
  await browser.close();
}

const questions = document.generatedQuestions;
const answers = document.answerKeyItems;
const allocation = Object.fromEntries(G5A_U01_P03F36_NUMERIC_PATTERN_SPEC_IDS.map((id) => [id, questions.filter((q) => q.patternSpecId === id).length]));
const knowledgePointWitnessCounts = Object.fromEntries(G5A_U01_P03F36_KP_IDS.map((id) => [id, questions.filter((q) => q.metadata?.knowledgePointId === id).length]));
const addSubQuestions = questions.filter((q) => q.patternSpecId === G5A_U01_P03F36_ADD_SUB_SPEC_ID);
const operationWitnessCounts = {
  add: addSubQuestions.filter((q) => q.operation === "add").length,
  sub: addSubQuestions.filter((q) => q.operation === "sub").length,
};
const crossLayerMismatchCount = questions.filter((question, index) => !answers[index]
  || answers[index].questionId !== question.id
  || answers[index].answerText !== question.answerText
  || answers[index].knowledgePointId !== question.metadata?.knowledgePointId
  || document.questionDisplayModels[index]?.promptText !== question.blankedDisplayText).length;
const semanticScopeFindingCount = questions.filter((q) => q.sourceId !== G5A_U01_P03F36_SOURCE_ID
  || !G5A_U01_P03F36_KP_IDS.includes(q.metadata?.knowledgePointId)
  || !G5A_U01_P03F36_NUMERIC_PATTERN_SPEC_IDS.includes(q.patternSpecId)
  || q.metadata?.productAdmissionTask !== "P03F_W3DirectProductVerticalSlice036Implementation"
  || !q.metadata?.requiredCapabilityIds?.includes("cap_decimal_domain_validator")
  || !q.metadata?.requiredCapabilityIds?.includes("cap_decimal_number_system")).length;
const applicationLeakFindingCount = questions.filter((q) => q.questionMode !== "numeric"
  || q.mode !== "NUMERIC"
  || q.globalContextProduction != null
  || q.metadata?.globalContextAuthorityPath != null).length;

const report = {
  schemaName: "P03FSlice036ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice036ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G5A_U01_P03F36_SOURCE_ID,
  totalQuestionCount: questions.length,
  totalAnswerKeyItemCount: answers.length,
  totalPhysicalPdfPageCount: physicalPages(pdfPath),
  screenshotCount: pageMetrics.length,
  observedKnowledgePointIds: [...new Set(questions.map((q) => q.metadata?.knowledgePointId))],
  observedPatternSpecIds: [...new Set(questions.map((q) => q.patternSpecId))],
  allocation,
  knowledgePointWitnessCounts,
  operationWitnessCounts,
  crossLayerMismatchCount,
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  pdfByteLength: fs.statSync(pdfPath).size,
  duplicatePromptFindingCount: questions.length - new Set(document.questionDisplayModels.map((model) => model.promptText)).size,
  overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
  semanticScopeFindingCount,
  applicationLeakFindingCount,
  hiddenApplicationLineagePreserved: document.metadata?.hiddenApplicationLineagePreserved === true,
  sharedPagination: document.metadata?.worksheetAdapter?.sharedPagination === true,
  sharedRenderer: document.metadata?.worksheetAdapter?.sharedRenderer === true,
  parallelPipeline: document.metadata?.worksheetAdapter?.parallelPipeline === true,
  pageMetrics,
  visualReview: { status: "PENDING", allPagesReviewed: false },
};
const pass = report.totalQuestionCount === 24
  && report.totalAnswerKeyItemCount === 24
  && report.totalPhysicalPdfPageCount === 6
  && report.screenshotCount === 6
  && report.observedKnowledgePointIds.length === 3
  && G5A_U01_P03F36_KP_IDS.every((id) => report.observedKnowledgePointIds.includes(id))
  && report.observedPatternSpecIds.length === 4
  && G5A_U01_P03F36_NUMERIC_PATTERN_SPEC_IDS.every((id) => report.observedPatternSpecIds.includes(id))
  && Object.values(report.allocation).every((count) => count === 6)
  && Object.values(report.knowledgePointWitnessCounts).every((count) => count > 0)
  && report.operationWitnessCounts.add > 0
  && report.operationWitnessCounts.sub > 0
  && report.crossLayerMismatchCount === 0
  && report.duplicatePromptFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.semanticScopeFindingCount === 0
  && report.applicationLeakFindingCount === 0
  && report.hiddenApplicationLineagePreserved
  && report.sharedPagination
  && report.sharedRenderer
  && report.parallelPipeline === false;
if (!pass) throw new Error(`P03F36_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT, "p03f-slice036-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F36_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
