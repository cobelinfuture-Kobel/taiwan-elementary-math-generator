export * from "./batch-a-browser-validator-p03f18.js";
import { validateBatchABrowserPlan as validateBasePlan, validateBatchABrowserQuestion as validateBaseQuestion, validateBatchABrowserQuestions as validateBaseQuestions } from "./batch-a-browser-validator-p03f18.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f19-extension.js";
import { validateG4BU06Slice019Question } from "./two-decimal-rate-runtime-p03f19.js";
import { G4B_U06_SLICE019_SOURCE_ID, G4B_U06_SLICE019_PATTERN_SPEC_IDS } from "../registry/g4b-u06-two-decimal-rate-selector-projection.js";

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F19 = (question = {}) => G4B_U06_SLICE019_PATTERN_SPEC_IDS.includes(patternId(question));

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  const current = plan.sourceId === G4B_U06_SLICE019_SOURCE_ID && ids.length > 0 && ids.every((id) => G4B_U06_SLICE019_PATTERN_SPEC_IDS.includes(id));
  if (!current) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 24) errors.push(issue("p03f19_question_count_invalid", "questionCount"));
  if (!["numeric", "application"].includes(plan.questionMode)) errors.push(issue("p03f19_question_mode_invalid", "questionMode"));
  if (ids.some((id) => getBatchABrowserPatternDefinition(id)?.questionMode !== plan.questionMode)) errors.push(issue("p03f19_pattern_mode_mismatch", "patternSpecIds"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f19_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) { return isP03F19(question) ? validateG4BU06Slice019Question(question) : validateBaseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F19)) return validateBaseQuestions(questions);
  const errors = []; const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...(result.warnings ?? []));
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f19-g4b-u06-two-decimal-rate-v1", validatedAt: null };
}
