export * from "./batch-a-selector-p03f22-extension.js";
import * as base from "./batch-a-selector-p03f22-extension.js";
import { G6A_U02_SOURCE_ID, G6A_U02_RECIPROCAL_ROWS, auditG6AU02ReciprocalSelectorProjection, getG6AU02ReciprocalSelectorRow, listG6AU02ReciprocalPatternGroups, resolveG6AU02ReciprocalPatternSpecIds } from "./g6a-u02-reciprocal-selector-projection.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(G6A_U02_RECIPROCAL_ROWS.map(clone));
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  sourceCount: (base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length) + 1,
  bySourceId: Object.freeze({ ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G6A_U02_SOURCE_ID]: Object.freeze({ sourceId: G6A_U02_SOURCE_ID, visibleCount: 1, hiddenPendingCount: 4, notSelectableCount: 4,
      publicSelectorStatus: "slice023_reciprocal_successor", canonicalReachableKnowledgePointCount: 1,
      canonicalReachableKnowledgePointIds: Object.freeze(rows.map((row) => row.knowledgePointId)),
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice023Implementation" }) }),
});
export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(id) { return id === G6A_U02_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[id]) : base.listBatchAKnowledgePointAvailabilityBySource(id); }
export function getVisibleBatchAKnowledgePoint(id) { return getG6AU02ReciprocalSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) { const found = listG6AU02ReciprocalPatternGroups(id); return found.length ? found : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) { const found = resolveG6AU02ReciprocalPatternSpecIds(id); return found.length ? found : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode); }
export function auditP03F23PublicSelectorComposition() {
  const errors = [...auditG6AU02ReciprocalSelectorProjection().errors];
  const ids = listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F23_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G6A_U02_SOURCE_ID);
  if (availability.visibleCount !== 1 || availability.hiddenPendingCount !== 4) errors.push("P03F23_SELECTOR_AVAILABILITY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedSources: 1, addedKnowledgePoints: 1, visibleForSource: 1, hiddenForSource: 4 }) });
}
