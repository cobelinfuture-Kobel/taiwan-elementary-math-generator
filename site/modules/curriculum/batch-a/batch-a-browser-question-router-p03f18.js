export * from "./batch-a-browser-question-router-p03f17.js";
import { generateBatchABrowserQuestions as generateBase } from "./batch-a-browser-question-router-p03f17.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f18.js";
import { canGenerateG4AU09DecimalComposeDecomposeQuestions, generateG4AU09DecimalComposeDecomposeQuestions } from "./decimal-compose-decompose-runtime-p03f18.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG4AU09DecimalComposeDecomposeQuestions(plan)) return generateG4AU09DecimalComposeDecomposeQuestions(options);
  return generateBase(options);
}
