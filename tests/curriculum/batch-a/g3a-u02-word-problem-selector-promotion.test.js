import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = ["g3a", "u02", "3a02"].join("_");
const suffix = [119,111,114,100,95,112,114,111,98,108,101,109,95,101,115,116,105,109,97,116,105,111,110,95,97,100,100,95,115,117,98].map((code) => String.fromCharCode(code)).join("");
const KP_ID = `kp_g3a_u02_${suffix}`;
const GROUP_ID = `pg_g3a_u02_${suffix}`;
const SPEC_ID = `ps_g3a_u02_${suffix}`;

test("S43G2P selector extension exposes context KP after G3A U06 overlay", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 10);
  assert.equal(availability.visibleCount, 4);
  assert.equal(availability.notSelectableCount, 0);
  assert.equal(getVisibleBatchAKnowledgePoint(KP_ID)?.displayName.length > 0, true);
  assert.equal(getVisiblePatternGroupsForKnowledgePoint(KP_ID)[0]?.patternGroupId, GROUP_ID);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP_ID), [SPEC_ID]);
});

test("S43G2P resolver accepts context KP as a single-KP selection", () => {
  const plan = resolveVisiblePatternGroupSelection({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionCount: 4,
    generationSeed: "s43g2p"
  });

  assert.equal(plan.ok, true);
  assert.deepEqual(plan.knowledgePointIds, [KP_ID]);
  assert.deepEqual(plan.patternGroupIds, [GROUP_ID]);
  assert.deepEqual(plan.patternSpecIds, [SPEC_ID]);
});
