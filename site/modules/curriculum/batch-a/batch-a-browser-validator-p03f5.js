export * from "./batch-a-browser-validator-p03f4.js";

import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f4.js";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
} from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f5-extension.js";
import { validateG4BU08EquivalentFractionQuestion } from "./equivalent-fraction-runtime.js";

const issue = (code, path, message = code) => ({ code, severity: "error", path, message });
function patternId(question = {}) { return question.patternSpecId ?? question.metadata?.patternId; }
function isP03F5Question(question = {}) { return G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS.includes(patternId(question)); }

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G4B_U08_SOURCE_ID) return validateBasePlan(plan);
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 20) errors.push(issue("p03f5_question_count_invalid", "questionCount"));
  if (ids.length !== 3 || !G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS.every((id) => ids.includes(id))) errors.push(issue("p03f5_plan_pattern_not_admitted", "patternSpecIds"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f5_application_mode_forbidden", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f5_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  if (ids.some((id) => getBatchABrowserPatternDefinition(id)?.questionMode !== "numeric")) errors.push(issue("p03f5_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) {
  return isP03F5Question(question) ? validateG4BU08EquivalentFractionQuestion(question) : validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F5Question)) return validateBaseQuestions(questions);
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f5-g4b-u08-equivalent-fraction-v1", validatedAt: null };
}
