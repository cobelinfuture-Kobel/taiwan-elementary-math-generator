import test from "node:test";
import assert from "node:assert/strict";
import { BATCH_A_SELECTOR_AVAILABILITY, listVisibleBatchAKnowledgePoints } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

test("selector visible count smoke", () => {
  assert.equal(listVisibleBatchAKnowledgePoints().length, BATCH_A_SELECTOR_AVAILABILITY.visibleCount);
});
