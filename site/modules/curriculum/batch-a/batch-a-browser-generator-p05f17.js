import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p05f16.js";
import {generateG5AU10AP05F17Questions,G5A_U10A_P05F17_MAX_QUESTION_COUNT} from "./g5a-u10a-prism-pyramid-elements-runtime-p05f17.js";
import {G5A_U10A_P05F17_GROUP_ID,G5A_U10A_P05F17_KP_ID,G5A_U10A_P05F17_SOURCE_ID,G5A_U10A_P05F17_SPEC_IDS} from "../registry/g5a-u10a-prism-pyramid-elements-selector-projection-p05f17.js";

export function requestsP05F17(options={}){
  if(options.sourceId!==G5A_U10A_P05F17_SOURCE_ID||options.selectionMode==="sourceUnit"||options.selectionMode==="mixedKnowledgePointsSameUnit"||options.selectionMode==="mixedKnowledgePointsCrossUnit")return false;
  const ids=options.selectedKnowledgePointIds??options.knowledgePointIds??[];
  return ids.includes(G5A_U10A_P05F17_KP_ID)||(options.selectedPatternGroupIds??[]).includes(G5A_U10A_P05F17_GROUP_ID)||(options.patternSpecIds??[]).some(id=>G5A_U10A_P05F17_SPEC_IDS.includes(id));
}
export function buildBatchABrowserPlan(options={}){
  const basePlan=baseBuildPlan(options);
  if(!requestsP05F17(options))return basePlan;
  const requested=Array.isArray(options.patternSpecIds)?G5A_U10A_P05F17_SPEC_IDS.filter(id=>options.patternSpecIds.includes(id)):[];
  const patternSpecIds=requested.length?requested:[...G5A_U10A_P05F17_SPEC_IDS];
  return Object.freeze({...basePlan,
    sourceId:G5A_U10A_P05F17_SOURCE_ID,
    sourceUnit:Object.freeze({sourceId:G5A_U10A_P05F17_SOURCE_ID,grade:5,semester:"upper",unitCode:"5A-U10A",title:"柱體錐體和球",domain:"spatial_solid"}),
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([G5A_U10A_P05F17_KP_ID]),
    knowledgePointIds:Object.freeze([G5A_U10A_P05F17_KP_ID]),
    requestedKnowledgePointIds:Object.freeze([G5A_U10A_P05F17_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G5A_U10A_P05F17_GROUP_ID]),
    requestedPatternGroupIds:Object.freeze([G5A_U10A_P05F17_GROUP_ID]),
    patternSpecIds:Object.freeze([...patternSpecIds]),
    questionMode:"diagram",
    requestedQuestionType:"diagram",
    questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,
    questionCountMax:G5A_U10A_P05F17_MAX_QUESTION_COUNT,
    generationSeed:String(options.generationSeed??"p05f17-g5a-u10a-prism-pyramid-elements"),
    publicControls:Object.freeze({sourceId:G5A_U10A_P05F17_SOURCE_ID,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P05F",productAdmissionTask:"P05F_W5DirectProductVerticalSlice017Implementation"}),
    publicPatternSpecInjectionUsed:false,
    genericFallback:false,
    genericFallbackAllowed:false,
    freeFormAI:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(options={}){
  if(!requestsP05F17(options))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F17_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});
  const plan=buildBatchABrowserPlan(options),generated=generateG5AU10AP05F17Questions(plan);
  return Object.freeze({...generated,plan,sourceId:G5A_U10A_P05F17_SOURCE_ID,questionMode:"diagram"});
}
