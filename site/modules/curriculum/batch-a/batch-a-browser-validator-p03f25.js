export * from "./batch-a-browser-validator-p03f24.js";
import { validateBatchABrowserPlan as basePlan, validateBatchABrowserQuestion as baseQuestion, validateBatchABrowserQuestions as baseQuestions } from "./batch-a-browser-validator-p03f24.js";
import { G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID } from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";
import { G4A_U06_P03F25_PATTERN_SPEC_IDS } from "../registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";
import { validateG4AU06P03F25Question } from "./improper-mixed-integer-conversion-runtime-p03f25.js";

const currentIds = new Set(G4A_U06_P03F25_PATTERN_SPEC_IDS);
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isCurrent = (question) => currentIds.has(id(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID || !plan.patternSpecIds?.some((patternId) => currentIds.has(patternId))) return basePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length < 1 || !plan.patternSpecIds.every((patternId) => currentIds.has(patternId))) errors.push(issue("p03f25_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f25_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f25_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f25_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) { return isCurrent(question) ? validateG4AU06P03F25Question(question) : baseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isCurrent)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => errors.push(...validateBatchABrowserQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))));
  return { ok: errors.length === 0, errors, warnings: [], infos: [], validatorVersion: "p03f25-g4a-u06-improper-mixed-integer-conversion-v1", validatedAt: null };
}
