export * from "./public-ui-capability-binding-p09-mixed21.js";
import * as base from "./public-ui-capability-binding-p09-mixed21.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID as KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID as SPEC_ID,
  G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP as GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID as SRC
} from "../registry/g3a-u01-visual-rank01-selector-projection.js";

export const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION=base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION;
export const PUBLIC_UI_SAFE_QUESTION_COUNT=base.PUBLIC_UI_SAFE_QUESTION_COUNT;
export const PUBLIC_UI_SURFACES=base.PUBLIC_UI_SURFACES;

function target(input={}){
  if(input.sourceId!==SRC||input.selectionMode!=="singleKnowledgePoint")return false;
  const ids=[...new Set((input.selectedKnowledgePointIds??[]).filter(Boolean))];
  return ids.length===1&&ids[0]===KP;
}
function rankBinding(input={}){
  const prior=base.resolvePublicUiCapabilityBinding(input);
  const existing=(prior.compatiblePatternGroups??[]).filter(row=>row.patternGroupId!==GROUP_ID);
  const compatible=[...existing,Object.freeze({
    ...GROUP,
    knowledgePointId:KP,
    knowledgePointDisplayName:prior.compatiblePatternGroups?.[0]?.knowledgePointDisplayName??"四位數比較",
    effectiveQuestionType:"numeric",
    uiQuestionType:"numeric",
    displayLabel:"一維資料表比較題",
    selected:(input.selectedPatternGroupIds??[]).includes(GROUP_ID)
  })];
  return Object.freeze({
    ...prior,
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([KP]),
    selectedKnowledgePointCount:1,
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"數字／資料表題",enabled:true})]),
    questionType:"numeric",
    compatiblePatternGroups:Object.freeze(compatible),
    compatiblePatternGroupIds:Object.freeze(compatible.map(row=>row.patternGroupId)),
    selectedCompatiblePatternGroupIds:Object.freeze((input.selectedPatternGroupIds??[]).filter(id=>compatible.some(row=>row.patternGroupId===id))),
    patternSpecIds:Object.freeze([...new Set([...(prior.patternSpecIds??[]),SPEC_ID])]),
    questionCount:Object.freeze({min:1,max:240,default:20}),
    blocked:false,
    blockedReasons:Object.freeze([]),
    rank01VisualAdmission:true,
    operatorLayoutReviewRequired:true
  });
}
export function resolvePublicUiCapabilityBinding(input={}){return target(input)?rankBinding(input):base.resolvePublicUiCapabilityBinding(input);}
export function auditPublicUiCapabilityBinding(){
  const b0=base.auditPublicUiCapabilityBinding();
  const errors=[...(b0.errors??[])];
  const b=rankBinding({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],selectedPatternGroupIds:[GROUP_ID]});
  if(b.blocked||!b.compatiblePatternGroupIds.includes(GROUP_ID)||b.questionCount.max!==240||b.questionType!=="numeric")errors.push("G3A_U01_RANK01_PUBLIC_BINDING_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),caseCount:Number(b0.caseCount??0)+1});
}
