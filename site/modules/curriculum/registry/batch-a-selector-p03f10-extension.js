export * from "./batch-a-selector-p03f9-extension.js";
import * as base from "./batch-a-selector-p03f9-extension.js";
import {
  G4A_U09_SOURCE_ID,
  G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_SELECTOR_PROJECTION,
  auditG4AU09HundredthDecimalSelectorProjection,
  getG4AU09HundredthDecimalSelectorRow,
  listG4AU09HundredthDecimalPatternGroups,
  listG4AU09HundredthDecimalSelectorRows,
  resolveG4AU09HundredthDecimalPatternSpecIds,
} from "./g4a-u09-hundredth-decimal-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4AU09HundredthDecimalSelectorRows().map((row) => Object.freeze(row)));

export { G4A_U09_HUNDREDTH_DECIMAL_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 24,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4A_U09_SOURCE_ID]: Object.freeze({
      sourceId: G4A_U09_SOURCE_ID,
      visibleCount: 1,
      hiddenPendingCount: 6,
      notSelectableCount: 0,
      publicSelectorStatus: "slice010_one_w3_knowledge_point_candidate_visible",
      canonicalReachableKnowledgePointCount: 1,
      canonicalReachableKnowledgePointIds: Object.freeze([G4A_U09_HUNDREDTH_DECIMAL_KP_ID]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice010Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4A_U09_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) {
  return getG4AU09HundredthDecimalSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4AU09HundredthDecimalPatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) {
  const ids = resolveG4AU09HundredthDecimalPatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id);
}

export function auditP03F10PublicSelectorComposition() {
  const errors = [...auditG4AU09HundredthDecimalSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F10_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U09_SOURCE_ID);
  if (!availability || availability.visibleCount !== 1 || availability.hiddenPendingCount !== 6) errors.push("P03F10_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G4A_U09_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 1 || groups.length !== 1 || specs.length !== 1) errors.push("P03F10_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedKnowledgePoints: 1, currentSourceKnowledgePoints: 1, currentSourcePatternGroups: 1, currentSourcePatternSpecs: 1, publicSources: 24 }),
  });
}
