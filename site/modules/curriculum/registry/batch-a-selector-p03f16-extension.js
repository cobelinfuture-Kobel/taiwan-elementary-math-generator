export * from "./batch-a-selector-p03f15-extension.js";
import * as base from "./batch-a-selector-p03f15-extension.js";
import {
  G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
  G3B_U09_DECIMAL_ADD_SUB_KP_ID,
  G3B_U09_DECIMAL_COMPARE_KP_ID,
  G3B_U09_DECIMAL_ARITHMETIC_SELECTOR_PROJECTION,
  auditG3BU09DecimalArithmeticSelectorProjection,
  getG3BU09DecimalArithmeticSelectorRow,
  listG3BU09DecimalArithmeticPatternGroups,
  listG3BU09DecimalArithmeticSelectorRows,
  resolveG3BU09DecimalArithmeticPatternSpecIds,
} from "./g3b-u09-decimal-add-sub-compare-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3BU09DecimalArithmeticSelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID);

export { G3B_U09_DECIMAL_ARITHMETIC_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 2,
  publicSourceCount: base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID]: Object.freeze({
      ...(prior ?? {}),
      sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
      visibleCount: (prior?.visibleCount ?? 4) + 2,
      hiddenPendingCount: Math.max(0, (prior?.hiddenPendingCount ?? 3) - 2),
      notSelectableCount: 0,
      publicSelectorStatus: "slice016_decimal_add_sub_compare_added_to_existing_w3_source",
      canonicalReachableKnowledgePointCount: (prior?.canonicalReachableKnowledgePointCount ?? 4) + 2,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...(prior?.canonicalReachableKnowledgePointIds ?? []),
        G3B_U09_DECIMAL_ADD_SUB_KP_ID,
        G3B_U09_DECIMAL_COMPARE_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_decimal_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice016Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG3BU09DecimalArithmeticSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG3BU09DecimalArithmeticPatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG3BU09DecimalArithmeticPatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F16PublicSelectorComposition() {
  const errors = [...auditG3BU09DecimalArithmeticSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F16_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID);
  if (!availability || availability.visibleCount !== 6 || availability.hiddenPendingCount !== 1) errors.push("P03F16_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID);
  if (sourceRows.length !== 6) errors.push("P03F16_EXISTING_SOURCE_KP_COUNT_INVALID");
  const newGroups = [
    ...getVisiblePatternGroupsForKnowledgePoint(G3B_U09_DECIMAL_ADD_SUB_KP_ID),
    ...getVisiblePatternGroupsForKnowledgePoint(G3B_U09_DECIMAL_COMPARE_KP_ID),
  ];
  if (newGroups.length !== 2 || new Set(newGroups.flatMap((group) => group.patternSpecIds)).size !== 3) errors.push("P03F16_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedSources: 0, addedKnowledgePoints: 2, currentSourceKnowledgePoints: sourceRows.length, addedPatternGroups: 2, addedPatternSpecs: 3, publicSources: BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount }) });
}
