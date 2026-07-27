export * from "./batch-a-selector-p03f-extension.js";

import * as base from "./batch-a-selector-p03f-extension.js";
import { G3A_U08_SOURCE_ID } from "./g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_SLICE002_SELECTOR_PROJECTION,
  auditG3AU08Slice002SelectorProjection,
  getG3AU08Slice002SelectorRow,
  listG3AU08Slice002PatternGroups,
  listG3AU08Slice002SelectorRows,
  resolveG3AU08Slice002PatternSpecIds,
} from "./g3a-u08-slice002-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG3AU08Slice002SelectorRows().map((row) => Object.freeze(row)));

export { G3A_U08_SLICE002_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 2,
  publicSourceCount: 20,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G3A_U08_SOURCE_ID]: Object.freeze({
      sourceId: G3A_U08_SOURCE_ID,
      visibleCount: 3,
      hiddenPendingCount: 4,
      notSelectableCount: 0,
      publicSelectorStatus: "slice002_three_w3_knowledge_points_d0_visible",
      canonicalReachableKnowledgePointCount: 3,
      canonicalReachableKnowledgePointIds: Object.freeze([
        "kp_g3a_u08_part_whole_fraction",
        "kp_g3a_u08_discrete_set_fraction",
        "kp_g3a_u08_unit_fraction_accumulation",
      ]),
      compatibilityProjection: "full_product_w3_shared_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice002Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints() { return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  if (sourceId === G3A_U08_SOURCE_ID) return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]);
  return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return getG3AU08Slice002SelectorRow(knowledgePointId) ?? base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const groups = listG3AU08Slice002PatternGroups(knowledgePointId);
  return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const ids = resolveG3AU08Slice002PatternSpecIds(knowledgePointId);
  return ids.length ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function auditP03F2PublicSelectorComposition() {
  const errors = [];
  const projection = auditG3AU08Slice002SelectorProjection();
  errors.push(...projection.errors);
  const allRows = listVisibleBatchAKnowledgePoints();
  const ids = allRows.map((row) => row.knowledgePointId);
  if (new Set(ids).size !== ids.length) errors.push("P03F2_SELECTOR_DUPLICATE_KP");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3A_U08_SOURCE_ID);
  if (!availability || availability.visibleCount !== 3 || availability.hiddenPendingCount !== 4) errors.push("P03F2_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows = allRows.filter((row) => row.sourceId === G3A_U08_SOURCE_ID);
  const groups = sourceRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const specs = [...new Set(groups.flatMap((row) => row.patternSpecIds ?? []))];
  if (sourceRows.length !== 3 || groups.length !== 5 || specs.length !== 7) errors.push("P03F2_CURRENT_SOURCE_SURFACE_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ addedKnowledgePoints: 2, currentSourceKnowledgePoints: 3, currentSourcePatternGroups: 5, currentSourcePatternSpecs: 7, publicSources: 20 }),
  });
}
