export * from "./batch-a-selector-p07f13-extension.js";
import * as base from "./batch-a-selector-p07f13-extension.js";
import {G6A_U07_P07F14_KP_ID as KP,G6A_U07_P07F14_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U07_P07F14_SOURCE_ID as SRC,getG6AU07P07F14SelectorRow as row,listG6AU07P07F14PatternGroups as groups,resolveG6AU07P07F14PatternSpecIds as specs} from "./g6a-u07-circle-area-formula-selector-projection-p07f14.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F14_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||PROTECTED.some(id=>pv.includes(id)))throw new Error("P07F14_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...PROTECTED])]),not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...PROTECTED])]);
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice014_g6a_u07_circle_area_formula_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice014Implementation",
  q014AddedKnowledgePointIds:Object.freeze([KP]),remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=hidden.length-ph.length,notDelta=not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="diagram"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F14PublicSelectorComposition(){
  const e=[],ba=base.auditP07F13PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F14_BASE:"+x));
  if(!ids.includes("kp_g6a_u07_circle_area_derivation"))e.push("P07F14_Q011_PREDECESSOR_VISIBILITY_MISSING");
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP))e.push("P07F14_TARGET_VISIBLE_MISSING");
  if(s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P07F14_TARGET_STILL_HIDDEN");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P07F14_PROTECTED_VISIBILITY_INVALID");
  if(s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F14_SOURCE_SCOPE_INVALID");
  if(ids.filter(id=>id.startsWith("kp_g6a_u07_")).length!==2)e.push("P07F14_SOURCE_VISIBLE_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q014VisibleDelta:1,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
