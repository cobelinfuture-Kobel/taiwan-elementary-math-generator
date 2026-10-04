export * from "./batch-a-selector-g3a-u01-visual-rank01-extension.js";
import * as base from "./batch-a-selector-g3a-u01-visual-rank01-extension.js";
import {
  G3A_U01_VISUAL_RANK02_KP_ID as KP,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID as SPEC_ID,
  G3A_U01_VISUAL_RANK02_PUBLIC_PATTERN_GROUP as GROUP,
  G3A_U01_VISUAL_RANK02_SOURCE_ID as SRC,
} from "./g3a-u01-visual-rank02-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID as RANK01_KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as RANK01_GROUP_ID,
} from "./g3a-u01-visual-rank01-selector-projection.js";

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));

const existingRow=base.getVisibleBatchAKnowledgePoint(KP);
const RANK02_ROW=Object.freeze(existingRow??{
  knowledgePointId:KP,
  sourceId:SRC,
  unitCode:"3A-U01",
  unitTitle:"10000以內的數",
  displayName:"整數數線讀值",
  supportClass:"A",
  canonicalSkillTag:"integer_number_line_scale_reading",
  subskillTags:Object.freeze(["integer_number_line","read_marker_value","within_10000"]),
  difficultyTags:Object.freeze(["visual_reading","rank02"]),
  representationTags:Object.freeze(["integer_number_line"]),
  patternGroupIds:Object.freeze([GROUP_ID]),
  patternSpecIds:Object.freeze([SPEC_ID]),
  qaStatusLabel:"qa_verified",
  canonicalKnowledgePointId:KP,
  selectorNodeType:"canonical_knowledge_point",
  rank:2,
});

const baseRows=base.listVisibleBatchAKnowledgePoints();
const addsRow=!baseRows.some((row)=>row.knowledgePointId===KP);
const baseAvailability=base.listBatchAKnowledgePointAvailabilityBySource(SRC);
const rank02Availability=Object.freeze({
  ...clone(baseAvailability??{}),
  sourceId:SRC,
  visibleCount:Number(baseAvailability?.visibleCount??baseRows.filter((row)=>row.sourceId===SRC).length)+(addsRow?1:0),
  sameUnitMixedAllowed:true,
  sameUnitMixedAdmission:"G3A_U01_RANK02_THREE_MODE_LINKAGE",
  crossUnitMixedAllowed:true,
  crossUnitMixedAdmission:"G3A_U01_RANK02_THREE_MODE_LINKAGE",
  publicSelectorStatus:`${baseAvailability?.publicSelectorStatus??"visible"}+g3a_u01_rank02_public`,
});

export const BATCH_A_SELECTOR_AVAILABILITY=Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount:Number(base.BATCH_A_SELECTOR_AVAILABILITY?.visibleCount??baseRows.length)+(addsRow?1:0),
  bySourceId:Object.freeze({
    ...(base.BATCH_A_SELECTOR_AVAILABILITY?.bySourceId??{}),
    [SRC]:rank02Availability,
  }),
});

export function listVisibleBatchAKnowledgePoints(){
  const rows=base.listVisibleBatchAKnowledgePoints();
  if(rows.some((row)=>row.knowledgePointId===KP))return rows;
  return [...rows,clone(RANK02_ROW)];
}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){
  return sourceId===SRC?clone(rank02Availability):base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}
export function getVisibleBatchAKnowledgePoint(id){
  if(id===KP)return clone(RANK02_ROW);
  return base.getVisibleBatchAKnowledgePoint(id);
}
export function getVisiblePatternGroupsForKnowledgePoint(id){
  if(id===KP)return clone([GROUP]);
  return base.getVisiblePatternGroupsForKnowledgePoint(id);
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){
  if(id===KP)return !mode||mode==="numeric"?[SPEC_ID]:[];
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);
}

export function auditG3AU01VisualRank02PublicSelector(){
  const errors=[];
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const target=getVisibleBatchAKnowledgePoint(KP);
  const groups=getVisiblePatternGroupsForKnowledgePoint(KP);
  const rank02=groups.filter((row)=>row.patternGroupId===GROUP_ID);
  const rank01=base.getVisiblePatternGroupsForKnowledgePoint(RANK01_KP)
    .filter((row)=>row.patternGroupId===RANK01_GROUP_ID);
  if(!target||target.sourceId!==SRC)errors.push("G3A_U01_RANK02_KP_MISSING");
  if(target?.displayName!=="整數數線讀值")errors.push("G3A_U01_RANK02_DISPLAY_NAME_INVALID");
  if(rank02.length!==1)errors.push("G3A_U01_RANK02_GROUP_CARDINALITY_INVALID");
  if(rank02[0]?.patternSpecIds?.join("|")!==SPEC_ID)errors.push("G3A_U01_RANK02_PATTERN_SPEC_INVALID");
  if(rank01.length!==1)errors.push("G3A_U01_RANK01_REGRESSION");
  if(rows.some((row)=>String(row.knowledgePointId).includes("visual_rank03")))errors.push("G3A_U01_RANK03_PLUS_LEAKED");
  return Object.freeze({
    ok:errors.length===0,
    errors:Object.freeze(errors),
    counts:Object.freeze({
      sourceVisibleKnowledgePoints:rows.length,
      addedKnowledgePoints:addsRow?1:0,
      rank01Groups:rank01.length,
      rank02Groups:rank02.length,
    }),
  });
}
