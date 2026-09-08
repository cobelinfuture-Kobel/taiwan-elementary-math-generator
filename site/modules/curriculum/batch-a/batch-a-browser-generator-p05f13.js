import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p05f12.js";
import {generateG4AU05P05F13Questions,G4A_U05_P05F13_MAX_QUESTION_COUNT} from "./g4a-u05-triangle-elements-naming-runtime-p05f13.js";
import {G4A_U05_P05F13_KP_ID,G4A_U05_P05F13_PATTERN_GROUP_ID,G4A_U05_P05F13_SOURCE_ID,G4A_U05_P05F13_SPEC_IDS} from "../registry/g4a-u05-triangle-elements-naming-selector-projection-p05f13.js";

export function requestsP05F13(options={}){
  if(options.sourceId!==G4A_U05_P05F13_SOURCE_ID)return false;
  if(options.selectionMode==="sourceUnit")return true;
  if(options.selectionMode==="mixedKnowledgePointsSameUnit"||options.selectionMode==="mixedKnowledgePointsCrossUnit")return false;
  const ids=options.selectedKnowledgePointIds??options.knowledgePointIds??[];
  return ids.includes(G4A_U05_P05F13_KP_ID)||(options.selectedPatternGroupIds??[]).includes(G4A_U05_P05F13_PATTERN_GROUP_ID)||(options.patternSpecIds??[]).some(id=>G4A_U05_P05F13_SPEC_IDS.includes(id));
}
export function buildBatchABrowserPlan(options={}){
  const basePlan=baseBuildPlan(options);
  if(!requestsP05F13(options))return basePlan;
  const requested=Array.isArray(options.patternSpecIds)?G4A_U05_P05F13_SPEC_IDS.filter(id=>options.patternSpecIds.includes(id)):[];
  const patternSpecIds=requested.length?requested:[...G4A_U05_P05F13_SPEC_IDS];
  return Object.freeze({...basePlan,
    sourceId:G4A_U05_P05F13_SOURCE_ID,
    sourceUnit:Object.freeze({sourceId:G4A_U05_P05F13_SOURCE_ID,grade:4,semester:"upper",unitCode:"4A-U05",title:"三角形與全等",domain:"geometry_property"}),
    selectionMode:options.selectionMode==="sourceUnit"?"sourceUnit":"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([G4A_U05_P05F13_KP_ID]),
    knowledgePointIds:Object.freeze([G4A_U05_P05F13_KP_ID]),
    requestedKnowledgePointIds:Object.freeze([G4A_U05_P05F13_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G4A_U05_P05F13_PATTERN_GROUP_ID]),
    requestedPatternGroupIds:Object.freeze([G4A_U05_P05F13_PATTERN_GROUP_ID]),
    patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"diagram",
    requestedQuestionType:"diagram",
    questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,
    questionCountMax:G4A_U05_P05F13_MAX_QUESTION_COUNT,
    generationSeed:String(options.generationSeed??"p05f13-g4a-u05-triangle-elements-naming"),
    publicControls:Object.freeze({sourceId:G4A_U05_P05F13_SOURCE_ID,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P05F",productAdmissionTask:"P05F_W5DirectProductVerticalSlice013Implementation"}),
    publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(options={}){
  if(!requestsP05F13(options))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F13_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});
  const plan=buildBatchABrowserPlan(options),generated=generateG4AU05P05F13Questions(plan);
  return Object.freeze({...generated,plan,sourceId:G4A_U05_P05F13_SOURCE_ID,questionMode:"diagram"});
}
