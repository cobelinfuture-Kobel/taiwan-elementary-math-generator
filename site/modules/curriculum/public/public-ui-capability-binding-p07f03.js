export * from "./public-ui-capability-binding-p07f02.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f02.js";
import {G6A_U05_P07F03_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U05_P07F03_KP_ID as KP,G6A_U05_P07F03_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F03_PATTERN_GROUP as GROUP,G6A_U05_P07F03_PATTERN_SPECS as PATTERNS,G6A_U05_P07F03_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F03_SOURCE_ID as SRC} from "../registry/g6a-u05-equivalent-ratio-selector-projection-p07f03.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q3Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([
    {value:"sourceUnit",label:"整個單元",enabled:true},
    {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
    {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
  ].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"相等的比",enabled:true})]),
  questionType:"numeric",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"APPLICATION_COMPATIBLE",
  q001OrderedRolePrerequisiteRequired:true,q002RatioValuePrerequisiteRequired:true,equivalentRatioOwned:true,commonScaleFactorBothTermsRequired:true,commonScaleFactorNonzeroRequired:true,ratioValueInvariantRequired:true,reverseExactDivisionAllowed:true,
  crossProductValidatorInternalAllowed:true,crossMultiplicationTeachingAllowed:false,q001RatioNotationReownershipAllowed:false,q002RatioValueReownershipAllowed:false,simplestIntegerRatioReownershipAllowed:false,ratioPartitionApplicationReownershipAllowed:false,percentConversionReownershipAllowed:false,applicationContextAllowed:false,genericIntegerOperationsDrillAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_integer_operations",semanticProfileInterpretation:"EXECUTION_ENVELOPE_ONLY_NOT_KNOWLEDGE_POINT_SEMANTIC_OWNER",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q3Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F03_BASE:"+x));
  const b=q3Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.q001OrderedRolePrerequisiteRequired||!b.q002RatioValuePrerequisiteRequired||!b.equivalentRatioOwned||!b.commonScaleFactorBothTermsRequired||!b.commonScaleFactorNonzeroRequired||!b.ratioValueInvariantRequired||!b.reverseExactDivisionAllowed||!b.crossProductValidatorInternalAllowed||b.crossMultiplicationTeachingAllowed||b.q001RatioNotationReownershipAllowed||b.q002RatioValueReownershipAllowed||b.simplestIntegerRatioReownershipAllowed||b.ratioPartitionApplicationReownershipAllowed||b.percentConversionReownershipAllowed||b.applicationContextAllowed||b.genericIntegerOperationsDrillAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.join("|")!==MODIFIERS.join("|")||b.frozenRuntimeProfile!=="profile_integer_operations"||b.semanticProfileInterpretation!=="EXECUTION_ENVELOPE_ONLY_NOT_KNOWLEDGE_POINT_SEMANTIC_OWNER")e.push("P07F03_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q003KnowledgePointCount:1,q003PatternGroupCount:1,q003PatternSpecCount:PATTERNS.length});
}
