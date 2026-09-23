export * from "./batch-a-browser-question-router-p03f18.js";
import { generateBatchABrowserQuestions as generateBase } from "./batch-a-browser-question-router-p03f18.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f19.js";
import { canGenerateG4BU06Slice019Questions, generateG4BU06Slice019Questions } from "./two-decimal-rate-runtime-p03f19.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG4BU06Slice019Questions(plan)) return generateG4BU06Slice019Questions({ ...options, plan });
  return generateBase(options);
}
