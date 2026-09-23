export * from "./batch-a-selector-p03f30-extension.js";
import * as base from "./batch-a-selector-p03f30-extension.js";
import {
  G5B_U04_P03F31_KP_ID,
  G5B_U04_P03F31_SELECTOR_PROJECTION,
  G5B_U04_P03F31_SOURCE_ID,
  auditG5BU04P03F31SelectorProjection,
  getG5BU04P03F31SelectorRow,
  listG5BU04P03F31PatternGroups,
  listG5BU04P03F31SelectorRows,
  resolveG5BU04P03F31PatternSpecIds,
} from "./g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG5BU04P03F31SelectorRows().map((row) => Object.freeze(row)));
const baseSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;

export { G5B_U04_P03F31_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  sourceCount: baseSourceCount + 1,
  publicSourceCount: baseSourceCount + 1,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G5B_U04_P03F31_SOURCE_ID]: Object.freeze({
      sourceId: G5B_U04_P03F31_SOURCE_ID,
      visibleCount: 1,
      hiddenPendingCount: 0,
      notSelectableCount: 0,
      publicSelectorStatus: "slice031_rank8_decimal_times_integer_new_public_source",
      canonicalReachableKnowledgePointCount: 1,
      canonicalReachableKnowledgePointIds: Object.freeze([G5B_U04_P03F31_KP_ID]),
      compatibilityProjection: "full_product_w3_shared_decimal_multiplication_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice031Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return sourceId === G5B_U04_P03F31_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id) { return getG5BU04P03F31SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) { const groups = listG5BU04P03F31PatternGroups(id); return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) { const ids = resolveG5BU04P03F31PatternSpecIds(id); return ids.length && (mode == null || mode === "numeric") ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode); }

export function auditP03F31PublicSelectorComposition() {
  const errors = [...auditG5BU04P03F31SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F31_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5B_U04_P03F31_SOURCE_ID);
  if (!availability || availability.visibleCount !== 1 || availability.hiddenPendingCount !== 0 || availability.notSelectableCount !== 0) errors.push("P03F31_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G5B_U04_P03F31_SOURCE_ID);
  if (sourceRows.length !== 1) errors.push("P03F31_NEW_SOURCE_KP_COUNT_INVALID");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== baseSourceCount + 1 || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== baseSourceCount + 1) errors.push("P03F31_PUBLIC_SOURCE_COUNT_INVALID");
  const groups = getVisiblePatternGroupsForKnowledgePoint(G5B_U04_P03F31_KP_ID);
  if (groups.length !== 1 || groups[0].patternSpecIds.length !== 1) errors.push("P03F31_PATTERN_SURFACE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedSources: 1, addedKnowledgePoints: 1, currentSourceKnowledgePoints: sourceRows.length, addedPatternGroups: 1, addedPatternSpecs: 1, publicSources: baseSourceCount + 1 }) });
}
