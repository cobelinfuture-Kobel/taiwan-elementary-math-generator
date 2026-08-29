export * from "./batch-a-browser-question-router-p04f23.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f23.js";
import {buildBatchABrowserPlan,requestsP04F25} from "./batch-a-browser-generator-p04f25.js";
import {generateG5BU09P04F25NumericQuestionSet} from "./time-system-runtime-p04f25.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!requestsP04F25({...options,sourceId:plan.sourceId,questionMode:plan.questionMode,patternSpecIds:plan.patternSpecIds,selectedKnowledgePointIds:plan.requestedKnowledgePointIds,selectedPatternGroupIds:plan.requestedPatternGroupIds,selectionMode:plan.selectionMode}))return baseGenerate({...options,plan});return generateG5BU09P04F25NumericQuestionSet({...options,plan});}
