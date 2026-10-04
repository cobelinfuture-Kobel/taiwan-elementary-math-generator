export * from "./public-ui-capability-binding-p09-mixed21.js";
import * as base from "./public-ui-capability-binding-p09-mixed21.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID as KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID as SPEC_ID,
  G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP as GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID as SRC
} from "../registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-g3a-u01-visual-rank01-extension.js";

export const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION=base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION;
export const PUBLIC_UI_SAFE_QUESTION_COUNT=base.PUBLIC_UI_SAFE_QUESTION_COUNT;
export const PUBLIC_UI_SURFACES=base.PUBLIC_UI_SURFACES;

const MIXED="mixedKnowledgePointsSameUnit";
function target(input={}){
  if(input.sourceId!==SRC||input.selectionMode!=="singleKnowledgePoint")return false;
  const ids=[...new Set((input.selectedKnowledgePointIds??[]).filter(Boolean))];
  return ids.length===1&&ids[0]===KP;
}
function mixedTarget(input={}){
  if(input.sourceId!==SRC||input.selectionMode!==MIXED)return false;
  const ids=[...new Set((input.selectedKnowledgePointIds??[]).filter(Boolean))];
  return ids.length>=2&&ids.includes(KP);
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
function mixedRankBinding(input={}){
  const rows=listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===SRC);
  const requested=[...new Set((input.selectedKnowledgePointIds??[]).filter(Boolean))];
  const requestedSet=new Set(requested);
  const requestedRows=rows.filter(row=>requestedSet.has(row.knowledgePointId));
  const selected=requestedRows.length>=2?requestedRows:rows;
  const selectedIds=selected.map(row=>row.knowledgePointId);
  const labels=Object.fromEntries(selected.map(row=>[row.knowledgePointId,row.displayName]));
  const groups=[...new Map(selected.flatMap(row=>getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId)).filter(group=>group?.patternGroupId).map(group=>[group.patternGroupId,group])).values()];
  const requestedGroups=new Set((input.selectedPatternGroupIds??[]).filter(Boolean));
  const selectedGroups=groups.filter(group=>requestedGroups.has(group.patternGroupId));
  const sourceBinding=base.resolvePublicUiCapabilityBinding({...input,selectionMode:"sourceUnit",selectedKnowledgePointIds:[],selectedPatternGroupIds:[]});
  return Object.freeze({
    sourceId:SRC,
    surfaceId:input.surfaceId??sourceBinding?.surfaceId,
    selectionMode:MIXED,
    availableSelectionModes:Object.freeze([
      Object.freeze({value:"sourceUnit",enabled:sourceBinding?.blocked===false}),
      Object.freeze({value:"singleKnowledgePoint",enabled:true}),
      Object.freeze({value:MIXED,enabled:true}),
      Object.freeze({value:"mixedKnowledgePointsCrossUnit",enabled:false}),
    ]),
    selectedKnowledgePointIds:Object.freeze(selectedIds),
    selectedKnowledgePointCount:selectedIds.length,
    availableQuestionTypeOptions:Object.freeze([]),
    questionType:"mixed",
    compatiblePatternGroups:Object.freeze(groups.map(group=>Object.freeze({
      ...group,
      knowledgePointId:group.primaryKnowledgePointId,
      knowledgePointDisplayName:labels[group.primaryKnowledgePointId]??null,
      effectiveQuestionType:"mixed",
      uiQuestionType:"mixed",
      displayLabel:group.displayName,
      selected:requestedGroups.size===0||requestedGroups.has(group.patternGroupId),
    }))),
    compatiblePatternGroupIds:Object.freeze(groups.map(group=>group.patternGroupId)),
    selectedCompatiblePatternGroupIds:Object.freeze((selectedGroups.length?selectedGroups:groups).map(group=>group.patternGroupId)),
    patternSpecIds:Object.freeze([...new Set(groups.flatMap(group=>group.patternSpecIds??[]))]),
    questionCount:Object.freeze({min:selectedIds.length,max:240,default:Math.max(20,selectedIds.length)}),
    blocked:false,
    blockedReasons:Object.freeze([]),
    sameUnitMixedAdmission:true,
    rank01MixedAdmission:true,
    operatorLayoutReviewRequired:requestedGroups.has(GROUP_ID),
  });
}
export function resolvePublicUiCapabilityBinding(input={}){
  if(target(input))return rankBinding(input);
  if(mixedTarget(input))return mixedRankBinding(input);
  return base.resolvePublicUiCapabilityBinding(input);
}
export function auditPublicUiCapabilityBinding(){
  const b0=base.auditPublicUiCapabilityBinding();
  const errors=[...(b0.errors??[])];
  const b=rankBinding({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],selectedPatternGroupIds:[GROUP_ID]});
  if(b.blocked||!b.compatiblePatternGroupIds.includes(GROUP_ID)||b.questionCount.max!==240||b.questionType!=="numeric")errors.push("G3A_U01_RANK01_PUBLIC_BINDING_INVALID");
  const rows=listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===SRC);
  const mixed=mixedRankBinding({sourceId:SRC,selectionMode:MIXED,selectedKnowledgePointIds:rows.slice(0,Math.max(2,Math.min(rows.length,3))).map(row=>row.knowledgePointId),selectedPatternGroupIds:[GROUP_ID]});
  if(rows.length>=2&&(mixed.blocked||mixed.sameUnitMixedAdmission!==true||!mixed.compatiblePatternGroupIds.includes(GROUP_ID)))errors.push("G3A_U01_RANK01_MIXED_BINDING_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),caseCount:Number(b0.caseCount??0)+2});
}
