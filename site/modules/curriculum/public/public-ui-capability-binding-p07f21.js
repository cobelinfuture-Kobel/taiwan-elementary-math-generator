export * from "./public-ui-capability-binding-p07f20.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f20.js";
import {
  G6B_U06_P07F21_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U06_P07F21_KP_ID as KP,
  G6B_U06_P07F21_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6B_U06_P07F21_PATTERN_GROUP as GROUP,
  G6B_U06_P07F21_PATTERN_SPECS as SPECS,
  G6B_U06_P07F21_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U06_P07F21_SOURCE_ID as SRC,
  G6B_U06_P07F21_SPEC_IDS as SPEC_IDS
} from "../registry/g6b-u06-pie-chart-quantity-from-rate-selector-projection-p07f21.js";
function request(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
function q21Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"由圓形圖比率求數量",enabled:true})]),questionType:"numeric",
  compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
  genericFallback:false,freeFormAI:false,applicationSuitability:"APPLICATION_COMPATIBLE",pieChartQuantityFromRateOwned:true,
  totalQuantityGivenRequired:true,pieChartSectorRateGivenRequired:true,answerMustEqualTotalTimesRate:true,backSubstitutionRequired:true,
  percentageOfQuantityPrerequisiteConsumed:true,pieChartPartWholePrerequisiteConsumed:true,
  priorSameSourceOwnershipReownershipAllowed:false,percentAngleConversionAllowed:false,pieChartConstructionAllowed:false,crossChartComparisonAllowed:false,
  sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,
  appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_ratio_percent",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return request(i)?q21Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F21_BASE:"+x));const b=q21Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.pieChartQuantityFromRateOwned||!b.totalQuantityGivenRequired||
    !b.pieChartSectorRateGivenRequired||!b.answerMustEqualTotalTimesRate||!b.backSubstitutionRequired||!b.percentageOfQuantityPrerequisiteConsumed||
    !b.pieChartPartWholePrerequisiteConsumed||b.priorSameSourceOwnershipReownershipAllowed||b.percentAngleConversionAllowed||b.pieChartConstructionAllowed||
    b.crossChartComparisonAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||
    b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_ratio_percent")
    e.push("P07F21_BINDING_INVALID");
  if(SPECS.length!==3)e.push("P07F21_BINDING_SPEC_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q021KnowledgePointCount:1,q021PatternGroupCount:1,q021PatternSpecCount:SPEC_IDS.length});
}
