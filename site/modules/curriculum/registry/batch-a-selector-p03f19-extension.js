export * from "./batch-a-selector-p03f18-extension.js";
import * as base from "./batch-a-selector-p03f18-extension.js";
import {
  G4B_U06_SLICE019_SOURCE_ID,
  G4B_U06_SLICE019_KNOWLEDGE_POINT_ROWS,
  auditG4BU06Slice019SelectorProjection,
  getG4BU06Slice019SelectorRow,
  listG4BU06Slice019PatternGroups,
  resolveG4BU06Slice019PatternSpecIds,
} from "./g4b-u06-two-decimal-rate-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(G4B_U06_SLICE019_KNOWLEDGE_POINT_ROWS.map((row) => Object.freeze(clone(row))));
const prior = base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G4B_U06_SLICE019_SOURCE_ID];

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + rows.length,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4B_U06_SLICE019_SOURCE_ID]: Object.freeze({
      ...prior,
      sourceId: G4B_U06_SLICE019_SOURCE_ID,
      visibleCount: (prior?.visibleCount ?? 0) + rows.length,
      hiddenPendingCount: Math.max(0, (prior?.hiddenPendingCount ?? rows.length) - rows.length),
      publicSelectorStatus: "slice019_two_decimal_rate_successor",
      canonicalReachableKnowledgePointCount: (prior?.canonicalReachableKnowledgePointCount ?? 0) + rows.length,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...(prior?.canonicalReachableKnowledgePointIds ?? []),
        ...rows.map((row) => row.knowledgePointId),
      ]),
      compatibilityProjection: "full_product_w3_shared_decimal_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice019Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4B_U06_SLICE019_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG4BU06Slice019SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4BU06Slice019PatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG4BU06Slice019PatternSpecIds(id, mode);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F19PublicSelectorComposition() {
  const errors = [...auditG4BU06Slice019SelectorProjection().errors];
  const ids = listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F19_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4B_U06_SLICE019_SOURCE_ID);
  for (const row of rows) {
    if (!availability?.canonicalReachableKnowledgePointIds.includes(row.knowledgePointId)) errors.push("P03F19_SELECTOR_AVAILABILITY_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedKnowledgePoints: 2, visibleForSource: availability?.visibleCount ?? 0, hiddenForSource: availability?.hiddenPendingCount ?? 0 }),
  });
}
