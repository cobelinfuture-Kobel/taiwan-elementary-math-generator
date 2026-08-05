export * from "./batch-a-selector-p03f24-extension.js";
import * as base from "./batch-a-selector-p03f24-extension.js";
import { G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID } from "./g4a-u06-fraction-type-classification-selector-projection.js";
import {
  G4A_U06_P03F25_KP_ID,
  G4A_U06_P03F25_SELECTOR_PROJECTION,
  auditG4AU06P03F25SelectorProjection,
  getG4AU06P03F25SelectorRow,
  listG4AU06P03F25PatternGroups,
  listG4AU06P03F25SelectorRows,
  resolveG4AU06P03F25PatternSpecIds,
} from "./g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4AU06P03F25SelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID);
const currentSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;

export { G4A_U06_P03F25_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  sourceCount: currentSourceCount,
  publicSourceCount: currentSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID]: Object.freeze({
      ...(prior ?? {}),
      sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
      visibleCount: (prior?.visibleCount ?? 1) + 1,
      hiddenPendingCount: Math.max(0, (prior?.hiddenPendingCount ?? 5) - 1),
      notSelectableCount: 0,
      publicSelectorStatus: "slice025_improper_mixed_integer_conversion_added_to_existing_w3_source",
      canonicalReachableKnowledgePointCount: (prior?.canonicalReachableKnowledgePointCount ?? 1) + 1,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...(prior?.canonicalReachableKnowledgePointIds ?? []),
        G4A_U06_P03F25_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_fraction_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice025Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) { return getG4AU06P03F25SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const groups = listG4AU06P03F25PatternGroups(id);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode = null) {
  const ids = resolveG4AU06P03F25PatternSpecIds(id);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id, mode);
}

export function auditP03F25PublicSelectorComposition() {
  const errors = [...auditG4AU06P03F25SelectorProjection().errors];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F25_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID);
  if (!availability || availability.visibleCount !== 2 || availability.hiddenPendingCount !== 4) errors.push("P03F25_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID);
  if (sourceRows.length !== 2) errors.push("P03F25_EXISTING_SOURCE_KP_COUNT_INVALID");
  if (BATCH_A_SELECTOR_AVAILABILITY.sourceCount !== currentSourceCount || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount !== currentSourceCount) errors.push("P03F25_PUBLIC_SOURCE_COUNT_CHANGED");
  const groups = getVisiblePatternGroupsForKnowledgePoint(G4A_U06_P03F25_KP_ID);
  if (groups.length !== 1 || new Set(groups.flatMap((group) => group.patternSpecIds)).size !== 3) errors.push("P03F25_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ addedSources: 0, addedKnowledgePoints: 1, currentSourceKnowledgePoints: sourceRows.length, addedPatternGroups: 1, addedPatternSpecs: 3, publicSources: currentSourceCount }) });
}
