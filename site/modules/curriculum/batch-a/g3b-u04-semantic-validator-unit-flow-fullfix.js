import {
  validateG3BU04SemanticQuestion as validateBaseG3BU04SemanticQuestion
} from "./g3b-u04-semantic-validator.js";

export const G3B_U04_DISTRIBUTED_RESOURCES_PATTERN_SPEC_ID =
  "ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group";

const EXPECTED_ROLE_CONTRACT = Object.freeze({
  a: Object.freeze({ semanticRole: "new_resource_count", unitDimension: "count" }),
  b: Object.freeze({ semanticRole: "recipient_count", unitDimension: "count" }),
  c: Object.freeze({ semanticRole: "existing_quantity_per_recipient", unitDimension: "count" })
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)])
    );
  }
  return value;
}

function roleContractMatches(question = {}) {
  if (question.patternSpecId !== G3B_U04_DISTRIBUTED_RESOURCES_PATTERN_SPEC_ID) return false;
  if (question.templateFamilyId !== "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group") return false;
  if (question.knowledgePointId !== "kp_g3b_u04_divide_then_add") return false;
  if (question.semanticSignature !== "distribute_new_resources_then_add_existing_per_recipient") return false;
  if (question.unknownRole !== "final_quantity_per_recipient") return false;
  if (!question.equationModel || !Number.isSafeInteger(question.quantities?.a)
    || !Number.isSafeInteger(question.quantities?.b)
    || !Number.isSafeInteger(question.quantities?.c)) return false;

  for (const [symbol, expected] of Object.entries(EXPECTED_ROLE_CONTRACT)) {
    const binding = question.quantityRoleBindings?.[symbol];
    if (!binding
      || binding.semanticRole !== expected.semanticRole
      || binding.unitDimension !== expected.unitDimension
      || binding.value !== question.quantities[symbol]) return false;
  }

  const quotient = question.quantities.a / question.quantities.b;
  return question.quantities.b > 0
    && Number.isSafeInteger(quotient)
    && quotient > 0
    && question.finalAnswer === quotient + question.quantities.c
    && question.answerUnit === question.quantityRoleBindings.a.unitLabel
    && question.answerUnit === question.quantityRoleBindings.c.unitLabel;
}

function isResolvedContextBoundCompatibilityError(error = {}) {
  return error.code === "G3B_U04_SEM_UNIT_FLOW_MISMATCH"
    && error.stage === "unit_flow"
    && error.path === "quantityRoleBindings";
}

function removeResolvedUnitFlowCode(stages = []) {
  return stages.map((stage) => {
    if (stage.stage !== "unit_flow") return cloneValue(stage);
    const errorCodes = (stage.errorCodes ?? []).filter(
      (code) => code !== "G3B_U04_SEM_UNIT_FLOW_MISMATCH"
    );
    return {
      ...cloneValue(stage),
      ok: errorCodes.length === 0,
      errorCodes
    };
  });
}

/**
 * Guards the approved resource-count flow:
 * count ÷ recipient-count produces an item count per recipient, which can be
 * added to an existing item count per recipient. The authoritative role is
 * count-based. This adapter remains as a narrow compatibility boundary for
 * previously materialized questions and never suppresses unrelated failures.
 */
export function validateG3BU04SemanticQuestion(question = {}, options = {}) {
  const result = validateBaseG3BU04SemanticQuestion(question, options);
  if (result.ok || !roleContractMatches(question)) return result;

  const matchingErrors = result.errors.filter(isResolvedContextBoundCompatibilityError);
  if (matchingErrors.length !== 1) return result;

  const remainingErrors = result.errors.filter(
    (error) => !isResolvedContextBoundCompatibilityError(error)
  );

  return {
    ...result,
    ok: remainingErrors.length === 0,
    errors: remainingErrors,
    stages: removeResolvedUnitFlowCode(result.stages)
  };
}
