export * from "./public-ui-capability-binding-p05f3.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p05f3.js";
import {G4B_U02_P05F4_GROUP_ID,G4B_U02_P05F4_KP_ID,G4B_U02_P05F4_PATTERN_GROUPS,G4B_U02_P05F4_SOURCE_ID,G4B_U02_P05F4_SPEC_IDS} from "../registry/g4b-u02-parallel-lines-recognition-selector-projection-p05f4.js";

function requestsQ004(input={}) {
  if(input.sourceId!==G4B_U02_P05F4_SOURCE_ID)return false;
  if(input.selectionMode==="sourceUnit")return true;
  const ids=input.selectedKnowledgePointIds??input.knowledgePointIds??[];
  return ids.includes(G4B_U02_P05F4_KP_ID)||(input.selectedPatternGroupIds??[]).includes(G4B_U02_P05F4_GROUP_ID)||(input.patternSpecIds??[]).some((id)=>G4B_U02_P05F4_SPEC_IDS.includes(id));
}
function q004Binding(input={}) {
  const single=input.selectionMode!=="sourceUnit";
  return Object.freeze({
    sourceId:G4B_U02_P05F4_SOURCE_ID,
    selectionMode:single?"singleKnowledgePoint":"sourceUnit",
    selectedKnowledgePointIds:Object.freeze(single?[G4B_U02_P05F4_KP_ID]:[]),
    selectedPatternGroupIds:Object.freeze([G4B_U02_P05F4_GROUP_ID]),
    availableSelectionModes:Object.freeze([
      Object.freeze({value:"sourceUnit",label:"整個單元",enabled:true}),
      Object.freeze({value:"singleKnowledgePoint",label:"單一知識點",enabled:true}),
      Object.freeze({value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false}),
      Object.freeze({value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}),
    ]),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"圖形題",enabled:true})]),
    questionType:"diagram",
    compatiblePatternGroups:G4B_U02_P05F4_PATTERN_GROUPS,
    compatiblePatternGroupIds:Object.freeze([G4B_U02_P05F4_GROUP_ID]),
    patternSpecIds:G4B_U02_P05F4_SPEC_IDS,
    questionCount:Object.freeze({min:1,max:240,default:20}),
    depthOptions:Object.freeze([]),
    contextOptions:Object.freeze([]),
    blocked:false,
    errors:Object.freeze([]),
    warnings:Object.freeze([]),
    genericFallback:false,
    freeFormAI:false,
    applicationSuitability:"APPLICATION_COMPATIBLE",
    applicationContextSupportedByDirectPdf:false,
    applicationImplementationAllowed:false,
    sourceBackedDirectDiagram:true,
    geometryDiagramRepresentation:true,
    geometryFormulaEvaluationRequired:false,
    geometryPropertyReasoningRequired:true,
    perpendicularRecognitionAdmission:false,
    parallelDistanceMeasurementAdmission:false,
    parallelLineConstructionAdmission:false,
    quadrilateralClassificationAdmission:false,
    quadrilateralInclusionAdmission:false,
    mixedQuestionModeAdmission:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}
export function resolvePublicUiCapabilityBinding(input={}){return requestsQ004(input)?q004Binding(input):baseResolve(input);}
export function auditPublicUiCapabilityBinding(){const base=baseAudit();const q004=q004Binding({sourceId:G4B_U02_P05F4_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4B_U02_P05F4_KP_ID]});const errors=[];if(!base.ok)errors.push(...base.errors.map((code)=>`P05F4_BASE:${code}`));if(q004.blocked||q004.questionType!=="diagram"||q004.questionCount.max!==240||q004.compatiblePatternGroupIds.length!==1||q004.patternSpecIds.length!==4||q004.applicationSuitability!=="APPLICATION_COMPATIBLE"||q004.applicationContextSupportedByDirectPdf!==false||q004.applicationImplementationAllowed!==false||q004.geometryFormulaEvaluationRequired!==false||q004.geometryPropertyReasoningRequired!==true||q004.perpendicularRecognitionAdmission!==false||q004.parallelDistanceMeasurementAdmission!==false||q004.parallelLineConstructionAdmission!==false||q004.quadrilateralClassificationAdmission!==false||q004.quadrilateralInclusionAdmission!==false)errors.push("P05F4_Q004_BINDING_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),q004});}
