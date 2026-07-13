import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G4B_U04_WORKSHEET_ANSWER_SHAPES,
} from "../../site/modules/curriculum/registry/g4b-u04-worksheet-promotion.js";
import {
  G4B_U04_PRODUCTION_PROMOTION_OVERLAY_ID,
  G4B_U04_PRODUCTION_LIFECYCLE,
} from "../../site/modules/curriculum/registry/g4b-u04-production-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s73-extension.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s73-extension.js";

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/smoke");
const HTML_PATH = resolve(OUT_DIR, "S75_G4B_U04_PublicWorksheet.html");
const MANIFEST_PATH = resolve(OUT_DIR, "S75_G4B_U04_PublicWorksheet.manifest.json");
const QUESTION_COUNT = 68;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function count(text, token) {
  return text.split(token).length - 1;
}

const options = {
  sourceId: "g4b_u04_4b04",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
  questionMode: "mixed",
  questionCount: QUESTION_COUNT,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s75-68-all-promoted",
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S75 worksheet generation failed: ${JSON.stringify(result.errors)}`);
}
const document = result.worksheetDocument;
const questions = document.generatedQuestions;
const reachedKnowledgePointIds = [...new Set(questions.map((row) => row.knowledgePointId))];
const reachedPatternGroupIds = [...new Set(questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId))];
const reachedPatternSpecIds = [...new Set(questions.map((row) => row.patternSpecId))];
const reachedModes = [...new Set(questions.map((row) => row.mode))];
const reachedAnswerShapes = [...new Set(questions.map((row) => row.answerModelShape))];

for (const [label, reached, expected] of [
  ["KnowledgePoints", reachedKnowledgePointIds, G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
  ["PatternGroups", reachedPatternGroupIds, G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
  ["PatternSpecs", reachedPatternSpecIds, G4B_U04_PROMOTED_PATTERN_SPEC_IDS],
  ["AnswerShapes", reachedAnswerShapes, G4B_U04_WORKSHEET_ANSWER_SHAPES],
]) {
  if (reached.length !== expected.length || expected.some((id) => !reached.includes(id))) {
    throw new Error(`${label} coverage mismatch: ${reached.length}/${expected.length}`);
  }
}
const expectedModes = ["concept", "numeric", "application", "operation_estimation", "reasoning"];
if (reachedModes.length !== expectedModes.length || expectedModes.some((mode) => !reachedModes.includes(mode))) {
  throw new Error(`Mode coverage mismatch: ${reachedModes.join(",")}`);
}
if (questions.length !== QUESTION_COUNT || document.answerKeyItems.length !== QUESTION_COUNT) {
  throw new Error(`S75 smoke must contain ${QUESTION_COUNT} questions and answers.`);
}
if ((result.validation?.errors ?? []).length !== 0) {
  throw new Error("S75 smoke contains blocking validation errors.");
}

let html = renderWorksheetDocumentToHtml(document, {
  title: "4B-U04 概數｜公開正式驗證",
  stylesheetHref: "../../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false,
});
html = html
  .replace("<head>", '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="S75 G4B-U04 canonical public smoke">')
  .replace('<body class="worksheet-renderer worksheet-renderer--g4b-u04"', '<body class="worksheet-renderer worksheet-renderer--g4b-u04" data-s75-public-smoke="true"');
const htmlContents = `${html}\n`;
const forbiddenPatterns = [
  /\bkp_g4b_u04_[a-z0-9_]+\b/gi,
  /\bpg_g4b_u04_[a-z0-9_]+\b/gi,
  /\bps_g4b_u04_[a-z0-9_]+\b/gi,
  /\b(?:fm|fmc|tpl)_g4b_u04_[a-z0-9_]+\b/gi,
];
const leakedTokens = forbiddenPatterns.flatMap((pattern) => htmlContents.match(pattern) ?? []);
if (leakedTokens.length) throw new Error(`Internal token leak: ${leakedTokens[0]}`);
const unresolvedPlaceholders = htmlContents.match(/\{\{[^{}]+\}\}/g) ?? [];
if (unresolvedPlaceholders.length) throw new Error(`Unresolved template placeholder: ${unresolvedPlaceholders[0]}`);
const questionCellCount = count(htmlContents, 'class="g4b-u04-cell g4b-u04-cell--question');
const answerCellCount = count(htmlContents, 'class="g4b-u04-cell g4b-u04-cell--answer');
if (questionCellCount !== QUESTION_COUNT || answerCellCount !== QUESTION_COUNT) {
  throw new Error(`HTML cell count mismatch: ${questionCellCount}/${answerCellCount}`);
}
const longTextQuestionCount = questions.filter((row) =>
  row.applicationText === true
  || row.mode === "operation_estimation"
  || row.answerModelShape === "possibleValuesAnswer"
).length;
if (longTextQuestionCount < 16) throw new Error(`Insufficient long-text coverage: ${longTextQuestionCount}`);

const modeCounts = Object.fromEntries(expectedModes.map((mode) => [
  `${mode}QuestionCount`,
  questions.filter((row) => row.mode === mode).length,
]));
const renderKinds = [...new Set(document.questionDisplayModels.map((row) => row.renderKind))];

const manifest = {
  schemaName: "G4BU04PublicWorksheetSmokeManifest",
  schemaVersion: 1,
  task: "S75_G4B_U04_ProductionStressHTMLPDFAndD0Closeout",
  status: "html_generated_pdf_pending",
  productionPromotionOverlayId: G4B_U04_PRODUCTION_PROMOTION_OVERLAY_ID,
  productionUse: G4B_U04_PRODUCTION_LIFECYCLE.productionUse,
  distance: G4B_U04_PRODUCTION_LIFECYCLE.distance,
  sourceId: "g4b_u04_4b04",
  questionCount: QUESTION_COUNT,
  answerKeyItemCount: QUESTION_COUNT,
  questionPageCount: document.questionPages.length,
  answerKeyPageCount: document.answerKeyPages.length,
  expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
  actualPdfPageCount: null,
  visibleKnowledgePointCount: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
  reachedKnowledgePointCount: reachedKnowledgePointIds.length,
  visiblePatternGroupCount: G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length,
  reachedPatternGroupCount: reachedPatternGroupIds.length,
  promotedPatternSpecCount: G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length,
  reachedPatternSpecCount: reachedPatternSpecIds.length,
  reachedModeCount: reachedModes.length,
  reachedAnswerShapeCount: reachedAnswerShapes.length,
  reachedRenderKindCount: renderKinds.length,
  ...modeCounts,
  classCQuestionCount: questions.filter((row) => row.implementationClass === "C").length,
  classDQuestionCount: questions.filter((row) => row.implementationClass === "D").length,
  longTextQuestionCount,
  validationErrorCount: result.validation?.errors?.length ?? 0,
  htmlQuestionCellCount: questionCellCount,
  htmlAnswerCellCount: answerCellCount,
  internalIdLeakCount: leakedTokens.length,
  unresolvedPlaceholderCount: unresolvedPlaceholders.length,
  rendererProfileId: document.rendererProfile.profileId,
  htmlSha256: sha256(htmlContents),
  pdfSha256: null,
  pdfBytes: null,
  renderedPageImageCount: null,
  nonblankRenderedPageCount: null,
  pdfBoundingBoxOverflowCount: null,
  traditionalChineseFont: "Noto Sans CJK TC",
  cjkGlyphRendering: "pending",
  visualRenderVerification: "pending",
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, htmlContents, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ htmlPath: HTML_PATH, manifestPath: MANIFEST_PATH, ...manifest }, null, 2));
