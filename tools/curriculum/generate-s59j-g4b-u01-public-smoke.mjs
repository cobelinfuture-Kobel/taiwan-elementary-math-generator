import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION,
  G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js";
import {
  G4B_U01_PRODUCTION_PROMOTION_ACTIVATION,
  G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
} from "../../site/modules/curriculum/registry/g4b-u01-horizontal-production-promotion.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59h-extension.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s59h-extension.js";

const SOURCE_ID = "g4b_u01_4b01";
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/smoke");
const HTML_PATH = resolve(OUT_DIR, "S59J_G4B_U01_PublicHorizontalWorksheet.html");
const MANIFEST_PATH = resolve(OUT_DIR, "S59J_G4B_U01_PublicHorizontalWorksheet.manifest.json");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function countOccurrences(text, token) {
  return text.split(token).length - 1;
}

const options = {
  sourceId: SOURCE_ID,
  selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
  selectedKnowledgePointIds: [...G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G4B_U01_PROMOTED_PATTERN_GROUP_IDS],
  questionCount: 72,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s59j-g4b-u01-public-html-pdf-smoke",
  printLayout: { columns: 3, rowsPerPage: 8, showAnswerKeyPage: true },
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S59J G4B-U01 canonical worksheet generation failed: ${JSON.stringify(result.errors)}`);
}

const worksheetDocument = result.worksheetDocument;
const reachedPatternSpecIds = [...new Set(
  worksheetDocument.generatedQuestions.map((question) => question.patternSpecId),
)];
if (reachedPatternSpecIds.length !== G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length) {
  throw new Error(`Expected ${G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length} PatternSpecs, got ${reachedPatternSpecIds.length}`);
}
if (reachedPatternSpecIds.some((id) => !G4B_U01_PROMOTED_PATTERN_SPEC_IDS.includes(id))) {
  throw new Error("Public smoke contains an unpromoted PatternSpec.");
}
if (worksheetDocument.generatedQuestions.some((question) => (
  question.representation !== "horizontal_only" || question.applicationText !== false
))) {
  throw new Error("Public smoke contains a non-horizontal or application question.");
}

let html = renderWorksheetDocumentToHtml(worksheetDocument, {
  title: "4B-U01 多位數的乘與除｜公開橫式驗證",
  stylesheetHref: "../../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false,
});
html = html
  .replace(
    "<head>",
    '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="S59J G4B-U01 canonical public smoke">',
  )
  .replace(
    "</head>",
    '<style id="s59j-print-title-style">.s59j-print-title{position:fixed;top:2mm;right:7mm;z-index:20;font-family:"Noto Sans CJK TC","Noto Sans CJK",sans-serif;font-size:8pt;color:#333;}</style></head>',
  )
  .replace(
    '<body class="worksheet-renderer worksheet-renderer--g4b-u01-horizontal"',
    '<body class="worksheet-renderer worksheet-renderer--g4b-u01-horizontal" data-s59j-public-smoke="true"',
  )
  .replace(
    '<main class="worksheet-document"',
    '<div class="s59j-print-title">4B-U01 多位數的乘與除</div><main class="worksheet-document"',
  );
const htmlFileContents = `${html}\n`;

const forbiddenTokens = [
  "kp_g4b_u01_",
  "pg_g4b_u01_",
  "ps_g4b_u01_",
  "hiddenMode",
  "vertical_algorithm",
  "word_problem",
  "直式",
  "長除法",
  "{{",
  "}}",
];
const leakedTokens = forbiddenTokens.filter((token) => htmlFileContents.includes(token));
if (leakedTokens.length > 0) {
  throw new Error(`S59J public HTML contains forbidden tokens: ${leakedTokens.join(", ")}`);
}

const questionCellCount = countOccurrences(htmlFileContents, 'class="worksheet-cell worksheet-cell--question"');
const answerCellCount = countOccurrences(htmlFileContents, 'class="worksheet-cell worksheet-cell--answer-key"');
if (questionCellCount !== 72 || answerCellCount !== 72) {
  throw new Error(`Unexpected worksheet cell counts: questions=${questionCellCount}, answers=${answerCellCount}`);
}

const manifest = {
  schemaName: "G4BU01PublicHorizontalWorksheetSmokeManifest",
  schemaVersion: 1,
  task: "S59J_G4B_U01_ProductionStressHTMLPDFPromotionCloseout",
  status: "html_generated_pdf_pending",
  basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  productionPromotionOverlayId: G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
  basePromotionActivationStatus: G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.status,
  productionPromotionActivationStatus: G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.status,
  canonicalPublicPath: true,
  applicationOnly: false,
  applicationModeUsed: false,
  horizontalOnly: true,
  verticalRepresentationUsed: false,
  publicHiddenModeFlagUsed: false,
  representationToggleUsed: false,
  routeKind: worksheetDocument.batchA.routeKind,
  questionCount: worksheetDocument.summary.questionCount,
  answerKeyItemCount: worksheetDocument.answerKeyItems.length,
  questionPageCount: worksheetDocument.questionPages.length,
  answerKeyPageCount: worksheetDocument.answerKeyPages.length,
  expectedPdfPageCount: worksheetDocument.questionPages.length + worksheetDocument.answerKeyPages.length,
  actualPdfPageCount: null,
  visibleKnowledgePointCount: G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS.length,
  visiblePatternGroupCount: G4B_U01_PROMOTED_PATTERN_GROUP_IDS.length,
  promotedPatternSpecCount: G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length,
  reachedPatternSpecCount: reachedPatternSpecIds.length,
  validationErrorCount: result.validation?.errors?.length ?? 0,
  internalIdLeakCount: leakedTokens.length,
  unresolvedPlaceholderCount: 0,
  rendererProfileId: worksheetDocument.rendererProfile.profileId,
  questionLayout: {
    columns: worksheetDocument.printOptions.columns,
    rowsPerPage: worksheetDocument.printOptions.rowsPerPage,
  },
  answerKeyLayout: {
    columns: worksheetDocument.printOptions.answerKeyColumns,
    rowsPerPage: worksheetDocument.printOptions.answerKeyRowsPerPage,
  },
  noWrapExpression: worksheetDocument.rendererProfile.questionSheet.noWrapExpression,
  avoidSplit: worksheetDocument.rendererProfile.questionSheet.avoidSplit,
  pageBreakMode: worksheetDocument.printOptions.pageBreakMode,
  generationSeed: options.generationSeed,
  htmlQuestionCellCount: questionCellCount,
  htmlAnswerCellCount: answerCellCount,
  htmlSha256: sha256(htmlFileContents),
  pdfSha256: null,
  pdfBytes: null,
  renderedPageImageCount: null,
  nonblankRenderedPageCount: null,
  extractedQuestionExpressionCount: null,
  extractedAnswerExpressionCount: null,
  traditionalChineseFont: "Noto Sans CJK TC",
  cjkGlyphRendering: "pending",
  visualRenderVerification: "pending",
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, htmlFileContents, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  htmlPath: HTML_PATH,
  manifestPath: MANIFEST_PATH,
  questionCount: manifest.questionCount,
  promotedPatternSpecCount: manifest.promotedPatternSpecCount,
  expectedPdfPageCount: manifest.expectedPdfPageCount,
}, null, 2));
