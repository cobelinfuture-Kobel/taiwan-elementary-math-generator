import * as base from "./batch-a-selector-extension.js";

const sourceId = "g3a_u02_3a02";
const rows = Object.freeze([
  ["kp_g3a_u02_add_missing_digit_equation", "pg_g3a_u02_add_missing_digit_equation", "ps_g3a_u02_add_missing_digit_equation", "加法等式缺位填空", "addition"],
  ["kp_g3a_u02_sub_missing_digit_equation", "pg_g3a_u02_sub_missing_digit_equation", "ps_g3a_u02_sub_missing_digit_equation", "減法等式缺位填空", "subtraction"]
]);

const clone = (value) => JSON.parse(JSON.stringify(value));

function toKp([knowledgePointId, patternGroupId, patternSpecId, displayName, subskill]) {
  return Object.freeze({
    knowledgePointId,
    sourceId,
    unitCode: "3A-U02",
    unitTitle: "四位數的加減",
    displayName,
    supportClass: "B",
    canonicalSkillTag: "integer_add_sub_mixed",
    subskillTags: ["missing_digit", "equation_reasoning", subskill],
    difficultyTags: ["missing_digit_equation"],
    representationTags: ["numeric_expression"],
    patternGroupIds: [patternGroupId],
    patternSpecIds: [patternSpecId],
    qaStatusLabel: "qa_verified"
  });
}

function toGroup([knowledgePointId, patternGroupId, patternSpecId, displayName]) {
  return Object.freeze({
    patternGroupId,
    sourceId,
    unitCode: "3A-U02",
    unitTitle: "四位數的加減",
    displayName,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    supportClass: "B",
    patternSpecIds: [patternSpecId],
    allocationPolicy: "single_pattern",
    visibilityStatus: "visible",
    holdReason: null
  });
}

const extraKps = Object.freeze(rows.map(toKp));
const extraGroups = Object.freeze(rows.map(toGroup));
const kpById = new Map(extraKps.map((kp) => [kp.knowledgePointId, kp]));
const groupsByKpId = new Map(extraGroups.flatMap((group) => group.knowledgePointIds.map((kpId) => [kpId, [group]])));

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 2,
  bySourceId: {
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [sourceId]: {
      ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId],
      visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId].visibleCount + 2
    }
  }
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...extraKps.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(id) {
  return BATCH_A_SELECTOR_AVAILABILITY.bySourceId[id]
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[id])
    : base.listBatchAKnowledgePointAvailabilityBySource(id);
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
