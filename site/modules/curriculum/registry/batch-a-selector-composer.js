export * from "./batch-a-selector-g4a-u08-extension.js";

import * as base from "./batch-a-selector-g4a-u08-extension.js";
import {
  G5A_U02_SELECTOR_PROJECTION,
  G5A_U02_SELECTOR_SOURCE_ID,
  getG5AU02SelectorRow,
  listG5AU02SelectorPatternGroups,
  listG5AU02SelectorRows,
  resolveG5AU02SelectorPatternSpecIds,
} from "./g5a-u02-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const g5aRows = Object.freeze(listG5AU02SelectorRows().map((row) => Object.freeze(row)));
const g5aRowById = new Map(g5aRows.map((row) => [row.knowledgePointId, row]));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  const current = entries.get(G5A_U02_SELECTOR_SOURCE_ID) ?? {
    sourceId: G5A_U02_SELECTOR_SOURCE_ID,
    visibleCount: 0,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
  };
  entries.set(G5A_U02_SELECTOR_SOURCE_ID, {
    ...current,
    visibleCount: current.visibleCount + g5aRows.length,
  });
  return Object.fromEntries(entries);
}

export { G5A_U02_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + g5aRows.length,
  bySourceId: availabilityBySource(),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...g5aRows.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId];
  return entry ? clone(entry) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return g5aRowById.has(knowledgePointId)
    ? getG5AU02SelectorRow(knowledgePointId)
    : base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  return g5aRowById.has(knowledgePointId)
    ? listG5AU02SelectorPatternGroups(knowledgePointId)
    : base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  return g5aRowById.has(knowledgePointId)
    ? resolveG5AU02SelectorPatternSpecIds(knowledgePointId)
    : base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function auditBatchASelectorComposition() {
  const errors = [];
  const baseRows = base.listVisibleBatchAKnowledgePoints();
  const allRows = listVisibleBatchAKnowledgePoints();
  const g5aIds = new Set(g5aRows.map((row) => row.knowledgePointId));
  if (allRows.length !== baseRows.length + 18) errors.push("SELECTOR_COMPOSER_COUNT_MISMATCH");
  if (new Set(allRows.map((row) => row.knowledgePointId)).size !== allRows.length) errors.push("SELECTOR_COMPOSER_DUPLICATE_KP");
  if (g5aRows.some((row) => row.sourceId !== G5A_U02_SELECTOR_SOURCE_ID)) errors.push("SELECTOR_COMPOSER_G5A_SOURCE_MISMATCH");
  if (baseRows.some((row) => g5aIds.has(row.knowledgePointId))) errors.push("SELECTOR_COMPOSER_CROSS_PROJECTION_COLLISION");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U02_SELECTOR_SOURCE_ID);
  if (availability.visibleCount !== 18 || availability.hiddenPendingCount !== 0 || availability.notSelectableCount !== 0) {
    errors.push("SELECTOR_COMPOSER_G5A_AVAILABILITY_MISMATCH");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
