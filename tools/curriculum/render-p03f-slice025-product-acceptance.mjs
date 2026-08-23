import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59j-r1-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID } from "../../site/modules/curriculum/registry/g4a-u06-fraction-type-classification-selector-projection.js";
import {
  G4A_U06_P03F25_GROUP_ID,
  G4A_U06_P03F25_KP_ID,
  G4A_U06_P03F25_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice025-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8")
  .replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g, (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
const expectedAnswer = (question) => {
  if (question.conversionDirection === "improper_to_mixed_or_integer") {
    return question.remainder === 0 ? `${question.whole}` : `${question.whole} ${question.remainder}/${question.denominator}`;
  }
  return `${question.improperNumerator}/${question.denominator}`;
};

const result = buildBatchABrowserWorksheetDocument({
  sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G4A_U06_P03F25_KP_ID],
  selectedPatternGroupIds: [G4A_U06_P03F25_GROUP_ID],
  patternSpecIds: [...G4A_U06_P03F25_PATTERN_SPEC_IDS],
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f25-acceptance",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F25_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" })
  .replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "improper-mixed-integer-conversion-numeric.html");
const pdfPath = path.join(OUTPUT, "improper-mixed-integer-conversion-numeric.pdf");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({
  headless: true,
  ...(process.env.P03F25_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.P03F25_CHROMIUM_EXECUTABLE_PATH } : {}),
});
const consoleErrors = [];
const pageErrors = [];
let pageMetrics = [];
let fractionLayoutMetrics = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(html, { waitUntil: "networkidle" });
  fractionLayoutMetrics = await page.$eval(".math-fraction", (nodes) => nodes.map((node, index) => {
    const numerator = node.querySelector(".math-fraction__numerator");
    const denominator = node.querySelector(".math-fraction__denominator");
    const numeratorRect = numerator?.getBoundingClientRect();
    const denominatorRect = denominator?.getBoundingClientRect();
    const numeratorStyle = numerator ? getComputedStyle(numerator) : null;
    const lineWidth = Number.parseFloat(numeratorStyle?.borderBottomWidth ?? "0");
    return {
      index,
      stacked: Boolean(numeratorRect && denominatorRect && numeratorRect.bottom <= denominatorRect.top + 1),
      horizontalLine: numeratorStyle?.borderBottomStyle === "solid" && lineWidth >= 1,
    };
  }));
  const pages = page.locator(".worksheet-page");
  for (let index = 0; index < await pages.count(); index += 1) {
    await pages.nth(index).screenshot({ path: path.join(OUTPUT, `conversion-page-${String(index + 1).padStart(2, "0")}.png`) });
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

const questions = result.generation.questions;
const patternSpecWitnessCounts = Object.fromEntries(G4A_U06_P03F25_PATTERN_SPEC_IDS.map((patternSpecId) => [
  patternSpecId,
  questions.filter((question) => question.patternSpecId === patternSpecId).length,
]));
const improperRows = questions.filter((question) => question.conversionDirection === "improper_to_mixed_or_integer");
const semanticScopeFindingCount = questions.filter((question) => {
  const capabilities = question.metadata?.requiredCapabilityIds ?? [];
  return question.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID
    || question.questionMode !== "numeric"
    || question.metadata?.knowledgePointId !== G4A_U06_P03F25_KP_ID
    || question.metadata?.patternGroupId !== G4A_U06_P03F25_GROUP_ID
    || question.metadata?.productAdmissionTask !== "P03F_W3DirectProductVerticalSlice025Implementation"
    || question.globalContextProduction !== null
    || question.metadata?.globalContextAuthorityPath !== null
    || !capabilities.includes("cap_fraction_domain_validator")
    || !capabilities.includes("cap_fraction_number_system")
    || capabilities.includes("cap_fraction_arithmetic")
    || question.improperNumerator !== question.whole * question.denominator + question.remainder
    || question.remainder < 0
    || question.remainder >= question.denominator
    || question.answerText !== expectedAnswer(question)
    || question.finalAnswer !== expectedAnswer(question)
    || (question.conversionDirection === "mixed_to_improper_fraction" && question.remainder === 0)
    || (question.conversionDirection === "integer_to_improper_fraction" && question.remainder !== 0);
}).length;

const report = {
  schemaName: "P03FSlice025ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice025ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  caseCount: 1,
  totalQuestionCount: questions.length,
  totalAnswerKeyItemCount: document.answerKeyItems.length,
  totalPhysicalPdfPageCount: physicalPages(pdfPath),
  screenshotCount: pageMetrics.length,
  screenshotMedia: "screen",
  pdfMedia: "print",
  observedPatternSpecIds: [...new Set(questions.map((question) => question.patternSpecId))].sort(),
  expectedPatternSpecIds: [...G4A_U06_P03F25_PATTERN_SPEC_IDS].sort(),
  patternSpecWitnessCounts,
  improperToIntegerWitnessCount: improperRows.filter((question) => question.remainder === 0).length,
  improperToMixedWitnessCount: improperRows.filter((question) => question.remainder > 0).length,
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  pdfByteLength: fs.statSync(pdfPath).size,
  duplicatePromptFindingCount: questions.length - new Set(questions.map((question) => question.blankedDisplayText)).size,
  overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
  semanticScopeFindingCount,
  structuredFractionCount: fractionLayoutMetrics.length,
  fractionLayoutFindingCount: fractionLayoutMetrics.filter((row) => !row.stacked || !row.horizontalLine).length,
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
  && Object.values(patternSpecWitnessCounts).every((count) => count === 8)
  && JSON.stringify(report.observedPatternSpecIds) === JSON.stringify(report.expectedPatternSpecIds)
  && report.improperToIntegerWitnessCount > 0
  && report.improperToMixedWitnessCount > 0
  && report.duplicatePromptFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.semanticScopeFindingCount === 0
  && report.structuredFractionCount > 0
  && report.fractionLayoutFindingCount === 0;
if (!automatedPass) throw new Error(`P03F25_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT, "p03f-slice025-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F25_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
