export * from "./batch-a-selector-p03f16-extension.js";
import * as base from "./batch-a-selector-p03f16-extension.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_SELECTOR_PROJECTION,
  auditG4AU06FractionClassificationSelectorProjection,
  getG4AU06FractionClassificationSelectorRow,
  listG4AU06FractionClassificationPatternGroups,
  listG4AU06FractionClassificationSelectorRows,
  resolveG4AU06FractionClassificationPatternSpecIds,
} from "./g4a-u06-fraction-type-classification-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4AU06FractionClassificationSelectorRows().map((row) => Object.freeze(row)));

export { G4A_U06_FRACTION_CLASSIFICATION_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount + 1,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID]: Object.freeze({
      sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
      visibleCount: 1,
      hiddenPendingCount: 5,
      notSelectableCount: 0,
      publicSelectorStatus: "slice017_fraction_type_classification_new_w3_source",
      canonicalReachableKnowledgePointCount: 1,
      canonicalReachableKnowledgePointIds: Object.freeze([G4A_U06_FRACTION_CLASSIFICATION_KP_ID]),
      compatibilityProjection: "full_product_w3_shared_fraction_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice017Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG4AU06FractionClassificationSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4AU06FractionClassificationPatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG4AU06FractionClassificationPatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F17PublicSelectorComposition() {
  const errors = [...auditG4AU06FractionClassificationSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F17_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID);
  if (!availability || availability.visibleCount !== 1 || availability.hiddenPendingCount !== 5) errors.push("P03F17_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 1 || groups.length !== 1 || specs.length !== 3) errors.push("P03F17_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedSources: 1, addedKnowledgePoints: 1, currentSourceKnowledgePoints: 1, addedPatternGroups: 1, addedPatternSpecs: 3, publicSources: BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount }),
  });
}
