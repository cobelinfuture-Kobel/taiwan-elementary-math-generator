import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p05f4.js";
import {generateG4BU10P05F5Questions,G4B_U10_P05F5_MAX_QUESTION_COUNT} from "./g4b-u10-cubic-centimeter-unit-runtime-p05f5.js";
import {G4B_U10_P05F5_GROUP_ID,G4B_U10_P05F5_KP_ID,G4B_U10_P05F5_SOURCE_ID,G4B_U10_P05F5_SPEC_IDS} from "../registry/g4b-u10-cubic-centimeter-unit-selector-projection-p05f5.js";

export function requestsP05F5(options={}) {
  if (options.sourceId!==G4B_U10_P05F5_SOURCE_ID) return false;
  const selectedKnowledgePointIds=options.selectedKnowledgePointIds??options.knowledgePointIds??[];
  const selectedPatternGroupIds=options.selectedPatternGroupIds??[];
  const patternSpecIds=options.patternSpecIds??[];
  if (options.selectionMode==="sourceUnit") return true;
  return selectedKnowledgePointIds.includes(G4B_U10_P05F5_KP_ID)
    || selectedPatternGroupIds.includes(G4B_U10_P05F5_GROUP_ID)
    || patternSpecIds.some((id)=>G4B_U10_P05F5_SPEC_IDS.includes(id));
}

export function buildBatchABrowserPlan(options={}) {
  const basePlan=baseBuildPlan(options);
  if (!requestsP05F5(options)) return basePlan;
  const requested=Array.isArray(options.patternSpecIds)
    ? G4B_U10_P05F5_SPEC_IDS.filter((id)=>options.patternSpecIds.includes(id))
    : [];
  const patternSpecIds=requested.length>0?requested:[...G4B_U10_P05F5_SPEC_IDS];
  return Object.freeze({
    ...basePlan,
    sourceId:G4B_U10_P05F5_SOURCE_ID,
    sourceUnit:Object.freeze({sourceId:G4B_U10_P05F5_SOURCE_ID,grade:4,semester:"lower",unitCode:"4B-U10",title:"立方公分與體積",domain:"spatial_solid"}),
    selectionMode:options.selectionMode==="sourceUnit"?"sourceUnit":"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([G4B_U10_P05F5_KP_ID]),
    knowledgePointIds:Object.freeze([G4B_U10_P05F5_KP_ID]),
    requestedKnowledgePointIds:Object.freeze([G4B_U10_P05F5_KP_ID]),
    selectedPatternGroupIds:Object.freeze([G4B_U10_P05F5_GROUP_ID]),
    requestedPatternGroupIds:Object.freeze([G4B_U10_P05F5_GROUP_ID]),
    patternSpecIds:Object.freeze([...patternSpecIds]),
    questionMode:"diagram",
    requestedQuestionType:"diagram",
    questionCount:Number.isInteger(options.questionCount)?options.questionCount:20,
    questionCountMax:G4B_U10_P05F5_MAX_QUESTION_COUNT,
    generationSeed:String(options.generationSeed??"p05f5-g4b-u10-cubic-centimeter"),
    publicControls:Object.freeze({sourceId:G4B_U10_P05F5_SOURCE_ID,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P05F",productAdmissionTask:"P05F_W5DirectProductVerticalSlice005Implementation"}),
    publicPatternSpecInjectionUsed:false,
    genericFallback:false,
    genericFallbackAllowed:false,
    freeFormAI:false,
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
  });
}

export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;

export function generateBatchABrowserQuestions(options={}) {
  if (!requestsP05F5(options)) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F5_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});
  const plan=buildBatchABrowserPlan(options);
  const generated=generateG4BU10P05F5Questions(plan);
  return Object.freeze({...generated,plan,sourceId:G4B_U10_P05F5_SOURCE_ID,questionMode:"diagram"});
}
