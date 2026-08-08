export * from "./batch-a-selector-p03f28-extension.js";
import * as base from "./batch-a-selector-p03f28-extension.js";
import {
  G5A_U04_P03F29_KP_ID,
  G5A_U04_P03F29_SELECTOR_PROJECTION,
  G5A_U04_P03F29_SOURCE_ID,
  auditG5AU04P03F29SelectorProjection,
  getG5AU04P03F29SelectorRow,
  listG5AU04P03F29PatternGroups,
  listG5AU04P03F29SelectorRows,
  resolveG5AU04P03F29PatternSpecIds,
} from "./g5a-u04-rank8-fraction-selector-projection-p03f29.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG5AU04P03F29SelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G5A_U04_P03F29_SOURCE_ID);
const currentSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;
const CURRENT_G5A_U04_TOTAL_KP_COUNT = 7;
const CURRENT_G5A_U04_VISIBLE_KP_COUNT = 5;

export { G5A_U04_P03F29_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  sourceCount: currentSourceCount,
  publicSourceCount: currentSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G5A_U04_P03F29_SOURCE_ID]: Object.freeze({
      ...(prior ?? {}),
      sourceId: G5A_U04_P03F29_SOURCE_ID,
      visibleCount: CURRENT_G5A_U04_VISIBLE_KP_COUNT,
      hiddenPendingCount: CURRENT_G5A_U04_TOTAL_KP_COUNT - CURRENT_G5A_U04_VISIBLE_KP_COUNT,
      notSelectableCount: CURRENT_G5A_U04_TOTAL_KP_COUNT - CURRENT_G5A_U04_VISIBLE_KP_COUNT,
      publicSelectorStatus: "slice029_rank8_unlike_fraction_compare_added_to_existing_g5a_u04_source",
      canonicalReachableKnowledgePointCount: CURRENT_G5A_U04_VISIBLE_KP_COUNT,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...new Set([
          ...(prior?.canonicalReachableKnowledgePointIds ?? []),
          G5A_U04_P03F29_KP_ID,
        ]),
      ]),
      compatibilityProjection: "full_product_w3_shared_fraction_compare_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice029Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return sourceId === G5A_U04_P03F29_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id) { return getG5AU04P03F29SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) { const groups = listG5AU04P03F29PatternGroups(id); return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) { const ids = resolveG5AU04P03F29PatternSpecIds(id); return ids.length && (mode == null || mode === "numeric") ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode); }

export function auditP03F29PublicSelectorComposition() {
  const errors = [...auditG5AU04P03F29SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F29_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U04_P03F29_SOURCE_ID);
  if (!availability || availability.visibleCount !== 5 || availability.hiddenPendingCount !== 2 || availability.notSelectableCount !== 2) errors.push("P03F29_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G5A_U04_P03F29_SOURCE_ID);
  if (sourceRows.length !== 5) errors.push("P03F29_EXISTING_SOURCE_KP_COUNT_INVALID");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== currentSourceCount || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== currentSourceCount) errors.push("P03F29_PUBLIC_SOURCE_COUNT_CHANGED");
  const groups = getVisiblePatternGroupsForKnowledgePoint(G5A_U04_P03F29_KP_ID);
  if (groups.length !== 1 || groups[0].patternSpecIds.length !== 1) errors.push("P03F29_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedSources: 0, addedKnowledgePoints: 1, currentSourceKnowledgePoints: sourceRows.length, addedPatternGroups: 1, addedPatternSpecs: 1, publicSources: currentSourceCount }) });
}
