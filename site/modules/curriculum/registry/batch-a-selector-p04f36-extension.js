export * from "./batch-a-selector-p04f35-extension.js";
import * as base from "./batch-a-selector-p04f35-extension.js";
import {G6A_U02_P04F36_SOURCE_ID,G6A_U02_P04F36_KP_ID,G6A_U02_P04F36_FUTURE_KP_IDS,auditG6AU02P04F36SelectorProjection,getG6AU02P04F36SelectorRow,listG6AU02P04F36PatternGroups,listG6AU02P04F36SelectorRows,resolveG6AU02P04F36PatternSpecIds} from "./g6a-u02-fraction-divided-by-fraction-selector-projection-p04f36.js";

const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const rows=Object.freeze(listG6AU02P04F36SelectorRows().map(row=>Object.freeze(row)));
const prior=base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G6A_U02_P04F36_SOURCE_ID]??{};
const priorVisible=base.listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===G6A_U02_P04F36_SOURCE_ID).map(row=>row.knowledgePointId);
const visibleKnowledgePointIds=Object.freeze([...new Set([...priorVisible,G6A_U02_P04F36_KP_ID])]);
const hiddenPendingKnowledgePointIds=Object.freeze([...new Set([...(prior.hiddenPendingKnowledgePointIds??[]).filter(id=>id!==G6A_U02_P04F36_KP_ID),...G6A_U02_P04F36_FUTURE_KP_IDS])]);
const notSelectableKnowledgePointIds=Object.freeze([...new Set([...(prior.notSelectableKnowledgePointIds??[]).filter(id=>id!==G6A_U02_P04F36_KP_ID),...G6A_U02_P04F36_FUTURE_KP_IDS])]);

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA=base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount:Number(base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount??308)+1,
  bySourceId:Object.freeze({...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,[G6A_U02_P04F36_SOURCE_ID]:Object.freeze({...prior,sourceId:G6A_U02_P04F36_SOURCE_ID,visibleCount:4,hiddenPendingCount:1,notSelectableCount:1,visibleKnowledgePointIds,hiddenPendingKnowledgePointIds,notSelectableKnowledgePointIds,publicSelectorStatus:"p04f36_fraction_divided_by_fraction_promoted",canonicalReachableKnowledgePointCount:4,canonicalReachableKnowledgePointIds:visibleKnowledgePointIds,publicDropdownCutoverTask:"P04F36_Q036_SourceBackedNumericImplementation"})}),
});
export function listVisibleBatchAKnowledgePoints(){const combined=[...base.listVisibleBatchAKnowledgePoints(),...rows.map(clone)],seen=new Set();return combined.filter(row=>{if(seen.has(row.knowledgePointId))return false;seen.add(row.knowledgePointId);return true;});}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return sourceId===G6A_U02_P04F36_SOURCE_ID?clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]):base.listBatchAKnowledgePointAvailabilityBySource(sourceId);}
export function getVisibleBatchAKnowledgePoint(id){return getG6AU02P04F36SelectorRow(id)??base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){const groups=listG6AU02P04F36PatternGroups(id);return groups.length?groups:base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){const row=getG6AU02P04F36SelectorRow(id);if(!row)return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);const normalized=mode==null?null:String(mode).toLowerCase();return normalized==null||normalized==="numeric"?resolveG6AU02P04F36PatternSpecIds(id):[];}
export function auditP04F36PublicSelectorComposition(){
  const errors=[...auditG6AU02P04F36SelectorProjection().errors],all=listVisibleBatchAKnowledgePoints(),ids=all.map(row=>row.knowledgePointId),availability=listBatchAKnowledgePointAvailabilityBySource(G6A_U02_P04F36_SOURCE_ID);
  if(new Set(ids).size!==ids.length)errors.push("P04F36_SELECTOR_DUPLICATE_KP");
  if(!availability?.visibleKnowledgePointIds?.includes(G6A_U02_P04F36_KP_ID))errors.push("P04F36_TARGET_KP_NOT_VISIBLE");
  for(const id of G6A_U02_P04F36_FUTURE_KP_IDS)if(!availability?.hiddenPendingKnowledgePointIds?.includes(id)||!availability?.notSelectableKnowledgePointIds?.includes(id)||availability?.visibleKnowledgePointIds?.includes(id))errors.push(`P04F36_FUTURE_KP_BOUNDARY_INVALID:${id}`);
  if(availability?.visibleCount!==4||availability?.hiddenPendingCount!==1||availability?.notSelectableCount!==1)errors.push("P04F36_G6A_U02_AVAILABILITY_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==43||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==43)errors.push("P04F36_PUBLIC_SOURCE_COUNT_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==309)errors.push("P04F36_PUBLIC_KP_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g6aU02Visible:availability?.visibleCount??0,g6aU02Hidden:availability?.hiddenPendingCount??0,g6aU02NotSelectable:availability?.notSelectableCount??0})});
}
