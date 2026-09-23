export * from "./batch-a-browser-validator-p03f14.js";
import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f14.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f15-extension.js";
import { validateG3BU07SameDenominatorSlice015Question } from "./same-denominator-fraction-runtime-p03f15.js";
import {
  G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
} from "../registry/g3b-u07-same-denominator-selector-projection.js";

const IDS = Object.freeze([...G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS, ...G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS]);
const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F15 = (question = {}) => IDS.includes(patternId(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  const slice015 = plan.sourceId === G3B_U07_SAME_DENOMINATOR_SOURCE_ID && ids.length > 0 && ids.every((id) => IDS.includes(id));
  if (!slice015) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 24) errors.push(issue("p03f15_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f15_question_mode_mismatch", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f15_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  for (const id of ids) if (!getBatchABrowserPatternDefinition(id)) errors.push(issue("p03f15_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  if (isP03F15(question)) return validateG3BU07SameDenominatorSlice015Question(question);
  return validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F15)) return validateBaseQuestions(questions);
  const errors = []; const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f15-g3b-u07-same-denominator-v1", validatedAt: null };
}
