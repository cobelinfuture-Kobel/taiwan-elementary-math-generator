export * from "./batch-a-selector-g4a-u08-extension.js";

import * as base from "./batch-a-selector-g4a-u08-extension.js";

const SOURCE_ID = "g4a_u08_4a08";
const UNIT_CODE = "4A-U08";
const UNIT_TITLE = "整數四則";
const PROMOTION_ID = "s76q_g4a_u08_all_canonical_groups_public";
const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

const KP_ROWS = Object.freeze([
  ["kp_g4a_u08_num_add_group_round", "加法交換、結合與湊整", "numeric"],
  ["kp_g4a_u08_num_signed_term_move", "加減混合連同符號移項", "numeric"],
  ["kp_g4a_u08_num_add_sub_left_assoc", "同級加減由左至右", "numeric"],
  ["kp_g4a_u08_num_parentheses_first", "括號優先", "numeric"],
  ["kp_g4a_u08_num_repeated_subtract_group", "連續減法合併", "numeric"],
  ["kp_g4a_u08_num_mul_div_safe_reorder", "乘除混合安全重排與湊整", "numeric"],
  ["kp_g4a_u08_num_mul_div_left_assoc", "同級乘除由左至右", "numeric"],
  ["kp_g4a_u08_num_repeated_divide_group", "連續除法合併", "numeric"],
  ["kp_g4a_u08_num_mul_div_before_add_sub", "先乘除後加減", "numeric"],
  ["kp_g4a_u08_num_parentheses_change_precedence", "括號改變優先順序", "numeric"],
  ["kp_g4a_u08_num_compound_parentheses", "多組括號與完整四則", "numeric"],
  ["kp_g4a_u08_app_add_sub_sequence", "加減狀態變化序列", "application"],
  ["kp_g4a_u08_app_parentheses_grouping", "括號群組與付款折扣", "application"],
  ["kp_g4a_u08_app_mul_div_sequence", "乘除兩步驟單位量與總量", "application"],
  ["kp_g4a_u08_app_mul_div_before_add_sub", "乘除優先後再加減情境", "application"],
]);

const GROUP_ROWS = Object.freeze([
  ["pg_g4a_u08_num_add_group_round", "kp_g4a_u08_num_add_group_round", "numeric", ["ps_g4a_u08_num_add_group_round"]],
  ["pg_g4a_u08_num_signed_term_move", "kp_g4a_u08_num_signed_term_move", "numeric", ["ps_g4a_u08_num_signed_term_move"]],
  ["pg_g4a_u08_num_add_sub_left_assoc", "kp_g4a_u08_num_add_sub_left_assoc", "numeric", ["ps_g4a_u08_add_sub_left_to_right"]],
  ["pg_g4a_u08_num_parentheses_first", "kp_g4a_u08_num_parentheses_first", "numeric", ["ps_g4a_u08_parentheses_add_sub", "ps_g4a_u08_parentheses_mul_div"]],
  ["pg_g4a_u08_num_repeated_subtract_group", "kp_g4a_u08_num_repeated_subtract_group", "numeric", ["ps_g4a_u08_num_repeated_subtract_group"]],
  ["pg_g4a_u08_num_mul_div_safe_reorder", "kp_g4a_u08_num_mul_div_safe_reorder", "numeric", ["ps_g4a_u08_num_mul_div_safe_reorder"]],
  ["pg_g4a_u08_num_mul_div_left_assoc", "kp_g4a_u08_num_mul_div_left_assoc", "numeric", ["ps_g4a_u08_mul_div_left_to_right"]],
  ["pg_g4a_u08_num_repeated_divide_group", "kp_g4a_u08_num_repeated_divide_group", "numeric", ["ps_g4a_u08_num_repeated_divide_group"]],
  ["pg_g4a_u08_num_mul_div_before_add_sub", "kp_g4a_u08_num_mul_div_before_add_sub", "numeric", ["ps_g4a_u08_mul_before_add_sub", "ps_g4a_u08_div_before_add_sub", "ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses", "ps_g4a_u08_large_add_sub_overlay_no_parentheses"]],
  ["pg_g4a_u08_num_parentheses_change_precedence", "kp_g4a_u08_num_parentheses_change_precedence", "numeric", ["ps_g4a_u08_mixed_with_parentheses", "ps_g4a_u08_large_add_sub_overlay_with_parentheses"]],
  ["pg_g4a_u08_num_compound_parentheses", "kp_g4a_u08_num_compound_parentheses", "numeric", ["ps_g4a_u08_num_compound_parentheses"]],
  ["pg_g4a_u08_app_add_add", "kp_g4a_u08_app_add_sub_sequence", "application", ["ps_g4a_u08_app_add_three_quantities"]],
  ["pg_g4a_u08_app_add_subtract", "kp_g4a_u08_app_add_sub_sequence", "application", ["ps_g4a_u08_app_add_then_subtract_state_change"]],
  ["pg_g4a_u08_app_subtract_add", "kp_g4a_u08_app_add_sub_sequence", "application", ["ps_g4a_u08_app_subtract_then_add_state_change"]],
  ["pg_g4a_u08_app_subtract_subtract", "kp_g4a_u08_app_add_sub_sequence", "application", ["ps_g4a_u08_app_subtract_twice_state_change"]],
  ["pg_g4a_u08_app_adjusted_amount_then_subtract", "kp_g4a_u08_app_parentheses_grouping", "application", ["ps_g4a_u08_app_adjusted_amount_then_subtract"]],
  ["pg_g4a_u08_app_divide_by_group_product", "kp_g4a_u08_app_parentheses_grouping", "application", ["ps_g4a_u08_app_divide_by_group_product"]],
  ["pg_g4a_u08_app_difference_then_scale_overlay", "kp_g4a_u08_app_parentheses_grouping", "application", ["ps_g4a_u08_app_multiply_after_difference_then_add_sub"]],
  ["pg_g4a_u08_app_multiply_then_share", "kp_g4a_u08_app_mul_div_sequence", "application", ["ps_g4a_u08_app_multiply_then_share"]],
  ["pg_g4a_u08_app_unit_rate_then_scale", "kp_g4a_u08_app_mul_div_sequence", "application", ["ps_g4a_u08_app_unit_rate_then_scale"]],
  ["pg_g4a_u08_app_divide_then_divide", "kp_g4a_u08_app_mul_div_sequence", "application", ["ps_g4a_u08_app_divide_then_divide"]],
  ["pg_g4a_u08_app_payment_minus_unit_cost_times_quantity", "kp_g4a_u08_app_mul_div_before_add_sub", "application", ["ps_g4a_u08_app_payment_minus_unit_cost_times_quantity"]],
  ["pg_g4a_u08_app_subtract_or_add_divided_amount", "kp_g4a_u08_app_mul_div_before_add_sub", "application", ["ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount"]],
  ["pg_g4a_u08_app_cost_overlay", "kp_g4a_u08_app_mul_div_before_add_sub", "application", ["ps_g4a_u08_app_cost_overlay"]],
  ["pg_g4a_u08_ext_comparison_chain", "kp_g4a_u08_app_add_sub_sequence", "application", ["ps_g4a_u08_ext_comparison_chain"]],
  ["pg_g4a_u08_ext_equal_value_unit_price", "kp_g4a_u08_app_mul_div_sequence", "application", ["ps_g4a_u08_ext_equal_value_unit_price"]],
  ["pg_g4a_u08_ext_relative_difference", "kp_g4a_u08_app_mul_div_sequence", "application", ["ps_g4a_u08_ext_relative_difference"]],
  ["pg_g4a_u08_ext_two_cost_component_payment", "kp_g4a_u08_app_mul_div_before_add_sub", "application", ["ps_g4a_u08_ext_two_cost_component_payment"]],
]);

export const G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS = Object.freeze(GROUP_ROWS.map(([patternGroupId, primaryKnowledgePointId, mode, patternSpecIds]) => Object.freeze({
  patternGroupId,
  hiddenAuthorityGroupId: patternGroupId,
  sourceId: SOURCE_ID,
  unitCode: UNIT_CODE,
  unitTitle: UNIT_TITLE,
  displayName: patternGroupId.replace("pg_g4a_u08_", "").replaceAll("_", " "),
  primaryKnowledgePointId,
  knowledgePointIds: Object.freeze([primaryKnowledgePointId]),
  supportClass: "A",
  mode,
  publicQuestionMode: mode,
  representationTag: mode === "numeric" ? "canonical_numeric" : "canonical_application",
  representationTags: Object.freeze([mode === "numeric" ? "canonical_numeric" : "canonical_application"]),
  allowedDepths: Object.freeze([mode === "numeric" ? "N" : "N_PLUS_1"]),
  contextTypes: Object.freeze(mode === "numeric" ? [] : ["controlled_semantic_application"]),
  patternSpecIds: Object.freeze([...patternSpecIds]),
  allocationPolicy: "balanced_by_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
  promotionRegistryId: PROMOTION_ID,
  promotionRole: "s76q_all_canonical_public_group",
})));

const GROUPS_BY_KP = new Map(KP_ROWS.map(([id]) => [id, Object.freeze(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.filter((group) => group.primaryKnowledgePointId === id))]));

function publicKnowledgePoint([knowledgePointId, displayName, mode], existing) {
  return {
    ...(existing ?? {}),
    knowledgePointId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: existing?.displayName ?? displayName,
    mode,
    questionMode: mode,
    visibilityStatus: "visible",
    holdReason: null,
    canonicalPatternGroupIds: GROUPS_BY_KP.get(knowledgePointId).map((group) => group.patternGroupId),
    canonicalPatternSpecIds: [...new Set(GROUPS_BY_KP.get(knowledgePointId).flatMap((group) => group.patternSpecIds))],
    canonicalSelectorStatus: "visible_explicit_group_selection",
    promotionRegistryIds: [...new Set([...(existing?.promotionRegistryIds ?? []), PROMOTION_ID])],
  };
}

export function listVisibleBatchAKnowledgePoints() {
  const existing = base.listVisibleBatchAKnowledgePoints();
  const byId = new Map(existing.map((row) => [row.knowledgePointId, row]));
  for (const kp of KP_ROWS) byId.set(kp[0], publicKnowledgePoint(kp, byId.get(kp[0])));
  return clone([...byId.values()]);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return clone(listVisibleBatchAKnowledgePoints().find((row) => row.knowledgePointId === knowledgePointId) ?? null);
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  if (sourceId !== SOURCE_ID) return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  return { sourceId, visibleCount: rows.length, visibleKnowledgePointIds: rows.map((row) => row.knowledgePointId) };
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  if (!GROUPS_BY_KP.has(knowledgePointId)) return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  return clone(GROUPS_BY_KP.get(knowledgePointId));
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function isS76QPublicG4AU08PatternGroupId(id) {
  return G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.some((row) => row.patternGroupId === id);
}

export function validateG4AU08AllCanonicalPublicSelectorProjection() {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  const groups = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
  const specs = new Set(groups.flatMap((group) => group.patternSpecIds));
  const errors = [];
  if (rows.length !== 15) errors.push("knowledge_point_count_mismatch");
  if (groups.length !== 28) errors.push("pattern_group_count_mismatch");
  if (specs.size !== 33) errors.push("pattern_spec_count_mismatch");
  if (groups.some((group) => group.visibilityStatus !== "visible" || group.holdReason !== null)) errors.push("group_visibility_invalid");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: rows.length, patternGroups: groups.length, patternSpecs: specs.size }) });
}

export const G4A_U08_ALL_CANONICAL_PUBLIC_SELECTOR_PROJECTION = Object.freeze({
  task: "S76Q_G4A_U08_AllCanonicalGroupsPublicRoutingAndWorksheetReachability",
  sourceId: SOURCE_ID,
  promotionRegistryId: PROMOTION_ID,
  status: "all_canonical_groups_visible",
  knowledgePointCount: 15,
  patternGroupCount: 28,
  patternSpecCount: 33,
  compatibilityAliasesPreserved: true,
  arbitraryPatternSpecInjection: false,
  genericFallback: false,
  worksheetEligible: true,
  rendererBehaviorChanged: false,
  productionEligibilityChanged: false,
  requiredNextGate: "S76R_G4A_U08_FullSourceStressHTMLPDFAndD0Reevaluation",
});
