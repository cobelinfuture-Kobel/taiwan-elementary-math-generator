export * from "./public-ui-capability-binding-p07f19.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f19.js";
import {G6B_U05_P07F20_APPLIED_MODIFIER_IDS as MODIFIERS,G6B_U05_P07F20_EFFECTIVE_ADDED_CAPABILITY_IDS as EFFECTIVE_ADDED,G6B_U05_P07F20_KP_ID as KP,G6B_U05_P07F20_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6B_U05_P07F20_PATTERN_GROUP as GROUP,G6B_U05_P07F20_PATTERN_SPECS as SPECS,G6B_U05_P07F20_REQUIRED_CAPABILITY_IDS as REQUIRED,G6B_U05_P07F20_SOURCE_ID as SRC,G6B_U05_P07F20_SPEC_IDS as SPEC_IDS} from "../registry/g6b-u05-work-distribution-selector-projection-p07f20.js";
function request(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
function q20Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},{value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"工作分配與策略問題",enabled:true})]),questionType:"numeric",
  compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
  genericFallback:false,freeFormAI:false,applicationSuitability:"DIRECT_MULTI_CONDITION_SOURCE_BACKED",workDistributionStrategyOwned:true,
  multipleConditionsMustBindSameUnknownQuantities:true,answerMustBackSubstituteAllSourceConditions:true,integerDivisionClosureConsumed:true,
  patternFactorCollisionPolicy:"EXPLICIT_PATTERN_RELATION_OVERRIDES_FACTOR_MULTIPLE",factorMultipleProfileRuntimeEnvelopeOnly:true,
  priorSameSourceOwnershipReownershipAllowed:false,pureCombinatoricsAllowed:false,routeCountingAllowed:false,genericApplicationOverlayAllowed:false,
  sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,effectiveAddedCapabilityIds:EFFECTIVE_ADDED,
  appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_factor_multiple",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return request(i)?q20Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F20_BASE:"+x));const b=q20Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.workDistributionStrategyOwned||!b.multipleConditionsMustBindSameUnknownQuantities||
    !b.answerMustBackSubstituteAllSourceConditions||!b.integerDivisionClosureConsumed||b.patternFactorCollisionPolicy!=="EXPLICIT_PATTERN_RELATION_OVERRIDES_FACTOR_MULTIPLE"||
    !b.factorMultipleProfileRuntimeEnvelopeOnly||b.priorSameSourceOwnershipReownershipAllowed||b.pureCombinatoricsAllowed||b.routeCountingAllowed||
    b.genericApplicationOverlayAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||
    b.optionalCapabilityIds.length!==0||b.effectiveAddedCapabilityIds.join("|")!=="cap_integer_division"||b.appliedRuntimeModifierIds.length!==0||
    b.frozenRuntimeProfile!=="profile_factor_multiple")e.push("P07F20_BINDING_INVALID");
  if(SPECS.length!==3)e.push("P07F20_BINDING_SPEC_COUNT_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q020KnowledgePointCount:1,q020PatternGroupCount:1,q020PatternSpecCount:SPEC_IDS.length});
}
