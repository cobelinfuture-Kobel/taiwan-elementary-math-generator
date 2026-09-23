export * from "./public-ui-capability-binding-p07f12.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f12.js";
import {
  G5B_U08_P07F13_APPLIED_MODIFIER_IDS as MODIFIERS,
  G5B_U08_P07F13_KP_IDS as KPS,
  G5B_U08_P07F13_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G5B_U08_P07F13_PATTERN_GROUPS as GROUPS,
  G5B_U08_P07F13_PATTERN_SPECS as PATTERNS,
  G5B_U08_P07F13_RATE_KP_ID as RATE_KP,
  G5B_U08_P07F13_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G5B_U08_P07F13_SOURCE_ID as SRC,
  G5B_U08_P07F13_SPEC_IDS_BY_KP as SPEC_IDS_BY_KP
} from "../registry/g5b-u08-rate-percentage-quantity-selector-projection-p07f13.js";
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x])),BY_SPEC=new Map(PATTERNS.map(x=>[x.patternSpecId,x]));
function resolveKp(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return null;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&KPS.includes(ids[0])?ids[0]:null;
  const gs=i.selectedPatternGroupIds??[];if(gs.length===1){const g=GROUPS.find(x=>x.patternGroupId===gs[0]);if(g)return g.primaryKnowledgePointId;}
  const ss=i.patternSpecIds??[];if(ss.length){const k=[...new Set(ss.map(id=>BY_SPEC.get(id)?.knowledgePointId).filter(Boolean))];if(k.length===1&&ss.every(id=>BY_SPEC.has(id)))return k[0];}
  return null;
}
function q13Binding(kp){
  const group=GROUP_BY_KP.get(kp),ids=SPEC_IDS_BY_KP[kp],isRate=kp===RATE_KP;
  return Object.freeze({
    sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),selectedPatternGroupIds:Object.freeze([group.patternGroupId]),
    availableSelectionModes:Object.freeze([
      {value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
      {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
    ].map(Object.freeze)),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:isRate?"由兩量求百分率":"求百分率對應量",enabled:true})]),
    questionType:"numeric",compatiblePatternGroups:Object.freeze([group]),compatiblePatternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:Object.freeze(ids),
    questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
    applicationSuitability:"SOURCE_BACKED_APPLICATION_ADMITTED",baseQuantityRoleRequired:true,
    findPercentageRateOwned:isRate,percentageOfQuantityOwned:!isRate,
    denominatorMustBeBaseQuantity:isRate,comparisonQuantityEqualsBaseTimesRate:!isRate,
    q008RepresentationConversionTeachingReownershipAllowed:false,q016FindBaseQuantityAllowed:false,q016DiscountIncreaseApplicationAllowed:false,
    sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
    requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_ratio_percent",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
  });
}
export function resolvePublicUiCapabilityBinding(i={}){const kp=resolveKp(i);return kp?q13Binding(kp):baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F13_BASE:"+x));
  for(const kp of KPS){const b=q13Binding(kp),isRate=kp===RATE_KP;
    if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.baseQuantityRoleRequired||b.findPercentageRateOwned!==isRate||b.percentageOfQuantityOwned===isRate||b.denominatorMustBeBaseQuantity!==isRate||b.comparisonQuantityEqualsBaseTimesRate===isRate||b.q008RepresentationConversionTeachingReownershipAllowed||b.q016FindBaseQuantityAllowed||b.q016DiscountIncreaseApplicationAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_ratio_percent")e.push("P07F13_BINDING_INVALID:"+kp);
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q013KnowledgePointCount:2,q013PatternGroupCount:2,q013PatternSpecCount:PATTERNS.length});
}
