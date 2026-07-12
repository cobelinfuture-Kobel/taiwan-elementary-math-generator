import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59j-r1-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s59j-r1-extension.js";

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../artifacts/s59j-r1-g4b-u01");
const HTML_PATH = resolve(OUT_DIR, "G4B_U01_120Q_3x4_FullFix.html");
const MANIFEST_PATH = resolve(OUT_DIR, "G4B_U01_120Q_3x4_FullFix.manifest.json");

const options = {
  sourceId: "g4b_u01_4b01",
  selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
  selectedKnowledgePointIds: [...G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G4B_U01_PROMOTED_PATTERN_GROUP_IDS],
  questionCount: 120,
  ordering: "shuffleAcrossPatterns",
  includeAnswerKey: true,
  generationSeed: "s59j-r1-g4b-u01-120q-3x4",
  printLayout: { columns: 3, rowsPerPage: 4, showAnswerKeyPage: true },
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S59J-R1 worksheet generation failed: ${JSON.stringify(result.errors)}`);
}

const document = result.worksheetDocument;
const reachedPatternSpecIds = [...new Set(document.generatedQuestions.map((question) => question.patternSpecId))];
if (reachedPatternSpecIds.length !== G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length) {
  throw new Error(`Expected ${G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length} PatternSpecs, got ${reachedPatternSpecIds.length}`);
}
if (document.questionPages.length !== 10 || document.answerKeyPages.length !== 4) {
  throw new Error(`Unexpected pagination: questions=${document.questionPages.length}, answers=${document.answerKeyPages.length}`);
}
if (new Set(result.warnings.map((warning) => warning.code)).size !== result.warnings.length) {
  throw new Error("Public warning output contains duplicate codes.");
}
if (result.warnings.some((warning) => /[A-Za-z]{4,}/.test(String(warning.message ?? "")))) {
  throw new Error("Public warning output contains untranslated English text.");
}

const html = `${renderWorksheetDocumentToHtml(document, {
  title: "4B-U01 多位數的乘與除｜120 題列印 FullFix",
  stylesheetHref: "../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false,
})}\n`;

const questionCellCount = html.split('class="worksheet-cell worksheet-cell--question"').length - 1;
const answerCellCount = html.split('class="worksheet-cell worksheet-cell--answer-key"').length - 1;
if (questionCellCount !== 120 || answerCellCount !== 120) {
  throw new Error(`Unexpected cells: questions=${questionCellCount}, answers=${answerCellCount}`);
}
if (html.includes("______……______")) {
  throw new Error("Long remainder placeholder survived the S59J-R1 renderer.");
}
if (!html.includes('data-s59j-r1-layout-fullfix="true"')) {
  throw new Error("S59J-R1 layout marker is missing.");
}

const manifest = {
  task: "S59J_R1_G4B_U01_PublicWarningAndPrintLayout_FullFix",
  status: "html_generated_pdf_pending",
  questionCount: 120,
  answerKeyItemCount: 120,
  questionPageCount: document.questionPages.length,
  answerKeyPageCount: document.answerKeyPages.length,
  expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
  questionLayout: { columns: document.printOptions.columns, rowsPerPage: document.printOptions.rowsPerPage },
  answerKeyLayout: { columns: document.printOptions.answerKeyColumns, rowsPerPage: document.printOptions.answerKeyRowsPerPage },
  warningCodes: result.warnings.map((warning) => warning.code),
  warningMessages: result.warnings.map((warning) => warning.message),
  promotedPatternSpecCount: G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length,
  reachedPatternSpecCount: reachedPatternSpecIds.length,
  domOverflowCount: null,
  pdfPageCount: null,
  nonblankPageCount: null,
  pdfBoundingBoxOverflowCount: null,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, html, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ htmlPath: HTML_PATH, manifestPath: MANIFEST_PATH, ...manifest }, null, 2));
