import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS,
  G4A_U06_P03F33_KP_IDS,
  G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U06_P03F33_SOURCE_ID,
  P03F33_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice033-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8")
  .replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g, (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const result = buildBatchABrowserWorksheetDocument({
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  selectionMode:"mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds:[...G4A_U06_P03F33_KP_IDS],
  questionMode:"numeric",
  questionCount:24,
  generationSeed:"p03f33-acceptance",
  includeAnswerKey:true,
  printLayout:{ paperSize:"A4", columns:2, rowsPerPage:4, showQuestionNumbers:true, showAnswerKeyPage:true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F33_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref:"" })
  .replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g4a-u06-rank9-fraction.html");
const pdfPath = path.join(OUTPUT, "g4a-u06-rank9-fraction.pdf");
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
    await pages.nth(index).screenshot({ path:path.join(OUTPUT, `rank9-fraction-page-${String(index + 1).padStart(2, "0")}.png`) });
  }
  await page.emulateMedia({ media:"print" });
  pageMetrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node, index) => ({
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

const generated = result.generation.questions;
const questions = document.generatedQuestions;
const answers = document.answerKeyItems;
const crossLayerMismatchCount = questions.filter((question, index) => {
  const source = generated[index];
  const answer = answers[index];
  return !source || !answer
    || source.id !== question.id
    || source.patternSpecId !== question.patternSpecId
    || source.answerText !== question.answerText
    || answer.questionId !== question.id
    || answer.patternId !== question.patternSpecId
    || answer.knowledgePointId !== question.metadata?.knowledgePointId
    || answer.answerText !== question.answerText;
}).length + Math.abs(generated.length - questions.length) + Math.abs(answers.length - questions.length);

const compareSpec = "ps_g4a_u06_fraction_compare_order_comparison_numeric";
const coordinateSpec = "ps_g4a_u06_fraction_number_line_coordinate_numeric";
const distanceSpec = "ps_g4a_u06_fraction_number_line_distance_numeric";
const addSubSpec = "ps_g4a_u06_mixed_fraction_add_sub_result_numeric";
const patternSpecWitnessCounts = Object.fromEntries(G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS.map((id) => [id, questions.filter((question) => question.patternSpecId === id).length]));
const relationWitnessCounts = Object.fromEntries(["<", "=", ">"].map((relation) => [relation, questions.filter((question) => question.patternSpecId === compareSpec && question.answerText === relation).length]));
const numberLineWitnessCounts = {
  coordinate:questions.filter((question) => question.patternSpecId === coordinateSpec && question.numberLineTask === "coordinate").length,
  distance:questions.filter((question) => question.patternSpecId === distanceSpec && question.numberLineTask === "distance").length,
};
const addSubWitnessCounts = {
  add:questions.filter((question) => question.patternSpecId === addSubSpec && question.arithmeticOperation === "add").length,
  sub:questions.filter((question) => question.patternSpecId === addSubSpec && question.arithmeticOperation === "sub").length,
};
const semanticScopeFindingCount = questions.filter((question) => {
  const capabilities = question.metadata?.requiredCapabilityIds ?? [];
  return question.sourceId !== G4A_U06_P03F33_SOURCE_ID
    || question.metadata?.productAdmissionTask !== "P03F_W3DirectProductVerticalSlice033Implementation"
    || question.questionMode !== "numeric"
    || question.globalContextProduction != null
    || question.metadata?.globalContextAuthorityPath != null
    || JSON.stringify(capabilities) !== JSON.stringify(P03F33_REQUIRED_CAPABILITY_IDS)
    || !G4A_U06_P03F33_KP_IDS.includes(question.metadata?.knowledgePointId)
    || !G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS.includes(question.patternSpecId);
}).length;
const hiddenApplicationLeakFindingCount = questions.filter((question) => G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS.includes(question.patternSpecId)).length;
const excludedFractionTimesIntegerFindingCount = questions.filter((question) => String(question.metadata?.knowledgePointId ?? "").includes("fraction_times_integer_quantity")).length;

const report = {
  schemaName:"P03FSlice033ChromiumProductAcceptanceReportV1",
  taskId:"P03F_W3DirectProductVerticalSlice033ChromiumAcceptance",
  status:"PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  caseCount:1,
  totalQuestionCount:questions.length,
  totalAnswerKeyItemCount:answers.length,
  totalPhysicalPdfPageCount:physicalPages(pdfPath),
  screenshotCount:pageMetrics.length,
  observedKnowledgePointIds:[...new Set(questions.map((question) => question.metadata?.knowledgePointId))].sort(),
  expectedKnowledgePointIds:[...G4A_U06_P03F33_KP_IDS].sort(),
  observedPatternSpecIds:[...new Set(questions.map((question) => question.patternSpecId))].sort(),
  expectedPatternSpecIds:[...G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS].sort(),
  patternSpecWitnessCounts,
  relationWitnessCounts,
  numberLineWitnessCounts,
  addSubWitnessCounts,
  crossLayerMismatchCount,
  htmlSha256:sha256(htmlPath),
  pdfSha256:sha256(pdfPath),
  pdfByteLength:fs.statSync(pdfPath).size,
  duplicatePromptFindingCount:questions.length - new Set(document.questionDisplayModels.map((model) => model.promptText)).size,
  overflowFindingCount:pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount:consoleErrors.length,
  pageErrorCount:pageErrors.length,
  semanticScopeFindingCount,
  applicationLeakFindingCount:questions.filter((question) => question.questionMode !== "numeric" || question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null).length,
  hiddenApplicationLeakFindingCount,
  excludedFractionTimesIntegerFindingCount,
  hiddenApplicationLineagePreserved:document.metadata?.hiddenApplicationLineagePreserved === true,
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
  && Object.values(report.patternSpecWitnessCounts).every((count) => count === 6)
  && Object.values(report.relationWitnessCounts).every((count) => count > 0)
  && report.numberLineWitnessCounts.coordinate === 6
  && report.numberLineWitnessCounts.distance === 6
  && report.addSubWitnessCounts.add === 3
  && report.addSubWitnessCounts.sub === 3
  && report.crossLayerMismatchCount === 0
  && report.duplicatePromptFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.semanticScopeFindingCount === 0
  && report.applicationLeakFindingCount === 0
  && report.hiddenApplicationLeakFindingCount === 0
  && report.excludedFractionTimesIntegerFindingCount === 0
  && report.hiddenApplicationLineagePreserved
  && report.sharedPagination
  && report.sharedRenderer
  && report.parallelPipeline === false;
if (!automatedPass) throw new Error(`P03F33_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT, "p03f-slice033-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F33_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
