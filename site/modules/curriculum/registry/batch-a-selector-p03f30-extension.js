export * from "./batch-a-selector-p03f29-extension.js";
import * as base from "./batch-a-selector-p03f29-extension.js";
import {
  G5A_U06_P03F30_KP_IDS,
  G5A_U06_P03F30_SELECTOR_PROJECTION,
  G5A_U06_P03F30_SOURCE_ID,
  auditG5AU06P03F30SelectorProjection,
  getG5AU06P03F30SelectorRow,
  listG5AU06P03F30PatternGroups,
  listG5AU06P03F30SelectorRows,
  resolveG5AU06P03F30PatternSpecIds,
} from "./g5a-u06-rank8-fraction-selector-projection-p03f30.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG5AU06P03F30SelectorRows().map((row) => Object.freeze(row)));
const baseSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;

export { G5A_U06_P03F30_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + rows.length,
  sourceCount: baseSourceCount + 1,
  publicSourceCount: baseSourceCount + 1,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G5A_U06_P03F30_SOURCE_ID]: Object.freeze({
      sourceId: G5A_U06_P03F30_SOURCE_ID,
      visibleCount: 4,
      hiddenPendingCount: 3,
      notSelectableCount: 3,
      publicSelectorStatus: "slice030_rank8_four_fraction_kps_new_public_source",
      canonicalReachableKnowledgePointCount: 4,
      canonicalReachableKnowledgePointIds: G5A_U06_P03F30_KP_IDS,
      compatibilityProjection: "full_product_w3_shared_fraction_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice030Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return sourceId === G5A_U06_P03F30_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id) { return getG5AU06P03F30SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) { const groups = listG5AU06P03F30PatternGroups(id); return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) { const ids = resolveG5AU06P03F30PatternSpecIds(id); return ids.length && (mode == null || mode === "numeric") ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode); }

export function auditP03F30PublicSelectorComposition() {
  const errors = [...auditG5AU06P03F30SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F30_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U06_P03F30_SOURCE_ID);
  if (!availability || availability.visibleCount !== 4 || availability.hiddenPendingCount !== 3 || availability.notSelectableCount !== 3) errors.push("P03F30_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G5A_U06_P03F30_SOURCE_ID);
  if (sourceRows.length !== 4) errors.push("P03F30_NEW_SOURCE_KP_COUNT_INVALID");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== baseSourceCount + 1 || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== baseSourceCount + 1) errors.push("P03F30_PUBLIC_SOURCE_COUNT_INVALID");
  for (const kpId of G5A_U06_P03F30_KP_IDS) {
    const groups = getVisiblePatternGroupsForKnowledgePoint(kpId);
    if (groups.length !== 1 || groups[0].patternSpecIds.length !== 1) errors.push("P03F30_NEW_PATTERN_SURFACE_INVALID");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedSources: 1, addedKnowledgePoints: 4, currentSourceKnowledgePoints: sourceRows.length, addedPatternGroups: 4, addedPatternSpecs: 4, publicSources: baseSourceCount + 1 }) });
}
