import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createConfigState } from "../../site/assets/browser/state/config-state.js";
import { parseQueryState } from "../../site/assets/browser/state/query-state.js";
import {
  getBatchASourceUnit,
  isBatchASourceId,
  listBatchASourceUnits,
} from "../../site/modules/curriculum/batch-a/source-units.js";

const SOURCE_ID = "g4b_u04_4b04";
const adapter = readFileSync(
  new URL("../../site/assets/browser/g4b-u04-public-controls.js", import.meta.url),
  "utf8",
);

test("G4B-U04 query-backed source replay is owned by the public registry and main config state", () => {
  assert.equal(isBatchASourceId(SOURCE_ID), true);
  assert.equal(getBatchASourceUnit(SOURCE_ID)?.lifecycle, "public_canonical_specialized_release");
  assert.equal(
    listBatchASourceUnits({ includePublicCandidates: true }).some((unit) => unit.sourceId === SOURCE_ID),
    true,
  );

  const queryState = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=mixedKnowledgePointsSameUnit`);
  const state = createConfigState({ queryState });
  assert.equal(state.batchA.sourceId, SOURCE_ID);
});

test("G4B-U04 control adapter cannot reapply a stale source query after the user switches units", () => {
  assert.doesNotMatch(adapter, /source\.value\s*=\s*G4B_U04_SOURCE_ID/);
  assert.doesNotMatch(adapter, /queryParam\("sourceId"\)/);
  assert.doesNotMatch(adapter, /s74PublicSource|insertBefore/);
});
