export * from "./batch-a-browser-validator-p03f.js";

import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f.js";
import { G3A_U08_PART_WHOLE_PATTERN_SPEC_ID, G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import { G3A_U08_SLICE002_PATTERN_SPEC_IDS } from "../registry/g3a-u08-slice002-selector-projection.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f2-extension.js";
import { validateG3AU08Slice002Question } from "./slice002-fraction-runtime.js";

const Q2 = new Set(G3A_U08_SLICE002_PATTERN_SPEC_IDS);
const issue = (code, path, message = code) => ({ code, severity: "error", path, message });
function patternId(question = {}) { return question.patternSpecId ?? question.metadata?.patternId; }
function isQ2Question(question = {}) { return Q2.has(patternId(question)); }

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G3A_U08_SOURCE_ID) return validateBasePlan(plan);
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (ids.length === 1 && ids[0] === G3A_U08_PART_WHOLE_PATTERN_SPEC_ID) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0) errors.push(issue("p03f2_question_count_invalid", "questionCount"));
  if (ids.length === 0 || !ids.every((id) => Q2.has(id))) errors.push(issue("p03f2_plan_pattern_not_admitted", "patternSpecIds"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f2_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  for (const id of ids.filter((value) => Q2.has(value))) {
    const definition = getBatchABrowserPatternDefinition(id);
    if (definition?.questionMode !== plan.questionMode) errors.push(issue("p03f2_question_mode_pattern_mismatch", "questionMode"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) {
  return isQ2Question(question) ? validateG3AU08Slice002Question(question) : validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isQ2Question)) return validateBaseQuestions(questions);
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f2-g3a-u08-fraction-quantity-v1", validatedAt: null };
}
