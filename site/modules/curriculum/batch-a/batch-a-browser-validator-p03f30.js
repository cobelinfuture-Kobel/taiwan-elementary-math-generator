export * from "./batch-a-browser-validator-p03f29.js";
import {
  validateBatchABrowserPlan as basePlan,
  validateBatchABrowserQuestion as baseQuestion,
  validateBatchABrowserQuestions as baseQuestions,
} from "./batch-a-browser-validator-p03f29.js";
import {
  G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U06_P03F30_SOURCE_ID,
} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";
import { validateG5AU06P03F30Question } from "./g5a-u06-rank8-fraction-runtime-p03f30.js";

const ALL_IDS = new Set(G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS);
const issue = (code, path) => ({ code, severity: "error", path, message: code });
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isTarget = (question) => ALL_IDS.has(id(question));

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G5A_U06_P03F30_SOURCE_ID || !plan.patternSpecIds?.some((id) => ALL_IDS.has(id))) return basePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length < 1 || plan.patternSpecIds.some((id) => !ALL_IDS.has(id))) errors.push(issue("p03f30_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f30_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f30_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f30_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return isTarget(question) ? validateG5AU06P03F30Question(question) : baseQuestion(question);
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
    validatorVersion: "p03f30-g5a-u06-rank8-fraction-v1",
    validatedAt: null,
  };
}
