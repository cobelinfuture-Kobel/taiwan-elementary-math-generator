import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generateDefaultBatchABrowserQuestions } from "./g3a-u06-division-ordering-generator.js";
import { generateG3AU02OutputQualityQuestions, isG3AU02OutputQualityPlan } from "./g3a-u02-output-quality-generator.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (isG3AU02OutputQualityPlan(plan)) return generateG3AU02OutputQualityQuestions(options);
  return generateDefaultBatchABrowserQuestions(options);
}
