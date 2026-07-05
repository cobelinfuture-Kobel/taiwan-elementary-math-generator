import * as base from "./batch-a-selector-candidates.js";

const sourceId = "g3a_u02_3a02";
const roundKpId = "kp_g3a_u02_estimate_nearest_thousand";
const roundGroupId = "pg_g3a_u02_estimate_nearest_thousand";
const roundSpecId = "ps_g3a_u02_estimate_nearest_thousand";
const wordKpId = "kp_g3a_u02_word_problem_estimation_add_sub";
const wordGroupId = "pg_g3a_u02_word_problem_estimation_add_sub";
const wordSpecId = "ps_g3a_u02_word_problem_estimation_add_sub";

const clone = (value) => JSON.parse(JSON.stringify(value));

const roundKp = Object.freeze({
  knowledgePointId: roundKpId,
  sourceId,
  unitCode: "3A-U02",
  unitTitle: "四位數的加減",
  displayName: "整千估算",
  supportClass: "B",
  canonicalSkillTag: "rounding_approximation",
  subskillTags: ["nearest_thousand"],
  difficultyTags: ["rounding"],
  representationTags: ["numeric_expression"],
  patternGroupIds: [roundGroupId],
  patternSpecIds: [roundSpecId],
  qaStatusLabel: "qa_verified"
});

const wordKp = Object.freeze({
  knowledgePointId: wordKpId,
  sourceId,
  unitCode: "3A-U02",
  unitTitle: "四位數的加減",
  displayName: "加減應用題估算",
  supportClass: "B",
  canonicalSkillTag: "integer_add_sub_mixed",
  subskillTags: ["estimation", "word_problem"],
  difficultyTags: ["context_reasoning"],
  representationTags: ["word_problem"],
  patternGroupIds: [wordGroupId],
  patternSpecIds: [wordSpecId],
  qaStatusLabel: "qa_verified"
});

const roundGroup = Object.freeze({
  patternGroupId: roundGroupId,
  sourceId,
  unitCode: "3A-U02",
  unitTitle: "四位數的加減",
  displayName: "整千估算",
  primaryKnowledgePointId: roundKpId,
  knowledgePointIds: [roundKpId],
  supportClass: "B",
  patternSpecIds: [roundSpecId],
  allocationPolicy: "single_pattern",
  visibilityStatus: "visible",
  holdReason: null
});

const wordGroup = Object.freeze({
  patternGroupId: wordGroupId,
  sourceId,
  unitCode: "3A-U02",
  unitTitle: "四位數的加減",
  displayName: "加減應用題估算",
  primaryKnowledgePointId: wordKpId,
  knowledgePointIds: [wordKpId],
  supportClass: "B",
  patternSpecIds: [wordSpecId],
  allocationPolicy: "single_pattern",
  visibilityStatus: "visible",
  holdReason: null
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: 4,
  notSelectableCount: 0,
  bySourceId: {
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [sourceId]: { sourceId, visibleCount: 4, hiddenPendingCount: 0, notSelectableCount: 0 }
  }
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), clone(roundKp), clone(wordKp)];
}

export function listBatchAKnowledgePointAvailabilityBySource(id) {
  return id === sourceId ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(id);
}

export function getVisibleBatchAKnowledgePoint(id) {
  if (id === roundKpId) return clone(roundKp);
  if (id === wordKpId) return clone(wordKp);
  return base.getVisibleBatchAKnowledgePoint(id);
}

export function getVisiblePatternGroupsForKnowledgePoint(id) {
  if (id === roundKpId) return [clone(roundGroup)];
  if (id === wordKpId) return [clone(wordGroup)];
  return base.getVisiblePatternGroupsForKnowledgePoint(id);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) {
  if (id === roundKpId) return [roundSpecId];
  if (id === wordKpId) return [wordSpecId];
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id);
}
