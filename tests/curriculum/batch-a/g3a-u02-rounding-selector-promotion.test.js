import test from "node:test";
import assert from "node:assert/strict";
import { BATCH_A_SELECTOR_AVAILABILITY } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const CURRENT_VISIBLE_KP_COUNT = 75;

test("selector visible count smoke", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, CURRENT_VISIBLE_KP_COUNT);
});
