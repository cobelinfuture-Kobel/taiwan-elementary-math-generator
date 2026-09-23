export * from "./batch-a-browser-question-router-p03f28.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f28.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f29.js";
import { canGenerateG5AU04P03F29Questions, generateG5AU04P03F29Questions } from "./g5a-u04-rank8-fraction-runtime-p03f29.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG5AU04P03F29Questions(plan)) return baseGenerate(options);
  return generateG5AU04P03F29Questions({ ...options, plan });
}
