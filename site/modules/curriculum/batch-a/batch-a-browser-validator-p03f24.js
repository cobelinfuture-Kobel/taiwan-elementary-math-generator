export * from "./batch-a-browser-validator-p03f23.js";
import { validateBatchABrowserPlan as basePlan, validateBatchABrowserQuestion as baseQuestion, validateBatchABrowserQuestions as baseQuestions } from "./batch-a-browser-validator-p03f23.js";
import { G3B_U07_SOURCE_ID } from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import { G3B_U07_P03F24_PATTERN_SPEC_IDS } from "../registry/g3b-u07-fraction-context-selector-projection-p03f24.js";
import { validateG3BU07P03F24Question } from "./fraction-context-runtime-p03f24.js";
const currentIds = new Set(G3B_U07_P03F24_PATTERN_SPEC_IDS);
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isCurrent = (question) => currentIds.has(id(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });
export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G3B_U07_SOURCE_ID || !plan.patternSpecIds?.some((patternId) => currentIds.has(patternId))) return basePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length < 1 || !plan.patternSpecIds.every((patternId) => currentIds.has(patternId))) errors.push(issue("p03f24_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f24_question_count_invalid", "questionCount"));
  const modes = new Set(plan.patternSpecIds.map((patternId) => patternId.endsWith("_application") ? "application" : "numeric"));
  const expectedMode = modes.size === 1 ? [...modes][0] : "mixed";
  if (![expectedMode, "mixed"].includes(plan.questionMode)) errors.push(issue("p03f24_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f24_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) { return isCurrent(question) ? validateG3BU07P03F24Question(question) : baseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isCurrent)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => errors.push(...validateBatchABrowserQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))));
  return { ok: errors.length === 0, errors, warnings: [], infos: [], validatorVersion: "p03f24-g3b-u07-fraction-context-v1", validatedAt: null };
}
