export * from "./batch-a-selector-g3a-u01-visual-rank03-extension.js";
import * as base from "./batch-a-selector-g3a-u01-visual-rank03-extension.js";
import {
  G3A_U01_VISUAL_RANK04_KP_ID as KP,
  G3A_U01_VISUAL_RANK04_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK04_PATTERN_SPEC_ID as SPEC_ID,
  G3A_U01_VISUAL_RANK04_PUBLIC_PATTERN_GROUP as GROUP,
  G3A_U01_VISUAL_RANK04_SOURCE_ID as SRC,
} from "./g3a-u01-visual-rank04-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID as RANK02_GROUP_ID,
} from "./g3a-u01-visual-rank02-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID as RANK03_GROUP_ID,
} from "./g3a-u01-visual-rank03-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID as RANK01_KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as RANK01_GROUP_ID,
} from "./g3a-u01-visual-rank01-selector-projection.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));

const baseAvailability=base.listBatchAKnowledgePointAvailabilityBySource(SRC);
const rank04Availability=Object.freeze({
  ...clone(baseAvailability??{}),
  sourceId:SRC,
  sameUnitMixedAllowed:true,
  sameUnitMixedAdmission:"G3A_U01_RANK04_THREE_MODE_LINKAGE",
  crossUnitMixedAllowed:true,
  crossUnitMixedAdmission:"G3A_U01_RANK04_THREE_MODE_LINKAGE",
  publicSelectorStatus:`${baseAvailability?.publicSelectorStatus??"visible"}+g3a_u01_rank04_sibling_public`,
});

export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  bySourceId:Object.freeze({
    ...(base.BATCH_A_SELECTOR_AVAILABILITY?.bySourceId??{}),
    [SRC]:rank04Availability,
  }),
});

export function listVisibleBatchAKnowledgePoints(){
  return base.listVisibleBatchAKnowledgePoints();
}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){
  return sourceId===SRC?clone(rank04Availability):base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id){
  return base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id){
  const groups=base.getVisiblePatternGroupsForKnowledgePoint(id);
  if(id!==KP)return groups;
  if(groups.some((group)=>group.patternGroupId===GROUP_ID))return groups;
  return clone([...groups,GROUP]);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){
  if(id!==KP)return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);
  if(mode&&mode!=="numeric")return [];
  return [...new Set([
    ...base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode),
    SPEC_ID,
  ])];
}

export function auditG3AU01VisualRank04PublicSelector(){
  const errors=[];
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const target=getVisibleBatchAKnowledgePoint(KP);
  const groups=getVisiblePatternGroupsForKnowledgePoint(KP);
  const rank02=groups.filter((row)=>row.patternGroupId===RANK02_GROUP_ID);
  const rank03=groups.filter((row)=>row.patternGroupId===RANK03_GROUP_ID);
  const rank04=groups.filter((row)=>row.patternGroupId===GROUP_ID);
  const rank01=base.getVisiblePatternGroupsForKnowledgePoint(RANK01_KP)
    .filter((row)=>row.patternGroupId===RANK01_GROUP_ID);
  if(!target||target.sourceId!==SRC)errors.push("G3A_U01_RANK04_KP_MISSING");
  if(target?.displayName!=="整數數線讀值")errors.push("G3A_U01_RANK02_CANONICAL_LABEL_REGRESSION");
  if(rank01.length!==1)errors.push("G3A_U01_RANK01_REGRESSION");
  if(rank02.length!==1)errors.push("G3A_U01_RANK02_GROUP_CARDINALITY_INVALID");
  if(rank03.length!==1)errors.push("G3A_U01_RANK03_GROUP_CARDINALITY_INVALID");
  if(rank04.length!==1)errors.push("G3A_U01_RANK04_GROUP_CARDINALITY_INVALID");
  if(rank04[0]?.patternSpecIds?.join("|")!==SPEC_ID)errors.push("G3A_U01_RANK04_PATTERN_SPEC_INVALID");
  if(rows.filter((row)=>row.knowledgePointId===KP).length!==1)errors.push("G3A_U01_RANK04_DUPLICATE_KP_ROW");
  return Object.freeze({
    ok:errors.length===0,
    errors:Object.freeze(errors),
    counts:Object.freeze({
      sourceVisibleKnowledgePoints:rows.length,
      rank01Groups:rank01.length,
      rank02Groups:rank02.length,
      rank03Groups:rank03.length,
      rank04Groups:rank04.length,
      addedKnowledgePoints:0,
      addedSiblingSelectorTargets:1,
      expectedSameUnitSelectorTargets:rows.length+3,
    }),
  });
}
