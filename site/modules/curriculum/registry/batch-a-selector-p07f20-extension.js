export * from "./batch-a-selector-p07f19-extension.js";
import * as base from "./batch-a-selector-p07f19-extension.js";
import {G6B_U05_P07F20_KP_ID as KP,G6B_U05_P07F20_PREDECESSOR_VISIBLE_KP_IDS as PREDECESSORS,G6B_U05_P07F20_SOURCE_ID as SRC,getG6BU05P07F20SelectorRow as row,listG6BU05P07F20PatternGroups as groups,resolveG6BU05P07F20PatternSpecIds as specs} from "./g6b-u05-work-distribution-selector-projection-p07f20.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F20_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(!PREDECESSORS.every(id=>pv.includes(id))||pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP))throw new Error("P07F20_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze(ph.filter(id=>id!==KP)),not=Object.freeze(pn.filter(id=>id!==KP));
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice020_g6b_u05_work_distribution_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice020Implementation",
  q020AddedKnowledgePointIds:Object.freeze([KP]),remainingProtectedKnowledgePointIds:Object.freeze([]),sameSourceCandidateSetComplete:true,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=hidden.length-ph.length,notDelta=not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F20PublicSelectorComposition(){
  const e=[],ba=base.auditP07F19PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F20_BASE:"+x));
  if(!PREDECESSORS.every(id=>ids.includes(id)))e.push("P07F20_PREDECESSOR_VISIBILITY_MISSING");
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P07F20_TARGET_VISIBILITY_INVALID");
  if(ids.length!==5||s.visibleCount!==5||s.hiddenPendingCount!==0||s.notSelectableCount!==0||s.sameSourceCandidateSetComplete!==true||s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F20_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q020VisibleDelta:1,sourceVisibleCount:s.visibleCount,remainingProtected:0,sameSourceCandidateSetComplete:s.sameSourceCandidateSetComplete})});
}
