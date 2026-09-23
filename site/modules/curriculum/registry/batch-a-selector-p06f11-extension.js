export * from "./batch-a-selector-p06f10-extension.js";
import * as base from "./batch-a-selector-p06f10-extension.js";
import {G4A_U07_P06F11_KP_ID as KP,G4A_U07_P06F11_PREDECESSOR_KP_IDS as PREV,G4A_U07_P06F11_PROTECTED_FUTURE_KP_IDS as FUTURE,G4A_U07_P06F11_SOURCE_ID as SRC,getG4AU07P06F11SelectorRow as row,listG4AU07P06F11PatternGroups as groups,resolveG4AU07P06F11PatternSpecIds as specs} from "./g4a-u07-multiplicative-pattern-selector-projection-p06f11.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P06F11_G4A_U07_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(!PREV.every(id=>pv.includes(id))||pv.includes(KP)||!ph.includes(KP)||!pn.includes(KP)||FUTURE.some(id=>pv.includes(id)||!ph.includes(id)||!pn.includes(id)))throw new Error("P06F11_BASE_STATE_INVALID");
const visible=Object.freeze([...pv,KP]),hidden=Object.freeze([...new Set([...ph.filter(id=>id!==KP),...FUTURE])]),not=Object.freeze([...new Set([...pn.filter(id=>id!==KP),...FUTURE])]);
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w6_slice011_multiplicative_pattern_promoted",publicDropdownCutoverTask:"P06F_W6DirectProductVerticalSlice011Implementation",q011AddedKnowledgePointIds:Object.freeze([KP]),q013ProtectedKnowledgePointIds:FUTURE,sameUnitMixedAllowed:false});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP06F11PublicSelectorComposition(){
  const e=[],ba=base.auditP06F10PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>`P06F11_BASE:${x}`));
  if(!PREV.every(id=>ids.includes(id)))e.push("P06F11_PREDECESSOR_MISSING");
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP))e.push("P06F11_TARGET_VISIBLE_MISSING");
  if(s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P06F11_TARGET_STILL_HIDDEN");
  if(FUTURE.some(id=>ids.includes(id)||getVisibleBatchAKnowledgePoint(id)))e.push("P06F11_Q013_FUTURE_LEAKED");
  if(FUTURE.some(id=>!s.hiddenPendingKnowledgePointIds.includes(id)||!s.notSelectableKnowledgePointIds.includes(id)))e.push("P06F11_Q013_FUTURE_NOT_PROTECTED");
  if(s.sameUnitMixedAllowed!==false)e.push("P06F11_SAME_UNIT_MIX_NOT_FAIL_CLOSED");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({predecessorVisible:PREV.length,q011VisibleDelta:1,q013Protected:FUTURE.length})});
}
