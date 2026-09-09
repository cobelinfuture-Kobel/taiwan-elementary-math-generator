export * from "./batch-a-selector-p05f16-extension.js";
import * as base from "./batch-a-selector-p05f16-extension.js";
import {
  G5A_U10A_P05F17_EXISTING_VISIBLE_KP_IDS,
  G5A_U10A_P05F17_FUTURE_KP_IDS,
  G5A_U10A_P05F17_KP_ID,
  G5A_U10A_P05F17_PATTERN_GROUP,
  G5A_U10A_P05F17_SELECTOR_ROW,
  G5A_U10A_P05F17_SOURCE_ID,
  resolveG5AU10AP05F17PatternSpecIds,
} from "./g5a-u10a-prism-pyramid-elements-selector-projection-p05f17.js";
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const baseAvailability=base.BATCH_A_SELECTOR_AVAILABILITY;
const prior=baseAvailability.bySourceId?.[G5A_U10A_P05F17_SOURCE_ID]??{sourceId:G5A_U10A_P05F17_SOURCE_ID,visibleKnowledgePointIds:[],hiddenPendingKnowledgePointIds:[],notSelectableKnowledgePointIds:[]};
const priorHidden=prior.hiddenPendingKnowledgePointIds??[],priorNot=prior.notSelectableKnowledgePointIds??[];
const visibleKnowledgePointIds=Object.freeze([...new Set([...(prior.visibleKnowledgePointIds??[]),...G5A_U10A_P05F17_EXISTING_VISIBLE_KP_IDS,G5A_U10A_P05F17_KP_ID])]);
const hiddenPendingKnowledgePointIds=Object.freeze([...new Set([...priorHidden.filter(id=>id!==G5A_U10A_P05F17_KP_ID),...G5A_U10A_P05F17_FUTURE_KP_IDS])]);
const notSelectableKnowledgePointIds=Object.freeze([...new Set([...priorNot.filter(id=>id!==G5A_U10A_P05F17_KP_ID),...G5A_U10A_P05F17_FUTURE_KP_IDS])]);
const bySourceId=Object.freeze({...baseAvailability.bySourceId,[G5A_U10A_P05F17_SOURCE_ID]:Object.freeze({...prior,sourceId:G5A_U10A_P05F17_SOURCE_ID,visibleCount:visibleKnowledgePointIds.length,hiddenPendingCount:hiddenPendingKnowledgePointIds.length,notSelectableCount:notSelectableKnowledgePointIds.length,visibleKnowledgePointIds,hiddenPendingKnowledgePointIds,notSelectableKnowledgePointIds,publicSelectorStatus:"w5_slice017_prism_pyramid_elements_promoted",publicDropdownCutoverTask:"P05F_W5DirectProductVerticalSlice017Implementation"})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...baseAvailability,sourceCount:baseAvailability.sourceCount,publicSourceCount:baseAvailability.publicSourceCount,visibleCount:(baseAvailability.visibleCount??330)+1,hiddenPendingCount:(baseAvailability.hiddenPendingCount??0)+(hiddenPendingKnowledgePointIds.length-priorHidden.length),notSelectableCount:(baseAvailability.notSelectableCount??0)+(notSelectableKnowledgePointIds.length-priorNot.length),bySourceId});
export function listVisibleBatchAKnowledgePoints(){return [...base.listVisibleBatchAKnowledgePoints(),clone(G5A_U10A_P05F17_SELECTOR_ROW)];}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(id){if(id===G5A_U10A_P05F17_KP_ID)return clone(G5A_U10A_P05F17_SELECTOR_ROW);if(G5A_U10A_P05F17_FUTURE_KP_IDS.includes(id))return null;return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===G5A_U10A_P05F17_KP_ID)return[clone(G5A_U10A_P05F17_PATTERN_GROUP)];if(G5A_U10A_P05F17_FUTURE_KP_IDS.includes(id))return[];return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===G5A_U10A_P05F17_KP_ID)return mode&&mode!=="diagram"?[]:resolveG5AU10AP05F17PatternSpecIds(id);if(G5A_U10A_P05F17_FUTURE_KP_IDS.includes(id))return[];return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP05F17PublicSelectorComposition(){
  const errors=[],baseAudit=base.auditP05F16PublicSelectorComposition?.();
  if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map(code=>`P05F17_BASE:${code}`));
  const rows=listVisibleBatchAKnowledgePoints(),ids=rows.map(row=>row.knowledgePointId);
  if(new Set(ids).size!==ids.length)errors.push("P05F17_DUPLICATE_VISIBLE_KP");
  const source=listBatchAKnowledgePointAvailabilityBySource(G5A_U10A_P05F17_SOURCE_ID);
  if(source.visibleCount!==2||source.hiddenPendingCount!==3||source.notSelectableCount!==3)errors.push("P05F17_SOURCE_AVAILABILITY_INVALID");
  for(const id of [...G5A_U10A_P05F17_EXISTING_VISIBLE_KP_IDS,G5A_U10A_P05F17_KP_ID])if(!source.visibleKnowledgePointIds.includes(id))errors.push(`P05F17_VISIBLE_KP_SET_INVALID:${id}`);
  for(const id of G5A_U10A_P05F17_FUTURE_KP_IDS)if(source.visibleKnowledgePointIds.includes(id)||!source.hiddenPendingKnowledgePointIds.includes(id)||!source.notSelectableKnowledgePointIds.includes(id)||getVisibleBatchAKnowledgePoint(id)!==null)errors.push(`P05F17_FUTURE_KP_BOUNDARY_INVALID:${id}`);
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==53||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==53||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==331)errors.push("P05F17_GLOBAL_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g5aU10aVisible:source.visibleCount,g5aU10aHidden:source.hiddenPendingCount,g5aU10aNotSelectable:source.notSelectableCount})});
}
