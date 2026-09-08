export * from "./batch-a-selector-p05f12-extension.js";
import * as base from "./batch-a-selector-p05f12-extension.js";
import {
  G4A_U05_P05F13_FUTURE_KP_IDS,
  G4A_U05_P05F13_KP_ID,
  G4A_U05_P05F13_PATTERN_GROUP,
  G4A_U05_P05F13_SELECTOR_ROW,
  G4A_U05_P05F13_SOURCE_ID,
  resolveG4AU05P05F13PatternSpecIds,
} from "./g4a-u05-triangle-elements-naming-selector-projection-p05f13.js";
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const baseAvailability=base.BATCH_A_SELECTOR_AVAILABILITY;
const prior=baseAvailability.bySourceId?.[G4A_U05_P05F13_SOURCE_ID]??{sourceId:G4A_U05_P05F13_SOURCE_ID,visibleKnowledgePointIds:[],hiddenPendingKnowledgePointIds:[],notSelectableKnowledgePointIds:[]};
const sourceWasPresent=Boolean(baseAvailability.bySourceId?.[G4A_U05_P05F13_SOURCE_ID]);
const targetWasVisible=(prior.visibleKnowledgePointIds??[]).includes(G4A_U05_P05F13_KP_ID);
const visibleKnowledgePointIds=Object.freeze([...new Set([...(prior.visibleKnowledgePointIds??[]),G4A_U05_P05F13_KP_ID])]);
const hiddenPendingKnowledgePointIds=Object.freeze([...new Set([...(prior.hiddenPendingKnowledgePointIds??[]).filter(id=>id!==G4A_U05_P05F13_KP_ID),...G4A_U05_P05F13_FUTURE_KP_IDS])]);
const notSelectableKnowledgePointIds=Object.freeze([...new Set([...(prior.notSelectableKnowledgePointIds??[]).filter(id=>id!==G4A_U05_P05F13_KP_ID),...G4A_U05_P05F13_FUTURE_KP_IDS])]);
const bySourceId=Object.freeze({...baseAvailability.bySourceId,[G4A_U05_P05F13_SOURCE_ID]:Object.freeze({...prior,sourceId:G4A_U05_P05F13_SOURCE_ID,visibleCount:visibleKnowledgePointIds.length,hiddenPendingCount:hiddenPendingKnowledgePointIds.length,notSelectableCount:notSelectableKnowledgePointIds.length,visibleKnowledgePointIds,hiddenPendingKnowledgePointIds,notSelectableKnowledgePointIds,publicSelectorStatus:"w5_slice013_triangle_elements_naming_promoted",publicDropdownCutoverTask:"P05F_W5DirectProductVerticalSlice013Implementation"})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...baseAvailability,
  sourceCount:(baseAvailability.sourceCount??51)+(sourceWasPresent?0:1),
  publicSourceCount:(baseAvailability.publicSourceCount??51)+(sourceWasPresent?0:1),
  visibleCount:(baseAvailability.visibleCount??326)+(targetWasVisible?0:1),
  hiddenPendingCount:(baseAvailability.hiddenPendingCount??0)+(sourceWasPresent?0:G4A_U05_P05F13_FUTURE_KP_IDS.length),
  notSelectableCount:(baseAvailability.notSelectableCount??0)+(sourceWasPresent?0:G4A_U05_P05F13_FUTURE_KP_IDS.length),
  bySourceId,
});
export function listVisibleBatchAKnowledgePoints(){return targetWasVisible?base.listVisibleBatchAKnowledgePoints():[...base.listVisibleBatchAKnowledgePoints(),clone(G4A_U05_P05F13_SELECTOR_ROW)];}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(id){if(id===G4A_U05_P05F13_KP_ID)return clone(G4A_U05_P05F13_SELECTOR_ROW);if(G4A_U05_P05F13_FUTURE_KP_IDS.includes(id))return null;return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===G4A_U05_P05F13_KP_ID)return[clone(G4A_U05_P05F13_PATTERN_GROUP)];if(G4A_U05_P05F13_FUTURE_KP_IDS.includes(id))return[];return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===G4A_U05_P05F13_KP_ID)return mode&&mode!=="diagram"?[]:resolveG4AU05P05F13PatternSpecIds(id);if(G4A_U05_P05F13_FUTURE_KP_IDS.includes(id))return[];return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP05F13PublicSelectorComposition(){
  const errors=[];
  const baseAudit=base.auditP05F12PublicSelectorComposition?.();
  if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map(code=>`P05F13_BASE:${code}`));
  const rows=listVisibleBatchAKnowledgePoints(),ids=rows.map(row=>row.knowledgePointId);
  if(new Set(ids).size!==ids.length)errors.push("P05F13_DUPLICATE_VISIBLE_KP");
  const source=listBatchAKnowledgePointAvailabilityBySource(G4A_U05_P05F13_SOURCE_ID);
  if(source.visibleCount!==1||source.hiddenPendingCount!==4||source.notSelectableCount!==4)errors.push("P05F13_SOURCE_AVAILABILITY_INVALID");
  if(!source.visibleKnowledgePointIds.includes(G4A_U05_P05F13_KP_ID))errors.push("P05F13_TARGET_NOT_VISIBLE");
  for(const id of G4A_U05_P05F13_FUTURE_KP_IDS)if(!source.hiddenPendingKnowledgePointIds.includes(id)||!source.notSelectableKnowledgePointIds.includes(id)||getVisibleBatchAKnowledgePoint(id)!==null)errors.push(`P05F13_FUTURE_KP_BOUNDARY_INVALID:${id}`);
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==52||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==52||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==327)errors.push("P05F13_GLOBAL_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g4aU05Visible:source.visibleCount,g4aU05Hidden:source.hiddenPendingCount,g4aU05NotSelectable:source.notSelectableCount})});
}
