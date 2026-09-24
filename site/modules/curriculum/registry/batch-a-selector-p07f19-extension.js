export * from "./batch-a-selector-p07f18-extension.js";
import * as base from "./batch-a-selector-p07f18-extension.js";
import {G6B_U04_P07F19_KP_ID as KP,G6B_U04_P07F19_PROTECTED_FUTURE_KP_IDS as PROTECTED,G6B_U04_P07F19_SOURCE_ID as SRC,getG6BU04P07F19SelectorRow as row,listG6BU04P07F19PatternGroups as groups,resolveG6BU04P07F19PatternSpecIds as specs} from "./g6b-u04-base-comparison-rate-roles-selector-projection-p07f19.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
const pv=p?.visibleKnowledgePointIds??[],ph=p?.hiddenPendingKnowledgePointIds??[],pn=p?.notSelectableKnowledgePointIds??[];
if(pv.includes(KP)||PROTECTED.some(id=>pv.includes(id)))throw new Error("P07F19_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...PROTECTED])]),not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...PROTECTED])]);
const sourceAdded=p?0:1;
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice019_g6b_u04_base_comparison_rate_roles_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice019Implementation",
  q019AddedKnowledgePointIds:Object.freeze([KP]),remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=p?hidden.length-ph.length:hidden.length,notDelta=p?not.length-pn.length:not.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,sourceCount:Number(b.sourceCount??0)+sourceAdded,publicSourceCount:Number(b.publicSourceCount??b.sourceCount??0)+sourceAdded,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F19PublicSelectorComposition(){
  const e=[],ba=base.auditP07F18PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F19_BASE:"+x));
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP))e.push("P07F19_TARGET_VISIBLE_MISSING");
  if(s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P07F19_TARGET_STILL_HIDDEN");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P07F19_PROTECTED_VISIBILITY_INVALID");
  if(s.visibleCount!==1||s.hiddenPendingCount!==4||s.notSelectableCount!==4||s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F19_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q019VisibleDelta:1,sourceDelta:sourceAdded,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
