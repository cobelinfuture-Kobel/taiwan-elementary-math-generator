export * from "./batch-a-selector-p05f21-extension.js";
import * as base from "./batch-a-selector-p05f21-extension.js";
import {
  G3A_U05_P05F22_GROUP_IDS,
  G3A_U05_P05F22_KP_IDS,
  G3A_U05_P05F22_PATTERN_GROUPS,
  G3A_U05_P05F22_PRIOR_VISIBLE_KP_IDS,
  G3A_U05_P05F22_REMAINING_FUTURE_KP_IDS,
  G3A_U05_P05F22_SELECTOR_ROWS,
  G3A_U05_P05F22_SOURCE_ID,
  getG3AU05P05F22SelectorRow,
  listG3AU05P05F22PatternGroups,
  resolveG3AU05P05F22PatternSpecIds,
} from "./g3a-u05-angle-properties-selector-projection-p05f22.js";
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const b=base.BATCH_A_SELECTOR_AVAILABILITY,prior=b.bySourceId?.[G3A_U05_P05F22_SOURCE_ID];
if(!prior)throw new Error("P05F22_REQUIRES_EXISTING_G3A_U05_SOURCE");
const priorVisible=prior.visibleKnowledgePointIds??[],priorHidden=prior.hiddenPendingKnowledgePointIds??[],priorNot=prior.notSelectableKnowledgePointIds??[];
const newlyVisible=G3A_U05_P05F22_KP_IDS.filter(id=>!priorVisible.includes(id));
const removedHidden=G3A_U05_P05F22_KP_IDS.filter(id=>priorHidden.includes(id)),removedNot=G3A_U05_P05F22_KP_IDS.filter(id=>priorNot.includes(id));
const visibleKnowledgePointIds=Object.freeze([...new Set([...priorVisible,...G3A_U05_P05F22_KP_IDS])]);
const hiddenPendingKnowledgePointIds=Object.freeze([...new Set([...priorHidden.filter(id=>!G3A_U05_P05F22_KP_IDS.includes(id)),...G3A_U05_P05F22_REMAINING_FUTURE_KP_IDS.filter(id=>!visibleKnowledgePointIds.includes(id))])]);
const notSelectableKnowledgePointIds=Object.freeze([...new Set([...priorNot.filter(id=>!G3A_U05_P05F22_KP_IDS.includes(id)),...G3A_U05_P05F22_REMAINING_FUTURE_KP_IDS.filter(id=>!visibleKnowledgePointIds.includes(id))])]);
const bySourceId=Object.freeze({...b.bySourceId,[G3A_U05_P05F22_SOURCE_ID]:Object.freeze({...prior,visibleCount:visibleKnowledgePointIds.length,hiddenPendingCount:hiddenPendingKnowledgePointIds.length,notSelectableCount:notSelectableKnowledgePointIds.length,visibleKnowledgePointIds,hiddenPendingKnowledgePointIds,notSelectableKnowledgePointIds,publicSelectorStatus:"w5_slice022_angle_property_reasoning_promoted",publicDropdownCutoverTask:"P05F_W5DirectProductVerticalSlice022Implementation"})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+newlyVisible.length,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-removedHidden.length),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-removedNot.length),bySourceId});
export function listVisibleBatchAKnowledgePoints(){const rows=[...base.listVisibleBatchAKnowledgePoints()];for(const row of G3A_U05_P05F22_SELECTOR_ROWS)if(!rows.some(existing=>existing.knowledgePointId===row.knowledgePointId))rows.push(clone(row));return rows;}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId]??base.listBatchAKnowledgePointAvailabilityBySource(sourceId));}
export function getVisibleBatchAKnowledgePoint(id){if(G3A_U05_P05F22_KP_IDS.includes(id))return getG3AU05P05F22SelectorRow(id);return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(G3A_U05_P05F22_KP_IDS.includes(id))return listG3AU05P05F22PatternGroups(id);return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(G3A_U05_P05F22_KP_IDS.includes(id))return mode&&mode!=="diagram"?[]:resolveG3AU05P05F22PatternSpecIds(id);return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP05F22PublicSelectorComposition(){
  const errors=[],rows=listVisibleBatchAKnowledgePoints(),ids=rows.map(row=>row.knowledgePointId),source=listBatchAKnowledgePointAvailabilityBySource(G3A_U05_P05F22_SOURCE_ID);
  const baseAudit=base.auditP05F21PublicSelectorComposition?.();if(baseAudit&&!baseAudit.ok)errors.push(...baseAudit.errors.map(code=>`P05F22_BASE:${code}`));
  if(new Set(ids).size!==ids.length)errors.push("P05F22_DUPLICATE_VISIBLE_KP");
  for(const id of [...G3A_U05_P05F22_PRIOR_VISIBLE_KP_IDS,...G3A_U05_P05F22_KP_IDS])if(!source.visibleKnowledgePointIds.includes(id)||!getVisibleBatchAKnowledgePoint(id))errors.push(`P05F22_REQUIRED_VISIBLE_KP_MISSING:${id}`);
  for(const id of G3A_U05_P05F22_KP_IDS)if(source.hiddenPendingKnowledgePointIds.includes(id)||source.notSelectableKnowledgePointIds.includes(id))errors.push(`P05F22_TARGET_STILL_BLOCKED:${id}`);
  if(source.visibleCount!==4||source.hiddenPendingCount!==0||source.notSelectableCount!==0)errors.push("P05F22_G3A_U05_SOURCE_AVAILABILITY_INVALID");
  if(G3A_U05_P05F22_PATTERN_GROUPS.length!==2||G3A_U05_P05F22_GROUP_IDS.length!==2)errors.push("P05F22_PATTERN_GROUP_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g3aU05Visible:source.visibleCount,g3aU05Hidden:source.hiddenPendingCount,g3aU05NotSelectable:source.notSelectableCount})});
}
