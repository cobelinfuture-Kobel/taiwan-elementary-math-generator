import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  listPixelSourceOptions,
  listPixelSourceOptionsByFilter,
} from "../../site/pixel/pixel-registry-bridge.js";

function readText(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

test("S74 exposes G4B-U04 on public surfaces without changing legacy release registries", () => {
  const legacyIds = listBatchASourceUnits().map((unit) => unit.sourceId);
  assert.equal(legacyIds.length, 13);
  assert.equal(legacyIds.includes("g4b_u04_4b04"), false);
  assert.equal(listPixelSourceOptions().length, 13);

  const lowerGrade4Sources = listPixelSourceOptionsByFilter({ grade: 4, semester: "lower" });
  const g4bU04 = lowerGrade4Sources.find((unit) => unit.sourceId === "g4b_u04_4b04");
  assert.ok(g4bU04);
  assert.equal(g4bU04.unitCode, "4B-U04");
  assert.equal(g4bU04.title, "概數");
  assert.equal(g4bU04.visibleKnowledgePointCount, 12);

  const classicAdapter = readText("site/assets/browser/g4b-u04-public-controls.js");
  assert.match(classicAdapter, /4B-U04 概數/);
  assert.match(classicAdapter, /s74PublicSource/);
  assert.match(classicAdapter, /insertBefore/);
});
