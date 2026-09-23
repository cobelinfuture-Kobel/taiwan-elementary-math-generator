export * from "./batch-a-selector-p07f12-extension.js";
import * as base from "./batch-a-selector-p07f12-extension.js";
import {
  G5B_U08_P07F13_KP_IDS as KPS,
  G5B_U08_P07F13_PROTECTED_FUTURE_KP_IDS as PROTECTED,
  G5B_U08_P07F13_SOURCE_ID as SRC,
  getG5BU08P07F13SelectorRow as row,
  listG5BU08P07F13PatternGroups as groups,
  resolveG5BU08P07F13PatternSpecIds as specs
} from "./g5b-u08-rate-percentage-quantity-selector-projection-p07f13.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P07F13_BASE_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(KPS.some(id=>pv.includes(id))||PROTECTED.some(id=>pv.includes(id)))throw new Error("P07F13_BASE_VISIBILITY_INVALID");
const visible=Object.freeze([...new Set([...pv,...KPS])]),hidden=Object.freeze([...new Set([...ph.filter(id=>!KPS.includes(id)),...PROTECTED])]),not=Object.freeze([...new Set([...pn.filter(id=>!KPS.includes(id)),...PROTECTED])]);
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,
  publicSelectorStatus:"w7_slice013_g5b_u08_rate_and_percentage_quantity_promoted",publicDropdownCutoverTask:"P07F_W7DirectProductVerticalSlice013Implementation",
  q013AddedKnowledgePointIds:KPS,remainingProtectedKnowledgePointIds:PROTECTED,sameSourceCandidateSetComplete:false,sameUnitMixedAllowed:false,w7FrozenQueueComplete:false});
const hiddenDelta=hidden.length-ph.length,notDelta=not.length-pn.length;
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+KPS.length,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)+hiddenDelta),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)+notDelta),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];for(const kp of KPS)if(!r.some(x=>x.knowledgePointId===kp))r.push(clone(row(kp)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(KPS.includes(id))return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(KPS.includes(id))return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(KPS.includes(id))return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP07F13PublicSelectorComposition(){
  const e=[],ba=base.auditP07F12PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P07F13_BASE:"+x));
  if(!ids.includes("kp_g5b_u08_ratio_fraction_decimal_percent_conversion"))e.push("P07F13_Q008_PREDECESSOR_VISIBILITY_MISSING");
  for(const kp of KPS){if(!ids.includes(kp)||!getVisibleBatchAKnowledgePoint(kp))e.push("P07F13_TARGET_VISIBLE_MISSING:"+kp);if(s.hiddenPendingKnowledgePointIds.includes(kp)||s.notSelectableKnowledgePointIds.includes(kp))e.push("P07F13_TARGET_STILL_HIDDEN:"+kp);}
  if(PROTECTED.some(id=>ids.includes(id)||!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P07F13_PROTECTED_VISIBILITY_INVALID");
  if(s.sameSourceCandidateSetComplete!==false||s.sameUnitMixedAllowed!==false||s.w7FrozenQueueComplete!==false)e.push("P07F13_SOURCE_SCOPE_INVALID");
  if(ids.filter(id=>id.startsWith("kp_g5b_u08_")).length!==3)e.push("P07F13_SOURCE_VISIBLE_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q013VisibleDelta:2,sourceVisibleCount:s.visibleCount,remainingProtected:PROTECTED.length})});
}
