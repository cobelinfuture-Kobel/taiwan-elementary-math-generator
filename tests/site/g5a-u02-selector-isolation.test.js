import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditBatchASelectorComposition,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G5A_U02_SELECTOR_SOURCE_ID,
  auditG5AU02SelectorProjection,
  listG5AU02SelectorRows,
} from "../../site/modules/curriculum/registry/g5a-u02-selector-projection.js";

const G4A_SOURCE_ID = "g4a_u08_4a08";

test("S96J G5A-U02 projection is independently valid", () => {
  assert.deepEqual(auditG5AU02SelectorProjection(), {
    ok: true,
    errors: [],
    knowledgePointCount: 18,
    patternSpecCount: 22,
  });
});

test("S96J shared composer preserves 18 G5A-U02 rows without G4A-U08 contamination", () => {
  assert.deepEqual(auditBatchASelectorComposition(), { ok: true, errors: [] });
  const rows = listVisibleBatchAKnowledgePoints();
  const g5aRows = rows.filter((row) => row.sourceId === G5A_U02_SELECTOR_SOURCE_ID);
  assert.equal(g5aRows.length, 18);
  assert.ok(g5aRows.every((row) => row.unitCode === "5A-U02" && row.unitTitle === "因數與公因數"));
  assert.ok(g5aRows.every((row) => !String(row.knowledgePointId).includes("g4a_u08")));
  assert.ok(g5aRows.every((row) => !String(row.canonicalSkillTag).includes("g4a_u08")));

  const g4aRows = rows.filter((row) => row.sourceId === G4A_SOURCE_ID);
  assert.ok(g4aRows.length > 0);
  assert.ok(g4aRows.every((row) => !String(row.knowledgePointId).includes("g5a_u02")));
});

test("S96J availability and pattern resolution remain source-isolated", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U02_SELECTOR_SOURCE_ID);
  assert.deepEqual(availability, {
    sourceId: G5A_U02_SELECTOR_SOURCE_ID,
    visibleCount: 18,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
  });
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G5A_U02_SELECTOR_SOURCE_ID].visibleCount, 18);

  for (const row of listG5AU02SelectorRows()) {
    const composed = getVisibleBatchAKnowledgePoint(row.knowledgePointId);
    assert.equal(composed.sourceId, G5A_U02_SELECTOR_SOURCE_ID);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId), row.patternSpecIds);
  }
});

test("S96J production entry uses shared composer instead of G5A-over-G4A extension chain", async () => {
  const entry = await readFile("site/modules/curriculum/registry/batch-a-selector-extension.js", "utf8");
  const composer = await readFile("site/modules/curriculum/registry/batch-a-selector-composer.js", "utf8");
  const projection = await readFile("site/modules/curriculum/registry/g5a-u02-selector-projection.js", "utf8");
  assert.match(entry, /batch-a-selector-composer\.js/);
  assert.doesNotMatch(entry, /batch-a-selector-g5a-u02-extension\.js/);
  assert.match(composer, /g5a-u02-selector-projection\.js/);
  assert.match(composer, /batch-a-selector-g4a-u08-extension\.js/);
  assert.doesNotMatch(projection, /g4a-u08/);
  assert.doesNotMatch(projection, /batch-a-selector-g4a-u08-extension/);
});
