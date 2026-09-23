export * from "./batch-a-browser-validator-p03f26.js";
import { validateBatchABrowserPlan as basePlan, validateBatchABrowserQuestion as baseQuestion, validateBatchABrowserQuestions as baseQuestions } from "./batch-a-browser-validator-p03f26.js";
import { G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS, G4B_U08_P03F27_SOURCE_ID } from "../registry/g4b-u08-rank8-fraction-selector-projection-p03f27.js";
import { validateG4BU08P03F27Question } from "./g4b-u08-rank8-fraction-runtime-p03f27.js";

const currentIds = new Set(G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS);
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isCurrent = (question) => currentIds.has(id(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G4B_U08_P03F27_SOURCE_ID || !plan.patternSpecIds?.some((patternId) => currentIds.has(patternId))) return basePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length < 1 || !plan.patternSpecIds.every((patternId) => currentIds.has(patternId))) errors.push(issue("p03f27_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f27_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f27_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f27_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) { return isCurrent(question) ? validateG4BU08P03F27Question(question) : baseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isCurrent)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => errors.push(...validateBatchABrowserQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))));
  return { ok: errors.length === 0, errors, warnings: [], infos: [], validatorVersion: "p03f27-g4b-u08-rank8-fraction-v1", validatedAt: null };
}
