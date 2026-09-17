export * from "./batch-a-selector-p06f01-extension.js";
import * as base from "./batch-a-selector-p06f01-extension.js";
import {G3A_U07_P06F02_KP_ID as KP,G3A_U07_P06F02_PREDECESSOR_KP_IDS as Q001,G3A_U07_P06F02_SOURCE_ID as SRC,getG3AU07P06F02SelectorRow as row,listG3AU07P06F02PatternGroups as groups,resolveG3AU07P06F02PatternSpecIds as specs} from "./g3a-u07-tabular-pattern-selector-projection-p06f02.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC];
if(!p)throw new Error("P06F02_G3A_U07_SOURCE_MISSING");
const priorVisible=p.visibleKnowledgePointIds??[],priorHidden=p.hiddenPendingKnowledgePointIds??[],priorNot=p.notSelectableKnowledgePointIds??[];
if(!Q001.every(id=>priorVisible.includes(id))||priorVisible.includes(KP)||!priorHidden.includes(KP)||!priorNot.includes(KP))throw new Error("P06F02_BASE_STATE_INVALID");
const visible=Object.freeze([...priorVisible,KP]),hidden=Object.freeze(priorHidden.filter(x=>x!==KP)),not=Object.freeze(priorNot.filter(x=>x!==KP));
const source=Object.freeze({...p,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w6_slice002_tabular_pattern_promoted",publicDropdownCutoverTask:"P06F_W6DirectProductVerticalSlice002Implementation",q002AddedKnowledgePointIds:Object.freeze([KP])});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+1,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-1),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-1),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(id===KP)return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(id===KP)return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(id===KP)return mode&&mode!=="numeric"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP06F02PublicSelectorComposition(){
  const e=[],ba=base.auditP06F01PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  if(ba&&!ba.ok)e.push(...ba.errors.map(x=>`P06F02_BASE:${x}`));
  if(!Q001.every(id=>ids.includes(id)))e.push("P06F02_Q001_PREDECESSOR_MISSING");
  if(!ids.includes(KP)||!getVisibleBatchAKnowledgePoint(KP))e.push("P06F02_Q002_VISIBLE_MISSING");
  if(s.hiddenPendingKnowledgePointIds.includes(KP)||s.notSelectableKnowledgePointIds.includes(KP))e.push("P06F02_Q002_STILL_HIDDEN");
  if(BATCH_A_SELECTOR_AVAILABILITY.sourceCount!==b.sourceCount||BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount!==b.publicSourceCount)e.push("P06F02_SOURCE_COUNT_CHANGED");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q001Visible:Q001.length,q002VisibleDelta:1,sourceDelta:0})});
}
