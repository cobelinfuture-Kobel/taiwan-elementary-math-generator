export * from "./public-ui-capability-binding-p07f23.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f23.js";
import {
  G6B_U04_P07F24_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U04_P07F24_KP_ID as KP,
  G6B_U04_P07F24_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6B_U04_P07F24_PATTERN_GROUP as GROUP,
  G6B_U04_P07F24_PATTERN_SPECS as SPECS,
  G6B_U04_P07F24_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U04_P07F24_SOURCE_ID as SRC,
  G6B_U04_P07F24_SPEC_IDS as SPEC_IDS
} from "../registry/g6b-u04-successive-rate-change-selector-projection-p07f24.js";
function request(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
function binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"連續增減率",enabled:true})]),questionType:"numeric",
  compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
  genericFallback:false,freeFormAI:false,applicationSuitability:"APPLICATION_COMPATIBLE",successiveRateChangeOwned:true,
  stageFactorMultiplicationRequired:true,stage1OutputBecomesStage2BaseRequired:true,answerBackSubstitutionRequired:true,directPercentageAdditionAllowed:false,
  predecessorKnowledgePointReownershipAllowed:false,simpleSingleStageDiscountIncreaseReownershipAllowed:false,
  sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,
  appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_ratio_percent",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return request(i)?binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F24_BASE:"+x));const b=binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.successiveRateChangeOwned||!b.stageFactorMultiplicationRequired||
    !b.stage1OutputBecomesStage2BaseRequired||!b.answerBackSubstitutionRequired||b.directPercentageAdditionAllowed||
    b.predecessorKnowledgePointReownershipAllowed||b.simpleSingleStageDiscountIncreaseReownershipAllowed||
    b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||
    b.optionalCapabilityIds.join("|")!==OPTIONAL.join("|")||b.appliedRuntimeModifierIds.join("|")!=="mod_application_semantics"||b.frozenRuntimeProfile!=="profile_ratio_percent")
    e.push("P07F24_BINDING_INVALID");
  if(SPECS.length!==4)e.push("P07F24_BINDING_SPEC_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q024KnowledgePointCount:1,q024PatternGroupCount:1,q024PatternSpecCount:SPEC_IDS.length});
}
