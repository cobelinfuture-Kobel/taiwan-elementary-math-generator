export * from "./batch-a-selector-p07f01-extension.js";
import * as base from "./batch-a-selector-p07f01-extension.js";
import {G6A_U05_P07F02_KP_ID as KP,G6A_U05_P07F02_PREDECESSOR_KP_IDS as Q001,G6A_U05_P07F02_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6A_U05_P07F02_SOURCE_ID as SRC,getG6AU05P07F02SelectorRow as row,listG6AU05P07F02PatternGroups as groups,resolveG6AU05P07F02PatternSpecIds as specs} from "./g6a-u05-ratio-value-selector-projection-p07f02.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F02_G6A_U05_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(!Q001.every(id=>pv.includes(id))||pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP)||PROTECTED.some(id=>pv.includes(id)))throw new Error("P07F02_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...pv,KP]);
const hidden=Object.freeze(ph.filter(id=>id!==KP));
const not=Object.freeze(pn.filter(id=>id!==KP));
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w7_slice002_g6a_u05_ratio_value_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice002Implementation",q002AddedKnowledgePointIds:Object.freeze([KP]),remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F02PublicSelectorComposition(){
  const e=[],ba=base.auditP07F01PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F02_BASE:"+x));
  if(!Q001.every(id=>ids.includes(id)))e.push("P07F02_Q001_PREDECESSOR_MISSING");
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP))e.push("P07F02_TARGET_VISIBLE_MISSING");
  if(s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P07F02_TARGET_STILL_HIDDEN");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P07F02_PROTECTED_VISIBILITY_INVALID");
  if(s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F02_SOURCE_SCOPE_INVALID");
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==b.sourceCount||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==b.publicSourceCount)e.push("P07F02_SOURCE_COUNT_CHANGED");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q001Visible:Q001.length,q002VisibleDelta:1,sourceDelta:0,remainingProtected:PROTECTED.length})});
}
