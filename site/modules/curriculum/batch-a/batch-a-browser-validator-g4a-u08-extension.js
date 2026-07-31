export * from "./batch-a-browser-validator-p03f3.js";

import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p03f3.js";
import {
  isG3BU04StructuralSemanticPatternSpecId,
} from "./g3b-u04-semantic-generator.js";
import {
  isG3BU04MultiplicativeSemanticPatternSpecId,
} from "./g3b-u04-multiplicative-semantic-generator.js";
import {
  validateG3BU04SemanticQuestion,
} from "./g3b-u04-semantic-validator-unit-flow-fullfix.js";
import {
  validateG3BU04HumanSemanticQualityV2,
} from "./g3b-u04-human-semantic-readback-quality-v2.js";

function patternSpecId(question = {}) {
  return question.patternSpecId ?? question.metadata?.patternId ?? null;
}

function isG3BU04SemanticQuestion(question = {}) {
  const id = patternSpecId(question);
  return isG3BU04StructuralSemanticPatternSpecId(id)
    || isG3BU04MultiplicativeSemanticPatternSpecId(id);
}

function validateG3BU04WorksheetQuestion(question = {}) {
  const semantic = validateG3BU04SemanticQuestion(question);
  const readback = validateG3BU04HumanSemanticQualityV2(question);
  const errors = [...(semantic.errors ?? []), ...(readback.errors ?? [])];
  const warnings = [...(semantic.warnings ?? []), ...(readback.warnings ?? [])];
  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateBatchABrowserPlan(plan = {}) {
  return validateBasePlan(plan);
}

export function validateBatchABrowserQuestion(question = {}) {
  return isG3BU04SemanticQuestion(question)
    ? validateG3BU04WorksheetQuestion(question)
    : validateBaseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isG3BU04SemanticQuestion)) return validateBaseQuestions(questions);

  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...(result.errors ?? []).map((error) => ({
      ...error,
      path: `questions[${index}].${error.path ?? "validation"}`,
    })));
    warnings.push(...(result.warnings ?? []).map((warning) => ({
      ...warning,
      path: `questions[${index}].${warning.path ?? "validation"}`,
    })));
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    validatorVersion: "pgc-r08-a05-g3b-u04-semantic-consumer-v1",
    validatedAt: null,
  };
}
