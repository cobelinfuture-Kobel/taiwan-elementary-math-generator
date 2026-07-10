import test from "node:test";
import assert from "node:assert/strict";

import {
  applyPixelWorksheetSettings,
  createPixelWorksheetState,
  getPixelWorksheetPlan,
  syncPixelWorksheetSelection
} from "../../site/pixel/pixel-worksheet-state.js";
import {
  BATCH_A_SELECTION_MODES,
  createPixelKnowledgePointSelectorState
} from "../../site/pixel/pixel-selector-state.js";

test("Pixel worksheet state uses shared Batch A config state defaults", () => {
  const state = createPixelWorksheetState({ sourceId: "g3a_u02_3a02" });
  const plan = getPixelWorksheetPlan(state);
  assert.equal(plan.sourceId, "g3a_u02_3a02");
  assert.equal(plan.questionCount, 20);
  assert.equal(plan.ordering, "groupedByPattern");
  assert.equal(plan.includeAnswerKey, true);
  assert.equal(plan.generationSeed, "pixel-ui");
  assert.deepEqual(plan.printLayout, {
    columns: 4,
    rowsPerPage: 10,
    showAnswerKeyPage: true
  });
});

test("Pixel worksheet settings update question count ordering answer key seed and print layout", () => {
  const state = createPixelWorksheetState({ sourceId: "g3a_u02_3a02" });
  const plan = applyPixelWorksheetSettings(state, {
    questionCount: 48,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: false,
    generationSeed: "pixel-seed-48",
    columns: 3,
    rowsPerPage: 8
  });
  assert.equal(plan.questionCount, 48);
  assert.equal(plan.ordering, "shuffleAcrossPatterns");
  assert.equal(plan.includeAnswerKey, false);
  assert.equal(plan.generationSeed, "pixel-seed-48");
  assert.deepEqual(plan.printLayout, {
    columns: 3,
    rowsPerPage: 8,
    showAnswerKeyPage: false
  });
});

test("Pixel worksheet state preserves shared question-count and print-layout bounds", () => {
  const state = createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount: 999,
    columns: 99,
    rowsPerPage: 99
  });
  const plan = getPixelWorksheetPlan(state);
  assert.equal(plan.questionCount, 200);
  assert.equal(plan.printLayout.columns, 4);
  assert.equal(plan.printLayout.rowsPerPage, 10);
});

test("Pixel worksheet selection sync maps shared selector state into worksheet plan", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: "g4a_u08_4a08",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT
  });
  const state = createPixelWorksheetState({ sourceId: "g4a_u08_4a08" });
  const plan = syncPixelWorksheetSelection(state, {
    sourceId: "g4a_u08_4a08",
    selectorState
  });
  assert.equal(plan.sourceId, "g4a_u08_4a08");
  assert.equal(plan.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.equal(plan.selectedKnowledgePointIds.length, 1);
  assert.equal(plan.selectedPatternGroupIds.length, 1);
});
