export * from "./batch-a-browser-question-router-pre-p01d1.js";

import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generatePreP01D1Questions } from "./batch-a-browser-question-router-pre-p01d1.js";
import {
  canGenerateG5BU05LargeNumberQuestions,
  generateG5BU05LargeNumberQuestions,
} from "./large-number-place-value-runtime.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG5BU05LargeNumberQuestions(plan)) {
    return generateG5BU05LargeNumberQuestions(options);
  }
  return generatePreP01D1Questions(options);
}
