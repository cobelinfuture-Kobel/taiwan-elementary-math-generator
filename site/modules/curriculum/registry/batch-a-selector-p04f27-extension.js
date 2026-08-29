export * from "./batch-a-selector-p04f26-extension.js";
import * as base from "./batch-a-selector-p04f26-extension.js";
import {
  G4A_U06_P04F27_SOURCE_ID,
  G4A_U06_P04F27_KP_ID,
  G4A_U06_P04F27_HISTORICAL_ALIAS_ID,
  auditG4AU06P04F27SelectorProjection,
  getG4AU06P04F27SelectorRow,
  listG4AU06P04F27PatternGroups,
  listG4AU06P04F27SelectorRows,
  resolveG4AU06P04F27PatternSpecIds,
} from "./g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4AU06P04F27SelectorRows().map((row) => Object.freeze(row)));
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
const prior = base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G4A_U06_P04F27_SOURCE_ID] ?? {};
const priorSourceRows = base.listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U06_P04F27_SOURCE_ID);
const priorVisible = prior.visibleKnowledgePointIds ?? priorSourceRows.map((row) => row.knowledgePointId);
const priorHidden = prior.hiddenPendingKnowledgePointIds ?? [G4A_U06_P04F27_HISTORICAL_ALIAS_ID];
const visibleKnowledgePointIds = Object.freeze([
  ...priorVisible.filter((id) => id !== G4A_U06_P04F27_KP_ID && id !== G4A_U06_P04F27_HISTORICAL_ALIAS_ID),
  G4A_U06_P04F27_KP_ID,
]);
const hiddenPendingKnowledgePointIds = Object.freeze(
  priorHidden.filter((id) => id !== G4A_U06_P04F27_KP_ID && id !== G4A_U06_P04F27_HISTORICAL_ALIAS_ID),
);
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: Number(base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount ?? 296) + 1,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4A_U06_P04F27_SOURCE_ID]: Object.freeze({
      ...prior,
      sourceId: G4A_U06_P04F27_SOURCE_ID,
      visibleCount: 6,
      hiddenPendingCount: 0,
      notSelectableCount: 0,
      visibleKnowledgePointIds,
      hiddenPendingKnowledgePointIds,
      notSelectableKnowledgePointIds: Object.freeze([]),
      publicSelectorStatus: "w4_slice027_fraction_times_integer_quantity_promoted",
      publicDropdownCutoverTask: "P04F_W4DirectProductVerticalSlice027Implementation",
      aliasReconciliation: Object.freeze({
        historicalHiddenAliasId: G4A_U06_P04F27_HISTORICAL_ALIAS_ID,
        frozenVisibleId: G4A_U06_P04F27_KP_ID,
      }),
    }),
  }),
});
export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return sourceId === G4A_U06_P04F27_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id) { return getG4AU06P04F27SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) { const groups = listG4AU06P04F27PatternGroups(id); return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const row = getG4AU06P04F27SelectorRow(id);
  if (!row) return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
  const normalized = mode == null ? null : String(mode).toLowerCase();
  return normalized == null || normalized === row.questionMode ? resolveG4AU06P04F27PatternSpecIds(id) : [];
}
export function auditP04F27PublicSelectorComposition() {
  const errors = [...auditG4AU06P04F27SelectorProjection().errors];
  const all = listVisibleBatchAKnowledgePoints();
  const ids = all.map((row) => row.knowledgePointId);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U06_P04F27_SOURCE_ID);
  if (new Set(ids).size !== ids.length) errors.push("P04F27_SELECTOR_DUPLICATE_KP");
  if (!availability?.visibleKnowledgePointIds?.includes(G4A_U06_P04F27_KP_ID)) errors.push("P04F27_G4A_U06_KP_NOT_VISIBLE");
  if (availability?.hiddenPendingKnowledgePointIds?.includes(G4A_U06_P04F27_KP_ID) || availability?.hiddenPendingKnowledgePointIds?.includes(G4A_U06_P04F27_HISTORICAL_ALIAS_ID)) errors.push("P04F27_G4A_U06_ALIAS_STILL_HIDDEN");
  if (availability?.visibleCount !== 6 || availability?.hiddenPendingCount !== 0 || availability?.notSelectableCount !== 0) errors.push("P04F27_G4A_U06_AVAILABILITY_INVALID");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== 42 || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== 42) errors.push("P04F27_PUBLIC_SOURCE_COUNT_INVALID");
  if (BATCH_A_SELECTOR_AVAILABILITY.visibleCount !== 297) errors.push("P04F27_PUBLIC_KP_COUNT_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ sources: 42, knowledgePoints: 297, g4aU06Visible: availability?.visibleCount ?? 0, g4aU06Hidden: availability?.hiddenPendingCount ?? 0, g4aU06NotSelectable: availability?.notSelectableCount ?? 0 }),
  });
}
