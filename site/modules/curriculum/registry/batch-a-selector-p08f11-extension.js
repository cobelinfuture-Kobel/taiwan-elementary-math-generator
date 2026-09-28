export * from "./batch-a-selector-p08f10-extension.js";
import * as base from "./batch-a-selector-p08f10-extension.js";
import {G5A_U07_P08F11_KP_ID as KP,G5A_U07_P08F11_PRIOR_KP_IDS as PRIOR,G5A_U07_P08F11_SOURCE_ID as SRC,getG5AU07P08F11SelectorRow as row,listG5AU07P08F11PatternGroups as groups,resolveG5AU07P08F11PatternSpecIds as specs} from "./g5a-u07-coordinate-reflection-selector-projection-p08f11.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P08F11_EXPECTED_EXISTING_G5A_U07_SOURCE_ROW");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP))throw new Error("P08F11_TARGET_NOT_PENDING_IN_PRIOR_SELECTOR");
if(PRIOR.some(id=>!pv.includes(id)))throw new Error("P08F11_PRIOR_OWNER_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze(ph.filter(id=>id!==KP)),not=Object.freeze(pn.filter(id=>id!==KP));
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w8_slice011_g5a_u07_coordinate_reflection_promoted",publicDropdownCutoverTask:"P08F_W8DirectProductVerticalSlice011Implementation",q011AddedKnowledgePointIds:Object.freeze([KP]),protectedPriorOwnerKnowledgePointIds:PRIOR,remainingProtectedKnowledgePointIds:Object.freeze([]),sameSourceCandidateSetComplete:true,sameUnitMixedAllowed:false,w8FrozenQueueComplete:false});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="diagram"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP08F11PublicSelectorComposition(){
 const e=[],ba=base.auditP08F10PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
 if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P08F11_BASE:"+x));
 if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P08F11_TARGET_VISIBILITY_INVALID");
 for(const id of PRIOR)if(!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id))e.push("P08F11_PRIOR_OWNER_LOST:"+id);
 if(s.visibleCount!==pv.length+1||s.hiddenPendingCount!==Math.max(0,ph.length-1)||s.notSelectableCount!==Math.max(0,pn.length-1)||s.sameSourceCandidateSetComplete!==true||s.sameUnitMixedAllowed!==false||s.w8FrozenQueueComplete!==false)e.push("P08F11_SOURCE_SCOPE_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q011VisibleDelta:1,sourceVisibleCount:s.visibleCount,protectedPriorOwners:PRIOR.length,remainingProtected:0})});
}
