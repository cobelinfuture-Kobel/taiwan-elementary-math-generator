import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generateDefaultBatchABrowserQuestions } from "./g3a-u06-division-ordering-generator.js";
import { generateG3AU02OutputQualityQuestions, isG3AU02OutputQualityPlan } from "./g3a-u02-output-quality-generator.js";
import { canGenerateG4AU01Phase1Questions, generateBatchABrowserQuestions as generateG4AU01Phase1Questions } from "./g4a-u01-phase3-runtime-fix-generator.js";
import { canGenerateG4AU02NumericQuestions, generateG4AU02NumericQuestions } from "./g4a-u02-numeric-generator.js";
import { canGenerateG4AU04DivisionQuestions, generateG4AU04DivisionQuestions } from "./g4a-u04-division-generator.js";
import { canGenerateG4AU08ExpressionQuestions, generateG4AU08ExpressionQuestions } from "./g4a-u08-expression-generator.js";

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (isG3AU02OutputQualityPlan(plan)) return generateG3AU02OutputQualityQuestions(options);
  if (canGenerateG4AU01Phase1Questions(plan)) return generateG4AU01Phase1Questions(options);
  if (canGenerateG4AU02NumericQuestions(options)) return generateG4AU02NumericQuestions(options);
  if (canGenerateG4AU04DivisionQuestions(options)) return generateG4AU04DivisionQuestions(options);
  if (canGenerateG4AU08ExpressionQuestions(options)) return generateG4AU08ExpressionQuestions(options);
  return generateDefaultBatchABrowserQuestions(options);
}
