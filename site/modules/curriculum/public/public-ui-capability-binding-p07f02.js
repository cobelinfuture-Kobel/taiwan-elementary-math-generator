export * from "./public-ui-capability-binding-p07f01.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f01.js";
import {G6A_U05_P07F02_KP_ID as KP,G6A_U05_P07F02_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F02_PATTERN_GROUP as GROUP,G6A_U05_P07F02_PATTERN_SPECS as PATTERNS,G6A_U05_P07F02_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F02_SOURCE_ID as SRC} from "../registry/g6a-u05-ratio-value-selector-projection-p07f02.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q2Binding(){return Object.freeze({
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
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"比值",enabled:true})]),
  questionType:"numeric",
  compatiblePatternGroups:Object.freeze([GROUP]),
  compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),
  depthOptions:Object.freeze([]),
  contextOptions:Object.freeze([]),
  blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"APPLICATION_COMPATIBLE",
  q001OrderedRolePrerequisiteRequired:true,
  ratioValueComputationOwned:true,
  consequentNonzeroRequired:true,
  fractionEquivalenceRequired:true,
  q001RatioNotationReownershipAllowed:false,
  equivalentRatioReownershipAllowed:false,
  simplestIntegerRatioReownershipAllowed:false,
  ratioPartitionApplicationReownershipAllowed:false,
  proportionCrossMultiplicationReownershipAllowed:false,
  directProportionTableOrGraphAllowed:false,
  percentConversionReownershipAllowed:false,
  applicationContextAllowed:false,
  sameUnitMixedAdmission:false,
  crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,
  optionalCapabilityIds:OPTIONAL,
  appliedRuntimeModifierIds:Object.freeze([]),
  frozenRuntimeProfile:"profile_ratio_percent",
  sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q2Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F02_BASE:"+x));
  const b=q2Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.q001OrderedRolePrerequisiteRequired||!b.ratioValueComputationOwned||!b.consequentNonzeroRequired||!b.fractionEquivalenceRequired||b.q001RatioNotationReownershipAllowed||b.equivalentRatioReownershipAllowed||b.simplestIntegerRatioReownershipAllowed||b.ratioPartitionApplicationReownershipAllowed||b.proportionCrossMultiplicationReownershipAllowed||b.directProportionTableOrGraphAllowed||b.percentConversionReownershipAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_ratio_percent")e.push("P07F02_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q002KnowledgePointCount:1,q002PatternGroupCount:1,q002PatternSpecCount:PATTERNS.length});
}
