export * from "./public-ui-capability-binding-p07f07.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f07.js";
import {G5B_U08_P07F08_APPLIED_MODIFIER_IDS as MODIFIERS,G5B_U08_P07F08_KP_ID as KP,G5B_U08_P07F08_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G5B_U08_P07F08_PATTERN_GROUP as GROUP,G5B_U08_P07F08_PATTERN_SPECS as PATTERNS,G5B_U08_P07F08_REQUIRED_CAPABILITY_IDS as REQUIRED,G5B_U08_P07F08_SOURCE_ID as SRC} from "../registry/g5b-u08-ratio-fraction-decimal-percent-conversion-selector-projection-p07f08.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q8Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([
    {value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
  ].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"分數小數百分率互換",enabled:true})]),
  questionType:"numeric",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"APPLICATION_COMPATIBLE_BUT_CONTEXT_NOT_ADMITTED",
  ratioValuePrerequisiteRequired:true,decimalFractionConversionPrerequisiteRequired:true,representationEquivalenceOwned:true,
  percentMayExceed100:true,percentIdentityOnePercentEqualsOneOverHundred:true,simplifiedFractionOutputRequired:true,
  findPercentageRateFromTwoQuantitiesAllowed:false,percentageOfQuantityAllowed:false,findBaseQuantityAllowed:false,discountIncreaseApplicationAllowed:false,
  roleBasedBaseComparisonQuantityTeachingAllowed:false,applicationContextAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_ratio_percent",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q8Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F08_BASE:"+x));const b=q8Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.ratioValuePrerequisiteRequired||!b.decimalFractionConversionPrerequisiteRequired||!b.representationEquivalenceOwned||!b.percentMayExceed100||!b.percentIdentityOnePercentEqualsOneOverHundred||!b.simplifiedFractionOutputRequired||b.findPercentageRateFromTwoQuantitiesAllowed||b.percentageOfQuantityAllowed||b.findBaseQuantityAllowed||b.discountIncreaseApplicationAllowed||b.roleBasedBaseComparisonQuantityTeachingAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_ratio_percent")e.push("P07F08_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q008KnowledgePointCount:1,q008PatternGroupCount:1,q008PatternSpecCount:PATTERNS.length});
}
