export * from "./batch-a-browser-validator-p03f21.js";
import { validateBatchABrowserPlan as basePlan, validateBatchABrowserQuestion as baseQuestion, validateBatchABrowserQuestions as baseQuestions } from "./batch-a-browser-validator-p03f21.js";
import { G5A_U04_SOURCE_ID, G5A_U04_SLICE022_PATTERN_SPEC_IDS } from "../registry/g5a-u04-rank7-fraction-selector-projection.js";
import { validateG5AU04Slice022Question } from "./g5a-u04-rank7-fraction-runtime-p03f22.js";
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isCurrent = (question) => G5A_U04_SLICE022_PATTERN_SPEC_IDS.includes(id(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });
export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G5A_U04_SOURCE_ID || !plan.patternSpecIds?.some((patternId) => G5A_U04_SLICE022_PATTERN_SPEC_IDS.includes(patternId))) return basePlan(plan);
  const errors = [];
  if (!plan.patternSpecIds.length || !plan.patternSpecIds.every((patternId) => G5A_U04_SLICE022_PATTERN_SPEC_IDS.includes(patternId))) errors.push(issue("p03f22_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f22_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f22_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f22_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) { return isCurrent(question) ? validateG5AU04Slice022Question(question) : baseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isCurrent)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => errors.push(...validateBatchABrowserQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))));
  return { ok: errors.length === 0, errors, warnings: [], infos: [], validatorVersion: "p03f22-g5a-u04-rank7-fraction-v1", validatedAt: null };
}
