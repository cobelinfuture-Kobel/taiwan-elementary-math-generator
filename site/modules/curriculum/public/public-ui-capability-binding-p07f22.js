export * from "./public-ui-capability-binding-p07f21.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f21.js";
import {
  G6B_U04_P07F22_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U04_P07F22_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6B_U04_P07F22_PATTERN_GROUPS as GROUPS,
  G6B_U04_P07F22_PATTERN_SPECS as SPECS,
  G6B_U04_P07F22_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6B_U04_P07F22_SOURCE_ID as SRC,
  G6B_U04_P07F22_SPEC_IDS as SPEC_IDS,
  G6B_U04_P07F22_TARGET_KP_IDS as TARGETS
} from "../registry/g6b-u04-three-rate-quantity-relations-selector-projection-p07f22.js";
const GROUP_TO_KP=new Map(GROUPS.map(x=>[x.patternGroupId,x.primaryKnowledgePointId])),SPEC_TO_KP=new Map(SPECS.map(x=>[x.patternSpecId,x.knowledgePointId]));
function target(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return null;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&TARGETS.includes(ids[0])?ids[0]:null;
  const g=[...new Set((i.selectedPatternGroupIds??[]).map(id=>GROUP_TO_KP.get(id)).filter(Boolean))];if(g.length)return g.length===1?g[0]:null;
  const s=[...new Set((i.patternSpecIds??[]).map(id=>SPEC_TO_KP.get(id)).filter(Boolean))];return s.length===1?s[0]:null;
}
function binding(kp){
  const group=GROUPS.find(x=>x.primaryKnowledgePointId===kp),specIds=SPEC_IDS.filter(id=>SPEC_TO_KP.get(id)===kp);
  return Object.freeze({
    sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),selectedPatternGroupIds:Object.freeze([group.patternGroupId]),
    availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
      {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:group.displayName,enabled:true})]),questionType:"numeric",
    compatiblePatternGroups:Object.freeze([group]),compatiblePatternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:Object.freeze(specIds),
    questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
    genericFallback:false,freeFormAI:false,applicationSuitability:"APPLICATION_COMPATIBLE",baseComparisonRateRelationOwned:true,
    solveBaseQuantityOwned:kp==="kp_g6b_u04_find_base_quantity",solveComparisonQuantityOwned:kp==="kp_g6b_u04_find_comparison_quantity",
    solveRateFromQuantitiesOwned:kp==="kp_g6b_u04_find_rate_from_quantities",answerBackSubstitutionRequired:true,compatibleQuantityUnitsRequired:true,
    predecessorRoleClassificationReownershipAllowed:false,successiveRateChangeAllowed:false,multiStageDiscountGrowthDecreaseAllowed:false,
    sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,
    appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_ratio_percent",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
  });
}
export function resolvePublicUiCapabilityBinding(i={}){const kp=target(i);return kp?binding(kp):baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F22_BASE:"+x));
  for(const kp of TARGETS){const b=binding(kp),owned=[b.solveBaseQuantityOwned,b.solveComparisonQuantityOwned,b.solveRateFromQuantitiesOwned].filter(Boolean).length;
    if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.baseComparisonRateRelationOwned||owned!==1||!b.answerBackSubstitutionRequired||
      !b.compatibleQuantityUnitsRequired||b.predecessorRoleClassificationReownershipAllowed||b.successiveRateChangeAllowed||b.multiStageDiscountGrowthDecreaseAllowed||
      b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||
      b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_ratio_percent")e.push("P07F22_BINDING_INVALID:"+kp);}
  if(SPECS.length!==6||GROUPS.length!==3)e.push("P07F22_BINDING_CARDINALITY_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q022KnowledgePointCount:TARGETS.length,q022PatternGroupCount:GROUPS.length,q022PatternSpecCount:SPEC_IDS.length});
}
