export * from "./batch-a-selector-p09-mixed21-extension.js";
import * as base from "./batch-a-selector-p09-mixed21-extension.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID as KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP as GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID as SRC
} from "./g3a-u01-visual-rank01-selector-projection.js";

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const baseRow=base.getVisibleBatchAKnowledgePoint(KP);
if(!baseRow||baseRow.sourceId!==SRC) throw new Error("G3A_U01_RANK01_EXISTING_KP_PREFLIGHT_FAILED");

export const BATCH_A_SELECTOR_AVAILABILITY=base.BATCH_A_SELECTOR_AVAILABILITY;
export function listVisibleBatchAKnowledgePoints(){return base.listVisibleBatchAKnowledgePoints();}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);}
export function getVisibleBatchAKnowledgePoint(id){return base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){
  const existing=base.getVisiblePatternGroupsForKnowledgePoint(id);
  if(id!==KP)return existing;
  return clone([...existing.filter(row=>row.patternGroupId!==GROUP_ID),GROUP]);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){
  if(id!==KP)return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);
  if(mode&&mode!=="numeric")return [];
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(id).flatMap(row=>row.patternSpecIds??[]))];
}
export function auditG3AU01VisualRank01PublicSelector(){
  const errors=[];
  const rows=listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===SRC);
  const target=getVisibleBatchAKnowledgePoint(KP);
  const groups=getVisiblePatternGroupsForKnowledgePoint(KP);
  const rank=groups.filter(row=>row.patternGroupId===GROUP_ID);
  if(!target||target.sourceId!==SRC)errors.push("G3A_U01_RANK01_EXISTING_KP_MISSING");
  if(rank.length!==1)errors.push("G3A_U01_RANK01_GROUP_CARDINALITY_INVALID");
  if(rank[0]?.patternSpecIds?.join("|")!=="ps_g3a_u01_visual_one_way_table_compare")errors.push("G3A_U01_RANK01_PATTERN_SPEC_INVALID");
  if(rows.some(row=>String(row.knowledgePointId).includes("visual_rank02")))errors.push("G3A_U01_RANK02_PLUS_LEAKED");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sourceVisibleKnowledgePoints:rows.length,addedKnowledgePoints:0,rank01Groups:rank.length})});
}
