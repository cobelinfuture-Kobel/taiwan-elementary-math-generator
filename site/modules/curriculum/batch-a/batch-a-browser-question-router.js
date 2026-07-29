export * from "./batch-a-browser-question-router-pre-p01d1.js";

import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f13.js";
import { generateBatchABrowserQuestions as generatePreP01D1Questions } from "./batch-a-browser-question-router-pre-p01d1.js";
import { canGenerateG5BU05LargeNumberQuestions, generateG5BU05LargeNumberQuestions } from "./large-number-place-value-runtime.js";
import { canGenerateG6AU01NumberTheoryQuestions, generateG6AU01NumberTheoryQuestions } from "./number-theory-runtime.js";
import { canGenerateG5AU03FactorMultipleQuestions, generateG5AU03FactorMultipleQuestions } from "./factor-multiple-runtime.js";
import { canGenerateG3AU08PartWholeFractionQuestions, generateG3AU08PartWholeFractionQuestions } from "./part-whole-fraction-runtime.js";
import { canGenerateG3AU08Slice002Questions, generateG3AU08Slice002Questions } from "./slice002-fraction-runtime.js";
import { canGenerateG3BU07QuotientFractionQuestions, generateG3BU07QuotientFractionQuestions } from "./quotient-fraction-runtime.js";
import { canGenerateG3BU09TenthDecimalQuestions, generateG3BU09TenthDecimalQuestions } from "./tenth-decimal-runtime.js";
import { canGenerateG4BU08EquivalentFractionQuestions, generateG4BU08EquivalentFractionQuestions } from "./equivalent-fraction-runtime.js";
import { canGenerateG4BU08EquivalenceCrossProductQuestions, generateG4BU08EquivalenceCrossProductQuestions } from "./equivalence-cross-product-runtime.js";
import { canGenerateG5AU04SimplestFractionQuestions, generateG5AU04SimplestFractionQuestions } from "./simplest-fraction-runtime.js";
import { canGenerateG5AU04QuotientFractionQuestions, generateG5AU04QuotientFractionQuestions } from "./quotient-as-fraction-context-runtime.js";
import { canGenerateG3AU08SameDenominatorCompareQuestions, generateG3AU08SameDenominatorCompareQuestions } from "./same-denominator-fraction-compare-runtime.js";
import { canGenerateG3BU07FractionUnitConversionQuestions, generateG3BU07FractionUnitConversionQuestions } from "./discrete-fraction-conversion-runtime.js";
import { canGenerateP03F8DecimalSliceQuestions, generateP03F8DecimalSliceQuestions } from "./decimal-slice008-runtime.js";
import { canGenerateG3BU09TenthsFractionDecimalQuestions, generateG3BU09TenthsFractionDecimalQuestions } from "./tenths-fraction-decimal-runtime.js";
import { canGenerateG4AU09HundredthDecimalQuestions, generateG4AU09HundredthDecimalQuestions } from "./hundredth-decimal-runtime.js";
import { canGenerateG4BU06DecimalMultiplicationQuestions, generateG4BU06DecimalMultiplicationQuestions } from "./one-decimal-times-integer-runtime.js";
import { applyPgcR04NumericUniqueAllocation } from "./numeric-unique-allocation-fullfix.js";

function generateOnce(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG5AU04QuotientFractionQuestions(plan)) return generateG5AU04QuotientFractionQuestions(options);
  if (canGenerateG5AU04SimplestFractionQuestions(plan)) return generateG5AU04SimplestFractionQuestions(options);
  if (canGenerateG4BU08EquivalenceCrossProductQuestions(plan)) return generateG4BU08EquivalenceCrossProductQuestions(options);
  if (canGenerateG4BU06DecimalMultiplicationQuestions(plan)) return generateG4BU06DecimalMultiplicationQuestions(options);
  if (canGenerateG4AU09HundredthDecimalQuestions(plan)) return generateG4AU09HundredthDecimalQuestions(options);
  if (canGenerateG3BU09TenthsFractionDecimalQuestions(plan)) return generateG3BU09TenthsFractionDecimalQuestions(options);
  if (canGenerateP03F8DecimalSliceQuestions(plan)) return generateP03F8DecimalSliceQuestions(options);
  if (canGenerateG3BU07FractionUnitConversionQuestions(plan)) return generateG3BU07FractionUnitConversionQuestions(options);
  if (canGenerateG3AU08SameDenominatorCompareQuestions(plan)) return generateG3AU08SameDenominatorCompareQuestions(options);
  if (canGenerateG4BU08EquivalentFractionQuestions(plan)) return generateG4BU08EquivalentFractionQuestions(options);
  if (canGenerateG3BU09TenthDecimalQuestions(plan)) return generateG3BU09TenthDecimalQuestions(options);
  if (canGenerateG3BU07QuotientFractionQuestions(plan)) return generateG3BU07QuotientFractionQuestions(options);
  if (canGenerateG3AU08Slice002Questions(plan)) return generateG3AU08Slice002Questions(options);
  if (canGenerateG3AU08PartWholeFractionQuestions(plan)) return generateG3AU08PartWholeFractionQuestions(options);
  if (canGenerateG5AU03FactorMultipleQuestions(plan)) return generateG5AU03FactorMultipleQuestions(options);
  if (canGenerateG6AU01NumberTheoryQuestions(plan)) return generateG6AU01NumberTheoryQuestions(options);
  if (canGenerateG5BU05LargeNumberQuestions(plan)) return generateG5BU05LargeNumberQuestions(options);
  return generatePreP01D1Questions(options);
}

export function generateBatchABrowserQuestions(options = {}) {
  return applyPgcR04NumericUniqueAllocation(generateOnce, options);
}
