export * from "./batch-a-selector-p03f32-extension.js";
import * as base from "./batch-a-selector-p03f32-extension.js";
import {
  G4A_U06_P03F33_KP_IDS,
  G4A_U06_P03F33_SELECTOR_PROJECTION,
  G4A_U06_P03F33_SOURCE_ID,
  auditG4AU06P03F33SelectorProjection,
  getG4AU06P03F33SelectorRow,
  listG4AU06P03F33PatternGroups,
  listG4AU06P03F33SelectorRows,
  resolveG4AU06P03F33PatternSpecIds,
} from "./g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4AU06P03F33SelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G4A_U06_P03F33_SOURCE_ID);
const currentSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;
const priorReachableIds = Object.freeze([...(prior?.canonicalReachableKnowledgePointIds ?? [])]);
const currentReachableIds = Object.freeze([...new Set([...priorReachableIds, ...G4A_U06_P03F33_KP_IDS])]);

export { G4A_U06_P03F33_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount:base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + rows.length,
  sourceCount:currentSourceCount,
  publicSourceCount:currentSourceCount,
  bySourceId:Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4A_U06_P03F33_SOURCE_ID]:Object.freeze({
      ...(prior ?? {}),
      sourceId:G4A_U06_P03F33_SOURCE_ID,
      visibleCount:(prior?.visibleCount ?? 2) + rows.length,
      hiddenPendingCount:Math.max(0, (prior?.hiddenPendingCount ?? 4) - rows.length),
      notSelectableCount:Math.max(0, (prior?.hiddenPendingCount ?? 4) - rows.length),
      publicSelectorStatus:"slice033_rank9_fraction_three_kp_union_added_to_existing_source",
      canonicalReachableKnowledgePointCount:currentReachableIds.length,
      canonicalReachableKnowledgePointIds:currentReachableIds,
      visibleKnowledgePointIds:currentReachableIds,
      hiddenPendingKnowledgePointIds:Object.freeze(["kp_g4a_u06_fraction_times_integer_quantity"]),
      compatibilityProjection:"full_product_w3_shared_fraction_pipeline",
      publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice033Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)];
}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4A_U06_P03F33_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) {
  return getG4AU06P03F33SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4AU06P03F33PatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG4AU06P03F33PatternSpecIds(id);
  return ids.length && (mode == null || mode === "numeric")
    ? ids
    : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F33PublicSelectorComposition() {
  const errors = [...auditG4AU06P03F33SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F33_SELECTOR_DUPLICATE_KP");
  const sourceRows = allRows.filter((row) => row.sourceId === G4A_U06_P03F33_SOURCE_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U06_P03F33_SOURCE_ID);
  if (sourceRows.length !== 5) errors.push("P03F33_EXISTING_SOURCE_KP_UNION_INVALID");
  if (!availability || availability.visibleCount !== 5 || availability.hiddenPendingCount !== 1 || availability.notSelectableCount !== 1) errors.push("P03F33_SELECTOR_AVAILABILITY_INVALID");
  if (G4A_U06_P03F33_KP_IDS.some((id) => !ids.includes(id))) errors.push("P03F33_PROMOTED_KP_MISSING");
  if (ids.includes("kp_g4a_u06_fraction_times_integer_quantity")) errors.push("P03F33_LATER_QUEUE_KP_LEAK");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== currentSourceCount || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== currentSourceCount) errors.push("P03F33_PUBLIC_SOURCE_COUNT_CHANGED");
  if (BATCH_A_SELECTOR_AVAILABILITY.visibleCount !== 229) errors.push("P03F33_GLOBAL_VISIBLE_KP_COUNT_INVALID");
  const groupCount = G4A_U06_P03F33_KP_IDS.flatMap((id) => getVisiblePatternGroupsForKnowledgePoint(id)).length;
  const specCount = new Set(G4A_U06_P03F33_KP_IDS.flatMap((id) => resolveVisiblePatternSpecIdsForKnowledgePoint(id, "numeric"))).size;
  if (groupCount !== 3 || specCount !== 4) errors.push("P03F33_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({
    ok:errors.length===0,
    errors:Object.freeze(errors),
    counts:Object.freeze({ addedSources:0, addedKnowledgePoints:3, currentSourceKnowledgePoints:sourceRows.length, hiddenSourceKnowledgePoints:1, addedPatternGroups:3, addedPatternSpecs:4, publicSources:currentSourceCount, publicKnowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount }),
  });
}
