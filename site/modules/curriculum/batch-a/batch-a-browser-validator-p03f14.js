export * from "./batch-a-browser-validator-p03f13.js";
import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f13.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f14-extension.js";
import { validateG5BU05DecimalBase10Question } from "./decimal-base10-structure-runtime.js";
import {
  G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
} from "../registry/g5b-u05-decimal-base10-selector-projection.js";

const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F14 = (question = {}) => G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.includes(patternId(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  const slice014 = plan.sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID
    && ids.length === 2
    && G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.every((id) => ids.includes(id));
  if (!slice014) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 16) errors.push(issue("p03f14_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f14_question_mode_mismatch", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f14_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  for (const id of ids) if (!getBatchABrowserPatternDefinition(id)) errors.push(issue("p03f14_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  if (isP03F14(question)) return validateG5BU05DecimalBase10Question(question);
  return validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F14)) return validateBaseQuestions(questions);
  const errors = []; const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f14-g5b-u05-decimal-base10-v1", validatedAt: null };
}
