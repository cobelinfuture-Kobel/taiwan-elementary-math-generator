export * from "./batch-a-selector-composer.js";
export { G3A_U01_GOLDEN_SELECTOR_PROJECTION } from "./g3a-u01-golden-selector-projection.js";

import * as base from "./batch-a-selector-composer.js";
import {
  G3A_U01_GOLDEN_SELECTOR_PROJECTION,
  G3A_U01_GOLDEN_SOURCE_ID,
  auditG3AU01GoldenSelectorProjection,
  getG3AU01GoldenSelectorRow,
  listG3AU01GoldenPatternGroups,
  listG3AU01GoldenSelectorRows,
} from "./g3a-u01-golden-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const G3A_ROWS = Object.freeze(listG3AU01GoldenSelectorRows().map((row) => Object.freeze(row)));
const G3A_IDS = new Set(G3A_ROWS.map((row) => row.knowledgePointId));
const BASE_ROWS = Object.freeze(base.listVisibleBatchAKnowledgePoints().map((row) => Object.freeze(row)));
const BASE_WITHOUT_G3A = Object.freeze(BASE_ROWS.filter((row) => row.sourceId !== G3A_U01_GOLDEN_SOURCE_ID));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  const current = entries.get(G3A_U01_GOLDEN_SOURCE_ID) ?? {
    sourceId: G3A_U01_GOLDEN_SOURCE_ID,
    visibleCount: 0,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
  };
  entries.set(G3A_U01_GOLDEN_SOURCE_ID, {
    ...current,
    visibleCount: G3A_U01_GOLDEN_SELECTOR_PROJECTION.knowledgePointCount,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
    goldenConformanceStatus: "GOLDEN_CONFORMANT",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    canonicalReachableKnowledgePointCount: G3A_U01_GOLDEN_SELECTOR_PROJECTION.knowledgePointCount,
    canonicalReachablePatternGroupCount: G3A_U01_GOLDEN_SELECTOR_PROJECTION.patternGroupCount,
    canonicalReachablePatternSpecCount: G3A_U01_GOLDEN_SELECTOR_PROJECTION.patternSpecCount,
    publicSelectorStatus: "12_source_backed_knowledge_points_visible",
  });
  return Object.fromEntries(entries);
}

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount
    - BASE_ROWS.filter((row) => row.sourceId === G3A_U01_GOLDEN_SOURCE_ID).length
    + G3A_ROWS.length,
  bySourceId: availabilityBySource(),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...BASE_WITHOUT_G3A.map(clone), ...G3A_ROWS.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId];
  return entry ? clone(entry) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  if (G3A_IDS.has(knowledgePointId)) return getG3AU01GoldenSelectorRow(knowledgePointId);
  return base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  if (G3A_IDS.has(knowledgePointId)) return listG3AU01GoldenPatternGroups(knowledgePointId);
  return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function auditBatchASelectorPostGA01() {
  const upstream = base.auditBatchASelectorComposition();
  const g3a = auditG3AU01GoldenSelectorProjection();
  const allRows = listVisibleBatchAKnowledgePoints();
  const g3aRows = allRows.filter((row) => row.sourceId === G3A_U01_GOLDEN_SOURCE_ID);
  const errors = [...upstream.errors, ...g3a.errors];
  if (g3aRows.length !== 12) errors.push("POSTG_A01_G3A_U01_SELECTOR_COUNT_MISMATCH");
  if (new Set(allRows.map((row) => row.knowledgePointId)).size !== allRows.length) {
    errors.push("POSTG_A01_SELECTOR_DUPLICATE_KP");
  }
  if (g3aRows.some((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).length !== 1)) {
    errors.push("POSTG_A01_G3A_U01_GROUP_CARDINALITY_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      globalKnowledgePoints: allRows.length,
      g3aU01KnowledgePoints: g3aRows.length,
      g3aU01PatternGroups: G3A_U01_GOLDEN_SELECTOR_PROJECTION.patternGroupCount,
      g3aU01PatternSpecs: G3A_U01_GOLDEN_SELECTOR_PROJECTION.patternSpecCount,
    }),
  });
}
