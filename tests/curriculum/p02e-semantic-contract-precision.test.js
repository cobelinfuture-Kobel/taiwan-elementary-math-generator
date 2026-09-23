import test from "node:test";
import assert from "node:assert/strict";

import { materializeP02EQuantitySemanticRoleBindingConsumer } from "../../src/curriculum/full-product/p02e-quantity-semantic-role-binding-consumer.mjs";

const EXPECTED_OVERRIDE_IDS = [
  "kp_effective_speed_current_wind",
  "kp_fraction_times_integer_quantity",
  "kp_g4a_u10_route_distance_application",
  "kp_g5b_u09_time_quantity_divided_by_integer",
  "kp_g5b_u09_time_quantity_times_integer",
  "kp_g5b_u10a_large_unit_estimation_application",
  "kp_relative_speed_meeting_chasing",
  "kp_speed_unit_conversion",
  "kp_time_add_sub_with_regrouping",
];

const EXPECTED_FAMILY_COUNTS = {
  ADDITIVE_CHANGE: 4,
  AVERAGE_SPEED: 1,
  EFFECTIVE_SPEED_COMPOSITION: 1,
  EQUAL_GROUPS_TOTAL: 1,
  EQUAL_TIME_GROUPS_TOTAL: 1,
  EQUIVALENT_RATE_REPRESENTATION: 1,
  FRACTIONAL_QUANTITY_SCALING: 1,
  MULTIPLICATIVE_COMPARISON: 1,
  PARTITIVE_TIME_DIVISION: 1,
  QUANTITY_COMPARISON: 6,
  QUANTITY_ESTIMATION_DECISION: 1,
  RELATIVE_SPEED_COMPOSITION: 1,
  ROUTE_DISTANCE_TOTAL: 1,
  SPEED_DISTANCE_TIME: 1,
  TIME_INTERVAL: 3,
  TIME_QUANTITY_ADDITIVE_CHANGE: 1,
};

test("P02E exact authority overrides and family distribution remain stable", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const actualOverrideIds = runtime.bindings
    .filter((row) => row.classificationRuleId.startsWith("override:"))
    .map((row) => row.knowledgePointId)
    .sort();
  assert.deepEqual(actualOverrideIds, EXPECTED_OVERRIDE_IDS);
  assert.equal(runtime.metrics.authorityOverrideBindingCount, 9);
  assert.equal(runtime.metrics.genericFallbackBindingCount, 0);
  assert.equal(runtime.metrics.dependentSourceNodeCount, 13);
  assert.equal(runtime.metrics.sourceKnowledgePointBindingCount, 32);
  assert.equal(runtime.metrics.fixedRoleBindingCount, 8);
  assert.equal(runtime.metrics.sourceDeclaredRoleBindingCount, 18);
  assert.deepEqual(runtime.metrics.relationFamilyCounts, EXPECTED_FAMILY_COUNTS);
});

test("P02E retains only the mathematically multi-target speed relation as source-declared-only", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const sourceDeclaredOnly = runtime.bindings.filter((row) => row.targetRoleMode === "SOURCE_DECLARED_ONLY");
  assert.deepEqual(sourceDeclaredOnly.map((row) => row.knowledgePointId), ["kp_speed_distance_time_relation"]);
  assert.deepEqual([...sourceDeclaredOnly[0].allowedTargetRoleIds].sort(), [
    "DISTANCE",
    "ELAPSED_TIME",
    "SOURCE_DECLARED_TARGET_RATE_QUANTITY",
    "SPEED",
  ]);
});
