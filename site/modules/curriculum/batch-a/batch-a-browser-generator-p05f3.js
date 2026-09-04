import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p05f2.js";
import {generateG3BU05P05F3Questions,G3B_U05_P05F3_MAX_QUESTION_COUNT} from "./g3b-u05-square-centimeter-unit-runtime-p05f3.js";
import {G3B_U05_P05F3_GROUP_ID,G3B_U05_P05F3_KP_ID,G3B_U05_P05F3_SOURCE_ID,G3B_U05_P05F3_SPEC_IDS} from "../registry/g3b-u05-square-centimeter-unit-selector-projection-p05f3.js";

export function requestsP05F3(options={}) {
  if (options.sourceId!==G3B_U05_P05F3_SOURCE_ID) return false;
  const selectedKnowledgePointIds=options.selectedKnowledgePointIds??options.knowledgePointIds??[];
  const selectedPatternGroupIds=options.selectedPatternGroupIds??[];
  const patternSpecIds=options.patternSpecIds??[];
  if (options.selectionMode==="sourceUnit") return true;
  return selectedKnowledgePointIds.includes(G3B_U05_P05F3_KP_ID)
    || selectedPatternGroupIds.includes(G3B_U05_P05F3_GROUP_ID)
    || patternSpecIds.some((id)=>G3B_U05_P05F3_SPEC_IDS.includes(id));
}

export function buildBatchABrowserPlan(options={}) {
  const basePlan=baseBuildPlan(options);
  if (!requestsP05F3(options)) return basePlan;
  const requested=Array.isArray(options.patternSpecIds)
    ? G3B_U05_P05F3_SPEC_IDS.filter((id)=>options.patternSpecIds.includes(id))
    : [];
  const patternSpecIds=requested.length>0?requested:[...G3B_U05_P05F3_SPEC_IDS];
  return Object.freeze({
    ...basePlan,
    sourceId:G3B_U05_P05F3_SOURCE_ID,
    sourceUnit:Object.freeze({sourceId:G3B_U05_P05F3_SOURCE_ID,grade:3,semester:"lower",unitCode:"3B-U05",title:"面積與平方公分",domain:"geometry_formula"}),
    selectionMode:options.selectionMode==="sourceUnit"?"sourceUnit":"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([G3B_U05_P05F3_KP_ID]),
    knowledgePointIds:Object.freeze([G3B_U05_P05F3_KP_ID]),
    requestedKnowledgePointIds:Object.freeze([G3B_U05_P05F3_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G3B_U05_P05F3_GROUP_ID]),
    requestedPatternGroupIds:Object.freeze([G3B_U05_P05F3_GROUP_ID]),
    patternSpecIds:Object.freeze([...patternSpecIds]),
    questionMode:"diagram",
    requestedQuestionType:"diagram",
    questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,
    questionCountMax:G3B_U05_P05F3_MAX_QUESTION_COUNT,
    generationSeed:String(options.generationSeed??"p05f3-g3b-u05-square-centimeter-unit"),
    publicControls:Object.freeze({sourceId:G3B_U05_P05F3_SOURCE_ID,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P05F",productAdmissionTask:"P05F_W5DirectProductVerticalSlice003Implementation"}),
    publicPatternSpecInjectionUsed:false,
    genericFallback:false,
    genericFallbackAllowed:false,
    freeFormAI:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}

export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;

export function generateBatchABrowserQuestions(options={}) {
  if (!requestsP05F3(options)) {
    return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F3_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});
  }
  const plan=buildBatchABrowserPlan(options);
  const generated=generateG3BU05P05F3Questions(plan);
  return Object.freeze({...generated,plan,sourceId:G3B_U05_P05F3_SOURCE_ID,questionMode:"diagram"});
}
