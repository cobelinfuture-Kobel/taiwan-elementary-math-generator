export * from "./batch-a-selector-p04f39-extension.js";
import * as base from "./batch-a-selector-p04f39-extension.js";
import {
  G3A_U05_P05F1_FUTURE_KP_IDS,
  G3A_U05_P05F1_KP_ID,
  G3A_U05_P05F1_PATTERN_GROUPS,
  G3A_U05_P05F1_SELECTOR_ROWS,
  G3A_U05_P05F1_SOURCE_ID,
  resolveG3AU05P05F1PatternSpecIds,
} from "./g3a-u05-angle-parts-selector-projection-p05f1.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));
const baseAvailability=base.BATCH_A_SELECTOR_AVAILABILITY;
const priorSource=baseAvailability.bySourceId?.[G3A_U05_P05F1_SOURCE_ID]??{sourceId:G3A_U05_P05F1_SOURCE_ID,visibleCount:0,hiddenPendingCount:0,notSelectableCount:0,visibleKnowledgePointIds:[],hiddenKnowledgePointIds:[],notSelectableKnowledgePointIds:[]};
const bySourceId=Object.freeze({...baseAvailability.bySourceId,[G3A_U05_P05F1_SOURCE_ID]:Object.freeze({
  ...priorSource,
  sourceId:G3A_U05_P05F1_SOURCE_ID,
  visibleCount:1,
  hiddenPendingCount:3,
  notSelectableCount:3,
  visibleKnowledgePointIds:Object.freeze([G3A_U05_P05F1_KP_ID]),
  hiddenKnowledgePointIds:G3A_U05_P05F1_FUTURE_KP_IDS,
  notSelectableKnowledgePointIds:G3A_U05_P05F1_FUTURE_KP_IDS,
})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...baseAvailability,sourceCount:44,publicSourceCount:44,visibleCount:313,hiddenPendingCount:(baseAvailability.hiddenPendingCount??0)+(priorSource.hiddenPendingCount?0:3),notSelectableCount:(baseAvailability.notSelectableCount??0)+(priorSource.notSelectableCount?0:3),bySourceId});

export function listVisibleBatchAKnowledgePoints(){return [...base.listVisibleBatchAKnowledgePoints(),...clone(G3A_U05_P05F1_SELECTOR_ROWS)];}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(knowledgePointId){if(knowledgePointId===G3A_U05_P05F1_KP_ID)return clone(G3A_U05_P05F1_SELECTOR_ROWS[0]);if(G3A_U05_P05F1_FUTURE_KP_IDS.includes(knowledgePointId))return null;return base.getVisibleBatchAKnowledgePoint(knowledgePointId);}
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId){if(knowledgePointId===G3A_U05_P05F1_KP_ID)return clone(G3A_U05_P05F1_PATTERN_GROUPS);if(G3A_U05_P05F1_FUTURE_KP_IDS.includes(knowledgePointId))return[];return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId,mode=null){if(knowledgePointId===G3A_U05_P05F1_KP_ID)return mode&&mode!=="diagram"?[]:resolveG3AU05P05F1PatternSpecIds(knowledgePointId);if(G3A_U05_P05F1_FUTURE_KP_IDS.includes(knowledgePointId))return[];return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId,mode);}
export function auditP05F1PublicSelectorComposition(){
  const errors=[];
  const baseAudit=base.auditP04F39PublicSelectorComposition?.();
  if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map((code)=>`P05F1_BASE:${code}`));
  const rows=listVisibleBatchAKnowledgePoints(),ids=rows.map((row)=>row.knowledgePointId);
  if(new Set(ids).size!==ids.length)errors.push("P05F1_DUPLICATE_VISIBLE_KP");
  const source=listBatchAKnowledgePointAvailabilityBySource(G3A_U05_P05F1_SOURCE_ID);
  if(source.visibleCount!==1||source.hiddenPendingCount!==3||source.notSelectableCount!==3)errors.push("P05F1_SOURCE_AVAILABILITY_INVALID");
  if(!source.visibleKnowledgePointIds.includes(G3A_U05_P05F1_KP_ID))errors.push("P05F1_TARGET_NOT_VISIBLE");
  for(const id of G3A_U05_P05F1_FUTURE_KP_IDS)if(getVisibleBatchAKnowledgePoint(id)!==null)errors.push(`P05F1_FUTURE_KP_LEAK:${id}`);
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==44||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==313)errors.push("P05F1_GLOBAL_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g3aU05Visible:source.visibleCount,g3aU05Hidden:source.hiddenPendingCount,g3aU05NotSelectable:source.notSelectableCount})});
}
