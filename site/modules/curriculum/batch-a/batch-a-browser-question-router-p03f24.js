export * from "./batch-a-browser-question-router-p03f23.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f23.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f24.js";
import { canGenerateG3BU07P03F24Questions, generateG3BU07P03F24Questions } from "./fraction-context-runtime-p03f24.js";
export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  return canGenerateG3BU07P03F24Questions(plan) ? generateG3BU07P03F24Questions(options) : baseGenerate(options);
}
