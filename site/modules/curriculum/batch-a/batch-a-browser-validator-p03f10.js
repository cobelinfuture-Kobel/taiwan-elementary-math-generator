export * from "./batch-a-browser-validator-p03f9.js";
import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f9.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f10-extension.js";
import { validateG4AU09HundredthDecimalQuestion } from "./hundredth-decimal-runtime.js";
import {
  G4A_U09_SOURCE_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-hundredth-decimal-selector-projection.js";

const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F10 = (question = {}) => patternId(question) === G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID;
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (plan.sourceId !== G4A_U09_SOURCE_ID || ids.length !== 1 || ids[0] !== G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 240) errors.push(issue("p03f10_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f10_application_scope_violation", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f10_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  const definition = getBatchABrowserPatternDefinition(G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID);
  if (!definition || definition.requestedUnknownRole !== "decimal" || definition.numericDomain?.exactScale !== 2) errors.push(issue("p03f10_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) {
  return isP03F10(question) ? validateG4AU09HundredthDecimalQuestion(question) : validateBaseQuestion(question);
}
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F10)) return validateBaseQuestions(questions);
  const errors = [], warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f10-g4a-u09-hundredth-decimal-v1", validatedAt: null };
}
