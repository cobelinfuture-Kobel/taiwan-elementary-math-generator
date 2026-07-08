import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTION_MODES,
  WORKSHEET_MODES,
  createConfigState
} from "../../site/assets/browser/state/config-state.js";

const CURRENT_VISIBLE_KP_COUNT = 58;

test("Batch A selector state defaults to source-unit mode with current visible KP counts", () => {
  const state = createConfigState();
  assert.equal(state.worksheetMode, WORKSHEET_MODES.BATCH_A_SOURCE);
  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, []);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, []);
  assert.equal(state.batchA.selectorAvailability.visibleCount, CURRENT_VISIBLE_KP_COUNT);
  assert.equal(state.batchA.selectorAvailability.bySourceId.g3a_u01_3a01.visibleCount, 8);
  assert.equal(state.batchA.selectorAvailability.bySourceId.g3a_u02_3a02.visibleCount, 10);
  assert.equal(state.batchA.selectorAvailability.bySourceId.g3a_u03_3a03.visibleCount, 7);
  assert.equal(state.batchA.selectorAvailability.bySourceId.g3b_u01_3b01.visibleCount, 10);
  assert.equal(state.batchA.selectorAvailability.bySourceId.g4a_u01_4a01.visibleCount, 17);
  assert.equal(state.batchA.selectorAvailability.hiddenPendingCount, 0);
  assert.equal(state.batchA.selectorAvailability.notSelectableCount, 0);
});
