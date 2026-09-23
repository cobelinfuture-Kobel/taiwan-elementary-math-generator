export * from "./batch-a-browser-validator-p03f8.js";
import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f8.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f9-extension.js";
import { validateG3BU09TenthsFractionDecimalQuestion } from "./tenths-fraction-decimal-runtime.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g3b-u09-tenths-fraction-decimal-selector-projection.js";

const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F9 = (question = {}) => patternId(question) === G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID;
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (plan.sourceId !== G3B_U09_SOURCE_ID || ids.length !== 1 || ids[0] !== G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 20) errors.push(issue("p03f9_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f9_application_scope_violation", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f9_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  const definition = getBatchABrowserPatternDefinition(G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID);
  if (!definition || definition.requestedUnknownRole !== "equivalentRepresentation" || definition.questionMode !== "numeric") errors.push(issue("p03f9_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) {
  return isP03F9(question) ? validateG3BU09TenthsFractionDecimalQuestion(question) : validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F9)) return validateBaseQuestions(questions);
  const errors = [], warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f9-g3b-u09-tenths-fraction-decimal-v1", validatedAt: null };
}
