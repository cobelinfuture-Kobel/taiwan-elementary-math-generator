import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5A_U01_P03F44_ESTIMATE_SPEC_ID,
  G5A_U01_P03F44_MISSING_SPEC_ID,
  G5A_U01_P03F44_ROUNDED_SPEC_ID,
  G5A_U01_P03F44_SOURCE_ID,
  P03F44_GROUP_IDS,
  P03F44_HIDDEN_APPLICATION_SPEC_IDS,
  P03F44_HIDDEN_SIBLING_KP_IDS,
  P03F44_KP_IDS,
  P03F44_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u01-rank10-decimal-selector-projection-p03f44.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice044-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8").replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g, (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const physicalPages = (file) => (fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
const pow10 = (n) => 10 ** n;
const formatScaled = (scaled, decimals) => { const factor = pow10(decimals); const whole = Math.floor(scaled / factor); const fraction = String(scaled % factor).padStart(decimals, "0"); return decimals ? `${whole}.${fraction}` : `${whole}`; };
const roundScaled = (scaled, sourceDecimals, targetDecimals) => { const divisor = pow10(sourceDecimals - targetDecimals); return Math.floor((scaled + Math.floor(divisor / 2)) / divisor); };
const missingMultipliers = Object.freeze({ tenths: 100, hundredths: 10, thousandths: 1 });

const result = buildBatchABrowserWorksheetDocument({
  sourceId: G5A_U01_P03F44_SOURCE_ID,
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...P03F44_KP_IDS],
  selectedPatternGroupIds: [...P03F44_GROUP_IDS],
  patternSpecIds: [...P03F44_SPEC_IDS],
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f44-product-acceptance",
  includeAnswerKey: true,
  ordering: "groupedByPattern",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F44_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }).replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g5a-u01-rank10-q044.html");
const pdfPath = path.join(OUTPUT, "g5a-u01-rank10-q044.pdf");
fs.writeFileSync(htmlPath, html);

const consoleErrors = [];
const pageErrors = [];
let pageMetrics = [];
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil: "networkidle" });
  const pages = page.locator(".worksheet-page");
  for (let index = 0; index < await pages.count(); index += 1) await pages.nth(index).screenshot({ path: path.join(OUTPUT, `q044-page-${String(index + 1).padStart(2, "0")}.png`) });
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
const source = registry.bySourceId[G5A_U01_P03F44_SOURCE_ID];
const rounded = questions.filter((q) => q.patternSpecId === G5A_U01_P03F44_ROUNDED_SPEC_ID);
const estimates = questions.filter((q) => q.patternSpecId === G5A_U01_P03F44_ESTIMATE_SPEC_ID);
const missing = questions.filter((q) => q.patternSpecId === G5A_U01_P03F44_MISSING_SPEC_ID);
const witnessCounts = Object.fromEntries(P03F44_SPEC_IDS.map((id) => [id, questions.filter((q) => q.patternSpecId === id).length]));
const roundedTargetPlaceCounts = { oneDecimal: rounded.filter((q) => q.targetDecimals === 1).length, twoDecimals: rounded.filter((q) => q.targetDecimals === 2).length };
const estimateOperationCounts = { add: estimates.filter((q) => q.operator === "+").length, sub: estimates.filter((q) => q.operator === "-").length };
const missingPlaceCounts = Object.fromEntries(Object.keys(missingMultipliers).map((place) => [place, missing.filter((q) => q.missingPlace === place).length]));
const missingRelationCounts = { lt: missing.filter((q) => q.relation === "<").length, gt: missing.filter((q) => q.relation === ">").length };
const crossLayerMismatchCount = questions.filter((q, index) => !answers[index] || answers[index].questionId !== q.id || answers[index].answerText !== q.answerText || document.questionDisplayModels[index]?.promptText !== q.blankedDisplayText).length;
const roundedAnswerMismatchCount = rounded.filter((q) => { const expected = roundScaled(q.valueScaled, q.sourceDecimals, q.targetDecimals); return expected !== q.roundedScaled || q.answerText !== formatScaled(expected, q.targetDecimals); }).length;
const estimateAnswerMismatchCount = estimates.filter((q) => { const left = roundScaled(q.leftScaled, q.sourceDecimals, q.targetDecimals); const right = roundScaled(q.rightScaled, q.sourceDecimals, q.targetDecimals); const expected = q.operator === "+" ? left + right : left - right; return left !== q.leftRounded || right !== q.rightRounded || expected !== q.estimateScaled || q.answerText !== formatScaled(expected, q.targetDecimals); }).length;
const missingDigitAnswerMismatchCount = missing.filter((q) => { const multiplier = missingMultipliers[q.missingPlace]; const expected = Array.from({ length: 10 }, (_, digit) => digit).filter((digit) => q.relation === "<" ? q.baseScaled + digit * multiplier < q.rightScaled : q.baseScaled + digit * multiplier > q.rightScaled); return expected.length === 0 || expected.length === 10 || JSON.stringify(expected) !== JSON.stringify(q.possibleDigits) || q.answerText !== expected.join("、"); }).length;
const hiddenApplicationLeakFindingCount = questions.filter((q) => P03F44_HIDDEN_APPLICATION_SPEC_IDS.includes(q.patternSpecId)).length;
const hiddenSiblingLeakFindingCount = questions.filter((q) => P03F44_HIDDEN_SIBLING_KP_IDS.includes(q.metadata?.knowledgePointId)).length;
const applicationLeakFindingCount = questions.filter((q) => q.questionMode !== "numeric" || q.globalContextProduction != null || q.metadata?.globalContextAuthorityPath != null).length;
const decimalArithmeticCapabilityLeakFindingCount = questions.filter((q) => q.metadata?.requiredCapabilityIds?.includes("cap_decimal_arithmetic")).length;
const duplicatePromptFindingCount = questions.length - new Set(questions.map((q) => `${q.patternSpecId}|${q.blankedDisplayText}`)).size;
const report = {
  schemaName: "P03FSlice044ProductAcceptanceV1",
  taskId: "P03F_W3DirectProductVerticalSlice044Implementation",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G5A_U01_P03F44_SOURCE_ID,
  publicSourceCount: registry.sourceCount,
  visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
  sourceVisibleKnowledgePointCount: source?.visibleKnowledgePoints?.length ?? 0,
  sourceHiddenKnowledgePointCount: source?.hiddenPendingCount ?? 0,
  sourceNotSelectableKnowledgePointCount: source?.notSelectableCount ?? 0,
  totalQuestionCount: questions.length,
  totalAnswerKeyItemCount: answers.length,
  witnessCounts,
  roundedTargetPlaceCounts,
  estimateOperationCounts,
  missingPlaceCounts,
  missingRelationCounts,
  questionPageCount: document.questionPages.length,
  answerPageCount: document.answerKeyPages.length,
  totalPhysicalPdfPageCount: physicalPages(pdfPath),
  screenshotCount: pageMetrics.length,
  observedKnowledgePointIds: [...new Set(questions.map((q) => q.metadata?.knowledgePointId))],
  observedPatternSpecIds: [...new Set(questions.map((q) => q.patternSpecId))],
  crossLayerMismatchCount,
  roundedAnswerMismatchCount,
  estimateAnswerMismatchCount,
  missingDigitAnswerMismatchCount,
  hiddenApplicationLeakFindingCount,
  hiddenSiblingLeakFindingCount,
  applicationLeakFindingCount,
  decimalArithmeticCapabilityLeakFindingCount,
  duplicatePromptFindingCount,
  overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
  sharedPagination: document.metadata?.worksheetAdapter?.sharedPagination === true,
  sharedRenderer: document.metadata?.worksheetAdapter?.sharedRenderer === true,
  parallelPipeline: document.metadata?.worksheetAdapter?.parallelPipeline === true,
  applicationExpansion: document.metadata?.applicationExpansion === true,
  globalContextExpansion: document.metadata?.globalContextExpansion === true,
  decimalArithmeticCapabilityExpansion: document.metadata?.decimalArithmeticCapabilityExpansion === true,
  inverseRoundingRangeExpansion: document.metadata?.inverseRoundingRangeExpansion === true,
  slice045Expansion: document.metadata?.slice045Expansion === true,
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  pdfByteLength: fs.statSync(pdfPath).size,
  pageMetrics,
  visualReview: { status: "PENDING", allPagesReviewed: false },
};
const pass = report.publicSourceCount === 33
  && report.visibleKnowledgePointCount === 245
  && report.sourceVisibleKnowledgePointCount === 7
  && report.sourceHiddenKnowledgePointCount === 1
  && report.sourceNotSelectableKnowledgePointCount === 0
  && report.totalQuestionCount === 24
  && report.totalAnswerKeyItemCount === 24
  && P03F44_SPEC_IDS.every((id) => report.witnessCounts[id] === 8)
  && report.roundedTargetPlaceCounts.oneDecimal > 0 && report.roundedTargetPlaceCounts.twoDecimals > 0
  && report.estimateOperationCounts.add > 0 && report.estimateOperationCounts.sub > 0
  && Object.values(report.missingPlaceCounts).every((count) => count > 0)
  && report.missingRelationCounts.lt > 0 && report.missingRelationCounts.gt > 0
  && report.questionPageCount === 3 && report.answerPageCount === 3
  && report.totalPhysicalPdfPageCount === 6 && report.screenshotCount === 6
  && new Set(report.observedKnowledgePointIds).size === 2 && P03F44_KP_IDS.every((id) => report.observedKnowledgePointIds.includes(id))
  && new Set(report.observedPatternSpecIds).size === 3 && P03F44_SPEC_IDS.every((id) => report.observedPatternSpecIds.includes(id))
  && report.crossLayerMismatchCount === 0
  && report.roundedAnswerMismatchCount === 0
  && report.estimateAnswerMismatchCount === 0
  && report.missingDigitAnswerMismatchCount === 0
  && report.hiddenApplicationLeakFindingCount === 0
  && report.hiddenSiblingLeakFindingCount === 0
  && report.applicationLeakFindingCount === 0
  && report.decimalArithmeticCapabilityLeakFindingCount === 0
  && report.duplicatePromptFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.sharedPagination && report.sharedRenderer && !report.parallelPipeline
  && !report.applicationExpansion && !report.globalContextExpansion
  && !report.decimalArithmeticCapabilityExpansion && !report.inverseRoundingRangeExpansion && !report.slice045Expansion;
fs.writeFileSync(path.join(OUTPUT, "p03f-slice044-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (!pass) throw new Error(`P03F44_CHROMIUM_FAILED:${JSON.stringify(report)}`);
console.log(`P03F44_ACCEPTANCE=${JSON.stringify(report)}`);
