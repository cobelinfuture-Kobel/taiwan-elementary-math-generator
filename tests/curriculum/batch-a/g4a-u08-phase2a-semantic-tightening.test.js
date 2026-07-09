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
import { getVisiblePatternGroupsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u08_4a08";
const APP_KP_IDS = Object.freeze([
  "kp_g4a_u08_app_add_sub_sequence",
  "kp_g4a_u08_app_parentheses_grouping",
  "kp_g4a_u08_app_mul_div_sequence",
  "kp_g4a_u08_app_mul_div_before_add_sub"
]);
const FORBIDDEN_SEMANTIC_FRAGMENTS = Object.freeze([
  "原價12元，活動折扣11元",
  "原價20元，活動折扣19元",
  "付325元",
  "付165元",
  "每份豆漿原本需要157L",
  "每份飲用水原本需要157L",
  "每份作品需要144L",
  "每份作品需要95kg",
  "每份跑道標線原本需要140m",
  "每份材料包需要5組，每組用5mL的飲用水",
  "每份材料包需要2組，每組用5kg的飼料"
]);

function firstGroupId(kpId) {
  return getVisiblePatternGroupsForKnowledgePoint(kpId)[0]?.patternGroupId;
}

function appState(count = 200) {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAIncludeAnswerKey(state, true);
  state.batchA.ordering = "shuffleAcrossPatterns";
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...APP_KP_IDS],
    selectedPatternGroupIds: APP_KP_IDS.map(firstGroupId)
  });
  setBatchAQuestionCount(state, count);
  return state;
}

test("G4A-U08 Phase2A semantic tightening removes PDF-smoke blockers", () => {
  const result = buildWorksheetDocumentFromState(appState(200));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const prompts = result.worksheetDocument.generatedQuestions.map((question) => question.promptText).join("\n");
  for (const fragment of FORBIDDEN_SEMANTIC_FRAGMENTS) assert.equal(prompts.includes(fragment), false, `${fragment} should not appear after semantic tightening`);
});
