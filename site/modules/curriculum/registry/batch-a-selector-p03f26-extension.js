export * from "./batch-a-selector-p03f25-extension.js";
import * as base from "./batch-a-selector-p03f25-extension.js";
import {
  G4A_U09_P03F26_KP_IDS,
  G4A_U09_P03F26_SELECTOR_PROJECTION,
  G4A_U09_P03F26_SOURCE_ID,
  auditG4AU09P03F26SelectorProjection,
  getG4AU09P03F26SelectorRow,
  listG4AU09P03F26PatternGroups,
  listG4AU09P03F26SelectorRows,
  resolveG4AU09P03F26PatternSpecIds,
} from "./g4a-u09-rank8-decimal-selector-projection-p03f26.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4AU09P03F26SelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G4A_U09_P03F26_SOURCE_ID);
const currentSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;
const CURRENT_G4A_U09_TOTAL_KP_COUNT = 8;
const CURRENT_G4A_U09_VISIBLE_KP_COUNT = 6;

export { G4A_U09_P03F26_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 4,
  sourceCount: currentSourceCount,
  publicSourceCount: currentSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4A_U09_P03F26_SOURCE_ID]: Object.freeze({
      ...(prior ?? {}),
      sourceId: G4A_U09_P03F26_SOURCE_ID,
      visibleCount: CURRENT_G4A_U09_VISIBLE_KP_COUNT,
      hiddenPendingCount: CURRENT_G4A_U09_TOTAL_KP_COUNT - CURRENT_G4A_U09_VISIBLE_KP_COUNT,
      notSelectableCount: 0,
      publicSelectorStatus: "slice026_rank8_decimal_kps_added_to_existing_g4a_u09_source",
      canonicalReachableKnowledgePointCount: CURRENT_G4A_U09_VISIBLE_KP_COUNT,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...new Set([
          ...(prior?.canonicalReachableKnowledgePointIds ?? []),
          ...G4A_U09_P03F26_KP_IDS,
        ]),
      ]),
      compatibilityProjection: "full_product_w3_shared_decimal_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice026Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4A_U09_P03F26_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG4AU09P03F26SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4AU09P03F26PatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG4AU09P03F26PatternSpecIds(id);
  return ids.length && (mode == null || mode === "numeric") ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F26PublicSelectorComposition() {
  const errors = [...auditG4AU09P03F26SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F26_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U09_P03F26_SOURCE_ID);
  if (!availability || availability.visibleCount !== 6 || availability.hiddenPendingCount !== 2) errors.push("P03F26_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G4A_U09_P03F26_SOURCE_ID);
  if (sourceRows.length !== 6) errors.push("P03F26_EXISTING_SOURCE_KP_COUNT_INVALID");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== currentSourceCount || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== currentSourceCount) errors.push("P03F26_PUBLIC_SOURCE_COUNT_CHANGED");
  const groups = G4A_U09_P03F26_KP_IDS.flatMap((id) => getVisiblePatternGroupsForKnowledgePoint(id));
  if (groups.length !== 4 || new Set(groups.flatMap((group) => group.patternSpecIds)).size !== 5) errors.push("P03F26_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedSources: 0, addedKnowledgePoints: 4, currentSourceKnowledgePoints: sourceRows.length, addedPatternGroups: 4, addedPatternSpecs: 5, publicSources: currentSourceCount }) });
}