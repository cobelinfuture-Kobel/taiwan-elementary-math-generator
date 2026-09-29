export * from "./batch-a-selector-p08f18-extension.js";
import * as base from "./batch-a-selector-p08f18-extension.js";
import {
  G6A_U07_P08F19_FUTURE_KP_IDS as FUTURE,
  G6A_U07_P08F19_KP_ID as KP,
  G6A_U07_P08F19_PRIOR_KP_IDS as PRIOR,
  G6A_U07_P08F19_SOURCE_ID as SRC,
  getG6AU07P08F19SelectorRow as row,
  listG6AU07P08F19PatternGroups as groups,
  resolveG6AU07P08F19PatternSpecIds as specs
} from "./g6a-u07-sector-area-selector-projection-p08f19.js";

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P08F19_EXPECTED_EXISTING_G6A_U07_SOURCE_ROW");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP))throw new Error("P08F19_TARGET_NOT_PENDING_IN_PRIOR_SELECTOR");
if(PRIOR.some(id=>!pv.includes(id)))throw new Error("P08F19_PRIOR_OWNER_VISIBILITY_INVALID");
if(FUTURE.some(id=>!ph.includes(id)||!pn.includes(id)||pv.includes(id)))throw new Error("P08F19_FUTURE_OWNER_PENDING_STATE_INVALID");

const visible=Object.freeze([...new Set([...pv,KP])]);
const hidden=Object.freeze(ph.filter(id=>id!==KP));
const not=Object.freeze(pn.filter(id=>id!==KP));
const source=Object.freeze({
  ...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,
  visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w8_slice019_g6a_u07_sector_area_promoted",publicDropdownCutoverTask:"P08F_W8DirectProductVerticalSlice019Implementation",
  q019AddedKnowledgePointIds:Object.freeze([KP]),protectedPriorOwnerKnowledgePointIds:PRIOR,remainingProtectedKnowledgePointIds:FUTURE,
  sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w8FrozenQueueComplete:false
});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({
  ...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),
  notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})
});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="diagram"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP08F19PublicSelectorComposition(){
  const e=[],ba=base.auditP08F18PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P08F19_BASE:"+x));
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P08F19_TARGET_VISIBILITY_INVALID");
  for(const id of PRIOR)if(!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id))e.push("P08F19_PRIOR_OWNER_LOST:"+id);
  for(const id of FUTURE)if(!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)||ids.includes(id))e.push("P08F19_FUTURE_OWNER_SCOPE_INVALID:"+id);
  if(ids.filter(id=>id.startsWith("kp_g6a_u07_")).length!==4||s.remainingProtectedKnowledgePointIds.length!==1||s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w8FrozenQueueComplete!==false)e.push("P08F19_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q019VisibleDelta:1,sourceVisibleCount:s.visibleCount,protectedPriorOwners:PRIOR.length,remainingProtected:FUTURE.length})});
}
