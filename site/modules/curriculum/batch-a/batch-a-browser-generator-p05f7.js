import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p05f6.js";
import {generateG5AU10AP05F7Questions,G5A_U10A_P05F7_MAX_QUESTION_COUNT} from "./g5a-u10a-solid-shape-classification-runtime-p05f7.js";
import {G5A_U10A_P05F7_GROUP_ID,G5A_U10A_P05F7_KP_ID,G5A_U10A_P05F7_SOURCE_ID,G5A_U10A_P05F7_SPEC_IDS} from "../registry/g5a-u10a-solid-shape-classification-selector-projection-p05f7.js";

export function requestsP05F7(options={}) {
  if (options.sourceId!==G5A_U10A_P05F7_SOURCE_ID) return false;
  const selectedKnowledgePointIds=options.selectedKnowledgePointIds??options.knowledgePointIds??[];
  const selectedPatternGroupIds=options.selectedPatternGroupIds??[];
  const patternSpecIds=options.patternSpecIds??[];
  if (options.selectionMode==="sourceUnit") return true;
  return selectedKnowledgePointIds.includes(G5A_U10A_P05F7_KP_ID)
    || selectedPatternGroupIds.includes(G5A_U10A_P05F7_GROUP_ID)
    || patternSpecIds.some((id)=>G5A_U10A_P05F7_SPEC_IDS.includes(id));
}

export function buildBatchABrowserPlan(options={}) {
  const basePlan=baseBuildPlan(options);
  if (!requestsP05F7(options)) return basePlan;
  const requested=Array.isArray(options.patternSpecIds)
    ? G5A_U10A_P05F7_SPEC_IDS.filter((id)=>options.patternSpecIds.includes(id))
    : [];
  const patternSpecIds=requested.length>0?requested:[...G5A_U10A_P05F7_SPEC_IDS];
  return Object.freeze({
    ...basePlan,
    sourceId:G5A_U10A_P05F7_SOURCE_ID,
    sourceUnit:Object.freeze({sourceId:G5A_U10A_P05F7_SOURCE_ID,grade:5,semester:"upper",unitCode:"5A-U10A",title:"柱體錐體和球",domain:"spatial_solid"}),
    selectionMode:options.selectionMode==="sourceUnit"?"sourceUnit":"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([G5A_U10A_P05F7_KP_ID]),
    knowledgePointIds:Object.freeze([G5A_U10A_P05F7_KP_ID]),
    requestedKnowledgePointIds:Object.freeze([G5A_U10A_P05F7_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G5A_U10A_P05F7_GROUP_ID]),
    requestedPatternGroupIds:Object.freeze([G5A_U10A_P05F7_GROUP_ID]),
    patternSpecIds:Object.freeze([...patternSpecIds]),
    questionMode:"diagram",
    requestedQuestionType:"diagram",
    questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,
    questionCountMax:G5A_U10A_P05F7_MAX_QUESTION_COUNT,
    generationSeed:String(options.generationSeed??"p05f7-g5a-u10a-solid-shape"),
    publicControls:Object.freeze({sourceId:G5A_U10A_P05F7_SOURCE_ID,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P05F",productAdmissionTask:"P05F_W5DirectProductVerticalSlice007Implementation"}),
    publicPatternSpecInjectionUsed:false,
    genericFallback:false,
    genericFallbackAllowed:false,
    freeFormAI:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}

export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;

export function generateBatchABrowserQuestions(options={}) {
  if (!requestsP05F7(options)) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F7_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});
  const plan=buildBatchABrowserPlan(options);
  const generated=generateG5AU10AP05F7Questions(plan);
  return Object.freeze({...generated,plan,sourceId:G5A_U10A_P05F7_SOURCE_ID,questionMode:"diagram"});
}
