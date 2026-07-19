import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-gctx-p13-entry.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-production-admission.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
  G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
  G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-production-registry.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s73-extension.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../../docs/curriculum/output/gctx");
const HTML_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.html");
const PDF_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.pdf");
const JSON_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.json");
const MANIFEST_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.manifest.json");

const SOURCE_ID = "g3b_u04_3b04";
const KP_ID = "kp_g3b_u04_add_then_divide";
const REQUIRED_PHRASES = ["班級園遊會", "戶外學習", "運動練習", "社區清潔活動", "露營活動"];
const LEGACY_TARGET_PATTERN = /三明治費用共|果汁費用共|筆記本費用共|彩色筆費用共|門票費用共|帳篷租金共/;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function applicationGroupId() {
  return getVisiblePatternGroupsForKnowledgePoint(KP_ID)
    .find((group) => group.representationTag === "application_word_problem")
    ?.patternGroupId;
}

const generationSeed = process.env.GCTX_P13_SEED ?? "gctx-p13-public-production-html-pdf";
const groupId = applicationGroupId();
if (!groupId) throw new Error("GCTX-P13 application PatternGroup is not publicly visible.");

const options = {
  sourceId: SOURCE_ID,
  selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
  selectedKnowledgePointIds: [KP_ID],
  selectedPatternGroupIds: [groupId],
  questionCount: 20,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed,
  title: "3B-U04 兩步驟計算｜全域情境正式卷",
  printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true }
};

const result = buildBatchABrowserWorksheetDocument(options);
if (!result.ok || !result.worksheetDocument) {
  throw new Error(`GCTX-P13 public worksheet generation failed: ${JSON.stringify(result.errors)}`);
}

const document = result.worksheetDocument;
const targetQuestions = document.generatedQuestions.filter(
  (question) => question.patternSpecId === G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID
);
const targetAnswerItems = document.answerKeyItems.filter(
  (item) => item.patternId === G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID
);
const targetPromptText = targetQuestions.map((question) => question.promptText).join("\n");
const variantIds = [...new Set(
  targetQuestions.map((question) => question.globalContextProduction?.semanticVariantId).filter(Boolean)
)];
const missingPhrases = REQUIRED_PHRASES.filter((phrase) => !targetPromptText.includes(phrase));
const mathematicalWitnessCount = targetQuestions.filter((question) => {
  const { a, b, c } = question.quantities ?? {};
  return Number.isInteger(a)
    && Number.isInteger(b)
    && Number.isInteger(c)
    && c > 0
    && (a + b) % c === 0
    && question.equationModel === `(${a} + ${b}) ÷ ${c}`
    && question.finalAnswer === (a + b) / c
    && question.answerText === `${question.finalAnswer}元`;
}).length;

if (document.productionUse !== "allowed"
  || document.visibilityStatus !== "visible"
  || document.rendererProfile?.profileId !== "g3b_u04_semantic_long_text_v1"
  || result.globalContextProductionAdmission?.productionAdmitted !== true
  || result.globalContextProductionAdmission?.publicQuerySelectable !== true
  || targetQuestions.length !== 5
  || targetAnswerItems.length !== 5
  || variantIds.length !== 5
  || missingPhrases.length !== 0
  || mathematicalWitnessCount !== 5
  || LEGACY_TARGET_PATTERN.test(targetPromptText)
  || targetQuestions.some((question) => question.globalContextProduction?.reviewArtifactSha256 !== G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256)
  || targetQuestions.some((question) => question.canonicalRoute?.resolver !== "visiblePatternGroupResolver")
  || targetQuestions.some((question) => question.canonicalRoute?.publicHiddenModeFlagUsed !== false)) {
  throw new Error("GCTX-P13 public production admission gate failed before rendering.");
}

let html = renderWorksheetDocumentToHtml(document, {
  title: document.title,
  stylesheetHref: "../../../../site/assets/styles/print-styles.css",
  debugDataAttributes: false
});
html = html
  .replace("<head>", `<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="GCTX-P13 public production">`)
  .replace(
    /<body([^>]*)>/,
    `<body$1 data-gctx-p13-production="true" data-production-admitted="true" data-public-query-selectable="true" data-review-artifact-sha256="${G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256}">`
  );
html = `${html}\n`;

const productionEvidence = {
  schemaName: "GCTXG3BU04PublicProductionEvidence",
  schemaVersion: 1,
  task: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
  status: "public_production_html_generated_pdf_pending",
  generationSeed,
  sourceId: SOURCE_ID,
  knowledgePointId: KP_ID,
  patternGroupId: groupId,
  patternSpecId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID,
  registryId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
  reviewDecisionId: G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID,
  reviewArtifactSha256: G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
  productionSelectable: true,
  publicQuerySelectable: true,
  productionAdmitted: true,
  publicHiddenModeFlagUsed: false,
  canonicalResolverUsed: true,
  canonicalGeneratorUsed: true,
  productionRendererUsed: true,
  worksheetQuestionCount: document.generatedQuestions.length,
  targetQuestionCount: targetQuestions.length,
  targetAnswerCount: targetAnswerItems.length,
  uniqueApprovedVariantCount: variantIds.length,
  mathematicalWitnessCount,
  missingRequiredPhraseCount: missingPhrases.length,
  leakedLegacyTargetPromptCount: LEGACY_TARGET_PATTERN.test(targetPromptText) ? 1 : 0,
  questionPageCount: document.questionPages.length,
  answerKeyPageCount: document.answerKeyPages.length,
  expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
  variantIds,
  targetQuestions: targetQuestions.map((question) => ({
    questionId: question.id,
    promptText: question.promptText,
    equationModel: question.equationModel,
    answerText: question.answerText,
    quantities: question.quantities,
    contextDomain: question.contextDomain,
    globalContextProduction: question.globalContextProduction,
    canonicalRoute: question.canonicalRoute
  })),
  targetAnswerItems: targetAnswerItems.map((item) => ({
    questionId: item.questionId,
    equationText: item.equationText,
    answerText: item.answerText,
    answerUnit: item.answerUnit
  }))
};
const productionJson = `${JSON.stringify(productionEvidence, null, 2)}\n`;
const manifest = {
  schemaName: "GCTXG3BU04PublicProductionArtifactManifest",
  schemaVersion: 1,
  task: productionEvidence.task,
  status: "public_production_html_pass_pdf_pending",
  evidenceLevel: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
  generationSeed,
  productionSelectable: true,
  publicQuerySelectable: true,
  productionAdmitted: true,
  canonicalResolverUsed: true,
  canonicalGeneratorUsed: true,
  productionRendererUsed: true,
  reviewArtifactSha256: G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
  worksheetQuestionCount: productionEvidence.worksheetQuestionCount,
  targetQuestionCount: productionEvidence.targetQuestionCount,
  targetAnswerCount: productionEvidence.targetAnswerCount,
  uniqueApprovedVariantCount: productionEvidence.uniqueApprovedVariantCount,
  mathematicalWitnessCount,
  expectedPdfPageCount: productionEvidence.expectedPdfPageCount,
  actualPdfPageCount: null,
  htmlPath: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.html",
  pdfPath: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.pdf",
  extractedTextPath: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.extracted.txt",
  productionEvidencePath: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.json",
  htmlSha256: sha256(html),
  productionEvidenceSha256: sha256(productionJson),
  pdfSha256: null,
  pdfBytes: null,
  extractedRequiredContextCount: null,
  extractedAnswerCount: null,
  leakedLegacyTargetPhraseCount: null
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, html, "utf8");
writeFileSync(JSON_PATH, productionJson, "utf8");
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  htmlPath: HTML_PATH,
  pdfPath: PDF_PATH,
  productionEvidencePath: JSON_PATH,
  manifestPath: MANIFEST_PATH,
  worksheetQuestionCount: manifest.worksheetQuestionCount,
  targetQuestionCount: manifest.targetQuestionCount,
  uniqueApprovedVariantCount: manifest.uniqueApprovedVariantCount,
  expectedPdfPageCount: manifest.expectedPdfPageCount
}, null, 2));
