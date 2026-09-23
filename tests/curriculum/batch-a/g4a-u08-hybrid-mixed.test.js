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
import { validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u08_4a08";
const NUMERIC_KP_IDS = Object.freeze([
  "kp_g4a_u08_parentheses_first",
  "kp_g4a_u08_mul_div_before_add_sub",
  "kp_g4a_u08_left_to_right_same_level",
  "kp_g4a_u08_comprehensive_order_of_operations"
]);
const APPLICATION_KP_IDS = Object.freeze([
  "kp_g4a_u08_app_add_sub_sequence",
  "kp_g4a_u08_app_parentheses_grouping",
  "kp_g4a_u08_app_mul_div_sequence",
  "kp_g4a_u08_app_mul_div_before_add_sub"
]);

function firstGroupId(kpId) {
  return getVisiblePatternGroupsForKnowledgePoint(kpId)[0]?.patternGroupId;
}

function stateFor(kpIds, count = 200, ordering = "shuffleAcrossPatterns") {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAIncludeAnswerKey(state, true);
  state.batchA.ordering = ordering;
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...kpIds],
    selectedPatternGroupIds: kpIds.map(firstGroupId)
  });
  setBatchAQuestionCount(state, count);
  return state;
}

test("G4A-U08 mixed numeric plus application KnowledgePoints generate full 200-question hybrid worksheet", () => {
  const result = buildWorksheetDocumentFromState(stateFor([...NUMERIC_KP_IDS, ...APPLICATION_KP_IDS], 200));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.generatedQuestions;
  assert.equal(questions.length, 200);
  assert.equal(result.worksheetDocument.summary.questionCount, 200);
  assert.equal(result.worksheetDocument.batchA.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 200);
  assert.equal(questions.some((question) => question.kind === "g4aU08OrderOfOperationsExpression"), true);
  assert.equal(questions.some((question) => question.kind === "g4aU08ApplicationWordProblem"), true);
  assert.equal(validateBatchABrowserQuestions(questions).ok, true);
});
