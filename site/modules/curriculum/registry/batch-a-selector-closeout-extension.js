export * from "./batch-a-selector-composer.js";

import * as base from "./batch-a-selector-composer.js";
import { listW01PublicApplicationGroupsForKnowledgePoint } from "./w01-public-application-groups.js";
import { listFifteenUnitPublicApplicationGroupsForKnowledgePoint } from "./fifteen-unit-public-application-groups.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const G4A_U01_APPLICATION_KNOWLEDGE_POINTS = new Set([
  "kp_g4a_u01_comparison_word_problem_total",
  "kp_g4a_u01_large_number_unit_word_problem_add_subtract",
]);

function dedupeGroups(groups) {
  return [...new Map(groups.map((group) => [group.patternGroupId, group])).values()];
}

function normalizeBaseGroup(group, knowledgePointId) {
  if (!G4A_U01_APPLICATION_KNOWLEDGE_POINTS.has(knowledgePointId)) return group;
  return {
    ...group,
    mode: "application",
    publicQuestionMode: "application",
    representationTag: "controlled_semantic_application",
    representationTags: ["controlled_semantic_application", "word_problem"],
    selectorStatus: "visible",
    productionUse: "allowed",
    productionAdmitted: true,
    publicQuerySelectable: true,
    globalContextAdmission: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
  };
}

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = base.BATCH_A_SELECTOR_AVAILABILITY;
export const G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS = base.G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
export const G5A_U02_SELECTOR_PROJECTION = base.G5A_U02_SELECTOR_PROJECTION;
export const G5A_U02_VISIBLE_SELECTOR_PROJECTION = base.G5A_U02_VISIBLE_SELECTOR_PROJECTION;

export function listVisibleBatchAKnowledgePoints() {
  return base.listVisibleBatchAKnowledgePoints().map(clone);
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return clone(base.listBatchAKnowledgePointAvailabilityBySource(sourceId));
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return clone(base.getVisibleBatchAKnowledgePoint(knowledgePointId));
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const baseGroups = base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
    .map((group) => normalizeBaseGroup(group, knowledgePointId));
  return clone(dedupeGroups([
    ...baseGroups,
    ...listW01PublicApplicationGroupsForKnowledgePoint(knowledgePointId),
    ...listFifteenUnitPublicApplicationGroupsForKnowledgePoint(knowledgePointId),
  ]));
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
    .flatMap((group) => group.patternSpecIds ?? []))];
}

export function validateFifteenUnitApplicationSelectorComposition() {
  const errors = [];
  const expected = [
    ["kp_g3a_u01_4digit_compare", "w01_app_pg_g3a_u01_4digit_compare"],
    ["kp_g3a_u02_add_multi_carry", "w01_app_pg_g3a_u02_add_multi_carry"],
    ["kp_g4a_u01_comparison_word_problem_total", "pg_g4a_u01_comparison_word_problem_total"],
    ["kp_g4a_u02_3digit_by_1digit_review", "closeout_app_pg_g4a_u02_3digit_by_1digit"],
    ["kp_g4a_u04_4digit_by_1digit_thousands_exact", "closeout_app_pg_g4a_u04_4digit_by_1digit"],
    ["kp_g4b_u01_3digit_by_3digit", "closeout_app_pg_g4b_u01_3digit_by_3digit"],
  ];
  for (const [knowledgePointId, patternGroupId] of expected) {
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    if (!groups.some((group) => group.patternGroupId === patternGroupId)) {
      errors.push(`application_group_missing:${knowledgePointId}:${patternGroupId}`);
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
