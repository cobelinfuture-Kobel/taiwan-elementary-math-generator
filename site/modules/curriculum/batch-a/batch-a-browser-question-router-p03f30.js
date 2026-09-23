export * from "./batch-a-browser-question-router-p03f29.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f29.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f30.js";
import { canGenerateG5AU06P03F30Questions, generateG5AU06P03F30Questions } from "./g5a-u06-rank8-fraction-runtime-p03f30.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG5AU06P03F30Questions(plan)) return baseGenerate(options);
  return generateG5AU06P03F30Questions({ ...options, plan });
}
