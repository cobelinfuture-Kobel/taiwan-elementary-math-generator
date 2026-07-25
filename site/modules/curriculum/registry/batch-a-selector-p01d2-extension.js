export * from "./batch-a-selector-p01d1-extension.js";

import * as base from "./batch-a-selector-p01d1-extension.js";
import {
  G6A_U01_SELECTOR_PROJECTION,
  G6A_U01_SOURCE_ID,
  auditG6AU01SelectorProjection,
  getG6AU01SelectorRow,
  listG6AU01SelectorPatternGroups,
  listG6AU01SelectorRows,
  resolveG6AU01SelectorPatternSpecIds,
} from "./g6a-u01-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG6AU01SelectorRows().map((row) => Object.freeze(row)));
const rowById = new Map(rows.map((row) => [row.knowledgePointId, row]));

export { G6A_U01_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + rows.length,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G6A_U01_SOURCE_ID]: Object.freeze({
      sourceId: G6A_U01_SOURCE_ID,
      visibleCount: rows.length,
      hiddenPendingCount: 0,
      notSelectableCount: 0,
      publicSelectorStatus: "five_w1_knowledge_points_runtime_visible",
      canonicalReachableKnowledgePointCount: rows.length,
      canonicalReachableKnowledgePointIds: Object.freeze(rows.map((row) => row.knowledgePointId)),
      compatibilityProjection: "full_product_w1_shared_pipeline",
      publicDropdownCutoverTask: "P01E_W1PublicUIHTMLPDFPrintCloseout",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId];
  return entry ? clone(entry) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  if (rowById.has(knowledgePointId)) return getG6AU01SelectorRow(knowledgePointId);
  return base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  if (rowById.has(knowledgePointId)) return listG6AU01SelectorPatternGroups(knowledgePointId);
  return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  if (rowById.has(knowledgePointId)) return resolveG6AU01SelectorPatternSpecIds(knowledgePointId);
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function auditP01D2BatchASelectorComposition() {
  const errors = [];
  const projection = auditG6AU01SelectorProjection();
  errors.push(...projection.errors);
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P01D2_SELECTOR_DUPLICATE_KP");
  if (rows.some((row) => row.sourceId !== G6A_U01_SOURCE_ID)) errors.push("P01D2_SELECTOR_SOURCE_MISMATCH");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G6A_U01_SOURCE_ID);
  if (!availability || availability.visibleCount !== 5 || availability.hiddenPendingCount !== 0 || availability.notSelectableCount !== 0) {
    errors.push("P01D2_SELECTOR_AVAILABILITY_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      addedKnowledgePoints: rows.length,
      globalVisibleKnowledgePoints: allRows.length,
      patternGroups: projection.counts.patternGroups,
      patternSpecs: projection.counts.patternSpecs,
    }),
  });
}
