import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildG5AU02HiddenBrowserBundle,
  validateG5AU02HiddenBrowserBundle,
} from "../../src/curriculum/g5a-u02/hidden-browser-pipeline.js";

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/smoke");
const HTML_PATH = resolve(OUT_DIR, "S93_G5A_U02_HiddenWorksheet.html");
const MANIFEST_PATH = resolve(OUT_DIR, "S93_G5A_U02_HiddenWorksheet.manifest.json");
const QUESTION_COUNT = 22;
const EXPECTED_ANSWER_MODEL_COUNT = 19;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const result = buildG5AU02HiddenBrowserBundle({
  questionCount: QUESTION_COUNT,
  baseSeed: 9300,
  includeAnswerKey: true,
  questionRowsPerPage: 1,
  answerRowsPerPage: 1,
  title: "五上因數與公因數｜S93 隱藏瀏覽器驗證",
  subtitle: "22 題 canonical route 綜合驗證",
});

if (!result.ok || !result.browserBundle) {
  throw new Error(`S93 hidden browser generation failed: ${JSON.stringify(result.errors)}`);
}
const validation = validateG5AU02HiddenBrowserBundle(result.browserBundle, result);
if (!validation.ok) {
  throw new Error(`S93 hidden browser validation failed: ${JSON.stringify(validation.errors)}`);
}

const { browserBundle, worksheetDocument } = result;
const requiredProfiles = ["compact", "contextual", "reasoning"];
for (const profileId of requiredProfiles) {
  if (!browserBundle.profileIds.includes(profileId)) {
    throw new Error(`S93 profile coverage missing: ${profileId}`);
  }
}
if (browserBundle.questionCount !== QUESTION_COUNT || browserBundle.answerCount !== QUESTION_COUNT) {
  throw new Error(`S93 exact count mismatch: ${browserBundle.questionCount}/${browserBundle.answerCount}`);
}
if (browserBundle.answerModelIds.length !== EXPECTED_ANSWER_MODEL_COUNT) {
  throw new Error(`S93 answer model coverage mismatch: ${browserBundle.answerModelIds.length}/${EXPECTED_ANSWER_MODEL_COUNT}`);
}
if (browserBundle.expectedPdfPageCount !== 44) {
  throw new Error(`S93 expected PDF page count mismatch: ${browserBundle.expectedPdfPageCount}/44`);
}

const htmlContents = `${browserBundle.html}\n`;
const questionCardCount = htmlContents.split('class="g5a-u02-card g5a-u02-card--question').length - 1;
const answerCardCount = htmlContents.split('class="g5a-u02-card g5a-u02-card--answer').length - 1;
const internalIdLeaks = htmlContents.match(/\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/gi) ?? [];
const unresolvedPlaceholders = htmlContents.match(/\{\{[^{}]+\}\}/g) ?? [];
if (questionCardCount !== QUESTION_COUNT || answerCardCount !== QUESTION_COUNT) {
  throw new Error(`S93 HTML card count mismatch: ${questionCardCount}/${answerCardCount}`);
}
if (internalIdLeaks.length > 0) throw new Error(`S93 internal ID leak: ${internalIdLeaks[0]}`);
if (unresolvedPlaceholders.length > 0) {
  throw new Error(`S93 unresolved placeholder: ${unresolvedPlaceholders[0]}`);
}

const implementationClassCounts = worksheetDocument.questionRecords.reduce((counts, row) => {
  counts[row.implementationClass] = (counts[row.implementationClass] ?? 0) + 1;
  return counts;
}, {});
const modeCounts = worksheetDocument.questionRecords.reduce((counts, row) => {
  counts[row.mode] = (counts[row.mode] ?? 0) + 1;
  return counts;
}, {});

const manifest = {
  schemaName: "G5AU02HiddenWorksheetSmokeManifest",
  schemaVersion: 1,
  task: "S93_G5A_U02_HiddenBrowserPipelineAndHTMLPDFSmokeIntegration",
  status: "hidden_html_generated_pdf_pending",
  unitId: "g5a_u02",
  selectorStatus: browserBundle.lifecycle.selectorStatus,
  browserPipelineStatus: browserBundle.lifecycle.browserPipelineStatus,
  htmlPdfSmokeStatus: browserBundle.lifecycle.htmlPdfSmokeStatus,
  productionUse: browserBundle.lifecycle.productionUse,
  questionCount: browserBundle.questionCount,
  answerCount: browserBundle.answerCount,
  questionPageCount: browserBundle.questionPageCount,
  answerPageCount: browserBundle.answerPageCount,
  expectedPdfPageCount: browserBundle.expectedPdfPageCount,
  actualPdfPageCount: null,
  patternSpecCount: worksheetDocument.allocation.selectedPatternCount,
  answerModelShapeCount: browserBundle.answerModelIds.length,
  rendererProfileCount: browserBundle.profileIds.length,
  rendererProfileIds: browserBundle.profileIds,
  answerModelIds: browserBundle.answerModelIds,
  implementationClassCounts,
  modeCounts,
  htmlQuestionCardCount: questionCardCount,
  htmlAnswerCardCount: answerCardCount,
  internalIdLeakCount: internalIdLeaks.length,
  unresolvedPlaceholderCount: unresolvedPlaceholders.length,
  domOverflowCount: null,
  pdfBoundingBoxOverflowCount: null,
  renderedPageImageCount: null,
  nonblankRenderedPageCount: null,
  finalAnswerPageNonblank: null,
  language: "zh-Hant",
  pageSize: "A4",
  traditionalChineseFont: "Noto Sans CJK TC",
  cjkGlyphRendering: "pending",
  htmlSha256: sha256(htmlContents),
  pdfSha256: null,
  pdfBytes: null,
  visualRenderVerification: "pending",
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, htmlContents, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ htmlPath: HTML_PATH, manifestPath: MANIFEST_PATH, ...manifest }, null, 2));
