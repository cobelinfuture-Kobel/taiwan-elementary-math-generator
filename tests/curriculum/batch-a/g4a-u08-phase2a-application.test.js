import test from "node:test";
import assert from "node:assert/strict";

import { buildWorksheetDocumentFromState } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "../../../site/assets/browser/state/config-state.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u08_4a08";
const APP_KP_IDS = Object.freeze([
  "kp_g4a_u08_app_add_sub_sequence",
  "kp_g4a_u08_app_parentheses_grouping",
  "kp_g4a_u08_app_mul_div_sequence",
  "kp_g4a_u08_app_mul_div_before_add_sub"
]);
const APP_SPEC_IDS = Object.freeze([
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
  "ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount"
]);

function firstGroupId(kpId) {
  return getVisiblePatternGroupsForKnowledgePoint(kpId)[0]?.patternGroupId;
}

function stateFor(kpIds, count = 48) {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAIncludeAnswerKey(state, true);
  setBatchASelectorSelection(state, {
    selectionMode: kpIds.length === 1 ? BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT : BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...kpIds],
    selectedPatternGroupIds: kpIds.map(firstGroupId)
  });
  setBatchAQuestionCount(state, count);
  return state;
}

function conversionRate(questions) {
  return questions.filter((question) => question.conversionRequired === true).length / questions.length;
}

test("G4A-U08 Phase2A exposes four application KnowledgePoints with twelve PatternSpecs", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((kp) => kp.sourceId === SOURCE_ID);
  const appKps = visible.filter((kp) => APP_KP_IDS.includes(kp.knowledgePointId));
  assert.deepEqual(appKps.map((kp) => kp.knowledgePointId), APP_KP_IDS);
  assert.deepEqual(new Set(appKps.flatMap((kp) => kp.patternSpecIds)), new Set(APP_SPEC_IDS));
  for (const kpId of APP_KP_IDS) assert.ok(firstGroupId(kpId), `${kpId} should resolve to a visible PatternGroup`);
});

test("G4A-U08 Phase2A application generator produces valid word problems", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [APP_KP_IDS[0]],
    selectedPatternGroupIds: [firstGroupId(APP_KP_IDS[0])],
    questionCount: 40,
    generationSeed: "s56g2r-app-add-sub"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 40);
  assert.equal(result.questions.every((question) => question.kind === "g4aU08ApplicationWordProblem"), true);
  assert.equal(result.questions.every((question) => question.phase === "Phase2A"), true);
  assert.equal(result.questions.every((question) => typeof question.promptText === "string" && question.promptText.length > 0), true);
  assert.equal(validateBatchABrowserQuestions(result.questions).ok, true);
  const rate = conversionRate(result.questions);
  assert.equal(rate >= 0.3 && rate <= 0.5, true, `conversion rate ${rate} was outside tolerance`);
});

test("G4A-U08 Phase2A validator rejects corrupted application answers and conversion rules", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [APP_KP_IDS[1]],
    selectedPatternGroupIds: [firstGroupId(APP_KP_IDS[1])],
    questionCount: 30,
    generationSeed: "s56g2r-app-validator"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const question = result.questions[0];
  assert.equal(validateBatchABrowserQuestion(question).ok, true);
  assert.equal(validateBatchABrowserQuestion({ ...question, finalAnswer: question.finalAnswer + 1 }).ok, false);
  const conversionQuestion = result.questions.find((item) => item.conversionRequired === true);
  assert.ok(conversionQuestion);
  assert.equal(validateBatchABrowserQuestion({ ...conversionQuestion, conversionRule: { ...conversionQuestion.conversionRule, ruleId: "bad_rule" } }).ok, false);
});

test("G4A-U08 Phase2A mixed application worksheet builds safely", () => {
  const result = buildWorksheetDocumentFromState(stateFor(APP_KP_IDS, 48));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 48);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 48);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.kind === "g4aU08ApplicationWordProblem"), true);
  assert.equal(validateBatchABrowserQuestions(result.worksheetDocument.generatedQuestions).ok, true);
  assert.equal(new Set(result.worksheetDocument.batchA.patternSpecIds).size, APP_SPEC_IDS.length);
});
