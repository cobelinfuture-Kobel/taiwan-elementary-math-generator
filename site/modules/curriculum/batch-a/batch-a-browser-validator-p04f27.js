export * from "./batch-a-browser-validator-p04f26.js";
import { validateBatchABrowserPlan as basePlan, validateBatchABrowserQuestion as baseQuestion, validateBatchABrowserQuestions as baseQuestions } from "./batch-a-browser-validator-p04f26.js";
import { validateG4AU06P04F27Question } from "./fraction-times-integer-quantity-runtime-p04f27.js";
import { G4A_U06_P04F27_SOURCE_ID, G4A_U06_P04F27_SPEC_ID } from "../registry/g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const issue = (code, path) => ({ code, severity: "error", path, message: code });
const isQ027 = (question) => question.sourceId === G4A_U06_P04F27_SOURCE_ID && id(question) === G4A_U06_P04F27_SPEC_ID;
export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G4A_U06_P04F27_SOURCE_ID || !plan.patternSpecIds?.includes(G4A_U06_P04F27_SPEC_ID)) return basePlan(plan);
  const errors = [];
  if (plan.questionMode !== "application" || JSON.stringify(plan.patternSpecIds) !== JSON.stringify([G4A_U06_P04F27_SPEC_ID])) errors.push(issue("p04f27_plan_pattern_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p04f27_question_count_invalid", "questionCount"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p04f27_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) { return isQ027(question) ? validateG4AU06P04F27Question(question) : baseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isQ027)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => {
    const result = isQ027(question) ? validateG4AU06P04F27Question(question) : baseQuestion(question);
    errors.push(...(result.errors ?? []).map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
  });
  const target = questions.filter(isQ027);
  const keys = target.map((question) => `${question.patternSpecId}|${question.blankedDisplayText}|${question.answerText}`);
  if (new Set(keys).size !== keys.length) errors.push(issue("p04f27_duplicate_question_identity", "questions"));
  return { ok: errors.length === 0, errors, warnings: [], infos: [], validatorVersion: "p04f27-g4a-u06-fraction-times-integer-quantity-v1", validatedAt: null };
}
