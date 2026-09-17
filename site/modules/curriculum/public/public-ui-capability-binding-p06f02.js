export * from "./public-ui-capability-binding-p06f01.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p06f01.js";
import {G3A_U07_P06F02_KP_ID as KP,G3A_U07_P06F02_PATTERN_GROUP as GROUP,G3A_U07_P06F02_PATTERN_SPECS as PATTERNS,G3A_U07_P06F02_REQUIRED_CAPABILITY_IDS as REQUIRED,G3A_U07_P06F02_SOURCE_ID as SRC} from "../registry/g3a-u07-tabular-pattern-selector-projection-p06f02.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=i.selectedPatternGroupIds??[];
  if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=i.patternSpecIds??[];
  return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
function q2Binding(){
  return Object.freeze({
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([KP]),
    selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
    availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},{value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"表格規律題",enabled:true})]),
    questionType:"numeric",
    compatiblePatternGroups:Object.freeze([GROUP]),
    compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),
    patternSpecIds:Object.freeze([...SPEC_IDS]),
    questionCount:Object.freeze({min:1,max:240,default:20}),
    depthOptions:Object.freeze([]),
    contextOptions:Object.freeze([]),
    blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
    applicationSuitability:"APPLICATION_COMPATIBLE",
    applicationImplementationAllowed:false,
    tableDataModelRequired:true,
    dataDomainValidationRequired:true,
    tableRepresentationRequired:true,
    chartDataModelUsed:false,
    patternRelationReowned:false,
    symbolicNthTermFormulaUsed:false,
    q001ProductMutationAllowed:false,
    sameUnitMixedAdmission:false,
    crossUnitMixedAdmission:false,
    requiredCapabilityIds:REQUIRED,
    optionalCapabilityIds:Object.freeze([]),
    appliedRuntimeModifierIds:Object.freeze([]),
    frozenRuntimeProfile:"profile_table_data",
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
  });
}
export const resolvePublicUiCapabilityBinding=(i={})=>target(i)?q2Binding():baseResolve(i);
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];
  if(!b0.ok)e.push(...b0.errors.map(x=>`P06F02_BASE:${x}`));
  const b=q2Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||b.applicationImplementationAllowed||!b.tableDataModelRequired||!b.dataDomainValidationRequired||!b.tableRepresentationRequired||b.chartDataModelUsed||b.patternRelationReowned||b.symbolicNthTermFormulaUsed||b.q001ProductMutationAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.frozenRuntimeProfile!=="profile_table_data")e.push("P06F02_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q002KnowledgePointCount:1,q002PatternGroupCount:1,q002PatternSpecCount:SPEC_IDS.length});
}
