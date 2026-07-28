export * from "./batch-a-selector-p03f6-extension.js";
import * as base from "./batch-a-selector-p03f6-extension.js";
import { G3B_U07_SOURCE_ID, G3B_U07_QUOTIENT_FRACTION_KP_ID } from "./g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_SELECTOR_PROJECTION,
  auditG3BU07FractionUnitConversionSelectorProjection, getG3BU07FractionUnitConversionSelectorRow,
  listG3BU07FractionUnitConversionPatternGroups, listG3BU07FractionUnitConversionSelectorRows,
  resolveG3BU07FractionUnitConversionPatternSpecIds,
} from "./g3b-u07-fraction-unit-conversion-selector-projection.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3BU07FractionUnitConversionSelectorRows().map((row) => Object.freeze(row)));
const baseG3B = base.listBatchAKnowledgePointAvailabilityBySource(G3B_U07_SOURCE_ID);
export { G3B_U07_FRACTION_UNIT_CONVERSION_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 23,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3B_U07_SOURCE_ID]: Object.freeze({
      ...(baseG3B ?? {}), sourceId: G3B_U07_SOURCE_ID, visibleCount: 2, hiddenPendingCount: 6, notSelectableCount: 0,
      publicSelectorStatus: "slice007_two_w3_knowledge_points_d0_visible", canonicalReachableKnowledgePointCount: 2,
      canonicalReachableKnowledgePointIds: Object.freeze([G3B_U07_QUOTIENT_FRACTION_KP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID]),
      compatibilityProjection: "full_product_w3_shared_pipeline", publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice007Implementation",
    }),
  }),
});
export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return sourceId === G3B_U07_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id) { return getG3BU07FractionUnitConversionSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) { const groups = listG3BU07FractionUnitConversionPatternGroups(id); return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) { const ids = resolveG3BU07FractionUnitConversionPatternSpecIds(id); return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id); }
export function auditP03F7PublicSelectorComposition() {
  const errors = [...auditG3BU07FractionUnitConversionSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints(); const ids = allRows.map((r) => r.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F7_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U07_SOURCE_ID);
  if (!availability || availability.visibleCount !== 2 || availability.hiddenPendingCount !== 6) errors.push("P03F7_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((r) => r.sourceId === G3B_U07_SOURCE_ID);
  const groups = getVisiblePatternGroupsForKnowledgePoint(G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID);
  if (sourceRows.length !== 2 || groups.length !== 2 || new Set(groups.flatMap((g) => g.patternSpecIds)).size !== 4) errors.push("P03F7_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedKnowledgePoints: 1, currentSourceKnowledgePoints: 2, addedPatternGroups: 2, addedPatternSpecs: 4, publicSources: 23 }) });
}
