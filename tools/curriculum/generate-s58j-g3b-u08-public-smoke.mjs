import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U08_SEMANTIC_PROMOTION_ACTIVATION,
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s58h-extension.js";
import {
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";
import {
  listG3BU08SemanticContextVariantsForPatternSpec
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-context-registry.js";
import {
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s58h-extension.js";

const SOURCE_ID = "g3b_u08_3b08";
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/smoke");
const HTML_PATH = resolve(OUT_DIR, "S58J_G3B_U08_PublicSemanticWorksheet.html");
const MANIFEST_PATH = resolve(OUT_DIR, "S58J_G3B_U08_PublicSemanticWorksheet.manifest.json");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const options = {
  sourceId: SOURCE_ID,
  selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
  selectedKnowledgePointIds: [...G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G3B_U08_PROMOTED_PATTERN_GROUP_IDS],
  questionCount: 72,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "s58j-public-semantic-html-pdf-smoke",
  printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`S58J canonical public worksheet generation failed: ${JSON.stringify(result.errors)}`);
}

const worksheetDocument = result.worksheetDocument;
const definitions = listG3BU08SemanticPatternDefinitions();
const familyContextVariantCount = definitions.reduce(
  (sum, definition) => sum + listG3BU08SemanticContextVariantsForPatternSpec(definition.patternSpecId).length,
  0
);

let html = renderWorksheetDocumentToHtml(worksheetDocument, {
  title: "3B-U08 乘法與除法｜公開應用題驗證",
  stylesheetHref: "../../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false
});
html = html
  .replace(
    "<head>",
    '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="S58J G3B-U08 canonical public smoke">'
  )
  .replace(
    '<body class="worksheet-renderer worksheet-renderer--g3b-u08-semantic"',
    '<body class="worksheet-renderer worksheet-renderer--g3b-u08-semantic" data-s58j-public-smoke="true"'
  );
const htmlFileContents = `${html}\n`;

const forbiddenTokens = [
  "kp_g3b_u08_",
  "pg_g3b_u08_",
  "ps_g3b_u08_",
  "tpl_g3b_u08_",
  "ctx_g3b_u08_",
  "hiddenSemanticMode",
  "g3bU08Semantic",
  "g3b_u08_hidden",
  "直式",
  "長除法",
  "{{",
  "}}"
];
const leakedTokens = forbiddenTokens.filter((token) => htmlFileContents.includes(token));
if (leakedTokens.length > 0) {
  throw new Error(`S58J public HTML contains forbidden tokens: ${leakedTokens.join(", ")}`);
}

const generatedPatternSpecIds = [...new Set(
  worksheetDocument.generatedQuestions.map((question) => question.patternSpecId)
)];
const generatedContextVariantIds = [...new Set(
  worksheetDocument.generatedQuestions.map((question) => question.contextVariantId)
)];
if (generatedPatternSpecIds.length !== 24) {
  throw new Error(`Expected 24 semantic families in public smoke, got ${generatedPatternSpecIds.length}`);
}
if (generatedContextVariantIds.length !== 72) {
  throw new Error(`Expected 72 context variants in public smoke, got ${generatedContextVariantIds.length}`);
}
if (generatedPatternSpecIds.some((patternSpecId) => !G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.includes(patternSpecId))) {
  throw new Error("Public smoke contains an unpromoted semantic PatternSpec.");
}
if (worksheetDocument.generatedQuestions.some((question) => question.representation !== "horizontal_only")) {
  throw new Error("Public smoke contains a non-horizontal question.");
}

const manifest = {
  schemaName: "G3BU08PublicSemanticWorksheetSmokeManifest",
  schemaVersion: 1,
  task: "S58J_G3B_U08_ProductionRegressionStressHTMLPDFPromotionCloseout",
  status: "html_generated_pdf_pending",
  promotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
  promotionActivationStatus: G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.status,
  canonicalPublicPath: true,
  applicationOnly: true,
  horizontalOnly: true,
  publicHiddenModeFlagUsed: false,
  publicNumericModeUsed: false,
  representationToggleUsed: false,
  routeKind: worksheetDocument.batchA.routeKind,
  questionCount: worksheetDocument.summary.questionCount,
  answerKeyItemCount: worksheetDocument.answerKeyItems.length,
  questionPageCount: worksheetDocument.questionPages.length,
  answerKeyPageCount: worksheetDocument.answerKeyPages.length,
  expectedPdfPageCount: worksheetDocument.questionPages.length + worksheetDocument.answerKeyPages.length,
  actualPdfPageCount: null,
  visibleKnowledgePointCount: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length,
  visibleSemanticPatternGroupCount: G3B_U08_PROMOTED_PATTERN_GROUP_IDS.length,
  templateFamilyCount: generatedPatternSpecIds.length,
  familyContextVariantCount,
  reachedContextVariantCount: generatedContextVariantIds.length,
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
  longTextCardPolicy: worksheetDocument.rendererProfile.questionSheet.longTextCardPolicy,
  pageBreakMode: worksheetDocument.printOptions.pageBreakMode,
  generationSeed: options.generationSeed,
  htmlSha256: sha256(htmlFileContents),
  pdfSha256: null,
  pdfBytes: null,
  renderedPageImageCount: null,
  extractedEquationLabelCount: null,
  extractedAnswerLabelCount: null,
  visualRenderVerification: "pending"
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, htmlFileContents, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  htmlPath: HTML_PATH,
  manifestPath: MANIFEST_PATH,
  questionCount: manifest.questionCount,
  templateFamilyCount: manifest.templateFamilyCount,
  familyContextVariantCount: manifest.familyContextVariantCount,
  expectedPdfPageCount: manifest.expectedPdfPageCount
}, null, 2));
