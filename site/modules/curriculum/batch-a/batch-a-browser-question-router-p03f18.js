export * from "./batch-a-browser-question-router-p03f17.js";
import { generateBatchABrowserQuestions as generateBase } from "./batch-a-browser-question-router-p03f17.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f18.js";
import { canGenerateG4AU09DecimalComposeSlice018Questions, generateG4AU09DecimalComposeSlice018Questions } from "./decimal-compose-decompose-runtime-p03f18.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG4AU09DecimalComposeSlice018Questions(plan)) return generateG4AU09DecimalComposeSlice018Questions({ ...options, plan });
  return generateBase(options);
}
