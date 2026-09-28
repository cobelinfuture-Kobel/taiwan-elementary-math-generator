export * from "./public-ui-capability-binding-p08f10.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p08f10.js";
import {G5A_U07_P08F11_KP_ID as KP,G5A_U07_P08F11_PATTERN_GROUP as GROUP,G5A_U07_P08F11_REQUIRED_CAPABILITY_IDS as REQUIRED,G5A_U07_P08F11_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G5A_U07_P08F11_APPLIED_MODIFIER_IDS as MODIFIERS,G5A_U07_P08F11_SOURCE_ID as SRC,G5A_U07_P08F11_SPEC_IDS as SPEC_IDS} from "../registry/g5a-u07-coordinate-reflection-selector-projection-p08f11.js";
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;if((i.selectedPatternGroupIds??[]).includes(GROUP.patternGroupId))return true;return (i.patternSpecIds??[]).some(id=>SPEC_IDS.includes(id));}
function current(){return Object.freeze({
 sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
 availableSelectionModes:Object.freeze([
  {value:"sourceUnit",label:"整個單元",enabled:true},
  {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
  {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
  {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
 ].map(Object.freeze)),
 availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"方格座標鏡射圖形題",enabled:true})]),
 questionType:"diagram",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
 questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
 applicationSuitability:"APPLICATION_COMPATIBLE",
 coordinateReflectionRequired:true,coordinateMapRepresentationRequired:true,reflectionAxisRequired:true,perpendicularDistancePreserved:true,lengthAndAnglePreserved:true,pointsOnAxisRemainFixed:true,
 lineSymmetryRecognitionReownershipAllowed:false,symmetryAxisCountReownershipAllowed:false,symmetricPointDistanceStandaloneReownershipAllowed:false,completeSymmetricFigureReownershipAllowed:false,geometryConstructionReownershipAllowed:false,
 sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_geometry_property",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?current():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
 const b0=baseAudit(),e=[],b=current();if(!b0.ok)e.push(...b0.errors.map(x=>"P08F11_BASE:"+x));
 if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.coordinateReflectionRequired||!b.coordinateMapRepresentationRequired||!b.reflectionAxisRequired||!b.perpendicularDistancePreserved||!b.lengthAndAnglePreserved||!b.pointsOnAxisRemainFixed||b.lineSymmetryRecognitionReownershipAllowed||b.symmetryAxisCountReownershipAllowed||b.symmetricPointDistanceStandaloneReownershipAllowed||b.completeSymmetricFigureReownershipAllowed||b.geometryConstructionReownershipAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.join("|")!==OPTIONAL.join("|")||b.appliedRuntimeModifierIds.join("|")!=="mod_coordinate_map"||b.frozenRuntimeProfile!=="profile_geometry_property")e.push("P08F11_BINDING_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q011KnowledgePointCount:1,q011PatternGroupCount:1,q011PatternSpecCount:3});
}
