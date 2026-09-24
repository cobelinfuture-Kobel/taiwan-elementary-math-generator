export * from "./batch-a-selector-p07f21-extension.js";
import * as base from "./batch-a-selector-p07f21-extension.js";
import {
  G6B_U04_P07F22_PREDECESSOR_KP_ID as PREDECESSOR,
  G6B_U04_P07F22_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G6B_U04_P07F22_SOURCE_ID as SRC,
  G6B_U04_P07F22_TARGET_KP_IDS as TARGETS,
  getG6BU04P07F22SelectorRow as row,
  listG6BU04P07F22PatternGroups as groups,
  resolveG6BU04P07F22PatternSpecIds as specs
} from "./g6b-u04-three-rate-quantity-relations-selector-projection-p07f22.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F22_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(!pv.includes(PREDECESSOR)||TARGETS.some(id=>pv.includes(id)||!ph.includes(id)||!pn.includes(id))||
  PROTECTED.some(id=>pv.includes(id)||!ph.includes(id)||!pn.includes(id)))throw new Error("P07F22_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,...TARGETS])]),hidden=Object.freeze(ph.filter(id=>!TARGETS.includes(id))),not=Object.freeze(pn.filter(id=>!TARGETS.includes(id)));
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,
  visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice022_g6b_u04_three_rate_quantity_relations_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice022Implementation",
  q022AddedKnowledgePointIds:TARGETS,q019PredecessorKnowledgePointIds:Object.freeze([PREDECESSOR]),remainingProtectedKnowledgePointIds:PROTECTED,
  sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=hidden.length-ph.length,notDelta=not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+TARGETS.length,
  hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),
  bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];for(const id of TARGETS)if(!r.some(x=>x.knowledgePointId===id))r.push(clone(row(id)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(TARGETS.includes(id))return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(TARGETS.includes(id))return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(TARGETS.includes(id))return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F22PublicSelectorComposition(){
  const e=[],ba=base.auditP07F21PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),
    ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F22_BASE:"+x));
  if(!ids.includes(PREDECESSOR))e.push("P07F22_PREDECESSOR_VISIBILITY_MISSING");
  if(TARGETS.some(id=>!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id)||s.hiddenPendingKnowledgePointIds.includes(id)||s.notSelectableKnowledgePointIds.includes(id)))
    e.push("P07F22_TARGET_VISIBILITY_INVALID");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))
    e.push("P07F22_PROTECTED_VISIBILITY_INVALID");
  if(ids.length!==4||s.visibleCount!==4||s.hiddenPendingCount!==1||s.notSelectableCount!==1||s.sameSourceCandidateSetComplete!==false||
    s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F22_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({predecessorVisible:1,q022VisibleDelta:3,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
