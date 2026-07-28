export * from "./batch-a-selector-p03f7-extension.js";
import * as base from "./batch-a-selector-p03f7-extension.js";
import { G3B_U09_SOURCE_ID, G3B_U09_TENTH_DECIMAL_KP_ID } from "./g3b-u09-tenth-decimal-selector-projection.js";
import {
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_SELECTOR_PROJECTION,
  auditG3BU09DecimalComposeDecomposeSelectorProjection,
  getG3BU09DecimalComposeDecomposeSelectorRow,
  listG3BU09DecimalComposeDecomposePatternGroups,
  listG3BU09DecimalComposeDecomposeSelectorRows,
  resolveG3BU09DecimalComposeDecomposePatternSpecIds,
} from "./g3b-u09-decimal-compose-decompose-selector-projection.js";
import {
  G3B_U09_DECIMAL_READ_WRITE_KP_ID,
  G3B_U09_DECIMAL_READ_WRITE_SELECTOR_PROJECTION,
  auditG3BU09DecimalReadWriteSelectorProjection,
  getG3BU09DecimalReadWriteSelectorRow,
  listG3BU09DecimalReadWritePatternGroups,
  listG3BU09DecimalReadWriteSelectorRows,
  resolveG3BU09DecimalReadWritePatternSpecIds,
} from "./g3b-u09-decimal-read-write-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze([
  ...listG3BU09DecimalReadWriteSelectorRows(),
  ...listG3BU09DecimalComposeDecomposeSelectorRows(),
].map((row) => Object.freeze(row)));
const baseG3BU09 = base.listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);

export {
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_SELECTOR_PROJECTION,
  G3B_U09_DECIMAL_READ_WRITE_SELECTOR_PROJECTION,
};
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 2,
  publicSourceCount: 23,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3B_U09_SOURCE_ID]: Object.freeze({
      ...(baseG3BU09 ?? {}),
      sourceId: G3B_U09_SOURCE_ID,
      visibleCount: 3,
      hiddenPendingCount: 4,
      notSelectableCount: 0,
      publicSelectorStatus: "slice008_three_w3_knowledge_points_d0_visible",
      canonicalReachableKnowledgePointCount: 3,
      canonicalReachableKnowledgePointIds: Object.freeze([
        G3B_U09_TENTH_DECIMAL_KP_ID,
        G3B_U09_DECIMAL_READ_WRITE_KP_ID,
        G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
      ]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice008Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return sourceId === G3B_U09_SOURCE_ID
    ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId])
    : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id) {
  return getG3BU09DecimalReadWriteSelectorRow(id)
    ?? getG3BU09DecimalComposeDecomposeSelectorRow(id)
    ?? base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id) {
  const readWriteGroups = listG3BU09DecimalReadWritePatternGroups(id);
  if (readWriteGroups.length) return readWriteGroups;
  const composeGroups = listG3BU09DecimalComposeDecomposePatternGroups(id);
  return composeGroups.length ? composeGroups : base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) {
  const readWriteIds = resolveG3BU09DecimalReadWritePatternSpecIds(id);
  if (readWriteIds.length) return readWriteIds;
  const composeIds = resolveG3BU09DecimalComposeDecomposePatternSpecIds(id);
  return composeIds.length ? composeIds : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id);
}

export function auditP03F8PublicSelectorComposition() {
  const errors = [
    ...auditG3BU09DecimalReadWriteSelectorProjection().errors,
    ...auditG3BU09DecimalComposeDecomposeSelectorProjection().errors,
  ];
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F8_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  if (!availability || availability.visibleCount !== 3 || availability.hiddenPendingCount !== 4) errors.push("P03F8_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G3B_U09_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 3 || groups.length !== 3 || specs.length !== 3) errors.push("P03F8_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedKnowledgePoints: 2, currentSourceKnowledgePoints: 3, currentSourcePatternGroups: 3, currentSourcePatternSpecs: 3, publicSources: 23 }),
  });
}
