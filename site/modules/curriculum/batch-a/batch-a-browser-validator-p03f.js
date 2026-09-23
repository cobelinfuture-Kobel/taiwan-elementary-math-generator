export * from "./batch-a-browser-validator-full-product.js";

import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-full-product.js";
import {
  G3A_U08_PART_WHOLE_PATTERN_SPEC_ID,
  G3A_U08_SOURCE_ID,
} from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  validateG3AU08PartWholeFractionQuestion,
} from "./part-whole-fraction-runtime.js";

function issue(code, path, message = code) {
  return { code, severity: "error", path, message };
}
function isP03FQuestion(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  return question.sourceId === G3A_U08_SOURCE_ID
    || question.metadata?.sourceId === G3A_U08_SOURCE_ID
    || patternSpecId === G3A_U08_PART_WHOLE_PATTERN_SPEC_ID;
}

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G3A_U08_SOURCE_ID) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0) errors.push(issue("p03f_question_count_invalid", "questionCount"));
  if (!Array.isArray(plan.patternSpecIds)
    || plan.patternSpecIds.length !== 1
    || plan.patternSpecIds[0] !== G3A_U08_PART_WHOLE_PATTERN_SPEC_ID) {
    errors.push(issue("p03f_plan_pattern_not_admitted", "patternSpecIds"));
  }
  if (plan.questionMode !== "numeric") errors.push(issue("p03f_application_mode_forbidden", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  if (isP03FQuestion(question)) return validateG3AU08PartWholeFractionQuestion(question);
  return validateBaseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03FQuestion)) return validateBaseQuestions(questions);
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    validatorVersion: "p03f-g3a-u08-part-whole-fraction-v1",
    validatedAt: null,
  };
}
