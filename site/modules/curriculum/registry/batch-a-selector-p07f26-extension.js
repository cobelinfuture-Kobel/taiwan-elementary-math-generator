export * from "./batch-a-selector-p07f25-extension.js";
import * as base from "./batch-a-selector-p07f25-extension.js";
import {
  G6A_U08_P07F26_KP_ID as KP,
  G6A_U08_P07F26_PROTECTED_NON_W7_KP_IDS as PROTECTED,
  G6A_U08_P07F26_SOURCE_ID as SRC,
  getG6AU08P07F26SelectorRow as row,
  listG6AU08P07F26PatternGroups as groups,
  resolveG6AU08P07F26PatternSpecIds as specs
} from "./g6a-u08-effective-speed-current-wind-selector-projection-p07f26.js";

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F26_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP))throw new Error("P07F26_BASE_TARGET_VISIBILITY_INVALID");
if(PROTECTED.some(id=>pv.includes(id)))throw new Error("P07F26_BASE_PROTECTED_VISIBILITY_INVALID");
const visible=Object.freeze([...pv,KP]);
const hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...PROTECTED])]);
const not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...PROTECTED])]);
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,
  visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice026_g6a_u08_effective_speed_current_wind_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice026Implementation",
  q026AddedKnowledgePointIds:Object.freeze([KP]),remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,
  sameUnitMixedAllowed:false,w7FrozenQueueComplete:true});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,
  hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),
  bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F26PublicSelectorComposition(){
  const e=[],ba=base.auditP07F25PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),
    ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F26_BASE:"+x));
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP)||s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))
    e.push("P07F26_TARGET_VISIBILITY_INVALID");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))
    e.push("P07F26_PROTECTED_VISIBILITY_INVALID");
  if(s.visibleCount!==4||s.hiddenPendingCount!==1||s.notSelectableCount!==1||s.sameSourceCandidateSetComplete!==false||
    s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==true)e.push("P07F26_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q026VisibleDelta:1,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length,w7FrozenQueueComplete:s.w7FrozenQueueComplete})});
}
