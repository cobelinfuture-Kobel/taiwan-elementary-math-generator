import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { paginateQuestionDisplayModels } from "../../site/modules/core/index.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s73-extension.js";
import {
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/experiments/g4b-u04-r3b-3x5");
const SOURCE_ID = "g4b_u04_4b04";
const QUESTION_COUNT = 200;
const EXPERIMENTAL_COLUMNS = 3;
const EXPERIMENTAL_ROWS = 5;
const EXPECTED_PAGE_COUNT = Math.ceil(QUESTION_COUNT / (EXPERIMENTAL_COLUMNS * EXPERIMENTAL_ROWS));

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const options = {
  sourceId: SOURCE_ID,
  worksheetMode: "batchAKnowledgePoint",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
  questionMode: "mixed",
  contextMode: "mixed",
  layoutMode: "custom_with_caps",
  questionCount: QUESTION_COUNT,
  ordering: "shuffleAcrossPatterns",
  generationSeed: "g4b-u04-r3b-3x5-test-only",
  includeAnswerKey: false,
  printLayout: {
    paperSize: "A4",
    columns: 4,
    rowsPerPage: 10,
    showAnswerKeyPage: false,
  },
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`R3B experiment generation failed: ${JSON.stringify(result.errors)}`);
}
if ((result.validation?.errors ?? []).length !== 0) {
  throw new Error(`R3B experiment blocking validation errors: ${JSON.stringify(result.validation.errors)}`);
}

const baseDocument = result.worksheetDocument;
const questionDisplayModels = clone(baseDocument.questionDisplayModels ?? []).map((model) => ({
  ...model,
  responsePrompt: null,
  layoutHints: {
    ...(model.layoutHints ?? {}),
    estimatedResponseLength: 0,
  },
}));
const signatures = (baseDocument.generatedQuestions ?? [])
  .map((question) => normalizeG4BU04PromptSignature(question.promptText));
if (questionDisplayModels.length !== QUESTION_COUNT || signatures.length !== QUESTION_COUNT) {
  throw new Error(`R3B experiment question count mismatch: ${questionDisplayModels.length}/${signatures.length}`);
}
if (new Set(signatures).size !== signatures.length) {
  throw new Error("R3B experiment duplicate normalized prompt signature");
}
if (questionDisplayModels.some((model) => model.responsePrompt)) {
  throw new Error("R3B experiment response prompt was not removed");
}

const questionLayout = {
  paperSize: "A4",
  columns: EXPERIMENTAL_COLUMNS,
  rowsPerPage: EXPERIMENTAL_ROWS,
  showQuestionNumbers: true,
  showAnswerKeyPage: false,
  longTextCardPolicy: "avoidSplit",
  noWrapExpression: false,
};
const questionPages = paginateQuestionDisplayModels(questionDisplayModels, questionLayout);
if (questionPages.length !== EXPECTED_PAGE_COUNT) {
  throw new Error(`R3B experiment page count mismatch: ${questionPages.length}/${EXPECTED_PAGE_COUNT}`);
}

const experimentLayout = {
  schemaVersion: "g4b-u04-r3b-test-only-layout-v2",
  testOnly: true,
  productionProfileChanged: false,
  sourceId: SOURCE_ID,
  questionOnly: true,
  responsePromptRemoved: true,
  requestedQuestionLayout: { paperSize: "A4", columns: 4, rowsPerPage: 10 },
  resolvedQuestionLayout: { paperSize: "A4", columns: EXPERIMENTAL_COLUMNS, rowsPerPage: EXPERIMENTAL_ROWS },
  resolvedAnswerLayout: clone(baseDocument.layoutResolution?.resolvedAnswerLayout ?? { paperSize: "A4", columns: 1, rowsPerPage: 5 }),
  includeAnswerKey: false,
  appliedLayoutText: "測試版面：題目 3 欄 × 5 列；只顯示題目文字",
};

const worksheetDocument = {
  ...baseDocument,
  questionDisplayModels,
  answerKeyItems: [],
  questionPages,
  answerKeyPages: [],
  printOptions: {
    ...(baseDocument.printOptions ?? {}),
    ...questionLayout,
    columns: EXPERIMENTAL_COLUMNS,
    rowsPerPage: EXPERIMENTAL_ROWS,
    showAnswerKey: false,
    answerKeyPlacement: "none",
  },
  appliedLayoutText: experimentLayout.appliedLayoutText,
  layoutNoticeText: "此為只顯示題目文字的 3×5 測試產物，尚未套用到正式網站。",
  metadata: {
    ...(baseDocument.metadata ?? {}),
    r3bTestOnlyLayout: clone(experimentLayout),
  },
  summary: {
    ...(baseDocument.summary ?? {}),
    questionCount: QUESTION_COUNT,
    answerKeyItemCount: 0,
    questionPageCount: questionPages.length,
    answerKeyPageCount: 0,
    appliedLayoutText: experimentLayout.appliedLayoutText,
  },
};

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });

let html = renderWorksheetDocumentToHtml(worksheetDocument, {
  title: "4B-U04 概數｜3×5 題目-only 測試版｜200 題",
  stylesheetHref: "../../../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false,
});
html = html
  .replace("<head>", '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="G4B-U04 R3B 3x5 question-only test experiment">')
  .replace(
    '<body class="worksheet-renderer worksheet-renderer--g4b-u04"',
    '<body class="worksheet-renderer worksheet-renderer--g4b-u04" data-r3b-test-only="true" data-r3b-question-only="true" data-r3b-columns="3" data-r3b-rows="5"',
  );
const htmlContents = `${html}\n`;
if (htmlContents.includes("g4b-u04-cell__response")) {
  throw new Error("R3B question-only HTML still contains response prompt markup");
}
const htmlFile = "g4b-u04-r3b-3x5-200q-question-only.html";
const pdfFile = "g4b-u04-r3b-3x5-200q-question-only.pdf";
writeFileSync(resolve(ROOT, htmlFile), htmlContents, "utf8");

const manifest = {
  schemaVersion: "g4b-u04-r3b-3x5-test-only-v2",
  task: "G4B_U04_R3B_3X5_QuestionOnlyTestExperiment",
  status: "html_generated_pdf_pending",
  testOnly: true,
  productionProfileChanged: false,
  sourceId: SOURCE_ID,
  questionOnly: true,
  responsePromptCount: 0,
  questionCount: QUESTION_COUNT,
  answerKeyItemCount: 0,
  requestedLayout: { columns: 4, rowsPerPage: 10 },
  experimentalLayout: { columns: EXPERIMENTAL_COLUMNS, rowsPerPage: EXPERIMENTAL_ROWS },
  minimumQuestionsPerFullPage: EXPERIMENTAL_COLUMNS * EXPERIMENTAL_ROWS,
  expectedQuestionPageCount: EXPECTED_PAGE_COUNT,
  questionPageCount: questionPages.length,
  answerKeyPageCount: 0,
  validationErrorCount: result.validation?.errors?.length ?? 0,
  duplicatePromptCount: signatures.length - new Set(signatures).size,
  htmlFile,
  pdfFile,
  htmlSha256: sha256(htmlContents),
  htmlBytes: Buffer.byteLength(htmlContents),
  domOverflowCount: null,
  actualPdfPageCount: null,
  nonblankPdfPageCount: null,
  pdfBoundingBoxOverflowCount: null,
  pdfSha256: null,
  pdfBytes: null,
};
writeFileSync(resolve(ROOT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
