export * from "./batch-a-browser-validator-p03f28.js";
import {
  validateBatchABrowserPlan as basePlan,
  validateBatchABrowserQuestion as baseQuestion,
  validateBatchABrowserQuestions as baseQuestions,
} from "./batch-a-browser-validator-p03f28.js";
import {
  G5A_U04_P03F29_SOURCE_ID,
  G5A_U04_P03F29_SPEC_ID,
} from "../registry/g5a-u04-rank8-fraction-selector-projection-p03f29.js";
import { validateG5AU04P03F29Question } from "./g5a-u04-rank8-fraction-runtime-p03f29.js";

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isTarget = (question) => id(question) === G5A_U04_P03F29_SPEC_ID;

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G5A_U04_P03F29_SOURCE_ID || !plan.patternSpecIds?.includes(G5A_U04_P03F29_SPEC_ID)) return basePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length !== 1 || plan.patternSpecIds[0] !== G5A_U04_P03F29_SPEC_ID) errors.push(issue("p03f29_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f29_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f29_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f29_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return isTarget(question) ? validateG5AU04P03F29Question(question) : baseQuestion(question);
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
    validatorVersion: "p03f29-g5a-u04-rank8-fraction-compare-v1",
    validatedAt: null,
  };
}
