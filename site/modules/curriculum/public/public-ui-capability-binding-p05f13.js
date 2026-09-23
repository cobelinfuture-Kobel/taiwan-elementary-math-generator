export * from "./public-ui-capability-binding-p05f12.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p05f12.js";
import {G4A_U05_P05F13_KP_ID,G4A_U05_P05F13_PATTERN_GROUP,G4A_U05_P05F13_PATTERN_GROUP_ID,G4A_U05_P05F13_SOURCE_ID,G4A_U05_P05F13_SPEC_IDS} from "../registry/g4a-u05-triangle-elements-naming-selector-projection-p05f13.js";
function requested(input={}){
  if(input.sourceId!==G4A_U05_P05F13_SOURCE_ID)return false;
  if(input.selectionMode==="sourceUnit")return true;
  if(input.selectionMode==="mixedKnowledgePointsSameUnit"||input.selectionMode==="mixedKnowledgePointsCrossUnit")return false;
  const ids=input.selectedKnowledgePointIds??input.knowledgePointIds??[];
  return ids.includes(G4A_U05_P05F13_KP_ID)||(input.selectedPatternGroupIds??[]).includes(G4A_U05_P05F13_PATTERN_GROUP_ID)||(input.patternSpecIds??[]).some(id=>G4A_U05_P05F13_SPEC_IDS.includes(id));
}
function q013Binding(input={}){
  const sourceUnit=input.selectionMode==="sourceUnit";
  return Object.freeze({
    sourceId:G4A_U05_P05F13_SOURCE_ID,
    selectionMode:sourceUnit?"sourceUnit":"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze(sourceUnit?[]:[G4A_U05_P05F13_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G4A_U05_P05F13_PATTERN_GROUP_ID]),
    availableSelectionModes:Object.freeze([
      Object.freeze({value:"sourceUnit",label:"整個單元",enabled:true}),
      Object.freeze({value:"singleKnowledgePoint",label:"單一知識點",enabled:true}),
      Object.freeze({value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false}),
      Object.freeze({value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}),
    ]),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"圖形題",enabled:true})]),
    questionType:"diagram",
    compatiblePatternGroups:Object.freeze([G4A_U05_P05F13_PATTERN_GROUP]),
    compatiblePatternGroupIds:Object.freeze([G4A_U05_P05F13_PATTERN_GROUP_ID]),
    patternSpecIds:G4A_U05_P05F13_SPEC_IDS,
    questionCount:Object.freeze({min:1,max:240,default:20}),
    depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),
    blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),
    genericFallback:false,freeFormAI:false,
    applicationSuitability:"APPLICATION_COMPATIBLE",
    applicationImplementationAllowed:false,
    sourceBackedDirectDiagram:true,
    geometryDiagramRepresentationRequired:true,
    geometryDomainValidatorRequired:true,
    geometryPropertyReasoningRequired:true,
    triangleSideClassificationAdmission:false,
    triangleAngleClassificationAdmission:false,
    triangleInequalityAdmission:false,
    congruentTriangleCorrespondenceAdmission:false,
    geometryConstructionAdmission:false,
    mixedQuestionModeAdmission:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}
export function resolvePublicUiCapabilityBinding(input={}){return requested(input)?q013Binding(input):baseResolve(input);}
export function auditPublicUiCapabilityBinding(){
  const base=baseAudit(),binding=q013Binding({sourceId:G4A_U05_P05F13_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4A_U05_P05F13_KP_ID]}),errors=[];
  if(!base.ok)errors.push(...base.errors.map(code=>`P05F13_BASE:${code}`));
  if(binding.blocked||binding.questionType!=="diagram"||binding.questionCount.max!==240||binding.patternSpecIds.length!==5||!binding.geometryDiagramRepresentationRequired||!binding.geometryDomainValidatorRequired||!binding.geometryPropertyReasoningRequired||binding.applicationImplementationAllowed||binding.triangleSideClassificationAdmission||binding.triangleAngleClassificationAdmission||binding.triangleInequalityAdmission||binding.congruentTriangleCorrespondenceAdmission||binding.geometryConstructionAdmission||binding.mixedQuestionModeAdmission)errors.push("P05F13_BINDING_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),q013:binding});
}
