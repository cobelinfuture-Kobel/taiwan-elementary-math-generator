export * from "./batch-a-browser-question-router-p04f25.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f25.js";
import {buildBatchABrowserPlan,requestsP04F26} from "./batch-a-browser-generator-p04f26.js";
import {generateG3BU09P04F26LengthDecimalConversionQuestions} from "./length-decimal-conversion-runtime-p04f26.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);return requestsP04F26({...options,sourceId:plan.sourceId,selectionMode:plan.selectionMode,patternSpecIds:plan.patternSpecIds,selectedKnowledgePointIds:plan.requestedKnowledgePointIds,selectedPatternGroupIds:plan.requestedPatternGroupIds})?generateG3BU09P04F26LengthDecimalConversionQuestions({...options,plan}):baseGenerate({...options,plan});}
