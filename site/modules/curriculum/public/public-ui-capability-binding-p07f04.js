export * from "./public-ui-capability-binding-p07f03.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f03.js";
import {G6A_U06_P07F04_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U06_P07F04_KP_ID as KP,G6A_U06_P07F04_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U06_P07F04_PATTERN_GROUP as GROUP,G6A_U06_P07F04_PATTERN_SPECS as PATTERNS,G6A_U06_P07F04_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U06_P07F04_SOURCE_ID as SRC} from "../registry/g6a-u06-pi-circumference-relation-selector-projection-p07f04.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
function q4Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([
    {value:"sourceUnit",label:"整個單元",enabled:true},
    {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
    {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
    {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
  ].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"圓周率關係圖形題",enabled:true})]),
  questionType:"diagram",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(SPEC_IDS),
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"APPLICATION_COMPATIBLE_BUT_CONTEXT_NOT_ADMITTED",
  geometryDiagramRepresentation:true,circumferenceDiameterRelationOwned:true,circumferenceRoleRequired:true,diameterRoleRequired:true,diameterPositiveNonzeroRequired:true,quotientDirectionRequired:"CIRCUMFERENCE_DIVIDED_BY_DIAMETER",quotientApproximatelyPiRequired:true,fixedRatioAcrossCirclesRequired:true,
  solveCircumferenceFromDiameterAllowed:false,solveDiameterFromCircumferenceAllowed:false,circumferenceFormulaTeachingReownershipAllowed:false,radiusBasedFormulaAllowed:false,semicirclePerimeterAllowed:false,sectorArcLengthAllowed:false,compositeArcPerimeterAllowed:false,rollingWheelApplicationAllowed:false,genericGeometryFormulaDrillAllowed:false,applicationContextAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_geometry_formula",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?q4Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F04_BASE:"+x));
  const b=q4Binding();
  if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.geometryDiagramRepresentation||!b.circumferenceDiameterRelationOwned||!b.circumferenceRoleRequired||!b.diameterRoleRequired||!b.diameterPositiveNonzeroRequired||b.quotientDirectionRequired!=="CIRCUMFERENCE_DIVIDED_BY_DIAMETER"||!b.quotientApproximatelyPiRequired||!b.fixedRatioAcrossCirclesRequired||b.solveCircumferenceFromDiameterAllowed||b.solveDiameterFromCircumferenceAllowed||b.circumferenceFormulaTeachingReownershipAllowed||b.radiusBasedFormulaAllowed||b.semicirclePerimeterAllowed||b.sectorArcLengthAllowed||b.compositeArcPerimeterAllowed||b.rollingWheelApplicationAllowed||b.genericGeometryFormulaDrillAllowed||b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.join("|")!==MODIFIERS.join("|")||b.frozenRuntimeProfile!=="profile_geometry_formula")e.push("P07F04_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q004KnowledgePointCount:1,q004PatternGroupCount:1,q004PatternSpecCount:PATTERNS.length});
}
