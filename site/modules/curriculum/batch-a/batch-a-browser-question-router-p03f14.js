export * from "./batch-a-browser-question-router.js";
import { generateBatchABrowserQuestions as generateBase } from "./batch-a-browser-question-router.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f14.js";
import {
  canGenerateG5BU05DecimalBase10Questions,
  generateG5BU05DecimalBase10Questions,
} from "./decimal-base10-structure-runtime.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG5BU05DecimalBase10Questions(plan)) return generateG5BU05DecimalBase10Questions(options);
  return generateBase(options);
}
