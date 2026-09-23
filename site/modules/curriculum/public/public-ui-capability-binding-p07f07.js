export * from "./public-ui-capability-binding-p07f06.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f06.js";
import {G6A_U09_P07F07_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U09_P07F07_KP_ID as KP,G6A_U09_P07F07_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U09_P07F07_PATTERN_GROUP as GROUP,G6A_U09_P07F07_PATTERN_SPECS as PATTERNS,G6A_U09_P07F07_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U09_P07F07_SOURCE_ID as SRC} from "../registry/g6a-u09-scale-factor-length-selector-projection-p07f07.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q7Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([
    {value:"sourceUnit",label:"整個單元",enabled:true},
    {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
    {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
  ].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"放大縮小倍數與邊長",enabled:true})]),
  questionType:"numeric",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"APPLICATION_COMPATIBLE_BUT_CONTEXT_NOT_ADMITTED",
  equivalentRatioPrerequisiteRequired:true,scaleFactorLengthOwned:true,oneCommonScaleFactorRequired:true,positiveNonzeroScaleFactorRequired:true,fractionOrDecimalScaleFactorAllowed:true,sameUnitLengthPairOnly:true,
  unitConversionAllowed:false,anglePreservationTeachingAllowed:false,scaleDrawingConstructionAllowed:false,mapScaleDistanceAllowed:false,scaleAreaChangeAllowed:false,mapScaleBarInterpretationAllowed:false,applicationContextAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_quantity_measurement",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q7Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F07_BASE:"+x));
  const b=q7Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||!b.equivalentRatioPrerequisiteRequired||!b.scaleFactorLengthOwned||!b.oneCommonScaleFactorRequired||!b.positiveNonzeroScaleFactorRequired||!b.fractionOrDecimalScaleFactorAllowed||!b.sameUnitLengthPairOnly||b.unitConversionAllowed||b.anglePreservationTeachingAllowed||b.scaleDrawingConstructionAllowed||b.mapScaleDistanceAllowed||b.scaleAreaChangeAllowed||b.mapScaleBarInterpretationAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.join("|")!==OPTIONAL.join("|")||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_quantity_measurement")e.push("P07F07_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q007KnowledgePointCount:1,q007PatternGroupCount:1,q007PatternSpecCount:PATTERNS.length});
}
