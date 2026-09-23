export * from "./public-ui-capability-binding-p05f1.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p05f1.js";
import {G3A_U09_P05F2_GROUP_ID,G3A_U09_P05F2_KP_ID,G3A_U09_P05F2_PATTERN_GROUPS,G3A_U09_P05F2_SOURCE_ID,G3A_U09_P05F2_SPEC_IDS} from "../registry/g3a-u09-circle-parts-selector-projection-p05f2.js";

function requestsQ002(input={}) {
  if(input.sourceId!==G3A_U09_P05F2_SOURCE_ID)return false;
  if(input.selectionMode==="sourceUnit")return true;
  const ids=input.selectedKnowledgePointIds??input.knowledgePointIds??[];
  return ids.includes(G3A_U09_P05F2_KP_ID)||(input.selectedPatternGroupIds??[]).includes(G3A_U09_P05F2_GROUP_ID)||(input.patternSpecIds??[]).some((id)=>G3A_U09_P05F2_SPEC_IDS.includes(id));
}
function q002Binding(input={}) {
  const single=input.selectionMode!=="sourceUnit";
  return Object.freeze({
    sourceId:G3A_U09_P05F2_SOURCE_ID,
    selectionMode:single?"singleKnowledgePoint":"sourceUnit",
    selectedKnowledgePointIds:Object.freeze(single?[G3A_U09_P05F2_KP_ID]:[]),
    selectedPatternGroupIds:Object.freeze([G3A_U09_P05F2_GROUP_ID]),
    availableSelectionModes:Object.freeze([
      Object.freeze({value:"sourceUnit",label:"整個單元",enabled:true}),
      Object.freeze({value:"singleKnowledgePoint",label:"單一知識點",enabled:true}),
      Object.freeze({value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false}),
      Object.freeze({value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}),
    ]),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"圖形題",enabled:true})]),
    questionType:"diagram",
    compatiblePatternGroups:G3A_U09_P05F2_PATTERN_GROUPS,
    compatiblePatternGroupIds:Object.freeze([G3A_U09_P05F2_GROUP_ID]),
    patternSpecIds:G3A_U09_P05F2_SPEC_IDS,
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
    mixedQuestionModeAdmission:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}
export function resolvePublicUiCapabilityBinding(input={}){return requestsQ002(input)?q002Binding(input):baseResolve(input);}
export function auditPublicUiCapabilityBinding(){const base=baseAudit();const q002=q002Binding({sourceId:G3A_U09_P05F2_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3A_U09_P05F2_KP_ID]});const errors=[];if(!base.ok)errors.push(...base.errors.map((code)=>`P05F2_BASE:${code}`));if(q002.blocked||q002.questionType!=="diagram"||q002.questionCount.max!==240||q002.compatiblePatternGroupIds.length!==1||q002.patternSpecIds.length!==5||q002.applicationSuitability!=="APPLICATION_COMPATIBLE"||q002.applicationContextSupportedByDirectPdf!==false||q002.applicationImplementationAllowed!==false)errors.push("P05F2_Q002_BINDING_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),q002});}
