export * from "./batch-a-browser-generator-p04f35.js";
import {buildBatchABrowserPlan as baseBuild} from "./batch-a-browser-generator-p04f35.js";
import {G6A_U02_P04F36_SOURCE_ID,G6A_U02_P04F36_KP_ID,G6A_U02_P04F36_GROUP_ID,G6A_U02_P04F36_SPEC_ID} from "../registry/g6a-u02-fraction-divided-by-fraction-selector-projection-p04f36.js";

export function requestsP04F36(options={}){
  if(options.sourceId!==G6A_U02_P04F36_SOURCE_ID)return false;
  return (options.selectedKnowledgePointIds??[]).includes(G6A_U02_P04F36_KP_ID)||(options.selectedPatternGroupIds??[]).includes(G6A_U02_P04F36_GROUP_ID)||(options.patternSpecIds??[]).includes(G6A_U02_P04F36_SPEC_ID);
}
export function buildBatchABrowserPlan(options={}){
  const plan=baseBuild(options);
  if(!requestsP04F36(options))return plan;
  return Object.freeze({...plan,sourceId:G6A_U02_P04F36_SOURCE_ID,sourceUnit:Object.freeze({sourceId:G6A_U02_P04F36_SOURCE_ID,grade:6,semester:"upper",unitCode:"6A-U02",title:"分數除法",domain:"fraction_arithmetic"}),selectionMode:options.selectionMode??"singleKnowledgePoint",patternSpecIds:Object.freeze([G6A_U02_P04F36_SPEC_ID]),allocation:null,questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number(options.questionCount??20),generationSeed:String(options.generationSeed??"p04f36-g6a-u02-fraction-divided-by-fraction"),requestedKnowledgePointIds:Object.freeze([G6A_U02_P04F36_KP_ID]),requestedPatternGroupIds:Object.freeze([G6A_U02_P04F36_GROUP_ID]),publicControls:Object.freeze({sourceId:G6A_U02_P04F36_SOURCE_ID,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P04F",productAdmissionTask:"P04F36_Q036_SourceBackedNumericImplementation"}),publicPatternSpecInjectionUsed:false,genericFallbackAllowed:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"});
}
