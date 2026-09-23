import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59j-r1-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS,
  G4B_U08_P03F27_KP_IDS,
  G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS,
  G4B_U08_P03F27_PATTERN_GROUPS,
  G4B_U08_P03F27_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g4b-u08-rank8-fraction-selector-projection-p03f27.js";
import { P03F27_FRACTION_CAPABILITY_IDS } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f27-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice027-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8")
  .replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g, (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
};
const fractionText = (numerator, denominator) => denominator === 1 ? String(numerator) : `${numerator}/${denominator}`;
const expectedComparison = (question) => {
  const left = question.leftNumerator * question.rightDenominator;
  const right = question.rightNumerator * question.leftDenominator;
  return left < right ? "<" : left > right ? ">" : "=";
};

const result = buildBatchABrowserWorksheetDocument({
  sourceId: G4B_U08_P03F27_SOURCE_ID,
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...G4B_U08_P03F27_KP_IDS],
  selectedPatternGroupIds: G4B_U08_P03F27_PATTERN_GROUPS.map((group) => group.patternGroupId),
  patternSpecIds: [...G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS],
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f27-acceptance",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F27_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" })
  .replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g4b-u08-rank8-fraction-numeric.html");
const pdfPath = path.join(OUTPUT, "g4b-u08-rank8-fraction-numeric.pdf");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({
  headless: true,
  ...(process.env.P03F27_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.P03F27_CHROMIUM_EXECUTABLE_PATH } : {}),
});
const consoleErrors = [];
const pageErrors = [];
let pageMetrics = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil: "networkidle" });
  const pages = page.locator(".worksheet-page");
  for (let index = 0; index < await pages.count(); index += 1) {
    await pages.nth(index).screenshot({ path: path.join(OUTPUT, `rank8-fraction-page-${String(index + 1).padStart(2, "0")}.png`) });
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

const generationQuestions = result.generation.questions;
const questions = document.generatedQuestions;
const answerKeyItems = document.answerKeyItems;
const answerKeyByQuestionId = new Map(answerKeyItems.map((item) => [item.questionId, item]));
const patternSpecWitnessCounts = Object.fromEntries(G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS.map((patternSpecId) => [
  patternSpecId,
  questions.filter((question) => question.patternSpecId === patternSpecId).length,
]));
const comparisonRows = questions.filter((question) => question.operation === "fraction_compare");
const arithmeticRows = questions.filter((question) => question.operation === "fraction_add_sub");
const comparisonAnswerRows = comparisonRows.map((question) => answerKeyByQuestionId.get(question.id)).filter(Boolean);
const crossLayerMismatchCount = questions.filter((question, index) => {
  const generated = generationQuestions[index];
  const answer = answerKeyItems[index];
  if (!generated || !answer) return true;
  return generated.id !== question.id
    || generated.patternSpecId !== question.patternSpecId
    || generated.metadata?.knowledgePointId !== question.metadata?.knowledgePointId
    || generated.metadata?.patternGroupId !== question.metadata?.patternGroupId
    || generated.blankedDisplayText !== question.blankedDisplayText
    || generated.answerText !== question.answerText
    || answer.questionId !== question.id
    || answer.patternId !== question.patternSpecId
    || answer.knowledgePointId !== question.metadata?.knowledgePointId
    || answer.patternGroupId !== question.metadata?.patternGroupId
    || answer.promptText !== question.blankedDisplayText
    || answer.answerText !== question.answerText;
}).length + Math.abs(generationQuestions.length - questions.length) + Math.abs(answerKeyItems.length - questions.length);
const hiddenApplicationLeakCount = G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS.filter((patternSpecId) => JSON.stringify({ questions, answerKeyItems, document }).includes(patternSpecId)).length;
const semanticScopeFindingCount = questions.filter((question) => {
  const capabilities = question.metadata?.requiredCapabilityIds ?? [];
  if (question.sourceId !== G4B_U08_P03F27_SOURCE_ID
    || question.questionMode !== "numeric"
    || !G4B_U08_P03F27_KP_IDS.includes(question.metadata?.knowledgePointId)
    || !G4B_U08_P03F27_PATTERN_GROUPS.some((group) => group.patternGroupId === question.metadata?.patternGroupId)
    || question.metadata?.productAdmissionTask !== "P03F_W3DirectProductVerticalSlice027Implementation"
    || question.globalContextProduction !== null
    || question.metadata?.globalContextAuthorityPath !== null
    || !P03F27_FRACTION_CAPABILITY_IDS.every((capabilityId) => capabilities.includes(capabilityId))
    || question.leftDenominator <= 0
    || question.rightDenominator <= 0
    || question.leftDenominator === question.rightDenominator) return true;

  if (question.operation === "fraction_compare") {
    const expected = expectedComparison(question);
    return question.comparison !== expected || question.answerText !== expected || question.finalAnswer !== expected;
  }
  if (question.operation !== "fraction_add_sub" || !["add", "sub"].includes(question.arithmeticOperation)) return true;
  const commonDenominator = question.leftDenominator * question.rightDenominator;
  const rawNumerator = question.arithmeticOperation === "add"
    ? question.leftNumerator * question.rightDenominator + question.rightNumerator * question.leftDenominator
    : question.leftNumerator * question.rightDenominator - question.rightNumerator * question.leftDenominator;
  if (question.arithmeticOperation === "sub" && rawNumerator < 0) return true;
  if (question.resultDenominator <= 0 || gcd(question.resultNumerator, question.resultDenominator) !== 1) return true;
  if (question.resultNumerator * commonDenominator !== rawNumerator * question.resultDenominator) return true;
  const expected = fractionText(question.resultNumerator, question.resultDenominator);
  return question.answerText !== expected || question.finalAnswer !== expected;
}).length;

const report = {
  schemaName: "P03FSlice027ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice027ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G4B_U08_P03F27_SOURCE_ID,
  caseCount: 1,
  totalQuestionCount: questions.length,
  totalAnswerKeyItemCount: answerKeyItems.length,
  totalPhysicalPdfPageCount: physicalPages(pdfPath),
  screenshotCount: pageMetrics.length,
  screenshotMedia: "screen",
  pdfMedia: "print",
  observedKnowledgePointIds: [...new Set(questions.map((question) => question.metadata?.knowledgePointId))].sort(),
  expectedKnowledgePointIds: [...G4B_U08_P03F27_KP_IDS].sort(),
  observedPatternSpecIds: [...new Set(questions.map((question) => question.patternSpecId))].sort(),
  expectedPatternSpecIds: [...G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS].sort(),
  patternSpecWitnessCounts,
  comparisonEqualityWitnessCount: comparisonAnswerRows.filter((item) => item.answerText === "=").length,
  comparisonNonEqualityWitnessCount: comparisonAnswerRows.filter((item) => item.answerText !== "=").length,
  additionWitnessCount: arithmeticRows.filter((question) => question.arithmeticOperation === "add").length,
  subtractionWitnessCount: arithmeticRows.filter((question) => question.arithmeticOperation === "sub").length,
  crossLayerMismatchCount,
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  pdfByteLength: fs.statSync(pdfPath).size,
  duplicatePromptFindingCount: questions.length - new Set(document.questionDisplayModels.map((model) => model.promptText)).size,
  overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
  semanticScopeFindingCount,
  hiddenApplicationLeakCount,
  hiddenApplicationLineagePreserved: document.metadata?.hiddenApplicationLineagePreserved === true,
  sharedPagination: document.metadata?.worksheetAdapter?.sharedPagination === true,
  sharedRenderer: document.metadata?.worksheetAdapter?.sharedRenderer === true,
  parallelPipeline: document.metadata?.worksheetAdapter?.parallelPipeline === true,
  pageMetrics,
  visualReview: {
    status: "PENDING",
    allPagesReviewed: false,
    clippedTextFindingCount: null,
    overlapFindingCount: null,
    brokenGlyphFindingCount: null,
  },
};
const automatedPass = report.totalQuestionCount === 24
  && report.totalAnswerKeyItemCount === 24
  && report.totalPhysicalPdfPageCount === document.questionPages.length + document.answerKeyPages.length
  && report.screenshotCount === report.totalPhysicalPdfPageCount
  && Object.values(patternSpecWitnessCounts).every((count) => count === 12)
  && JSON.stringify(report.observedKnowledgePointIds) === JSON.stringify(report.expectedKnowledgePointIds)
  && JSON.stringify(report.observedPatternSpecIds) === JSON.stringify(report.expectedPatternSpecIds)
  && report.comparisonEqualityWitnessCount > 0
  && report.comparisonNonEqualityWitnessCount > 0
  && report.additionWitnessCount > 0
  && report.subtractionWitnessCount > 0
  && report.crossLayerMismatchCount === 0
  && report.duplicatePromptFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.semanticScopeFindingCount === 0
  && report.hiddenApplicationLeakCount === 0
  && report.hiddenApplicationLineagePreserved
  && report.sharedPagination
  && report.sharedRenderer
  && report.parallelPipeline === false;
if (!automatedPass) throw new Error(`P03F27_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT, "p03f-slice027-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F27_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
