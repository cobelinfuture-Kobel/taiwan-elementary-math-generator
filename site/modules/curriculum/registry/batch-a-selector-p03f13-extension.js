export * from "./batch-a-selector-p03f12-extension.js";
import * as base from "./batch-a-selector-p03f12-extension.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_SELECTOR_PROJECTION,
  auditG5AU04ExpandReduceSimplestSelectorProjection,
  getG5AU04ExpandReduceSimplestSelectorRow,
  listG5AU04ExpandReduceSimplestPatternGroups,
  listG5AU04ExpandReduceSimplestSelectorRows,
  resolveG5AU04ExpandReduceSimplestPatternSpecIds,
} from "./g5a-u04-expand-reduce-simplest-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG5AU04ExpandReduceSimplestSelectorRows().map((row) => Object.freeze(row)));

export { G5A_U04_EXPAND_REDUCE_SIMPLEST_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 26,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G5A_U04_SOURCE_ID]: Object.freeze({
      sourceId: G5A_U04_SOURCE_ID,
      visibleCount: 1,
      hiddenPendingCount: 4,
      notSelectableCount: 0,
      publicSelectorStatus: "slice013_first_w3_knowledge_point_candidate_visible",
      canonicalReachableKnowledgePointCount: 1,
      canonicalReachableKnowledgePointIds: Object.freeze([
        G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice013Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)];
}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G5A_U04_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) {
  return getG5AU04ExpandReduceSimplestSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG5AU04ExpandReduceSimplestPatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG5AU04ExpandReduceSimplestPatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}
export function auditP03F13PublicSelectorComposition() {
  const errors = [...auditG5AU04ExpandReduceSimplestSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F13_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U04_SOURCE_ID);
  if (!availability || availability.visibleCount !== 1 || availability.hiddenPendingCount !== 4) {
    errors.push("P03F13_SELECTOR_AVAILABILITY_INVALID");
  }
  const sourceRows = allRows.filter((row) => row.sourceId === G5A_U04_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 1 || groups.length !== 1 || specs.length !== 3) {
    errors.push("P03F13_CURRENT_SOURCE_SURFACE_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      addedSources: 1,
      addedKnowledgePoints: 1,
      currentSourceKnowledgePoints: 1,
      currentSourcePatternGroups: 1,
      currentSourcePatternSpecs: 3,
      publicSources: 26,
    }),
  });
}
