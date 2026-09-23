export * from "./public-ui-capability-binding-p07f16.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f16.js";
import {G6A_U07_P07F17_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U07_P07F17_KP_ID as KP,G6A_U07_P07F17_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U07_P07F17_PATTERN_GROUP as GROUP,G6A_U07_P07F17_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U07_P07F17_SOURCE_ID as SRC,G6A_U07_P07F17_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u07-annulus-area-selector-projection-p07f17.js";
function request(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;
  if((i.selectedPatternGroupIds??[]).length)return i.selectedPatternGroupIds.length===1&&i.selectedPatternGroupIds[0]===GROUP.patternGroupId;
  const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
function q17Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},{value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"圓環面積",enabled:true})]),questionType:"diagram",
  compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
  applicationSuitability:"SOURCE_BACKED_ANNULUS_APPLICATION_ADMITTED",annulusAreaOwned:true,q014CircleAreaFormulaPrerequisiteRequired:true,outerMinusInnerRequired:true,concentricCirclesRequired:true,
  innerDiameterToRadiusNormalizationAllowed:true,radialThicknessToOuterRadiusAllowed:true,q011DerivationTeachingReownershipAllowed:false,q014CircleAreaFormulaTeachingReownershipAllowed:false,
  sectorAreaAllowed:false,compositeCircleAreaAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_geometry_formula",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return request(i)?q17Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F17_BASE:"+x));const b=q17Binding();
  if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.annulusAreaOwned||!b.q014CircleAreaFormulaPrerequisiteRequired||!b.outerMinusInnerRequired||!b.concentricCirclesRequired||
    !b.innerDiameterToRadiusNormalizationAllowed||!b.radialThicknessToOuterRadiusAllowed||b.q011DerivationTeachingReownershipAllowed||b.q014CircleAreaFormulaTeachingReownershipAllowed||b.sectorAreaAllowed||
    b.compositeCircleAreaAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_geometry_formula")e.push("P07F17_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q017KnowledgePointCount:1,q017PatternGroupCount:1,q017PatternSpecCount:SPEC_IDS.length});
}
