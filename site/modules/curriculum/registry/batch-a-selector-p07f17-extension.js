export * from "./batch-a-selector-p07f16-extension.js";
import * as base from "./batch-a-selector-p07f16-extension.js";
import {G6A_U07_P07F17_KP_ID as KP,G6A_U07_P07F17_PREDECESSOR_VISIBLE_KP_IDS as PREDECESSORS,G6A_U07_P07F17_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U07_P07F17_SOURCE_ID as SRC,getG6AU07P07F17SelectorRow as row,listG6AU07P07F17PatternGroups as groups,resolveG6AU07P07F17PatternSpecIds as specs} from "./g6a-u07-annulus-area-selector-projection-p07f17.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F17_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(!PREDECESSORS.every(id=>pv.includes(id))||pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP))throw new Error("P07F17_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...PROTECTED])]),not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...PROTECTED])]);
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice017_g6a_u07_annulus_area_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice017Implementation",
  q017AddedKnowledgePointIds:Object.freeze([KP]),remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=hidden.length-ph.length,notDelta=not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="diagram"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F17PublicSelectorComposition(){
  const e=[],ba=base.auditP07F16PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F17_BASE:"+x));if(!PREDECESSORS.every(id=>ids.includes(id)))e.push("P07F17_PREDECESSOR_VISIBILITY_MISSING");
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P07F17_TARGET_VISIBILITY_INVALID");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P07F17_PROTECTED_VISIBILITY_INVALID");
  if(s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F17_SOURCE_SCOPE_INVALID");
  if(ids.filter(id=>id.startsWith("kp_g6a_u07_")).length!==3)e.push("P07F17_SOURCE_VISIBLE_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q017VisibleDelta:1,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
