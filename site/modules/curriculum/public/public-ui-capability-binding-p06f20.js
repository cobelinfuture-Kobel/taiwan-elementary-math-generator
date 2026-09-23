export * from "./public-ui-capability-binding-p06f19.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p06f19.js";
import {G6B_U05_P06F20_KP_ID as KP,G6B_U05_P06F20_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6B_U05_P06F20_PATTERN_GROUP as GROUP,G6B_U05_P06F20_PATTERN_SPECS as PATTERNS,G6B_U05_P06F20_REQUIRED_CAPABILITY_IDS as REQUIRED,G6B_U05_P06F20_SOURCE_ID as SRC} from "../registry/g6b-u05-age-repeated-relation-selector-projection-p06f20.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q20Binding(){return Object.freeze({
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
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"年齡關係",enabled:true})]),
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
  sourceWordProblemContextIsCore:true,
  genericApplicationOverlayAllowed:false,
  ageDifferenceInvariantCore:true,
  bothAgesUseSameTimeShift:true,
  shiftedMultiplicativeRelationRequired:true,
  currentAndShiftedBackSubstitutionRequired:true,
  positiveAgeStateRequired:true,
  q019SumDifferenceCoreReownershipAllowed:false,
  generalSumMultipleProblemReownershipAllowed:false,
  generalDifferenceMultipleProblemReownershipAllowed:false,
  workOrDistributionStrategyReownershipAllowed:false,
  genericSequenceOrRecurrenceReownershipAllowed:false,
  sameUnitMixedAdmission:false,
  crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,
  optionalCapabilityIds:OPTIONAL,
  appliedRuntimeModifierIds:Object.freeze(["mod_application_semantics"]),
  globalContextBindingUsed:false,
  pblProjectionUsed:false,
  frozenRuntimeProfile:"profile_word_problem",
  sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q20Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];
  if(!b0.ok)e.push(...b0.errors.map(x=>"P06F20_BASE:"+x));
  const b=q20Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.sourceWordProblemContextIsCore||!b.ageDifferenceInvariantCore||!b.bothAgesUseSameTimeShift||!b.shiftedMultiplicativeRelationRequired||!b.currentAndShiftedBackSubstitutionRequired||!b.positiveAgeStateRequired||b.genericApplicationOverlayAllowed||b.q019SumDifferenceCoreReownershipAllowed||b.generalSumMultipleProblemReownershipAllowed||b.generalDifferenceMultipleProblemReownershipAllowed||b.workOrDistributionStrategyReownershipAllowed||b.genericSequenceOrRecurrenceReownershipAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.globalContextBindingUsed||b.pblProjectionUsed||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.join("|")!==OPTIONAL.join("|")||b.frozenRuntimeProfile!=="profile_word_problem")e.push("P06F20_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q020KnowledgePointCount:1,q020PatternGroupCount:1,q020PatternSpecCount:PATTERNS.length});
}
