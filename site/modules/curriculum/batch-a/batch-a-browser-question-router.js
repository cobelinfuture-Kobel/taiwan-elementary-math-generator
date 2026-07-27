export * from "./batch-a-browser-question-router-pre-p01d1.js";

import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generatePreP01D1Questions } from "./batch-a-browser-question-router-pre-p01d1.js";
import { canGenerateG5BU05LargeNumberQuestions, generateG5BU05LargeNumberQuestions } from "./large-number-place-value-runtime.js";
import { canGenerateG6AU01NumberTheoryQuestions, generateG6AU01NumberTheoryQuestions } from "./number-theory-runtime.js";
import { canGenerateG5AU03FactorMultipleQuestions, generateG5AU03FactorMultipleQuestions } from "./factor-multiple-runtime.js";
import { canGenerateG3AU08PartWholeFractionQuestions, generateG3AU08PartWholeFractionQuestions } from "./part-whole-fraction-runtime.js";
import { canGenerateG3AU08Slice002Questions, generateG3AU08Slice002Questions } from "./slice002-fraction-runtime.js";
import { canGenerateG3BU07QuotientFractionQuestions, generateG3BU07QuotientFractionQuestions } from "./quotient-fraction-runtime.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG3BU07QuotientFractionQuestions(plan)) return generateG3BU07QuotientFractionQuestions(options);
  if (canGenerateG3AU08Slice002Questions(plan)) return generateG3AU08Slice002Questions(options);
  if (canGenerateG3AU08PartWholeFractionQuestions(plan)) return generateG3AU08PartWholeFractionQuestions(options);
  if (canGenerateG5AU03FactorMultipleQuestions(plan)) return generateG5AU03FactorMultipleQuestions(options);
  if (canGenerateG6AU01NumberTheoryQuestions(plan)) return generateG6AU01NumberTheoryQuestions(options);
  if (canGenerateG5BU05LargeNumberQuestions(plan)) return generateG5BU05LargeNumberQuestions(options);
  return generatePreP01D1Questions(options);
}
