import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { materializeP03FSlice004ProductAdmission } from "../../src/curriculum/full-product/p03f-slice004-product-admission.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice004-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const evidence = materializeP03FSlice004ProductAdmission();
if (!evidence.predecessorPassed) throw new Error("P03F4_PREDECESSOR_NOT_D0");
if (!evidence.worksheet.ok || !evidence.document || !evidence.html) throw new Error("P03F4_HTML_INPUT_INVALID");
const htmlPath = path.join(OUTPUT, "g3b-u09-tenth-decimal.html");
const pdfPath = path.join(OUTPUT, "g3b-u09-tenth-decimal.pdf");
fs.writeFileSync(htmlPath, evidence.html);

function physicalPdfPageCount(filePath) {
  const binary = fs.readFileSync(filePath).toString("latin1");
  return (binary.match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
}
const browser = await chromium.launch({ headless: true });
let browserFinding;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(evidence.html, { waitUntil: "networkidle" });
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
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  browserFinding = { pageMetrics, physicalPdfPageCount: physicalPdfPageCount(pdfPath), consoleErrors, pageErrors };
  await page.close();
} finally {
  await browser.close();
}

const prompts = evidence.generation.questions.map((row) => row.blankedDisplayText);
const duplicatePromptFindingCount = prompts.length - new Set(prompts).size;
const overflowFindingCount = browserFinding.pageMetrics.filter((row) => row.overflowX || row.overflowY).length;
const semanticScopeFindingCount = evidence.generation.questions.filter((row) => row.answerText !== "0.1" || row.decimalValue !== "0.1" || row.whole !== 0 || row.fractionalUnits !== 1 || row.placeUnit !== "0.1" || row.questionMode !== "numeric" || /(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(row.blankedDisplayText ?? "")).length;
const report = {
  schemaName: "P03FSlice004ChromiumProductAcceptanceReportV1",
  taskId: evidence.taskId,
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: "g3b_u09_3b09",
  knowledgePointIds: evidence.slice.knowledgePointIds,
  questionCount: evidence.generation.questions.length,
  answerKeyItemCount: evidence.metrics.answerKeyWitnessCount,
  questionPageCount: evidence.document.questionPages.length,
  answerKeyPageCount: evidence.document.answerKeyPages.length,
  physicalPdfPageCount: browserFinding.physicalPdfPageCount,
  patternSpecIds: [...new Set(evidence.generation.questions.map((row) => row.patternSpecId))],
  canonicalDecimalIdentities: [...new Set(evidence.capabilityWitnesses.map((row) => row.domainCanonicalIdentity))],
  duplicatePromptFindingCount,
  overflowFindingCount,
  consoleErrorCount: browserFinding.consoleErrors.length,
  pageErrorCount: browserFinding.pageErrors.length,
  semanticScopeFindingCount,
  browserFinding,
  visualReview: {
    status: "PENDING",
    questionPageReviewed: false,
    answerKeyPageReviewed: false,
    physicalPageParityReviewed: false,
    clippedTextFindingCount: null,
    overlapFindingCount: null,
    brokenGlyphFindingCount: null,
    semanticScopeFindingCount: null
  }
};
fs.writeFileSync(path.join(OUTPUT, "p03f-slice004-product-acceptance-report.json"), JSON.stringify(report, null, 2) + "\n");
if (
  report.questionCount !== 8
  || report.answerKeyItemCount !== 8
  || report.patternSpecIds.length !== 1
  || JSON.stringify(report.canonicalDecimalIdentities) !== JSON.stringify(["1e-1"])
  || report.duplicatePromptFindingCount !== 0
  || report.physicalPdfPageCount !== report.questionPageCount + report.answerKeyPageCount
  || report.physicalPdfPageCount !== 2
  || report.overflowFindingCount !== 0
  || report.consoleErrorCount !== 0
  || report.pageErrorCount !== 0
  || report.semanticScopeFindingCount !== 0
) throw new Error(`P03F4_CHROMIUM_ACCEPTANCE_FAILED:${JSON.stringify(report)}`);
console.log(`P03F4_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
