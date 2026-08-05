export * from "./batch-a-browser-question-router-p03f24.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f24.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f25.js";
import { canGenerateG4AU06P03F25Questions, generateG4AU06P03F25Questions } from "./improper-mixed-integer-conversion-runtime-p03f25.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU06P03F25Questions(plan)) return baseGenerate(options);
  return generateG4AU06P03F25Questions(options);
}
