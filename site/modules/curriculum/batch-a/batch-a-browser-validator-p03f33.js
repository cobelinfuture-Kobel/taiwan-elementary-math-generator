export * from "./batch-a-browser-validator-p03f32.js";
import {
  validateBatchABrowserPlan as basePlan,
  validateBatchABrowserQuestion as baseQuestion,
  validateBatchABrowserQuestions as baseQuestions,
} from "./batch-a-browser-validator-p03f32.js";
import {
  G4A_U06_P03F33_PATTERN_SPEC_IDS,
  G4A_U06_P03F33_SOURCE_ID,
  P03F33_REQUIRED_CAPABILITY_IDS,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";
import { validateG4AU06P03F33Question } from "./g4a-u06-rank9-fraction-runtime-p03f33.js";

const issue = (code, path) => ({ code, severity:"error", path, message:code });
const patternId = (question) => question.patternSpecId ?? question.metadata?.patternId;
const isTarget = (question) => G4A_U06_P03F33_PATTERN_SPEC_IDS.includes(patternId(question));

export function validateBatchABrowserPlan(plan = {}) {
  const hasTarget = plan.sourceId === G4A_U06_P03F33_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.some((id) => G4A_U06_P03F33_PATTERN_SPEC_IDS.includes(id));
  if (!hasTarget) return basePlan(plan);
  const errors = [];
  if (plan.patternSpecIds.some((id) => !G4A_U06_P03F33_PATTERN_SPEC_IDS.includes(id))) errors.push(issue("p03f33_pattern_set_invalid", "patternSpecIds"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("p03f33_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f33_question_mode_invalid", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f33_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  if (JSON.stringify(plan.publicControls?.requiredCapabilityIds ?? P03F33_REQUIRED_CAPABILITY_IDS) !== JSON.stringify(P03F33_REQUIRED_CAPABILITY_IDS)) errors.push(issue("p03f33_capability_union_invalid", "publicControls.requiredCapabilityIds"));
  return { ok:errors.length===0, errors, warnings:[] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return isTarget(question) ? validateG4AU06P03F33Question(question) : baseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isTarget)) return baseQuestions(questions);
  const errors = [];
  questions.forEach((question, index) => {
    errors.push(...validateBatchABrowserQuestion(question).errors.map((error) => ({ ...error, path:`questions[${index}].${error.path}` })));
  });
  return {
    ok:errors.length===0,
    errors,
    warnings:[],
    infos:[],
    validatorVersion:"p03f33-g4a-u06-rank9-fraction-capability-union-v1",
    validatedAt:null,
  };
}
