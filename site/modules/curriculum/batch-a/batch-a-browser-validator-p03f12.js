export * from "./batch-a-browser-validator-p03f11.js";
import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f11.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f12-extension.js";
import { validateG4BU08EquivalenceCrossProductQuestion } from "./equivalence-cross-product-runtime.js";
import { G4B_U08_SOURCE_ID } from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";
import { G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID } from "../registry/g4b-u08-equivalence-cross-product-selector-projection.js";

const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F12 = (question = {}) => patternId(question) === G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID;
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (plan.sourceId !== G4B_U08_SOURCE_ID
    || ids.length !== 1
    || ids[0] !== G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID) {
    return validateBasePlan(plan);
  }
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 20) {
    errors.push(issue("p03f12_question_count_invalid", "questionCount"));
  }
  if (plan.questionMode !== "numeric") errors.push(issue("p03f12_question_mode_mismatch", "questionMode"));
  if (plan.genericFallbackAllowed !== false) {
    errors.push(issue("p03f12_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  }
  const definition = getBatchABrowserPatternDefinition(ids[0]);
  if (!definition
    || definition.requestedUnknownRole !== "equivalent"
    || JSON.stringify(definition.givenRoles) !== JSON.stringify([
      "leftNumerator",
      "leftDenominator",
      "rightNumerator",
      "rightDenominator",
    ])) {
    errors.push(issue("p03f12_pattern_definition_invalid", "patternSpecIds"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return isP03F12(question)
    ? validateG4BU08EquivalenceCrossProductQuestion(question)
    : validateBaseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F12)) return validateBaseQuestions(questions);
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({
      ...entry,
      path: `questions[${index}].${entry.path}`,
    })));
    warnings.push(...result.warnings);
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    validatorVersion: "p03f12-g4b-u08-equivalence-cross-product-v1",
    validatedAt: null,
  };
}
