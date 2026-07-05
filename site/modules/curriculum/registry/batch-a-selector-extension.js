import * as base from "./batch-a-selector-candidates.js";

const g3aU02SourceId = "g3a_u02_3a02";
const roundKpId = "kp_g3a_u02_estimate_nearest_thousand";
const roundGroupId = "pg_g3a_u02_estimate_nearest_thousand";
const roundSpecId = "ps_g3a_u02_estimate_nearest_thousand";
const wordKpId = "kp_g3a_u02_word_problem_estimation_add_sub";
const wordGroupId = "pg_g3a_u02_word_problem_estimation_add_sub";
const wordSpecId = "ps_g3a_u02_word_problem_estimation_add_sub";

const g3aU03SourceId = "g3a_u03_3a03";
const g3aU03Rows = Object.freeze([
  ["kp_g3a_u03_2digit_by_1digit_carry", "pg_g3a_u03_2digit_by_1digit_carry", "ps_g3a_u03_2digit_by_1digit_carry", "二位數乘以一位數", ["two_digit", "one_digit", "carry"]],
  ["kp_g3a_u03_10_multiple_by_1digit", "pg_g3a_u03_10_multiple_by_1digit", "ps_g3a_u03_10_multiple_by_1digit", "10 的倍數乘以一位數", ["ten_multiple", "one_digit"]],
  ["kp_g3a_u03_3digit_by_1digit", "pg_g3a_u03_3digit_by_1digit", "ps_g3a_u03_3digit_by_1digit", "三位數乘以一位數", ["three_digit", "one_digit"]],
  ["kp_g3a_u03_consecutive_multiplication_two_step", "pg_g3a_u03_consecutive_multiplication_two_step", "ps_g3a_u03_consecutive_multiplication_two_step", "兩步驟連續乘法", ["two_step", "multiplication"]]
]);

const clone = (value) => JSON.parse(JSON.stringify(value));

const roundKp = Object.freeze({
  knowledgePointId: roundKpId,
  sourceId: g3aU02SourceId,
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
  sourceId: g3aU02SourceId,
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
  sourceId: g3aU02SourceId,
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
  sourceId: g3aU02SourceId,
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

function makeU03Kp([knowledgePointId, patternGroupId, patternSpecId, displayName, subskillTags]) {
  return Object.freeze({
    knowledgePointId,
    sourceId: g3aU03SourceId,
    unitCode: "3A-U03",
    unitTitle: "乘法",
    displayName,
    supportClass: "B",
    canonicalSkillTag: "integer_multiplication",
    subskillTags,
    difficultyTags: ["multiplication"],
    representationTags: ["numeric_expression"],
    patternGroupIds: [patternGroupId],
    patternSpecIds: [patternSpecId],
    qaStatusLabel: "qa_verified"
  });
}

function makeU03Group([knowledgePointId, patternGroupId, patternSpecId, displayName]) {
  return Object.freeze({
    patternGroupId,
    sourceId: g3aU03SourceId,
    unitCode: "3A-U03",
    unitTitle: "乘法",
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

const u03Kps = Object.freeze(g3aU03Rows.map(makeU03Kp));
const u03Groups = Object.freeze(g3aU03Rows.map(makeU03Group));
const extraKps = Object.freeze([roundKp, wordKp, ...u03Kps]);
const extraGroups = Object.freeze([roundGroup, wordGroup, ...u03Groups]);
const kpById = new Map(extraKps.map((entry) => [entry.knowledgePointId, entry]));
const groupsByKpId = new Map(extraGroups.flatMap((group) => group.knowledgePointIds.map((knowledgePointId) => [knowledgePointId, [group]])));

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: 8,
  notSelectableCount: 0,
  bySourceId: {
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [g3aU02SourceId]: { sourceId: g3aU02SourceId, visibleCount: 4, hiddenPendingCount: 0, notSelectableCount: 0 },
    [g3aU03SourceId]: { sourceId: g3aU03SourceId, visibleCount: 4, hiddenPendingCount: 0, notSelectableCount: 0 }
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
