export * from "./batch-a-selector-p08f21-extension.js";
import * as base from "./batch-a-selector-p08f21-extension.js";
import {G6A_U08_P08F22_KP_ID as KP,G6A_U08_P08F22_PRIOR_OWNER_KP_IDS as PRIOR,G6A_U08_P08F22_SOURCE_ID as SRC,
  getG6AU08P08F22SelectorRow as row,listG6AU08P08F22PatternGroups as groups,resolveG6AU08P08F22PatternSpecIds as specs}
from "./g6a-u08-speed-unit-conversion-selector-projection-p08f22.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P08F22_EXPECTED_EXISTING_G6A_U08_SOURCE_ROW");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP))throw new Error("P08F22_TARGET_NOT_PENDING_IN_PRIOR_SELECTOR");
if(PRIOR.some(id=>!pv.includes(id)))throw new Error("P08F22_PRIOR_OWNER_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze(ph.filter(id=>id!==KP)),not=Object.freeze(pn.filter(id=>id!==KP));
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,
  visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w8_slice022_g6a_u08_speed_unit_conversion_promoted",publicDropdownCutoverTask:"P08F_W8DirectProductVerticalSlice022Implementation",
  q022AddedKnowledgePointIds:Object.freeze([KP]),protectedPriorOwnerKnowledgePointIds:PRIOR,remainingProtectedKnowledgePointIds:Object.freeze([]),
  sameSourceCandidateSetComplete:true,sameUnitMixedAllowed:false,w8FrozenQueueComplete:true,finalFrozenW8Slice:true});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,
  hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP08F22PublicSelectorComposition(){
  const e=[],ba=base.auditP08F21PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P08F22_BASE:"+x));
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P08F22_TARGET_VISIBILITY_INVALID");
  for(const id of PRIOR)if(!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id))e.push("P08F22_PRIOR_OWNER_LOST:"+id);
  if(s.visibleCount!==5||s.remainingProtectedKnowledgePointIds.length!==0||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP)||
    s.sameSourceCandidateSetComplete!==true||s.sameUnitMixedAllowed!==false||s.w8FrozenQueueComplete!==true||s.finalFrozenW8Slice!==true)e.push("P08F22_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q022VisibleDelta:1,sourceVisibleCount:s.visibleCount,protectedPriorOwners:PRIOR.length,remainingProtected:0,w8FrozenQueueComplete:true})});
}
