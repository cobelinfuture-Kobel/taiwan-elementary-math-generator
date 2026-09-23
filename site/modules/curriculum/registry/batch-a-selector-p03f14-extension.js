export * from "./batch-a-selector-p03f13-extension.js";
import * as base from "./batch-a-selector-p03f13-extension.js";
import {
  G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  G5B_U05_DECIMAL_BASE10_KP_ID,
  G5B_U05_DECIMAL_BASE10_SELECTOR_PROJECTION,
  auditG5BU05DecimalBase10SelectorProjection,
  getG5BU05DecimalBase10SelectorRow,
  listG5BU05DecimalBase10PatternGroups,
  listG5BU05DecimalBase10SelectorRows,
  resolveG5BU05DecimalBase10PatternSpecIds,
} from "./g5b-u05-decimal-base10-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG5BU05DecimalBase10SelectorRows().map((row) => Object.freeze(row)));

export { G5B_U05_DECIMAL_BASE10_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;

const priorSourceAvailability = base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G5B_U05_DECIMAL_BASE10_SOURCE_ID];
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G5B_U05_DECIMAL_BASE10_SOURCE_ID]: Object.freeze({
      ...(priorSourceAvailability ?? {}),
      sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
      visibleCount: (priorSourceAvailability?.visibleCount ?? 4) + 1,
      hiddenPendingCount: Math.max(0, (priorSourceAvailability?.hiddenPendingCount ?? 1) - 1),
      notSelectableCount: 0,
      publicSelectorStatus: "slice014_decimal_base10_kp_added_to_existing_w1_source",
      canonicalReachableKnowledgePointCount: (priorSourceAvailability?.canonicalReachableKnowledgePointCount ?? 4) + 1,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...(priorSourceAvailability?.canonicalReachableKnowledgePointIds ?? []),
        G5B_U05_DECIMAL_BASE10_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_decimal_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice014Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG5BU05DecimalBase10SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG5BU05DecimalBase10PatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG5BU05DecimalBase10PatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F14PublicSelectorComposition() {
  const errors = [...auditG5BU05DecimalBase10SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F14_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5B_U05_DECIMAL_BASE10_SOURCE_ID);
  if (!availability || availability.visibleCount !== 5 || availability.hiddenPendingCount !== 0) errors.push("P03F14_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID);
  if (sourceRows.length !== 5) errors.push("P03F14_EXISTING_SOURCE_KP_COUNT_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedSources: 0, addedKnowledgePoints: 1, currentSourceKnowledgePoints: sourceRows.length, publicSources: BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount }),
  });
}
