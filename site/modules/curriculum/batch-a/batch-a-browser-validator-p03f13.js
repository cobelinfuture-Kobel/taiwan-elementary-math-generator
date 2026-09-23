export * from "./batch-a-browser-validator-p03f12.js";
import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f12.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f13-extension.js";
import { validateG5AU04SimplestFractionQuestion } from "./simplest-fraction-runtime.js";
import { validateG5AU04QuotientFractionQuestion } from "./quotient-as-fraction-context-runtime.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS,
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isSimplest = (question = {}) => G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS.includes(patternId(question));
const isQuotient = (question = {}) => G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS.includes(patternId(question));
const isP03F13 = (question = {}) => isSimplest(question) || isQuotient(question);
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (plan.sourceId !== G5A_U04_SOURCE_ID) return validateBasePlan(plan);
  const errors = [];
  const simplest = ids.length === 3 && G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS.every((id) => ids.includes(id));
  const quotient = ids.length === 1 && G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS.includes(ids[0]);
  if (!simplest && !quotient) return validateBasePlan(plan);
  const maxCount = 20;
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > maxCount) errors.push(issue("p03f13_question_count_invalid", "questionCount"));
  if (simplest && plan.questionMode !== "numeric") errors.push(issue("p03f13_simplest_question_mode_mismatch", "questionMode"));
  if (quotient) {
    const expectedSpec = plan.questionMode === "application" ? G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID : G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID;
    if (ids[0] !== expectedSpec) errors.push(issue("p03f13_quotient_question_mode_mismatch", "questionMode"));
  }
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f13_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  for (const id of ids) if (!getBatchABrowserPatternDefinition(id)) errors.push(issue("p03f13_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  if (isSimplest(question)) return validateG5AU04SimplestFractionQuestion(question);
  if (isQuotient(question)) return validateG5AU04QuotientFractionQuestion(question);
  return validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F13)) return validateBaseQuestions(questions);
  const errors = []; const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f13-g5a-u04-two-kp-v2", validatedAt: null };
}
