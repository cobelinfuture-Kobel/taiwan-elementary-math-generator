export * from "./batch-a-selector-p01d2-extension.js";

import * as base from "./batch-a-selector-p01d2-extension.js";
import {
  G5A_U03_SELECTOR_PROJECTION,
  G5A_U03_SOURCE_ID,
  G5A_U03A1_SOURCE_ID,
  auditG5AU03SelectorProjection,
  getG5AU03SelectorRow,
  listG5AU03SelectorPatternGroups,
  listG5AU03SelectorRows,
  resolveG5AU03SelectorPatternSpecIds,
} from "./g5a-u03-factor-multiple-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG5AU03SelectorRows().map((row) => Object.freeze(row)));
const rowById = new Map(rows.map((row) => [row.knowledgePointId, row]));
const rowsBySource = new Map([
  [G5A_U03_SOURCE_ID, Object.freeze(rows.filter((row) => row.sourceId === G5A_U03_SOURCE_ID))],
  [G5A_U03A1_SOURCE_ID, Object.freeze(rows.filter((row) => row.sourceId === G5A_U03A1_SOURCE_ID))],
]);

export { G5A_U03_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + rows.length,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G5A_U03_SOURCE_ID]: Object.freeze({
      sourceId: G5A_U03_SOURCE_ID,
      visibleCount: rowsBySource.get(G5A_U03_SOURCE_ID).length,
      hiddenPendingCount: 0,
      notSelectableCount: 0,
      publicSelectorStatus: "seven_w1_knowledge_points_runtime_visible",
      canonicalReachableKnowledgePointCount: rowsBySource.get(G5A_U03_SOURCE_ID).length,
      canonicalReachableKnowledgePointIds: Object.freeze(rowsBySource.get(G5A_U03_SOURCE_ID).map((row) => row.knowledgePointId)),
      compatibilityProjection: "full_product_w1_shared_pipeline",
      publicDropdownCutoverTask: "P01E_W1PublicUIHTMLPDFPrintCloseout",
    }),
    [G5A_U03A1_SOURCE_ID]: Object.freeze({
      sourceId: G5A_U03A1_SOURCE_ID,
      visibleCount: rowsBySource.get(G5A_U03A1_SOURCE_ID).length,
      hiddenPendingCount: 0,
      notSelectableCount: 0,
      publicSelectorStatus: "five_w1_knowledge_points_runtime_visible",
      canonicalReachableKnowledgePointCount: rowsBySource.get(G5A_U03A1_SOURCE_ID).length,
      canonicalReachableKnowledgePointIds: Object.freeze(rowsBySource.get(G5A_U03A1_SOURCE_ID).map((row) => row.knowledgePointId)),
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
  if (rowById.has(knowledgePointId)) return getG5AU03SelectorRow(knowledgePointId);
  return base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  if (rowById.has(knowledgePointId)) return listG5AU03SelectorPatternGroups(knowledgePointId);
  return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  if (rowById.has(knowledgePointId)) return resolveG5AU03SelectorPatternSpecIds(knowledgePointId);
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function auditP01D3BatchASelectorComposition() {
  const errors = [];
  const projection = auditG5AU03SelectorProjection();
  errors.push(...projection.errors);
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P01D3_SELECTOR_DUPLICATE_KP");
  for (const sourceId of [G5A_U03_SOURCE_ID, G5A_U03A1_SOURCE_ID]) {
    const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
    const expected = sourceId === G5A_U03_SOURCE_ID ? 7 : 5;
    if (!availability || availability.visibleCount !== expected || availability.hiddenPendingCount !== 0 || availability.notSelectableCount !== 0) {
      errors.push(`P01D3_SELECTOR_AVAILABILITY_INVALID:${sourceId}`);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      addedKnowledgePoints: rows.length,
      globalVisibleKnowledgePoints: allRows.length,
      patternGroups: projection.counts.patternGroups,
      patternSpecs: projection.counts.patternSpecs,
      sourceNodes: projection.counts.sourceNodes,
    }),
  });
}
