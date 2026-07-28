export * from "./batch-a-selector-p03f4-extension.js";

import * as base from "./batch-a-selector-p03f4-extension.js";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_SELECTOR_PROJECTION,
  auditG4BU08EquivalentFractionSelectorProjection,
  getG4BU08EquivalentFractionSelectorRow,
  listG4BU08EquivalentFractionPatternGroups,
  listG4BU08EquivalentFractionSelectorRows,
  resolveG4BU08EquivalentFractionPatternSpecIds,
} from "./g4b-u08-equivalent-fraction-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4BU08EquivalentFractionSelectorRows().map((row) => Object.freeze(row)));

export { G4B_U08_EQUIVALENT_FRACTION_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 23,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4B_U08_SOURCE_ID]: Object.freeze({
      sourceId: G4B_U08_SOURCE_ID,
      visibleCount: 1,
      hiddenPendingCount: 6,
      notSelectableCount: 0,
      publicSelectorStatus: "slice005_one_w3_knowledge_point_d0_visible",
      canonicalReachableKnowledgePointCount: 1,
      canonicalReachableKnowledgePointIds: Object.freeze(["kp_g4b_u08_generate_equivalent_fraction"]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice005Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  if (sourceId === G4B_U08_SOURCE_ID) return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]);
  return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return getG4BU08EquivalentFractionSelectorRow(knowledgePointId) ?? base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const groups = listG4BU08EquivalentFractionPatternGroups(knowledgePointId);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const ids = resolveG4BU08EquivalentFractionPatternSpecIds(knowledgePointId);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function auditP03F5PublicSelectorComposition() {
  const errors = [];
  const projection = auditG4BU08EquivalentFractionSelectorProjection();
  errors.push(...projection.errors);
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F5_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4B_U08_SOURCE_ID);
  if (!availability || availability.visibleCount !== 1 || availability.hiddenPendingCount !== 6) errors.push("P03F5_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G4B_U08_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 1 || groups.length !== 1 || specs.length !== 3) errors.push("P03F5_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedKnowledgePoints: 1, currentSourceKnowledgePoints: 1, currentSourcePatternGroups: 1, currentSourcePatternSpecs: 3, publicSources: 23 }),
  });
}
