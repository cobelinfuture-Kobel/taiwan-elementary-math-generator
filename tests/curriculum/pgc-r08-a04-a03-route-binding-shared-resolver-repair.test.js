import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding.js";

const plan = JSON.parse(await readFile(
  "data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-shared-resolver-repair-plan.json",
  "utf8",
));
const wrapper = await readFile(
  "site/modules/curriculum/public/public-ui-capability-binding.js",
  "utf8",
);

const cases = [
  {
    routeId: "pgc_r03_g3a_u01_3a01_application_078745248eea",
    input: {
      sourceId: "g3a_u01_3a01",
      surfaceId: "CLASSIC",
      selectionMode: "mixedKnowledgePointsSameUnit",
      selectedKnowledgePointIds: [
        "kp_g3a_u01_4digit_compare",
        "kp_g3a_u01_number_to_chinese",
        "kp_g3a_u01_chinese_to_number",
        "kp_g3a_u01_digit_place_value_decomposition",
        "kp_g3a_u01_place_value_composition",
        "kp_g3a_u01_place_value_unit_conversion",
        "kp_g3a_u01_digit_arrangement_max_min",
        "kp_g3a_u01_range_reasoning",
      ],
      selectedPatternGroupIds: ["pg_g3a_u01_4digit_compare", "pg_g3a_u01_range_reasoning"],
      requestedQuestionType: "application",
    },
  },
  {
    routeId: "pgc_r03_g5a_u08_5a08_mixed_03df3be246bd",
    input: {
      sourceId: "g5a_u08_5a08",
      surfaceId: "CLASSIC",
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: ["kp_g5a_u08_distributive_expand"],
      selectedPatternGroupIds: [
        "pg_g5a_u08_distributive_expand_numeric",
        "pg_g5a_u08_distributive_expand_application",
      ],
      requestedQuestionType: "mixed",
      requestedDepthMode: "mixed",
      requestedContextMode: "daily_life",
    },
  },
  {
    routeId: "pgc_r03_g5a_u08_5a08_reasoning_0efbf0e4b052",
    input: {
      sourceId: "g5a_u08_5a08",
      surfaceId: "CLASSIC",
      selectionMode: "mixedKnowledgePointsSameUnit",
      selectedKnowledgePointIds: [
        "kp_g5a_u08_mixed_operation_order",
        "kp_g5a_u08_add_sub_equivalent_regroup",
        "kp_g5a_u08_mul_div_equivalent_regroup",
        "kp_g5a_u08_distributive_expand",
        "kp_g5a_u08_common_factor_extract",
        "kp_g5a_u08_near_round_add_compensation",
        "kp_g5a_u08_near_round_sub_compensation",
        "kp_g5a_u08_near_round_multiply_compensation",
        "kp_g5a_u08_missing_operator_inference",
        "kp_g5a_u08_equivalence_error_judgement",
        "kp_g5a_u08_average_inverse_update",
      ],
      selectedPatternGroupIds: [
        "pg_g5a_u08_mixed_operation_order_numeric",
        "pg_g5a_u08_mixed_operation_order_application",
        "pg_g5a_u08_mul_div_regroup_numeric",
        "pg_g5a_u08_mul_div_regroup_application",
        "pg_g5a_u08_distributive_expand_numeric",
        "pg_g5a_u08_distributive_expand_application",
        "pg_g5a_u08_common_factor_numeric",
        "pg_g5a_u08_common_factor_application",
        "pg_g5a_u08_near_round_multiply_numeric",
        "pg_g5a_u08_near_round_multiply_application",
        "pg_g5a_u08_average_application",
        "pg_g5a_u08_average_reasoning",
      ],
      requestedQuestionType: "reasoning",
      requestedDepthMode: "N",
      requestedContextMode: "mixed",
    },
  },
  {
    routeId: "pgc_r03_g6a_u01_6a01_application_4a04b80c1628",
    input: {
      sourceId: "g6a_u01_6a01",
      surfaceId: "CLASSIC",
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: ["kp_g6a_u01_least_common_multiple"],
      selectedPatternGroupIds: ["pg_g6a_u01_least_common_multiple"],
      requestedQuestionType: "application",
    },
  },
];

test("A03 repair preserves exact capacity route identity for all four canaries", () => {
  for (const witness of cases) {
    const binding = resolvePublicUiCapabilityBinding(witness.input);
    assert.equal(binding.blocked, false, witness.routeId);
    assert.equal(binding.questionType, witness.input.requestedQuestionType, witness.routeId);
    assert.ok(binding.availableQuestionTypeOptions.some(
      (option) => option.value === witness.input.requestedQuestionType,
    ), witness.routeId);
    assert.ok(binding.capacityRouteIds.includes(witness.routeId), witness.routeId);
    assert.equal(binding.questionCount.min, 1, witness.routeId);
    assert.equal(binding.questionCount.default, 20, witness.routeId);
    assert.equal(binding.questionCount.max, 240, witness.routeId);
  }
});

test("A03 repair is shared, capacity-authority preserving and contains no route-specific branches", () => {
  assert.equal(plan.repairContract.exactCapacityRowIsRouteIdentityAuthority, true);
  assert.equal(plan.repairContract.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.repairContract.perRoutePatchAllowed, false);
  assert.match(wrapper, /exactCapacityBinding/);
  assert.match(wrapper, /STRUCTURAL_FALLBACK_EXACT_ROUTE_AVAILABLE/);
  for (const witness of cases) assert.doesNotMatch(wrapper, new RegExp(witness.routeId));
});
