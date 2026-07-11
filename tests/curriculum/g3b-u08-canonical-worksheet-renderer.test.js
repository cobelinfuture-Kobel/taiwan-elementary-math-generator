import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { buildBatchABrowserWorksheetDocument as buildPreviousWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s57f5-extension.js";
import {
  G3B_U08_CANONICAL_WORKSHEET_INTEGRATION,
  G3B_U08_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE,
  buildBatchABrowserWorksheetDocument,
  isS58HG3BU08CanonicalWorksheetOptions
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s58h-extension.js";
import {
  G3B_U08_CANONICAL_VALIDATOR_INTEGRATION,
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-s58h-extension.js";
import {
  G3B_U08_PRODUCTION_WORKSHEET_ELIGIBILITY,
  validateG3BU08ProductionWorksheetEligibility
} from "../../site/modules/curriculum/batch-a/g3b-u08-production-eligibility.js";
import {
  G3B_U08_PRODUCTION_PROMOTION_ACTIVATION,
  G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE,
  G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  validateG3BU08ProductionPromotionProjection
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-production-promotion.js";
import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";
import {
  G3B_U08_CANONICAL_RENDERER_INTEGRATION,
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s58h-extension.js";
import { renderWorksheetDocumentToHtml as renderPreviousWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s57f5-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3b_u08_3b08";

function applicationGroupIds(knowledgePointIds) {
  return knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group) => group.patternGroupId)
  ));
}

function allSemanticOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: applicationGroupIds(G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS),
    questionCount: 48,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s58h-all-semantic",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
    ...overrides
  };
}

const overlayRegistry = JSON.parse(readFileSync(
  new URL("../../data/curriculum/registry/promotions/S58H_G3B_U08_CanonicalWorksheetPromotionRegistry.json", import.meta.url),
  "utf8"
));

test("S58J final promotion preserves the S58H worksheet overlay and hidden authority", () => {
  assert.equal(overlayRegistry.overlayId, G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID);
  assert.deepEqual(overlayRegistry.lifecycle, G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE);
  assert.deepEqual(overlayRegistry.activation, G3B_U08_PRODUCTION_PROMOTION_ACTIVATION);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.status, "production_promotion_accepted");
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.requiredNextGate, null);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicPrintControlBehaviorChanged, false);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicSelectorAndPrintQaAccepted, true);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.finalStressAccepted, true);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.finalHtmlPdfPromotionAccepted, true);
  const projection = validateG3BU08ProductionPromotionProjection();
  assert.equal(projection.ok, true, projection.errors.join(", "));
  for (const definition of listG3BU08SemanticPatternDefinitions()) {
    assert.equal(definition.selectorStatus, "hidden");
    assert.equal(definition.productionUse, "forbidden");
  }
});

test("S58H integration contracts lock application-only worksheet and renderer scope", () => {
  assert.equal(G3B_U08_CANONICAL_VALIDATOR_INTEGRATION.semanticValidatorStageCount, 8);
  assert.equal(G3B_U08_CANONICAL_VALIDATOR_INTEGRATION.lifecycleValidationRequired, true);
  assert.equal(G3B_U08_CANONICAL_WORKSHEET_INTEGRATION.status, "canonical_validator_worksheet_renderer_integrated");
  assert.equal(G3B_U08_CANONICAL_WORKSHEET_INTEGRATION.applicationOnly, true);
  assert.equal(G3B_U08_CANONICAL_WORKSHEET_INTEGRATION.horizontalOnly, true);
  assert.equal(G3B_U08_CANONICAL_RENDERER_INTEGRATION.rendererProfileId, "g3b_u08_semantic_long_text_v1");
  assert.equal(G3B_U08_PRODUCTION_WORKSHEET_ELIGIBILITY.publicNumericModeAllowed, false);
  assert.equal(G3B_U08_PRODUCTION_WORKSHEET_ELIGIBILITY.representationToggleAllowed, false);
  assert.equal(G3B_U08_PRODUCTION_WORKSHEET_ELIGIBILITY.questionCountMax, 200);
});

test("S58H builds a 48-question production worksheet covering all 24 semantic families", () => {
  assert.equal(isS58HG3BU08CanonicalWorksheetOptions(allSemanticOptions()), true);
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;

  assert.equal(document.schemaVersion, "worksheet-document-v1");
  assert.equal(document.visibilityStatus, "visible");
  assert.equal(document.productionUse, "allowed");
  assert.equal(document.promotionRegistryId, G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID);
  assert.equal(document.rendererProfile.profileId, "g3b_u08_semantic_long_text_v1");
  assert.equal(document.productionEligibility.ok, true);
  assert.equal(document.generatedQuestions.length, 48);
  assert.equal(document.summary.questionCount, 48);
  assert.equal(document.summary.semanticQuestionCount, 48);
  assert.equal(document.summary.numericQuestionCount, 0);
  assert.equal(document.semanticSummary.knowledgePointCount, 6);
  assert.equal(document.semanticSummary.templateFamilyCount, 24);
  assert.equal(document.semanticSummary.applicationOnly, true);
  assert.equal(document.semanticSummary.horizontalOnly, true);
  assert.deepEqual(
    new Set(document.generatedQuestions.map((question) => question.patternSpecId)),
    new Set(G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS)
  );
  assert.equal(document.generatedQuestions.every((question) => question.phase === "S58H"), true);
  assert.equal(document.generatedQuestions.every((question) => question.productionUse === "allowed"), true);
  assert.equal(document.generatedQuestions.every((question) => question.representation === "horizontal_only"), true);
});

test("S58H applies the locked 2x4 question and 1x8 answer long-text profile", () => {
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.deepEqual(G3B_U08_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.questionSheet, {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
    longTextCardPolicy: "avoidSplit"
  });
  assert.equal(document.printOptions.columns, 2);
  assert.equal(document.printOptions.rowsPerPage, 4);
  assert.equal(document.printOptions.answerKeyColumns, 1);
  assert.equal(document.printOptions.answerKeyRowsPerPage, 8);
  assert.equal(document.printOptions.pageBreakMode, "avoidLongTextCards");
  assert.equal(document.questionPages.length, 6);
  assert.equal(document.answerKeyPages.length, 6);
  assert.equal(document.questionPages.every((page) => page.columns === 2 && page.rowsPerPage === 4), true);
  assert.equal(document.answerKeyPages.every((page) => page.columns === 1 && page.rowsPerPage === 8), true);
});

test("S58H worksheet preserves prompt equation unit conclusion metadata and semantic snapshot", () => {
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: 24, generationSeed: "s58h-surface" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.questionDisplayModels.length, 24);
  assert.equal(document.answerKeyItems.length, 24);
  for (const [index, displayModel] of document.questionDisplayModels.entries()) {
    const question = document.generatedQuestions[index];
    const answerItem = document.answerKeyItems[index];
    assert.equal(displayModel.promptText, question.promptText);
    assert.equal(displayModel.blankedDisplayText, question.blankedDisplayText);
    assert.equal(displayModel.equationModel, question.equationModel);
    assert.equal(displayModel.answerUnit, question.finalAnswerUnit);
    assert.equal(displayModel.answerText, question.answerText);
    assert.deepEqual(displayModel.semanticSnapshot, question.semanticSnapshot);
    assert.equal(displayModel.layoutHints.avoidPageBreakInside, true);
    assert.equal(displayModel.layoutHints.sourceRepresentation, "horizontal_only");
    assert.equal(answerItem.equationText, question.equationModel);
    assert.equal(answerItem.answerText, question.answerText);
    assert.equal(answerItem.finalAnswerWithUnit, question.finalAnswerWithUnit);
    assert.deepEqual(answerItem.semanticSnapshot, question.semanticSnapshot);
  }
});

test("S58H canonical validator runs all 8 semantic stages before production lifecycle", () => {
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: 12, generationSeed: "s58h-validator" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const question = result.worksheetDocument.generatedQuestions[0];
  const accepted = validateBatchABrowserQuestion(question);
  assert.equal(accepted.ok, true, JSON.stringify(accepted.errors));
  assert.equal(accepted.stages.length, 9);
  assert.equal(accepted.stages.slice(0, 8).every((stage) => stage.ok), true);
  assert.equal(accepted.stages[8].stage, "production_lifecycle");

  const mutated = structuredClone(question);
  mutated.productionUse = "forbidden";
  mutated.semanticSnapshot.runtimeStatus = "canonical_routed_pre_worksheet";
  mutated.representation = "vertical";
  const rejected = validateBatchABrowserQuestion(mutated);
  assert.equal(rejected.ok, false);
  assert.equal(rejected.errors.some((entry) => entry.code === "G3B_U08_CANONICAL_QUESTION_PRODUCTION_USE_INVALID"), true);
  assert.equal(rejected.errors.some((entry) => entry.code === "G3B_U08_CANONICAL_QUESTION_RUNTIME_STATUS_INVALID"), true);
  assert.equal(rejected.errors.some((entry) => entry.code === "G3B_U08_CANONICAL_QUESTION_REPRESENTATION_INVALID"), true);
  const batchRejected = validateBatchABrowserQuestions([question, mutated]);
  assert.equal(batchRejected.ok, false);
  assert.equal(batchRejected.errors.some((entry) => entry.path.startsWith("questions[1].")), true);
});

test("S58H production eligibility rejects hidden flags injected specs and counts over 200", () => {
  const plan = buildBatchABrowserPlan(allSemanticOptions({ questionCount: 24 }));
  assert.equal(validateG3BU08ProductionWorksheetEligibility(plan).ok, true);

  const hidden = structuredClone(plan);
  hidden.hiddenSemanticMode = true;
  assert.equal(validateG3BU08ProductionWorksheetEligibility(hidden).errors.some((entry) => entry.code === "G3B_U08_PRODUCTION_HIDDEN_OR_REPRESENTATION_MODE_FORBIDDEN"), true);

  const injected = structuredClone(plan);
  injected.allocation[0].patternSpecId = "ps_g3b_u08_injected";
  assert.equal(validateG3BU08ProductionWorksheetEligibility(injected).errors.some((entry) => entry.code === "G3B_U08_PRODUCTION_PATTERN_NOT_ELIGIBLE"), true);

  const overLimit = buildBatchABrowserPlan(allSemanticOptions({ questionCount: 201 }));
  assert.equal(validateG3BU08ProductionWorksheetEligibility(overLimit).errors.some((entry) => entry.code === "G3B_U08_PRODUCTION_QUESTION_COUNT_INVALID"), true);
  const denied = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: 201 }));
  assert.equal(denied.ok, false);
  assert.equal(denied.worksheetDocument, null);
});

test("S58H answer-key suppression emits question pages without answer items or pages", () => {
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions({
    questionCount: 16,
    includeAnswerKey: false,
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: false }
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 16);
  assert.equal(document.answerKeyItems.length, 0);
  assert.equal(document.answerKeyPages.length, 0);
  assert.equal(document.printOptions.showAnswerKey, false);
  assert.equal(document.printOptions.answerKeyPlacement, "none");
});

test("S58H renderer prints equations and unit-bearing conclusions with avoid-split protection", () => {
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: 24, generationSeed: "s58h-renderer" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  const firstAnswer = document.answerKeyItems[0];
  const html = renderWorksheetDocumentToHtml(document, {
    title: document.title,
    stylesheetHref: "",
    debugDataAttributes: false
  });
  assert.ok(html.includes('class="worksheet-renderer worksheet-renderer--g3b-u08-semantic"'));
  assert.ok(html.includes('data-renderer-profile="g3b_u08_semantic_long_text_v1"'));
  assert.ok(html.includes('id="g3b-u08-semantic-long-text-style"'));
  assert.ok(html.includes("break-inside: avoid"));
  assert.ok(html.includes(`算式：${firstAnswer.equationText}`));
  assert.ok(html.includes(`答案：${firstAnswer.answerText}`));
  assert.ok(html.includes(firstAnswer.answerUnit));
  assert.equal(html.includes("ps_g3b_u08_"), false);
  assert.equal(html.includes("kp_g3b_u08_"), false);
  assert.equal(html.includes("tpl_g3b_u08_"), false);
});

test("S58H delegates unrelated worksheets and renderer output without shape changes", () => {
  const options = {
    sourceId: "g3a_u03_3a03",
    questionCount: 8,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s58h-unrelated",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  };
  const previous = buildPreviousWorksheetDocument(options);
  const latest = buildBatchABrowserWorksheetDocument(options);
  assert.deepEqual(latest, previous);
  const previousHtml = renderPreviousWorksheetDocumentToHtml(previous.worksheetDocument, { stylesheetHref: "", debugDataAttributes: false });
  const latestHtml = renderWorksheetDocumentToHtml(latest.worksheetDocument, { stylesheetHref: "", debugDataAttributes: false });
  assert.equal(latestHtml, previousHtml);
});
