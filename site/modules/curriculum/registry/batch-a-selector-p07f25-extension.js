export * from "./batch-a-selector-p07f24-extension.js";
import * as base from "./batch-a-selector-p07f24-extension.js";
import {
  G6A_U08_P07F25_KP_IDS as KPS,
  G6A_U08_P07F25_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G6A_U08_P07F25_SOURCE_ID as SRC,
  getG6AU08P07F25SelectorRow as row,
  listG6AU08P07F25PatternGroups as groups,
  resolveG6AU08P07F25PatternSpecIds as specs
} from "./g6a-u08-average-relative-speed-selector-projection-p07f25.js";

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F25_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(KPS.some(id=>pv.includes(id)||!ph.includes(id)||!pn.includes(id)))throw new Error("P07F25_BASE_TARGET_VISIBILITY_INVALID");
if(PROTECTED.some(id=>pv.includes(id)))throw new Error("P07F25_BASE_PROTECTED_VISIBILITY_INVALID");
const visible=Object.freeze([...pv,...KPS]);
const hidden=Object.freeze([...new Set([...ph.filter(id=>!KPS.includes(id)),...PROTECTED])]);
const not=Object.freeze([...new Set([...pn.filter(id=>!KPS.includes(id)),...PROTECTED])]);
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,
  visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice025_g6a_u08_average_relative_speed_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice025Implementation",
  q025AddedKnowledgePointIds:KPS,remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+KPS.length,
  hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-KPS.length),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-KPS.length),
  bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){
  const r=[...base.listVisibleBatchAKnowledgePoints()];
  for(const id of KPS)if(!r.some(x=>x.knowledgePointId===id))r.push(clone(row(id)));
  return r;
}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(KPS.includes(id))return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(KPS.includes(id))return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(KPS.includes(id))return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F25PublicSelectorComposition(){
  const e=[],ba=base.auditP07F24PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),
    ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F25_BASE:"+x));
  for(const id of KPS)if(!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id)||s.hiddenPendingKnowledgePointIds.includes(id)||s.notSelectableKnowledgePointIds.includes(id))
    e.push("P07F25_TARGET_VISIBILITY_INVALID:"+id);
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))
    e.push("P07F25_PROTECTED_VISIBILITY_INVALID");
  if(s.visibleCount!==3||s.hiddenPendingCount!==2||s.notSelectableCount!==2||s.sameSourceCandidateSetComplete!==false||
    s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F25_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q025VisibleDelta:2,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
