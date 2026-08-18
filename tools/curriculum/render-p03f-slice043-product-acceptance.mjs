import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G4B_U08_P03F43_BOUNDS_GROUP_ID,
  G4B_U08_P03F43_BOUNDS_KP_ID,
  G4B_U08_P03F43_BOUNDS_SPEC_ID,
  G4B_U08_P03F43_COORDINATE_SPEC_ID,
  G4B_U08_P03F43_DISTANCE_SPEC_ID,
  G4B_U08_P03F43_NUMBER_LINE_GROUP_ID,
  G4B_U08_P03F43_NUMBER_LINE_KP_ID,
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice043-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8").replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g, (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const physicalPages = (file) => (fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
const gcd = (a, b) => { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
const normalize = (n, d) => { const g = gcd(n, d); return { numerator: n / g, denominator: d / g }; };
const sameRational = (an, ad, bn, bd) => an * bd === bn * ad;

const result = buildBatchABrowserWorksheetDocument({
  sourceId: G4B_U08_P03F43_SOURCE_ID,
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [G4B_U08_P03F43_NUMBER_LINE_KP_ID, G4B_U08_P03F43_BOUNDS_KP_ID],
  selectedPatternGroupIds: [G4B_U08_P03F43_NUMBER_LINE_GROUP_ID, G4B_U08_P03F43_BOUNDS_GROUP_ID],
  patternSpecIds: P03F43_SPEC_IDS,
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f43-product-acceptance",
  includeAnswerKey: true,
  ordering: "groupedByPattern",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F43_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }).replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g4b-u08-rank10-q043.html");
const pdfPath = path.join(OUTPUT, "g4b-u08-rank10-q043.pdf");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];
let pageMetrics = [];
let representationMetrics = { count: 0, overflowCount: 0 };
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil: "networkidle" });
  representationMetrics = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[data-representation="fraction-number-line"]')];
    return {
      count: nodes.length,
      overflowCount: nodes.filter((node) => {
        const svg = node.querySelector("svg");
        if (!svg) return true;
        const parent = node.getBoundingClientRect();
        const child = svg.getBoundingClientRect();
        return child.width > parent.width + 1 || child.height > parent.height + 1;
      }).length,
    };
  });
  const pages = page.locator(".worksheet-page");
  for (let index = 0; index < await pages.count(); index += 1) await pages.nth(index).screenshot({ path: path.join(OUTPUT, `q043-page-${String(index + 1).padStart(2, "0")}.png`) });
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
} finally {
  await browser.close();
}

const questions = document.generatedQuestions;
const answers = document.answerKeyItems;
const registry = getCurrentPixelRegistrySnapshot();
const source = registry.bySourceId[G4B_U08_P03F43_SOURCE_ID];
const coordinateQuestions = questions.filter((question) => question.patternSpecId === G4B_U08_P03F43_COORDINATE_SPEC_ID);
const distanceQuestions = questions.filter((question) => question.patternSpecId === G4B_U08_P03F43_DISTANCE_SPEC_ID);
const boundsQuestions = questions.filter((question) => question.patternSpecId === G4B_U08_P03F43_BOUNDS_SPEC_ID);
const crossLayerMismatchCount = questions.filter((question, index) => !answers[index] || answers[index].questionId !== question.id || answers[index].answerText !== question.answerText || document.questionDisplayModels[index]?.promptText !== question.blankedDisplayText).length;
const coordinateAnswerMismatchCount = coordinateQuestions.filter((question) => {
  const rawN = question.originNumerator * question.unitStepDenominator + question.stepCount * question.unitStepNumerator * question.originDenominator;
  const rawD = question.originDenominator * question.unitStepDenominator;
  const expected = normalize(rawN, rawD);
  return !sameRational(question.coordinateNumerator, question.coordinateDenominator, expected.numerator, expected.denominator);
}).length;
const distanceAnswerMismatchCount = distanceQuestions.filter((question) => {
  const rawN = Math.abs(question.rightCoordinateNumerator * question.leftCoordinateDenominator - question.leftCoordinateNumerator * question.rightCoordinateDenominator);
  const rawD = question.leftCoordinateDenominator * question.rightCoordinateDenominator;
  const expected = normalize(rawN, rawD);
  return !sameRational(question.distanceNumerator, question.distanceDenominator, expected.numerator, expected.denominator);
}).length;
const boundsAnswerMismatchCount = boundsQuestions.filter((question) => {
  const expected = [];
  for (let candidate = question.lowerBoundNumerator + 1; candidate < question.upperBoundNumerator; candidate += 1) expected.push(candidate);
  return JSON.stringify(expected) !== JSON.stringify(question.possibleValues) || question.answerText !== expected.join("、");
}).length;
const applicationLeakFindingCount = questions.filter((question) => question.questionMode !== "numeric" || question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null).length;
const arithmeticLeakFindingCount = questions.filter((question) => question.metadata?.requiredCapabilityIds?.includes("cap_fraction_arithmetic")).length;
const duplicateProblemFindingCount = questions.length - new Set(questions.map((question) => `${question.patternSpecId}|${question.blankedDisplayText}`)).size;
const observedKps = [...new Set(questions.map((question) => question.metadata?.knowledgePointId))];
const observedSpecs = [...new Set(questions.map((question) => question.patternSpecId))];
const report = {
  schemaName: "P03FSlice043ProductAcceptanceV1",
  taskId: "P03F_W3DirectProductVerticalSlice043Implementation",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G4B_U08_P03F43_SOURCE_ID,
  publicSourceCount: registry.sourceCount,
  visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
  sourceVisibleKnowledgePointCount: source?.visibleKnowledgePoints?.length ?? 0,
  sourceHiddenKnowledgePointCount: source?.hiddenPendingCount ?? 0,
  sourceNotSelectableKnowledgePointCount: source?.notSelectableCount ?? 0,
  totalQuestionCount: questions.length,
  totalAnswerKeyItemCount: answers.length,
  coordinateQuestionCount: coordinateQuestions.length,
  distanceQuestionCount: distanceQuestions.length,
  fractionNumberLineQuestionCount: coordinateQuestions.length + distanceQuestions.length,
  mixedFractionBoundsQuestionCount: boundsQuestions.length,
  questionPageCount: document.questionPages.length,
  answerPageCount: document.answerKeyPages.length,
  totalPhysicalPdfPageCount: physicalPages(pdfPath),
  screenshotCount: pageMetrics.length,
  representationCount: representationMetrics.count,
  representationOverflowFindingCount: representationMetrics.overflowCount,
  observedKnowledgePointIds: observedKps,
  observedPatternSpecIds: observedSpecs,
  crossLayerMismatchCount,
  coordinateAnswerMismatchCount,
  distanceAnswerMismatchCount,
  boundsAnswerMismatchCount,
  applicationLeakFindingCount,
  arithmeticLeakFindingCount,
  duplicateProblemFindingCount,
  overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
  sharedPagination: document.metadata?.worksheetAdapter?.sharedPagination === true,
  sharedRenderer: document.metadata?.worksheetAdapter?.sharedRenderer === true,
  parallelPipeline: document.metadata?.worksheetAdapter?.parallelPipeline === true,
  applicationExpansion: document.metadata?.applicationExpansion === true,
  fractionArithmeticExpansion: document.metadata?.fractionArithmeticExpansion === true,
  slice044Expansion: document.metadata?.slice044Expansion === true,
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  pdfByteLength: fs.statSync(pdfPath).size,
  pageMetrics,
  visualReview: { status: "PENDING", allPagesReviewed: false },
};
const pass = report.publicSourceCount === 33
  && report.visibleKnowledgePointCount === 243
  && report.sourceVisibleKnowledgePointCount === 7
  && report.sourceHiddenKnowledgePointCount === 0
  && report.sourceNotSelectableKnowledgePointCount === 0
  && report.totalQuestionCount === 24
  && report.totalAnswerKeyItemCount === 24
  && report.coordinateQuestionCount === 8
  && report.distanceQuestionCount === 8
  && report.fractionNumberLineQuestionCount === 16
  && report.mixedFractionBoundsQuestionCount === 8
  && report.questionPageCount === 3
  && report.answerPageCount === 3
  && report.totalPhysicalPdfPageCount === 6
  && report.screenshotCount === 6
  && report.representationCount === 32
  && new Set(report.observedKnowledgePointIds).size === 2
  && report.observedKnowledgePointIds.includes(G4B_U08_P03F43_NUMBER_LINE_KP_ID)
  && report.observedKnowledgePointIds.includes(G4B_U08_P03F43_BOUNDS_KP_ID)
  && new Set(report.observedPatternSpecIds).size === 3
  && P03F43_SPEC_IDS.every((id) => report.observedPatternSpecIds.includes(id))
  && report.crossLayerMismatchCount === 0
  && report.coordinateAnswerMismatchCount === 0
  && report.distanceAnswerMismatchCount === 0
  && report.boundsAnswerMismatchCount === 0
  && report.applicationLeakFindingCount === 0
  && report.arithmeticLeakFindingCount === 0
  && report.duplicateProblemFindingCount === 0
  && report.representationOverflowFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.sharedPagination
  && report.sharedRenderer
  && !report.parallelPipeline
  && !report.applicationExpansion
  && !report.fractionArithmeticExpansion
  && !report.slice044Expansion;
if (!pass) throw new Error(`P03F43_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT, "p03f-slice043-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F43_ACCEPTANCE=${JSON.stringify(report)}`);
