export * from "./batch-a-selector-p03f31-extension.js";
import * as base from "./batch-a-selector-p03f31-extension.js";
import {
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SELECTOR_PROJECTION,
  G6B_U01_P03F32_SOURCE_ID,
  P03F32_HIDDEN_SIBLING_KP_IDS,
  auditG6BU01P03F32SelectorProjection,
  getG6BU01P03F32SelectorRow,
  listG6BU01P03F32PatternGroups,
  listG6BU01P03F32SelectorRows,
  resolveG6BU01P03F32PatternSpecIds,
} from "./g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG6BU01P03F32SelectorRows().map((row) => Object.freeze(row)));
const baseSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;

export { G6B_U01_P03F32_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount:base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  sourceCount:baseSourceCount + 1,
  publicSourceCount:baseSourceCount + 1,
  bySourceId:Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G6B_U01_P03F32_SOURCE_ID]:Object.freeze({
      sourceId:G6B_U01_P03F32_SOURCE_ID,
      visibleCount:1,
      hiddenPendingCount:4,
      notSelectableCount:4,
      publicSelectorStatus:"slice032_rank8_mixed_domain_conversion_new_public_source",
      canonicalReachableKnowledgePointCount:5,
      canonicalReachableKnowledgePointIds:Object.freeze([G6B_U01_P03F32_KP_ID, ...P03F32_HIDDEN_SIBLING_KP_IDS]),
      visibleKnowledgePointIds:Object.freeze([G6B_U01_P03F32_KP_ID]),
      hiddenPendingKnowledgePointIds:P03F32_HIDDEN_SIBLING_KP_IDS,
      compatibilityProjection:"full_product_w3_shared_mixed_domain_normalization_pipeline",
      publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice032Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return sourceId === G6B_U01_P03F32_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id) { return getG6BU01P03F32SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) { const groups = listG6BU01P03F32PatternGroups(id); return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) { const ids = resolveG6BU01P03F32PatternSpecIds(id); return ids.length && (mode == null || mode === "numeric") ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode); }

export function auditP03F32PublicSelectorComposition() {
  const errors = [...auditG6BU01P03F32SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F32_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G6B_U01_P03F32_SOURCE_ID);
  if (!availability || availability.visibleCount !== 1 || availability.hiddenPendingCount !== 4 || availability.notSelectableCount !== 4) errors.push("P03F32_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G6B_U01_P03F32_SOURCE_ID);
  if (sourceRows.length !== 1) errors.push("P03F32_NEW_SOURCE_VISIBLE_KP_COUNT_INVALID");
  if (P03F32_HIDDEN_SIBLING_KP_IDS.some((id) => ids.includes(id))) errors.push("P03F32_HIDDEN_SIBLING_LEAK");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== baseSourceCount + 1 || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== baseSourceCount + 1) errors.push("P03F32_PUBLIC_SOURCE_COUNT_INVALID");
  const groups = getVisiblePatternGroupsForKnowledgePoint(G6B_U01_P03F32_KP_ID);
  if (groups.length !== 1 || groups[0].patternSpecIds.length !== 2) errors.push("P03F32_PATTERN_SURFACE_INVALID");
  return Object.freeze({ ok:errors.length===0, errors:Object.freeze(errors), counts:Object.freeze({ addedSources:1, addedKnowledgePoints:1, hiddenSiblings:4, currentSourceKnowledgePoints:sourceRows.length, addedPatternGroups:1, addedPatternSpecs:2, publicSources:baseSourceCount+1 }) });
}
