export * from "./batch-a-browser-validator-p03f42.js";
import {
  validateBatchABrowserPlan as basePlan,
  validateBatchABrowserQuestion as baseQuestion,
  validateBatchABrowserQuestions as baseQuestions,
} from "./batch-a-browser-validator-p03f42.js";
import { G4B_U08_P03F43_SOURCE_ID, P03F43_SPEC_IDS } from "../registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";
import { validateG4BU08P03F43Question } from "./g4b-u08-rank10-fraction-runtime-p03f43.js";

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const id = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isTarget = (question) => P03F43_SPEC_IDS.includes(id(question));
const signature = (question) => `${id(question)}|${question.blankedDisplayText}|${JSON.stringify(question.possibleValues ?? [])}|${question.coordinateNumerator ?? ""}|${question.distanceNumerator ?? ""}`;

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G4B_U08_P03F43_SOURCE_ID || !plan.patternSpecIds?.some((patternSpecId) => P03F43_SPEC_IDS.includes(patternSpecId))) return basePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length < 1) errors.push(issue("p03f43_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f43_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f43_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f43_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) { return isTarget(question) ? validateG4BU08P03F43Question(question) : baseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isTarget)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => {
    const validation = isTarget(question) ? validateG4BU08P03F43Question(question) : baseQuestion(question);
    errors.push(...(validation.errors ?? []).map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  });
  for (const specId of P03F43_SPEC_IDS) {
    const target = questions.filter((question) => id(question) === specId);
    if (new Set(target.map(signature)).size !== target.length) errors.push(issue("p03f43_duplicate_problem_detected", `questions.${specId}`));
  }
  return { ok: errors.length === 0, errors, warnings: [], infos: [], validatorVersion: "p03f43-g4b-u08-rank10-fraction-v1", validatedAt: null };
}
