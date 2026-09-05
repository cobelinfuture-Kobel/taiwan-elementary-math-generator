export * from "./batch-a-selector-p05f4-extension.js";
import * as base from "./batch-a-selector-p05f4-extension.js";
import {G4B_U10_P05F5_FUTURE_KP_IDS,G4B_U10_P05F5_KP_ID,G4B_U10_P05F5_PATTERN_GROUPS,G4B_U10_P05F5_SELECTOR_ROWS,G4B_U10_P05F5_SOURCE_ID,resolveG4BU10P05F5PatternSpecIds} from "./g4b-u10-cubic-centimeter-unit-selector-projection-p05f5.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));
const baseAvailability=base.BATCH_A_SELECTOR_AVAILABILITY;
const priorSource=baseAvailability.bySourceId?.[G4B_U10_P05F5_SOURCE_ID]??{sourceId:G4B_U10_P05F5_SOURCE_ID,visibleCount:0,hiddenPendingCount:0,notSelectableCount:0,visibleKnowledgePointIds:[],hiddenPendingKnowledgePointIds:[],notSelectableKnowledgePointIds:[]};
const bySourceId=Object.freeze({...baseAvailability.bySourceId,[G4B_U10_P05F5_SOURCE_ID]:Object.freeze({...priorSource,sourceId:G4B_U10_P05F5_SOURCE_ID,visibleCount:1,hiddenPendingCount:4,notSelectableCount:4,visibleKnowledgePointIds:Object.freeze([G4B_U10_P05F5_KP_ID]),hiddenPendingKnowledgePointIds:G4B_U10_P05F5_FUTURE_KP_IDS,notSelectableKnowledgePointIds:G4B_U10_P05F5_FUTURE_KP_IDS})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...baseAvailability,sourceCount:(baseAvailability.sourceCount??47)+(priorSource.visibleCount?0:1),publicSourceCount:(baseAvailability.publicSourceCount??47)+(priorSource.visibleCount?0:1),visibleCount:(baseAvailability.visibleCount??316)+(priorSource.visibleCount?0:1),hiddenPendingCount:(baseAvailability.hiddenPendingCount??0)+(priorSource.hiddenPendingCount?0:4),notSelectableCount:(baseAvailability.notSelectableCount??0)+(priorSource.notSelectableCount?0:4),bySourceId});

export function listVisibleBatchAKnowledgePoints(){return [...base.listVisibleBatchAKnowledgePoints(),...clone(G4B_U10_P05F5_SELECTOR_ROWS)];}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(knowledgePointId){if(knowledgePointId===G4B_U10_P05F5_KP_ID)return clone(G4B_U10_P05F5_SELECTOR_ROWS[0]);if(G4B_U10_P05F5_FUTURE_KP_IDS.includes(knowledgePointId))return null;return base.getVisibleBatchAKnowledgePoint(knowledgePointId);}
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId){if(knowledgePointId===G4B_U10_P05F5_KP_ID)return clone(G4B_U10_P05F5_PATTERN_GROUPS);if(G4B_U10_P05F5_FUTURE_KP_IDS.includes(knowledgePointId))return[];return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId,mode=null){if(knowledgePointId===G4B_U10_P05F5_KP_ID)return mode&&mode!=="diagram"?[]:resolveG4BU10P05F5PatternSpecIds(knowledgePointId);if(G4B_U10_P05F5_FUTURE_KP_IDS.includes(knowledgePointId))return[];return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId,mode);}
export function auditP05F5PublicSelectorComposition(){
  const errors=[];const baseAudit=base.auditP05F4PublicSelectorComposition?.();if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map((code)=>`P05F5_BASE:${code}`));
  const rows=listVisibleBatchAKnowledgePoints(),ids=rows.map((row)=>row.knowledgePointId);if(new Set(ids).size!==ids.length)errors.push("P05F5_DUPLICATE_VISIBLE_KP");
  const source=listBatchAKnowledgePointAvailabilityBySource(G4B_U10_P05F5_SOURCE_ID);if(source.visibleCount!==1||source.hiddenPendingCount!==4||source.notSelectableCount!==4)errors.push("P05F5_SOURCE_AVAILABILITY_INVALID");if(!source.visibleKnowledgePointIds.includes(G4B_U10_P05F5_KP_ID))errors.push("P05F5_TARGET_NOT_VISIBLE");
  for(const id of G4B_U10_P05F5_FUTURE_KP_IDS)if(!source.hiddenPendingKnowledgePointIds.includes(id)||!source.notSelectableKnowledgePointIds.includes(id)||getVisibleBatchAKnowledgePoint(id)!==null)errors.push(`P05F5_FUTURE_KP_BOUNDARY_INVALID:${id}`);
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==48||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==48||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==317)errors.push("P05F5_GLOBAL_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g4bU10Visible:source.visibleCount,g4bU10Hidden:source.hiddenPendingCount,g4bU10NotSelectable:source.notSelectableCount})});
}
