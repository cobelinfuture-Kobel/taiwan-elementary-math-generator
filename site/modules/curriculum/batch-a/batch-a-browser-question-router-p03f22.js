export * from "./batch-a-browser-question-router-p03f21.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f21.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f22.js";
import { canGenerateG5AU04Slice022Questions, generateG5AU04Slice022Questions } from "./g5a-u04-rank7-fraction-runtime-p03f22.js";
export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  return canGenerateG5AU04Slice022Questions(plan) ? generateG5AU04Slice022Questions({ ...options, plan }) : baseGenerate(options);
}
