export * from "./batch-a-selector-p03f42-extension.js";
import * as base from "./batch-a-selector-p03f42-extension.js";
import {
  G4B_U08_P03F43_SELECTOR_PROJECTION,
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_HIDDEN_SIBLING_KP_IDS,
  P03F43_KP_IDS,
  auditG4BU08P03F43SelectorProjection,
  getG4BU08P03F43SelectorRow,
  listG4BU08P03F43PatternGroups,
  listG4BU08P03F43SelectorRows,
  resolveG4BU08P03F43PatternSpecIds,
} from "./g4b-u08-rank10-fraction-selector-projection-p03f43.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4BU08P03F43SelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G4B_U08_P03F43_SOURCE_ID);
const sourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;
const priorVisibleIds = base.listVisibleBatchAKnowledgePoints()
  .filter((row) => row.sourceId === G4B_U08_P03F43_SOURCE_ID)
  .map((row) => row.knowledgePointId);
const canonicalIds = [...new Set([
  ...(prior?.canonicalReachableKnowledgePointIds ?? []),
  ...priorVisibleIds,
  ...P03F43_KP_IDS,
])];

export { G4B_U08_P03F43_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 2,
  sourceCount,
  publicSourceCount: sourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4B_U08_P03F43_SOURCE_ID]: Object.freeze({
      ...(prior ?? {}),
      sourceId: G4B_U08_P03F43_SOURCE_ID,
      visibleCount: 7,
      hiddenPendingCount: 0,
      notSelectableCount: 0,
      publicSelectorStatus: "slice043_q043_two_kp_rank10_fraction_admission",
      canonicalReachableKnowledgePointCount: 7,
      canonicalReachableKnowledgePointIds: Object.freeze(canonicalIds),
      visibleKnowledgePointIds: Object.freeze([...new Set([...priorVisibleIds, ...P03F43_KP_IDS])]),
      hiddenPendingKnowledgePointIds: P03F43_HIDDEN_SIBLING_KP_IDS,
      compatibilityProjection: "full_product_w3_shared_fraction_number_line_and_bounds_runtime",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice043Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4B_U08_P03F43_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG4BU08P03F43SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4BU08P03F43PatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG4BU08P03F43PatternSpecIds(id);
  return ids.length && (mode == null || mode === "numeric")
    ? ids
    : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F43PublicSelectorComposition() {
  const errors = [...auditG4BU08P03F43SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F43_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4B_U08_P03F43_SOURCE_ID);
  if (!availability || availability.visibleCount !== 7 || availability.hiddenPendingCount !== 0 || availability.notSelectableCount !== 0) errors.push("P03F43_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G4B_U08_P03F43_SOURCE_ID);
  if (sourceRows.length !== 7) errors.push("P03F43_EXISTING_SOURCE_KP_COUNT_INVALID");
  if (P03F43_KP_IDS.some((id) => !ids.includes(id))) errors.push("P03F43_ALLOCATED_KP_MISSING");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== 33 || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== 33) errors.push("P03F43_PUBLIC_SOURCE_COUNT_CHANGED");
  if (BATCH_A_SELECTOR_AVAILABILITY.visibleCount !== 243) errors.push("P03F43_PUBLIC_KP_COUNT_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      addedSources: 0,
      addedKnowledgePoints: 2,
      hiddenSiblings: 0,
      currentSourceKnowledgePoints: sourceRows.length,
      addedPatternGroups: 2,
      addedPatternSpecs: 3,
      publicSources: sourceCount,
      publicKnowledgePoints: BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
    }),
  });
}
