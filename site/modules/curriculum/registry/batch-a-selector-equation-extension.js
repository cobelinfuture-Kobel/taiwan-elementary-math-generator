import * as base from "./batch-a-selector-candidates.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const sourceIds = Object.freeze({ u02: "g3a_u02_3a02", u03: "g3a_u03_3a03", u06: "g3a_u06_3a06" });
const rows = Object.freeze([
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_estimate_nearest_thousand", "pg_g3a_u02_estimate_nearest_thousand", "ps_g3a_u02_estimate_nearest_thousand", "整千估算", "rounding_approximation", ["nearest_thousand"], "rounding", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_word_problem_estimation_add_sub", "pg_g3a_u02_word_problem_estimation_add_sub", "ps_g3a_u02_word_problem_estimation_add_sub", "加減應用題估算", "integer_add_sub_mixed", ["estimation", "word_problem"], "context_reasoning", "word_problem"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_add_missing_digit_operand", "pg_g3a_u02_add_missing_digit_operand", "ps_g3a_u02_add_missing_digit_operand", "加法缺位填空", "integer_add_sub_mixed", ["missing_digit", "addition"], "missing_digit", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_sub_missing_digit_operand", "pg_g3a_u02_sub_missing_digit_operand", "ps_g3a_u02_sub_missing_digit_operand", "減法缺位填空", "integer_add_sub_mixed", ["missing_digit", "subtraction"], "missing_digit", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_add_missing_digit_equation", "pg_g3a_u02_add_missing_digit_equation", "ps_g3a_u02_add_missing_digit_equation", "加法等式缺位填空", "integer_add_sub_mixed", ["missing_digit", "equation_reasoning", "addition"], "missing_digit_equation", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_sub_missing_digit_equation", "pg_g3a_u02_sub_missing_digit_equation", "ps_g3a_u02_sub_missing_digit_equation", "減法等式缺位填空", "integer_add_sub_mixed", ["missing_digit", "equation_reasoning", "subtraction"], "missing_digit_equation", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_sub_middle_missing_digit", "pg_g3a_u02_sub_middle_missing_digit", "ps_g3a_u02_sub_middle_missing_digit", "減法中間缺位填空", "integer_add_sub_mixed", ["missing_digit", "equation_reasoning", "sub_middle"], "sub_middle_missing_digit", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_continuous_borrow_zero", "pg_g3a_u02_continuous_borrow_zero", "ps_g3a_u02_continuous_borrow_zero", "連續退位中間有 0", "integer_add_sub_mixed", ["subtraction", "continuous_borrow", "zero_borrow"], "continuous_borrow_zero", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_2digit_by_1digit_carry", "pg_g3a_u03_2digit_by_1digit_carry", "ps_g3a_u03_2digit_by_1digit_carry", "二位數乘以一位數", "integer_multiplication", ["two_digit", "one_digit", "carry"], "multiplication", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_10_multiple_by_1digit", "pg_g3a_u03_10_multiple_by_1digit", "ps_g3a_u03_10_multiple_by_1digit", "10 的倍數乘以一位數", "integer_multiplication", ["ten_multiple", "one_digit"], "multiplication", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_3digit_by_1digit", "pg_g3a_u03_3digit_by_1digit", "ps_g3a_u03_3digit_by_1digit", "三位數乘以一位數", "integer_multiplication", ["three_digit", "one_digit"], "multiplication", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_consecutive_multiplication_two_step", "pg_g3a_u03_consecutive_multiplication_two_step", "ps_g3a_u03_consecutive_multiplication_two_step", "兩步驟連續乘法", "integer_multiplication", ["two_step", "multiplication"], "multiplication", "numeric_expression"],
  [sourceIds.u06, "3A-U06", "二位數除以一位數", "kp_g3a_u06_exact_division_check", "pg_g3a_u06_exact_division_check", "ps_g3a_u06_exact_division_check", "二位數除以一位數整除", "integer_division_exact", ["two_digit", "one_digit", "exact_division"], "division", "numeric_expression"],
  [sourceIds.u06, "3A-U06", "二位數除以一位數", "kp_g3a_u06_divisibility_exact_check", "pg_g3a_u06_divisibility_exact_check", "ps_g3a_u06_divisibility_exact_check", "整除檢查", "integer_division_exact", ["divisibility", "exact_division"], "division", "numeric_expression"]
]);

function toKp([sourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName, canonicalSkillTag, subskillTags, difficultyTag, representationTag]) {
  return Object.freeze({ knowledgePointId, sourceId, unitCode, unitTitle, displayName, supportClass: "B", canonicalSkillTag, subskillTags, difficultyTags: [difficultyTag], representationTags: [representationTag], patternGroupIds: [patternGroupId], patternSpecIds: [patternSpecId], qaStatusLabel: "qa_verified" });
}

function toGroup([sourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName]) {
  return Object.freeze({ patternGroupId, sourceId, unitCode, unitTitle, displayName, primaryKnowledgePointId: knowledgePointId, knowledgePointIds: [knowledgePointId], supportClass: "B", patternSpecIds: [patternSpecId], allocationPolicy: "single_pattern", visibilityStatus: "visible", holdReason: null });
}

const extraKps = Object.freeze(rows.map(toKp));
const extraGroups = Object.freeze(rows.map(toGroup));
const kpById = new Map(extraKps.map((kp) => [kp.knowledgePointId, kp]));
const groupsByKpId = new Map(extraGroups.flatMap((group) => group.knowledgePointIds.map((kpId) => [kpId, [group]])));

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: 16,
  notSelectableCount: 0,
  bySourceId: {
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [sourceIds.u02]: { sourceId: sourceIds.u02, visibleCount: 10, hiddenPendingCount: 0, notSelectableCount: 0 },
    [sourceIds.u03]: { sourceId: sourceIds.u03, visibleCount: 4, hiddenPendingCount: 0, notSelectableCount: 0 },
    [sourceIds.u06]: { sourceId: sourceIds.u06, visibleCount: 2, hiddenPendingCount: 0, notSelectableCount: 0 }
  }
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...extraKps.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(id) {
  return BATCH_A_SELECTOR_AVAILABILITY.bySourceId[id] ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[id]) : base.listBatchAKnowledgePointAvailabilityBySource(id);
}

export function getVisibleBatchAKnowledgePoint(id) {
  return kpById.has(id) ? clone(kpById.get(id)) : base.getVisibleBatchAKnowledgePoint(id);
}

export function getVisiblePatternGroupsForKnowledgePoint(id) {
  return groupsByKpId.has(id) ? clone(groupsByKpId.get(id)) : base.getVisiblePatternGroupsForKnowledgePoint(id);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(id);
  if (groups.length > 0) return groups.flatMap((group) => group.patternSpecIds ?? []);
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id);
}
