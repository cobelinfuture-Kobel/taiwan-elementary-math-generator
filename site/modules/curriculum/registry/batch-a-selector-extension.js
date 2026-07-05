import * as base from "./batch-a-selector-candidates.js";

const sourceId = "g3a_u02_3a02";
const kpId = "kp_g3a_u02_estimate_nearest_thousand";
const groupId = "pg_g3a_u02_estimate_nearest_thousand";
const specId = "ps_g3a_u02_estimate_nearest_thousand";

const clone = (value) => JSON.parse(JSON.stringify(value));

const kp = Object.freeze({
  knowledgePointId: kpId,
  sourceId,
  unitCode: "3A-U02",
  unitTitle: "四位數的加減",
  displayName: "整千估算",
  supportClass: "B",
  canonicalSkillTag: "rounding_approximation",
  subskillTags: ["nearest_thousand"],
  difficultyTags: ["rounding"],
  representationTags: ["numeric_expression"],
  patternGroupIds: [groupId],
  patternSpecIds: [specId],
  qaStatusLabel: "qa_verified"
});

const group = Object.freeze({
  patternGroupId: groupId,
  sourceId,
  unitCode: "3A-U02",
  unitTitle: "四位數的加減",
  displayName: "整千估算",
  primaryKnowledgePointId: kpId,
  knowledgePointIds: [kpId],
  supportClass: "B",
  patternSpecIds: [specId],
  allocationPolicy: "single_pattern",
  visibilityStatus: "visible",
  holdReason: null
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: 3,
  notSelectableCount: 1,
  bySourceId: {
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [sourceId]: { sourceId, visibleCount: 3, hiddenPendingCount: 0, notSelectableCount: 1 }
  }
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), clone(kp)];
}

export function listBatchAKnowledgePointAvailabilityBySource(id) {
  return id === sourceId ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(id);
}

export function getVisibleBatchAKnowledgePoint(id) {
  return id === kpId ? clone(kp) : base.getVisibleBatchAKnowledgePoint(id);
}

export function getVisiblePatternGroupsForKnowledgePoint(id) {
  return id === kpId ? [clone(group)] : base.getVisiblePatternGroupsForKnowledgePoint(id);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) {
  return id === kpId ? [specId] : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id);
}
