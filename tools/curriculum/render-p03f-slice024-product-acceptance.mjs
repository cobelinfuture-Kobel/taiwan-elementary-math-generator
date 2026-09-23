import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { G3B_U07_SOURCE_ID } from "../../site/modules/curriculum/registry/g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_P03F24_KP_IDS,
  G3B_U07_P03F24_NUMERIC_SPEC_IDS,
  G3B_U07_P03F24_APPLICATION_SPEC_IDS,
  P03F24_TASK_ID,
} from "../../site/modules/curriculum/registry/g3b-u07-fraction-context-selector-projection-p03f24.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "tmp/p03f-slice024-product-acceptance");
fs.mkdirSync(OUTPUT, { recursive: true });

const printStyles = fs.readFileSync(path.join(ROOT, "src/renderer/print-styles.css"), "utf8");
const fontRoot = path.join(ROOT, "node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles = fs.readFileSync(path.join(fontRoot, "400.css"), "utf8")
  .replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,
    (_, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot, "files", file)).toString("base64")}) format('woff2')`);

const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const physicalPages = (filePath) => (fs.readFileSync(filePath).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g) ?? []).length;
const expectedKps = new Set(G3B_U07_P03F24_KP_IDS);

async function renderCase(browser, config) {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: G3B_U07_SOURCE_ID,
    patternSpecIds: [...config.patternSpecIds],
    questionMode: config.questionMode,
    questionCount: 20,
    generationSeed: config.generationSeed,
    includeAnswerKey: true,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: config.questionMode === "application" ? 4 : 5,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
  });
  if (!result.ok || !result.worksheetDocument) {
    throw new Error(`P03F24_${config.caseId.toUpperCase()}_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
  }

  const document = result.worksheetDocument;
  const questions = result.generation.questions;
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" })
    .replace("</head>", `<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
  const htmlPath = path.join(OUTPUT, `${config.caseId}.html`);
  const pdfPath = path.join(OUTPUT, `${config.caseId}.pdf`);
  fs.writeFileSync(htmlPath, html);

  const consoleErrors = [];
  const pageErrors = [];
  let pageMetrics = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  try {
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.setContent(html, { waitUntil: "networkidle" });
    const pages = page.locator(".worksheet-page");
    for (let index = 0; index < await pages.count(); index += 1) {
      await pages.nth(index).screenshot({ path: path.join(OUTPUT, `${config.caseId}-page-${String(index + 1).padStart(2, "0")}.png`) });
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
    await page.close();
  }

  const patternSpecWitnessCounts = Object.fromEntries(config.patternSpecIds.map((id) => [id, questions.filter((q) => q.patternSpecId === id).length]));
  const observedPatternSpecIds = [...new Set(questions.map((q) => q.patternSpecId))].sort();
  const expectedPatternSpecIds = [...config.patternSpecIds].sort();
  const semanticScopeFindings = questions.filter((question) => {
    if (question.questionMode !== config.questionMode) return true;
    if (!expectedKps.has(question.metadata?.knowledgePointId)) return true;
    if (question.metadata?.productAdmissionTask !== P03F24_TASK_ID) return true;
    if (config.questionMode === "numeric") {
      return question.globalContextProduction !== null || question.metadata?.bindingCandidateId !== null;
    }
    return question.globalContextProduction?.status !== "GLOBAL_CONTEXT_BOUND_EXISTING_W02_A06"
      || !question.metadata?.bindingCandidateId
      || !question.metadata?.proofCandidateId
      || !question.metadata?.fixtureId
      || !/POSTG_APP_W02_A06_PRODUCTION_EQUIVALENT_PACKAGE\.json$/.test(question.metadata?.productionPackagePath ?? "");
  });

  const report = {
    caseId: config.caseId,
    questionMode: config.questionMode,
    sourceId: G3B_U07_SOURCE_ID,
    totalQuestionCount: questions.length,
    totalAnswerKeyItemCount: document.answerKeyItems.length,
    questionPageCount: document.questionPages.length,
    answerKeyPageCount: document.answerKeyPages.length,
    totalPhysicalPdfPageCount: physicalPages(pdfPath),
    screenshotCount: pageMetrics.length,
    observedPatternSpecIds,
    expectedPatternSpecIds,
    patternSpecWitnessCounts,
    observedKnowledgePointIds: [...new Set(questions.map((q) => q.metadata?.knowledgePointId))].sort(),
    htmlSha256: sha256(htmlPath),
    pdfSha256: sha256(pdfPath),
    pdfByteLength: fs.statSync(pdfPath).size,
    duplicatePromptFindingCount: questions.length - new Set(questions.map((q) => q.blankedDisplayText)).size,
    overflowFindingCount: pageMetrics.filter((row) => row.overflowX || row.overflowY).length,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    semanticScopeFindingCount: semanticScopeFindings.length,
    pageMetrics,
    visualReview: {
      status: "PENDING",
      allPagesReviewed: false,
      clippedTextFindingCount: null,
      overlapFindingCount: null,
      brokenGlyphFindingCount: null,
    },
  };

  const automatedPass = report.totalQuestionCount === 20
    && report.totalAnswerKeyItemCount === 20
    && report.totalPhysicalPdfPageCount === report.questionPageCount + report.answerKeyPageCount
    && report.screenshotCount === report.totalPhysicalPdfPageCount
    && Object.values(patternSpecWitnessCounts).every((count) => count === 2)
    && JSON.stringify(report.observedPatternSpecIds) === JSON.stringify(report.expectedPatternSpecIds)
    && report.duplicatePromptFindingCount === 0
    && report.overflowFindingCount === 0
    && report.consoleErrorCount === 0
    && report.pageErrorCount === 0
    && report.semanticScopeFindingCount === 0;
  if (!automatedPass) throw new Error(`P03F24_${config.caseId.toUpperCase()}_CHROMIUM_FAILED:${JSON.stringify(report)}`);
  return report;
}

const browser = await chromium.launch({
  headless: true,
  ...(process.env.P03F24_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.P03F24_CHROMIUM_EXECUTABLE_PATH } : {}),
});

let caseReports;
try {
  caseReports = [
    await renderCase(browser, {
      caseId: "fraction-context-numeric",
      questionMode: "numeric",
      patternSpecIds: G3B_U07_P03F24_NUMERIC_SPEC_IDS,
      generationSeed: "p03f24-chromium-numeric",
    }),
    await renderCase(browser, {
      caseId: "fraction-context-application",
      questionMode: "application",
      patternSpecIds: G3B_U07_P03F24_APPLICATION_SPEC_IDS,
      generationSeed: "p03f24-chromium-application",
    }),
  ];
} finally {
  await browser.close();
}

const report = {
  schemaName: "P03FSlice024ChromiumProductAcceptanceReportV1",
  taskId: "P03F_W3DirectProductVerticalSlice024ChromiumAcceptance",
  implementationTaskId: P03F24_TASK_ID,
  status: "PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId: G3B_U07_SOURCE_ID,
  caseCount: caseReports.length,
  totalQuestionCount: caseReports.reduce((sum, row) => sum + row.totalQuestionCount, 0),
  totalAnswerKeyItemCount: caseReports.reduce((sum, row) => sum + row.totalAnswerKeyItemCount, 0),
  totalPhysicalPdfPageCount: caseReports.reduce((sum, row) => sum + row.totalPhysicalPdfPageCount, 0),
  screenshotCount: caseReports.reduce((sum, row) => sum + row.screenshotCount, 0),
  expectedPatternSpecCount: G3B_U07_P03F24_NUMERIC_SPEC_IDS.length + G3B_U07_P03F24_APPLICATION_SPEC_IDS.length,
  automatedFindingCount: caseReports.reduce((sum, row) => sum + row.duplicatePromptFindingCount + row.overflowFindingCount + row.consoleErrorCount + row.pageErrorCount + row.semanticScopeFindingCount, 0),
  cases: caseReports,
  visualReview: {
    status: "PENDING",
    allPagesReviewed: false,
    clippedTextFindingCount: null,
    overlapFindingCount: null,
    brokenGlyphFindingCount: null,
    answerKeyFindingCount: null,
    semanticFindingCount: null,
  },
};

if (report.caseCount !== 2 || report.totalQuestionCount !== 40 || report.totalAnswerKeyItemCount !== 40 || report.expectedPatternSpecCount !== 20 || report.automatedFindingCount !== 0) {
  throw new Error(`P03F24_AGGREGATE_CHROMIUM_FAILED:${JSON.stringify(report)}`);
}

fs.writeFileSync(path.join(OUTPUT, "p03f-slice024-product-acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P03F24_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);
