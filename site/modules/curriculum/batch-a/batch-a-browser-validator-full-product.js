export * from "./batch-a-browser-validator-p01d1.js";

import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p01d1.js";
import {
  G6A_U01_PATTERN_SPEC_IDS,
  G6A_U01_SOURCE_ID,
  getBatchABrowserPatternDefinition,
} from "./source-pattern-full-product-p01d2-extension.js";
import { validateG6AU01NumberTheoryQuestion } from "./number-theory-runtime.js";

const SPEC_SET = new Set(G6A_U01_PATTERN_SPEC_IDS);

function validatesAsG6AU01(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  return question.sourceId === G6A_U01_SOURCE_ID
    || question.metadata?.sourceId === G6A_U01_SOURCE_ID
    || SPEC_SET.has(patternSpecId);
}

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G6A_U01_SOURCE_ID) return validateBasePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length === 0) {
    errors.push({ code: "g6a_u01_plan_has_no_patterns", severity: "error", path: "patternSpecIds", message: "G6A-U01 plan requires admitted PatternSpecs." });
  }
  for (const patternSpecId of plan.patternSpecIds ?? []) {
    const definition = getBatchABrowserPatternDefinition(patternSpecId);
    if (!SPEC_SET.has(patternSpecId) || !definition || definition.sourceId !== G6A_U01_SOURCE_ID) {
      errors.push({ code: "g6a_u01_plan_pattern_not_admitted", severity: "error", path: "patternSpecIds", message: `PatternSpec '${patternSpecId}' is not admitted for G6A-U01.` });
    }
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0) {
    errors.push({ code: "g6a_u01_question_count_invalid", severity: "error", path: "questionCount", message: "Question count must be a positive integer." });
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return validatesAsG6AU01(question)
    ? validateG6AU01NumberTheoryQuestion(question)
    : validateBaseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(validatesAsG6AU01)) return validateBaseQuestions(questions);
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
    validatorVersion: "p01d2-g6a-u01-number-theory-v1",
    validatedAt: null,
  };
}
