export * from "./batch-a-selector-p09-mixed21-extension.js";
import * as base from "./batch-a-selector-p09-mixed21-extension.js";
import {
  G3A_U01_VISUAL_RANK01_CANONICAL_KP_ID as CANONICAL_KP,
  G3A_U01_VISUAL_RANK01_KP_ID as KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP as GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID as SRC
} from "./g3a-u01-visual-rank01-selector-projection.js";

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const baseRow=base.getVisibleBatchAKnowledgePoint(CANONICAL_KP);
if(!baseRow||baseRow.sourceId!==SRC) throw new Error("G3A_U01_RANK01_CANONICAL_KP_PREFLIGHT_FAILED");

const rank01Row=Object.freeze({
  ...clone(baseRow),
  knowledgePointId:KP,
  displayName:GROUP.displayName,
  canonicalKnowledgePointId:CANONICAL_KP,
  selectorNodeType:"ranked_practice_target",
  rank:1,
  patternGroupIds:Object.freeze([GROUP_ID]),
  publicSelectorStatus:"visible_public_review"
});

const priorAvailability=base.listBatchAKnowledgePointAvailabilityBySource(SRC)??{};
const priorVisibleIds=base.listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===SRC).map(row=>row.knowledgePointId);
const rankVisibleIds=Object.freeze([...new Set([...priorVisibleIds,KP])]);

export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount:Number(base.BATCH_A_SELECTOR_AVAILABILITY?.visibleCount??0)+1,
  bySourceId:Object.freeze({
    ...(base.BATCH_A_SELECTOR_AVAILABILITY?.bySourceId??{}),
    [SRC]:Object.freeze({
      ...clone(priorAvailability),
      sourceId:SRC,
      visibleCount:Number(priorAvailability.visibleCount??priorVisibleIds.length)+1,
      visibleKnowledgePointIds:rankVisibleIds,
      publicSelectorStatus:"g3a_u01_rank01_flat_sibling_visible"
    })
  })
});

export function listVisibleBatchAKnowledgePoints(){
  return [...base.listVisibleBatchAKnowledgePoints().filter(row=>row.knowledgePointId!==KP),clone(rank01Row)];
}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){
  return sourceId===SRC?clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC]):base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id){
  return id===KP?clone(rank01Row):base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id){
  if(id===KP)return clone([GROUP]);
  return base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){
  if(id!==KP)return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);
  if(mode&&mode!=="numeric")return [];
  return [...GROUP.patternSpecIds];
}
export function auditG3AU01VisualRank01PublicSelector(){
  const errors=[];
  const rows=listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===SRC);
  const canonical=getVisibleBatchAKnowledgePoint(CANONICAL_KP);
  const target=getVisibleBatchAKnowledgePoint(KP);
  const canonicalGroups=getVisiblePatternGroupsForKnowledgePoint(CANONICAL_KP);
  const rankGroups=getVisiblePatternGroupsForKnowledgePoint(KP);
  if(!canonical||canonical.sourceId!==SRC)errors.push("G3A_U01_RANK01_CANONICAL_KP_MISSING");
  if(!target||target.sourceId!==SRC||target.canonicalKnowledgePointId!==CANONICAL_KP)errors.push("G3A_U01_RANK01_SIBLING_SELECTOR_MISSING");
  if(target?.displayName!==GROUP.displayName)errors.push("G3A_U01_RANK01_SIBLING_NAME_INVALID");
  if(canonicalGroups.some(row=>row.patternGroupId===GROUP_ID))errors.push("G3A_U01_RANK01_STILL_NESTED_UNDER_CANONICAL_KP");
  if(rankGroups.length!==1||rankGroups[0]?.patternGroupId!==GROUP_ID)errors.push("G3A_U01_RANK01_GROUP_CARDINALITY_INVALID");
  if(rows.filter(row=>row.knowledgePointId===KP).length!==1)errors.push("G3A_U01_RANK01_SELECTOR_CARDINALITY_INVALID");
  if(rows.some(row=>String(row.knowledgePointId).includes("visual_rank02")))errors.push("G3A_U01_RANK02_PLUS_LEAKED");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sourceVisibleKnowledgePoints:rows.length,addedCanonicalKnowledgePoints:0,addedSelectableTargets:1,rank01Groups:rankGroups.length})});
}
