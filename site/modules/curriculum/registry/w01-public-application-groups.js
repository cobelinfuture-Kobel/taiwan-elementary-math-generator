const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const rows = [
  ["w01_app_pg_g3a_u01_4digit_compare", "pg_g3a_u01_4digit_compare", "g3a_u01_3a01", "kp_g3a_u01_4digit_compare", "ps_g3a_u01_4digit_compare", "REL_COMPARE_TWO_GROUPS_V1"],
  ["w01_app_pg_g3a_u01_range_reasoning", "pg_g3a_u01_range_reasoning", "g3a_u01_3a01", "kp_g3a_u01_range_reasoning", "ps_g3a_u01_4digit_range_compare_reasoning", "REL_RANGE_MEMBERSHIP_V1"],
  ["w01_app_pg_g3a_u02_add_multi_carry", "pg_g3a_u02_add_multi_carry_seed", "g3a_u02_3a02", "kp_g3a_u02_add_multi_carry", "ps_g3a_u02_4digit_add_multi_carry", "REL_JOIN_TOTAL_V1"],
  ["w01_app_pg_g3a_u02_sub_multi_borrow", "pg_g3a_u02_sub_multi_borrow_seed", "g3a_u02_3a02", "kp_g3a_u02_sub_multi_borrow", "ps_g3a_u02_4digit_sub_multi_borrow", "REL_SEPARATE_REMAINDER_V1"],
  ["w01_app_pg_g3a_u03_2digit_by_1digit", "pg_g3a_u03_2digit_by_1digit_carry", "g3a_u03_3a03", "kp_g3a_u03_2digit_by_1digit_carry", "ps_g3a_u03_2digit_by_1digit_carry", "REL_EQUAL_GROUPS_TOTAL_V1"],
  ["w01_app_pg_g3a_u06_exact_division", "pg_g3a_u06_exact_division_check", "g3a_u06_3a06", "kp_g3a_u06_exact_division_check", "ps_g3a_u06_exact_division_check", "REL_EQUAL_SHARE_V1"],
  ["w01_app_pg_g3b_u01_place_value_division", "pg_g3b_u01_2digit_division_place_value_cases", "g3b_u01_3b01", "kp_g3b_u01_2digit_division_place_value_cases", "ps_g3b_u01_2digit_by_1digit_regroup_tens", "REL_EQUAL_SHARE_V1"],
];

export const W01_PUBLIC_APPLICATION_GROUPS = Object.freeze(rows.map(([
  patternGroupId,
  basePatternGroupId,
  sourceId,
  primaryKnowledgePointId,
  patternSpecId,
  templateFamilyId,
]) => Object.freeze({
  patternGroupId,
  basePatternGroupId,
  sourceId,
  primaryKnowledgePointId,
  knowledgePointIds: Object.freeze([primaryKnowledgePointId]),
  patternSpecIds: Object.freeze([patternSpecId]),
  displayName: "全域情境應用題",
  representationTag: "application_word_problem",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  productionUse: "allowed",
  productionAdmitted: true,
  publicQuerySelectable: true,
  globalContextAdmission: "POSTG-APP-W01-A06E",
  templateFamilyId,
})));

const byKnowledgePoint = new Map();
const byPatternGroup = new Map();
for (const row of W01_PUBLIC_APPLICATION_GROUPS) {
  const list = byKnowledgePoint.get(row.primaryKnowledgePointId) ?? [];
  list.push(row);
  byKnowledgePoint.set(row.primaryKnowledgePointId, list);
  byPatternGroup.set(row.patternGroupId, row);
}

export function listW01PublicApplicationGroupsForKnowledgePoint(knowledgePointId) {
  return clone(byKnowledgePoint.get(knowledgePointId) ?? []);
}

export function getW01PublicApplicationGroup(patternGroupId) {
  return clone(byPatternGroup.get(patternGroupId) ?? null);
}

export function listSelectedW01PublicApplicationGroups(patternGroupIds = []) {
  return [...new Set(patternGroupIds)].map(getW01PublicApplicationGroup).filter(Boolean);
}
