export * from "./batch-a-browser-question-router-p03f16.js";
import { generateBatchABrowserQuestions as generateBase } from "./batch-a-browser-question-router-p03f16.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f17.js";
import {
  canGenerateG4AU06FractionClassificationSlice017Questions,
  generateG4AU06FractionClassificationSlice017Questions,
} from "./fraction-type-classification-runtime-p03f17.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG4AU06FractionClassificationSlice017Questions(plan)) return generateG4AU06FractionClassificationSlice017Questions(options);
  return generateBase(options);
}
