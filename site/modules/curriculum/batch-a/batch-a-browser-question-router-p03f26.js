export * from "./batch-a-browser-question-router-p03f25.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f25.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f26.js";
import { canGenerateG4AU09P03F26Questions, generateG4AU09P03F26Questions } from "./g4a-u09-rank8-decimal-runtime-p03f26.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU09P03F26Questions(plan)) return baseGenerate(options);
  return generateG4AU09P03F26Questions(options);
}
