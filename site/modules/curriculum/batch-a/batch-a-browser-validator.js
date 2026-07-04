import { evaluateExpression } from "../../core/evaluate-expression.js";
import { getIntegerRawValue, isIntegerValue } from "../../core/number-value.js";
import { validateBatchAQuestionCarryPolicy } from "./carry-policy.js";
import { getBatchABrowserPatternDefinition, getBatchAPatternSpecIdsForSource } from "./source-pattern-index.js";
import { validateBatchAPlanScope } from "./production-eligibility.js";

function issue(code, path, message, severity = "error") {
  return { code, severity, path, message };
}

function intValue(value) {
  if (Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) return Number(value.trim());
  if (isIntegerValue(value)) return getIntegerRawValue(value);
  return null;
}

export function validateBatchABrowserPlan(plan = {}) {
  const scope = validateBatchAPlanScope(plan);
  const errors = [...scope.errors];
  const ordering = plan.ordering ?? "groupedByPattern";
  if (!["groupedByPattern", "shuffleAcrossPatterns"].includes(ordering)) {
    errors.push(issue("batch_a_ordering_invalid", "ordering", "ordering must be groupedByPattern or shuffleAcrossPatterns."));
  }
  const patternSpecIds = Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0
    ? plan.patternSpecIds
    : getBatchAPatternSpecIdsForSource(plan.sourceId);
  if (patternSpecIds.length === 0) {
    errors.push(issue("batch_a_source_has_no_patterns", "patternSpecIds", `No browser pattern bridge exists for source '${plan.sourceId}'.`));
  }
  for (const patternSpecId of patternSpecIds) {
    const definition = getBatchABrowserPatternDefinition(patternSpecId);
    if (!definition) {
      errors.push(issue("batch_a_pattern_not_available", "patternSpecIds", `Pattern '${patternSpecId}' is not available in the Batch A browser bridge.`));
    } else if (definition.sourceId !== plan.sourceId) {
      errors.push(issue("batch_a_pattern_source_mismatch", "patternSpecIds", `Pattern '${patternSpecId}' does not belong to source '${plan.sourceId}'.`));
    }
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  const errors = [];
  const patternSpecId = question?.metadata?.patternId ?? question.patternSpecId;
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (!definition) {
    errors.push(issue("batch_a_pattern_not_available", "metadata.patternId", `Pattern '${patternSpecId}' is not available in the Batch A browser bridge.`));
    return { ok: false, errors, warnings: [] };
  }
  if (question?.metadata?.sourceId !== definition.sourceId) {
    errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId", "Question sourceId does not match pattern definition."));
  }

  if (definition.kind === "expression") {
    if (!question.expression) {
      errors.push(issue("batch_a_expression_missing", "expression", "Expression question requires an expression tree."));
    } else {
      const evaluated = evaluateExpression(question.expression);
      if (!evaluated.ok || !evaluated.value) {
        errors.push(...(evaluated.errors ?? []).map((error) => issue(error.code, error.path, error.message)));
      } else if (intValue(question.finalAnswer) !== getIntegerRawValue(evaluated.value)) {
        errors.push(issue("batch_a_answer_incorrect", "finalAnswer", "Expression finalAnswer does not match evaluated result."));
      } else if (Number.isFinite(definition.answerConstraint?.max) && getIntegerRawValue(evaluated.value) > definition.answerConstraint.max) {
        errors.push(issue("batch_a_answer_above_max", "answerConstraint.max", "Expression finalAnswer is above the pattern answer maximum."));
      }

      const carryPolicyCheck = validateBatchAQuestionCarryPolicy(definition, question);
      errors.push(...carryPolicyCheck.errors);
    }
  } else if (definition.kind === "comparison") {
    const expected = question.left > question.right ? ">" : question.left < question.right ? "<" : "=";
    if (question.answerText !== expected) {
      errors.push(issue("batch_a_answer_incorrect", "answerText", "Comparison answerText does not match numeric comparison."));
    }
  } else {
    errors.push(issue("batch_a_pattern_kind_unsupported", "kind", `Pattern kind '${definition.kind}' is not supported.`));
  }

  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestions(questions = []) {
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    validatorVersion: "s42b10-batch-a-browser-validator-v1",
    validatedAt: null
  };
}
