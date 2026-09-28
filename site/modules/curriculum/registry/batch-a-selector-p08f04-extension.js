export * from "./batch-a-selector-p08f03-extension.js";
import * as base from "./batch-a-selector-p08f03-extension.js";
import {
  G5A_U05A1_P08F04_KP_ID as KP,
  G5A_U05A1_P08F04_PRIOR_KP_IDS as PRIOR,
  G5A_U05A1_P08F04_PROTECTED_FUTURE_KP_IDS as FUTURE,
  G5A_U05A1_P08F04_SOURCE_ID as SRC,
  getG5AU05A1P08F04SelectorRow as row,
  listG5AU05A1P08F04PatternGroups as groups,
  resolveG5AU05A1P08F04PatternSpecIds as specs
} from "./g5a-u05a1-central-angle-measurement-selector-projection-p08f04.js";

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const b=base.BATCH_A_SELECTOR_AVAILABILITY;
const p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P08F04_EXPECTED_EXISTING_G5A_U05A1_SOURCE_ROW");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP))throw new Error("P08F04_TARGET_NOT_PENDING_IN_PRIOR_SELECTOR");
if(PRIOR.some(id=>!pv.includes(id)))throw new Error("P08F04_PRIOR_OWNER_VISIBILITY_INVALID");
if(FUTURE.some(id=>!ph.includes(id)||!pn.includes(id)))throw new Error("P08F04_FUTURE_OWNER_PENDING_INVALID");

const visible=Object.freeze([...new Set([...pv,KP])]);
const hidden=Object.freeze(ph.filter(id=>id!==KP));
const not=Object.freeze(pn.filter(id=>id!==KP));
const source=Object.freeze({
  ...p,
  sourceId:SRC,
  visibleCount:visible.length,
  hiddenPendingCount:hidden.length,
  notSelectableCount:not.length,
  visibleKnowledgePointIds:visible,
  hiddenPendingKnowledgePointIds:hidden,
  notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w8_slice004_g5a_u05a1_central_angle_measurement_promoted",
  publicDropdownCutoverTask:"P08F_W8DirectProductVerticalSlice004Implementation",
  q004AddedKnowledgePointIds:Object.freeze([KP]),
  protectedPriorOwnerKnowledgePointIds:PRIOR,
  remainingProtectedKnowledgePointIds:FUTURE,
  sameSourceCandidateSetComplete:false,
  sameUnitMixedAllowed:false,
  w8FrozenQueueComplete:false
});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({
  ...b,
  visibleCount:Number(b.visibleCount??0)+1,
  hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),
  notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),
  bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})
});
export function listVisibleBatchAKnowledgePoints(){
  const r=[...base.listVisibleBatchAKnowledgePoints()];
  if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));
  return r;
}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="diagram"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP08F04PublicSelectorComposition(){
  const e=[],ba=base.auditP08F03PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P08F04_BASE:"+x));
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P08F04_TARGET_VISIBILITY_INVALID");
  for(const id of PRIOR)if(!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id))e.push("P08F04_PRIOR_OWNER_LOST:"+id);
  for(const id of FUTURE)if(ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id))e.push("P08F04_FUTURE_OWNER_SCOPE_INVALID:"+id);
  if(s.visibleCount!==pv.length+1||s.hiddenPendingCount!==Math.max(0,ph.length-1)||s.notSelectableCount!==Math.max(0,pn.length-1)||s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w8FrozenQueueComplete!==false)e.push("P08F04_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q004VisibleDelta:1,sourceVisibleCount:s.visibleCount,protectedPriorOwners:PRIOR.length,remainingProtected:FUTURE.length})});
}
