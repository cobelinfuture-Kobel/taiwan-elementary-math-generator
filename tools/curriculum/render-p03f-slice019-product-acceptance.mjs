import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  G4B_U06_SLICE019_SOURCE_ID, G4B_U06_TWO_DECIMAL_KP_ID, G4B_U06_RATE_TOTAL_KP_ID,
  G4B_U06_TWO_DECIMAL_NUMERIC_GROUP_ID, G4B_U06_TWO_DECIMAL_APPLICATION_GROUP_ID,
  G4B_U06_RATE_NUMERIC_GROUP_ID, G4B_U06_RATE_APPLICATION_GROUP_ID,
  G4B_U06_SLICE019_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u06-two-decimal-rate-selector-projection.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice019-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8").replace(
  /url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,
  (_, filename) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", filename)).toString("base64")}) format('woff2')`,
);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
const cases = [
  ["two-decimal-numeric", G4B_U06_TWO_DECIMAL_KP_ID, G4B_U06_TWO_DECIMAL_NUMERIC_GROUP_ID, "numeric"],
  ["two-decimal-application", G4B_U06_TWO_DECIMAL_KP_ID, G4B_U06_TWO_DECIMAL_APPLICATION_GROUP_ID, "application"],
  ["rate-numeric", G4B_U06_RATE_TOTAL_KP_ID, G4B_U06_RATE_NUMERIC_GROUP_ID, "numeric"],
  ["rate-application", G4B_U06_RATE_TOTAL_KP_ID, G4B_U06_RATE_APPLICATION_GROUP_ID, "application"],
];

const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  for (const [caseId, knowledgePointId, patternGroupId, mode] of cases) {
    const result = buildBatchABrowserWorksheetDocument({
      sourceId: G4B_U06_SLICE019_SOURCE_ID, selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePointId], selectedPatternGroupIds: [patternGroupId],
      questionMode: mode, questionCount: 20, generationSeed: `p03f19-acceptance-${caseId}`, includeAnswerKey: true,
    });
    if (!result.ok || !result.worksheetDocument) throw new Error(`P03F19_WORKSHEET_FAILED:${caseId}:${JSON.stringify(result.errors)}`);
    const document = result.worksheetDocument;
    const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }).replace("</head>", `<style data-p03f19-cjk-font>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style data-p03f19-canonical-print-styles>${printStyles}</style></head>`);
    const htmlPath = path.join(OUTPUT, `${caseId}.html`);
    const pdfPath = path.join(OUTPUT, `${caseId}.pdf`);
    fs.writeFileSync(htmlPath, html);
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
    const consoleErrors = []; const pageErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pageMetrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node, index) => ({
      index, clientHeight: node.clientHeight, scrollHeight: node.scrollHeight, clientWidth: node.clientWidth, scrollWidth: node.scrollWidth,
      overflowY: node.scrollHeight > node.clientHeight + 1, overflowX: node.scrollWidth > node.clientWidth + 1,
    })));
    const pages = page.locator(".worksheet-page");
    for (let index = 0; index < await pages.count(); index += 1) await pages.nth(index).screenshot({ path: path.join(OUTPUT, `${caseId}-page-${String(index + 1).padStart(2, "0")}.png`) });
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    await page.close();
    const questions = result.generation.questions;
    const patternSpecWitnessCounts = Object.fromEntries([...new Set(questions.map((row) => row.patternSpecId))].map((id) => [id, questions.filter((row) => row.patternSpecId === id).length]));
    const row = {
      caseId, mode, knowledgePointId, patternGroupId, patternSpecWitnessCounts,
      questionCount: questions.length, answerKeyItemCount: document.answerKeyItems.length,
      questionPageCount: document.questionPages.length, answerKeyPageCount: document.answerKeyPages.length,
      physicalPdfPageCount: physicalPages(pdfPath), htmlSha256: sha256(htmlPath), pdfSha256: sha256(pdfPath), pdfByteLength: fs.statSync(pdfPath).size,
      duplicatePromptFindingCount: questions.length - new Set(questions.map((entry) => entry.blankedDisplayText)).size,
      overflowFindingCount: pageMetrics.filter((entry) => entry.overflowX || entry.overflowY).length,
      consoleErrorCount: consoleErrors.length, pageErrorCount: pageErrors.length,
      semanticScopeFindingCount: questions.filter((entry) => entry.sourceId !== G4B_U06_SLICE019_SOURCE_ID || entry.questionMode !== mode || entry.finalAnswer?.scale !== 2 || entry.finalAnswer?.exact !== true || entry.metadata?.productAdmissionTask !== "P03F_W3DirectProductVerticalSlice019Implementation" || (mode === "application") !== Boolean(entry.metadata?.contextAuthority)).length,
      pageMetrics,
    };
    const expectedPages = row.questionPageCount + row.answerKeyPageCount;
    if (row.questionCount !== 20 || row.answerKeyItemCount !== 20 || row.physicalPdfPageCount !== expectedPages || row.questionPageCount < 1 || row.answerKeyPageCount < 1 || row.duplicatePromptFindingCount || row.overflowFindingCount || row.consoleErrorCount || row.pageErrorCount || row.semanticScopeFindingCount) throw new Error(`P03F19_CHROMIUM_CASE_FAILED:${JSON.stringify(row)}`);
    rows.push(row);
  }
} finally { await browser.close(); }

const observedPatternSpecIds = [...new Set(rows.flatMap((row) => Object.keys(row.patternSpecWitnessCounts)))].sort();
const report = {
  schemaName: "P03FSlice019ChromiumProductAcceptanceReportV1", taskId: "P03F_W3DirectProductVerticalSlice019ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW", sourceId: G4B_U06_SLICE019_SOURCE_ID, caseCount: rows.length,
  totalQuestionCount: rows.reduce((sum, row) => sum + row.questionCount, 0), totalAnswerKeyItemCount: rows.reduce((sum, row) => sum + row.answerKeyItemCount, 0),
  totalPhysicalPdfPageCount: rows.reduce((sum, row) => sum + row.physicalPdfPageCount, 0), observedPatternSpecIds,
  expectedPatternSpecIds: [...G4B_U06_SLICE019_PATTERN_SPEC_IDS].sort(), rows,
  visualReview: { status: "PENDING", allPagesReviewed: false, clippedTextFindingCount: null, overlapFindingCount: null, brokenGlyphFindingCount: null },
};
if (rows.length !== 4 || report.totalQuestionCount !== 80 || report.totalAnswerKeyItemCount !== 80 || JSON.stringify(observedPatternSpecIds) !== JSON.stringify(report.expectedPatternSpecIds)) throw new Error(`P03F19_CHROMIUM_AGGREGATE_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT, "p03f-slice019-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F19_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
