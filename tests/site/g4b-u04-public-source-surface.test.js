import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  listBatchASourceUnits,
  listFullProductPublicSourceUnits,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  getS74PixelSourceSummary,
  listPixelSourceOptions,
  listPixelSourceOptionsByFilter,
} from "../../site/pixel/pixel-registry-bridge.js";

function readText(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

test("R4 keeps the legacy 13-unit baseline while P01E publishes G4B-U04 and the nineteen-source Pixel fleet", () => {
  const legacyIds = listBatchASourceUnits({ includePublicCandidates: false })
    .map((unit) => unit.sourceId);
  assert.equal(legacyIds.length, 13);
  assert.equal(legacyIds.includes("g4b_u04_4b04"), false);

  const protectedPublicIds = listBatchASourceUnits({ includePublicCandidates: true })
    .map((unit) => unit.sourceId);
  assert.equal(protectedPublicIds.length, 15);
  assert.equal(protectedPublicIds.includes("g4b_u04_4b04"), true);

  const fullPublicIds = listFullProductPublicSourceUnits().map((unit) => unit.sourceId);
  assert.equal(fullPublicIds.length, 19);
  assert.equal(listPixelSourceOptions().length, 19);
  assert.deepEqual(
    listPixelSourceOptionsByFilter({ grade: 4, semester: "lower" })
      .map((unit) => unit.sourceId),
    ["g4b_u01_4b01", "g4b_u04_4b04"],
  );

  const g4bU04 = getS74PixelSourceSummary("g4b_u04_4b04");
  assert.ok(g4bU04);
  assert.equal(g4bU04.unitCode, "4B-U04");
  assert.equal(g4bU04.title, "概數");
  assert.equal(g4bU04.visibleKnowledgePoints.length, 13);

  const sourceRegistry = readText("site/modules/curriculum/batch-a/source-units.js");
  assert.match(sourceRegistry, /g4b_u04_4b04/);
  assert.match(sourceRegistry, /public_canonical_specialized_release/);
  assert.match(sourceRegistry, /FULL_PRODUCT_PUBLIC_SOURCE_UNITS/);

  const pixelBridge = readText("site/pixel/pixel-registry-bridge.js");
  assert.match(pixelBridge, /listFullProductPublicSourceUnits/);
  assert.match(pixelBridge, /listS74PixelSourceOptions/);

  const classicAdapter = readText("site/assets/browser/g4b-u04-public-controls.js");
  assert.match(classicAdapter, /G4B_U04_SOURCE_ID/);
  assert.doesNotMatch(classicAdapter, /s74PublicSource/);
  assert.doesNotMatch(classicAdapter, /insertBefore/);
});
