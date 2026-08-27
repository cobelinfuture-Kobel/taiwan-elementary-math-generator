import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {getCurrentPixelRegistrySnapshot} from "../../site/pixel/pixel-registry-bridge.js";
import {
  G3B_U02_P04F2_KP_ID,
  G3B_U02_P04F2_SPEC_ID,
  G3B_U02_P04F2_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g3b-u02-capacity-unit-identity-selector-projection-p04f2.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p04f-slice002-product-acceptance");
fs.mkdirSync(OUTPUT, {recursive: true});

const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8").replace(
  /url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,
  (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`,
);
const physicalPages = file => (fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const options = {
  sourceId: G3B_U02_P04F2_SOURCE_ID,
  selectionMode: "sourceUnit",
  questionMode: "numeric",
  questionCount: 8,
  generationSeed: "p04f2-product-capacity-unit",
  includeAnswerKey: true,
  printLayout: {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
  },
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`P04F2_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
}
const document = result.worksheetDocument;
const questions = document.generatedQuestions;
const html = renderWorksheetDocumentToHtml(document, {stylesheetHref: ""}).replace(
  "</head>",
  `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`,
);
const htmlPath = path.join(OUTPUT, "capacity-unit-identity.html");
const pdfPath = path.join(OUTPUT, "capacity-unit-identity.pdf");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({headless: true});
const consoleErrors = [];
const pageErrors = [];
let metrics = [];
let screenshotCount = 0;
try {
  const page = await browser.newPage({viewport: {width: 1280, height: 960}, deviceScaleFactor: 1});
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => pageErrors.push(String(error)));
  await page.setContent(html, {waitUntil: "networkidle"});
  const pages = page.locator(".worksheet-page");
  screenshotCount = await pages.count();
  for (let index = 0; index < screenshotCount; index++) {
    await pages.nth(index).screenshot({path: path.join(OUTPUT, `capacity-page-${String(index + 1).padStart(2, "0")}.png`)});
  }
  await page.emulateMedia({media: "print"});
  metrics = await page.$$eval(".worksheet-page", nodes => nodes.map((node, index) => ({
    index,
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
    overflowY: node.scrollHeight > node.clientHeight + 1,
    overflowX: node.scrollWidth > node.clientWidth + 1,
  })));
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {top: "0", right: "0", bottom: "0", left: "0"},
  });
  await page.close();
} finally {
  await browser.close();
}

const expectedAnswer = q => q.metadata?.capacityScaleClass === "smaller_capacity" ? "毫升" : q.metadata?.capacityScaleClass === "larger_capacity" ? "公升" : null;
const exactAnswerMismatchCount = questions.filter(q => !expectedAnswer(q) || q.answer !== expectedAnswer(q) || q.answerText !== expectedAnswer(q) || q.finalAnswer !== expectedAnswer(q)).length;
const crossLayerMismatchCount = questions.filter((q, index) => !document.answerKeyItems[index] || document.answerKeyItems[index].questionId !== q.id || document.answerKeyItems[index].answerText !== q.answerText || document.questionDisplayModels[index]?.promptText !== q.blankedDisplayText).length;
const visualIdentityDuplicateCount = questions.length - new Set(questions.map(q => q.blankedDisplayText)).size;
const forbiddenWordingCount = questions.filter(q => /1000|換算|刻度|加減|比較/.test(String(q.blankedDisplayText ?? ""))).length;
const scopeLeakCount = questions.filter(q => q.sourceId !== G3B_U02_P04F2_SOURCE_ID || q.knowledgePointId !== G3B_U02_P04F2_KP_ID || q.patternSpecId !== G3B_U02_P04F2_SPEC_ID || q.metadata?.containerScaleReading !== false || q.metadata?.standaloneConversionQuestion !== false || q.metadata?.mixedUnitComparison !== false || q.metadata?.mixedUnitArithmetic !== false).length;
const registry = getCurrentPixelRegistrySnapshot();
const source = registry.bySourceId[G3B_U02_P04F2_SOURCE_ID];
const adapter = document.metadata?.worksheetAdapter ?? result.p04f2WorksheetAdapter;
const answerLabels = [...new Set(questions.map(q => q.answerText))].sort();

const report = {
  schemaName: "P04FSlice002ChromiumProductAcceptanceReportV1",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  publicSourceCount: registry.sourceCount,
  visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
  sourceVisibleKnowledgePointCount: source?.visibleKnowledgePoints?.length ?? 0,
  sourceHiddenKnowledgePointCount: source?.hiddenPendingCount ?? 0,
  sourceNotSelectableKnowledgePointCount: source?.notSelectableCount ?? 0,
  questionCount: questions.length,
  answerCount: document.answerKeyItems.length,
  capacityUnitIdentityQuestionCount: questions.filter(q => q.patternSpecId === G3B_U02_P04F2_SPEC_ID).length,
  questionPageCount: document.questionPages.length,
  answerPageCount: document.answerKeyPages.length,
  physicalPdfPageCount: physicalPages(pdfPath),
  screenshotCount,
  answerLabels,
  exactAnswerMismatchCount,
  crossLayerMismatchCount,
  visualIdentityDuplicateCount,
  forbiddenWordingCount,
  scopeLeakCount,
  overflowFindingCount: metrics.filter(metric => metric.overflowX || metric.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
  directTextbookWitness: questions.every(q => q.metadata?.sourcePdfTitle === "meow911_3b02_l_ml.pdf" && q.metadata?.sourceEvidencePages?.includes(1)),
  containerScaleReadingUsed: questions.some(q => q.metadata?.containerScaleReading === true),
  standaloneConversionQuestionUsed: questions.some(q => q.metadata?.standaloneConversionQuestion === true),
  mixedUnitComparisonUsed: questions.some(q => q.metadata?.mixedUnitComparison === true),
  mixedUnitArithmeticUsed: questions.some(q => q.metadata?.mixedUnitArithmetic === true),
  sharedQuantityMeasurementRuntime: adapter?.sharedQuantityMeasurementRuntime === true,
  sharedPagination: adapter?.sharedPagination === true,
  sharedRenderer: adapter?.sharedRenderer === true,
  parallelPipeline: adapter?.parallelPipeline === true,
  pdfByteLength: fs.statSync(pdfPath).size,
  visualReview: {status: "PENDING", allPagesReviewed: false},
};

const pass = report.publicSourceCount === 36 &&
  report.visibleKnowledgePointCount === 261 &&
  report.sourceVisibleKnowledgePointCount === 1 &&
  report.sourceHiddenKnowledgePointCount === 0 &&
  report.sourceNotSelectableKnowledgePointCount === 0 &&
  report.questionCount === 8 &&
  report.answerCount === 8 &&
  report.capacityUnitIdentityQuestionCount === 8 &&
  report.questionPageCount === 1 &&
  report.answerPageCount === 1 &&
  report.physicalPdfPageCount === 2 &&
  report.screenshotCount === 2 &&
  report.answerLabels.length === 2 &&
  report.answerLabels.includes("毫升") &&
  report.answerLabels.includes("公升") &&
  report.exactAnswerMismatchCount === 0 &&
  report.crossLayerMismatchCount === 0 &&
  report.visualIdentityDuplicateCount === 0 &&
  report.forbiddenWordingCount === 0 &&
  report.scopeLeakCount === 0 &&
  report.overflowFindingCount === 0 &&
  report.consoleErrorCount === 0 &&
  report.pageErrorCount === 0 &&
  report.directTextbookWitness &&
  !report.containerScaleReadingUsed &&
  !report.standaloneConversionQuestionUsed &&
  !report.mixedUnitComparisonUsed &&
  !report.mixedUnitArithmeticUsed &&
  report.sharedQuantityMeasurementRuntime &&
  report.sharedPagination &&
  report.sharedRenderer &&
  !report.parallelPipeline;

fs.writeFileSync(path.join(OUTPUT, "p04f-slice002-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (!pass) throw new Error(`P04F2_CHROMIUM_FAILED:${JSON.stringify(report)}`);
console.log(`P04F2_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
