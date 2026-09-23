export * from "./batch-a-selector-p03f21-extension.js";
import * as base from "./batch-a-selector-p03f21-extension.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_SLICE022_ROWS,
  auditG5AU04Slice022SelectorProjection,
  getG5AU04Slice022SelectorRow,
  listG5AU04Slice022PatternGroups,
  resolveG5AU04Slice022PatternSpecIds,
} from "./g5a-u04-rank7-fraction-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(G5A_U04_SLICE022_ROWS.map(clone));
const prior = base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G5A_U04_SOURCE_ID];
const visibleIds = Object.freeze([...(prior.canonicalReachableKnowledgePointIds ?? []), ...rows.map((row) => row.knowledgePointId)]);
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + rows.length,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G5A_U04_SOURCE_ID]: Object.freeze({
      ...prior, visibleCount: prior.visibleCount + rows.length,
      hiddenPendingCount: prior.hiddenPendingCount - rows.length,
      notSelectableCount: prior.notSelectableCount - rows.length,
      publicSelectorStatus: "slice022_rank7_fraction_successor",
      canonicalReachableKnowledgePointCount: visibleIds.length,
      canonicalReachableKnowledgePointIds: visibleIds,
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice022Implementation",
    }),
  }),
});
export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(id) { return id === G5A_U04_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[id]) : base.listBatchAKnowledgePointAvailabilityBySource(id); }
export function getVisibleBatchAKnowledgePoint(id) { return getG5AU04Slice022SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) { const found = listG5AU04Slice022PatternGroups(id); return found.length ? found : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) { const found = resolveG5AU04Slice022PatternSpecIds(id); return found.length ? found : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode); }
export function auditP03F22PublicSelectorComposition() {
  const errors = [...auditG5AU04Slice022SelectorProjection().errors];
  const ids = listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F22_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U04_SOURCE_ID);
  if (availability.visibleCount !== 4 || availability.hiddenPendingCount !== 3) errors.push("P03F22_SELECTOR_AVAILABILITY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedKnowledgePoints: 2, visibleForSource: availability.visibleCount, hiddenForSource: availability.hiddenPendingCount }) });
}
