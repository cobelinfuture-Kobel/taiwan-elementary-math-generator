import test from "node:test";
import assert from "node:assert/strict";

import {
  materializeP02EQuantitySemanticRoleBindingConsumer,
  resolveP02EQuantitySemanticRoleBinding,
} from "../../src/curriculum/full-product/p02e-quantity-semantic-role-binding-consumer.mjs";

const Q023_KP_ID = "kp_g5b_u09_repeated_schedule_time";
const SOURCE_ID = "g5b_u09_5b09";
const RELATION = "REPEATED_SCHEDULE_TIME_ACCUMULATION";
const TARGET = "TOTAL_SCHEDULE_TIME_QUANTITY";

test("P04F23 q023 uses an exact repeated-schedule accumulation binding", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const binding = runtime.getBinding(Q023_KP_ID);

  assert.ok(binding);
  assert.equal(binding.classificationRuleId, `override:${Q023_KP_ID}`);
  assert.equal(binding.relationFamilyId, RELATION);
  assert.deepEqual(binding.knownRoleIds, [
    "SCHEDULE_STAGE_TIME_QUANTITIES",
    "STAGE_REPEAT_COUNTS",
    "INCLUDED_WAIT_REST_TIME_QUANTITIES",
  ]);
  assert.equal(binding.targetRoleId, TARGET);
  assert.equal(binding.targetRoleMode, "FIXED");
  assert.deepEqual(binding.allowedTargetRoleIds, [TARGET]);
  assert.deepEqual(binding.sourceNodeIds, [SOURCE_ID]);
});

test("P04F23 q023 resolves through the source-backed exact relation and rejects generic TIME_INTERVAL", () => {
  const exact = resolveP02EQuantitySemanticRoleBinding({
    knowledgePointId: Q023_KP_ID,
    sourceNodeId: SOURCE_ID,
    assertedRelationFamilyId: RELATION,
    assertedTargetRoleId: TARGET,
  });
  assert.equal(exact.ok, true, exact.errors?.join("\n"));
  assert.equal(exact.binding.relationFamilyId, RELATION);
  assert.equal(exact.binding.targetRoleId, TARGET);

  const staleGeneric = resolveP02EQuantitySemanticRoleBinding({
    knowledgePointId: Q023_KP_ID,
    sourceNodeId: SOURCE_ID,
    assertedRelationFamilyId: "TIME_INTERVAL",
  });
  assert.equal(staleGeneric.ok, false);
  assert.match(staleGeneric.errors[0], /^P02E_RELATION_FAMILY_MISMATCH:/);
});

test("P04F23 reconciliation preserves q022/q025 exact relations and only reclassifies q023", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const q022 = runtime.getBinding("kp_g5b_u09_time_quantity_times_integer");
  const q025 = runtime.getBinding("kp_g5b_u09_time_quantity_divided_by_integer");

  assert.equal(q022?.relationFamilyId, "EQUAL_TIME_GROUPS_TOTAL");
  assert.equal(q025?.relationFamilyId, "PARTITIVE_TIME_DIVISION");
  assert.equal(runtime.metrics.effectiveDependentKnowledgePointCount, 26);
  assert.equal(runtime.metrics.classifiedKnowledgePointCount, 26);
  assert.equal(runtime.metrics.classificationErrorCount, 0);
  assert.equal(runtime.metrics.authorityOverrideBindingCount, 10);
  assert.equal(runtime.metrics.fixedRoleBindingCount, 9);
  assert.equal(runtime.metrics.sourceDeclaredRoleBindingCount, 17);
  assert.equal(runtime.metrics.relationFamilyCounts.REPEATED_SCHEDULE_TIME_ACCUMULATION, 1);
  assert.equal(runtime.metrics.relationFamilyCounts.TIME_INTERVAL, 2);
});
