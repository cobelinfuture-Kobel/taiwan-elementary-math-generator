export * from "./batch-a-selector-p08f16-extension.js";
import * as base from "./batch-a-selector-p08f16-extension.js";
import {
  G6A_U06_P08F17_FUTURE_KP_IDS as FUTURE,
  G6A_U06_P08F17_KP_ID as KP,
  G6A_U06_P08F17_PRIOR_KP_IDS as PRIOR,
  G6A_U06_P08F17_SOURCE_ID as SRC,
  getG6AU06P08F17SelectorRow as row,
  listG6AU06P08F17PatternGroups as groups,
  resolveG6AU06P08F17PatternSpecIds as specs
} from "./g6a-u06-composite-arc-perimeter-selector-projection-p08f17.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P08F17_EXPECTED_EXISTING_G6A_U06_SOURCE_ROW");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP))throw new Error("P08F17_TARGET_NOT_PENDING_IN_PRIOR_SELECTOR");
if(PRIOR.some(id=>!pv.includes(id)))throw new Error("P08F17_PRIOR_OWNER_VISIBILITY_INVALID");
if(FUTURE.some(id=>!ph.includes(id)||!pn.includes(id)))throw new Error("P08F17_FUTURE_OWNER_PENDING_STATE_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze(ph.filter(id=>id!==KP)),not=Object.freeze(pn.filter(id=>id!==KP));
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w8_slice017_g6a_u06_composite_arc_perimeter_promoted",publicDropdownCutoverTask:"P08F_W8DirectProductVerticalSlice017Implementation",q017AddedKnowledgePointIds:Object.freeze([KP]),protectedPriorOwnerKnowledgePointIds:PRIOR,remainingProtectedKnowledgePointIds:FUTURE,sameSourceCandidateSetComplete:true,sameUnitMixedAllowed:false,w8FrozenQueueComplete:false});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="diagram"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP08F17PublicSelectorComposition(){
  const e=[],ba=base.auditP08F16PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P08F17_BASE:"+x));
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P08F17_TARGET_VISIBILITY_INVALID");
  for(const id of PRIOR)if(!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id))e.push("P08F17_PRIOR_OWNER_LOST:"+id);
  for(const id of FUTURE)if(!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)||ids.includes(id))e.push("P08F17_FUTURE_OWNER_SCOPE_INVALID:"+id);
  if(s.remainingProtectedKnowledgePointIds.length!==0||s.sameSourceCandidateSetComplete!==true||s.sameUnitMixedAllowed!==false||s.w8FrozenQueueComplete!==false)e.push("P08F17_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q017VisibleDelta:1,sourceVisibleCount:s.visibleCount,protectedPriorOwners:PRIOR.length,remainingProtected:0})});
}
