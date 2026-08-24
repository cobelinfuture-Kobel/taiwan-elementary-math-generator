export * from "./batch-a-browser-validator-p03f16.js";
import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f16.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f17-extension.js";
import { validateG4AU06FractionClassificationSlice017Question } from "./fraction-type-classification-runtime-p03f17.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
} from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";

const IDS = Object.freeze([...G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS]);
const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F17 = (question = {}) => IDS.includes(patternId(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  const slice017 = plan.sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID && ids.length > 0 && ids.every((id) => IDS.includes(id));
  if (!slice017) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 240) errors.push(issue("p03f17_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f17_question_mode_mismatch", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f17_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  for (const id of ids) if (!getBatchABrowserPatternDefinition(id)) errors.push(issue("p03f17_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  if (isP03F17(question)) return validateG4AU06FractionClassificationSlice017Question(question);
  return validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F17)) return validateBaseQuestions(questions);
  const errors = []; const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f17-g4a-u06-fraction-classification-v1", validatedAt: null };
}
