export * from "./batch-a-selector-p03f14-extension.js";
import * as base from "./batch-a-selector-p03f14-extension.js";
import {
  G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
  G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3B_U07_SAME_DENOMINATOR_SELECTOR_PROJECTION,
  auditG3BU07SameDenominatorSelectorProjection,
  getG3BU07SameDenominatorSelectorRow,
  listG3BU07SameDenominatorPatternGroups,
  listG3BU07SameDenominatorSelectorRows,
  resolveG3BU07SameDenominatorPatternSpecIds,
} from "./g3b-u07-same-denominator-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3BU07SameDenominatorSelectorRows().map((row) => Object.freeze(row)));
const priorSourceAvailability = base.listBatchAKnowledgePointAvailabilityBySource(G3B_U07_SAME_DENOMINATOR_SOURCE_ID);

export { G3B_U07_SAME_DENOMINATOR_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 2,
  publicSourceCount: base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3B_U07_SAME_DENOMINATOR_SOURCE_ID]: Object.freeze({
      ...(priorSourceAvailability ?? {}),
      sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
      visibleCount: (priorSourceAvailability?.visibleCount ?? 2) + 2,
      hiddenPendingCount: Math.max(0, (priorSourceAvailability?.hiddenPendingCount ?? 6) - 2),
      notSelectableCount: 0,
      publicSelectorStatus: "slice015_same_denominator_kps_added_to_existing_w3_source",
      canonicalReachableKnowledgePointCount: (priorSourceAvailability?.canonicalReachableKnowledgePointCount ?? 2) + 2,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...(priorSourceAvailability?.canonicalReachableKnowledgePointIds ?? []),
        G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
        G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_fraction_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice015Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)];
}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G3B_U07_SAME_DENOMINATOR_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) {
  return getG3BU07SameDenominatorSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG3BU07SameDenominatorPatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG3BU07SameDenominatorPatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F15PublicSelectorComposition() {
  const errors = [...auditG3BU07SameDenominatorSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F15_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U07_SAME_DENOMINATOR_SOURCE_ID);
  if (!availability || availability.visibleCount !== 4 || availability.hiddenPendingCount !== 4) errors.push("P03F15_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G3B_U07_SAME_DENOMINATOR_SOURCE_ID);
  if (sourceRows.length !== 4) errors.push("P03F15_EXISTING_SOURCE_KP_COUNT_INVALID");
  const newGroups = [
    ...getVisiblePatternGroupsForKnowledgePoint(G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID),
    ...getVisiblePatternGroupsForKnowledgePoint(G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID),
  ];
  if (newGroups.length !== 2 || new Set(newGroups.flatMap((group) => group.patternSpecIds)).size !== 4) errors.push("P03F15_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      addedSources: 0,
      addedKnowledgePoints: 2,
      currentSourceKnowledgePoints: sourceRows.length,
      addedPatternGroups: 2,
      addedPatternSpecs: 4,
      publicSources: BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,
    }),
  });
}
