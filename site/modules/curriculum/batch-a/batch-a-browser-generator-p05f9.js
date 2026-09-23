import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p05f8.js";
import {generateG5BU10AP05F9Questions,G5B_U10A_P05F9_MAX_QUESTION_COUNT} from "./g5b-u10a-large-area-unit-identity-runtime-p05f9.js";
import {G5B_U10A_P05F9_GROUP_ID,G5B_U10A_P05F9_KP_ID,G5B_U10A_P05F9_SOURCE_ID,G5B_U10A_P05F9_SPEC_IDS} from "../registry/g5b-u10a-large-area-unit-identity-selector-projection-p05f9.js";

export function requestsP05F9(options={}){
  if(options.sourceId!==G5B_U10A_P05F9_SOURCE_ID)return false;
  const selectedKnowledgePointIds=options.selectedKnowledgePointIds??options.knowledgePointIds??[];
  const selectedPatternGroupIds=options.selectedPatternGroupIds??[];
  const patternSpecIds=options.patternSpecIds??[];
  return selectedKnowledgePointIds.includes(G5B_U10A_P05F9_KP_ID)||selectedPatternGroupIds.includes(G5B_U10A_P05F9_GROUP_ID)||patternSpecIds.some((id)=>G5B_U10A_P05F9_SPEC_IDS.includes(id));
}
export function buildBatchABrowserPlan(options={}){
  const basePlan=baseBuildPlan(options);if(!requestsP05F9(options))return basePlan;
  const requested=Array.isArray(options.patternSpecIds)?G5B_U10A_P05F9_SPEC_IDS.filter((id)=>options.patternSpecIds.includes(id)):[];
  const patternSpecIds=requested.length>0?requested:[...G5B_U10A_P05F9_SPEC_IDS];
  return Object.freeze({...basePlan,sourceId:G5B_U10A_P05F9_SOURCE_ID,sourceUnit:Object.freeze({sourceId:G5B_U10A_P05F9_SOURCE_ID,grade:5,semester:"lower",unitCode:"5B-U10A",title:"生活中的大單位",domain:"measurement"}),selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([G5B_U10A_P05F9_KP_ID]),knowledgePointIds:Object.freeze([G5B_U10A_P05F9_KP_ID]),requestedKnowledgePointIds:Object.freeze([G5B_U10A_P05F9_KP_ID]),selectedPatternGroupIds:Object.freeze([G5B_U10A_P05F9_GROUP_ID]),requestedPatternGroupIds:Object.freeze([G5B_U10A_P05F9_GROUP_ID]),patternSpecIds:Object.freeze([...patternSpecIds]),questionMode:"diagram",requestedQuestionType:"diagram",questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,questionCountMax:G5B_U10A_P05F9_MAX_QUESTION_COUNT,generationSeed:String(options.generationSeed??"p05f9-g5b-u10a-large-area-unit-identity"),publicControls:Object.freeze({sourceId:G5B_U10A_P05F9_SOURCE_ID,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P05F",productAdmissionTask:"P05F_W5DirectProductVerticalSlice009Implementation"}),publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(options={}){if(!requestsP05F9(options))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F9_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});const plan=buildBatchABrowserPlan(options),generated=generateG5BU10AP05F9Questions(plan);return Object.freeze({...generated,plan,sourceId:G5B_U10A_P05F9_SOURCE_ID,questionMode:"diagram"});}
