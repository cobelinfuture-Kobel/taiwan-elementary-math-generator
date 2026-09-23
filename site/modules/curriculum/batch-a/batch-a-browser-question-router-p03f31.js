export * from "./batch-a-browser-question-router-p03f30.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f30.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f31.js";
import { canGenerateG5BU04P03F31Questions, generateG5BU04P03F31Questions } from "./g5b-u04-rank8-decimal-times-integer-runtime-p03f31.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG5BU04P03F31Questions(plan)) return baseGenerate(options);
  return generateG5BU04P03F31Questions({ ...options, plan });
}
