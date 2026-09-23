export * from "./public-ui-capability-binding-p07f15.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f15.js";
import {
  G5B_U08_P07F16_APPLICATION_KP_ID as APP,
  G5B_U08_P07F16_APPLIED_MODIFIER_IDS_BY_KP as MODIFIERS_BY_KP,
  G5B_U08_P07F16_FIND_BASE_KP_ID as FIND,
  G5B_U08_P07F16_OPTIONAL_CAPABILITY_IDS_BY_KP as OPTIONAL_BY_KP,
  G5B_U08_P07F16_PATTERN_GROUPS as GROUPS,
  G5B_U08_P07F16_PATTERN_SPECS as SPECS,
  G5B_U08_P07F16_REQUIRED_CAPABILITY_IDS_BY_KP as REQUIRED_BY_KP,
  G5B_U08_P07F16_SOURCE_ID as SRC,
  G5B_U08_P07F16_TARGET_KP_IDS as TARGETS
} from "../registry/g5b-u08-find-base-percent-application-selector-projection-p07f16.js";
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x])),SPECS_BY_KP=new Map(TARGETS.map(kp=>[kp,SPECS.filter(x=>x.knowledgePointId===kp)]));
function target(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return null;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&TARGETS.includes(ids[0])?ids[0]:null;
  const gs=i.selectedPatternGroupIds??[];if(gs.length){const g=GROUPS.find(x=>x.patternGroupId===gs[0]);return gs.length===1?g?.primaryKnowledgePointId??null:null;}
  const ss=i.patternSpecIds??[];if(ss.length){const kps=[...new Set(ss.map(id=>SPECS.find(x=>x.patternSpecId===id)?.knowledgePointId).filter(Boolean))];return kps.length===1&&ss.every(id=>SPECS.some(x=>x.patternSpecId===id))?kps[0]:null;}
  return null;
}
function q16Binding(kp){
  const g=GROUP_BY_KP.get(kp),specs=SPECS_BY_KP.get(kp),isFind=kp===FIND;
  return Object.freeze({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),selectedPatternGroupIds:Object.freeze([g.patternGroupId]),
    availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},{value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:isFind?"由百分率反求基準量":"折扣與增減百分率",enabled:true})]),questionType:"numeric",
    compatiblePatternGroups:Object.freeze([g]),compatiblePatternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:Object.freeze(specs.map(x=>x.patternSpecId)),
    questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
    applicationSuitability:isFind?"SUPPLEMENTARY_DIRECT_APPLICATION_ADMITTED":"SOURCE_BACKED_APPLICATION_ADMITTED",findBaseOwned:isFind,discountIncreaseApplicationOwned:!isFind,
    reverseBaseReconstructionRequired:isFind,discountRetentionOrGrowthRoleRequired:!isFind,supplementaryReverseBaseEvidenceRequired:isFind,primaryDiscountMarkupEvidenceRequired:!isFind,
    q008ConversionReownershipAllowed:false,q013FindRateReownershipAllowed:false,q013PercentageQuantityReownershipAllowed:false,genericRatioApplicationReownershipAllowed:false,sugarWaterRatioAsCoreAllowed:false,
    sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:REQUIRED_BY_KP[kp],optionalCapabilityIds:OPTIONAL_BY_KP[kp],appliedRuntimeModifierIds:MODIFIERS_BY_KP[kp],
    frozenRuntimeProfile:"profile_ratio_percent",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"});
}
export function resolvePublicUiCapabilityBinding(i={}){const kp=target(i);return kp?q16Binding(kp):baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F16_BASE:"+x));
  for(const kp of TARGETS){const b=q16Binding(kp),isFind=kp===FIND;
    if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||b.findBaseOwned!==isFind||b.discountIncreaseApplicationOwned===isFind||b.reverseBaseReconstructionRequired!==isFind||b.discountRetentionOrGrowthRoleRequired===isFind||
      b.supplementaryReverseBaseEvidenceRequired!==isFind||b.primaryDiscountMarkupEvidenceRequired===isFind||b.q008ConversionReownershipAllowed||b.q013FindRateReownershipAllowed||b.q013PercentageQuantityReownershipAllowed||
      b.genericRatioApplicationReownershipAllowed||b.sugarWaterRatioAsCoreAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED_BY_KP[kp].join("|")||
      b.optionalCapabilityIds.join("|")!==OPTIONAL_BY_KP[kp].join("|")||b.appliedRuntimeModifierIds.join("|")!==MODIFIERS_BY_KP[kp].join("|")||b.frozenRuntimeProfile!=="profile_ratio_percent")e.push("P07F16_BINDING_INVALID:"+kp);
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q016KnowledgePointCount:2,q016PatternGroupCount:2,q016PatternSpecCount:5});
}
