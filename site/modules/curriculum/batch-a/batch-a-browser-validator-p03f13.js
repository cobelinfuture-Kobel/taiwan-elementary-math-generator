export * from "./batch-a-browser-validator-p03f12.js";
import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f12.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f13-extension.js";
import { validateG5AU04SimplestFractionQuestion } from "./simplest-fraction-runtime.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F13 = (question = {}) => G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS.includes(patternId(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (plan.sourceId !== G5A_U04_SOURCE_ID
    || ids.length !== 3
    || !G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS.every((id) => ids.includes(id))) {
    return validateBasePlan(plan);
  }
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 9) {
    errors.push(issue("p03f13_question_count_invalid", "questionCount"));
  }
  if (plan.questionMode !== "numeric") errors.push(issue("p03f13_question_mode_mismatch", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f13_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  const roles = ids.map((id) => getBatchABrowserPatternDefinition(id)?.requestedUnknownRole);
  if (JSON.stringify(roles) !== JSON.stringify(["commonFactor", "simplestNumerator", "simplestDenominator"])) {
    errors.push(issue("p03f13_pattern_definition_invalid", "patternSpecIds"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return isP03F13(question)
    ? validateG5AU04SimplestFractionQuestion(question)
    : validateBaseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F13)) return validateBaseQuestions(questions);
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({
      ...entry,
      path: `questions[${index}].${entry.path}`,
    })));
    warnings.push(...result.warnings);
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    validatorVersion: "p03f13-g5a-u04-simplest-fraction-v1",
    validatedAt: null,
  };
}
