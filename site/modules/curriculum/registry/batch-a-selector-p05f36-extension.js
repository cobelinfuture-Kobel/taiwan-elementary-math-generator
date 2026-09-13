export * from "./batch-a-selector-p05f35-extension.js";
import * as base from "./batch-a-selector-p05f35-extension.js";
import {G5A_U07_P05F36_KP_ID as KP,G5A_U07_P05F36_SOURCE_ID as SRC,getG5AU07P05F36SelectorRow as row,listG5AU07P05F36PatternGroups as groups,resolveG5AU07P05F36PatternSpecIds as specs} from "./g5a-u07-symmetric-point-distance-selector-projection-p05f36.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const b=base.BATCH_A_SELECTOR_AVAILABILITY,p=b.bySourceId?.[SRC];
if(!p)throw new Error("P05F36_G5A_U07_SOURCE_MISSING");
const pv=p.visibleKnowledgePointIds??[],ph=p.hiddenPendingKnowledgePointIds??[],pn=p.notSelectableKnowledgePointIds??[];
const v=Object.freeze([...new Set([...pv,KP])]),h=Object.freeze(ph.filter(x=>x!==KP)),n=Object.freeze(pn.filter(x=>x!==KP));
const bySourceId=Object.freeze({...b.bySourceId,[SRC]:Object.freeze({...p,visibleCount:v.length,hiddenPendingCount:h.length,notSelectableCount:n.length,visibleKnowledgePointIds:v,hiddenPendingKnowledgePointIds:h,notSelectableKnowledgePointIds:n,publicSelectorStatus:"w5_slice036_symmetric_point_distance_promoted"})});
export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({...b,visibleCount:Number(b.visibleCount??0)+(pv.includes(KP)?0:1),hiddenPendingCount:Math.max(0,Number(b.hiddenPendingCount??0)-(ph.includes(KP)?1:0)),notSelectableCount:Math.max(0,Number(b.notSelectableCount??0)-(pn.includes(KP)?1:0)),bySourceId});
export function listVisibleBatchAKnowledgePoints(){const r=[...base.listVisibleBatchAKnowledgePoints()];if(!r.some(x=>x.knowledgePointId===KP))r.push(clone(row(KP)));return r;}
export function listBatchAKnowledgePointAvailabilityBySource(id){return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[id]??base.listBatchAKnowledgePointAvailabilityBySource(id));}
export function getVisibleBatchAKnowledgePoint(id){return id===KP?row(id):base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){return id===KP?groups(id):base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){return id===KP?(mode&&mode!=="diagram"?[]:specs(id)):base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
export function auditP05F36PublicSelectorComposition(){const s=listBatchAKnowledgePointAvailabilityBySource(SRC),e=[];if(s.visibleCount!==3||s.hiddenPendingCount!==2||s.notSelectableCount!==2)e.push("P05F36_G5A_U07_AVAILABILITY_INVALID");for(const id of ["kp_g5a_u07_line_symmetry_recognition","kp_g5a_u07_symmetry_axis_count",KP])if(!s.visibleKnowledgePointIds.includes(id))e.push(`P05F36_VISIBLE_MISSING:${id}`);return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({g5aU07Visible:s.visibleCount,g5aU07Hidden:s.hiddenPendingCount,g5aU07NotSelectable:s.notSelectableCount})});}
