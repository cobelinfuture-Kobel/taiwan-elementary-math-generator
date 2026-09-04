export * from "./batch-a-selector-p05f2-extension.js";
import * as base from "./batch-a-selector-p05f2-extension.js";
import {
  G3B_U05_P05F3_FUTURE_KP_IDS,
  G3B_U05_P05F3_KP_ID,
  G3B_U05_P05F3_PATTERN_GROUPS,
  G3B_U05_P05F3_SELECTOR_ROWS,
  G3B_U05_P05F3_SOURCE_ID,
  resolveG3BU05P05F3PatternSpecIds,
} from "./g3b-u05-square-centimeter-unit-selector-projection-p05f3.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));
const baseAvailability=base.BATCH_A_SELECTOR_AVAILABILITY;
const priorSource=baseAvailability.bySourceId?.[G3B_U05_P05F3_SOURCE_ID]??{sourceId:G3B_U05_P05F3_SOURCE_ID,visibleCount:0,hiddenPendingCount:0,notSelectableCount:0,visibleKnowledgePointIds:[],hiddenPendingKnowledgePointIds:[],notSelectableKnowledgePointIds:[]};
const bySourceId=Object.freeze({...baseAvailability.bySourceId,[G3B_U05_P05F3_SOURCE_ID]:Object.freeze({
  ...priorSource,
  sourceId:G3B_U05_P05F3_SOURCE_ID,
  visibleCount:1,
  hiddenPendingCount:4,
  notSelectableCount:4,
  visibleKnowledgePointIds:Object.freeze([G3B_U05_P05F3_KP_ID]),
  hiddenPendingKnowledgePointIds:G3B_U05_P05F3_FUTURE_KP_IDS,
  notSelectableKnowledgePointIds:G3B_U05_P05F3_FUTURE_KP_IDS,
})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...baseAvailability,sourceCount:46,publicSourceCount:46,visibleCount:315,hiddenPendingCount:(baseAvailability.hiddenPendingCount??0)+(priorSource.hiddenPendingCount?0:4),notSelectableCount:(baseAvailability.notSelectableCount??0)+(priorSource.notSelectableCount?0:4),bySourceId});

export function listVisibleBatchAKnowledgePoints(){return [...base.listVisibleBatchAKnowledgePoints(),...clone(G3B_U05_P05F3_SELECTOR_ROWS)];}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(knowledgePointId){if(knowledgePointId===G3B_U05_P05F3_KP_ID)return clone(G3B_U05_P05F3_SELECTOR_ROWS[0]);if(G3B_U05_P05F3_FUTURE_KP_IDS.includes(knowledgePointId))return null;return base.getVisibleBatchAKnowledgePoint(knowledgePointId);}
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId){if(knowledgePointId===G3B_U05_P05F3_KP_ID)return clone(G3B_U05_P05F3_PATTERN_GROUPS);if(G3B_U05_P05F3_FUTURE_KP_IDS.includes(knowledgePointId))return[];return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId,mode=null){if(knowledgePointId===G3B_U05_P05F3_KP_ID)return mode&&mode!=="diagram"?[]:resolveG3BU05P05F3PatternSpecIds(knowledgePointId);if(G3B_U05_P05F3_FUTURE_KP_IDS.includes(knowledgePointId))return[];return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId,mode);}
export function auditP05F3PublicSelectorComposition(){
  const errors=[];
  const baseAudit=base.auditP05F2PublicSelectorComposition?.();
  if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map((code)=>`P05F3_BASE:${code}`));
  const rows=listVisibleBatchAKnowledgePoints(),ids=rows.map((row)=>row.knowledgePointId);
  if(new Set(ids).size!==ids.length)errors.push("P05F3_DUPLICATE_VISIBLE_KP");
  const source=listBatchAKnowledgePointAvailabilityBySource(G3B_U05_P05F3_SOURCE_ID);
  if(source.visibleCount!==1||source.hiddenPendingCount!==4||source.notSelectableCount!==4)errors.push("P05F3_SOURCE_AVAILABILITY_INVALID");
  if(!source.visibleKnowledgePointIds.includes(G3B_U05_P05F3_KP_ID))errors.push("P05F3_TARGET_NOT_VISIBLE");
  for(const id of G3B_U05_P05F3_FUTURE_KP_IDS)if(!source.hiddenPendingKnowledgePointIds.includes(id)||!source.notSelectableKnowledgePointIds.includes(id)||getVisibleBatchAKnowledgePoint(id)!==null)errors.push(`P05F3_FUTURE_KP_BOUNDARY_INVALID:${id}`);
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==46||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==46||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==315)errors.push("P05F3_GLOBAL_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g3bU05Visible:source.visibleCount,g3bU05Hidden:source.hiddenPendingCount,g3bU05NotSelectable:source.notSelectableCount})});
}
