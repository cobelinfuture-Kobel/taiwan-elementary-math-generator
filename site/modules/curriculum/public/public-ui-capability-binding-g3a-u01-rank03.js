export * from "./public-ui-capability-binding-g3a-u01-rank02.js";
import * as base from "./public-ui-capability-binding-g3a-u01-rank02.js";
import {
  G3A_U01_VISUAL_RANK03_KP_ID as KP,
  G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID as SPEC_ID,
  G3A_U01_VISUAL_RANK03_PUBLIC_PATTERN_GROUP as GROUP,
  G3A_U01_VISUAL_RANK03_SOURCE_ID as SRC,
} from "../registry/g3a-u01-visual-rank03-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID as RANK02_GROUP_ID,
} from "../registry/g3a-u01-visual-rank02-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as RANK01_GROUP_ID,
} from "../registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-g3a-u01-visual-rank03-extension.js";

export const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION=base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION;
export const PUBLIC_UI_SAFE_QUESTION_COUNT=base.PUBLIC_UI_SAFE_QUESTION_COUNT;
export const PUBLIC_UI_SURFACES=base.PUBLIC_UI_SURFACES;

const SINGLE="singleKnowledgePoint";
const MIXED="mixedKnowledgePointsSameUnit";

function unique(values=[]){
  return [...new Set((Array.isArray(values)?values:[]).filter(Boolean))];
}
function rank03Target(input={}){
  const groups=unique(input.selectedPatternGroupIds);
  return input.sourceId===SRC
    && input.selectionMode===SINGLE
    && unique(input.selectedKnowledgePointIds).length===1
    && unique(input.selectedKnowledgePointIds)[0]===KP
    && groups.length===1
    && groups[0]===GROUP_ID;
}
function g3aMixedTarget(input={}){
  return input.sourceId===SRC
    && input.selectionMode===MIXED
    && unique(input.selectedKnowledgePointIds).length>=2;
}

function rank03Binding(input={}){
  const sourceBinding=base.resolvePublicUiCapabilityBinding({
    ...input,
    selectionMode:"sourceUnit",
    selectedKnowledgePointIds:[],
    selectedPatternGroupIds:[],
  });
  const compatible=Object.freeze({
    ...GROUP,
    knowledgePointId:KP,
    knowledgePointDisplayName:"整數數線讀值",
    effectiveQuestionType:"numeric",
    uiQuestionType:"numeric",
    displayLabel:"整數數線定位／標記",
    selected:true,
  });
  return Object.freeze({
    ...sourceBinding,
    sourceId:SRC,
    surfaceId:input.surfaceId??sourceBinding?.surfaceId,
    selectionMode:SINGLE,
    availableSelectionModes:Object.freeze([
      Object.freeze({value:"sourceUnit",enabled:true}),
      Object.freeze({value:SINGLE,enabled:true}),
      Object.freeze({value:MIXED,enabled:true}),
      Object.freeze({value:"mixedKnowledgePointsCrossUnit",enabled:false}),
    ]),
    selectedKnowledgePointIds:Object.freeze([KP]),
    selectedKnowledgePointCount:1,
    availableQuestionTypeOptions:Object.freeze([
      Object.freeze({value:"numeric",label:"數線標記題",enabled:true}),
    ]),
    questionType:"numeric",
    compatiblePatternGroups:Object.freeze([compatible]),
    compatiblePatternGroupIds:Object.freeze([GROUP_ID]),
    selectedCompatiblePatternGroupIds:Object.freeze([GROUP_ID]),
    patternSpecIds:Object.freeze([SPEC_ID]),
    depthOptions:Object.freeze([]),
    contextOptions:Object.freeze([]),
    depthMode:null,
    contextMode:null,
    questionCount:Object.freeze({min:1,max:240,default:20}),
    capacityStatus:"G3A_U01_RANK03_PUBLIC_RUNTIME_240_VALIDATED",
    capacityQualityStatuses:Object.freeze(["G3A_U01_RANK03_PUBLIC_RUNTIME_240_VALIDATED"]),
    blocked:false,
    blockedReasons:Object.freeze([]),
    rank03VisualAdmission:true,
    operatorLayoutReviewRequired:true,
  });
}

function mixedBinding(input={}){
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const requested=unique(input.selectedKnowledgePointIds);
  const requestedSet=new Set(requested);
  const requestedRows=rows.filter((row)=>requestedSet.has(row.knowledgePointId));
  const selected=requestedRows.length>=2?requestedRows:rows;
  const selectedIds=selected.map((row)=>row.knowledgePointId);
  const labels=Object.fromEntries(selected.map((row)=>[row.knowledgePointId,row.displayName]));
  const groups=[...new Map(
    selected
      .flatMap((row)=>getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId))
      .filter((group)=>group?.patternGroupId)
      .map((group)=>[group.patternGroupId,group])
  ).values()];
  const requestedGroups=new Set(unique(input.selectedPatternGroupIds));
  const selectedGroups=groups.filter((group)=>requestedGroups.has(group.patternGroupId));
  const sourceBinding=base.resolvePublicUiCapabilityBinding({
    ...input,
    selectionMode:"sourceUnit",
    selectedKnowledgePointIds:[],
    selectedPatternGroupIds:[],
  });
  return Object.freeze({
    sourceId:SRC,
    surfaceId:input.surfaceId??sourceBinding?.surfaceId,
    selectionMode:MIXED,
    availableSelectionModes:Object.freeze([
      Object.freeze({value:"sourceUnit",enabled:true}),
      Object.freeze({value:SINGLE,enabled:true}),
      Object.freeze({value:MIXED,enabled:true}),
      Object.freeze({value:"mixedKnowledgePointsCrossUnit",enabled:false}),
    ]),
    selectedKnowledgePointIds:Object.freeze(selectedIds),
    selectedKnowledgePointCount:selectedIds.length,
    availableQuestionTypeOptions:Object.freeze([]),
    questionType:"mixed",
    compatiblePatternGroups:Object.freeze(groups.map((group)=>Object.freeze({
      ...group,
      knowledgePointId:group.primaryKnowledgePointId,
      knowledgePointDisplayName:labels[group.primaryKnowledgePointId]??null,
      effectiveQuestionType:"mixed",
      uiQuestionType:"mixed",
      displayLabel:group.displayName,
      selected:requestedGroups.size===0||requestedGroups.has(group.patternGroupId),
    }))),
    compatiblePatternGroupIds:Object.freeze(groups.map((group)=>group.patternGroupId)),
    selectedCompatiblePatternGroupIds:Object.freeze(
      (selectedGroups.length?selectedGroups:groups).map((group)=>group.patternGroupId)
    ),
    patternSpecIds:Object.freeze([...new Set(groups.flatMap((group)=>group.patternSpecIds??[]))]),
    depthOptions:Object.freeze([]),
    contextOptions:Object.freeze([]),
    depthMode:null,
    contextMode:null,
    questionCount:Object.freeze({min:selectedIds.length,max:240,default:Math.max(20,selectedIds.length)}),
    capacityStatus:"G3A_U01_RANK01_RANK02_RANK03_MIXED_SELECTOR_LINKAGE",
    capacityRegistryStatus:base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION?.registryStatus??null,
    capacityRouteIds:Object.freeze([]),
    capacityQualityStatuses:Object.freeze(["G3A_U01_RANK01_RANK02_RANK03_MIXED_SELECTOR_LINKAGE"]),
    capacityReconciliation:base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked:false,
    blockedReasons:Object.freeze([]),
    sameUnitMixedAdmission:true,
    rank01MixedAdmission:groups.some((group)=>group.patternGroupId===RANK01_GROUP_ID),
    rank02MixedAdmission:groups.some((group)=>group.patternGroupId===RANK02_GROUP_ID),
    rank03MixedAdmission:groups.some((group)=>group.patternGroupId===GROUP_ID),
    operatorLayoutReviewRequired:
      requestedGroups.has(RANK01_GROUP_ID)
      ||requestedGroups.has(RANK02_GROUP_ID)
      ||requestedGroups.has(GROUP_ID),
  });
}

export function resolvePublicUiCapabilityBinding(input={}){
  if(rank03Target(input))return rank03Binding(input);
  if(g3aMixedTarget(input))return mixedBinding(input);
  return base.resolvePublicUiCapabilityBinding(input);
}

export function auditPublicUiCapabilityBinding(){
  const prior=base.auditPublicUiCapabilityBinding();
  const errors=[...(prior.errors??[])];
  const single=rank03Binding({
    sourceId:SRC,
    selectionMode:SINGLE,
    selectedKnowledgePointIds:[KP],
    selectedPatternGroupIds:[GROUP_ID],
  });
  if(
    single.blocked
    || single.rank03VisualAdmission!==true
    || single.questionCount.max!==240
    || single.compatiblePatternGroupIds.join("|")!==GROUP_ID
  ) errors.push("G3A_U01_RANK03_PUBLIC_BINDING_INVALID");

  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const ids=rows.slice(0,Math.max(2,Math.min(rows.length,4))).map((row)=>row.knowledgePointId);
  if(!ids.includes(KP))ids.push(KP);
  const mixed=mixedBinding({
    sourceId:SRC,
    selectionMode:MIXED,
    selectedKnowledgePointIds:ids,
    selectedPatternGroupIds:[RANK02_GROUP_ID,GROUP_ID],
  });
  if(
    mixed.blocked
    || mixed.sameUnitMixedAdmission!==true
    || mixed.rank02MixedAdmission!==true
    || mixed.rank03MixedAdmission!==true
    || !mixed.compatiblePatternGroupIds.includes(RANK02_GROUP_ID)
    || !mixed.compatiblePatternGroupIds.includes(GROUP_ID)
  ) errors.push("G3A_U01_RANK03_MIXED_BINDING_INVALID");
  return Object.freeze({
    ok:errors.length===0,
    errors:Object.freeze(errors),
    caseCount:Number(prior.caseCount??0)+2,
  });
}
