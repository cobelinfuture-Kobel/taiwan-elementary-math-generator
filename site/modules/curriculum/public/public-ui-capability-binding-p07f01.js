export * from "./public-ui-capability-binding-p06f20.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p06f20.js";
import {G6A_U05_P07F01_KP_ID as KP,G6A_U05_P07F01_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U05_P07F01_PATTERN_GROUP as GROUP,G6A_U05_P07F01_PATTERN_SPECS as PATTERNS,G6A_U05_P07F01_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U05_P07F01_SOURCE_ID as SRC} from "../registry/g6a-u05-ratio-notation-order-selector-projection-p07f01.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q1Binding(){return Object.freeze({
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
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"比的記法",enabled:true})]),
  questionType:"numeric",
  compatiblePatternGroups:Object.freeze([GROUP]),
  compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),
  depthOptions:Object.freeze([]),
  contextOptions:Object.freeze([]),
  blocked:false,
  errors:Object.freeze([]),
  warnings:Object.freeze([]),
  genericFallback:false,
  freeFormAI:false,
  applicationSuitability:"APPLICATION_COMPATIBLE",
  orderedRatioNotationRequired:true,
  antecedentFirstRequired:true,
  consequentSecondRequired:true,
  swappedTermsChangeRelation:true,
  ratioValueReownershipAllowed:false,
  equivalentRatioReownershipAllowed:false,
  simplestIntegerRatioReownershipAllowed:false,
  ratioPartitionApplicationReownershipAllowed:false,
  proportionCrossMultiplicationReownershipAllowed:false,
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
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q1Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F01_BASE:"+x));
  const b=q1Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.orderedRatioNotationRequired||!b.antecedentFirstRequired||!b.consequentSecondRequired||!b.swappedTermsChangeRelation||b.ratioValueReownershipAllowed||b.equivalentRatioReownershipAllowed||b.simplestIntegerRatioReownershipAllowed||b.ratioPartitionApplicationReownershipAllowed||b.proportionCrossMultiplicationReownershipAllowed||b.percentConversionReownershipAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_ratio_percent")e.push("P07F01_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q001KnowledgePointCount:1,q001PatternGroupCount:1,q001PatternSpecCount:PATTERNS.length});
}
