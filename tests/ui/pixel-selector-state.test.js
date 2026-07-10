import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTION_MODES,
  createPixelKnowledgePointSelectorState,
  listPixelKnowledgePointModeOptions,
  PIXEL_SELECTOR_WARNING_CODES,
  togglePixelKnowledgePointSelection
} from "../../site/pixel/pixel-selector-state.js";
import { listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const SOURCE_ID = "g4a_u08_4a08";

function visibleKnowledgePointIds() {
  return listPixelKnowledgePointsForSource(SOURCE_ID).map((entry) => entry.knowledgePointId);
}

test("Pixel knowledge point modes follow shared visible-count availability", () => {
  const ids = visibleKnowledgePointIds();
  assert.equal(ids.length >= 4, true);
  const modes = listPixelKnowledgePointModeOptions(SOURCE_ID);
  assert.deepEqual(modes.map((entry) => entry.value), [
    BATCH_A_SELECTION_MODES.SOURCE_UNIT,
    BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT
  ]);
  assert.equal(modes.every((entry) => entry.disabled === false), true);
});

test("Pixel single-KP selector defaults to one visible KnowledgePoint and one PatternGroup", () => {
  const ids = visibleKnowledgePointIds();
  const state = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT
  });
  assert.equal(state.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(state.selectedKnowledgePointIds, [ids[0]]);
  assert.equal(state.selectedPatternGroupIds.length, 1);
  assert.equal(state.warnings.length, 0);
});

test("Pixel mixed-KP selector selects same-unit visible KnowledgePoints and enforces minimum two", () => {
  const ids = visibleKnowledgePointIds();
  let state = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: ids.slice(0, 2)
  });
  assert.deepEqual(state.selectedKnowledgePointIds, ids.slice(0, 2));
  assert.equal(state.selectedPatternGroupIds.length, 2);

  state = togglePixelKnowledgePointSelection(state, ids[0]);
  assert.deepEqual(state.selectedKnowledgePointIds, ids.slice(0, 2));
  assert.equal(state.warnings[0].code, PIXEL_SELECTOR_WARNING_CODES.MIXED_MINIMUM_TWO);

  state = togglePixelKnowledgePointSelection(state, ids[2]);
  assert.deepEqual(new Set(state.selectedKnowledgePointIds), new Set(ids.slice(0, 3)));
  assert.equal(state.selectedPatternGroupIds.length, 3);
});

test("Pixel selector drops unknown KnowledgePoint IDs and never exposes them as selected", () => {
  const ids = visibleKnowledgePointIds();
  const state = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_hidden_or_unknown", ids[1]]
  });
  assert.deepEqual(state.selectedKnowledgePointIds, [ids[1]]);
  assert.equal(state.warnings.some((warning) => warning.code === PIXEL_SELECTOR_WARNING_CODES.KNOWLEDGE_POINT_DROPPED), true);
});

test("Pixel source-unit mode clears KnowledgePoint and PatternGroup selection", () => {
  const ids = visibleKnowledgePointIds();
  const state = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
    selectedKnowledgePointIds: ids
  });
  assert.deepEqual(state.selectedKnowledgePointIds, []);
  assert.deepEqual(state.selectedPatternGroupIds, []);
});
