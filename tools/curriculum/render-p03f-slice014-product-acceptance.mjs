import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { materializeP03FSlice014ProductAdmission } from "../../src/curriculum/full-product/p03f-slice014-product-admission.mjs";
import { validateP03FSlice014ProductAdmission } from "./validate-p03f-slice014-product-admission.mjs";
import { G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS } from "../../site/modules/curriculum/registry/g5b-u05-decimal-base10-selector-projection.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice014-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });

const evidence = materializeP03FSlice014ProductAdmission();
const preD0Validation = validateP03FSlice014ProductAdmission();
if (!preD0Validation.ok) throw new Error(`P03F14_PRE_D0_VALIDATION_FAILED:${JSON.stringify(preD0Validation.errors)}`);
if (!evidence.predecessorPassed) throw new Error("P03F14_PREDECESSOR_SLICE013_NOT_D0");
if (!evidence.worksheet?.ok || !evidence.document || !evidence.html) throw new Error("P03F14_HTML_INPUT_INVALID");
if (!evidence.planValidation?.ok || !evidence.questionValidation?.ok) throw new Error("P03F14_GENERATION_VALIDATION_INVALID");

const htmlPath = path.join(OUTPUT, "g5b-u05-decimal-base10.html");
const pdfPath = path.join(OUTPUT, "g5b-u05-decimal-base10.pdf");
const printStylesPath = path.join(ROOT, "src/renderer/print-styles.css");
const printStyles = fs.readFileSync(printStylesPath, "utf8");
const acceptanceHtml = evidence.html.replace("</head>", `<style data-p03f14-canonical-print-styles>${printStyles}</style></head>`);
fs.writeFileSync(htmlPath, acceptanceHtml);

const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const sha256Text = (value) => crypto.createHash("sha256").update(value).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
const expectedCaps = ["cap_decimal_domain_validator", "cap_decimal_number_system"];

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

const questions = evidence.generation.questions ?? [];
const prompts = questions.map((row) => row.blankedDisplayText);
const duplicatePromptFindingCount = prompts.length - new Set(prompts).size;
const overflowFindingCount = browserFinding.pageMetrics.filter((row) => row.overflowX || row.overflowY).length;
const semanticScopeFindingCount = questions.filter((row) => {
  const caps = [...(row.metadata?.requiredCapabilityIds ?? [])].sort();
  const expectedSorted = [...expectedCaps].sort();
  return row.relationBase !== 10
    || row.questionMode !== "numeric"
    || row.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE"
    || JSON.stringify(caps) !== JSON.stringify(expectedSorted)
    || !G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.includes(row.patternSpecId)
    || typeof row.crossDecimalPoint !== "boolean";
}).length;
const crossDecimalPointCoverage = {
  trueCount: questions.filter((row) => row.crossDecimalPoint === true).length,
  falseCount: questions.filter((row) => row.crossDecimalPoint === false).length,
};

const report = {
  schemaName: "P03FSlice014ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice014ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: evidence.slice.primarySourceNodeId,
  knowledgePointIds: evidence.slice.knowledgePointIds,
  questionCount: questions.length,
  answerKeyItemCount: evidence.metrics.answerKeyWitnessCount,
  questionPageCount: evidence.document.questionPages.length,
  answerKeyPageCount: evidence.document.answerKeyPages.length,
  physicalPdfPageCount: browserFinding.physicalPdfPageCount,
  patternSpecIds: [...new Set(questions.map((row) => row.patternSpecId))].sort(),
  htmlSha256: sha256(htmlPath),
  pdfSha256: sha256(pdfPath),
  canonicalPrintStylesSha256: sha256Text(printStyles),
  duplicatePromptFindingCount,
  overflowFindingCount,
  consoleErrorCount: browserFinding.consoleErrors.length,
  pageErrorCount: browserFinding.pageErrors.length,
  semanticScopeFindingCount,
  crossDecimalPointCoverage,
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
fs.writeFileSync(path.join(OUTPUT, "p03f-slice014-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);

const expectedPhysicalPages = report.questionPageCount + report.answerKeyPageCount;
if (report.questionCount !== 16
  || report.answerKeyItemCount !== 16
  || report.patternSpecIds.length !== 2
  || !G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.every((id) => report.patternSpecIds.includes(id))
  || report.physicalPdfPageCount !== expectedPhysicalPages
  || report.questionPageCount < 1
  || report.answerKeyPageCount < 1
  || report.duplicatePromptFindingCount !== 0
  || report.overflowFindingCount !== 0
  || report.consoleErrorCount !== 0
  || report.pageErrorCount !== 0
  || report.semanticScopeFindingCount !== 0
  || report.crossDecimalPointCoverage.trueCount < 1
  || report.crossDecimalPointCoverage.falseCount < 1) {
  throw new Error(`P03F14_CHROMIUM_ACCEPTANCE_FAILED:${JSON.stringify(report)}`);
}

console.log(`P03F14_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
