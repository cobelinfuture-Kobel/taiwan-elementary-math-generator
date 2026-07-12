import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";
import {
  G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  G5A_U08_PRODUCTION_LIFECYCLE,
} from "../../site/modules/curriculum/registry/g5a-u08-production-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60j-extension.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s60j-extension.js";

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/smoke");
const HTML_PATH = resolve(OUT_DIR, "S60L_G5A_U08_PublicWorksheet.html");
const MANIFEST_PATH = resolve(OUT_DIR, "S60L_G5A_U08_PublicWorksheet.manifest.json");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function count(text, token) {
  return text.split(token).length - 1;
}

const options = {
  sourceId: "g5a_u08_5a08",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
  questionMode: "mixed",
  depthMode: "mixed",
  contextMode: "mixed",
  questionCount: 120,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s60l-g5a-u08-public-html-pdf-smoke",
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S60L worksheet generation failed: ${JSON.stringify(result.errors)}`);
}
const document = result.worksheetDocument;
const questions = document.generatedQuestions;
const reachedKnowledgePointIds = [...new Set(questions.map((row) => row.knowledgePointId))];
const reachedPatternGroupIds = [...new Set(questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId))];
const reachedPatternSpecIds = [...new Set(questions.map((row) => row.patternSpecId))];
for (const [label, reached, expected] of [
  ["KnowledgePoints", reachedKnowledgePointIds, G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
  ["PatternGroups", reachedPatternGroupIds, G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
  ["PatternSpecs", reachedPatternSpecIds, G5A_U08_PROMOTED_PATTERN_SPEC_IDS],
]) {
  if (reached.length !== expected.length || expected.some((id) => !reached.includes(id))) {
    throw new Error(`${label} coverage mismatch: ${reached.length}/${expected.length}`);
  }
}
if (questions.length !== 120 || document.answerKeyItems.length !== 120) {
  throw new Error("S60L smoke must contain 120 questions and 120 answers.");
}
if ((result.validation?.errors ?? []).length !== 0) {
  throw new Error("S60L smoke contains blocking validation errors.");
}

let html = renderWorksheetDocumentToHtml(document, {
  title: "5A-U08 整數四則｜公開正式驗證",
  stylesheetHref: "../../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false,
});
html = html
  .replace("<head>", '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="S60L G5A-U08 canonical public smoke">')
  .replace('<body class="worksheet-renderer worksheet-renderer--g5a-u08"', '<body class="worksheet-renderer worksheet-renderer--g5a-u08" data-s60l-public-smoke="true"');
const htmlContents = `${html}\n`;
const forbiddenTokens = [
  "kp_g5a_u08_",
  "pg_g5a_u08_",
  "ps_g5a_u08_",
  "tf_g5a_u08_",
  "cv_sdg",
  "cv_daily",
  "N_PLUS_2",
  "formal_equation",
  "{{",
  "}}",
];
const leakedTokens = forbiddenTokens.filter((token) => htmlContents.includes(token));
if (leakedTokens.length) throw new Error(`Internal token leak: ${leakedTokens.join(", ")}`);
const questionCellCount = count(htmlContents, 'class="g5a-u08-cell g5a-u08-cell--question');
const answerCellCount = count(htmlContents, 'class="g5a-u08-cell g5a-u08-cell--answer');
if (questionCellCount !== 120 || answerCellCount !== 120) {
  throw new Error(`HTML cell count mismatch: ${questionCellCount}/${answerCellCount}`);
}
const longTextQuestionCount = questions.filter((row) => row.applicationText === true || row.contextualReasoning === true).length;
if (longTextQuestionCount < 10) throw new Error(`Insufficient long-text coverage: ${longTextQuestionCount}`);

const manifest = {
  schemaName: "G5AU08PublicWorksheetSmokeManifest",
  schemaVersion: 1,
  task: "S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout",
  status: "html_generated_pdf_pending",
  productionPromotionOverlayId: G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  productionUse: G5A_U08_PRODUCTION_LIFECYCLE.productionUse,
  distance: G5A_U08_PRODUCTION_LIFECYCLE.distance,
  sourceId: "g5a_u08_5a08",
  questionCount: 120,
  answerKeyItemCount: 120,
  questionPageCount: document.questionPages.length,
  answerKeyPageCount: document.answerKeyPages.length,
  expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
  actualPdfPageCount: null,
  visibleKnowledgePointCount: G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length,
  reachedKnowledgePointCount: reachedKnowledgePointIds.length,
  visiblePatternGroupCount: G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length,
  reachedPatternGroupCount: reachedPatternGroupIds.length,
  promotedPatternSpecCount: G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length,
  reachedPatternSpecCount: reachedPatternSpecIds.length,
  numericQuestionCount: questions.filter((row) => row.mode === "numeric").length,
  applicationQuestionCount: questions.filter((row) => row.mode === "application").length,
  reasoningQuestionCount: questions.filter((row) => row.mode === "reasoning").length,
  dailyLifeQuestionCount: questions.filter((row) => row.context?.contextType === "daily_life").length,
  sdgQuestionCount: questions.filter((row) => row.context?.contextType === "sdg").length,
  nPlus1QuestionCount: questions.filter((row) => row.depth === "N_PLUS_1").length,
  longTextQuestionCount,
  validationErrorCount: result.validation?.errors?.length ?? 0,
  htmlQuestionCellCount: questionCellCount,
  htmlAnswerCellCount: answerCellCount,
  internalIdLeakCount: leakedTokens.length,
  unresolvedPlaceholderCount: count(htmlContents, "{{") + count(htmlContents, "}}"),
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
