export * from "./batch-a-browser-question-router-p04f28.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f28.js";
import {buildBatchABrowserPlan,requestsP04F29} from "./batch-a-browser-generator-p04f29.js";
import {generateG5BU09P04F29AverageTimeQuestions} from "./average-time-number-line-runtime-p04f29.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);return requestsP04F29({...options,sourceId:plan.sourceId,selectionMode:plan.selectionMode,patternSpecIds:plan.patternSpecIds,selectedKnowledgePointIds:plan.requestedKnowledgePointIds??plan.selectedKnowledgePointIds,selectedPatternGroupIds:plan.requestedPatternGroupIds})?generateG5BU09P04F29AverageTimeQuestions({...options,plan}):baseGenerate({...options,plan});}
