import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTION_MODES,
  WORKSHEET_MODES,
  createConfigState,
  getBatchAWorksheetPlan,
  normalizeBatchASelectorState,
  setBatchASelectedKnowledgePointIds,
  setBatchASelectionMode,
  setBatchASelectorSelection
} from "../../site/assets/browser/state/config-state.js";

const ADD_KP_ID = "kp_g3a_u02_add_multi_carry";
const ADD_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const SUB_KP_ID = "kp_g3a_u02_sub_multi_borrow";
const SUB_GROUP_ID = "pg_g3a_u02_sub_multi_borrow_seed";
const ROUND_KP_ID = "kp_g3a_u02_estimate_nearest_thousand";
const ROUND_GROUP_ID = "pg_g3a_u02_estimate_nearest_thousand";
const WORD_KP_ID = "kp_g3a_u02_word_problem_estimation_add_sub";
const WORD_GROUP_ID = "pg_g3a_u02_word_problem_estimation_add_sub";

test("Batch A selector state defaults to source-unit mode with eight visible overlay KPs available", () => {
  const state = createConfigState();

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_SOURCE);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, []);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, []);
  assert.equal(state.batchA.selectorAvailability.visibleCount, 8);
  assert.equal(state.batchA.selectorAvailability.hiddenPendingCount, 0);
  assert.equal(state.batchA.selectorAvailability.notSelectableCount, 0);
});

test("visible add multi-carry KnowledgePoint IDs survive selector normalization", () => {
  const normalized = normalizeBatchASelectorState({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID]
  });

  assert.equal(normalized.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(normalized.selectedKnowledgePointIds, [ADD_KP_ID]);
  assert.deepEqual(normalized.selectedPatternGroupIds, [ADD_GROUP_ID]);
  assert.deepEqual(normalized.selectorWarnings, []);
});

test("visible subtraction KnowledgePoint IDs survive selector normalization", () => {
  const normalized = normalizeBatchASelectorState({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [SUB_KP_ID],
    selectedPatternGroupIds: [SUB_GROUP_ID]
  });

  assert.equal(normalized.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(normalized.selectedKnowledgePointIds, [SUB_KP_ID]);
  assert.deepEqual(normalized.selectedPatternGroupIds, [SUB_GROUP_ID]);
  assert.deepEqual(normalized.selectorWarnings, []);
});

test("visible rounding KnowledgePoint IDs survive selector normalization", () => {
  const normalized = normalizeBatchASelectorState({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [ROUND_KP_ID],
    selectedPatternGroupIds: [ROUND_GROUP_ID]
  });

  assert.equal(normalized.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(normalized.selectedKnowledgePointIds, [ROUND_KP_ID]);
  assert.deepEqual(normalized.selectedPatternGroupIds, [ROUND_GROUP_ID]);
  assert.deepEqual(normalized.selectorWarnings, []);
});

test("visible word-problem KnowledgePoint IDs survive selector normalization", () => {
  const normalized = normalizeBatchASelectorState({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [WORD_KP_ID],
    selectedPatternGroupIds: [WORD_GROUP_ID]
  });

  assert.equal(normalized.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(normalized.selectedKnowledgePointIds, [WORD_KP_ID]);
  assert.deepEqual(normalized.selectedPatternGroupIds, [WORD_GROUP_ID]);
  assert.deepEqual(normalized.selectorWarnings, []);
});

test("selector setters fall back safely until a visible KP id is selected atomically", () => {
  const state = createConfigState();

  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  setBatchASelectedKnowledgePointIds(state, [ADD_KP_ID]);

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_SOURCE);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, []);
});

test("atomic selector setter can enter single-KP mode with visible KP and PatternGroup", () => {
  const state = createConfigState();

  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID]
  });

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_KNOWLEDGE_POINT);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, [ADD_KP_ID]);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, [ADD_GROUP_ID]);
});

test("atomic selector setter can enter same-unit mixed mode with Phase 3 KPs", () => {
  const state = createConfigState();

  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [ADD_KP_ID, SUB_KP_ID, ROUND_KP_ID, WORD_KP_ID],
    selectedPatternGroupIds: []
  });

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_KNOWLEDGE_POINT);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, [ADD_KP_ID, SUB_KP_ID, ROUND_KP_ID, WORD_KP_ID]);
});

test("worksheet plan preserves selector-safe fields without enabling KP generation by default", () => {
  const state = createConfigState();
  const plan = getBatchAWorksheetPlan(state);

  assert.equal(plan.sourceId, "g3a_u02_3a02");
  assert.equal(plan.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(plan.selectedKnowledgePointIds, []);
  assert.deepEqual(plan.selectedPatternGroupIds, []);
});
