export * from "./batch-a-browser-question-router-p03f26.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f26.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f27.js";
import { canGenerateG4BU08P03F27Questions, generateG4BU08P03F27Questions } from "./g4b-u08-rank8-fraction-runtime-p03f27.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4BU08P03F27Questions(plan)) return baseGenerate(options);
  return generateG4BU08P03F27Questions(options);
}
