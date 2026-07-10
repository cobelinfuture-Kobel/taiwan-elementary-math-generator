import test from "node:test";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const sourceId = "g3b_u01_3b01";
const rows = [
  ["kp_g3b_u01_2digit_division_place_value_cases", "pg_g3b_u01_2digit_division_place_value_cases"],
  ["kp_g3b_u01_3digit_by_1digit_regroup_hundreds", "pg_g3b_u01_3digit_by_1digit_regroup_hundreds"],
  ["kp_g3b_u01_3digit_division_place_value_cases", "pg_g3b_u01_3digit_division_place_value_cases"],
  ["kp_g3b_u01_quotient_zero_cases", "pg_g3b_u01_quotient_zero_cases"],
  ["kp_g3b_u01_division_with_remainder", "pg_g3b_u01_division_with_remainder"],
  ["kp_g3b_u01_wp_partitive_division", "pg_g3b_u01_wp_partitive_division"],
  ["kp_g3b_u01_wp_quotative_division", "pg_g3b_u01_wp_quotative_division"],
  ["kp_g3b_u01_wp_division_with_remainder", "pg_g3b_u01_wp_division_with_remainder"],
  ["kp_g3b_u01_wp_remainder_interpretation", "pg_g3b_u01_wp_remainder_interpretation"],
  ["kp_g3b_u01_wp_two_step_division", "pg_g3b_u01_wp_two_step_division"]
];

test("S57F3 diagnostic legacy G3B-U01 resolver plan", () => {
  const plan = buildBatchABrowserPlan({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: rows.map((row) => row[0]),
    selectedPatternGroupIds: rows.map((row) => row[1]),
    questionCount: 30,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s57f3-diagnostic"
  });
  throw new Error(`S57F3_DIAGNOSTIC\n${JSON.stringify(plan, null, 2)}`);
});
