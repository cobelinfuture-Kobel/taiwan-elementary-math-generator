import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTION_MODES,
  SELECTOR_WARNING_CODES,
  WORKSHEET_MODES,
  createConfigState,
  getBatchAWorksheetPlan,
  normalizeBatchASelectorState,
  setBatchASelectedKnowledgePointIds,
  setBatchASelectionMode,
  setBatchASelectorSelection
} from "../../site/assets/browser/state/config-state.js";

const VISIBLE_KP_ID = "kp_g3a_u02_add_multi_carry";
const VISIBLE_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";

test("Batch A selector state defaults to source-unit mode with one visible KP available", () => {
  const state = createConfigState();

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_SOURCE);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, []);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, []);
  assert.equal(state.batchA.selectorAvailability.visibleCount, 1);
  assert.equal(state.batchA.selectorAvailability.hiddenPendingCount, 1);
  assert.equal(state.batchA.selectorAvailability.notSelectableCount, 2);
});

test("visible add multi-carry KnowledgePoint IDs survive selector normalization", () => {
  const normalized = normalizeBatchASelectorState({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID]
  });

  assert.equal(normalized.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(normalized.selectedKnowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(normalized.selectedPatternGroupIds, [VISIBLE_GROUP_ID]);
  assert.deepEqual(normalized.selectorWarnings, []);
});

test("hidden subtract A-class KnowledgePoint IDs cannot survive selector normalization", () => {
  const normalized = normalizeBatchASelectorState({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_g3a_u02_sub_multi_borrow"],
    selectedPatternGroupIds: ["pg_g3a_u02_sub_multi_borrow_seed"]
  });

  assert.equal(normalized.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(normalized.selectedKnowledgePointIds, []);
  assert.deepEqual(normalized.selectedPatternGroupIds, []);
  assert.ok(normalized.selectorWarnings.some((warning) => warning.code === SELECTOR_WARNING_CODES.SELECTOR_ID_DROPPED));
  assert.ok(normalized.selectorWarnings.some((warning) => warning.code === SELECTOR_WARNING_CODES.SELECTOR_MODE_FALLBACK));
});

test("D-class KnowledgePoint IDs cannot survive selector normalization", () => {
  const normalized = normalizeBatchASelectorState({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_g3a_u02_word_problem_estimation_add_sub"],
    selectedPatternGroupIds: ["pg_g3a_u02_word_problem_estimation_add_sub"]
  });

  assert.equal(normalized.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(normalized.selectedKnowledgePointIds, []);
  assert.deepEqual(normalized.selectedPatternGroupIds, []);
});

test("selector setters fall back safely until a visible KP id is selected", () => {
  const state = createConfigState();

  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  setBatchASelectedKnowledgePointIds(state, [VISIBLE_KP_ID]);

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_SOURCE);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, []);
});

test("atomic selector setter can enter single-KP mode with visible KP and PatternGroup", () => {
  const state = createConfigState();

  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID]
  });

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_KNOWLEDGE_POINT);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, [VISIBLE_GROUP_ID]);
});

test("worksheet plan preserves selector-safe fields without enabling KP generation by default", () => {
  const state = createConfigState();
  const plan = getBatchAWorksheetPlan(state);

  assert.equal(plan.sourceId, "g3a_u02_3a02");
  assert.equal(plan.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(plan.selectedKnowledgePointIds, []);
  assert.deepEqual(plan.selectedPatternGroupIds, []);
});
