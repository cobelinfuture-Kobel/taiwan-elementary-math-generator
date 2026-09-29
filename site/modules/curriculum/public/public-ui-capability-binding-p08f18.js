export * from "./public-ui-capability-binding-p08f17.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p08f17.js";
import {
  G6B_U06_P08F18_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U06_P08F18_CONTRACT_ONLY_CAPABILITY_IDS as CONTRACT_ONLY,
  G6B_U06_P08F18_KP_ID as KP,
  G6B_U06_P08F18_PATTERN_GROUP as GROUP,
  G6B_U06_P08F18_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U06_P08F18_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6B_U06_P08F18_SOURCE_ID as SRC,
  G6B_U06_P08F18_SPEC_IDS as SPEC_IDS
} from "../registry/g6b-u06-pie-chart-percent-angle-conversion-selector-projection-p08f18.js";

function target(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  if((i.selectedPatternGroupIds??[]).includes(GROUP.patternGroupId))return true;
  const specs=i.patternSpecIds??[];
  return specs.length>0&&specs.every(id=>SPEC_IDS.includes(id));
}
function current(){
  return Object.freeze({
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([KP]),
    selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
    availableSelectionModes:Object.freeze([
      {value:"sourceUnit",label:"整個單元",enabled:true},
      {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
      {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
      {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
    ].map(Object.freeze)),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"百分率與圓心角換算",enabled:true})]),
    questionType:"numeric",
    compatiblePatternGroups:Object.freeze([GROUP]),
    compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),
    patternSpecIds:SPEC_IDS,
    questionCount:Object.freeze({min:1,max:240,default:20}),
    depthOptions:Object.freeze([]),
    contextOptions:Object.freeze([]),
    blocked:false,
    errors:Object.freeze([]),
    warnings:Object.freeze([]),
    genericFallback:false,
    freeFormAI:false,
    applicationSuitability:"APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED",
    percentAngleConversionOwned:true,
    percentToCentralAngleRequired:true,
    centralAngleToPercentRequired:true,
    fullCircle100Percent360DegreesRequired:true,
    equivalenceBackCheckRequired:true,
    pieChartGraphicRequired:false,
    q014PartWholeTeachingReownershipAllowed:false,
    q016ComparePieChartsTeachingReownershipAllowed:false,
    q021QuantityFromRateTeachingReownershipAllowed:false,
    pieChartConstructionAllowed:false,
    genericSectorGeometryTeachingAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAdmission:false,
    crossUnitMixedAdmission:false,
    requiredCapabilityIds:REQUIRED,
    contractOnlyRequiredCapabilityIds:CONTRACT_ONLY,
    optionalCapabilityIds:OPTIONAL,
    appliedRuntimeModifierIds:MODIFIERS,
    frozenRuntimeProfile:"profile_ratio_percent",
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
  });
}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?current():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[],b=current();
  if(b0&&!b0.ok)e.push(...b0.errors.map(x=>"P08F18_BASE:"+x));
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.percentAngleConversionOwned||!b.percentToCentralAngleRequired||
    !b.centralAngleToPercentRequired||!b.fullCircle100Percent360DegreesRequired||!b.equivalenceBackCheckRequired||b.pieChartGraphicRequired||
    b.q014PartWholeTeachingReownershipAllowed||b.q016ComparePieChartsTeachingReownershipAllowed||b.q021QuantityFromRateTeachingReownershipAllowed||
    b.pieChartConstructionAllowed||b.genericSectorGeometryTeachingAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||
    b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.contractOnlyRequiredCapabilityIds.join("|")!==CONTRACT_ONLY.join("|")||
    b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_ratio_percent")
    e.push("P08F18_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q018KnowledgePointCount:1,q018PatternGroupCount:1,q018PatternSpecCount:2});
}
