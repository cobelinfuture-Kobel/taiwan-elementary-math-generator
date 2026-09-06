export * from "./batch-a-selector-p05f9-extension.js";
import * as base from "./batch-a-selector-p05f9-extension.js";
import {
  G3A_U05_P05F10_EXISTING_VISIBLE_KP_IDS,
  G3A_U05_P05F10_FUTURE_KP_IDS,
  G3A_U05_P05F10_KP_ID,
  G3A_U05_P05F10_PATTERN_GROUPS,
  G3A_U05_P05F10_SELECTOR_ROWS,
  G3A_U05_P05F10_SOURCE_ID,
  resolveG3AU05P05F10PatternSpecIds,
} from "./g3a-u05-right-angle-recognition-selector-projection-p05f10.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));
const baseAvailability=base.BATCH_A_SELECTOR_AVAILABILITY;
const priorSource=baseAvailability.bySourceId?.[G3A_U05_P05F10_SOURCE_ID]??{sourceId:G3A_U05_P05F10_SOURCE_ID,visibleCount:0,hiddenPendingCount:0,notSelectableCount:0,visibleKnowledgePointIds:[],hiddenPendingKnowledgePointIds:[],notSelectableKnowledgePointIds:[]};
const visibleKnowledgePointIds=Object.freeze([...new Set([...(priorSource.visibleKnowledgePointIds??[]),...G3A_U05_P05F10_EXISTING_VISIBLE_KP_IDS,G3A_U05_P05F10_KP_ID])]);
const bySourceId=Object.freeze({...baseAvailability.bySourceId,[G3A_U05_P05F10_SOURCE_ID]:Object.freeze({...priorSource,sourceId:G3A_U05_P05F10_SOURCE_ID,visibleCount:visibleKnowledgePointIds.length,hiddenPendingCount:G3A_U05_P05F10_FUTURE_KP_IDS.length,notSelectableCount:G3A_U05_P05F10_FUTURE_KP_IDS.length,visibleKnowledgePointIds,hiddenPendingKnowledgePointIds:G3A_U05_P05F10_FUTURE_KP_IDS,notSelectableKnowledgePointIds:G3A_U05_P05F10_FUTURE_KP_IDS,publicSelectorStatus:"w5_slice010_right_angle_recognition_promoted",publicDropdownCutoverTask:"P05F_W5DirectProductVerticalSlice010Implementation"})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...baseAvailability,sourceCount:baseAvailability.sourceCount,publicSourceCount:baseAvailability.publicSourceCount,visibleCount:(baseAvailability.visibleCount??321)+1,hiddenPendingCount:Math.max(0,(baseAvailability.hiddenPendingCount??1)-1),notSelectableCount:Math.max(0,(baseAvailability.notSelectableCount??1)-1),bySourceId});

export function listVisibleBatchAKnowledgePoints(){return [...base.listVisibleBatchAKnowledgePoints(),...clone(G3A_U05_P05F10_SELECTOR_ROWS)];}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(id){if(id===G3A_U05_P05F10_KP_ID)return clone(G3A_U05_P05F10_SELECTOR_ROWS[0]);if(G3A_U05_P05F10_FUTURE_KP_IDS.includes(id))return null;return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===G3A_U05_P05F10_KP_ID)return clone(G3A_U05_P05F10_PATTERN_GROUPS);if(G3A_U05_P05F10_FUTURE_KP_IDS.includes(id))return[];return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===G3A_U05_P05F10_KP_ID)return mode&&mode!=="diagram"?[]:resolveG3AU05P05F10PatternSpecIds(id);if(G3A_U05_P05F10_FUTURE_KP_IDS.includes(id))return[];return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP05F10PublicSelectorComposition(){const errors=[];const baseAudit=base.auditP05F9PublicSelectorComposition?.();if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map(code=>`P05F10_BASE:${code}`));const rows=listVisibleBatchAKnowledgePoints(),ids=rows.map(row=>row.knowledgePointId);if(new Set(ids).size!==ids.length)errors.push("P05F10_DUPLICATE_VISIBLE_KP");const source=listBatchAKnowledgePointAvailabilityBySource(G3A_U05_P05F10_SOURCE_ID);if(source.visibleCount!==2||source.hiddenPendingCount!==2||source.notSelectableCount!==2)errors.push("P05F10_SOURCE_AVAILABILITY_INVALID");for(const id of [...G3A_U05_P05F10_EXISTING_VISIBLE_KP_IDS,G3A_U05_P05F10_KP_ID])if(!source.visibleKnowledgePointIds.includes(id))errors.push(`P05F10_VISIBLE_KP_SET_INVALID:${id}`);for(const id of G3A_U05_P05F10_FUTURE_KP_IDS)if(!source.hiddenPendingKnowledgePointIds.includes(id)||!source.notSelectableKnowledgePointIds.includes(id)||getVisibleBatchAKnowledgePoint(id)!==null)errors.push(`P05F10_FUTURE_KP_BOUNDARY_INVALID:${id}`);if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==51||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==51||BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==322)errors.push("P05F10_GLOBAL_COUNT_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g3aU05Visible:source.visibleCount,g3aU05Hidden:source.hiddenPendingCount,g3aU05NotSelectable:source.notSelectableCount})});}
