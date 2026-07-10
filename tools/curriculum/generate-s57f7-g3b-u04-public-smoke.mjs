import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U04_SEMANTIC_PROMOTION_ACTIVATION,
  G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
} from "../../site/modules/curriculum/registry/g3b-u04-semantic-promotion.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s57f5-extension.js";
import {
  listG3BU04SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";
import {
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s57f5-extension.js";

const SOURCE_ID = "g3b_u04_3b04";
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/smoke");
const HTML_PATH = resolve(OUT_DIR, "S57F7_G3B_U04_PublicSemanticWorksheet.html");
const MANIFEST_PATH = resolve(OUT_DIR, "S57F7_G3B_U04_PublicSemanticWorksheet.manifest.json");

function semanticGroupIdsForKnowledgePoints(knowledgePointIds) {
  return knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.representationTag === "application_word_problem")
      .map((group) => group.patternGroupId)
  ));
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

const selectedPatternGroupIds = semanticGroupIdsForKnowledgePoints(G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS);
const options = {
  sourceId: SOURCE_ID,
  selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
  selectedKnowledgePointIds: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  selectedPatternGroupIds,
  questionCount: 64,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s57f7-public-semantic-html-pdf-smoke",
  printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S57F7 canonical public worksheet generation failed: ${JSON.stringify(result.errors)}`);
}

const worksheetDocument = result.worksheetDocument;
const definitions = listG3BU04SemanticPatternDefinitions();
const familyContextVariantCount = definitions.reduce(
  (sum, definition) => sum + definition.contextDomains.length,
  0
);

let html = renderWorksheetDocumentToHtml(worksheetDocument, {
  title: "3B-U04 兩步驟計算｜公開語意題型驗證",
  stylesheetHref: "../../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false
});
html = html
  .replace(
    "<head>",
    '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="S57F7 G3B-U04 canonical public smoke">'
  )
  .replace(
    '<body class="worksheet-renderer worksheet-renderer--g3b-u04-semantic"',
    '<body class="worksheet-renderer worksheet-renderer--g3b-u04-semantic" data-s57f7-public-smoke="true"'
  );

const forbiddenTokens = [
  "kp_g3b_u04_",
  "pg_g3b_u04_",
  "ps_g3b_u04_",
  "tpl_g3b_u04_",
  "hiddenSemanticMode",
  "g3b_u04_hidden_semantic",
  "{{",
  "}}"
];
const leakedTokens = forbiddenTokens.filter((token) => html.includes(token));
if (leakedTokens.length > 0) {
  throw new Error(`S57F7 public HTML contains forbidden tokens: ${leakedTokens.join(", ")}`);
}

const generatedPatternSpecIds = [...new Set(
  worksheetDocument.generatedQuestions.map((question) => question.patternSpecId)
)];
if (generatedPatternSpecIds.length !== 32) {
  throw new Error(`Expected 32 semantic families in public smoke, got ${generatedPatternSpecIds.length}`);
}
if (generatedPatternSpecIds.some((patternSpecId) => !G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.includes(patternSpecId))) {
  throw new Error("Public smoke contains an unpromoted semantic PatternSpec.");
}

const manifest = {
  schemaName: "G3BU04PublicSemanticWorksheetSmokeManifest",
  schemaVersion: 1,
  task: "S57F7_G3B_U04_ProductionRegressionStressHTMLPDFPromotionCloseout",
  status: "html_generated_pdf_pending",
  promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
  promotionActivationStatus: G3B_U04_SEMANTIC_PROMOTION_ACTIVATION.status,
  canonicalPublicPath: true,
  publicHiddenModeFlagUsed: false,
  routeKind: worksheetDocument.batchA.routeKind,
  questionCount: worksheetDocument.summary.questionCount,
  answerKeyItemCount: worksheetDocument.answerKeyItems.length,
  questionPageCount: worksheetDocument.questionPages.length,
  answerKeyPageCount: worksheetDocument.answerKeyPages.length,
  expectedPdfPageCount: worksheetDocument.questionPages.length + worksheetDocument.answerKeyPages.length,
  actualPdfPageCount: null,
  visibleKnowledgePointCount: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
  visibleSemanticPatternGroupCount: selectedPatternGroupIds.length,
  templateFamilyCount: generatedPatternSpecIds.length,
  familyContextVariantCount,
  semanticValidationErrorCount: result.validation?.errors?.length ?? 0,
  internalIdLeakCount: leakedTokens.length,
  unresolvedPlaceholderCount: 0,
  rendererProfileId: worksheetDocument.rendererProfile.profileId,
  questionLayout: {
    columns: worksheetDocument.printOptions.columns,
    rowsPerPage: worksheetDocument.printOptions.rowsPerPage
  },
  answerKeyLayout: {
    columns: worksheetDocument.printOptions.answerKeyColumns,
    rowsPerPage: worksheetDocument.printOptions.answerKeyRowsPerPage
  },
  longTextCardPolicy: worksheetDocument.rendererProfile.longTextCardPolicy,
  pageBreakMode: worksheetDocument.printOptions.pageBreakMode,
  generationSeed: options.generationSeed,
  htmlSha256: sha256(html),
  pdfSha256: null,
  pdfBytes: null,
  renderedPageImageCount: null,
  extractedEquationLabelCount: null,
  extractedAnswerLabelCount: null
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, `${html}\n`, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  htmlPath: HTML_PATH,
  manifestPath: MANIFEST_PATH,
  questionCount: manifest.questionCount,
  templateFamilyCount: manifest.templateFamilyCount,
  expectedPdfPageCount: manifest.expectedPdfPageCount
}, null, 2));
