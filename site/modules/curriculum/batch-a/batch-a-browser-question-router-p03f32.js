export * from "./batch-a-browser-question-router-p03f31.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f31.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f32.js";
import { canGenerateG6BU01P03F32Questions, generateG6BU01P03F32Questions } from "./g6b-u01-rank8-decimal-fraction-conversion-runtime-p03f32.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG6BU01P03F32Questions(plan)) return baseGenerate(options);
  return generateG6BU01P03F32Questions({ ...options, plan });
}
