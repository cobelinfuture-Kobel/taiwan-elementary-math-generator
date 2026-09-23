export * from "./public-ui-capability-binding-p05f2.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p05f2.js";
import {G3B_U05_P05F3_GROUP_ID,G3B_U05_P05F3_KP_ID,G3B_U05_P05F3_PATTERN_GROUPS,G3B_U05_P05F3_SOURCE_ID,G3B_U05_P05F3_SPEC_IDS} from "../registry/g3b-u05-square-centimeter-unit-selector-projection-p05f3.js";

function requestsQ003(input={}) {
  if(input.sourceId!==G3B_U05_P05F3_SOURCE_ID)return false;
  if(input.selectionMode==="sourceUnit")return true;
  const ids=input.selectedKnowledgePointIds??input.knowledgePointIds??[];
  return ids.includes(G3B_U05_P05F3_KP_ID)||(input.selectedPatternGroupIds??[]).includes(G3B_U05_P05F3_GROUP_ID)||(input.patternSpecIds??[]).some((id)=>G3B_U05_P05F3_SPEC_IDS.includes(id));
}
function q003Binding(input={}) {
  const single=input.selectionMode!=="sourceUnit";
  return Object.freeze({
    sourceId:G3B_U05_P05F3_SOURCE_ID,
    selectionMode:single?"singleKnowledgePoint":"sourceUnit",
    selectedKnowledgePointIds:Object.freeze(single?[G3B_U05_P05F3_KP_ID]:[]),
    selectedPatternGroupIds:Object.freeze([G3B_U05_P05F3_GROUP_ID]),
    availableSelectionModes:Object.freeze([
      Object.freeze({value:"sourceUnit",label:"整個單元",enabled:true}),
      Object.freeze({value:"singleKnowledgePoint",label:"單一知識點",enabled:true}),
      Object.freeze({value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false}),
      Object.freeze({value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}),
    ]),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"圖形題",enabled:true})]),
    questionType:"diagram",
    compatiblePatternGroups:G3B_U05_P05F3_PATTERN_GROUPS,
    compatiblePatternGroupIds:Object.freeze([G3B_U05_P05F3_GROUP_ID]),
    patternSpecIds:G3B_U05_P05F3_SPEC_IDS,
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
    geometryFormulaEvaluationRequired:true,
    geometryPropertyReasoningRequired:true,
    gridCountingAdmission:false,
    areaFormulaAdmission:false,
    perimeterComputationAdmission:false,
    mixedQuestionModeAdmission:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}
export function resolvePublicUiCapabilityBinding(input={}){return requestsQ003(input)?q003Binding(input):baseResolve(input);}
export function auditPublicUiCapabilityBinding(){const base=baseAudit();const q003=q003Binding({sourceId:G3B_U05_P05F3_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3B_U05_P05F3_KP_ID]});const errors=[];if(!base.ok)errors.push(...base.errors.map((code)=>`P05F3_BASE:${code}`));if(q003.blocked||q003.questionType!=="diagram"||q003.questionCount.max!==240||q003.compatiblePatternGroupIds.length!==1||q003.patternSpecIds.length!==4||q003.applicationSuitability!=="APPLICATION_COMPATIBLE"||q003.applicationContextSupportedByDirectPdf!==false||q003.applicationImplementationAllowed!==false||q003.gridCountingAdmission!==false||q003.areaFormulaAdmission!==false||q003.perimeterComputationAdmission!==false)errors.push("P05F3_Q003_BINDING_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),q003});}
