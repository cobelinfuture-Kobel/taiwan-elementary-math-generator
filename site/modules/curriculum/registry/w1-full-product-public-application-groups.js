const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const rows = [
  ["p01e_app_pg_g5b_u05_digit_value", "pg_g5b_u05a_large_number_place_value", "g5b_u05_5b05a", "kp_g5b_u05a_large_number_place_value_extension", "ps_g5b_u05a_large_number_digit_value", "REL_DATA_PLACE_VALUE_V1"],
  ["p01e_app_pg_g5b_u05_read_write", "pg_g5b_u05a_large_number_read_write", "g5b_u05_5b05a", "kp_g5b_u05a_large_number_read_write", "ps_g5b_u05a_large_number_to_chinese", "REL_DATA_REPRESENTATION_V1"],
  ["p01e_app_pg_g5b_u05_power_ten", "pg_g5b_u05a_power_of_ten_scaling", "g5b_u05_5b05a", "kp_g5b_u05a_power_of_ten_scaling", "ps_g5b_u05a_multiply_power_of_ten", "REL_SCALE_BY_POWER_TEN_V1"],
  ["p01e_app_pg_g5b_u05_compare", "pg_g5b_u05a_large_number_decompose_compare", "g5b_u05_5b05a", "kp_g5b_u05a_large_number_decompose_compare", "ps_g5b_u05a_large_number_compare", "REL_COMPARE_DATA_TOTALS_V1"],
  ["p01e_app_pg_g6a_u01_gcf", "pg_g6a_u01_greatest_common_factor", "g6a_u01_6a01", "kp_g6a_u01_greatest_common_factor", "ps_g6a_u01_gcf_direct", "REL_MAX_EQUAL_GROUP_SIZE_V1"],
  ["p01e_app_pg_g6a_u01_lcm", "pg_g6a_u01_least_common_multiple", "g6a_u01_6a01", "kp_g6a_u01_least_common_multiple", "ps_g6a_u01_lcm_direct", "REL_REPEAT_CYCLE_MEETING_V1"],
  ["p01e_app_pg_g5a_u03_exact_grouping", "pg_g5a_u03a_exact_grouping_feasibility", "g5a_u03_5a03a", "kp_g5a_u03a_exact_grouping_feasibility", "ps_g5a_u03a_exact_grouping_yes_no", "REL_EXACT_GROUPING_FEASIBILITY_V1"],
  ["p01e_app_pg_g5a_u03_enumerate_multiples", "pg_g5a_u03a_multiple_identify_enumerate", "g5a_u03_5a03a", "kp_g5a_u03a_multiple_identify_enumerate", "ps_g5a_u03a_enumerate_first_multiples", "REL_REPEATING_INTERVAL_SEQUENCE_V1"],
  ["p01e_app_pg_g5a_u03_nearest_multiple", "pg_g5a_u03a_bounded_or_nearest_multiple", "g5a_u03_5a03a", "kp_g5a_u03a_bounded_or_nearest_multiple", "ps_g5a_u03a_nearest_multiple", "REL_NEAREST_PACKAGE_MULTIPLE_V1"],
  ["p01e_app_pg_g5a_u03_count_interval", "pg_g5a_u03a_count_multiples_interval", "g5a_u03_5a03a", "kp_g5a_u03a_count_multiples_interval", "ps_g5a_u03a_count_multiples_in_interval", "REL_COUNT_REPEATING_EVENTS_V1"],
  ["p01e_app_pg_g5a_u03a1_lcm", "pg_g5a_u03a1_common_multiple_lcm", "g5a_u03_5a03a1", "kp_g5a_u03a1_common_multiple_lcm", "ps_g5a_u03a1_lcm_direct", "REL_REPEAT_CYCLE_MEETING_V1"],
  ["p01e_app_pg_g5a_u03a1_bounded", "pg_g5a_u03a1_bounded_common_multiples", "g5a_u03_5a03a1", "kp_g5a_u03a1_bounded_common_multiples", "ps_g5a_u03a1_bounded_common_multiples", "REL_COMMON_SCHEDULE_OPTIONS_V1"],
  ["p01e_app_pg_g5a_u03a1_grouping", "pg_g5a_u03a1_grouping_constraints", "g5a_u03_5a03a1", "kp_g5a_u03a1_grouping_constraints", "ps_g5a_u03a1_minimum_common_group_total", "REL_MINIMUM_COMMON_TOTAL_V1"],
];

export const W1_FULL_PRODUCT_PUBLIC_APPLICATION_GROUPS = Object.freeze(rows.map(([
  patternGroupId, basePatternGroupId, sourceId, primaryKnowledgePointId, patternSpecId, templateFamilyId,
]) => Object.freeze({
  patternGroupId,
  basePatternGroupId,
  sourceId,
  primaryKnowledgePointId,
  knowledgePointIds: Object.freeze([primaryKnowledgePointId]),
  patternSpecIds: Object.freeze([patternSpecId]),
  displayName: "全域情境應用題",
  mode: "application",
  publicQuestionMode: "application",
  representationTag: "application_word_problem",
  representationTags: Object.freeze(["application_word_problem", "controlled_semantic_application", "full_product_w1"]),
  visibilityStatus: "visible",
  selectorStatus: "visible",
  productionUse: "allowed",
  productionAdmitted: true,
  publicQuerySelectable: true,
  globalContextAdmission: "P01E_W1_PUBLIC_UI_HTML_PDF_PRINT_CLOSEOUT_V1",
  templateFamilyId,
})));

const byKnowledgePoint = new Map();
const bySource = new Map();
const bySelectionId = new Map();
for (const row of W1_FULL_PRODUCT_PUBLIC_APPLICATION_GROUPS) {
  const kpRows = byKnowledgePoint.get(row.primaryKnowledgePointId) ?? [];
  kpRows.push(row);
  byKnowledgePoint.set(row.primaryKnowledgePointId, kpRows);
  const sourceRows = bySource.get(row.sourceId) ?? [];
  sourceRows.push(row);
  bySource.set(row.sourceId, sourceRows);
  bySelectionId.set(row.patternGroupId, row);
  bySelectionId.set(row.basePatternGroupId, row);
}

export function listW1FullProductPublicApplicationGroupsForKnowledgePoint(knowledgePointId) { return clone(byKnowledgePoint.get(knowledgePointId) ?? []); }
export function listW1FullProductPublicApplicationGroupsForSource(sourceId) { return clone(bySource.get(sourceId) ?? []); }
export function getW1FullProductPublicApplicationGroup(patternGroupId) { return clone(bySelectionId.get(patternGroupId) ?? null); }
export function listSelectedW1FullProductPublicApplicationGroups(patternGroupIds = []) { return [...new Set(patternGroupIds)].map(getW1FullProductPublicApplicationGroup).filter(Boolean); }

export function auditW1FullProductPublicApplicationGroups() {
  const errors = [];
  if (W1_FULL_PRODUCT_PUBLIC_APPLICATION_GROUPS.length !== 13) errors.push("P01E_APPLICATION_GROUP_COUNT_INVALID");
  if (new Set(W1_FULL_PRODUCT_PUBLIC_APPLICATION_GROUPS.map((row) => row.primaryKnowledgePointId)).size !== 13) errors.push("P01E_APPLICATION_KP_IDENTITY_INVALID");
  if (new Set(W1_FULL_PRODUCT_PUBLIC_APPLICATION_GROUPS.map((row) => row.patternGroupId)).size !== 13) errors.push("P01E_APPLICATION_GROUP_IDENTITY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), applicationKnowledgePointCount: 13, sourceCount: bySource.size });
}
