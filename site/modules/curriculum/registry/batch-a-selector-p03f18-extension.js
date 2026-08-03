export * from "./batch-a-selector-p03f17-extension.js";
import * as base from "./batch-a-selector-p03f17-extension.js";
import {
  G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  G4A_U09_DECIMAL_COMPOSE_KP_ID,
  G4A_U09_DECIMAL_COMPOSE_SELECTOR_PROJECTION,
  auditG4AU09DecimalComposeSelectorProjection,
  getG4AU09DecimalComposeSelectorRow,
  listG4AU09DecimalComposePatternGroups,
  listG4AU09DecimalComposeSelectorRows,
  resolveG4AU09DecimalComposePatternSpecIds,
} from "./g4a-u09-decimal-compose-decompose-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4AU09DecimalComposeSelectorRows().map((row) => Object.freeze(row)));

export { G4A_U09_DECIMAL_COMPOSE_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
const prior = base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G4A_U09_DECIMAL_COMPOSE_SOURCE_ID];
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4A_U09_DECIMAL_COMPOSE_SOURCE_ID]: Object.freeze({
      ...prior,
      sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
      visibleCount: (prior?.visibleCount ?? 0) + 1,
      hiddenPendingCount: Math.max(0, (prior?.hiddenPendingCount ?? 7) - 1),
      publicSelectorStatus: "slice018_decimal_compose_decompose_successor",
      canonicalReachableKnowledgePointCount: (prior?.canonicalReachableKnowledgePointCount ?? 1) + 1,
      canonicalReachableKnowledgePointIds: Object.freeze([...(prior?.canonicalReachableKnowledgePointIds ?? []), G4A_U09_DECIMAL_COMPOSE_KP_ID]),
      compatibilityProjection: "full_product_w3_shared_decimal_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice018Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4A_U09_DECIMAL_COMPOSE_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG4AU09DecimalComposeSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4AU09DecimalComposePatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG4AU09DecimalComposePatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F18PublicSelectorComposition() {
  const errors = [...auditG4AU09DecimalComposeSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F18_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U09_DECIMAL_COMPOSE_SOURCE_ID);
  if (!availability || !availability.canonicalReachableKnowledgePointIds.includes(G4A_U09_DECIMAL_COMPOSE_KP_ID)) errors.push("P03F18_SELECTOR_AVAILABILITY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), addedKnowledgePoints: 1, publicSources: BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount });
}
