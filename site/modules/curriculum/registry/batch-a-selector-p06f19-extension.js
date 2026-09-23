export * from "./batch-a-selector-p06f18-extension.js";
import * as base from "./batch-a-selector-p06f18-extension.js";
import {G6B_U05_P06F19_FUTURE_KP_IDS as FUTURE,G6B_U05_P06F19_KP_ID as KP,G6B_U05_P06F19_Q020_RESERVED_KP_IDS as Q020,G6B_U05_P06F19_SOURCE_ID as SRC,getG6BU05P06F19SelectorRow as row,listG6BU05P06F19PatternGroups as groups,resolveG6BU05P06F19PatternSpecIds as specs} from "./g6b-u05-sum-difference-selector-projection-p06f19.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null,sourceAdded=p?0:1,pv=p?.visibleKnowledgePointIds??[],ph=p?.hiddenPendingKnowledgePointIds??[KP,...FUTURE],pn=p?.notSelectableKnowledgePointIds??[KP,...FUTURE];
if(pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP)||FUTURE.some(id=>pv.includes(id)||!ph.includes(id)||!pn.includes(id)))throw new Error("P06F19_BASE_STATE_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...FUTURE])]),not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...FUTURE])]);
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w6_slice019_g6b_u05_sum_difference_promoted",publicDropdownCutoverTask:"P06F_W6DirectProductVerticalSlice019Implementation",q019AddedKnowledgePointIds:Object.freeze([KP]),q020ReservedKnowledgePointIds:Q020,remainingProtectedKnowledgePointIds:FUTURE,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false});
const hiddenDelta=sourceAdded?hidden.length:hidden.length-ph.length,notDelta=sourceAdded?not.length:not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,sourceCount:Number(b.sourceCount??0)+sourceAdded,publicSourceCount:Number(b.publicSourceCount??b.sourceCount??0)+sourceAdded,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP06F19PublicSelectorComposition(){
  const e=[],ba=base.auditP06F18PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P06F19_BASE:"+x));
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP))e.push("P06F19_TARGET_VISIBLE_MISSING");
  if(s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P06F19_TARGET_STILL_HIDDEN");
  if(FUTURE.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P06F19_FUTURE_VISIBILITY_INVALID");
  if(!Q020.every(id=>s.hiddenPendingKnowledgePointIds.includes(id)&&s.notSelectableKnowledgePointIds.includes(id)))e.push("P06F19_Q020_RESERVATION_INVALID");
  if(s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false)e.push("P06F19_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q019VisibleDelta:1,futureProtected:FUTURE.length,q020Reserved:Q020.length,sourceDelta:sourceAdded})});
}
