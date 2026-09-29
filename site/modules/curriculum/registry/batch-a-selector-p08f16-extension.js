export * from "./batch-a-selector-p08f15-extension.js";
import * as base from "./batch-a-selector-p08f15-extension.js";
import {
  G6A_U09_P08F16_TARGET_KP_IDS as TARGETS,
  G6A_U09_P08F16_PRIOR_KP_IDS as PRIOR,
  G6A_U09_P08F16_SOURCE_ID as SRC,
  getG6AU09P08F16SelectorRow as row,
  listG6AU09P08F16PatternGroups as groups,
  resolveG6AU09P08F16PatternSpecIds as specs
} from "./g6a-u09-scale-drawing-similarity-selector-projection-p08f16.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v)),b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC]??null;
if(!p)throw new Error("P08F16_EXPECTED_EXISTING_G6A_U09_SOURCE_ROW");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
if(PRIOR.some(id=>!pv.includes(id)))throw new Error("P08F16_PRIOR_OWNER_VISIBILITY_INVALID");
for(const id of TARGETS)if(pv.includes(id)||!ph.includes(id)||!pn.includes(id))throw new Error("P08F16_TARGET_NOT_PENDING_IN_PRIOR_SELECTOR:"+id);
const visible=Object.freeze([...new Set([...pv,...TARGETS])]),hidden=Object.freeze(ph.filter(id=>!TARGETS.includes(id))),not=Object.freeze(pn.filter(id=>!TARGETS.includes(id));
const source=Object.freeze({...p,sourceId:SRC,visibleCount:visible.length,hiddenPendingCount:hidden.length,notSelectableCount:not.length,visibleKnowledgePointIds:visible,hiddenPendingKnowledgePointIds:hidden,notSelectableKnowledgePointIds:not,publicSelectorStatus:"w8_slice016_g6a_u09_scale_drawing_similarity_promoted",publicDropdownCutoverTask:"P08F_W8DirectProductVerticalSlice016Implementation",q016AddedKnowledgePointIds:TARGETS,protectedPriorOwnerKnowledgePointIds:PRIOR,remainingProtectedKnowledgePointIds:Object.freeze([]),sameSourceCandidateSetComplete:true,sameUnitMixedAllowed:false,w8FrozenQueueComplete:false});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+TARGETS.length,hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-TARGETS.length),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-TARGETS.length),bySourceId:Object.freeze({...b.bySourceId,[SRC]:source})});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];for(const id of TARGETS)if(!r.some(x=>x.knowledgePointId===id))r.push(clone(row(id)));return r;}
export const listBatchAKnowledgePointAvailabilityBySource=id=>clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));
export function getVisibleBatchAKnowledgePoint(id){if(TARGETS.includes(id))return clone(row(id));return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){if(TARGETS.includes(id))return clone(groups(id));return base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){if(TARGETS.includes(id))return mode&&mode!=="diagram"?[]:clone(specs(id));return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP08F16PublicSelectorComposition(){const e=[],ba=base.auditP08F15PublicSelectorComposition?.(),s=listBatchAKnowledgePointAvailabilityBySource(SRC),ids=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);if(ba&&!ba.ok)e.push(...ba.errors.map(x=>"P08F16_BASE:"+x));for(const id of PRIOR)if(!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id))e.push("P08F16_PRIOR_OWNER_LOST:"+id);for(const id of TARGETS)if(!ids.includes(id)||!getVisibleBatchAKnowledgePoint(id)||s.hiddenPendingKnowledgePointIds.includes(id)||s.notSelectableKnowledgePointIds.includes(id))e.push("P08F16_TARGET_VISIBILITY_INVALID:"+id);if(s.remainingProtectedKnowledgePointIds.length!==0||s.sameSourceCandidateSetComplete!==true||s.sameUnitMixedAllowed!==false||s.w8FrozenQueueComplete!==false)e.push("P08F16_SOURCE_SCOPE_INVALID");return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({q016VisibleDelta:2,sourceVisibleCount:s.visibleCount,protectedPriorOwners:PRIOR.length,remainingProtected:0})});}
