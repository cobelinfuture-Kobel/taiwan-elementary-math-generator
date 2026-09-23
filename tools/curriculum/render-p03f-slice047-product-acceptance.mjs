import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G6B_U01_P03F47_GROUP_ID,
  G6B_U01_P03F47_KP_ID,
  G6B_U01_P03F47_SOURCE_ID,
  G6B_U01_P03F47_SPEC_ID,
  P03F47_HIDDEN_SIBLING_KP_IDS,
  P03F47_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g6b-u01-rank10-mixed-decimal-fraction-add-sub-selector-projection-p03f47.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice047-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });

const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8").replace(
  /url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,
  (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`,
);
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const physicalPages = (file) => (fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

function gcd(a, b) {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }
  return x || 1n;
}

function reduce(numerator, denominator) {
  if (denominator <= 0n) throw new Error("P03F47_REFERENCE_DENOMINATOR_INVALID");
  const sign = denominator < 0n ? -1n : 1n;
  const n = numerator * sign;
  const d = denominator * sign;
  const divisor = gcd(n, d);
  return { numerator: n / divisor, denominator: d / divisor };
}

function decimalRational(text) {
  const raw = String(text);
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole = "0", fraction = ""] = unsigned.split(".");
  const denominator = 10n ** BigInt(fraction.length);
  const digits = `${whole}${fraction}` || "0";
  const numerator = BigInt(digits) * (negative ? -1n : 1n);
  return reduce(numerator, denominator);
}

function fractionRational(question) {
  return reduce(BigInt(question.fractionNumerator), BigInt(question.fractionDenominator));
}

function exactExpected(question) {
  const decimal = decimalRational(question.decimal);
  const fraction = fractionRational(question);
  const left = question.decimalLeft ? decimal : fraction;
  const right = question.decimalLeft ? fraction : decimal;
  const denominator = left.denominator * right.denominator;
  const numerator = question.action === "ADD"
    ? left.numerator * right.denominator + right.numerator * left.denominator
    : left.numerator * right.denominator - right.numerator * left.denominator;
  if (numerator < 0n) throw new Error("P03F47_REFERENCE_NEGATIVE_SUBTRACTION");
  return reduce(numerator, denominator);
}

function fractionText(numerator, denominator) {
  if (denominator === 1n) return String(numerator);
  if (numerator > denominator) {
    const whole = numerator / denominator;
    const remainder = numerator % denominator;
    return remainder === 0n ? String(whole) : `${whole} ${remainder}/${denominator}`;
  }
  return `${numerator}/${denominator}`;
}

const result = buildBatchABrowserWorksheetDocument({
  sourceId: G6B_U01_P03F47_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G6B_U01_P03F47_KP_ID],
  selectedPatternGroupIds: [G6B_U01_P03F47_GROUP_ID],
  patternSpecIds: [G6B_U01_P03F47_SPEC_ID],
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f47-source-witness-product-acceptance",
  includeAnswerKey: true,
  ordering: "groupedByPattern",
  printLayout: {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
  },
});

if (!result.ok || !result.worksheetDocument) {
  throw new Error(`P03F47_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
}

const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }).replace(
  "</head>",
  `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`,
);
const htmlPath = path.join(OUTPUT, "g6b-u01-rank10-q047.html");
const pdfPath = path.join(OUTPUT, "g6b-u01-rank10-q047.pdf");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];
let pageMetrics = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil: "networkidle" });
  const pages = page.locator(".worksheet-page");
  const pageCount = await pages.count();
  for (let index = 0; index < pageCount; index += 1) {
    await pages.nth(index).screenshot({
      path: path.join(OUTPUT, `q047-page-${String(index + 1).padStart(2, "0")}.png`),
    });
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
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
} finally {
  await browser.close();
}

const questions = document.generatedQuestions;
const answers = document.answerKeyItems;
const registry = getCurrentPixelRegistrySnapshot();
const source = registry.bySourceId[G6B_U01_P03F47_SOURCE_ID];
const adapter = document.metadata?.worksheetAdapter ?? {};

const crossLayerMismatchCount = questions.filter((question, index) => (
  !answers[index]
  || answers[index].questionId !== question.id
  || answers[index].answerText !== question.answerText
  || document.questionDisplayModels[index]?.promptText !== question.blankedDisplayText
)).length;

const exactAnswerMismatchCount = questions.filter((question) => {
  try {
    const expected = exactExpected(question);
    const expectedText = fractionText(expected.numerator, expected.denominator);
    return BigInt(question.resultNumerator) !== expected.numerator
      || BigInt(question.resultDenominator) !== expected.denominator
      || BigInt(question.finalAnswer?.numerator) !== expected.numerator
      || BigInt(question.finalAnswer?.denominator) !== expected.denominator
      || question.answerText !== expectedText
      || question.finalAnswer?.canonicalText !== expectedText
      || question.finalAnswer?.exact !== true;
  } catch {
    return true;
  }
}).length;

const semanticScopeFindingCount = questions.filter((question) => (
  question.sourceId !== G6B_U01_P03F47_SOURCE_ID
  || question.metadata?.sourceId !== G6B_U01_P03F47_SOURCE_ID
  || question.metadata?.knowledgePointId !== G6B_U01_P03F47_KP_ID
  || question.metadata?.patternGroupId !== G6B_U01_P03F47_GROUP_ID
  || question.patternSpecId !== G6B_U01_P03F47_SPEC_ID
  || question.metadata?.productAdmissionTask !== "P03F_W3DirectProductVerticalSlice047Implementation"
  || question.questionMode !== "numeric"
  || question.leftDomain === question.rightDomain
)).length;

const capabilityMismatchFindingCount = questions.filter((question) => (
  JSON.stringify(question.metadata?.requiredCapabilityIds ?? []) !== JSON.stringify(P03F47_REQUIRED_CAPABILITY_IDS)
)).length;

const futureScopeLeakFindingCount = questions.filter((question) => (
  question.globalContextProduction != null
  || question.metadata?.contextAuthority != null
  || question.metadata?.globalContextProduction != null
  || !["ADD", "SUBTRACT"].includes(question.action)
)).length;

const operationCounts = {
  add: questions.filter((question) => question.action === "ADD").length,
  subtract: questions.filter((question) => question.action === "SUBTRACT").length,
};
const duplicatePromptFindingCount = questions.length - new Set(questions.map((question) => question.blankedDisplayText)).size;
const sourceWitness = questions.some((question) => (
  question.promptText === "1.8 + 1 3/4 = ?"
  && question.answerText === "3 11/20"
  && question.action === "ADD"
  && question.metadata?.sourceWitness === true
  && question.metadata?.sourceAuthorityMode === "R02_DIRECT_SOURCE_ARITHMETIC"
  && question.metadata?.directSourcePromptVerbatim === false
));
const visibleIds = new Set((source?.visibleKnowledgePoints ?? []).map((row) => row.knowledgePointId ?? row.id));
const hiddenSiblingVisibleLeakCount = P03F47_HIDDEN_SIBLING_KP_IDS.filter((id) => visibleIds.has(id)).length;

const report = {
  schemaName: "P03FSlice047ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice047ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G6B_U01_P03F47_SOURCE_ID,
  publicSourceCount: registry.sourceCount,
  visibleKnowledgePointCount: registry.visibleKnowledgePointCount,
  sourceVisibleKnowledgePointCount: source?.visibleKnowledgePoints?.length ?? 0,
  sourceHiddenKnowledgePointCount: source?.hiddenPendingCount ?? 0,
  sourceNotSelectableKnowledgePointCount: source?.notSelectableCount ?? 0,
  hiddenSiblingVisibleLeakCount,
  totalQuestionCount: questions.length,
  totalAnswerKeyItemCount: answers.length,
  questionPageCount: document.questionPages.length,
  answerPageCount: document.answerKeyPages.length,
  totalPhysicalPdfPageCount: physicalPages(pdfPath),
  screenshotCount: pageMetrics.length,
  observedKnowledgePointIds: [...new Set(questions.map((question) => question.metadata?.knowledgePointId))],
  observedPatternGroupIds: [...new Set(questions.map((question) => question.metadata?.patternGroupId))],
  observedPatternSpecIds: [...new Set(questions.map((question) => question.patternSpecId))],
  operationCounts,
  sourceWitness,
  crossLayerMismatchCount,
  exactAnswerMismatchCount,
  semanticScopeFindingCount,
  capabilityMismatchFindingCount,
  futureScopeLeakFindingCount,
  duplicatePromptFindingCount,
  overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
  sharedP03F32MixedDomainNormalizer: adapter.sharedP03F32MixedDomainNormalizer === true,
  sharedDecimalArithmetic: adapter.sharedDecimalArithmetic === true,
  sharedFractionArithmetic: adapter.sharedFractionArithmetic === true,
  sharedNumericRendererAdapter: adapter.sharedNumericRendererAdapter === true,
  sharedPagination: adapter.sharedPagination === true,
  sharedRenderer: adapter.sharedRenderer === true,
  parallelPipeline: adapter.parallelPipeline === true,
  applicationExpansion: document.metadata?.applicationExpansion === true,
  globalContextExpansion: document.metadata?.globalContextExpansion === true,
  multiplicationDivisionExpansion: document.metadata?.multiplicationDivisionExpansion === true,
  mixedExpressionExpansion: document.metadata?.mixedExpressionExpansion === true,
  slice048Expansion: document.metadata?.slice048Expansion === true,
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  pdfByteLength: fs.statSync(pdfPath).size,
  pageMetrics,
  visualReview: { status: "PENDING", allPagesReviewed: false },
};

const pass = report.publicSourceCount === 33
  && report.visibleKnowledgePointCount === 248
  && report.sourceVisibleKnowledgePointCount === 3
  && report.sourceHiddenKnowledgePointCount === 2
  && report.sourceNotSelectableKnowledgePointCount === 2
  && report.hiddenSiblingVisibleLeakCount === 0
  && report.totalQuestionCount === 24
  && report.totalAnswerKeyItemCount === 24
  && report.questionPageCount === 3
  && report.answerPageCount === 3
  && report.totalPhysicalPdfPageCount === 6
  && report.screenshotCount === 6
  && report.observedKnowledgePointIds.length === 1
  && report.observedKnowledgePointIds[0] === G6B_U01_P03F47_KP_ID
  && report.observedPatternGroupIds.length === 1
  && report.observedPatternGroupIds[0] === G6B_U01_P03F47_GROUP_ID
  && report.observedPatternSpecIds.length === 1
  && report.observedPatternSpecIds[0] === G6B_U01_P03F47_SPEC_ID
  && report.operationCounts.add === 12
  && report.operationCounts.subtract === 12
  && report.sourceWitness === true
  && report.crossLayerMismatchCount === 0
  && report.exactAnswerMismatchCount === 0
  && report.semanticScopeFindingCount === 0
  && report.capabilityMismatchFindingCount === 0
  && report.futureScopeLeakFindingCount === 0
  && report.duplicatePromptFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.sharedP03F32MixedDomainNormalizer
  && report.sharedDecimalArithmetic
  && report.sharedFractionArithmetic
  && report.sharedNumericRendererAdapter
  && report.sharedPagination
  && report.sharedRenderer
  && !report.parallelPipeline
  && !report.applicationExpansion
  && !report.globalContextExpansion
  && !report.multiplicationDivisionExpansion
  && !report.mixedExpressionExpansion
  && !report.slice048Expansion;

fs.writeFileSync(
  path.join(OUTPUT, "p03f-slice047-product-acceptance-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

if (!pass) throw new Error(`P03F47_CHROMIUM_FAILED:${JSON.stringify(report)}`);
console.log(`P03F47_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
