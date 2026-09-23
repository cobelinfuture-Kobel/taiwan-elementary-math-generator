const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const rows = [
  [
    "closeout_app_pg_g4a_u02_3digit_by_1digit",
    "pg_g4a_u02_3digit_by_1digit_review",
    "g4a_u02_4a02",
    "kp_g4a_u02_3digit_by_1digit_review",
    "ps_g4a_u02_3digit_by_1digit_review",
    "REL_EQUAL_GROUPS_TOTAL_V2"
  ],
  [
    "closeout_app_pg_g4a_u04_4digit_by_1digit",
    "pg_g4a_u04_4digit_by_1digit_thousands_exact",
    "g4a_u04_4a04",
    "kp_g4a_u04_4digit_by_1digit_thousands_exact",
    "ps_g4a_u04_4digit_by_1digit_thousands_exact",
    "REL_EQUAL_SHARE_V2"
  ],
  [
    "pg_g4b_u01_3digit_by_3digit",
    "pg_g4b_u01_3digit_by_3digit",
    "g4b_u01_4b01",
    "kp_g4b_u01_3digit_by_3digit",
    "ps_g4b_u01_3digit_by_3digit",
    "REL_EQUAL_GROUPS_TOTAL_V3"
  ]
];

export const FIFTEEN_UNIT_PUBLIC_APPLICATION_GROUPS = Object.freeze(rows.map(([
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
  mode: "application",
  publicQuestionMode: "application",
  representationTag: "controlled_semantic_application",
  representationTags: Object.freeze(["controlled_semantic_application", "word_problem"]),
  visibilityStatus: "visible",
  selectorStatus: "visible",
  productionUse: "allowed",
  productionAdmitted: true,
  publicQuerySelectable: true,
  globalContextAdmission: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
  templateFamilyId,
})));

const byKnowledgePoint = new Map();
const bySource = new Map();
const bySelectionPatternGroup = new Map();
for (const row of FIFTEEN_UNIT_PUBLIC_APPLICATION_GROUPS) {
  const knowledgePointRows = byKnowledgePoint.get(row.primaryKnowledgePointId) ?? [];
  knowledgePointRows.push(row);
  byKnowledgePoint.set(row.primaryKnowledgePointId, knowledgePointRows);
  const sourceRows = bySource.get(row.sourceId) ?? [];
  sourceRows.push(row);
  bySource.set(row.sourceId, sourceRows);
  bySelectionPatternGroup.set(row.patternGroupId, row);
  bySelectionPatternGroup.set(row.basePatternGroupId, row);
}

export function listFifteenUnitPublicApplicationGroupsForKnowledgePoint(knowledgePointId) {
  return clone(byKnowledgePoint.get(knowledgePointId) ?? []);
}

export function listFifteenUnitPublicApplicationGroupsForSource(sourceId) {
  return clone(bySource.get(sourceId) ?? []);
}

export function getFifteenUnitPublicApplicationGroup(patternGroupId) {
  return clone(bySelectionPatternGroup.get(patternGroupId) ?? null);
}

export function listSelectedFifteenUnitPublicApplicationGroups(patternGroupIds = []) {
  return [...new Set(patternGroupIds)].map(getFifteenUnitPublicApplicationGroup).filter(Boolean);
}
