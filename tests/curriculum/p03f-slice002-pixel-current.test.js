import test from "node:test";
import assert from "node:assert/strict";

import {
  getCurrentPixelRegistrySnapshot,
  listCurrentPixelSourceOptions,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";

const SOURCE_ID = "g3a_u08_3a08";
const EXPECTED_KPS = new Set([
  "kp_g3a_u08_part_whole_fraction",
  "kp_g3a_u08_discrete_set_fraction",
  "kp_g3a_u08_unit_fraction_accumulation",
]);

test("P03F2 current Pixel consumes the three-KP G3A-U08 successor surface", () => {
  const sources = listCurrentPixelSourceOptions();
  assert.equal(sources.length, 20);
  const source = sources.find((row) => row.sourceId === SOURCE_ID);
  assert.ok(source);
  assert.equal(source.visibleKnowledgePointCount, 3);
  const knowledgePoints = listPixelKnowledgePointsForSource(SOURCE_ID);
  assert.equal(knowledgePoints.length, 3);
  assert.deepEqual(new Set(knowledgePoints.map((row) => row.knowledgePointId)), EXPECTED_KPS);
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 20);
  assert.ok(snapshot.visibleKnowledgePointCount >= 6);
  assert.equal(snapshot.bySourceId[SOURCE_ID].visibleKnowledgePoints.length, 3);
});
