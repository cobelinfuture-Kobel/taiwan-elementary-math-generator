import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5B_U04_P03F49_APPLICATION_GROUP_ID,
  G5B_U04_P03F49_APPLICATION_KP_ID,
  G5B_U04_P03F49_APPLICATION_SPEC_ID,
  G5B_U04_P03F49_ESTIMATION_GROUP_ID,
  G5B_U04_P03F49_ESTIMATION_KP_ID,
  G5B_U04_P03F49_ESTIMATION_SPEC_ID,
  G5B_U04_P03F49_SOURCE_ID
} from "../../site/modules/curriculum/registry/g5b-u04-rank11-application-estimation-selector-projection-p03f49.js";
import {
  multiplyP03F49Decimals,
  roundHalfUpP03F49ToInteger
} from "../../site/modules/curriculum/batch-a/g5b-u04-rank11-application-estimation-runtime-p03f49.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice049-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8").replace(
  /url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,
  (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`
);
const physicalPages = (file) => (fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const CASES = [
  {
    id: "application",
    knowledgePointId: G5B_U04_P03F49_APPLICATION_KP_ID,
    patternGroupId: G5B_U04_P03F49_APPLICATION_GROUP_ID,
    patternSpecId: G5B_U04_P03F49_APPLICATION_SPEC_ID,
    questionMode: "application",
    seed: "p03f49-application-product-acceptance"
  },
  {
    id: "estimation",
    knowledgePointId: G5B_U04_P03F49_ESTIMATION_KP_ID,
    patternGroupId: G5B_U04_P03F49_ESTIMATION_GROUP_ID,
    patternSpecId: G5B_U04_P03F49_ESTIMATION_SPEC_ID,
    questionMode: "numeric",
    seed: "p03f49-estimation-product-acceptance"
  }
];

async function renderCase(browser, entry) {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: G5B_U04_P03F49_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [entry.knowledgePointId],
    selectedPatternGroupIds: [entry.patternGroupId],
    patternSpecIds: [entry.patternSpecId],
    requestedQuestionType: entry.questionMode,
    questionMode: entry.questionMode,
    questionCount: 12,
    generationSeed: entry.seed,
    includeAnswerKey: true,
    ordering: "groupedByPattern",
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true
    }
  });
  if (!result.ok || !result.worksheetDocument) {
    throw new Error(`P03F49_${entry.id.toUpperCase()}_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
  }
  const document = result.worksheetDocument;
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }).replace(
    "</head>",
    `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`
  );
  const htmlPath = path.join(OUTPUT, `g5b-u04-rank11-q049-${entry.id}.html`);
  const pdfPath = path.join(OUTPUT, `g5b-u04-rank11-q049-${entry.id}.pdf`);
  fs.writeFileSync(htmlPath, html);

  const consoleErrors = [];
  const pageErrors = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil: "networkidle" });
  const pages = page.locator(".worksheet-page");
  const screenshotCount = await pages.count();
  for (let index = 0; index < screenshotCount; index += 1) {
    await pages.nth(index).screenshot({
      path: path.join(OUTPUT, `${entry.id}-page-${String(index + 1).padStart(2, "0")}.png`)
    });
  }
  await page.emulateMedia({ media: "print" });
  const metrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node, index) => ({
    index,
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
    overflowY: node.scrollHeight > node.clientHeight + 1,
    overflowX: node.scrollWidth > node.clientWidth + 1
  })));
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });
  await page.close();

  const questions = document.generatedQuestions;
  const exactAnswerMismatchCount = questions.filter((question) => {
    if (entry.id === "application") {
      const expected = multiplyP03F49Decimals(
        question.metadata?.leftDecimalFactor,
        question.metadata?.rightDecimalFactor
      ).text;
      return question.answerText !== expected || question.metadata?.product !== expected;
    }
    const roundedLeft = roundHalfUpP03F49ToInteger(question.metadata?.leftDecimalFactor);
    const roundedRight = roundHalfUpP03F49ToInteger(question.metadata?.rightDecimalFactor);
    const expected = (roundedLeft * roundedRight).toString();
    return question.answerText !== expected ||
      question.metadata?.estimate !== expected ||
      question.metadata?.roundedLeft !== roundedLeft.toString() ||
      question.metadata?.roundedRight !== roundedRight.toString();
  }).length;
  const crossLayerMismatchCount = questions.filter((question, index) =>
    !document.answerKeyItems[index] ||
    document.answerKeyItems[index].questionId !== question.id ||
    document.answerKeyItems[index].answerText !== question.answerText ||
    document.questionDisplayModels[index]?.promptText !== question.blankedDisplayText
  ).length;
  const scopeLeakCount = questions.filter((question) => {
    if (question.metadata?.globalContext != null) return true;
    if (entry.id === "application") {
      return question.metadata?.questionMode !== "application" ||
        question.metadata?.operatorApprovedExtension !== true ||
        question.metadata?.directTextbookExampleClaimed !== false;
    }
    return question.metadata?.questionMode !== "numeric" ||
      question.metadata?.operatorApprovedExtension !== true ||
      question.metadata?.directTextbookMethodClaimed !== false ||
      question.metadata?.estimationMethod !== "ROUND_HALF_UP_BOTH_FACTORS_TO_INTEGER_THEN_MULTIPLY";
  }).length;

  return {
    entry,
    document,
    questions,
    metrics,
    consoleErrors,
    pageErrors,
    screenshotCount,
    physicalPageCount: physicalPages(pdfPath),
    pdfByteLength: fs.statSync(pdfPath).size,
    exactAnswerMismatchCount,
    crossLayerMismatchCount,
    duplicatePromptCount: questions.length - new Set(questions.map((question) => question.blankedDisplayText)).size,
    scopeLeakCount
  };
}

const browser = await chromium.launch({ headless: true });
let rendered;
try {
  rendered = [];
  for (const entry of CASES) rendered.push(await renderCase(browser, entry));
} finally {
  await browser.close();
}

const registry = getCurrentPixelRegistrySnapshot();
const source = registry.bySourceId[G5B_U04_P03F49_SOURCE_ID];
const application = rendered.find((row) => row.entry.id === "application");
const estimation = rendered.find((row) => row.entry.id === "estimation");
const allMetrics = rendered.flatMap((row) => row.metrics);
const adapter = application.document.metadata?.worksheetAdapter;
const report = {
  schemaName: "P03FSlice049ChromiumProductAcceptanceReportV1",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  publicSourceCount: registry.sourceCount,
  visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
  sourceVisibleKnowledgePointCount: source?.visibleKnowledgePoints?.length ?? 0,
  sourceHiddenKnowledgePointCount: source?.hiddenPendingCount ?? 0,
  sourceNotSelectableKnowledgePointCount: source?.notSelectableCount ?? 0,
  applicationQuestionCount: application.questions.length,
  estimationQuestionCount: estimation.questions.length,
  totalQuestionCount: rendered.reduce((sum, row) => sum + row.questions.length, 0),
  totalAnswerCount: rendered.reduce((sum, row) => sum + row.document.answerKeyItems.length, 0),
  applicationQuestionPageCount: application.document.questionPages.length,
  applicationAnswerPageCount: application.document.answerKeyPages.length,
  estimationQuestionPageCount: estimation.document.questionPages.length,
  estimationAnswerPageCount: estimation.document.answerKeyPages.length,
  totalPhysicalPdfPageCount: rendered.reduce((sum, row) => sum + row.physicalPageCount, 0),
  screenshotCount: rendered.reduce((sum, row) => sum + row.screenshotCount, 0),
  operatorApprovedApplicationWitness: application.questions.some((question) =>
    question.metadata?.leftDecimalFactor === "12.5" &&
    question.metadata?.rightDecimalFactor === "2.4" &&
    question.answerText === "30"
  ),
  operatorApprovedEstimationWitness: estimation.questions.some((question) =>
    question.metadata?.leftDecimalFactor === "12.6" &&
    question.metadata?.rightDecimalFactor === "3.9" &&
    question.metadata?.roundedLeft === "13" &&
    question.metadata?.roundedRight === "4" &&
    question.answerText === "52"
  ),
  exactAnswerMismatchCount: rendered.reduce((sum, row) => sum + row.exactAnswerMismatchCount, 0),
  crossLayerMismatchCount: rendered.reduce((sum, row) => sum + row.crossLayerMismatchCount, 0),
  duplicatePromptCount: rendered.reduce((sum, row) => sum + row.duplicatePromptCount, 0),
  scopeLeakCount: rendered.reduce((sum, row) => sum + row.scopeLeakCount, 0),
  overflowFindingCount: allMetrics.filter((metric) => metric.overflowX || metric.overflowY).length,
  consoleErrorCount: rendered.reduce((sum, row) => sum + row.consoleErrors.length, 0),
  pageErrorCount: rendered.reduce((sum, row) => sum + row.pageErrors.length, 0),
  sharedIntegerScaledDecimalModel: adapter?.sharedIntegerScaledDecimalModel === true,
  sharedNumericRendererAdapter: adapter?.sharedNumericRendererAdapter === true,
  sharedPagination: adapter?.sharedPagination === true,
  sharedRenderer: adapter?.sharedRenderer === true,
  applicationExpansion: application.document.metadata?.applicationExpansion === true,
  operatorApprovedApplication: application.document.metadata?.operatorApprovedApplication === true,
  operatorApprovedEstimation: estimation.document.metadata?.operatorApprovedEstimation === true,
  directTextbookApplicationExampleClaimed: application.document.metadata?.directTextbookApplicationExampleClaimed === true,
  directTextbookEstimationMethodClaimed: estimation.document.metadata?.directTextbookEstimationMethodClaimed === true,
  globalContextExpansion: rendered.some((row) => row.document.metadata?.globalContextExpansion === true),
  slice050Expansion: rendered.some((row) => row.document.metadata?.slice050Expansion === true),
  parallelPipeline: adapter?.parallelPipeline === true,
  pdfByteLength: rendered.reduce((sum, row) => sum + row.pdfByteLength, 0),
  pageMetrics: Object.fromEntries(rendered.map((row) => [row.entry.id, row.metrics])),
  visualReview: { status: "PENDING", allPagesReviewed: false }
};

const pass =
  report.publicSourceCount === 33 &&
  report.visibleKnowledgePointCount === 251 &&
  report.sourceVisibleKnowledgePointCount === 5 &&
  report.sourceHiddenKnowledgePointCount === 0 &&
  report.sourceNotSelectableKnowledgePointCount === 0 &&
  report.applicationQuestionCount === 12 &&
  report.estimationQuestionCount === 12 &&
  report.totalQuestionCount === 24 &&
  report.totalAnswerCount === 24 &&
  report.applicationQuestionPageCount === 2 &&
  report.applicationAnswerPageCount === 2 &&
  report.estimationQuestionPageCount === 2 &&
  report.estimationAnswerPageCount === 2 &&
  report.totalPhysicalPdfPageCount === 8 &&
  report.screenshotCount === 8 &&
  report.operatorApprovedApplicationWitness &&
  report.operatorApprovedEstimationWitness &&
  report.exactAnswerMismatchCount === 0 &&
  report.crossLayerMismatchCount === 0 &&
  report.duplicatePromptCount === 0 &&
  report.scopeLeakCount === 0 &&
  report.overflowFindingCount === 0 &&
  report.consoleErrorCount === 0 &&
  report.pageErrorCount === 0 &&
  report.sharedIntegerScaledDecimalModel &&
  report.sharedNumericRendererAdapter &&
  report.sharedPagination &&
  report.sharedRenderer &&
  report.applicationExpansion &&
  report.operatorApprovedApplication &&
  report.operatorApprovedEstimation &&
  !report.directTextbookApplicationExampleClaimed &&
  !report.directTextbookEstimationMethodClaimed &&
  !report.globalContextExpansion &&
  !report.slice050Expansion &&
  !report.parallelPipeline;

fs.writeFileSync(
  path.join(OUTPUT, "p03f-slice049-product-acceptance-report.json"),
  `${JSON.stringify(report, null, 2)}\n`
);
if (!pass) throw new Error(`P03F49_CHROMIUM_FAILED:${JSON.stringify(report)}`);
console.log(`P03F49_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
