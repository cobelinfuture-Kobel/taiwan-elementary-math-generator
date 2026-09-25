export * from "./public-ui-capability-binding-p07f22.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f22.js";
import {
  G6A_U08_P07F23_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U08_P07F23_KP_ID as KP,
  G6A_U08_P07F23_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6A_U08_P07F23_PATTERN_GROUP as GROUP,
  G6A_U08_P07F23_PATTERN_SPECS as SPECS,
  G6A_U08_P07F23_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6A_U08_P07F23_SOURCE_ID as SRC,
  G6A_U08_P07F23_SPEC_IDS as SPEC_IDS
} from "../registry/g6a-u08-speed-distance-time-selector-projection-p07f23.js";
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
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"速率、距離與時間互求",enabled:true})]),questionType:"numeric",
  compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
  genericFallback:false,freeFormAI:false,applicationSuitability:"APPLICATION_COMPATIBLE",speedDistanceTimeRelationOwned:true,
  fixedSpeedContextRequired:true,compatibleDistanceTimeRateUnitsRequired:true,quantitySemanticRoleBindingRequired:true,answerBackSubstitutionRequired:true,
  speedUnitConversionOwnershipAllowed:false,averageSpeedOwnershipAllowed:false,relativeSpeedMeetingChasingOwnershipAllowed:false,effectiveSpeedCurrentWindOwnershipAllowed:false,
  sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,
  appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_speed_rate",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return request(i)?binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F23_BASE:"+x));const b=binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.speedDistanceTimeRelationOwned||!b.fixedSpeedContextRequired||
    !b.compatibleDistanceTimeRateUnitsRequired||!b.quantitySemanticRoleBindingRequired||!b.answerBackSubstitutionRequired||b.speedUnitConversionOwnershipAllowed||
    b.averageSpeedOwnershipAllowed||b.relativeSpeedMeetingChasingOwnershipAllowed||b.effectiveSpeedCurrentWindOwnershipAllowed||
    b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||
    b.optionalCapabilityIds.join("|")!==OPTIONAL.join("|")||b.appliedRuntimeModifierIds.join("|")!=="mod_quantity_relation_semantics"||b.frozenRuntimeProfile!=="profile_speed_rate")
    e.push("P07F23_BINDING_INVALID");
  if(SPECS.length!==3)e.push("P07F23_BINDING_SPEC_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q023KnowledgePointCount:1,q023PatternGroupCount:1,q023PatternSpecCount:SPEC_IDS.length});
}
