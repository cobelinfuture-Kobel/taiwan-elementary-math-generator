export * from "./batch-a-browser-validator-p03f25.js";
import { validateBatchABrowserPlan as basePlan, validateBatchABrowserQuestion as baseQuestion, validateBatchABrowserQuestions as baseQuestions } from "./batch-a-browser-validator-p03f25.js";
import { G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS, G4A_U09_P03F26_SOURCE_ID } from "../registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";
import { validateG4AU09P03F26Question } from "./g4a-u09-rank8-decimal-runtime-p03f26.js";

const currentIds = new Set(G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS);
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isCurrent = (question) => currentIds.has(id(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G4A_U09_P03F26_SOURCE_ID || !plan.patternSpecIds?.some((patternId) => currentIds.has(patternId))) return basePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length < 1 || !plan.patternSpecIds.every((patternId) => currentIds.has(patternId))) errors.push(issue("p03f26_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f26_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f26_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f26_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) { return isCurrent(question) ? validateG4AU09P03F26Question(question) : baseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isCurrent)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => errors.push(...validateBatchABrowserQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))));
  return { ok: errors.length === 0, errors, warnings: [], infos: [], validatorVersion: "p03f26-g4a-u09-rank8-decimal-v1", validatedAt: null };
}
