export * from "./batch-a-browser-validator-p03f6.js";
import { validateBatchABrowserPlan as validateBasePlan, validateBatchABrowserQuestion as validateBaseQuestion, validateBatchABrowserQuestions as validateBaseQuestions } from "./batch-a-browser-validator-p03f6.js";
import { G3B_U07_SOURCE_ID } from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import { G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS, G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS, G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS } from "../registry/g3b-u07-fraction-unit-conversion-selector-projection.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f7-extension.js";
import { validateG3BU07FractionUnitConversionQuestion } from "./discrete-fraction-conversion-runtime.js";
const IDS = new Set(G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS); const patternId = (q = {}) => q.patternSpecId ?? q.metadata?.patternId; const isP03F7 = (q = {}) => IDS.has(patternId(q));
const issue = (code, path) => ({ code, severity: "error", path, message: code });
export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (plan.sourceId !== G3B_U07_SOURCE_ID || ids.length !== 2 || !ids.every((id) => IDS.has(id))) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 20) errors.push(issue("p03f7_question_count_invalid", "questionCount"));
  const expected = plan.questionMode === "application" ? G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS : G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS;
  if (expected.some((id) => !ids.includes(id)) || ids.some((id) => !expected.includes(id))) errors.push(issue("p03f7_mode_pattern_mismatch", "patternSpecIds"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f7_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  if (ids.some((id) => getBatchABrowserPatternDefinition(id)?.questionMode !== plan.questionMode)) errors.push(issue("p03f7_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) { return isP03F7(question) ? validateG3BU07FractionUnitConversionQuestion(question) : validateBaseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F7)) return validateBaseQuestions(questions);
  const errors = [], warnings = [];
  for (const [i, q] of questions.entries()) { const r = validateBatchABrowserQuestion(q); errors.push(...r.errors.map((e) => ({ ...e, path: `questions[${i}].${e.path}` }))); warnings.push(...r.warnings); }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f7-g3b-u07-fraction-unit-conversion-v1", validatedAt: null };
}
