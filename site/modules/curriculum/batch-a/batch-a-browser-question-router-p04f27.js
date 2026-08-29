export * from "./batch-a-browser-question-router-p04f26.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p04f26.js";
import { buildBatchABrowserPlan, requestsP04F27 } from "./batch-a-browser-generator-p04f27.js";
import { generateG4AU06P04F27FractionTimesIntegerQuantityQuestions } from "./fraction-times-integer-quantity-runtime-p04f27.js";
export function generateBatchABrowserQuestions(options = {}) {
  const plan = options.plan ?? buildBatchABrowserPlan(options);
  return requestsP04F27({ ...options, sourceId: plan.sourceId, selectionMode: plan.selectionMode, patternSpecIds: plan.patternSpecIds, selectedKnowledgePointIds: plan.requestedKnowledgePointIds ?? plan.selectedKnowledgePointIds, selectedPatternGroupIds: plan.requestedPatternGroupIds })
    ? generateG4AU06P04F27FractionTimesIntegerQuantityQuestions({ ...options, plan })
    : baseGenerate({ ...options, plan });
}
