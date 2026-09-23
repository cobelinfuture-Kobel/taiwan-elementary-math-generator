export * from "./batch-a-selector-p07f14-extension.js";
import * as base from "./batch-a-selector-p07f14-extension.js";
import {G6B_U05_P07F15_PREDECESSOR_VISIBLE_KP_IDS as PREDECESSORS,G6B_U05_P07F15_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6B_U05_P07F15_SOURCE_ID as SRC,G6B_U05_P07F15_TARGET_KP_IDS as TARGETS,getG6BU05P07F15SelectorRow as row,listG6BU05P07F15PatternGroups as groups,resolveG6BU05P07F15PatternSpecIds as specs} from "./g6b-u05-factor-multiple-selector-projection-p07f15.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F15_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(!PREDECESSORS.every(id=>pv.includes(id))||TARGETS.some(id=>pv.includes(id)||!ph.includes(id)||!pn.includes(id))||PROTECTED.some(id=>pv.includes(id)||!ph.includes(id)||!pn.includes(id)))throw new Error("P07F15_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,...TARGETS])]),hidden=Object.freeze([...new Set([...ph.filter(id=>!TARGETS.includes(id)),...PROTECTED])]),not=Object.freeze([...new Set([...pn.filter(id=>!TARGETS.includes(id)),...PROTECTED])]);
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w7_slice015_g6b_u05_factor_multiple_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice015Implementation",q015AddedKnowledgePointIds:TARGETS,remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=hidden.length-ph.length,notDelta=not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+TARGETS.length,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];for(const id of TARGETS)if(!r.some(x=>x.knowledgePointId===id))r.push(clone(row(id)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(TARGETS.includes(id))return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(TARGETS.includes(id))return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(TARGETS.includes(id))return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F15PublicSelectorComposition(){
  const e=[],ba=base.auditP07F14PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F15_BASE:"+x));
  if(!PREDECESSORS.every(id=>ids.includes(id)))e.push("P07F15_PREDECESSOR_VISIBILITY_MISSING");
  if(!TARGETS.every(id=>ids.includes(id)&&getVisibleBatchAKnowledgePoint(id)&&!s.hiddenPendingKnowledgePointIds.includes(id)&&!s.notSelectableKnowledgePointIds.includes(id)))e.push("P07F15_TARGET_VISIBILITY_INVALID");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P07F15_PROTECTED_VISIBILITY_INVALID");
  if(s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F15_SOURCE_SCOPE_INVALID");
  if(ids.length!==PREDECESSORS.length+TARGETS.length)e.push("P07F15_SOURCE_VISIBLE_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q015VisibleDelta:2,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
