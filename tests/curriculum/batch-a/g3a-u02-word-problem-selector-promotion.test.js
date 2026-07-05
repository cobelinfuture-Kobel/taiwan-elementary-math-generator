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

const SOURCE_ID = "g3a_u02_3a02";
const KP_ID = "kp_g3a_u02_word_problem_estimation_add_sub";
const GROUP_ID = "pg_g3a_u02_word_problem_estimation_add_sub";
const SPEC_ID = "ps_g3a_u02_word_problem_estimation_add_sub";

test("S43G2P selector extension exposes word-problem KP", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 4);
  assert.equal(availability.visibleCount, 4);
  assert.equal(availability.notSelectableCount, 0);
  assert.equal(getVisibleBatchAKnowledgePoint(KP_ID)?.displayName, "加減應用題估算");
  assert.equal(getVisiblePatternGroupsForKnowledgePoint(KP_ID)[0]?.patternGroupId, GROUP_ID);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP_ID), [SPEC_ID]);
});

test("S43G2P resolver accepts word-problem KP as a single-KP selection", () => {
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
