export * from "./batch-a-browser-question-router-p04f27.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f27.js";
import {buildBatchABrowserPlan,requestsP04F28} from "./batch-a-browser-generator-p04f28.js";
import {generateG5AU04P04F28FractionMeasurementSegmentQuestions} from "./fraction-measurement-segments-runtime-p04f28.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);return requestsP04F28({...options,sourceId:plan.sourceId,selectionMode:plan.selectionMode,patternSpecIds:plan.patternSpecIds,selectedKnowledgePointIds:plan.requestedKnowledgePointIds??plan.selectedKnowledgePointIds,selectedPatternGroupIds:plan.requestedPatternGroupIds})?generateG5AU04P04F28FractionMeasurementSegmentQuestions({...options,plan}):baseGenerate({...options,plan});}
