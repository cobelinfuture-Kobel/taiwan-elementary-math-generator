export * from "./public-ui-capability-binding-p06f18.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p06f18.js";
import {G6B_U05_P06F19_KP_ID as KP,G6B_U05_P06F19_PATTERN_GROUP as GROUP,G6B_U05_P06F19_PATTERN_SPECS as PATTERNS,G6B_U05_P06F19_REQUIRED_CAPABILITY_IDS as REQUIRED,G6B_U05_P06F19_SOURCE_ID as SRC} from "../registry/g6b-u05-sum-difference-selector-projection-p06f19.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q19Binding(){return Object.freeze({
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
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"和差問題",enabled:true})]),
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
  applicationImplementationAllowed:false,
  knownSumAndDifferenceCore:true,
  largerQuantityFormula:"(sum + difference) / 2",
  smallerQuantityFormula:"(sum - difference) / 2",
  sumReconstructionRequired:true,
  differenceReconstructionRequired:true,
  exactIntegerPartitionRequired:true,
  decimalProfileEnvelopeOnly:true,
  decimalPlaceValueSemanticCore:false,
  decimalNotationSemanticCore:false,
  sourceContextRepresentationOnly:true,
  sumMultipleProblemReownershipAllowed:false,
  differenceMultipleProblemReownershipAllowed:false,
  ageOrRepeatedRelationProblemReownershipAllowed:false,
  workOrDistributionStrategyReownershipAllowed:false,
  q020ReownershipAllowed:false,
  sameUnitMixedAdmission:false,
  crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,
  optionalCapabilityIds:Object.freeze([]),
  appliedRuntimeModifierIds:Object.freeze([]),
  frozenRuntimeProfile:"profile_decimal",
  sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q19Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];
  if(!b0.ok)e.push(...b0.errors.map(x=>"P06F19_BASE:"+x));
  const b=q19Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.knownSumAndDifferenceCore||!b.sumReconstructionRequired||!b.differenceReconstructionRequired||!b.exactIntegerPartitionRequired||!b.decimalProfileEnvelopeOnly||b.decimalPlaceValueSemanticCore||b.decimalNotationSemanticCore||!b.sourceContextRepresentationOnly||b.sumMultipleProblemReownershipAllowed||b.differenceMultipleProblemReownershipAllowed||b.ageOrRepeatedRelationProblemReownershipAllowed||b.workOrDistributionStrategyReownershipAllowed||b.q020ReownershipAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.frozenRuntimeProfile!=="profile_decimal")e.push("P06F19_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q019KnowledgePointCount:1,q019PatternGroupCount:1,q019PatternSpecCount:PATTERNS.length});
}
