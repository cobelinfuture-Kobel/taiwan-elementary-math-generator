export * from "./batch-a-selector-p05f5-extension.js";
import * as base from "./batch-a-selector-p05f5-extension.js";
import {G5A_U07_P05F6_FUTURE_KP_IDS,G5A_U07_P05F6_KP_ID,G5A_U07_P05F6_PATTERN_GROUPS,G5A_U07_P05F6_SELECTOR_ROWS,G5A_U07_P05F6_SOURCE_ID,resolveG5AU07P05F6PatternSpecIds} from "./g5a-u07-line-symmetry-recognition-selector-projection-p05f6.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));
const baseAvailability=base.BATCH_A_SELECTOR_AVAILABILITY;
const priorSource=baseAvailability.bySourceId?.[G5A_U07_P05F6_SOURCE_ID]??{sourceId:G5A_U07_P05F6_SOURCE_ID,visibleCount:0,hiddenPendingCount:0,notSelectableCount:0,visibleKnowledgePointIds:[],hiddenPendingKnowledgePointIds:[],notSelectableKnowledgePointIds:[]};
const bySourceId=Object.freeze({...baseAvailability.bySourceId,[G5A_U07_P05F6_SOURCE_ID]:Object.freeze({...priorSource,sourceId:G5A_U07_P05F6_SOURCE_ID,visibleCount:1,hiddenPendingCount:4,notSelectableCount:4,visibleKnowledgePointIds:Object.freeze([G5A_U07_P05F6_KP_ID]),hiddenPendingKnowledgePointIds:G5A_U07_P05F6_FUTURE_KP_IDS,notSelectableKnowledgePointIds:G5A_U07_P05F6_FUTURE_KP_IDS})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...baseAvailability,sourceCount:(baseAvailability.sourceCount??48)+(priorSource.visibleCount?0:1),publicSourceCount:(baseAvailability.publicSourceCount??48)+(priorSource.visibleCount?0:1),visibleCount:(baseAvailability.visibleCount??317)+(priorSource.visibleCount?0:1),hiddenPendingCount:(baseAvailability.hiddenPendingCount??0)+(priorSource.hiddenPendingCount?0:4),notSelectableCount:(baseAvailability.notSelectableCount??0)+(priorSource.notSelectableCount?0:4),bySourceId});

export function listVisibleBatchAKnowledgePoints(){return [...base.listVisibleBatchAKnowledgePoints(),...clone(G5A_U07_P05F6_SELECTOR_ROWS)];}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(knowledgePointId){if(knowledgePointId===G5A_U07_P05F6_KP_ID)return clone(G5A_U07_P05F6_SELECTOR_ROWS[0]);if(G5A_U07_P05F6_FUTURE_KP_IDS.includes(knowledgePointId))return null;return base.getVisibleBatchAKnowledgePoint(knowledgePointId);}
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId){if(knowledgePointId===G5A_U07_P05F6_KP_ID)return clone(G5A_U07_P05F6_PATTERN_GROUPS);if(G5A_U07_P05F6_FUTURE_KP_IDS.includes(knowledgePointId))return[];return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId,mode=null){if(knowledgePointId===G5A_U07_P05F6_KP_ID)return mode&&mode!=="diagram"?[]:resolveG5AU07P05F6PatternSpecIds(knowledgePointId);if(G5A_U07_P05F6_FUTURE_KP_IDS.includes(knowledgePointId))return[];return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId,mode);}
export function auditP05F6PublicSelectorComposition(){
  const errors=[];const baseAudit=base.auditP05F5PublicSelectorComposition?.();if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map((code)=>`P05F6_BASE:${code}`));
  const rows=listVisibleBatchAKnowledgePoints(),ids=rows.map((row)=>row.knowledgePointId);if(new Set(ids).size!==ids.length)errors.push("P05F6_DUPLICATE_VISIBLE_KP");
  const source=listBatchAKnowledgePointAvailabilityBySource(G5A_U07_P05F6_SOURCE_ID);if(source.visibleCount!==1||source.hiddenPendingCount!==4||source.notSelectableCount!==4)errors.push("P05F6_SOURCE_AVAILABILITY_INVALID");if(!source.visibleKnowledgePointIds.includes(G5A_U07_P05F6_KP_ID))errors.push("P05F6_TARGET_NOT_VISIBLE");
  for(const id of G5A_U07_P05F6_FUTURE_KP_IDS)if(!source.hiddenPendingKnowledgePointIds.includes(id)||!source.notSelectableKnowledgePointIds.includes(id)||getVisibleBatchAKnowledgePoint(id)!==null)errors.push(`P05F6_FUTURE_KP_BOUNDARY_INVALID:${id}`);
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==49||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==49||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==318)errors.push("P05F6_GLOBAL_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g5aU07Visible:source.visibleCount,g5aU07Hidden:source.hiddenPendingCount,g5aU07NotSelectable:source.notSelectableCount})});
}
