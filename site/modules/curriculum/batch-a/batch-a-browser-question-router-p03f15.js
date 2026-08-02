export * from "./batch-a-browser-question-router-p03f14.js";
import { generateBatchABrowserQuestions as generateBase } from "./batch-a-browser-question-router-p03f14.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f15.js";
import {
  canGenerateG3BU07SameDenominatorSlice015Questions,
  generateG3BU07SameDenominatorSlice015Questions,
} from "./same-denominator-fraction-runtime-p03f15.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG3BU07SameDenominatorSlice015Questions(plan)) return generateG3BU07SameDenominatorSlice015Questions(options);
  return generateBase(options);
}
