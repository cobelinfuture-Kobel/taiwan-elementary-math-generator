import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { materializeP03FSlice002ProductAdmission } from "../../src/curriculum/full-product/p03f-slice002-product-admission.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice002-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const evidence = materializeP03FSlice002ProductAdmission();
if (!evidence.predecessorPassed) throw new Error("P03F2_PREDECESSOR_NOT_D0");
for (const mode of ["numeric", "application"]) {
  if (!evidence.worksheets[mode].ok || !evidence.documents[mode] || !evidence.html[mode]) throw new Error(`P03F2_${mode.toUpperCase()}_HTML_INPUT_INVALID`);
  fs.writeFileSync(path.join(OUTPUT, `g3a-u08-fraction-quantity-${mode}.html`), evidence.html[mode]);
}

function physicalPdfPageCount(pdfPath) {
  const binary = fs.readFileSync(pdfPath).toString("latin1");
  return (binary.match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
}

const browser = await chromium.launch({ headless: true });
const browserFindings = {};
try {
  for (const mode of ["numeric", "application"]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.setContent(evidence.html[mode], { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pageMetrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node, index) => ({
      index,
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth,
      overflowY: node.scrollHeight > node.clientHeight + 1,
      overflowX: node.scrollWidth > node.clientWidth + 1,
      className: node.className,
    })));
    const pdfPath = path.join(OUTPUT, `g3a-u08-fraction-quantity-${mode}.pdf`);
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    browserFindings[mode] = { pageMetrics, physicalPdfPageCount: physicalPdfPageCount(pdfPath), consoleErrors, pageErrors };
    await page.close();
  }
} finally {
  await browser.close();
}

const allQuestions = evidence.questions;
const contextMacroIds = [...new Set(allQuestions.filter((row) => row.questionMode === "application").map((row) => row.metadata?.contextLineage?.macroContextId))].sort();
const overflowFindingCount = Object.values(browserFindings).flatMap((row) => row.pageMetrics).filter((row) => row.overflowX || row.overflowY).length;
const semanticScopeFindingCount = allQuestions.filter((row) => row.numerator <= 0 || row.numerator >= row.denominator || /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(row.blankedDisplayText ?? "")).length;
const duplicatePromptFindingCount = ["numeric", "application"].reduce((sum, mode) => {
  const prompts = evidence.generations[mode].questions.map((row) => row.blankedDisplayText);
  return sum + prompts.length - new Set(prompts).size;
}, 0);
const report = {
  schemaName: "P03FSlice002ChromiumProductAcceptanceReportV1",
  taskId: evidence.taskId,
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: "g3a_u08_3a08",
  knowledgePointIds: evidence.slice.knowledgePointIds,
  numericQuestionCount: evidence.generations.numeric.questions.length,
  applicationQuestionCount: evidence.generations.application.questions.length,
  answerKeyItemCount: evidence.metrics.answerKeyWitnessCount,
  numericQuestionPageCount: evidence.documents.numeric.questionPages.length,
  numericAnswerKeyPageCount: evidence.documents.numeric.answerKeyPages.length,
  applicationQuestionPageCount: evidence.documents.application.questionPages.length,
  applicationAnswerKeyPageCount: evidence.documents.application.answerKeyPages.length,
  numericPhysicalPdfPageCount: browserFindings.numeric.physicalPdfPageCount,
  applicationPhysicalPdfPageCount: browserFindings.application.physicalPdfPageCount,
  patternSpecIds: [...new Set(allQuestions.map((row) => row.patternSpecId))].sort(),
  contextMacroIds,
  globalContextBindingCount: evidence.applicationRecords.length,
  duplicatePromptFindingCount,
  overflowFindingCount,
  consoleErrorCount: Object.values(browserFindings).reduce((sum, row) => sum + row.consoleErrors.length, 0),
  pageErrorCount: Object.values(browserFindings).reduce((sum, row) => sum + row.pageErrors.length, 0),
  semanticScopeFindingCount,
  browserFindings,
  visualReview: {
    status: "PENDING",
    numericQuestionPageReviewed: false,
    numericAnswerKeyPageReviewed: false,
    applicationQuestionPageReviewed: false,
    applicationAnswerKeyPageReviewed: false,
    clippedTextFindingCount: null,
    overlapFindingCount: null,
    brokenGlyphFindingCount: null,
    semanticScopeFindingCount: null,
  },
};
fs.writeFileSync(path.join(OUTPUT, "p03f-slice002-product-acceptance-report.json"), JSON.stringify(report, null, 2) + "\n");
if (
  report.numericQuestionCount !== 6
  || report.applicationQuestionCount !== 6
  || report.answerKeyItemCount !== 12
  || report.patternSpecIds.length !== 6
  || report.contextMacroIds.length !== 3
  || report.globalContextBindingCount !== 3
  || report.duplicatePromptFindingCount !== 0
  || report.numericPhysicalPdfPageCount !== report.numericQuestionPageCount + report.numericAnswerKeyPageCount
  || report.applicationPhysicalPdfPageCount !== report.applicationQuestionPageCount + report.applicationAnswerKeyPageCount
  || report.overflowFindingCount !== 0
  || report.consoleErrorCount !== 0
  || report.pageErrorCount !== 0
  || report.semanticScopeFindingCount !== 0
) {
  throw new Error(`P03F2_CHROMIUM_ACCEPTANCE_FAILED:${JSON.stringify(report)}`);
}
console.log(`P03F2_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
