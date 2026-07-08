import * as base from "./batch-a-selector-equation-extension.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const sourceId = "g4a_u01_4a01";
const rows = Object.freeze([
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_compare_8digit", "pg_g4a_u01_compare_8digit", "ps_g4a_u01_compare_8digit", "八位數比大小", "large_number_comparison", ["eight_digit", "comparison"], "large_number_compare", "numeric_expression"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_within_100million_compare", "pg_g4a_u01_within_100million_compare", "ps_g4a_u01_within_100million_compare", "1億以內數比大小", "large_number_comparison", ["within_100million", "comparison"], "large_number_compare", "numeric_expression"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_large_number_add_sub", "pg_g4a_u01_large_number_add_sub", "ps_g4a_u01_large_number_add_sub", "大數加減", "large_number_addition_subtraction", ["large_number", "addition", "subtraction"], "large_number_add_sub", "numeric_expression"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_8digit_place_value_decomposition", "pg_g4a_u01_8digit_place_value_decomposition", "ps_g4a_u01_8digit_place_value_decomposition", "八位數位值分解", "large_number_place_value", ["eight_digit", "decomposition", "place_value"], "place_value_decomposition", "decomposition_prompt"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_place_value_composition_to_number", "pg_g4a_u01_place_value_composition_to_number", "ps_g4a_u01_place_value_composition_to_number", "八位數位值組合", "large_number_place_value", ["eight_digit", "composition", "place_value"], "place_value_composition", "composition_prompt"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_same_digit_place_value_difference", "pg_g4a_u01_same_digit_place_value_difference", "ps_g4a_u01_same_digit_place_value_difference", "相同數字不同位值差", "large_number_place_value", ["same_digit", "place_value_difference", "eight_digit"], "same_digit_place_value_difference", "reasoning_prompt"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_nonstandard_place_value_composition", "pg_g4a_u01_nonstandard_place_value_composition", "ps_g4a_u01_nonstandard_place_value_composition", "非標準位值組合", "large_number_place_value", ["nonstandard_composition", "place_value"], "nonstandard_place_value_composition", "composition_prompt"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_place_value_card_unit_model_composition", "pg_g4a_u01_place_value_card_unit_model_composition", "ps_g4a_u01_place_value_card_unit_model_composition", "位值卡組合", "large_number_place_value", ["card_model", "composition", "place_value"], "place_value_card_composition", "card_model_prompt"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_compare_first_different_place", "pg_g4a_u01_compare_first_different_place", "ps_g4a_u01_compare_first_different_place", "從哪一位開始比較", "large_number_comparison", ["first_different_place", "comparison"], "large_number_compare_reasoning", "reasoning_prompt"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_missing_digit_comparison_possible_digits", "pg_g4a_u01_missing_digit_comparison_possible_digits", "ps_g4a_u01_missing_digit_comparison_possible_digits", "缺位比較可填哪些數", "large_number_comparison", ["missing_digit", "possible_digits", "comparison"], "missing_digit_comparison", "digit_set_prompt"],
  [sourceId, "4A-U01", "1億以內的數", "kp_g4a_u01_missing_digit_comparison_extreme_digit", "pg_g4a_u01_missing_digit_comparison_extreme_digit", "ps_g4a_u01_missing_digit_comparison_extreme_digit", "缺位比較最大最小", "large_number_comparison", ["missing_digit", "extreme_digit", "comparison"], "missing_digit_comparison", "digit_prompt"]
]);

function toSpecIds(value) {
  return Object.freeze(Array.isArray(value) ? [...value] : [value]);
}

function toKp([rowSourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName, canonicalSkillTag, subskillTags, difficultyTag, representationTag]) {
  const patternSpecIds = toSpecIds(patternSpecId);
  return Object.freeze({ knowledgePointId, sourceId: rowSourceId, unitCode, unitTitle, displayName, supportClass: "B", canonicalSkillTag, subskillTags, difficultyTags: [difficultyTag], representationTags: [representationTag], patternGroupIds: [patternGroupId], patternSpecIds, qaStatusLabel: "qa_verified" });
}

function toGroup([rowSourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName]) {
  const patternSpecIds = toSpecIds(patternSpecId);
  return Object.freeze({ patternGroupId, sourceId: rowSourceId, unitCode, unitTitle, displayName, primaryKnowledgePointId: knowledgePointId, knowledgePointIds: [knowledgePointId], supportClass: "B", patternSpecIds, allocationPolicy: "single_pattern", visibilityStatus: "visible", holdReason: null });
}

const extraKps = Object.freeze(rows.map(toKp));
const extraGroups = Object.freeze(rows.map(toGroup));
const kpById = new Map(extraKps.map((kp) => [kp.knowledgePointId, kp]));
const groupsByKpId = new Map(extraGroups.flatMap((group) => group.knowledgePointIds.map((kpId) => [kpId, [group]])));

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + extraKps.length,
  notSelectableCount: base.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount,
  bySourceId: {
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [sourceId]: { sourceId, visibleCount: extraKps.length, hiddenPendingCount: 0, notSelectableCount: 0 }
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
