export * from "./batch-a-selector-p06f19-extension.js";
import * as base from "./batch-a-selector-p06f19-extension.js";
import {G6B_U05_P06F20_KP_ID as KP,G6B_U05_P06F20_PREDECESSOR_KP_ID as PREDECESSOR,G6B_U05_P06F20_PROTECTED_KP_IDS as PROTECTED,G6B_U05_P06F20_SOURCE_ID as SRC,getG6BU05P06F20SelectorRow as row,listG6BU05P06F20PatternGroups as groups,resolveG6BU05P06F20PatternSpecIds as specs} from "./g6b-u05-age-repeated-relation-selector-projection-p06f20.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P06F20_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(!pv.includes(PREDECESSOR)||pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP)||PROTECTED.some(id=>pv.includes(id)||!ph.includes(id)||!pn.includes(id)))throw new Error("P06F20_BASE_STATE_INVALID");
const visible=Object.freeze([...new Set([...pv,KP])]),hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...PROTECTED])]),not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...PROTECTED])]);
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w6_slice020_g6b_u05_age_relation_promoted",publicDropdownCutoverTask:"P06F_W6DirectProductVerticalSlice020Implementation",q020AddedKnowledgePointIds:Object.freeze([KP]),predecessorOwnedKnowledgePointIds:Object.freeze([PREDECESSOR]),remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w6FrozenQueueComplete:true});
const hiddenDelta=hidden.length-ph.length,notDelta=not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP06F20PublicSelectorComposition(){
  const e=[],ba=base.auditP06F19PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P06F20_BASE:"+x));
  if(!ids.includes(PREDECESSOR)||!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP))e.push("P06F20_TARGET_VISIBLE_MISSING");
  if(s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P06F20_TARGET_STILL_HIDDEN");
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P06F20_PROTECTED_VISIBILITY_INVALID");
  if(s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w6FrozenQueueComplete!==true)e.push("P06F20_SOURCE_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q020VisibleDelta:1,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
