export * from "./batch-a-selector-p03f3-extension.js";

import * as base from "./batch-a-selector-p03f3-extension.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTH_DECIMAL_SELECTOR_PROJECTION,
  auditG3BU09TenthDecimalSelectorProjection,
  getG3BU09TenthDecimalSelectorRow,
  listG3BU09TenthDecimalPatternGroups,
  listG3BU09TenthDecimalSelectorRows,
  resolveG3BU09TenthDecimalPatternSpecIds,
} from "./g3b-u09-tenth-decimal-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3BU09TenthDecimalSelectorRows().map((row) => Object.freeze(row)));

export { G3B_U09_TENTH_DECIMAL_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 22,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3B_U09_SOURCE_ID]: Object.freeze({
      sourceId: G3B_U09_SOURCE_ID,
      visibleCount: 1,
      hiddenPendingCount: 6,
      notSelectableCount: 0,
      publicSelectorStatus: "slice004_one_w3_knowledge_point_d0_visible",
      canonicalReachableKnowledgePointCount: 1,
      canonicalReachableKnowledgePointIds: Object.freeze(["kp_g3b_u09_tenth_representation"]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice004Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  if (sourceId === G3B_U09_SOURCE_ID) return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]);
  return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return getG3BU09TenthDecimalSelectorRow(knowledgePointId) ?? base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const groups = listG3BU09TenthDecimalPatternGroups(knowledgePointId);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const ids = resolveG3BU09TenthDecimalPatternSpecIds(knowledgePointId);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function auditP03F4PublicSelectorComposition() {
  const errors = [];
  const projection = auditG3BU09TenthDecimalSelectorProjection();
  errors.push(...projection.errors);
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F4_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  if (!availability || availability.visibleCount !== 1 || availability.hiddenPendingCount !== 6) errors.push("P03F4_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G3B_U09_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 1 || groups.length !== 1 || specs.length !== 1) errors.push("P03F4_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedKnowledgePoints: 1, currentSourceKnowledgePoints: 1, currentSourcePatternGroups: 1, currentSourcePatternSpecs: 1, publicSources: 22 }),
  });
}
