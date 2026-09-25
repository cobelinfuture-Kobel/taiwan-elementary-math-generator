export * from "./batch-a-selector-p07f22-extension.js";
import * as base from "./batch-a-selector-p07f22-extension.js";
import {
  G6A_U08_P07F23_KP_ID as KP,
  G6A_U08_P07F23_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G6A_U08_P07F23_SOURCE_ID as SRC,
  getG6AU08P07F23SelectorRow as row,
  listG6AU08P07F23PatternGroups as groups,
  resolveG6AU08P07F23PatternSpecIds as specs
} from "./g6a-u08-speed-distance-time-selector-projection-p07f23.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
const pv=p?.visibleKnowledgePointIds??[],ph=p?.hiddenPendingKnowledgePointIds??[],pn=p?.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||PROTECTED.some(id=>pv.includes(id)))throw new Error("P07F23_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]);
const hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...PROTECTED])]);
const not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...PROTECTED])]);
const sourceAdded=p?0:1;
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,
  visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice023_g6a_u08_speed_distance_time_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice023Implementation",
  q023AddedKnowledgePointIds:Object.freeze([KP]),remainingProtectedKnowledgePointIds:PROTECTED,
  sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=p?hidden.length-ph.length:hidden.length,notDelta=p?not.length-pn.length:not.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,
  sourceCount:Number(b.sourceCount??0)+sourceAdded,publicSourceCount:Number(b.publicSourceCount??b.sourceCount??0)+sourceAdded,
  visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),
  notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F23PublicSelectorComposition(){
  const e=[],ba=base.auditP07F22PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),
    ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F23_BASE:"+x));
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))
    e.push("P07F23_TARGET_VISIBILITY_INVALID");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))
    e.push("P07F23_PROTECTED_VISIBILITY_INVALID");
  if(s.visibleCount!==1||s.hiddenPendingCount!==4||s.notSelectableCount!==4||s.sameSourceCandidateSetComplete!==false||
    s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F23_SOURCE_SCOPE_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==Number(b.sourceCount??0)+sourceAdded)e.push("P07F23_SOURCE_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q023VisibleDelta:1,sourceDelta:sourceAdded,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
