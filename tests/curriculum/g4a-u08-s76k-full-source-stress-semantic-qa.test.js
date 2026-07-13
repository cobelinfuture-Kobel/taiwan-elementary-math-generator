import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import {
  validateG4AU08CanonicalQuestion,
} from "../../site/modules/curriculum/batch-a/g4a-u08-canonical-router.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4a-u08-phase2b-promotion.js";
import {
  G4A_U08_STRESS_ACCEPTANCE,
  validateG4AU08ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g4a-u08-production-promotion.js";
import {
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import {
  evaluateG4AU08ApplicationEquationTokens,
} from "../../site/modules/curriculum/batch-a/g4a-u08-application-generator.js";

const SOURCE_ID = "g4a_u08_4a08";
const NUMERIC_SPEC_IDS = Object.freeze([
  "ps_g4a_u08_parentheses_add_sub",
  "ps_g4a_u08_parentheses_mul_div",
  "ps_g4a_u08_mul_before_add_sub",
  "ps_g4a_u08_div_before_add_sub",
  "ps_g4a_u08_add_sub_left_to_right",
  "ps_g4a_u08_mul_div_left_to_right",
  "ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses",
  "ps_g4a_u08_mixed_with_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_with_parentheses",
]);
const PHASE2A_KP_IDS = Object.freeze([
  "kp_g4a_u08_app_add_sub_sequence",
  "kp_g4a_u08_app_parentheses_grouping",
  "kp_g4a_u08_app_mul_div_sequence",
  "kp_g4a_u08_app_mul_div_before_add_sub",
]);
const PHASE2A_SPEC_IDS = Object.freeze([
  "ps_g4a_u08_app_add_three_quantities",
  "ps_g4a_u08_app_add_then_subtract_state_change",
  "ps_g4a_u08_app_subtract_then_add_state_change",
  "ps_g4a_u08_app_subtract_twice_state_change",
  "ps_g4a_u08_app_adjusted_amount_then_subtract",
  "ps_g4a_u08_app_divide_by_group_product",
  "ps_g4a_u08_app_multiply_after_difference_then_add_sub",
  "ps_g4a_u08_app_multiply_then_share",
  "ps_g4a_u08_app_unit_rate_then_scale",
  "ps_g4a_u08_app_divide_then_divide",
  "ps_g4a_u08_app_payment_minus_unit_cost_times_quantity",
  "ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount",
]);
const EXTENSION_GROUP_SET = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);
const INTERNAL_ID_RE = /\b(?:kp|pg|ps|tpl)_g4a_u08_[a-z0-9_]+\b/i;
const PLACEHOLDER_RE = /\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/;

function phase2BOptions(count, seed = "s76k-phase2b") {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "application",
    questionCount: count,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: seed,
  };
}

function phase2AGroupId(knowledgePointId) {
  return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
    .find((group) => !EXTENSION_GROUP_SET.has(group.patternGroupId))?.patternGroupId;
}

function phase2AOptions(count = 200) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...PHASE2A_KP_IDS],
    selectedPatternGroupIds: PHASE2A_KP_IDS.map(phase2AGroupId),
    questionCount: count,
    ordering: "groupedByPattern",
    generationSeed: "s76k-phase2a",
  };
}

function recomputePhase2B(question) {
  const o = question.operands;
  switch (question.legacyTemplateId) {
    case "tpl_ext_comparison_chain": return o[0] + o[1] - o[2];
    case "tpl_ext_equal_value_unit_price": return o[0] * o[1] / o[2];
    case "tpl_ext_relative_difference": return (o[1] - o[0]) * o[2];
    case "tpl_ext_two_cost_component_payment": return o[0] - (o[1] * o[2] + o[3] * o[4]);
    default: throw new Error(`unexpected template ${question.legacyTemplateId}`);
  }
}

function assertPublicText(text) {
  assert.equal(INTERNAL_ID_RE.test(text), false, text);
  assert.equal(PLACEHOLDER_RE.test(text), false, text);
}

function assertPhase2BSemantics(question) {
  const o = question.operands;
  assert.equal(question.finalAnswer, recomputePhase2B(question));
  assert.equal(Number.isInteger(question.finalAnswer), true);
  switch (question.legacyTemplateId) {
    case "tpl_ext_comparison_chain":
      assert.equal(question.semanticRelations.join(","), "more_than,less_than");
      assert.equal(question.structuredAnswer.intermediateValues.middleAmount, o[0] + o[1]);
      assert.equal(question.finalAnswer < question.structuredAnswer.intermediateValues.middleAmount, true);
      break;
    case "tpl_ext_equal_value_unit_price":
      assert.equal(question.semanticRelations.join(","), "equal_total_value,different_quantity");
      assert.notEqual(o[1], o[2]);
      assert.equal(o[0] * o[1], question.finalAnswer * o[2]);
      break;
    case "tpl_ext_relative_difference":
      assert.equal(question.semanticRelations.join(","), "same_direction,difference_not_sum");
      assert.equal(o[1] > o[0], true);
      assert.notEqual(question.finalAnswer, (o[1] + o[0]) * o[2]);
      break;
    case "tpl_ext_two_cost_component_payment":
      assert.equal(question.semanticRelations.join(","), "two_cost_components,payment_covers_total");
      assert.equal(question.structuredAnswer.intermediateValues.totalCost,
        question.structuredAnswer.intermediateValues.componentCostA + question.structuredAnswer.intermediateValues.componentCostB);
      assert.equal(question.finalAnswer >= 0, true);
      break;
  }
}

test("S76K production projection stays D1 until the S76L closeout", () => {
  const result = validateG4AU08ProductionPromotionProjection();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.counts, { knowledgePoints: 3, patternGroups: 4, patternSpecs: 4 });
  assert.equal(G4A_U08_STRESS_ACCEPTANCE.maximumAcceptedQuestionCount, 1000);
  assert.equal(G4A_U08_STRESS_ACCEPTANCE.firstRejectedQuestionCount, 1001);
});

test("S76K numeric legacy surface stress covers all 10 public numeric PatternSpecs", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    questionCount: 200,
    ordering: "groupedByPattern",
    generationSeed: "s76k-numeric-full-source",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 200);
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), new Set(NUMERIC_SPEC_IDS));
  assert.equal(validateBatchABrowserQuestions(result.questions).ok, true);
  for (const question of result.questions) {
    assert.equal(Number.isInteger(question.finalAnswer), true);
    assertPublicText(question.blankedDisplayText ?? question.displayText ?? "");
  }
});

test("S76K Phase2A legacy surface stress covers all 12 application PatternSpecs", () => {
  const result = generateBatchABrowserQuestions(phase2AOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 200);
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), new Set(PHASE2A_SPEC_IDS));
  assert.equal(validateBatchABrowserQuestions(result.questions).ok, true);
  for (const question of result.questions) {
    assert.equal(evaluateG4AU08ApplicationEquationTokens(question.equationTokens), question.finalAnswer);
    assertPublicText(question.promptText ?? question.blankedDisplayText ?? "");
  }
});

test("S76K Phase2B count matrix generates exact validated output through 1000 questions", () => {
  let cumulative = 0;
  const coveredGroups = new Set();
  const coveredSpecs = new Set();
  for (const count of G4A_U08_STRESS_ACCEPTANCE.publicCountMatrix) {
    const result = generateBatchABrowserQuestions(phase2BOptions(count, `s76k-matrix-${count}`));
    assert.equal(result.ok, true, `${count}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, count);
    cumulative += count;
    for (const question of result.questions) {
      coveredGroups.add(question.patternGroupId);
      coveredSpecs.add(question.patternSpecId);
      assert.equal(validateG4AU08CanonicalQuestion(question).ok, true);
      assertPhase2BSemantics(question);
      assertPublicText(question.promptText);
      assertPublicText(question.answerText);
    }
  }
  assert.equal(cumulative, G4A_U08_STRESS_ACCEPTANCE.publicCountMatrix.reduce((sum, count) => sum + count, 0));
  assert.deepEqual(coveredGroups, new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS));
  assert.deepEqual(coveredSpecs, new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS));
});

test("S76K Phase2B generation is deterministic at production smoke size", () => {
  const first = generateBatchABrowserQuestions(phase2BOptions(120, "s76k-deterministic"));
  const second = generateBatchABrowserQuestions(phase2BOptions(120, "s76k-deterministic"));
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.deepEqual(
    first.questions.map((question) => [question.patternSpecId, question.promptText, question.finalAnswer]),
    second.questions.map((question) => [question.patternSpecId, question.promptText, question.finalAnswer]),
  );
});

test("S76K rejects 1001 questions and returns zero output", () => {
  const result = generateBatchABrowserQuestions(phase2BOptions(1001, "s76k-boundary"));
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
  assert.ok(result.errors.some((entry) => entry.code === "G4A_U08_CANONICAL_COUNT_INVALID"));
});

test("S76K canonical lifecycle and identity mutations remain blocking", () => {
  const result = generateBatchABrowserQuestions(phase2BOptions(4, "s76k-mutations"));
  assert.equal(result.ok, true);
  const mutations = [
    (item) => { item.productionUse = "production_without_gate"; },
    (item) => { item.patternSpecId = "ps_g4a_u08_unapproved"; },
    (item) => { item.resolvedPatternGroupId = "pg_g4a_u08_unapproved"; },
    (item) => { item.canonicalRoute.genericFallbackAllowed = true; },
  ];
  for (const mutate of mutations) {
    const item = structuredClone(result.questions[0]);
    mutate(item);
    assert.equal(validateG4AU08CanonicalQuestion(item).ok, false);
  }
});

test("S76K 120-question worksheet has exact question and answer-key parity", () => {
  const result = buildBatchABrowserWorksheetDocument(phase2BOptions(120, "s76k-worksheet"));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 120);
  assert.equal(document.questionDisplayModels.length, 120);
  assert.equal(document.answerKeyItems.length, 120);
  assert.equal(document.summary.questionCount, 120);
  assert.ok(document.questionPages.length >= 10);
  assert.ok(document.answerKeyPages.length >= 10);
  assert.equal(document.rendererBehaviorChanged, false);
  for (const question of document.generatedQuestions) assertPhase2BSemantics(question);
});
