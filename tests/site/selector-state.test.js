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
  setBatchASelectionMode
} from "../../site/assets/browser/state/config-state.js";

test("Batch A selector state defaults to source-unit mode", () => {
  const state = createConfigState();

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_SOURCE);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, []);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, []);
  assert.equal(state.batchA.selectorAvailability.visibleCount, 0);
  assert.equal(state.batchA.selectorAvailability.hiddenPendingCount, 2);
  assert.equal(state.batchA.selectorAvailability.notSelectableCount, 2);
});

test("hidden A-class KnowledgePoint IDs cannot survive selector normalization", () => {
  const normalized = normalizeBatchASelectorState({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_g3a_u02_add_multi_carry"],
    selectedPatternGroupIds: ["pg_g3a_u02_add_multi_carry_seed"]
  });

  assert.equal(normalized.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(normalized.selectedKnowledgePointIds, []);
  assert.deepEqual(normalized.selectedPatternGroupIds, []);
  assert.ok(normalized.selectorWarnings.some((warning) => warning.code === SELECTOR_WARNING_CODES.NO_VISIBLE_KNOWLEDGE_POINTS));
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

test("selector setters fall back safely when there are no visible candidates", () => {
  const state = createConfigState();

  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  setBatchASelectedKnowledgePointIds(state, ["kp_g3a_u02_add_multi_carry"]);

  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_SOURCE);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, []);
});

test("worksheet plan preserves selector-safe fields without enabling KP generation", () => {
  const state = createConfigState();
  const plan = getBatchAWorksheetPlan(state);

  assert.equal(plan.sourceId, "g3a_u02_3a02");
  assert.equal(plan.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(plan.selectedKnowledgePointIds, []);
  assert.deepEqual(plan.selectedPatternGroupIds, []);
});
