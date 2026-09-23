export * from "./batch-a-selector-p03f8-extension.js";
import * as base from "./batch-a-selector-p03f8-extension.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_SELECTOR_PROJECTION,
  auditG3BU09TenthsFractionDecimalSelectorProjection,
  getG3BU09TenthsFractionDecimalSelectorRow,
  listG3BU09TenthsFractionDecimalPatternGroups,
  listG3BU09TenthsFractionDecimalSelectorRows,
  resolveG3BU09TenthsFractionDecimalPatternSpecIds,
} from "./g3b-u09-tenths-fraction-decimal-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3BU09TenthsFractionDecimalSelectorRows().map((row) => Object.freeze(row)));
const baseG3BU09 = base.listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);

export { G3B_U09_TENTHS_FRACTION_DECIMAL_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 23,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3B_U09_SOURCE_ID]: Object.freeze({
      ...(baseG3BU09 ?? {}),
      sourceId: G3B_U09_SOURCE_ID,
      visibleCount: 4,
      hiddenPendingCount: 3,
      notSelectableCount: 0,
      publicSelectorStatus: "slice009_four_w3_knowledge_points_d0_visible",
      canonicalReachableKnowledgePointCount: 4,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...(baseG3BU09?.canonicalReachableKnowledgePointIds ?? []),
        G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice009Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G3B_U09_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) {
  return getG3BU09TenthsFractionDecimalSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG3BU09TenthsFractionDecimalPatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) {
  const ids = resolveG3BU09TenthsFractionDecimalPatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id);
}

export function auditP03F9PublicSelectorComposition() {
  const errors = [...auditG3BU09TenthsFractionDecimalSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F9_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  if (!availability || availability.visibleCount !== 4 || availability.hiddenPendingCount !== 3) errors.push("P03F9_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G3B_U09_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 4 || groups.length !== 4 || specs.length !== 4) errors.push("P03F9_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedKnowledgePoints: 1, currentSourceKnowledgePoints: 4, currentSourcePatternGroups: 4, currentSourcePatternSpecs: 4, publicSources: 23 }),
  });
}
