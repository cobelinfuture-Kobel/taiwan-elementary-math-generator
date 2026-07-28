
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeP03FSlice006ProductAdmission } from "../../src/curriculum/full-product/p03f-slice006-product-admission.mjs";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice006-product-acceptance"); fs.mkdirSync(OUTPUT, { recursive: true });
const e = materializeP03FSlice006ProductAdmission();
if (!e.predecessorPassed) throw new Error("P03F6_PREDECESSOR_NOT_D0");
function pages(file) { return (fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length; }
const browser = await chromium.launch({ headless: true });
const reports = {};
try {
  for (const mode of ["numeric", "application"]) {
    const m = e.modes[mode]; const htmlPath = path.join(OUTPUT, `g3a-u08-same-denominator-compare-${mode}.html`); const pdfPath = path.join(OUTPUT, `g3a-u08-same-denominator-compare-${mode}.pdf`); fs.writeFileSync(htmlPath, m.html);
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } }); const consoleErrors = []; const pageErrors = [];
    page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); }); page.on("pageerror", (err) => pageErrors.push(String(err)));
    await page.setContent(m.html, { waitUntil: "networkidle" }); await page.emulateMedia({ media: "print" });
    const pageMetrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node, index) => ({ index, clientHeight: node.clientHeight, scrollHeight: node.scrollHeight, clientWidth: node.clientWidth, scrollWidth: node.scrollWidth, overflowY: node.scrollHeight > node.clientHeight + 1, overflowX: node.scrollWidth > node.clientWidth + 1, className: node.className })));
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } }); await page.close();
    reports[mode] = { htmlPath, pdfPath, questionCount: m.generation.questions.length, answerKeyItemCount: m.document.answerKeyItems.length, questionPageCount: m.document.questionPages.length, answerKeyPageCount: m.document.answerKeyPages.length, physicalPdfPageCount: pages(pdfPath), patternSpecIds: [...new Set(m.generation.questions.map((q) => q.patternSpecId))], relationCoverage: [...new Set(m.generation.questions.map((q) => q.comparison))].sort(), comparisonTargetCoverage: [...new Set(m.generation.questions.map((q) => q.comparisonTarget))].sort(), duplicatePromptFindingCount: m.generation.questions.length - new Set(m.generation.questions.map((q) => q.blankedDisplayText)).size, overflowFindingCount: pageMetrics.filter((x) => x.overflowX || x.overflowY).length, semanticScopeFindingCount: m.generation.questions.filter((q) => q.leftDenominator !== q.rightDenominator || q.leftDenominator <= 0 || !["<", "=", ">"].includes(q.comparison)).length, consoleErrorCount: consoleErrors.length, pageErrorCount: pageErrors.length, pageMetrics };
  }
} finally { await browser.close(); }
const report = { schemaName: "P03FSlice006ChromiumProductAcceptanceReportV1", taskId: e.taskId, status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW", sourceId: "g3a_u08_3a08", knowledgePointIds: ["kp_g3a_u08_same_denominator_compare"], modes: reports, totalQuestionCount: reports.numeric.questionCount + reports.application.questionCount, totalAnswerKeyItemCount: reports.numeric.answerKeyItemCount + reports.application.answerKeyItemCount, totalPhysicalPdfPageCount: reports.numeric.physicalPdfPageCount + reports.application.physicalPdfPageCount, duplicatePromptFindingCount: reports.numeric.duplicatePromptFindingCount + reports.application.duplicatePromptFindingCount, overflowFindingCount: reports.numeric.overflowFindingCount + reports.application.overflowFindingCount, semanticScopeFindingCount: reports.numeric.semanticScopeFindingCount + reports.application.semanticScopeFindingCount, visualReview: { status: "PENDING", numericReviewed: false, applicationReviewed: false, answerKeysReviewed: false, clippedTextFindingCount: null, overlapFindingCount: null, brokenGlyphFindingCount: null, semanticScopeFindingCount: null } };
fs.writeFileSync(path.join(OUTPUT, "p03f-slice006-product-acceptance-report.json"), JSON.stringify(report, null, 2) + "\n");
for (const mode of ["numeric", "application"]) { const r = reports[mode]; if (r.questionCount !== 6 || r.answerKeyItemCount !== 6 || r.questionPageCount !== 1 || r.answerKeyPageCount !== 1 || r.physicalPdfPageCount !== 2 || r.patternSpecIds.length !== 1 || JSON.stringify(r.relationCoverage) !== JSON.stringify(["<", "=", ">"].sort()) || JSON.stringify(r.comparisonTargetCoverage) !== JSON.stringify(["one", "pair"]) || r.duplicatePromptFindingCount || r.overflowFindingCount || r.semanticScopeFindingCount || r.consoleErrorCount || r.pageErrorCount) throw new Error(`P03F6_CHROMIUM_${mode.toUpperCase()}_FAILED:${JSON.stringify(r)}`); }
console.log(`P03F6_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
