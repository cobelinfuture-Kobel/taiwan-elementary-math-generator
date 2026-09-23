import * as base from "./batch-a-selector-g4a-extension.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const g4aU08 = "g4a_u08_4a08";

const rows = Object.freeze([
  [g4aU08, "4A-U08", "整數四則", "kp_g4a_u08_app_add_sub_sequence", "pg_g4a_u08_app_add_sub_sequence", ["ps_g4a_u08_app_add_three_quantities", "ps_g4a_u08_app_add_then_subtract_state_change", "ps_g4a_u08_app_subtract_then_add_state_change", "ps_g4a_u08_app_subtract_twice_state_change"], "加減序列應用題", "application_order_of_operations", ["application_problem", "add_sub_sequence", "same_unit", "unit_conversion_overlay"], "phase2a_application", "word_problem"],
  [g4aU08, "4A-U08", "整數四則", "kp_g4a_u08_app_parentheses_grouping", "pg_g4a_u08_app_parentheses_grouping", ["ps_g4a_u08_app_adjusted_amount_then_subtract", "ps_g4a_u08_app_divide_by_group_product", "ps_g4a_u08_app_multiply_after_difference_then_add_sub"], "括號與組合量應用題", "application_order_of_operations", ["application_problem", "parentheses_grouping", "same_unit", "unit_conversion_overlay"], "phase2a_application", "word_problem"],
  [g4aU08, "4A-U08", "整數四則", "kp_g4a_u08_app_mul_div_sequence", "pg_g4a_u08_app_mul_div_sequence", ["ps_g4a_u08_app_multiply_then_share", "ps_g4a_u08_app_unit_rate_then_scale", "ps_g4a_u08_app_divide_then_divide"], "乘除序列應用題", "application_order_of_operations", ["application_problem", "mul_div_sequence", "same_unit", "unit_conversion_overlay"], "phase2a_application", "word_problem"],
  [g4aU08, "4A-U08", "整數四則", "kp_g4a_u08_app_mul_div_before_add_sub", "pg_g4a_u08_app_mul_div_before_add_sub", ["ps_g4a_u08_app_payment_minus_unit_cost_times_quantity", "ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount"], "乘除先於加減應用題", "application_order_of_operations", ["application_problem", "mul_div_before_add_sub", "same_unit", "unit_conversion_overlay"], "phase2a_application", "word_problem"]
]);

function toSpecIds(value) {
  return Object.freeze(Array.isArray(value) ? [...value] : [value]);
}

function toKp([rowSourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName, canonicalSkillTag, subskillTags, difficultyTag, representationTag]) {
  const patternSpecIds = toSpecIds(patternSpecId);
  return Object.freeze({
    knowledgePointId,
    sourceId: rowSourceId,
    unitCode,
    unitTitle,
    displayName,
    supportClass: "B",
    canonicalSkillTag,
    subskillTags,
    difficultyTags: [difficultyTag],
    representationTags: [representationTag],
    patternGroupIds: [patternGroupId],
    patternSpecIds,
    qaStatusLabel: "qa_verified"
  });
}

function toGroup([rowSourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName]) {
  const patternSpecIds = toSpecIds(patternSpecId);
  return Object.freeze({
    patternGroupId,
    sourceId: rowSourceId,
    unitCode,
    unitTitle,
    displayName,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    supportClass: "B",
    patternSpecIds,
    allocationPolicy: "single_pattern",
    visibilityStatus: "visible",
    holdReason: null
  });
}

const extraKps = Object.freeze(rows.map(toKp));
const extraGroups = Object.freeze(rows.map(toGroup));
const kpById = new Map(extraKps.map((kp) => [kp.knowledgePointId, kp]));
const groupsByKpId = new Map(extraGroups.flatMap((group) => group.knowledgePointIds.map((kpId) => [kpId, [group]])));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  for (const kp of extraKps) {
    const current = entries.get(kp.sourceId) ?? { sourceId: kp.sourceId, visibleCount: 0, hiddenPendingCount: 0, notSelectableCount: 0 };
    entries.set(kp.sourceId, { ...current, visibleCount: current.visibleCount + 1 });
  }
  return Object.fromEntries(entries);
}

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + extraKps.length,
  notSelectableCount: base.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount,
  bySourceId: availabilityBySource()
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
