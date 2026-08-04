import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  G5A_U04_SOURCE_ID, G5A_U04_SLICE022_KP_IDS,
  G5A_U04_COMMON_DENOMINATOR_GROUP_ID, G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID,
  G5A_U04_SLICE022_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u04-rank7-fraction-selector-projection.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice022-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });
const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8").replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g, (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;

const result = buildBatchABrowserWorksheetDocument({
  sourceId: G5A_U04_SOURCE_ID, selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: G5A_U04_SLICE022_KP_IDS,
  selectedPatternGroupIds: [G5A_U04_COMMON_DENOMINATOR_GROUP_ID, G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID],
  questionMode: "numeric", questionCount: 24, generationSeed: "p03f22-acceptance", includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});
if (!result.ok || !result.worksheetDocument) throw new Error(`P03F22_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document = result.worksheetDocument;
const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" })
  .replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath = path.join(OUTPUT, "common-denominator-reduction-numeric.html");
const pdfPath = path.join(OUTPUT, "common-denominator-reduction-numeric.pdf");
fs.writeFileSync(htmlPath, html);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.P03F22_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.P03F22_CHROMIUM_EXECUTABLE_PATH } : {}),
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
    await pages.nth(index).screenshot({ path: path.join(OUTPUT, `common-denominator-reduction-page-${String(index + 1).padStart(2, "0")}.png`) });
  }
  await page.emulateMedia({ media: "print" });
  pageMetrics = await page.$$eval(".worksheet-page", (nodes) => nodes.map((node, index) => ({
    index, clientHeight: node.clientHeight, scrollHeight: node.scrollHeight, clientWidth: node.clientWidth, scrollWidth: node.scrollWidth,
    overflowY: node.scrollHeight > node.clientHeight + 1, overflowX: node.scrollWidth > node.clientWidth + 1,
  })));
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  await page.close();
} finally { await browser.close(); }

const questions = result.generation.questions;
const patternSpecWitnessCounts = Object.fromEntries(G5A_U04_SLICE022_PATTERN_SPEC_IDS.map((patternSpecId) => [patternSpecId, questions.filter((question) => question.patternSpecId === patternSpecId).length]));
const report = {
  schemaName: "P03FSlice022ChromiumProductAcceptanceReportV1", taskId: "P03F_W3DirectProductVerticalSlice022ChromiumAcceptance",
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW", sourceId: G5A_U04_SOURCE_ID, caseCount: 1,
  totalQuestionCount: questions.length, totalAnswerKeyItemCount: document.answerKeyItems.length,
  totalPhysicalPdfPageCount: physicalPages(pdfPath), screenshotCount: pageMetrics.length, screenshotMedia: "screen", pdfMedia: "print",
  observedPatternSpecIds: [...new Set(questions.map((question) => question.patternSpecId))].sort(), expectedPatternSpecIds: [...G5A_U04_SLICE022_PATTERN_SPEC_IDS].sort(),
  patternSpecWitnessCounts, htmlSha256: sha256(htmlPath), pdfSha256: sha256(pdfPath), pdfByteLength: fs.statSync(pdfPath).size,
  duplicatePromptFindingCount: questions.length - new Set(questions.map((question) => question.blankedDisplayText)).size,
  overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
  consoleErrorCount: consoleErrors.length, pageErrorCount: pageErrors.length,
  semanticScopeFindingCount: questions.filter((question) => question.sourceId !== G5A_U04_SOURCE_ID || question.questionMode !== "numeric" || question.finalAnswer?.exact !== true || question.metadata?.contextAuthority !== null || question.metadata?.productAdmissionTask !== "P03F_W3DirectProductVerticalSlice022Implementation").length,
  pageMetrics, visualReview: { status: "PENDING", allPagesReviewed: false, clippedTextFindingCount: null, overlapFindingCount: null, brokenGlyphFindingCount: null },
};
const automatedPass = report.totalQuestionCount === 24 && report.totalAnswerKeyItemCount === 24
  && report.totalPhysicalPdfPageCount === document.questionPages.length + document.answerKeyPages.length
  && report.screenshotCount === report.totalPhysicalPdfPageCount
  && Object.values(patternSpecWitnessCounts).every((count) => count === 4)
  && JSON.stringify(report.observedPatternSpecIds) === JSON.stringify(report.expectedPatternSpecIds)
  && report.duplicatePromptFindingCount === 0 && report.overflowFindingCount === 0
  && report.consoleErrorCount === 0 && report.pageErrorCount === 0 && report.semanticScopeFindingCount === 0;
if (!automatedPass) throw new Error(`P03F22_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT, "p03f-slice022-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F22_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
