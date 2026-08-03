import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import {
  G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  G4A_U09_DECIMAL_COMPOSE_KP_ID,
  G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
} from "../../site/modules/curriculum/registry/g4a-u09-decimal-compose-decompose-selector-projection.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f18.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f18.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f18-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice018-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const OPTIONS = Object.freeze({
  sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  selectedKnowledgePointIds: [G4A_U09_DECIMAL_COMPOSE_KP_ID],
  questionMode: "numeric",
  questionCount: 18,
  generationSeed: "p03f18-e6-acceptance",
  includeAnswerKey: true,
});

const generation = generateBatchABrowserQuestions(OPTIONS);
if (!generation.ok) throw new Error(`P03F18_GENERATION_FAILED:${JSON.stringify(generation.errors)}`);
const validation = validateBatchABrowserQuestions(generation.questions);
if (!validation.ok) throw new Error(`P03F18_VALIDATION_FAILED:${JSON.stringify(validation.errors)}`);
const worksheet = buildBatchABrowserWorksheetDocument(OPTIONS);
if (!worksheet.ok || !worksheet.worksheetDocument) throw new Error(`P03F18_WORKSHEET_FAILED:${JSON.stringify(worksheet.errors)}`);
const document = worksheet.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const acceptanceHtml = html.replace("</head>", `<style data-p03f18-canonical-print-styles>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g4a-u09-decimal-compose-decompose.html");
const pdfPath = path.join(OUTPUT, "g4a-u09-decimal-compose-decompose.pdf");
fs.writeFileSync(htmlPath, acceptanceHtml);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const browser = await chromium.launch({ headless: true });
let browserFinding;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(acceptanceHtml, { waitUntil: "networkidle" });
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
  const pages = page.locator(".worksheet-page");
  for (let index = 0; index < await pages.count(); index += 1) {
    await pages.nth(index).screenshot({ path: path.join(OUTPUT, `page-${String(index + 1).padStart(2, "0")}.png`) });
  }
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  browserFinding = { pageMetrics, physicalPdfPageCount: physicalPages(pdfPath), consoleErrors, pageErrors };
  await page.close();
} finally {
  await browser.close();
}

const questions = generation.questions;
const promptTexts = questions.map((row) => row.blankedDisplayText ?? row.displayText ?? row.promptText ?? JSON.stringify(row));
const duplicatePromptFindingCount = promptTexts.length - new Set(promptTexts).size;
const overflowFindingCount = browserFinding.pageMetrics.filter((row) => row.overflowX || row.overflowY).length;
const semanticScopeFindingCount = questions.filter((row) => {
  const expectedAnswer = `${row.whole}.${row.tenths}${row.hundredths}`;
  const expectedCoefficient = String(row.whole * 100 + row.tenths * 10 + row.hundredths);
  const decimalInvariant = Number.isInteger(row.whole) && row.whole >= 0
    && Number.isInteger(row.tenths) && row.tenths >= 0 && row.tenths <= 9
    && Number.isInteger(row.hundredths) && row.hundredths >= 0 && row.hundredths <= 9
    && row.answerText === expectedAnswer
    && row.decimalValue === expectedAnswer
    && row.finalAnswer?.coefficient === expectedCoefficient
    && row.finalAnswer?.scale === 2
    && row.finalAnswer?.canonicalText === expectedAnswer
    && row.finalAnswer?.exact === true;
  const identityInvariant = row.sourceId === G4A_U09_DECIMAL_COMPOSE_SOURCE_ID
    && row.patternSpecId === G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID
    && row.metadata?.knowledgePointId === G4A_U09_DECIMAL_COMPOSE_KP_ID
    && row.metadata?.patternId === G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID;
  const capabilityIds = row.metadata?.requiredCapabilityIds ?? [];
  const capabilityInvariant = JSON.stringify(capabilityIds) === JSON.stringify(["cap_decimal_domain_validator", "cap_decimal_number_system"])
    && !capabilityIds.includes("cap_decimal_arithmetic");
  const scopeInvariant = row.questionMode === "numeric"
    && row.metadata?.applicationClassification === "APPLICATION_NOT_APPLICABLE"
    && row.globalContextProduction == null;
  return !decimalInvariant || !identityInvariant || !capabilityInvariant || !scopeInvariant;
}).length;
const patternSpecIds = [...new Set(questions.map((row) => row.patternSpecId))].sort();
const witnessCount = questions.filter((row) => row.patternSpecId === G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID).length;
const questionPageCount = document.questionPages?.length ?? 0;
const answerKeyPageCount = document.answerKeyPages?.length ?? 0;
const answerKeyItemCount = document.answerKeyItems?.length ?? 0;
const report = {
  schemaName: "P03FSlice018ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice018ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  knowledgePointIds: OPTIONS.selectedKnowledgePointIds,
  questionCount: questions.length,
  answerKeyItemCount,
  questionPageCount,
  answerKeyPageCount,
  physicalPdfPageCount: browserFinding.physicalPdfPageCount,
  patternSpecIds,
  patternSpecWitnessCounts: { [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID]: witnessCount },
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  duplicatePromptFindingCount,
  overflowFindingCount,
  consoleErrorCount: browserFinding.consoleErrors.length,
  pageErrorCount: browserFinding.pageErrors.length,
  semanticScopeFindingCount,
  browserFinding,
  visualReview: {
    status: "PENDING",
    allPagesReviewed: false,
    physicalPageParityReviewed: false,
    clippedTextFindingCount: null,
    overlapFindingCount: null,
    brokenGlyphFindingCount: null,
    semanticScopeFindingCount: null,
  },
};
fs.writeFileSync(path.join(OUTPUT, "p03f-slice018-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
const expectedPhysicalPages = questionPageCount + answerKeyPageCount;
if (
  report.questionCount !== 18
  || report.answerKeyItemCount !== 18
  || JSON.stringify(report.patternSpecIds) !== JSON.stringify([G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID])
  || witnessCount !== 18
  || report.physicalPdfPageCount !== expectedPhysicalPages
  || report.questionPageCount < 1
  || report.answerKeyPageCount < 1
  || report.duplicatePromptFindingCount !== 0
  || report.overflowFindingCount !== 0
  || report.consoleErrorCount !== 0
  || report.pageErrorCount !== 0
  || report.semanticScopeFindingCount !== 0
) throw new Error(`P03F18_CHROMIUM_ACCEPTANCE_FAILED:${JSON.stringify(report)}`);
console.log(`P03F18_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
