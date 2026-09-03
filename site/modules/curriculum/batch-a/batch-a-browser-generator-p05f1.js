import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p04f39.js";
import {generateG3AU05P05F1Questions,G3A_U05_P05F1_MAX_QUESTION_COUNT} from "./g3a-u05-angle-parts-runtime-p05f1.js";
import {G3A_U05_P05F1_GROUP_ID,G3A_U05_P05F1_KP_ID,G3A_U05_P05F1_SOURCE_ID,G3A_U05_P05F1_SPEC_IDS} from "../registry/g3a-u05-angle-parts-selector-projection-p05f1.js";

export function requestsP05F1(options={}) {
  if (options.sourceId!==G3A_U05_P05F1_SOURCE_ID) return false;
  const selectedKnowledgePointIds=options.selectedKnowledgePointIds??options.knowledgePointIds??[];
  const selectedPatternGroupIds=options.selectedPatternGroupIds??[];
  const patternSpecIds=options.patternSpecIds??[];
  if (options.selectionMode==="sourceUnit") return true;
  return selectedKnowledgePointIds.includes(G3A_U05_P05F1_KP_ID)
    || selectedPatternGroupIds.includes(G3A_U05_P05F1_GROUP_ID)
    || patternSpecIds.some((id)=>G3A_U05_P05F1_SPEC_IDS.includes(id));
}

export function buildBatchABrowserPlan(options={}) {
  const basePlan=baseBuildPlan(options);
  if (!requestsP05F1(options)) return basePlan;
  const requested=Array.isArray(options.patternSpecIds)
    ? G3A_U05_P05F1_SPEC_IDS.filter((id)=>options.patternSpecIds.includes(id))
    : [];
  const patternSpecIds=requested.length>0?requested:[...G3A_U05_P05F1_SPEC_IDS];
  return Object.freeze({
    ...basePlan,
    sourceId:G3A_U05_P05F1_SOURCE_ID,
    sourceUnit:Object.freeze({sourceId:G3A_U05_P05F1_SOURCE_ID,grade:3,semester:"upper",unitCode:"3A-U05",title:"角與形狀",domain:"geometry_property"}),
    selectionMode:options.selectionMode==="sourceUnit"?"sourceUnit":"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([G3A_U05_P05F1_KP_ID]),
    knowledgePointIds:Object.freeze([G3A_U05_P05F1_KP_ID]),
    requestedKnowledgePointIds:Object.freeze([G3A_U05_P05F1_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G3A_U05_P05F1_GROUP_ID]),
    requestedPatternGroupIds:Object.freeze([G3A_U05_P05F1_GROUP_ID]),
    patternSpecIds:Object.freeze([...patternSpecIds]),
    questionMode:"diagram",
    requestedQuestionType:"diagram",
    questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,
    questionCountMax:G3A_U05_P05F1_MAX_QUESTION_COUNT,
    generationSeed:String(options.generationSeed??"p05f1-g3a-u05-angle-parts"),
    publicControls:Object.freeze({sourceId:G3A_U05_P05F1_SOURCE_ID,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P05F",productAdmissionTask:"P05F_W5DirectProductVerticalSlice001Implementation"}),
    publicPatternSpecInjectionUsed:false,
    genericFallback:false,
    genericFallbackAllowed:false,
    freeFormAI:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}

export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;

export function generateBatchABrowserQuestions(options={}) {
  if (!requestsP05F1(options)) {
    return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F1_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});
  }
  const plan=buildBatchABrowserPlan(options);
  const generated=generateG3AU05P05F1Questions(plan);
  return Object.freeze({...generated,plan,sourceId:G3A_U05_P05F1_SOURCE_ID,questionMode:"diagram"});
}
