export * from "./public-ui-capability-binding-p07f24.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f24.js";
import {
  G6A_U08_P07F25_AVERAGE_KP_ID as AVG_KP,
  G6A_U08_P07F25_AVERAGE_MODIFIER_IDS as AVG_MODS,
  G6A_U08_P07F25_AVERAGE_OPTIONAL_CAPABILITY_IDS as AVG_OPTIONAL,
  G6A_U08_P07F25_AVERAGE_REQUIRED_CAPABILITY_IDS as AVG_REQUIRED,
  G6A_U08_P07F25_AVERAGE_SPEC_IDS as AVG_SPECS,
  G6A_U08_P07F25_PATTERN_GROUPS as GROUPS,
  G6A_U08_P07F25_RELATIVE_KP_ID as REL_KP,
  G6A_U08_P07F25_RELATIVE_MODIFIER_IDS as REL_MODS,
  G6A_U08_P07F25_RELATIVE_OPTIONAL_CAPABILITY_IDS as REL_OPTIONAL,
  G6A_U08_P07F25_RELATIVE_REQUIRED_CAPABILITY_IDS as REL_REQUIRED,
  G6A_U08_P07F25_RELATIVE_SPEC_IDS as REL_SPECS,
  G6A_U08_P07F25_SOURCE_ID as SRC
} from "../registry/g6a-u08-average-relative-speed-selector-projection-p07f25.js";

const TARGETS=new Set([AVG_KP,REL_KP]),AVG_GROUP=GROUPS.find(x=>x.primaryKnowledgePointId===AVG_KP),REL_GROUP=GROUPS.find(x=>x.primaryKnowledgePointId===REL_KP);
function requestedKp(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return null;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&TARGETS.has(ids[0])?ids[0]:null;
  const gs=i.selectedPatternGroupIds??[];if(gs.length===1){if(gs[0]===AVG_GROUP.patternGroupId)return AVG_KP;if(gs[0]===REL_GROUP.patternGroupId)return REL_KP;return null;}
  const ss=i.patternSpecIds??[];if(ss.length&&ss.every(id=>AVG_SPECS.includes(id)))return AVG_KP;if(ss.length&&ss.every(id=>REL_SPECS.includes(id)))return REL_KP;
  return null;
}
function binding(kp){
  const avg=kp===AVG_KP,group=avg?AVG_GROUP:REL_GROUP,specIds=avg?AVG_SPECS:REL_SPECS,required=avg?AVG_REQUIRED:REL_REQUIRED,
    optional=avg?AVG_OPTIONAL:REL_OPTIONAL,mods=avg?AVG_MODS:REL_MODS;
  return Object.freeze({
    sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),selectedPatternGroupIds:Object.freeze([group.patternGroupId]),
    availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
      {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:avg?"全程平均速率":"相遇與追趕",enabled:true})]),questionType:"numeric",
    compatiblePatternGroups:Object.freeze([group]),compatiblePatternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:specIds,
    questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
    genericFallback:false,freeFormAI:false,applicationSuitability:"APPLICATION_COMPATIBLE",
    averageSpeedOwned:avg,relativeSpeedMeetingChasingOwned:!avg,totalDistanceOverTotalTimeRequired:avg,directSegmentSpeedArithmeticMeanAllowed:false,
    meetingUsesSpeedSumRequired:!avg,chasingUsesPositiveSpeedDifferenceRequired:!avg,compatibleDistanceTimeRateUnitsRequired:true,
    quantitySemanticRoleBindingRequired:true,answerBackSubstitutionRequired:true,speedUnitConversionOwnershipAllowed:false,effectiveSpeedCurrentWindOwnershipAllowed:false,
    predecessorSpeedRelationReownershipAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:required,optionalCapabilityIds:optional,
    appliedRuntimeModifierIds:mods,frozenRuntimeProfile:"profile_speed_rate",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
  });
}
export function resolvePublicUiCapabilityBinding(i={}){const kp=requestedKp(i);return kp?binding(kp):baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F25_BASE:"+x));
  const a=binding(AVG_KP),r=binding(REL_KP);
  if(a.blocked||a.questionType!=="numeric"||a.questionCount.max!==240||!a.averageSpeedOwned||a.relativeSpeedMeetingChasingOwned||
    !a.totalDistanceOverTotalTimeRequired||a.directSegmentSpeedArithmeticMeanAllowed||a.meetingUsesSpeedSumRequired||a.chasingUsesPositiveSpeedDifferenceRequired||
    a.speedUnitConversionOwnershipAllowed||a.effectiveSpeedCurrentWindOwnershipAllowed||a.predecessorSpeedRelationReownershipAllowed||
    a.sameUnitMixedAdmission||a.crossUnitMixedAdmission||a.requiredCapabilityIds.join("|")!==AVG_REQUIRED.join("|")||
    a.optionalCapabilityIds.join("|")!==AVG_OPTIONAL.join("|")||a.appliedRuntimeModifierIds.join("|")!=="mod_quantity_relation_semantics")
    e.push("P07F25_AVERAGE_BINDING_INVALID");
  if(r.blocked||r.questionType!=="numeric"||r.questionCount.max!==240||r.averageSpeedOwned||!r.relativeSpeedMeetingChasingOwned||
    r.totalDistanceOverTotalTimeRequired||r.directSegmentSpeedArithmeticMeanAllowed||!r.meetingUsesSpeedSumRequired||!r.chasingUsesPositiveSpeedDifferenceRequired||
    r.speedUnitConversionOwnershipAllowed||r.effectiveSpeedCurrentWindOwnershipAllowed||r.predecessorSpeedRelationReownershipAllowed||
    r.sameUnitMixedAdmission||r.crossUnitMixedAdmission||r.requiredCapabilityIds.join("|")!==REL_REQUIRED.join("|")||
    r.optionalCapabilityIds.join("|")!==REL_OPTIONAL.join("|")||r.appliedRuntimeModifierIds.join("|")!=="mod_quantity_relation_semantics|mod_application_semantics")
    e.push("P07F25_RELATIVE_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q025KnowledgePointCount:2,q025PatternGroupCount:2,q025PatternSpecCount:3});
}
