import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  getS74PixelSourceSummary,
  listPixelSourceOptions,
  listPixelSourceOptionsByFilter,
} from "../../site/pixel/pixel-registry-bridge.js";

function readText(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

test("S74 exposes the 13-KP G4B-U04 effective overlay without changing legacy release registries", () => {
  const legacyIds = listBatchASourceUnits().map((unit) => unit.sourceId);
  assert.equal(legacyIds.length, 13);
  assert.equal(legacyIds.includes("g4b_u04_4b04"), false);
  assert.equal(listPixelSourceOptions().length, 13);
  assert.deepEqual(
    listPixelSourceOptionsByFilter({ grade: 4, semester: "lower" }).map((unit) => unit.sourceId),
    ["g4b_u01_4b01"],
  );

  const g4bU04 = getS74PixelSourceSummary("g4b_u04_4b04");
  assert.ok(g4bU04);
  assert.equal(g4bU04.unitCode, "4B-U04");
  assert.equal(g4bU04.title, "概數");
  assert.equal(g4bU04.visibleKnowledgePoints.length, 13);

  const pixelBridge = readText("site/pixel/pixel-registry-bridge.js");
  assert.match(pixelBridge, /typeof document === "undefined"/);
  assert.match(pixelBridge, /listS74PixelSourceOptions/);

  const classicAdapter = readText("site/assets/browser/g4b-u04-public-controls.js");
  assert.match(classicAdapter, /4B-U04 概數/);
  assert.match(classicAdapter, /s74PublicSource/);
  assert.match(classicAdapter, /insertBefore/);
});
