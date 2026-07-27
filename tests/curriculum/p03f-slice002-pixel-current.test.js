import test from "node:test";
import assert from "node:assert/strict";

import { P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  listVisibleBatchAKnowledgePoints,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f2-extension.js";

const SOURCE_ID = "g3a_u08_3a08";
const EXPECTED_KPS = new Set([
  "kp_g3a_u08_part_whole_fraction",
  "kp_g3a_u08_discrete_set_fraction",
  "kp_g3a_u08_unit_fraction_accumulation",
]);

test("P03F2 explicit historical Pixel authority remains a 20-source three-KP snapshot", () => {
  assert.equal(P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 20);
  const source = P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.find((row) => row.sourceId === SOURCE_ID);
  assert.ok(source);
  const knowledgePoints = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(knowledgePoints.length, 3);
  assert.deepEqual(new Set(knowledgePoints.map((row) => row.knowledgePointId)), EXPECTED_KPS);
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 3);
  assert.equal(availability.hiddenPendingCount, 4);
});
