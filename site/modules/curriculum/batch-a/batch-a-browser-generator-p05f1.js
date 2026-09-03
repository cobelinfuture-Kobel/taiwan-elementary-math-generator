import {buildBatchABrowserGenerationPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p04f39.js";
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

export function buildBatchABrowserGenerationPlan(options={}) {
  if (!requestsP05F1(options)) return baseBuildPlan(options);
  const patternSpecIds=Array.isArray(options.patternSpecIds)&&options.patternSpecIds.length>0?options.patternSpecIds:[...G3A_U05_P05F1_SPEC_IDS];
  return Object.freeze({
    ...options,
    sourceId:G3A_U05_P05F1_SOURCE_ID,
    selectionMode:options.selectionMode==="sourceUnit"?"sourceUnit":"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([G3A_U05_P05F1_KP_ID]),
    knowledgePointIds:Object.freeze([G3A_U05_P05F1_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G3A_U05_P05F1_GROUP_ID]),
    patternSpecIds:Object.freeze([...patternSpecIds]),
    questionMode:"diagram",
    requestedQuestionType:"diagram",
    questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,
    questionCountMax:G3A_U05_P05F1_MAX_QUESTION_COUNT,
    genericFallback:false,
    freeFormAI:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}

export function generateBatchABrowserQuestions(options={}) {
  if (!requestsP05F1(options)) return baseGenerate(options);
  const plan=buildBatchABrowserGenerationPlan(options);
  const generated=generateG3AU05P05F1Questions(plan);
  return Object.freeze({...generated,plan,sourceId:G3A_U05_P05F1_SOURCE_ID,questionMode:"diagram"});
}
