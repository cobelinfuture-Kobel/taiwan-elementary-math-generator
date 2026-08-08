export * from "./batch-a-selector-p03f27-extension.js";
import * as base from "./batch-a-selector-p03f27-extension.js";
import {
  G5A_U01_P03F28_KP_ID,
  G5A_U01_P03F28_SELECTOR_PROJECTION,
  G5A_U01_P03F28_SOURCE_ID,
  auditG5AU01P03F28SelectorProjection,
  getG5AU01P03F28SelectorRow,
  listG5AU01P03F28PatternGroups,
  listG5AU01P03F28SelectorRows,
  resolveG5AU01P03F28PatternSpecIds,
} from "./g5a-u01-rank8-decimal-selector-projection-p03f28.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG5AU01P03F28SelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G5A_U01_P03F28_SOURCE_ID);
const currentSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;
const CURRENT_G5A_U01_TOTAL_KP_COUNT = 8;
const CURRENT_G5A_U01_VISIBLE_KP_COUNT = 2;

export { G5A_U01_P03F28_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 1,
  sourceCount: currentSourceCount,
  publicSourceCount: currentSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G5A_U01_P03F28_SOURCE_ID]: Object.freeze({
      ...(prior ?? {}),
      sourceId: G5A_U01_P03F28_SOURCE_ID,
      visibleCount: CURRENT_G5A_U01_VISIBLE_KP_COUNT,
      hiddenPendingCount: CURRENT_G5A_U01_TOTAL_KP_COUNT - CURRENT_G5A_U01_VISIBLE_KP_COUNT,
      notSelectableCount: CURRENT_G5A_U01_TOTAL_KP_COUNT - CURRENT_G5A_U01_VISIBLE_KP_COUNT,
      publicSelectorStatus: "slice028_rank8_decimal_compose_decompose_added_to_existing_g5a_u01_source",
      canonicalReachableKnowledgePointCount: CURRENT_G5A_U01_VISIBLE_KP_COUNT,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...new Set([
          ...(prior?.canonicalReachableKnowledgePointIds ?? []),
          G5A_U01_P03F28_KP_ID,
        ]),
      ]),
      compatibilityProjection: "full_product_w3_shared_decimal_representation_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice028Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints(){ return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){ return sourceId===G5A_U01_P03F28_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id){ return getG5AU01P03F28SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id){ const groups=listG5AU01P03F28PatternGroups(id); return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){ const ids=resolveG5AU01P03F28PatternSpecIds(id); return ids.length && (mode==null || mode==="numeric") ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode); }

export function auditP03F28PublicSelectorComposition(){
  const errors=[...auditG5AU01P03F28SelectorProjection().errors];
  const allRows=listVisibleBatchAKnowledgePoints();
  const ids=allRows.map((row)=>row.knowledgePointId);
  if(new Set(ids).size!==ids.length) errors.push("P03F28_SELECTOR_DUPLICATE_KP");
  const availability=listBatchAKnowledgePointAvailabilityBySource(G5A_U01_P03F28_SOURCE_ID);
  if(!availability || availability.visibleCount!==2 || availability.hiddenPendingCount!==6 || availability.notSelectableCount!==6) errors.push("P03F28_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows=allRows.filter((row)=>row.sourceId===G5A_U01_P03F28_SOURCE_ID);
  if(sourceRows.length!==2) errors.push("P03F28_EXISTING_SOURCE_KP_COUNT_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==currentSourceCount || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==currentSourceCount) errors.push("P03F28_PUBLIC_SOURCE_COUNT_CHANGED");
  const groups=getVisiblePatternGroupsForKnowledgePoint(G5A_U01_P03F28_KP_ID);
  if(groups.length!==1 || groups[0].patternSpecIds.length!==1) errors.push("P03F28_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({addedSources:0,addedKnowledgePoints:1,currentSourceKnowledgePoints:sourceRows.length,addedPatternGroups:1,addedPatternSpecs:1,publicSources:currentSourceCount})});
}
