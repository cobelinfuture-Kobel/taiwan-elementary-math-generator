export * from "./batch-a-browser-question-router-p03f15.js";
import { generateBatchABrowserQuestions as generateBase } from "./batch-a-browser-question-router-p03f15.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f16.js";
import { canGenerateG3BU09DecimalSlice016Questions, generateG3BU09DecimalSlice016Questions } from "./decimal-add-sub-compare-runtime-p03f16.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG3BU09DecimalSlice016Questions(plan)) return generateG3BU09DecimalSlice016Questions(options);
  return generateBase(options);
}
