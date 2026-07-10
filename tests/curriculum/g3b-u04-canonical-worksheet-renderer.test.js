import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import {
  G3B_U04_CANONICAL_WORKSHEET_INTEGRATION,
  G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE,
  buildBatchABrowserWorksheetDocument,
  isS57F5G3BU04CanonicalWorksheetOptions
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s57f5-extension.js";
import {
  G3B_U04_CANONICAL_VALIDATOR_INTEGRATION,
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-s57f5-extension.js";
import {
  G3B_U04_PRODUCTION_WORKSHEET_ELIGIBILITY,
  validateG3BU04ProductionWorksheetEligibility
} from "../../site/modules/curriculum/batch-a/g3b-u04-production-eligibility.js";
import {
  G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g3b-u04-semantic-promotion.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G3B_U04_CANONICAL_RENDERER_INTEGRATION,
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s57f5-extension.js";
import { renderWorksheetDocumentToHtml as renderBaseWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3b_u04_3b04";
const CONSECUTIVE_KP_ID = "kp_g3b_u04_consecutive_multiplication";
const NUMERIC_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_numeric";
const APPLICATION_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_application";

function semanticGroupIdsForKnowledgePoints(knowledgePointIds) {
  return knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.representationTag === "application_word_problem")
      .map((group) => group.patternGroupId)
  ));
}

function allSemanticOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: semanticGroupIdsForKnowledgePoints(G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS),
    questionCount: 64,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f5-all-semantic",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
    ...overrides
  };
}

function hybridOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [CONSECUTIVE_KP_ID],
    selectedPatternGroupIds: [NUMERIC_GROUP_ID, APPLICATION_GROUP_ID],
    questionCount: 11,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f5-hybrid",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
    ...overrides
  };
}

function semanticQuestions(document) {
  return document.generatedQuestions.filter((question) => question.kind === "g3bU04SemanticWordProblem");
}

test("S57F5 integration constants lock the approved validator, worksheet, renderer, and next-gate scope", () => {
  assert.equal(G3B_U04_CANONICAL_VALIDATOR_INTEGRATION.status, "canonical_validator_integrated");
  assert.equal(G3B_U04_CANONICAL_VALIDATOR_INTEGRATION.semanticValidatorFirst, true);
  assert.equal(G3B_U04_CANONICAL_VALIDATOR_INTEGRATION.lifecycleValidationRequired, true);
  assert.equal(G3B_U04_CANONICAL_WORKSHEET_INTEGRATION.status, "canonical_validator_worksheet_renderer_integrated");
  assert.equal(G3B_U04_CANONICAL_WORKSHEET_INTEGRATION.schemaVersion, "worksheet-document-v1");
  assert.equal(G3B_U04_CANONICAL_RENDERER_INTEGRATION.rendererProfileId, "g3b_u04_semantic_long_text_v1");
  assert.equal(G3B_U04_PRODUCTION_WORKSHEET_ELIGIBILITY.questionCountMax, 200);
  assert.equal(G3B_U04_CANONICAL_WORKSHEET_INTEGRATION.requiredNextGate, "S57F6_G3B_U04_PublicSelectorAndPrintControlsQA");
});

test("S57F5 builds a 64-question canonical semantic worksheet with the locked long-text profile", () => {
  assert.equal(isS57F5G3BU04CanonicalWorksheetOptions(allSemanticOptions()), true);
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;

  assert.equal(document.schemaVersion, "worksheet-document-v1");
  assert.equal(document.worksheetKind, "batchAWorksheet");
  assert.equal(document.visibilityStatus, "visible");
  assert.equal(document.productionUse, "allowed");
  assert.equal(document.rendererProfile.profileId, "g3b_u04_semantic_long_text_v1");
  assert.equal(document.productionEligibility.ok, true);
  assert.equal(document.validationSummary.validatorVersion, "s57f5-g3b-u04-canonical-production-v1");
  assert.equal(document.generatedQuestions.length, 64);
  assert.equal(document.summary.questionCount, 64);
  assert.equal(document.summary.semanticQuestionCount, 64);
  assert.equal(document.summary.numericQuestionCount, 0);
  assert.equal(document.semanticSummary.knowledgePointCount, 9);
  assert.equal(document.semanticSummary.templateFamilyCount, 32);
  assert.deepEqual(
    new Set(document.generatedQuestions.map((question) => question.patternSpecId)),
    new Set(G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS)
  );

  assert.equal(document.printOptions.columns, 2);
  assert.equal(document.printOptions.rowsPerPage, 4);
  assert.equal(document.printOptions.answerKeyColumns, 1);
  assert.equal(document.printOptions.answerKeyRowsPerPage, 8);
  assert.equal(document.printOptions.pageBreakMode, "avoidLongTextCards");
  assert.equal(document.questionPages.length, 8);
  assert.equal(document.answerKeyPages.length, 8);
  assert.equal(document.questionPages.every((page) => page.columns === 2 && page.rowsPerPage === 4), true);
  assert.equal(document.answerKeyPages.every((page) => page.columns === 1 && page.rowsPerPage === 8), true);
});

test("S57F5 canonical worksheet preserves prompt, equation, answer unit, semantic snapshot, and page-break hints", () => {
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: 32, generationSeed: "s57f5-surface" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;

  assert.equal(document.questionDisplayModels.length, 32);
  assert.equal(document.answerKeyItems.length, 32);
  for (const [index, displayModel] of document.questionDisplayModels.entries()) {
    const question = document.generatedQuestions[index];
    const answerItem = document.answerKeyItems[index];
    assert.equal(displayModel.promptText, question.promptText);
    assert.equal(displayModel.blankedDisplayText, question.blankedDisplayText);
    assert.equal(displayModel.equationModel, question.equationModel);
    assert.equal(displayModel.answerUnit, question.answerUnit);
    assert.deepEqual(displayModel.semanticSnapshot, question.semanticSnapshot);
    assert.equal(displayModel.knowledgePointId, question.knowledgePointId);
    assert.equal(displayModel.templateFamilyId, question.templateFamilyId);
    assert.equal(displayModel.layoutHints.avoidPageBreakInside, true);
    assert.equal(displayModel.layoutHints.representation, "semantic_word_problem");

    assert.equal(answerItem.equationText, question.equationModel);
    assert.equal(answerItem.answerText, question.answerText);
    assert.equal(answerItem.answerUnit, question.answerUnit);
    assert.deepEqual(answerItem.semanticSnapshot, question.semanticSnapshot);
    assert.equal(answerItem.layoutHints.avoidPageBreakInside, true);
    assert.equal(answerItem.layoutHints.representation, "semantic_word_problem_answer");
  }
});

test("S57F5 canonical validator runs the semantic validator and blocks lifecycle mutations", () => {
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: 9, generationSeed: "s57f5-validator" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const question = semanticQuestions(result.worksheetDocument)[0];
  const accepted = validateBatchABrowserQuestion(question);
  assert.equal(accepted.ok, true, JSON.stringify(accepted.errors));
  assert.equal(accepted.stages.some((stage) => stage.stage === "answer_reconstruction"), true);
  assert.equal(accepted.stages.some((stage) => stage.stage === "production_lifecycle"), true);

  const mutated = structuredClone(question);
  mutated.productionUse = "forbidden";
  mutated.semanticSnapshot.resolverDerived = false;
  const rejected = validateBatchABrowserQuestion(mutated);
  assert.equal(rejected.ok, false);
  assert.equal(rejected.errors.some((error) => error.code === "G3B_U04_CANONICAL_QUESTION_PRODUCTION_USE_INVALID"), true);
  assert.equal(rejected.errors.some((error) => error.code === "G3B_U04_CANONICAL_QUESTION_RESOLVER_PROVENANCE_INVALID"), true);

  const batchRejected = validateBatchABrowserQuestions([question, mutated]);
  assert.equal(batchRejected.ok, false);
  assert.equal(batchRejected.errors.some((error) => error.path.startsWith("questions[1].")), true);
});

test("S57F5 production eligibility rejects hidden flags, unpromoted allocation, and counts above the public limit", () => {
  const basePlan = buildBatchABrowserPlan(allSemanticOptions({ questionCount: 12 }));
  assert.equal(validateG3BU04ProductionWorksheetEligibility(basePlan).ok, true);

  const hidden = structuredClone(basePlan);
  hidden.hiddenSemanticMode = "g3b_u04_hidden_semantic";
  assert.equal(validateG3BU04ProductionWorksheetEligibility(hidden).errors.some((error) => error.code === "G3B_U04_PRODUCTION_HIDDEN_MODE_FORBIDDEN"), true);

  const unpromoted = structuredClone(basePlan);
  unpromoted.allocation[0].patternSpecId = "ps_g3b_u04_unpromoted_injection";
  assert.equal(validateG3BU04ProductionWorksheetEligibility(unpromoted).errors.some((error) => error.code === "G3B_U04_PRODUCTION_PATTERN_NOT_ELIGIBLE"), true);

  const overLimit = buildBatchABrowserPlan(allSemanticOptions({ questionCount: 201 }));
  assert.equal(validateG3BU04ProductionWorksheetEligibility(overLimit).errors.some((error) => error.code === "G3B_U04_PRODUCTION_QUESTION_COUNT_INVALID"), true);
  const deniedWorksheet = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: 201 }));
  assert.equal(deniedWorksheet.ok, false);
  assert.equal(deniedWorksheet.worksheetDocument, null);
});

test("S57F5 numeric-plus-semantic hybrid uses one canonical worksheet and applies the semantic profile", () => {
  const result = buildBatchABrowserWorksheetDocument(hybridOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  const semantic = semanticQuestions(document);
  const numeric = document.generatedQuestions.filter((question) => question.kind !== "g3bU04SemanticWordProblem");

  assert.equal(semantic.length > 0, true);
  assert.equal(numeric.length > 0, true);
  assert.equal(document.summary.questionCount, 11);
  assert.equal(document.summary.semanticQuestionCount, semantic.length);
  assert.equal(document.summary.numericQuestionCount, numeric.length);
  assert.equal(document.batchA.routeKind, "g3b_u04_numeric_semantic_hybrid");
  assert.equal(document.printOptions.columns, 2);
  assert.equal(document.printOptions.rowsPerPage, 4);
  assert.equal(document.answerKeyItems.filter((item) => item.equationText).length, semantic.length);
  assert.equal(document.questionDisplayModels.filter((item) => item.semanticSnapshot).length, semantic.length);
});

test("S57F5 answer-key suppression preserves the semantic question sheet and emits no answer pages", () => {
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

test("S57F5 renderer prints semantic equations and unit-bearing answers with avoid-split protection", () => {
  const result = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: 9, generationSeed: "s57f5-renderer" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  const firstAnswer = document.answerKeyItems[0];
  const html = renderWorksheetDocumentToHtml(document, {
    title: document.title,
    stylesheetHref: "",
    debugDataAttributes: false
  });

  assert.ok(html.includes('class="worksheet-renderer worksheet-renderer--g3b-u04-semantic"'));
  assert.ok(html.includes('data-renderer-profile="g3b_u04_semantic_long_text_v1"'));
  assert.ok(html.includes('id="g3b-u04-semantic-long-text-style"'));
  assert.ok(html.includes("break-inside: avoid"));
  assert.ok(html.includes(`算式：${firstAnswer.equationText}`));
  assert.ok(html.includes(`答案：${firstAnswer.answerText}`));
  assert.ok(html.includes(firstAnswer.answerUnit));
  assert.equal(html.includes("ps_g3b_u04_"), false);
  assert.equal(html.includes("kp_g3b_u04_"), false);
  assert.equal(html.includes("tpl_g3b_u04_"), false);
});

test("S57F5 delegates unrelated worksheets and renderer output without density or byte-shape changes", () => {
  const options = {
    sourceId: "g3a_u03_3a03",
    questionCount: 8,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f5-unrelated",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  };
  const base = buildBaseBatchABrowserWorksheetDocument(options);
  const extended = buildBatchABrowserWorksheetDocument(options);
  assert.deepEqual(extended, base);
  assert.equal(extended.worksheetDocument.printOptions.columns, 4);
  assert.equal(extended.worksheetDocument.printOptions.rowsPerPage, 10);

  const renderOptions = { title: extended.worksheetDocument.title, stylesheetHref: "", debugDataAttributes: false };
  assert.equal(
    renderWorksheetDocumentToHtml(extended.worksheetDocument, renderOptions),
    renderBaseWorksheetDocumentToHtml(extended.worksheetDocument, renderOptions)
  );
});

test("S57F5 preserves the G3B-U04 arithmetic-only source-unit worksheet density and route", () => {
  const options = {
    sourceId: SOURCE_ID,
    questionCount: 10,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f5-source-unit",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  };
  const base = buildBaseBatchABrowserWorksheetDocument(options);
  const extended = buildBatchABrowserWorksheetDocument(options);
  assert.deepEqual(extended, base);
  assert.equal(extended.worksheetDocument.printOptions.columns, 4);
  assert.equal(extended.worksheetDocument.printOptions.rowsPerPage, 10);
  assert.equal(extended.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === "ps_g3b_u04_consecutive_multiplication"), true);
  assert.equal(extended.worksheetDocument.generatedQuestions.some((question) => question.kind === "g3bU04SemanticWordProblem"), false);
});

test("S57F5 layout profile constants remain exactly 2x4 questions and 1x8 answers", () => {
  assert.deepEqual(G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.questionSheet, {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
    longTextCardPolicy: "avoidSplit"
  });
  assert.deepEqual(G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.answerKey, {
    paperSize: "A4",
    columns: 1,
    rowsPerPage: 8,
    longTextCardPolicy: "avoidSplit"
  });
});
