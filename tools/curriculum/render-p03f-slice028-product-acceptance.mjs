import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59j-r1-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  G5A_U01_DECIMAL_READ_PLACE_GROUP_ID,
  G5A_U01_DECIMAL_READ_PLACE_KP_ID,
  G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,
  G5A_U01_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5a-u01-decimal-read-place-selector-projection.js";
import {
  G5A_U01_P03F28_GROUP_ID,
  G5A_U01_P03F28_KP_ID,
  G5A_U01_P03F28_SPEC_ID,
} from "../../site/modules/curriculum/registry/g5a-u01-rank8-decimal-selector-projection-p03f28.js";
import { P03F28_DECIMAL_CAPABILITY_IDS } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f28-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice028-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8")
  .replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g, (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
const expectedText = (question) => `${question.whole}.${question.digits.join("")}`;
const EXPECTED_KP_IDS = Object.freeze([G5A_U01_DECIMAL_READ_PLACE_KP_ID, G5A_U01_P03F28_KP_ID]);
const EXPECTED_GROUP_IDS = Object.freeze([G5A_U01_DECIMAL_READ_PLACE_GROUP_ID, G5A_U01_P03F28_GROUP_ID]);
const EXPECTED_SPEC_IDS = Object.freeze([G5A_U01_DECIMAL_READ_PLACE_SPEC_ID, G5A_U01_P03F28_SPEC_ID]);

const result = buildBatchABrowserWorksheetDocument({
  sourceId: G5A_U01_SOURCE_ID,
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...EXPECTED_KP_IDS],
  selectedPatternGroupIds: [...EXPECTED_GROUP_IDS],
  patternSpecIds: [...EXPECTED_SPEC_IDS],
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f28-acceptance",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F28_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" })
  .replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g5a-u01-rank8-decimal-numeric.html");
const pdfPath = path.join(OUTPUT, "g5a-u01-rank8-decimal-numeric.pdf");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({
  headless: true,
  ...(process.env.P03F28_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.P03F28_CHROMIUM_EXECUTABLE_PATH } : {}),
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
    await pages.nth(index).screenshot({ path: path.join(OUTPUT, `rank8-decimal-page-${String(index + 1).padStart(2, "0")}.png`) });
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
const patternSpecWitnessCounts = Object.fromEntries(EXPECTED_SPEC_IDS.map((patternSpecId) => [
  patternSpecId,
  questions.filter((question) => question.patternSpecId === patternSpecId).length,
]));
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
const semanticScopeFindingCount = questions.filter((question) => {
  const capabilities = question.metadata?.requiredCapabilityIds ?? [];
  const canonical = expectedText(question);
  const isCompose = question.patternSpecId === G5A_U01_P03F28_SPEC_ID;
  const expectedTask = isCompose
    ? "P03F_W3DirectProductVerticalSlice028Implementation"
    : "P03F_W3DirectProductVerticalSlice021Implementation";
  return question.sourceId !== G5A_U01_SOURCE_ID
    || question.questionMode !== "numeric"
    || !EXPECTED_KP_IDS.includes(question.metadata?.knowledgePointId)
    || !EXPECTED_GROUP_IDS.includes(question.metadata?.patternGroupId)
    || !EXPECTED_SPEC_IDS.includes(question.patternSpecId)
    || question.metadata?.productAdmissionTask !== expectedTask
    || question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE"
    || (question.globalContextProduction ?? null) !== null
    || (question.metadata?.contextAuthority ?? null) !== null
    || (question.metadata?.globalContextAuthorityPath ?? null) !== null
    || JSON.stringify(capabilities) !== JSON.stringify(P03F28_DECIMAL_CAPABILITY_IDS)
    || !Number.isInteger(question.whole)
    || question.whole < 0
    || !Array.isArray(question.digits)
    || question.digits.length < 3
    || question.digits.length > 6
    || question.digits.some((digit) => !Number.isInteger(digit) || digit < 0 || digit > 9)
    || question.answerText !== canonical
    || question.finalAnswer?.canonicalText !== canonical
    || question.finalAnswer?.coefficient !== `${question.whole}${question.digits.join("")}`
    || question.finalAnswer?.scale !== question.digits.length
    || question.finalAnswer?.exact !== true;
}).length;
const composeQuestions = questions.filter((question) => question.patternSpecId === G5A_U01_P03F28_SPEC_ID);
const internalZeroWitnessCount = composeQuestions.filter((question) => question.digits.slice(1, -1).includes(0)).length;
const trailingZeroWitnessCount = composeQuestions.filter((question) => question.digits.at(-1) === 0).length;

const report = {
  schemaName: "P03FSlice028ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice028ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G5A_U01_SOURCE_ID,
  caseCount: 1,
  totalQuestionCount: questions.length,
  totalAnswerKeyItemCount: answerKeyItems.length,
  totalPhysicalPdfPageCount: physicalPages(pdfPath),
  screenshotCount: pageMetrics.length,
  screenshotMedia: "screen",
  pdfMedia: "print",
  observedKnowledgePointIds: [...new Set(questions.map((question) => question.metadata?.knowledgePointId))].sort(),
  expectedKnowledgePointIds: [...EXPECTED_KP_IDS].sort(),
  observedPatternSpecIds: [...new Set(questions.map((question) => question.patternSpecId))].sort(),
  expectedPatternSpecIds: [...EXPECTED_SPEC_IDS].sort(),
  patternSpecWitnessCounts,
  internalZeroWitnessCount,
  trailingZeroWitnessCount,
  crossLayerMismatchCount,
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  pdfByteLength: fs.statSync(pdfPath).size,
  duplicatePromptFindingCount: questions.length - new Set(document.questionDisplayModels.map((model) => model.promptText)).size,
  overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount: consoleErrors.length,
  pageErrorCount: pageErrors.length,
  semanticScopeFindingCount,
  applicationLeakFindingCount: questions.filter((question) => question.questionMode !== "numeric" || question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE").length,
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
  && report.internalZeroWitnessCount > 0
  && report.trailingZeroWitnessCount > 0
  && report.crossLayerMismatchCount === 0
  && report.duplicatePromptFindingCount === 0
  && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0
  && report.pageErrorCount === 0
  && report.semanticScopeFindingCount === 0
  && report.applicationLeakFindingCount === 0
  && report.hiddenApplicationLineagePreserved
  && report.sharedPagination
  && report.sharedRenderer
  && report.parallelPipeline === false;
if (!automatedPass) throw new Error(`P03F28_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT, "p03f-slice028-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F28_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
