export * from "./public-ui-capability-binding-p07f05.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f05.js";
import {G6A_U06_P07F06_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U06_P07F06_KP_ID as KP,G6A_U06_P07F06_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U06_P07F06_PATTERN_GROUP as GROUP,G6A_U06_P07F06_PATTERN_SPECS as PATTERNS,G6A_U06_P07F06_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U06_P07F06_SOURCE_ID as SRC} from "../registry/g6a-u06-circle-circumference-formula-selector-projection-p07f06.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q6Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([
    {value:"sourceUnit",label:"整個單元",enabled:true},
    {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
    {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
  ].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"圓周長公式圖形題",enabled:true})]),
  questionType:"diagram",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"APPLICATION_COMPATIBLE_BUT_CONTEXT_NOT_ADMITTED",
  q004PiRelationPrerequisiteRequired:true,multiplicationPrerequisiteRequired:true,circleCircumferenceFormulaOwned:true,diameterFormulaRequired:"C = π × d",radiusFormulaRequired:"C = 2 × π × r",twoFormulaEquivalenceRequired:true,solveDiameterFromCircumferenceAllowed:false,solveRadiusFromCircumferenceAllowed:false,q004PiRelationTeachingReownershipAllowed:false,semicirclePerimeterAllowed:false,sectorArcLengthAllowed:false,compositeArcPerimeterAllowed:false,rollingWheelDistanceApplicationAllowed:false,applicationContextAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_geometry_formula",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q6Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F06_BASE:"+x));
  const b=q6Binding();
  if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.q004PiRelationPrerequisiteRequired||!b.multiplicationPrerequisiteRequired||!b.circleCircumferenceFormulaOwned||b.diameterFormulaRequired!=="C = π × d"||b.radiusFormulaRequired!=="C = 2 × π × r"||!b.twoFormulaEquivalenceRequired||b.solveDiameterFromCircumferenceAllowed||b.solveRadiusFromCircumferenceAllowed||b.q004PiRelationTeachingReownershipAllowed||b.semicirclePerimeterAllowed||b.sectorArcLengthAllowed||b.compositeArcPerimeterAllowed||b.rollingWheelDistanceApplicationAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_geometry_formula")e.push("P07F06_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q006KnowledgePointCount:1,q006PatternGroupCount:1,q006PatternSpecCount:PATTERNS.length});
}
