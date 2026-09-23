export * from "./batch-a-selector-p04f34-extension.js";
import * as base from "./batch-a-selector-p04f34-extension.js";
import {G6A_U02_P04F35_SOURCE_ID,G6A_U02_P04F35_KP_ID,G6A_U02_P04F35_FUTURE_KP_IDS,auditG6AU02P04F35SelectorProjection,getG6AU02P04F35SelectorRow,listG6AU02P04F35PatternGroups,listG6AU02P04F35SelectorRows,resolveG6AU02P04F35PatternSpecIds} from "./g6a-u02-integer-divided-by-fraction-selector-projection-p04f35.js";

const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const rows=Object.freeze(listG6AU02P04F35SelectorRows().map(row=>Object.freeze(row)));
const prior=base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G6A_U02_P04F35_SOURCE_ID]??{};
const priorVisible=base.listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===G6A_U02_P04F35_SOURCE_ID).map(row=>row.knowledgePointId);
const visibleKnowledgePointIds=Object.freeze([...new Set([...priorVisible,G6A_U02_P04F35_KP_ID])]);
const hiddenPendingKnowledgePointIds=Object.freeze([...new Set([...(prior.hiddenPendingKnowledgePointIds??[]).filter(id=>id!==G6A_U02_P04F35_KP_ID),...G6A_U02_P04F35_FUTURE_KP_IDS])]);
const notSelectableKnowledgePointIds=Object.freeze([...new Set([...(prior.notSelectableKnowledgePointIds??[]).filter(id=>id!==G6A_U02_P04F35_KP_ID),...G6A_U02_P04F35_FUTURE_KP_IDS])]);

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA=base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount:Number(base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount??307)+1,
  bySourceId:Object.freeze({...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,[G6A_U02_P04F35_SOURCE_ID]:Object.freeze({...prior,sourceId:G6A_U02_P04F35_SOURCE_ID,visibleCount:3,hiddenPendingCount:2,notSelectableCount:2,visibleKnowledgePointIds,hiddenPendingKnowledgePointIds,notSelectableKnowledgePointIds,publicSelectorStatus:"p04f35_integer_divided_by_fraction_promoted",canonicalReachableKnowledgePointCount:3,canonicalReachableKnowledgePointIds:visibleKnowledgePointIds,publicDropdownCutoverTask:"P04F35_Q035_SourceBackedNumericImplementation"})}),
});
export function listVisibleBatchAKnowledgePoints(){const combined=[...base.listVisibleBatchAKnowledgePoints(),...rows.map(clone)],seen=new Set();return combined.filter(row=>{if(seen.has(row.knowledgePointId))return false;seen.add(row.knowledgePointId);return true;});}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return sourceId===G6A_U02_P04F35_SOURCE_ID?clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]):base.listBatchAKnowledgePointAvailabilityBySource(sourceId);}
export function getVisibleBatchAKnowledgePoint(id){return getG6AU02P04F35SelectorRow(id)??base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){const groups=listG6AU02P04F35PatternGroups(id);return groups.length?groups:base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){const row=getG6AU02P04F35SelectorRow(id);if(!row)return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);const normalized=mode==null?null:String(mode).toLowerCase();return normalized==null||normalized==="numeric"?resolveG6AU02P04F35PatternSpecIds(id):[];}
export function auditP04F35PublicSelectorComposition(){
  const errors=[...auditG6AU02P04F35SelectorProjection().errors],all=listVisibleBatchAKnowledgePoints(),ids=all.map(row=>row.knowledgePointId),availability=listBatchAKnowledgePointAvailabilityBySource(G6A_U02_P04F35_SOURCE_ID);
  if(new Set(ids).size!==ids.length)errors.push("P04F35_SELECTOR_DUPLICATE_KP");
  if(!availability?.visibleKnowledgePointIds?.includes(G6A_U02_P04F35_KP_ID))errors.push("P04F35_TARGET_KP_NOT_VISIBLE");
  for(const id of G6A_U02_P04F35_FUTURE_KP_IDS)if(!availability?.hiddenPendingKnowledgePointIds?.includes(id)||!availability?.notSelectableKnowledgePointIds?.includes(id)||availability?.visibleKnowledgePointIds?.includes(id))errors.push(`P04F35_FUTURE_KP_BOUNDARY_INVALID:${id}`);
  if(availability?.visibleCount!==3||availability?.hiddenPendingCount!==2||availability?.notSelectableCount!==2)errors.push("P04F35_G6A_U02_AVAILABILITY_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==43||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==43)errors.push("P04F35_PUBLIC_SOURCE_COUNT_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.visibleCount!==308)errors.push("P04F35_PUBLIC_KP_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:BATCH_A_SELECTOR_AVAILABILITY.sourceCount,knowledgePoints:BATCH_A_SELECTOR_AVAILABILITY.visibleCount,g6aU02Visible:availability?.visibleCount??0,g6aU02Hidden:availability?.hiddenPendingCount??0,g6aU02NotSelectable:availability?.notSelectableCount??0})});
}
