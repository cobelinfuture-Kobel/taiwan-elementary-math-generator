export * from "./batch-a-selector-p05f8-extension.js";
import * as base from "./batch-a-selector-p05f8-extension.js";
import {
  G5B_U10A_P05F9_EXISTING_VISIBLE_KP_IDS,
  G5B_U10A_P05F9_FUTURE_KP_IDS,
  G5B_U10A_P05F9_KP_ID,
  G5B_U10A_P05F9_PATTERN_GROUPS,
  G5B_U10A_P05F9_SELECTOR_ROWS,
  G5B_U10A_P05F9_SOURCE_ID,
  resolveG5BU10AP05F9PatternSpecIds,
} from "./g5b-u10a-large-area-unit-identity-selector-projection-p05f9.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));
const baseAvailability=base.BATCH_A_SELECTOR_AVAILABILITY;
const priorSource=baseAvailability.bySourceId?.[G5B_U10A_P05F9_SOURCE_ID]??{sourceId:G5B_U10A_P05F9_SOURCE_ID,visibleCount:0,hiddenPendingCount:0,notSelectableCount:0,visibleKnowledgePointIds:[],hiddenPendingKnowledgePointIds:[],notSelectableKnowledgePointIds:[]};
const visibleKnowledgePointIds=Object.freeze([...new Set([...(priorSource.visibleKnowledgePointIds??[]),...G5B_U10A_P05F9_EXISTING_VISIBLE_KP_IDS,G5B_U10A_P05F9_KP_ID])]);
const bySourceId=Object.freeze({...baseAvailability.bySourceId,[G5B_U10A_P05F9_SOURCE_ID]:Object.freeze({...priorSource,sourceId:G5B_U10A_P05F9_SOURCE_ID,visibleCount:visibleKnowledgePointIds.length,hiddenPendingCount:G5B_U10A_P05F9_FUTURE_KP_IDS.length,notSelectableCount:G5B_U10A_P05F9_FUTURE_KP_IDS.length,visibleKnowledgePointIds,hiddenPendingKnowledgePointIds:G5B_U10A_P05F9_FUTURE_KP_IDS,notSelectableKnowledgePointIds:G5B_U10A_P05F9_FUTURE_KP_IDS,publicSelectorStatus:"w5_slice009_large_area_unit_identity_promoted",publicDropdownCutoverTask:"P05F_W5DirectProductVerticalSlice009Implementation"})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...baseAvailability,sourceCount:baseAvailability.sourceCount,publicSourceCount:baseAvailability.publicSourceCount,visibleCount:(baseAvailability.visibleCount??320)+1,hiddenPendingCount:(baseAvailability.hiddenPendingCount??0)+G5B_U10A_P05F9_FUTURE_KP_IDS.length,notSelectableCount:(baseAvailability.notSelectableCount??0)+G5B_U10A_P05F9_FUTURE_KP_IDS.length,bySourceId});

export function listVisibleBatchAKnowledgePoints(){return [...base.listVisibleBatchAKnowledgePoints(),...clone(G5B_U10A_P05F9_SELECTOR_ROWS)];}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(id){if(id===G5B_U10A_P05F9_KP_ID)return clone(G5B_U10A_P05F9_SELECTOR_ROWS[0]);if(G5B_U10A_P05F9_FUTURE_KP_IDS.includes(id))return null;return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===G5B_U10A_P05F9_KP_ID)return clone(G5B_U10A_P05F9_PATTERN_GROUPS);if(G5B_U10A_P05F9_FUTURE_KP_IDS.includes(id))return[];return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===G5B_U10A_P05F9_KP_ID)return mode&&mode!=="diagram"?[]:resolveG5BU10AP05F9PatternSpecIds(id);if(G5B_U10A_P05F9_FUTURE_KP_IDS.includes(id))return[];return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP05F9PublicSelectorComposition(){
  const errors=[];const baseAudit=base.auditP05F8PublicSelectorComposition?.();if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map((code)=>`P05F9_BASE:${code}`));
  const rows=listVisibleBatchAKnowledgePoints(),ids=rows.map((row)=>row.knowledgePointId);if(new Set(ids).size!==ids.length)errors.push("P05F9_DUPLICATE_VISIBLE_KP");
  const source=listBatchAKnowledgePointAvailabilityBySource(G5B_U10A_P05F9_SOURCE_ID);if(source.visibleCount!==2||source.hiddenPendingCount!==3||source.notSelectableCount!==3)errors.push("P05F9_SOURCE_AVAILABILITY_INVALID");if(!source.visibleKnowledgePointIds.includes(G5B_U10A_P05F9_KP_ID)||!source.visibleKnowledgePointIds.includes(G5B_U10A_P05F9_EXISTING_VISIBLE_KP_IDS[0]))errors.push("P05F9_VISIBLE_KP_SET_INVALID");
  for(const id of G5B_U10A_P05F9_FUTURE_KP_IDS)if(!source.hiddenPendingKnowledgePointIds.includes(id)||!source.notSelectableKnowledgePointIds.includes(id)||getVisibleBatchAKnowledgePoint(id)!==null)errors.push(`P05F9_FUTURE_KP_BOUNDARY_INVALID:${id}`);
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==51||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==51||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==321)errors.push("P05F9_GLOBAL_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g5bU10aVisible:source.visibleCount,g5bU10aHidden:source.hiddenPendingCount,g5bU10aNotSelectable:source.notSelectableCount})});
}
