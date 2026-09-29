export * from "./public-ui-capability-binding-p08f16.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p08f16.js";
import {G6A_U06_P08F17_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U06_P08F17_CONTRACT_ONLY_CAPABILITY_IDS as CONTRACT_ONLY,G6A_U06_P08F17_KP_ID as KP,G6A_U06_P08F17_PATTERN_GROUP as GROUP,G6A_U06_P08F17_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U06_P08F17_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U06_P08F17_SOURCE_ID as SRC,G6A_U06_P08F17_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u06-composite-arc-perimeter-selector-projection-p08f17.js";
function target(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  if((i.selectedPatternGroupIds??[]).includes(GROUP.patternGroupId))return true;
  return (i.patternSpecIds??[]).some(id=>SPEC_IDS.includes(id));
}
function current(){
  return Object.freeze({
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
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"複合弧形周長圖形題",enabled:true})]),
    questionType:"diagram",
    compatiblePatternGroups:Object.freeze([GROUP]),
    compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),
    patternSpecIds:SPEC_IDS,
    questionCount:Object.freeze({min:1,max:240,default:20}),
    depthOptions:Object.freeze([]),
    contextOptions:Object.freeze([]),
    blocked:false,
    errors:Object.freeze([]),
    warnings:Object.freeze([]),
    genericFallback:false,
    freeFormAI:false,
    applicationSuitability:"APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED",
    compositeArcPerimeterRequired:true,
    externalBoundaryOnlyRequired:true,
    internalSharedEdgesExcluded:true,
    straightBoundarySegmentsAllowed:true,
    multipleArcSegmentsAllowed:true,
    eachArcOwnRadiusAndCentralAngleRequired:true,
    q004PiCircumferenceRelationTeachingReownershipAllowed:false,
    q006CircleCircumferenceFormulaTeachingReownershipAllowed:false,
    q010SemicirclePerimeterTeachingReownershipAllowed:false,
    q015SectorArcLengthTeachingReownershipAllowed:false,
    sectorAreaAllowed:false,
    compositeCircleAreaAllowed:false,
    applicationContextAllowed:false,
    sameUnitMixedAdmission:false,
    crossUnitMixedAdmission:false,
    requiredCapabilityIds:REQUIRED,
    contractOnlyRequiredCapabilityIds:CONTRACT_ONLY,
    optionalCapabilityIds:OPTIONAL,
    appliedRuntimeModifierIds:MODIFIERS,
    frozenRuntimeProfile:"profile_geometry_formula",
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
  });
}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?current():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[],b=current();
  if(b0&&!b0.ok)e.push(...b0.errors.map(x=>"P08F17_BASE:"+x));
  if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.compositeArcPerimeterRequired||!b.externalBoundaryOnlyRequired||!b.internalSharedEdgesExcluded||!b.straightBoundarySegmentsAllowed||!b.multipleArcSegmentsAllowed||!b.eachArcOwnRadiusAndCentralAngleRequired||b.q004PiCircumferenceRelationTeachingReownershipAllowed||b.q006CircleCircumferenceFormulaTeachingReownershipAllowed||b.q010SemicirclePerimeterTeachingReownershipAllowed||b.q015SectorArcLengthTeachingReownershipAllowed||b.sectorAreaAllowed||b.compositeCircleAreaAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.contractOnlyRequiredCapabilityIds.join("|")!==CONTRACT_ONLY.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_geometry_formula")e.push("P08F17_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q017KnowledgePointCount:1,q017PatternGroupCount:1,q017PatternSpecCount:4});
}
