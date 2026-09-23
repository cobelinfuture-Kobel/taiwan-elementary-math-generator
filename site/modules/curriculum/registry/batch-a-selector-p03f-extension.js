export * from "./batch-a-selector-p01e-extension.js";

import * as base from "./batch-a-selector-p01e-extension.js";
import {
  G3A_U08_PART_WHOLE_KP_ID,
  G3A_U08_SOURCE_ID,
  G3A_U08_PART_WHOLE_SELECTOR_PROJECTION,
  auditG3AU08PartWholeSelectorProjection,
  getG3AU08PartWholeSelectorRow,
  listG3AU08PartWholePatternGroups,
  listG3AU08PartWholeSelectorRows,
  resolveG3AU08PartWholePatternSpecIds,
} from "./g3a-u08-part-whole-fraction-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3AU08PartWholeSelectorRows().map((row) => Object.freeze(row)));

export { G3A_U08_PART_WHOLE_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 20,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3A_U08_SOURCE_ID]: Object.freeze({
      sourceId: G3A_U08_SOURCE_ID,
      visibleCount: 1,
      hiddenPendingCount: 6,
      notSelectableCount: 0,
      publicSelectorStatus: "slice001_one_w3_knowledge_point_d0_visible",
      canonicalReachableKnowledgePointCount: 1,
      canonicalReachableKnowledgePointIds: Object.freeze([G3A_U08_PART_WHOLE_KP_ID]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice001Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)];
}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  if (sourceId === G3A_U08_SOURCE_ID) return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]);
  return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  if (knowledgePointId === G3A_U08_PART_WHOLE_KP_ID) return getG3AU08PartWholeSelectorRow(knowledgePointId);
  return base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  if (knowledgePointId === G3A_U08_PART_WHOLE_KP_ID) return listG3AU08PartWholePatternGroups(knowledgePointId);
  return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  if (knowledgePointId === G3A_U08_PART_WHOLE_KP_ID) return resolveG3AU08PartWholePatternSpecIds(knowledgePointId);
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function auditP03FPublicSelectorComposition() {
  const errors = [];
  const projection = auditG3AU08PartWholeSelectorProjection();
  errors.push(...projection.errors);
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3A_U08_SOURCE_ID);
  if (!availability || availability.visibleCount !== 1 || availability.hiddenPendingCount !== 6) errors.push("P03F_SELECTOR_AVAILABILITY_INVALID");
  const groups = getVisiblePatternGroupsForKnowledgePoint(G3A_U08_PART_WHOLE_KP_ID);
  if (groups.length !== 1 || groups[0].publicQuestionMode !== "numeric") errors.push("P03F_PUBLIC_GROUP_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      addedKnowledgePoints: 1,
      globalVisibleKnowledgePoints: allRows.length,
      patternGroups: 1,
      patternSpecs: 1,
      publicSources: 20,
    }),
  });
}
