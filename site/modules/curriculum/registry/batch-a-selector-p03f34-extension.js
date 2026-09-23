export * from "./batch-a-selector-p03f33-extension.js";
import * as base from "./batch-a-selector-p03f33-extension.js";
import {
  G4A_U09_P03F34_KP_ID,
  G4A_U09_P03F34_SELECTOR_PROJECTION,
  G4A_U09_P03F34_SOURCE_ID,
  auditG4AU09P03F34SelectorProjection,
  getG4AU09P03F34SelectorRow,
  listG4AU09P03F34PatternGroups,
  listG4AU09P03F34SelectorRows,
  resolveG4AU09P03F34PatternSpecIds,
} from "./g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));
const rows=Object.freeze(listG4AU09P03F34SelectorRows().map((row)=>Object.freeze(row)));
const prior=base.listBatchAKnowledgePointAvailabilityBySource(G4A_U09_P03F34_SOURCE_ID);
const baseSourceCount=base.BATCH_A_SELECTOR_AVAILABILITY.sourceCount
  ?? base.BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount
  ?? Object.keys(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId).length;
export { G4A_U09_P03F34_SELECTOR_PROJECTION };
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA=base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount:base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount+1,
  sourceCount:baseSourceCount,
  publicSourceCount:baseSourceCount,
  bySourceId:Object.freeze({
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [G4A_U09_P03F34_SOURCE_ID]:Object.freeze({
      ...(prior??{}),
      sourceId:G4A_U09_P03F34_SOURCE_ID,
      visibleCount:(prior?.visibleCount??6)+1,
      hiddenPendingCount:Math.max(0,(prior?.hiddenPendingCount??2)-1),
      notSelectableCount:prior?.notSelectableCount??0,
      publicSelectorStatus:"slice034_rank9_missing_digit_inequality_added_to_existing_source",
      canonicalReachableKnowledgePointCount:(prior?.canonicalReachableKnowledgePointCount??6)+1,
      canonicalReachableKnowledgePointIds:Object.freeze([...(prior?.canonicalReachableKnowledgePointIds??[]),G4A_U09_P03F34_KP_ID]),
      compatibilityProjection:"full_product_w3_shared_decimal_pipeline",
      publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice034Implementation",
    }),
  }),
});
export function listVisibleBatchAKnowledgePoints(){ return [...base.listVisibleBatchAKnowledgePoints(),...rows.map(clone)]; }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){ return sourceId===G4A_U09_P03F34_SOURCE_ID?clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]):base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(id){ return getG4AU09P03F34SelectorRow(id)??base.getVisibleBatchAKnowledgePoint(id); }
export function getVisiblePatternGroupsForKnowledgePoint(id){ const groups=listG4AU09P03F34PatternGroups(id); return groups.length?groups:base.getVisiblePatternGroupsForKnowledgePoint(id); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){ const ids=resolveG4AU09P03F34PatternSpecIds(id); return ids.length&&(mode==null||mode==="numeric")?ids:base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode); }
export function auditP03F34PublicSelectorComposition(){
  const errors=[...auditG4AU09P03F34SelectorProjection().errors];
  const allRows=listVisibleBatchAKnowledgePoints();
  const ids=allRows.map((row)=>row.knowledgePointId);
  if(new Set(ids).size!==ids.length) errors.push("P03F34_SELECTOR_DUPLICATE_KP");
  const availability=listBatchAKnowledgePointAvailabilityBySource(G4A_U09_P03F34_SOURCE_ID);
  if(!availability||availability.visibleCount!==7||availability.hiddenPendingCount!==1||availability.notSelectableCount!==0) errors.push("P03F34_SELECTOR_AVAILABILITY_INVALID");
  const sourceRows=allRows.filter((row)=>row.sourceId===G4A_U09_P03F34_SOURCE_ID);
  if(sourceRows.length!==7) errors.push("P03F34_EXISTING_SOURCE_KP_COUNT_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==32||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==32) errors.push("P03F34_PUBLIC_SOURCE_COUNT_CHANGED");
  if(BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==230) errors.push("P03F34_PUBLIC_KP_COUNT_INVALID");
  const groups=getVisiblePatternGroupsForKnowledgePoint(G4A_U09_P03F34_KP_ID);
  if(groups.length!==1||groups[0].patternSpecIds.length!==1) errors.push("P03F34_PATTERN_SURFACE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({addedSources:0,addedKnowledgePoints:1,currentSourceKnowledgePoints:sourceRows.length,addedPatternGroups:1,addedPatternSpecs:1,publicSources:baseSourceCount,publicKnowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount})});
}
