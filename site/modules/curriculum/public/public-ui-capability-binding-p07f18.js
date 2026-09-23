export * from "./public-ui-capability-binding-p07f17.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p07f17.js";
import {G6B_U03_P07F18_APPLIED_MODIFIER_IDS as MODIFIERS,G6B_U03_P07F18_KP_ID as KP,G6B_U03_P07F18_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6B_U03_P07F18_PATTERN_GROUP as GROUP,G6B_U03_P07F18_REQUIRED_CAPABILITY_IDS as REQUIRED,G6B_U03_P07F18_SOURCE_ID as SRC,G6B_U03_P07F18_SPEC_IDS as SPEC_IDS} from "../registry/g6b-u03-cylinder-volume-selector-projection-p07f18.js";
function request(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
function q18Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},{value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"圓柱體積",enabled:true})]),questionType:"diagram",
  compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
  questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
  genericFallback:false,freeFormAI:false,applicationSuitability:"SOURCE_BACKED_CYLINDER_VOLUME_ADMITTED",cylinderVolumeOwned:true,
  circleAreaFormulaPrerequisiteConsumed:true,prismBaseAreaHeightPrerequisiteConsumed:true,circularBaseAreaRequired:true,perpendicularCylinderHeightRequired:true,
  diameterToRadiusNormalizationAllowed:true,q049PrismSurfaceAreaReownershipAllowed:false,q055GenericPrismVolumeReownershipAllowed:false,
  q060TriangularPrismVolumeReownershipAllowed:false,q060CompositePrismReownershipAllowed:false,cylinderSurfaceAreaAllowed:false,
  halfCylinderApplicationAsCoreAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,frozenRuntimeProfile:"profile_spatial_solid",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return request(i)?q18Binding():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>"P07F18_BASE:"+x));const b=q18Binding();
  if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.cylinderVolumeOwned||!b.circleAreaFormulaPrerequisiteConsumed||!b.prismBaseAreaHeightPrerequisiteConsumed||
    !b.circularBaseAreaRequired||!b.perpendicularCylinderHeightRequired||!b.diameterToRadiusNormalizationAllowed||b.q049PrismSurfaceAreaReownershipAllowed||
    b.q055GenericPrismVolumeReownershipAllowed||b.q060TriangularPrismVolumeReownershipAllowed||b.q060CompositePrismReownershipAllowed||
    b.cylinderSurfaceAreaAllowed||b.halfCylinderApplicationAsCoreAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||
    b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.join("|")!==OPTIONAL.join("|")||b.appliedRuntimeModifierIds.length!==0||
    b.frozenRuntimeProfile!=="profile_spatial_solid")e.push("P07F18_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q018KnowledgePointCount:1,q018PatternGroupCount:1,q018PatternSpecCount:SPEC_IDS.length});
}
