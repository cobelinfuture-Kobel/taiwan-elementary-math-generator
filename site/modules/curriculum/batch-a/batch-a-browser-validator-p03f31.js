export * from "./batch-a-browser-validator-p03f30.js";
import {
  validateBatchABrowserPlan as basePlan,
  validateBatchABrowserQuestion as baseQuestion,
  validateBatchABrowserQuestions as baseQuestions,
} from "./batch-a-browser-validator-p03f30.js";
import {
  G5B_U04_P03F31_SOURCE_ID,
  G5B_U04_P03F31_SPEC_ID,
} from "../registry/g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";
import { validateG5BU04P03F31Question } from "./g5b-u04-rank8-decimal-times-integer-runtime-p03f31.js";

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isTarget = (question) => id(question) === G5B_U04_P03F31_SPEC_ID;

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G5B_U04_P03F31_SOURCE_ID || !plan.patternSpecIds?.includes(G5B_U04_P03F31_SPEC_ID)) return basePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length !== 1 || plan.patternSpecIds[0] !== G5B_U04_P03F31_SPEC_ID) errors.push(issue("p03f31_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f31_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f31_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f31_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return isTarget(question) ? validateG5BU04P03F31Question(question) : baseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isTarget)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => {
    errors.push(...validateBatchABrowserQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  });
  return {
    ok: errors.length === 0,
    errors,
    warnings: [],
    infos: [],
    validatorVersion: "p03f31-g5b-u04-rank8-decimal-times-integer-v1",
    validatedAt: null,
  };
}
