export * from "./batch-a-selector-p03f23-extension.js";
import * as base from "./batch-a-selector-p03f23-extension.js";
import {
  G3B_U07_P03F24_KP_IDS,
  G3B_U07_P03F24_SELECTOR_PROJECTION,
  auditG3BU07P03F24SelectorProjection,
  getG3BU07P03F24SelectorRow,
  listG3BU07P03F24PatternGroups,
  listG3BU07P03F24SelectorRows,
  resolveG3BU07P03F24PatternSpecIds,
} from "./g3b-u07-fraction-context-selector-projection-p03f24.js";
import { G3B_U07_SOURCE_ID } from "./g3b-u07-quotient-fraction-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3BU07P03F24SelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G3B_U07_SOURCE_ID);

export { G3B_U07_P03F24_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 4,
  publicSourceCount: base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3B_U07_SOURCE_ID]: Object.freeze({
      ...(prior ?? {}),
      sourceId: G3B_U07_SOURCE_ID,
      visibleCount: (prior?.visibleCount ?? 4) + 4,
      hiddenPendingCount: Math.max(0, (prior?.hiddenPendingCount ?? 4) - 4),
      notSelectableCount: 0,
      publicSelectorStatus: "slice024_final_four_fraction_kps_added_to_existing_w3_source",
      canonicalReachableKnowledgePointCount: (prior?.canonicalReachableKnowledgePointCount ?? 4) + 4,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...(prior?.canonicalReachableKnowledgePointIds ?? []),
        ...G3B_U07_P03F24_KP_IDS,
      ]),
      compatibilityProjection: "full_product_w3_shared_fraction_and_application_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice024Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G3B_U07_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG3BU07P03F24SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG3BU07P03F24PatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG3BU07P03F24PatternSpecIds(id, mode);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F24PublicSelectorComposition() {
  const errors = [...auditG3BU07P03F24SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F24_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U07_SOURCE_ID);
  if (!availability || availability.visibleCount !== 8 || availability.hiddenPendingCount !== 0) errors.push("P03F24_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G3B_U07_SOURCE_ID);
  if (sourceRows.length !== 8) errors.push("P03F24_EXISTING_SOURCE_KP_COUNT_INVALID");
  if (BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount) errors.push("P03F24_PUBLIC_SOURCE_COUNT_CHANGED");
  const groups = G3B_U07_P03F24_KP_IDS.flatMap((id) => getVisiblePatternGroupsForKnowledgePoint(id));
  if (groups.length !== 8 || new Set(groups.flatMap((group) => group.patternSpecIds)).size !== 20) errors.push("P03F24_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedSources: 0, addedKnowledgePoints: 4, currentSourceKnowledgePoints: sourceRows.length, addedPatternGroups: 8, addedPatternSpecs: 20, publicSources: BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount }) });
}
