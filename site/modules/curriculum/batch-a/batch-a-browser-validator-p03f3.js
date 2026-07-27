export * from "./batch-a-browser-validator-p03f2.js";

import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f2.js";
import {
  G3B_U07_SOURCE_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID,
} from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f3-extension.js";
import { validateG3BU07QuotientFractionQuestion } from "./quotient-fraction-runtime.js";

const issue = (code, path, message = code) => ({ code, severity: "error", path, message });
function patternId(question = {}) { return question.patternSpecId ?? question.metadata?.patternId; }
function isP03F3Question(question = {}) { return patternId(question) === G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID; }

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G3B_U07_SOURCE_ID) return validateBasePlan(plan);
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0) errors.push(issue("p03f3_question_count_invalid", "questionCount"));
  if (ids.length !== 1 || ids[0] !== G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID) errors.push(issue("p03f3_plan_pattern_not_admitted", "patternSpecIds"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f3_application_mode_forbidden", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f3_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  const definition = getBatchABrowserPatternDefinition(G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID);
  if (!definition || definition.questionMode !== "numeric") errors.push(issue("p03f3_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) {
  return isP03F3Question(question) ? validateG3BU07QuotientFractionQuestion(question) : validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F3Question)) return validateBaseQuestions(questions);
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f3-g3b-u07-quotient-fraction-v1", validatedAt: null };
}
