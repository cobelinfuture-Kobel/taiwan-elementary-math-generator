import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  exactDecimalToFraction,
  exactFractionToDecimal,
} from "../../site/modules/curriculum/public/shared-mixed-domain-normalizer-p03f32.js";
import {
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
  G6B_U01_P03F32_SPEC_IDS,
  P03F32_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice032-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive:true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8")
  .replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g, (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const result = buildBatchABrowserWorksheetDocument({
  sourceId:G6B_U01_P03F32_SOURCE_ID,
  selectionMode:"sourceUnit",
  questionMode:"numeric",
  questionCount:24,
  generationSeed:"p03f32-product-acceptance",
  includeAnswerKey:true,
  printLayout:{ paperSize:"A4", columns:2, rowsPerPage:4, showQuestionNumbers:true, showAnswerKeyPage:true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F32_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref:"" })
  .replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g6b-u01-decimal-fraction-conversion.html");
const pdfPath = path.join(OUTPUT, "g6b-u01-decimal-fraction-conversion.pdf");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({ headless:true });
const consoleErrors = [];
const pageErrors = [];
let pageMetrics = [];
try {
  const page = await browser.newPage({ viewport:{ width:1280, height:960 }, deviceScaleFactor:1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil:"networkidle" });
  const pages = page.locator(".worksheet-page");
  for (let index = 0; index < await pages.count(); index += 1) {
    await pages.nth(index).screenshot({ path:path.join(OUTPUT, `decimal-fraction-conversion-page-${String(index+1).padStart(2,"0")}.png`) });
  }
  await page.emulateMedia({ media:"print" });
  pageMetrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node,index)=>({
    index,
    clientHeight:node.clientHeight,
    scrollHeight:node.scrollHeight,
    clientWidth:node.clientWidth,
    scrollWidth:node.scrollWidth,
    overflowY:node.scrollHeight > node.clientHeight + 1,
    overflowX:node.scrollWidth > node.clientWidth + 1,
  })));
  await page.pdf({ path:pdfPath, format:"A4", printBackground:true, preferCSSPageSize:true, margin:{ top:"0", right:"0", bottom:"0", left:"0" } });
  await page.close();
} finally {
  await browser.close();
}

const generationQuestions = result.generation.questions;
const questions = document.generatedQuestions;
const answerKeyItems = document.answerKeyItems;
const crossLayerMismatchCount = questions.filter((question,index)=>{
  const generated = generationQuestions[index];
  const answer = answerKeyItems[index];
  return !generated || !answer
    || generated.id !== question.id
    || generated.patternSpecId !== question.patternSpecId
    || generated.answerText !== question.answerText
    || answer.questionId !== question.id
    || answer.patternId !== question.patternSpecId
    || answer.knowledgePointId !== question.metadata?.knowledgePointId
    || answer.answerText !== question.answerText;
}).length + Math.abs(generationQuestions.length-questions.length) + Math.abs(answerKeyItems.length-questions.length);

const conversionFindingCount = questions.filter((question)=>{
  try {
    if (question.action === "TO_FRACTION") {
      const expected = exactDecimalToFraction(question.decimal);
      return question.answerText !== `${expected.canonicalValue.numerator}/${expected.canonicalValue.denominator}`
        || question.finalAnswer?.canonicalRationalIdentity !== expected.canonicalRationalIdentity
        || question.finalAnswer?.exact !== true;
    }
    if (question.action === "TO_DECIMAL") {
      const expected = exactFractionToDecimal({ numerator:question.numerator, denominator:question.denominator });
      return question.answerText !== expected.canonicalValue.canonicalText
        || question.finalAnswer?.canonicalRationalIdentity !== expected.canonicalRationalIdentity
        || question.finalAnswer?.exact !== true;
    }
    return true;
  } catch {
    return true;
  }
}).length;

const semanticScopeFindingCount = questions.filter((question)=>{
  const capabilities = question.metadata?.requiredCapabilityIds ?? [];
  return question.sourceId !== G6B_U01_P03F32_SOURCE_ID
    || question.metadata?.productAdmissionTask !== "P03F_W3DirectProductVerticalSlice032Implementation"
    || question.metadata?.knowledgePointId !== G6B_U01_P03F32_KP_ID
    || !G6B_U01_P03F32_SPEC_IDS.includes(question.patternSpecId)
    || question.questionMode !== "numeric"
    || question.operationFamilyId !== "mixed_domain_conversion"
    || !["TO_FRACTION","TO_DECIMAL"].includes(question.action)
    || question.metadata?.sourceAuthorityMode !== "R02_CANONICAL_PREREQUISITE_PROJECTION"
    || question.metadata?.directSourcePromptVerbatim !== false
    || question.metadata?.mixedDomainNormalizerId !== "shared-mixed-domain-normalizer-p03f32-v2"
    || question.metadata?.contextAuthority !== null
    || question.metadata?.globalContextProduction !== null
    || JSON.stringify(capabilities) !== JSON.stringify(P03F32_REQUIRED_CAPABILITY_IDS);
}).length;

const directionCounts = Object.fromEntries(["TO_FRACTION","TO_DECIMAL"].map((action)=>[action, questions.filter((question)=>question.action===action).length]));
const report = {
  schemaName:"P03FSlice032ChromiumProductAcceptanceReportV1",
  taskId:"P03F_W3DirectProductVerticalSlice032ChromiumAcceptance",
  status:"PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId:G6B_U01_P03F32_SOURCE_ID,
  caseCount:1,
  totalQuestionCount:questions.length,
  totalAnswerKeyItemCount:answerKeyItems.length,
  totalPhysicalPdfPageCount:physicalPages(pdfPath),
  screenshotCount:pageMetrics.length,
  observedKnowledgePointIds:[...new Set(questions.map((question)=>question.metadata?.knowledgePointId))].sort(),
  expectedKnowledgePointIds:[G6B_U01_P03F32_KP_ID],
  observedPatternSpecIds:[...new Set(questions.map((question)=>question.patternSpecId))].sort(),
  expectedPatternSpecIds:[...G6B_U01_P03F32_SPEC_IDS].sort(),
  directionCounts,
  conversionFindingCount,
  crossLayerMismatchCount,
  htmlSha256:sha256(htmlPath),
  pdfSha256:sha256(pdfPath),
  pdfByteLength:fs.statSync(pdfPath).size,
  duplicatePromptFindingCount:questions.length - new Set(document.questionDisplayModels.map((model)=>model.promptText)).size,
  overflowFindingCount:pageMetrics.filter((row)=>row.overflowX || row.overflowY).length,
  consoleErrorCount:consoleErrors.length,
  pageErrorCount:pageErrors.length,
  semanticScopeFindingCount,
  applicationLeakFindingCount:questions.filter((question)=>question.questionMode !== "numeric"
    || question.metadata?.contextAuthority != null
    || question.metadata?.globalContextProduction != null).length,
  compareLeakFindingCount:questions.filter((question)=>question.action === "COMPARE" || question.operationFamilyId === "mixed_number_domain_order").length,
  arithmeticLeakFindingCount:questions.filter((question)=>["ADD","SUBTRACT","MULTIPLY","DIVIDE"].includes(question.action)).length,
  applicationExpansion:document.metadata?.applicationExpansion,
  sharedPagination:document.metadata?.worksheetAdapter?.sharedPagination === true,
  sharedRenderer:document.metadata?.worksheetAdapter?.sharedRenderer === true,
  parallelPipeline:document.metadata?.worksheetAdapter?.parallelPipeline === true,
  pageMetrics,
  visualReview:{ status:"PENDING", allPagesReviewed:false, clippedTextFindingCount:null, overlapFindingCount:null, brokenGlyphFindingCount:null },
};

const automatedPass = report.totalQuestionCount === 24
  && report.totalAnswerKeyItemCount === 24
  && report.totalPhysicalPdfPageCount === 6
  && report.screenshotCount === 6
  && JSON.stringify(report.observedKnowledgePointIds) === JSON.stringify(report.expectedKnowledgePointIds)
  && JSON.stringify(report.observedPatternSpecIds) === JSON.stringify(report.expectedPatternSpecIds)
  && report.directionCounts.TO_FRACTION === 12
  && report.directionCounts.TO_DECIMAL === 12
  && report.conversionFindingCount === 0
  && report.crossLayerMismatchCount === 0
  && report.duplicatePromptFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.semanticScopeFindingCount === 0
  && report.applicationLeakFindingCount === 0
  && report.compareLeakFindingCount === 0
  && report.arithmeticLeakFindingCount === 0
  && report.applicationExpansion === false
  && report.sharedPagination
  && report.sharedRenderer
  && report.parallelPipeline === false;
if (!automatedPass) throw new Error(`P03F32_CHROMIUM_FAILED:${JSON.stringify(report)}`);

fs.writeFileSync(path.join(OUTPUT, "p03f-slice032-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F32_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
