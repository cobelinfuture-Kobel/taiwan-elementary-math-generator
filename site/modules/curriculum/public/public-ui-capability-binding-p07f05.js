export * from "./public-ui-capability-binding-p07f04.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f04.js";
import {G6A_U05_P07F05_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U05_P07F05_KP_ID as KP,G6A_U05_P07F05_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F05_PATTERN_GROUP as GROUP,G6A_U05_P07F05_PATTERN_SPECS as PATTERNS,G6A_U05_P07F05_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F05_SOURCE_ID as SRC} from "../registry/g6a-u05-simplify-ratio-selector-projection-p07f05.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q5Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([
    {value:"sourceUnit",label:"整個單元",enabled:true},
    {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
    {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
  ].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"最簡整數比",enabled:true})]),
  questionType:"numeric",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"APPLICATION_COMPATIBLE_BUT_CONTEXT_NOT_ADMITTED",
  q001OrderedRolePrerequisiteRequired:true,q002RatioValuePrerequisiteRequired:true,q003EquivalentRatioPrerequisiteRequired:true,greatestCommonFactorPrerequisiteRequired:true,
  simplifyRatioOwned:true,positiveIntegerInputRatioOnly:true,commonDivisorExactOnBothTermsRequired:true,directGcdDivisionAllowed:true,repeatedCommonFactorDivisionAllowed:true,finalGcdOneRequired:true,outputCoprimeRequired:true,ratioValueInvariantRequired:true,antecedentConsequentOrderRequired:true,
  q001RatioNotationReownershipAllowed:false,q002RatioValueReownershipAllowed:false,q003EquivalentRatioReownershipAllowed:false,decimalRatioInputNormalizationAllowed:false,fractionRatioInputNormalizationAllowed:false,ratioPartitionApplicationReownershipAllowed:false,proportionCrossMultiplicationInternalAllowed:false,proportionCrossMultiplicationTeachingAllowed:false,percentConversionReownershipAllowed:false,applicationContextAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_factor_multiple",semanticProfileInterpretation:"FACTOR_MULTIPLE_EXECUTION_ENVELOPE_ALIGNED_WITH_COPRIME_RATIO_SIMPLIFICATION",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q5Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F05_BASE:"+x));
  const b=q5Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.q001OrderedRolePrerequisiteRequired||!b.q002RatioValuePrerequisiteRequired||!b.q003EquivalentRatioPrerequisiteRequired||!b.greatestCommonFactorPrerequisiteRequired||!b.simplifyRatioOwned||!b.positiveIntegerInputRatioOnly||!b.commonDivisorExactOnBothTermsRequired||!b.directGcdDivisionAllowed||!b.repeatedCommonFactorDivisionAllowed||!b.finalGcdOneRequired||!b.outputCoprimeRequired||!b.ratioValueInvariantRequired||!b.antecedentConsequentOrderRequired||b.q001RatioNotationReownershipAllowed||b.q002RatioValueReownershipAllowed||b.q003EquivalentRatioReownershipAllowed||b.decimalRatioInputNormalizationAllowed||b.fractionRatioInputNormalizationAllowed||b.ratioPartitionApplicationReownershipAllowed||b.proportionCrossMultiplicationInternalAllowed||b.proportionCrossMultiplicationTeachingAllowed||b.percentConversionReownershipAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_factor_multiple"||b.semanticProfileInterpretation!=="FACTOR_MULTIPLE_EXECUTION_ENVELOPE_ALIGNED_WITH_COPRIME_RATIO_SIMPLIFICATION")e.push("P07F05_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q005KnowledgePointCount:1,q005PatternGroupCount:1,q005PatternSpecCount:PATTERNS.length});
}
