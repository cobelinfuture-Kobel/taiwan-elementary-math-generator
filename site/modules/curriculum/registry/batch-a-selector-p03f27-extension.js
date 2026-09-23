export * from "./batch-a-selector-p03f26-extension.js";
import * as base from "./batch-a-selector-p03f26-extension.js";
import {
  G4B_U08_P03F27_KP_IDS,
  G4B_U08_P03F27_SELECTOR_PROJECTION,
  G4B_U08_P03F27_SOURCE_ID,
  auditG4BU08P03F27SelectorProjection,
  getG4BU08P03F27SelectorRow,
  listG4BU08P03F27PatternGroups,
  listG4BU08P03F27SelectorRows,
  resolveG4BU08P03F27PatternSpecIds,
} from "./g4b-u08-rank8-fraction-selector-projection-p03f27.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const rows = Object.freeze(listG4BU08P03F27SelectorRows().map((row) => Object.freeze(row)));
const prior = base.listBatchAKnowledgePointAvailabilityBySource(G4B_U08_P03F27_SOURCE_ID);
const currentSourceCount = base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;
const CURRENT_G4B_U08_TOTAL_KP_COUNT = 7;
const CURRENT_G4B_U08_VISIBLE_KP_COUNT = 5;

export { G4B_U08_P03F27_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 2,
  sourceCount: currentSourceCount,
  publicSourceCount: currentSourceCount,
  bySourceId: Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4B_U08_P03F27_SOURCE_ID]: Object.freeze({
      ...(prior ?? {}),
      sourceId: G4B_U08_P03F27_SOURCE_ID,
      visibleCount: CURRENT_G4B_U08_VISIBLE_KP_COUNT,
      hiddenPendingCount: CURRENT_G4B_U08_TOTAL_KP_COUNT - CURRENT_G4B_U08_VISIBLE_KP_COUNT,
      notSelectableCount: 0,
      publicSelectorStatus: "slice027_rank8_fraction_kps_added_to_existing_g4b_u08_source",
      canonicalReachableKnowledgePointCount: CURRENT_G4B_U08_VISIBLE_KP_COUNT,
      canonicalReachableKnowledgePointIds: Object.freeze([
        ...new Set([
          ...(prior?.canonicalReachableKnowledgePointIds ?? []),
          ...G4B_U08_P03F27_KP_IDS,
        ]),
      ]),
      compatibilityProjection: "full_product_w3_shared_fraction_pipeline",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice027Implementation",
    }),
  }),
});

export function listVisibleBatchAKnowledgePoints(){ return [...base.listVisibleBatchAKnowledgePoints(), ...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){ return sourceId===G4B_U08_P03F27_SOURCE_ID ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id){ return getG4BU08P03F27SelectorRow(id) ?? base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id){ const groups=listG4BU08P03F27PatternGroups(id); return groups.length ? groups : base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){ const ids=resolveG4BU08P03F27PatternSpecIds(id); return ids.length && (mode==null || mode==="numeric") ? ids : base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode); }

export function auditP03F27PublicSelectorComposition(){
  const errors=[...auditG4BU08P03F27SelectorProjection().errors];
  const allRows=listVisibleBatchAKnowledgePoints();
  const ids=allRows.map((row)=>row.knowledgePointId);
  if(new Set(ids).size!==ids.length) errors.push("P03F27_SELECTOR_DUPLICATE_KP");
  const availability=listBatchAKnowledgePointAvailabilityBySource(G4B_U08_P03F27_SOURCE_ID);
  if(!availability || availability.visibleCount!==5 || availability.hiddenPendingCount!==2) errors.push("P03F27_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows=allRows.filter((row)=>row.sourceId===G4B_U08_P03F27_SOURCE_ID);
  if(sourceRows.length!==5) errors.push("P03F27_EXISTING_SOURCE_KP_COUNT_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==currentSourceCount || BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==currentSourceCount) errors.push("P03F27_PUBLIC_SOURCE_COUNT_CHANGED");
  const groups=G4B_U08_P03F27_KP_IDS.flatMap((id)=>getVisiblePatternGroupsForKnowledgePoint(id));
  if(groups.length!==2 || new Set(groups.flatMap((group)=>group.patternSpecIds)).size!==2) errors.push("P03F27_NEW_PATTERN_SURFACE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({addedSources:0,addedKnowledgePoints:2,currentSourceKnowledgePoints:sourceRows.length,addedPatternGroups:2,addedPatternSpecs:2,publicSources:currentSourceCount})});
}
