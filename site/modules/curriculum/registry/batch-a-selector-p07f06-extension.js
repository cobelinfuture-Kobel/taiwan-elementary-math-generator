export * from "./batch-a-selector-p07f05-extension.js";
import * as base from "./batch-a-selector-p07f05-extension.js";
import {G6A_U06_P07F06_KP_ID as KP,G6A_U06_P07F06_PREDECESSOR_KP_IDS as PREDECESSORS,G6A_U06_P07F06_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U06_P07F06_SOURCE_ID as SRC,getG6AU06P07F06SelectorRow as row,listG6AU06P07F06PatternGroups as groups,resolveG6AU06P07F06PatternSpecIds as specs} from "./g6a-u06-circle-circumference-formula-selector-projection-p07f06.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F06_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(!PREDECESSORS.every(id=>pv.includes(id))||pv.includes(KP)||PROTECTED.some(id=>pv.includes(id)))throw new Error("P07F06_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]);
const hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...PROTECTED])]);
const not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...PROTECTED])]);
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w7_slice006_g6a_u06_circle_circumference_formula_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice006Implementation",q006AddedKnowledgePointIds:Object.freeze([KP]),remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=hidden.length-ph.length,notDelta=not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="diagram"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F06PublicSelectorComposition(){
  const e=[],ba=base.auditP07F05PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F06_BASE:"+x));
  if(!PREDECESSORS.every(id=>ids.includes(id))||!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP))e.push("P07F06_TARGET_VISIBLE_MISSING");
  if(s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P07F06_TARGET_STILL_HIDDEN");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P07F06_PROTECTED_VISIBILITY_INVALID");
  if(s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F06_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q006VisibleDelta:1,sourceDelta:0,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
