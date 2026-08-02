import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import {
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
  G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g3b-u07-same-denominator-selector-projection.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f15.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f15.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f15-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice015-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });

const SOURCE_ID = "g3b_u07_3b07";
const ALL_SPECS = [
  ...G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  ...G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
];
const OPTIONS = Object.freeze({
  sourceId: SOURCE_ID,
  selectedKnowledgePointIds: [
    G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
    G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
  ],
  questionMode: "numeric",
  questionCount: 16,
  generationSeed: "p03f15-e6-acceptance",
  includeAnswerKey: true,
});

const generation = generateBatchABrowserQuestions(OPTIONS);
if (!generation.ok) throw new Error(`P03F15_GENERATION_FAILED:${JSON.stringify(generation.errors)}`);
const validation = validateBatchABrowserQuestions(generation.questions);
if (!validation.ok) throw new Error(`P03F15_VALIDATION_FAILED:${JSON.stringify(validation.errors)}`);
const worksheet = buildBatchABrowserWorksheetDocument(OPTIONS);
if (!worksheet.ok || !worksheet.worksheetDocument) throw new Error(`P03F15_WORKSHEET_FAILED:${JSON.stringify(worksheet.errors)}`);

const document = worksheet.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
const printStylesPath = path.join(ROOT, "src/renderer/print-styles.css");
const printStyles = fs.readFileSync(printStylesPath, "utf8");
const acceptanceHtml = html.replace("</head>", `<style data-p03f15-canonical-print-styles>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "g3b-u07-same-denominator-fractions.html");
const pdfPath = path.join(OUTPUT, "g3b-u07-same-denominator-fractions.pdf");
fs.writeFileSync(htmlPath, acceptanceHtml);

const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const sha256Text = (value) => crypto.createHash("sha256").update(value).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const browser = await chromium.launch({ headless: true });
let browserFinding;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error));
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
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  browserFinding = {
    pageMetrics,
    physicalPdfPageCount: physicalPages(pdfPath),
    consoleErrors,
    pageErrors,
  };
  await page.close();
} finally {
  await browser.close();
}

const questions = generation.questions;
const promptTexts = questions.map((row) => row.blankedDisplayText ?? row.displayText ?? row.prompt ?? JSON.stringify(row));
const duplicatePromptFindingCount = promptTexts.length - new Set(promptTexts).size;
const overflowFindingCount = browserFinding.pageMetrics.filter((row) => row.overflowX || row.overflowY).length;
const semanticScopeFindingCount = questions.filter((row) => {
  const sameDenominator = row.leftDenominator === row.denominator && row.rightDenominator === row.denominator;
  const knownSpec = ALL_SPECS.includes(row.patternSpecId);
  const noApplication = row.globalContextProduction == null;
  const addSubInvariant = G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS.includes(row.patternSpecId)
    ? row.resultDenominator === row.denominator && row.metadata?.requiredCapabilityIds?.includes("cap_fraction_arithmetic")
    : true;
  const compareInvariant = G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS.includes(row.patternSpecId)
    ? !row.metadata?.requiredCapabilityIds?.includes("cap_fraction_arithmetic")
    : true;
  return !sameDenominator || !knownSpec || !noApplication || !addSubInvariant || !compareInvariant;
}).length;
const wholeOneRewriteWitnessCount = questions.filter((row) => row.wholeOneRewrite === true && row.rightNumerator === row.denominator).length;
const patternSpecIds = [...new Set(questions.map((row) => row.patternSpecId))].sort();
const expectedPatternSpecIds = [...ALL_SPECS].sort();
const questionPageCount = document.questionPages?.length ?? 0;
const answerKeyPageCount = document.answerKeyPages?.length ?? 0;
const answerKeyItemCount = document.answerKeyItems?.length ?? 0;

const report = {
  schemaName: "P03FSlice015ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice015ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: SOURCE_ID,
  knowledgePointIds: OPTIONS.selectedKnowledgePointIds,
  questionCount: questions.length,
  answerKeyItemCount,
  questionPageCount,
  answerKeyPageCount,
  physicalPdfPageCount: browserFinding.physicalPdfPageCount,
  patternSpecIds,
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  canonicalPrintStylesSha256: sha256Text(printStyles),
  duplicatePromptFindingCount,
  overflowFindingCount,
  consoleErrorCount: browserFinding.consoleErrors.length,
  pageErrorCount: browserFinding.pageErrors.length,
  semanticScopeFindingCount,
  wholeOneRewriteWitnessCount,
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
fs.writeFileSync(path.join(OUTPUT, "p03f-slice015-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);

const expectedPhysicalPages = questionPageCount + answerKeyPageCount;
if (report.questionCount !== 16
  || report.answerKeyItemCount !== 16
  || JSON.stringify(report.patternSpecIds) !== JSON.stringify(expectedPatternSpecIds)
  || report.physicalPdfPageCount !== expectedPhysicalPages
  || report.questionPageCount < 1
  || report.answerKeyPageCount < 1
  || report.duplicatePromptFindingCount !== 0
  || report.overflowFindingCount !== 0
  || report.consoleErrorCount !== 0
  || report.pageErrorCount !== 0
  || report.semanticScopeFindingCount !== 0
  || report.wholeOneRewriteWitnessCount < 1) {
  throw new Error(`P03F15_CHROMIUM_ACCEPTANCE_FAILED:${JSON.stringify(report)}`);
}

console.log(`P03F15_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
