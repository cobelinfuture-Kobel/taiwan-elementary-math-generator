import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p05f5.js";
import {generateG5AU07P05F6Questions,G5A_U07_P05F6_MAX_QUESTION_COUNT} from "./g5a-u07-line-symmetry-recognition-runtime-p05f6.js";
import {G5A_U07_P05F6_GROUP_ID,G5A_U07_P05F6_KP_ID,G5A_U07_P05F6_SOURCE_ID,G5A_U07_P05F6_SPEC_IDS} from "../registry/g5a-u07-line-symmetry-recognition-selector-projection-p05f6.js";

export function requestsP05F6(options={}) {
  if (options.sourceId!==G5A_U07_P05F6_SOURCE_ID) return false;
  const selectedKnowledgePointIds=options.selectedKnowledgePointIds??options.knowledgePointIds??[];
  const selectedPatternGroupIds=options.selectedPatternGroupIds??[];
  const patternSpecIds=options.patternSpecIds??[];
  if (options.selectionMode==="sourceUnit") return true;
  return selectedKnowledgePointIds.includes(G5A_U07_P05F6_KP_ID)
    || selectedPatternGroupIds.includes(G5A_U07_P05F6_GROUP_ID)
    || patternSpecIds.some((id)=>G5A_U07_P05F6_SPEC_IDS.includes(id));
}

export function buildBatchABrowserPlan(options={}) {
  const basePlan=baseBuildPlan(options);
  if (!requestsP05F6(options)) return basePlan;
  const requested=Array.isArray(options.patternSpecIds)
    ? G5A_U07_P05F6_SPEC_IDS.filter((id)=>options.patternSpecIds.includes(id))
    : [];
  const patternSpecIds=requested.length>0?requested:[...G5A_U07_P05F6_SPEC_IDS];
  return Object.freeze({
    ...basePlan,
    sourceId:G5A_U07_P05F6_SOURCE_ID,
    sourceUnit:Object.freeze({sourceId:G5A_U07_P05F6_SOURCE_ID,grade:5,semester:"upper",unitCode:"5A-U07",title:"線對稱圖形",domain:"geometry_property"}),
    selectionMode:options.selectionMode==="sourceUnit"?"sourceUnit":"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([G5A_U07_P05F6_KP_ID]),
    knowledgePointIds:Object.freeze([G5A_U07_P05F6_KP_ID]),
    requestedKnowledgePointIds:Object.freeze([G5A_U07_P05F6_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G5A_U07_P05F6_GROUP_ID]),
    requestedPatternGroupIds:Object.freeze([G5A_U07_P05F6_GROUP_ID]),
    patternSpecIds:Object.freeze([...patternSpecIds]),
    questionMode:"diagram",
    requestedQuestionType:"diagram",
    questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,
    questionCountMax:G5A_U07_P05F6_MAX_QUESTION_COUNT,
    generationSeed:String(options.generationSeed??"p05f6-g5a-u07-line-symmetry"),
    publicControls:Object.freeze({sourceId:G5A_U07_P05F6_SOURCE_ID,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P05F",productAdmissionTask:"P05F_W5DirectProductVerticalSlice006Implementation"}),
    publicPatternSpecInjectionUsed:false,
    genericFallback:false,
    genericFallbackAllowed:false,
    freeFormAI:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}

export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;

export function generateBatchABrowserQuestions(options={}) {
  if (!requestsP05F6(options)) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F6_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});
  const plan=buildBatchABrowserPlan(options);
  const generated=generateG5AU07P05F6Questions(plan);
  return Object.freeze({...generated,plan,sourceId:G5A_U07_P05F6_SOURCE_ID,questionMode:"diagram"});
}
