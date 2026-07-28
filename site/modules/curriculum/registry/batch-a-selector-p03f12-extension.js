export * from "./batch-a-selector-p03f11-extension.js";
import * as base from "./batch-a-selector-p03f11-extension.js";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_KP_ID,
} from "./g4b-u08-equivalent-fraction-selector-projection.js";
import {
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SELECTOR_PROJECTION,
  auditG4BU08EquivalenceCrossProductSelectorProjection,
  getG4BU08EquivalenceCrossProductSelectorRow,
  listG4BU08EquivalenceCrossProductPatternGroups,
  listG4BU08EquivalenceCrossProductSelectorRows,
  resolveG4BU08EquivalenceCrossProductPatternSpecIds,
} from "./g4b-u08-equivalence-cross-product-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4BU08EquivalenceCrossProductSelectorRows().map((row) => Object.freeze(row)));
const baseAvailability = base.listBatchAKnowledgePointAvailabilityBySource(G4B_U08_SOURCE_ID);

export { G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 25,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4B_U08_SOURCE_ID]: Object.freeze({
      ...(baseAvailability ?? {}),
      sourceId: G4B_U08_SOURCE_ID,
      visibleCount: 2,
      hiddenPendingCount: 5,
      notSelectableCount: 0,
      publicSelectorStatus: "slice012_two_w3_knowledge_points_candidate_visible",
      canonicalReachableKnowledgePointCount: 2,
      canonicalReachableKnowledgePointIds: Object.freeze([
        G4B_U08_EQUIVALENT_FRACTION_KP_ID,
        G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice012Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)];
}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4B_U08_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) {
  return getG4BU08EquivalenceCrossProductSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4BU08EquivalenceCrossProductPatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG4BU08EquivalenceCrossProductPatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}
export function auditP03F12PublicSelectorComposition() {
  const errors = [...auditG4BU08EquivalenceCrossProductSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F12_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4B_U08_SOURCE_ID);
  if (!availability || availability.visibleCount !== 2 || availability.hiddenPendingCount !== 5) {
    errors.push("P03F12_SELECTOR_AVAILABILITY_INVALID");
  }
  const sourceRows = allRows.filter((row) => row.sourceId === G4B_U08_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 2 || groups.length !== 2 || specs.length !== 4) {
    errors.push("P03F12_CURRENT_SOURCE_SURFACE_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      addedKnowledgePoints: 1,
      currentSourceKnowledgePoints: 2,
      currentSourcePatternGroups: 2,
      currentSourcePatternSpecs: 4,
      publicSources: 25,
    }),
  });
}
