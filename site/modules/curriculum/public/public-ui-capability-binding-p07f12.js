export * from "./public-ui-capability-binding-p07f11.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f11.js";
import {G6A_U09_P07F12_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U09_P07F12_KP_ID as KP,G6A_U09_P07F12_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U09_P07F12_PATTERN_GROUP as GROUP,G6A_U09_P07F12_PATTERN_SPECS as PATTERNS,G6A_U09_P07F12_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U09_P07F12_SOURCE_ID as SRC} from "../registry/g6a-u09-scale-area-change-selector-projection-p07f12.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q12Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([
    {value:"sourceUnit",label:"整個單元",enabled:true},
    {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
    {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
  ].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"比例縮放與面積變化",enabled:true})]),
  questionType:"diagram",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"SOURCE_BACKED_RECTANGLE_SCALE_AREA_APPLICATION_ADMITTED",
  rectangleAreaFormulaPrerequisiteRequired:true,scaleFactorLengthPrerequisiteRequired:true,scaleAreaChangeOwned:true,correspondingLinearScaleFactorRequired:true,areaScaleFactorEqualsSquareOfLinearScaleFactorRequired:true,positiveNonzeroScaleFactorRequired:true,enlargementAndReductionAllowed:true,sourceBackedRectangleApplicationAllowed:true,
  q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed:false,similarShapeAngleTeachingAllowed:false,scaleDrawingConstructionAllowed:false,mapScaleDistanceAllowed:false,mapScaleBarInterpretationAllowed:false,genericGeometryAreaFormulaReownershipAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_geometry_formula",semanticProfileInterpretation:"GEOMETRY_FORMULA_EXECUTION_ENVELOPE_FOR_LINEAR_SCALE_TO_AREA_SQUARE_RELATION",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q12Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F12_BASE:"+x));
  const b=q12Binding();
  if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.rectangleAreaFormulaPrerequisiteRequired||!b.scaleFactorLengthPrerequisiteRequired||!b.scaleAreaChangeOwned||!b.correspondingLinearScaleFactorRequired||!b.areaScaleFactorEqualsSquareOfLinearScaleFactorRequired||!b.positiveNonzeroScaleFactorRequired||!b.enlargementAndReductionAllowed||!b.sourceBackedRectangleApplicationAllowed||b.q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed||b.similarShapeAngleTeachingAllowed||b.scaleDrawingConstructionAllowed||b.mapScaleDistanceAllowed||b.mapScaleBarInterpretationAllowed||b.genericGeometryAreaFormulaReownershipAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_geometry_formula")e.push("P07F12_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q012KnowledgePointCount:1,q012PatternGroupCount:1,q012PatternSpecCount:PATTERNS.length});
}
