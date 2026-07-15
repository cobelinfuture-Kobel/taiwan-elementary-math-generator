import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s73-extension.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/stress/g4b-u04-r3a");
const QUESTION_COUNT = 200;
const OLD_PAGE_COUNT = 50;
const EXPECTED_PAGE_COUNT = 25;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const options = {
  sourceId: "g4b_u04_4b04",
  worksheetMode: "batchAKnowledgePoint",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
  questionMode: "mixed",
  contextMode: "mixed",
  layoutMode: "custom_with_caps",
  questionCount: QUESTION_COUNT,
  ordering: "shuffleAcrossPatterns",
  generationSeed: "g4b-u04-r3a-paper-efficiency",
  includeAnswerKey: false,
  printLayout: {
    paperSize: "A4",
    columns: 4,
    rowsPerPage: 10,
    showAnswerKeyPage: false,
  },
};

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`R3A generation failed: ${JSON.stringify(result.errors)}`);
}

const document = result.worksheetDocument;
const signatures = document.generatedQuestions.map((question) =>
  normalizeG4BU04PromptSignature(question.promptText));
if (new Set(signatures).size !== signatures.length) {
  throw new Error("R3A duplicate prompt signature");
}
if ((result.validation?.errors ?? []).length !== 0) {
  throw new Error("R3A blocking validation error");
}
if (document.questionPages.length !== EXPECTED_PAGE_COUNT) {
  throw new Error(`R3A question page mismatch ${document.questionPages.length}/${EXPECTED_PAGE_COUNT}`);
}
if (document.answerKeyItems.length !== 0 || document.answerKeyPages.length !== 0) {
  throw new Error("R3A answer-key suppression failed");
}

let html = renderWorksheetDocumentToHtml(document, {
  title: "4B-U04 概數｜200 題節紙版面驗收",
  stylesheetHref: "../../../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false,
});
html = html
  .replace("<head>", '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="G4B-U04 R3A paper efficiency">')
  .replace(
    '<body class="worksheet-renderer worksheet-renderer--g4b-u04"',
    '<body class="worksheet-renderer worksheet-renderer--g4b-u04" data-r3a-paper-efficiency="true"',
  );
const htmlContents = `${html}\n`;
const htmlFile = "g4b-u04-r3a-200q.html";
const pdfFile = "g4b-u04-r3a-200q.pdf";
writeFileSync(resolve(ROOT, htmlFile), htmlContents, "utf8");

const manifest = {
  schemaName: "G4BU04R3APaperEfficiencyManifest",
  schemaVersion: 1,
  task: "G4B_U04_R3A_LongTextProfilePrintDensityOptimization",
  status: "html_generated_pdf_pending",
  sourceId: options.sourceId,
  questionCount: document.generatedQuestions.length,
  answerKeyItemCount: document.answerKeyItems.length,
  requestedLayout: document.layoutResolution.requestedQuestionLayout,
  resolvedQuestionLayout: document.layoutResolution.resolvedQuestionLayout,
  resolvedAnswerLayout: document.layoutResolution.resolvedAnswerLayout,
  rendererProfileId: document.rendererProfile.profileId,
  oldQuestionPageCount: OLD_PAGE_COUNT,
  expectedQuestionPageCount: EXPECTED_PAGE_COUNT,
  actualQuestionPageCount: document.questionPages.length,
  pageReductionCount: OLD_PAGE_COUNT - document.questionPages.length,
  pageReductionPercent: ((OLD_PAGE_COUNT - document.questionPages.length) / OLD_PAGE_COUNT) * 100,
  validationErrorCount: result.validation?.errors?.length ?? 0,
  duplicatePromptCount: signatures.length - new Set(signatures).size,
  htmlFile,
  pdfFile,
  htmlSha256: sha256(htmlContents),
  pdfSha256: null,
  pdfBytes: null,
  actualPdfPageCount: null,
  domOverflowCount: null,
  nonblankRenderedPageCount: null,
  pdfBoundingBoxOverflowCount: null,
};

writeFileSync(resolve(ROOT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
