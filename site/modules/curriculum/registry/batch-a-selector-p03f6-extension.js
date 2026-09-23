
export * from "./batch-a-selector-p03f5-extension.js";

import * as base from "./batch-a-selector-p03f5-extension.js";
import { G3A_U08_SOURCE_ID } from "./g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3A_U08_SAME_DENOMINATOR_SELECTOR_PROJECTION,
  auditG3AU08SameDenominatorSelectorProjection,
  getG3AU08SameDenominatorSelectorRow,
  listG3AU08SameDenominatorPatternGroups,
  listG3AU08SameDenominatorSelectorRows,
  resolveG3AU08SameDenominatorPatternSpecIds,
} from "./g3a-u08-same-denominator-compare-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3AU08SameDenominatorSelectorRows().map((row) => Object.freeze(row)));
const baseG3A = base.listBatchAKnowledgePointAvailabilityBySource(G3A_U08_SOURCE_ID);

export { G3A_U08_SAME_DENOMINATOR_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  publicSourceCount: 23,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3A_U08_SOURCE_ID]: Object.freeze({
      ...(baseG3A ?? {}), sourceId: G3A_U08_SOURCE_ID,
      visibleCount: 4, hiddenPendingCount: 3, notSelectableCount: 0,
      publicSelectorStatus: "slice006_four_w3_knowledge_points_d0_visible",
      canonicalReachableKnowledgePointCount: 4,
      canonicalReachableKnowledgePointIds: Object.freeze([
        "kp_g3a_u08_part_whole_fraction",
        "kp_g3a_u08_unit_fraction_accumulation",
        "kp_g3a_u08_discrete_set_fraction",
        G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice006Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  if (sourceId === G3A_U08_SOURCE_ID) return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]);
  return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG3AU08SameDenominatorSelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG3AU08SameDenominatorPatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) {
  const ids = resolveG3AU08SameDenominatorPatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id);
}
export function auditP03F6PublicSelectorComposition() {
  const errors = [...auditG3AU08SameDenominatorSelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F6_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3A_U08_SOURCE_ID);
  if (!availability || availability.visibleCount !== 4 || availability.hiddenPendingCount !== 3) errors.push("P03F6_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G3A_U08_SOURCE_ID);
  const addedGroups = getVisiblePatternGroupsForKnowledgePoint(G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID);
  if (sourceRows.length !== 4 || addedGroups.length !== 2 || new Set(addedGroups.flatMap((row) => row.patternSpecIds)).size !== 2) errors.push("P03F6_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedKnowledgePoints: 1, currentSourceKnowledgePoints: 4, addedPatternGroups: 2, addedPatternSpecs: 2, publicSources: 23 }) });
}
