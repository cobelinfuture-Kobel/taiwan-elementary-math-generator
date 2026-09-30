export * from "./public-ui-capability-binding-p08f21.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p08f21.js";
import {G6A_U08_P08F22_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U08_P08F22_CONTRACT_ONLY_CAPABILITY_IDS as CONTRACT_ONLY,
  G6A_U08_P08F22_KP_ID as KP,G6A_U08_P08F22_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U08_P08F22_PATTERN_GROUP as GROUP,
  G6A_U08_P08F22_PATTERN_SPECS as SPECS,G6A_U08_P08F22_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U08_P08F22_SOURCE_ID as SRC,
  G6A_U08_P08F22_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u08-speed-unit-conversion-selector-projection-p08f22.js";
function request(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
function current(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"速率單位換算",enabled:true})]),questionType:"numeric",
  compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
  genericFallback:false,freeFormAI:false,applicationSuitability:"APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED",speedUnitConversionOwned:true,
  coupledDistanceTimeScalingRequired:true,equivalentRateInvariantRequired:true,sourceAndTargetRateUnitsRequired:true,answerBackConversionRequired:true,
  speedDistanceTimeRelationPrerequisiteAllowed:true,speedDistanceTimeRelationTeachingReownershipAllowed:false,averageSpeedReownershipAllowed:false,
  relativeSpeedMeetingChasingReownershipAllowed:false,effectiveSpeedCurrentWindReownershipAllowed:false,applicationContextAllowed:false,
  sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:REQUIRED,contractOnlyRequiredCapabilityIds:CONTRACT_ONLY,
  optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_speed_rate",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  finalFrozenW8Slice:true,w8FrozenQueueComplete:true
});}
export function resolvePublicUiCapabilityBinding(i={}){return request(i)?current():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[],b=current();if(b0&&!b0.ok)e.push(...b0.errors.map(x=>"P08F22_BASE:"+x));
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.speedUnitConversionOwned||!b.coupledDistanceTimeScalingRequired||
    !b.equivalentRateInvariantRequired||!b.sourceAndTargetRateUnitsRequired||!b.answerBackConversionRequired||!b.speedDistanceTimeRelationPrerequisiteAllowed||
    b.speedDistanceTimeRelationTeachingReownershipAllowed||b.averageSpeedReownershipAllowed||b.relativeSpeedMeetingChasingReownershipAllowed||
    b.effectiveSpeedCurrentWindReownershipAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||
    b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.contractOnlyRequiredCapabilityIds.join("|")!==CONTRACT_ONLY.join("|")||
    b.optionalCapabilityIds.join("|")!==OPTIONAL.join("|")||b.appliedRuntimeModifierIds.join("|")!=="mod_unit_conversion|mod_quantity_relation_semantics"||
    b.frozenRuntimeProfile!=="profile_speed_rate"||!b.finalFrozenW8Slice||!b.w8FrozenQueueComplete)e.push("P08F22_BINDING_INVALID");
  if(SPECS.length!==6)e.push("P08F22_BINDING_SPEC_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q022KnowledgePointCount:1,q022PatternGroupCount:1,q022PatternSpecCount:SPEC_IDS.length,w8FrozenQueueComplete:true});
}
