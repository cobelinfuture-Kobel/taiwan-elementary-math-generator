import {
  getG4AU08NumericCanonicalPatternSpec,
  listG4AU08NumericCanonicalPatternSpecs,
} from "../../../site/modules/curriculum/batch-a/g4a-u08-numeric-canonical-hidden.js";

const SOURCE_ID = "g4a_u08_4a08";
const UNIT_CODE = "4A-U08";
const OPERATORS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = Object.freeze({ "+": 1, "-": 1, "×": 2, "÷": 2 });

const ERROR_CODES = Object.freeze({
  ITEM_INVALID: "G4AU08_NUMERIC_ITEM_INVALID",
  SCHEMA_INVALID: "G4AU08_NUMERIC_SCHEMA_INVALID",
  SOURCE_MISMATCH: "G4AU08_NUMERIC_SOURCE_MISMATCH",
  UNIT_MISMATCH: "G4AU08_NUMERIC_UNIT_MISMATCH",
  PATTERN_SPEC_UNKNOWN: "G4AU08_NUMERIC_PATTERN_SPEC_UNKNOWN",
  KP_MISMATCH: "G4AU08_NUMERIC_KP_MISMATCH",
  PATTERN_GROUP_MISMATCH: "G4AU08_NUMERIC_PATTERN_GROUP_MISMATCH",
  REASONING_ROLE_MISMATCH: "G4AU08_NUMERIC_REASONING_ROLE_MISMATCH",
  EXPRESSION_MISSING: "G4AU08_NUMERIC_EXPRESSION_MISSING",
  ANSWER_INCORRECT: "G4AU08_NUMERIC_ANSWER_INCORRECT",
  TRACE_INVALID: "G4AU08_NUMERIC_TRACE_INVALID",
  EVIDENCE_MISSING: "G4AU08_NUMERIC_EVIDENCE_MISSING",
  EQUIVALENCE_RULE_VIOLATION: "G4AU08_NUMERIC_EQUIVALENCE_RULE_VIOLATION",
  LEFT_ASSOCIATION_VIOLATION: "G4AU08_NUMERIC_LEFT_ASSOCIATION_VIOLATION",
  PARENTHESES_FIDELITY_VIOLATION: "G4AU08_NUMERIC_PARENTHESES_FIDELITY_VIOLATION",
  PRECEDENCE_VIOLATION: "G4AU08_NUMERIC_PRECEDENCE_VIOLATION",
  COMPOUND_CONSTRAINT_VIOLATION: "G4AU08_NUMERIC_COMPOUND_CONSTRAINT_VIOLATION",
  LIFECYCLE_INVALID: "G4AU08_NUMERIC_LIFECYCLE_INVALID",
  PUBLIC_ROUTING_FORBIDDEN: "G4AU08_NUMERIC_PUBLIC_ROUTING_FORBIDDEN",
  PRODUCTION_USE_FORBIDDEN: "G4AU08_NUMERIC_PRODUCTION_USE_FORBIDDEN",
});

const MUTATION_IDS_BY_GROUP = Object.freeze({
  pg_g4a_u08_num_add_group_round: Object.freeze(["move_term_without_sign", "grouping_not_useful", "non_equivalent_reorder"]),
  pg_g4a_u08_num_signed_term_move: Object.freeze(["sign_binding_changed", "term_dropped", "term_duplicated"]),
  pg_g4a_u08_num_add_sub_left_assoc: Object.freeze(["right_group_reinterpretation", "precedence_changing_parentheses"]),
  pg_g4a_u08_num_parentheses_first: Object.freeze(["outside_operation_evaluated_first", "parenthesis_group_removed"]),
  pg_g4a_u08_num_repeated_subtract_group: Object.freeze(["subtract_difference_instead_of_sum", "second_subtrahend_sign_flip"]),
  pg_g4a_u08_num_mul_div_safe_reorder: Object.freeze(["divisor_treated_as_multiplier", "zero_divisor", "non_equivalent_permutation"]),
  pg_g4a_u08_num_mul_div_left_assoc: Object.freeze(["reinterpret_as_divide_by_product", "right_group_reinterpretation"]),
  pg_g4a_u08_num_repeated_divide_group: Object.freeze(["divide_by_quotient", "zero_divisor", "divisor_omitted"]),
  pg_g4a_u08_num_mul_div_before_add_sub: Object.freeze(["evaluate_all_left_to_right", "additive_node_before_mul_div_node"]),
  pg_g4a_u08_num_parentheses_change_precedence: Object.freeze(["redundant_parentheses_claimed_nonredundant", "unparenthesized_ast_equal"]),
  pg_g4a_u08_num_compound_parentheses: Object.freeze(["parenthesis_group_count_below_two", "operator_set_incomplete", "ast_depth_exceeded", "non_integer_division"]),
});

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function issue(code, field, expected, actual) {
  return Object.freeze({ code, field, expected, actual });
}

function toRpn(tokens) {
  const output = [];
  const operators = [];
  for (const token of tokens ?? []) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") operators.push(token);
    else if (token === ")") {
      while (operators.length > 0 && operators.at(-1) !== "(") output.push(operators.pop());
      if (operators.at(-1) === "(") operators.pop();
    } else if (OPERATORS.has(token)) {
      while (operators.length > 0 && OPERATORS.has(operators.at(-1)) && PRECEDENCE[operators.at(-1)] >= PRECEDENCE[token]) output.push(operators.pop());
      operators.push(token);
    }
  }
  while (operators.length > 0) output.push(operators.pop());
  return output;
}

function evaluate(tokens) {
  const stack = [];
  for (const token of toRpn(tokens)) {
    if (Number.isInteger(token)) {
      stack.push(token);
      continue;
    }
    const right = stack.pop();
    const left = stack.pop();
    if (!Number.isFinite(left) || !Number.isFinite(right)) return NaN;
    if (token === "+") stack.push(left + right);
    else if (token === "-") stack.push(left - right);
    else if (token === "×") stack.push(left * right);
    else if (token === "÷") stack.push(right === 0 ? NaN : left / right);
  }
  return stack.length === 1 ? stack[0] : NaN;
}

function countParenthesisGroups(tokens) {
  return (tokens ?? []).filter((token) => token === "(").length;
}

function operatorSet(tokens) {
  return [...new Set((tokens ?? []).filter((token) => OPERATORS.has(token)))];
}

function withoutParentheses(tokens) {
  return (tokens ?? []).filter((token) => token !== "(" && token !== ")");
}

function deriveEvidence(sample, definition) {
  const existing = clone(sample.canonicalEvidence ?? {});
  const groupId = definition.patternGroupId;
  if (groupId === "pg_g4a_u08_num_add_sub_left_assoc" || groupId === "pg_g4a_u08_num_mul_div_left_assoc") {
    return {
      ...existing,
      leftAssociated: true,
      operationOrderTrace: clone(sample.operationOrderTrace ?? []),
      expressionTokens: clone(sample.expressionTokens),
    };
  }
  if (groupId === "pg_g4a_u08_num_parentheses_first") {
    return {
      ...existing,
      parenthesisGroupCount: countParenthesisGroups(sample.expressionTokens),
      firstTraceOperation: clone(sample.operationOrderTrace?.[0] ?? null),
    };
  }
  if (groupId === "pg_g4a_u08_num_mul_div_before_add_sub") {
    const firstTraceOperator = sample.operationOrderTrace?.[0]?.op ?? null;
    return {
      ...existing,
      firstTraceOperator,
      higherPrecedenceEvaluatedFirst: firstTraceOperator === "×" || firstTraceOperator === "÷",
      operationOrderTrace: clone(sample.operationOrderTrace ?? []),
    };
  }
  if (groupId === "pg_g4a_u08_num_parentheses_change_precedence") {
    const withParentheses = evaluate(sample.expressionTokens);
    const without = evaluate(withoutParentheses(sample.expressionTokens));
    return {
      ...existing,
      parenthesisGroupCount: countParenthesisGroups(sample.expressionTokens),
      parenthesizedValue: withParentheses,
      unparenthesizedValue: without,
      parenthesesEffect: withParentheses !== without,
    };
  }
  if (groupId === "pg_g4a_u08_num_compound_parentheses") {
    return {
      ...existing,
      parenthesisGroupCount: countParenthesisGroups(sample.expressionTokens),
      operatorSet: operatorSet(sample.expressionTokens),
      exactIntegerDivision: sample.operationOrderTrace?.filter((step) => step.op === "÷").every((step) => Number.isInteger(step.result)) === true,
      intermediateValues: clone(sample.intermediateResults ?? []),
    };
  }
  return existing;
}

export function adaptG4AU08NumericSample(sample) {
  if (!sample || typeof sample !== "object" || Array.isArray(sample)) throw new TypeError(ERROR_CODES.ITEM_INVALID);
  const definition = getG4AU08NumericCanonicalPatternSpec(sample.patternSpecId);
  if (!definition) throw new Error(`${ERROR_CODES.PATTERN_SPEC_UNKNOWN}:${sample.patternSpecId}`);
  const canonical = {
    schemaName: "G4AU08NumericCanonicalGeneratedItem",
    schemaVersion: 1,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    mode: "numeric",
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    patternSpecId: definition.patternSpecId,
    legacyPatternSpecId: sample.legacyPatternSpecId ?? sample.patternSpecId,
    reasoningRole: definition.reasoningRole,
    prompt: sample.promptText ?? sample.blankedDisplayText ?? sample.expression,
    expression: sample.expression,
    expressionTokens: clone(sample.expressionTokens ?? []),
    operations: clone(sample.operationOrderTrace ?? []),
    intermediateValues: clone(sample.intermediateResults ?? []),
    answerModel: { shape: "final_numeric_answer", value: sample.finalAnswer },
    canonicalEvidence: deriveEvidence(sample, definition),
    shapeVariant: sample.shapeVariant ?? null,
    lifecycle: {
      adapterStatus: "implemented_hidden",
      validatorStatus: "implemented_hidden",
      mutationStatus: "implemented_hidden",
      selectorVisibility: "hidden",
      canonicalRouting: "disabled",
      worksheetReachability: "disabled",
      productionUse: "forbidden",
    },
  };
  return deepFreeze(canonical);
}

function validateLifecycle(item, errors) {
  const lifecycle = item.lifecycle;
  if (!lifecycle || typeof lifecycle !== "object") {
    errors.push(issue(ERROR_CODES.LIFECYCLE_INVALID, "lifecycle", "hidden lifecycle", lifecycle));
    return;
  }
  if (lifecycle.adapterStatus !== "implemented_hidden" || lifecycle.validatorStatus !== "implemented_hidden" || lifecycle.mutationStatus !== "implemented_hidden" || lifecycle.selectorVisibility !== "hidden") {
    errors.push(issue(ERROR_CODES.LIFECYCLE_INVALID, "lifecycle", "implemented_hidden", lifecycle));
  }
  if (lifecycle.canonicalRouting !== "disabled" || lifecycle.worksheetReachability !== "disabled") {
    errors.push(issue(ERROR_CODES.PUBLIC_ROUTING_FORBIDDEN, "lifecycle", "routing disabled", lifecycle));
  }
  if (lifecycle.productionUse !== "forbidden") errors.push(issue(ERROR_CODES.PRODUCTION_USE_FORBIDDEN, "lifecycle.productionUse", "forbidden", lifecycle.productionUse));
}

function validateEquivalence(item, leftField, rightField, errors) {
  const left = item.canonicalEvidence?.[leftField];
  const right = item.canonicalEvidence?.[rightField];
  if (!Array.isArray(left) || !Array.isArray(right) || evaluate(left) !== evaluate(right)) {
    errors.push(issue(ERROR_CODES.EQUIVALENCE_RULE_VIOLATION, "canonicalEvidence", "equivalent token arrays", item.canonicalEvidence));
  }
}

function validateGroupFidelity(item, errors) {
  const evidence = item.canonicalEvidence ?? {};
  switch (item.patternGroupId) {
    case "pg_g4a_u08_num_add_group_round": {
      const vector = evidence.signedTermVector;
      const pair = evidence.usefulGroupingTermIndexes;
      if (!Array.isArray(vector) || !Array.isArray(pair) || pair.length !== 2) errors.push(issue(ERROR_CODES.EVIDENCE_MISSING, "canonicalEvidence", "signed terms and useful pair", evidence));
      else {
        const left = vector[pair[0]];
        const right = vector[pair[1]];
        if (!left || !right || left.sign !== right.sign || (left.value + right.value) % 10 !== 0) errors.push(issue(ERROR_CODES.EQUIVALENCE_RULE_VIOLATION, "usefulGroupingTermIndexes", "same-sign round-number pair", pair));
      }
      validateEquivalence(item, "equivalentReorderedExpressionTokens", "equivalentReorderedExpressionTokens", errors);
      if (Array.isArray(evidence.equivalentReorderedExpressionTokens) && evaluate(item.expressionTokens) !== evaluate(evidence.equivalentReorderedExpressionTokens)) errors.push(issue(ERROR_CODES.EQUIVALENCE_RULE_VIOLATION, "equivalentReorderedExpressionTokens", item.answerModel.value, evaluate(evidence.equivalentReorderedExpressionTokens)));
      break;
    }
    case "pg_g4a_u08_num_signed_term_move":
      if (!Array.isArray(evidence.signedTermVector) || !Array.isArray(evidence.permutation) || !Array.isArray(evidence.equivalentReorderedExpressionTokens)) errors.push(issue(ERROR_CODES.EVIDENCE_MISSING, "canonicalEvidence", "signed term permutation evidence", evidence));
      else if (evaluate(item.expressionTokens) !== evaluate(evidence.equivalentReorderedExpressionTokens)) errors.push(issue(ERROR_CODES.EQUIVALENCE_RULE_VIOLATION, "equivalentReorderedExpressionTokens", item.answerModel.value, evaluate(evidence.equivalentReorderedExpressionTokens)));
      break;
    case "pg_g4a_u08_num_add_sub_left_assoc":
    case "pg_g4a_u08_num_mul_div_left_assoc":
      if (evidence.leftAssociated !== true || !Array.isArray(evidence.operationOrderTrace) || evidence.operationOrderTrace.length < 2) errors.push(issue(ERROR_CODES.LEFT_ASSOCIATION_VIOLATION, "canonicalEvidence", "left-associated trace", evidence));
      break;
    case "pg_g4a_u08_num_parentheses_first":
      if (!(evidence.parenthesisGroupCount >= 1) || !evidence.firstTraceOperation) errors.push(issue(ERROR_CODES.PARENTHESES_FIDELITY_VIOLATION, "canonicalEvidence", "parentheses-first evidence", evidence));
      break;
    case "pg_g4a_u08_num_repeated_subtract_group":
      validateEquivalence(item, "ungroupedExpressionTokens", "groupedExpressionTokens", errors);
      break;
    case "pg_g4a_u08_num_mul_div_safe_reorder":
      if (!Array.isArray(evidence.factorReciprocalVector) || !Array.isArray(evidence.safePermutation) || !Array.isArray(evidence.equivalentReorderedExpressionTokens)) errors.push(issue(ERROR_CODES.EVIDENCE_MISSING, "canonicalEvidence", "factor reciprocal evidence", evidence));
      else if (evaluate(item.expressionTokens) !== evaluate(evidence.equivalentReorderedExpressionTokens)) errors.push(issue(ERROR_CODES.EQUIVALENCE_RULE_VIOLATION, "equivalentReorderedExpressionTokens", item.answerModel.value, evaluate(evidence.equivalentReorderedExpressionTokens)));
      break;
    case "pg_g4a_u08_num_repeated_divide_group":
      validateEquivalence(item, "ungroupedExpressionTokens", "groupedExpressionTokens", errors);
      if (!(evidence.divisorProduct > 0)) errors.push(issue(ERROR_CODES.EVIDENCE_MISSING, "divisorProduct", "positive integer", evidence.divisorProduct));
      break;
    case "pg_g4a_u08_num_mul_div_before_add_sub":
      if (evidence.higherPrecedenceEvaluatedFirst !== true || !["×", "÷"].includes(evidence.firstTraceOperator)) errors.push(issue(ERROR_CODES.PRECEDENCE_VIOLATION, "canonicalEvidence", "mul/div first", evidence));
      break;
    case "pg_g4a_u08_num_parentheses_change_precedence":
      if (!(evidence.parenthesisGroupCount >= 1) || evidence.parenthesesEffect !== true || evidence.parenthesizedValue === evidence.unparenthesizedValue) errors.push(issue(ERROR_CODES.PARENTHESES_FIDELITY_VIOLATION, "canonicalEvidence", "nonredundant parentheses", evidence));
      break;
    case "pg_g4a_u08_num_compound_parentheses": {
      const ops = new Set(evidence.operatorSet ?? []);
      const values = evidence.intermediateValues ?? [];
      if (evidence.parenthesisGroupCount !== 2 || !["+", "-", "×", "÷"].every((op) => ops.has(op)) || evidence.astDepth > 4 || evidence.exactIntegerDivision !== true || !values.every((value) => Number.isInteger(value) && value >= 0 && value <= 9999)) {
        errors.push(issue(ERROR_CODES.COMPOUND_CONSTRAINT_VIOLATION, "canonicalEvidence", "bounded compound constraints", evidence));
      }
      break;
    }
    default:
      errors.push(issue(ERROR_CODES.PATTERN_GROUP_MISMATCH, "patternGroupId", "known numeric group", item.patternGroupId));
  }
}

export function validateG4AU08NumericCanonicalItem(item) {
  const errors = [];
  if (!item || typeof item !== "object" || Array.isArray(item)) return Object.freeze({ valid: false, errors: Object.freeze([issue(ERROR_CODES.ITEM_INVALID, "item", "object", item)]) });
  if (item.schemaName !== "G4AU08NumericCanonicalGeneratedItem" || item.schemaVersion !== 1) errors.push(issue(ERROR_CODES.SCHEMA_INVALID, "schema", "G4AU08NumericCanonicalGeneratedItem@1", `${item.schemaName}@${item.schemaVersion}`));
  if (item.sourceId !== SOURCE_ID) errors.push(issue(ERROR_CODES.SOURCE_MISMATCH, "sourceId", SOURCE_ID, item.sourceId));
  if (item.unitCode !== UNIT_CODE) errors.push(issue(ERROR_CODES.UNIT_MISMATCH, "unitCode", UNIT_CODE, item.unitCode));
  const definition = getG4AU08NumericCanonicalPatternSpec(item.patternSpecId);
  if (!definition) errors.push(issue(ERROR_CODES.PATTERN_SPEC_UNKNOWN, "patternSpecId", "known numeric PatternSpec", item.patternSpecId));
  else {
    if (item.knowledgePointId !== definition.knowledgePointId) errors.push(issue(ERROR_CODES.KP_MISMATCH, "knowledgePointId", definition.knowledgePointId, item.knowledgePointId));
    if (item.patternGroupId !== definition.patternGroupId) errors.push(issue(ERROR_CODES.PATTERN_GROUP_MISMATCH, "patternGroupId", definition.patternGroupId, item.patternGroupId));
    if (item.reasoningRole !== definition.reasoningRole) errors.push(issue(ERROR_CODES.REASONING_ROLE_MISMATCH, "reasoningRole", definition.reasoningRole, item.reasoningRole));
  }
  if (!Array.isArray(item.expressionTokens) || item.expressionTokens.length === 0 || typeof item.prompt !== "string" || !item.prompt.trim()) errors.push(issue(ERROR_CODES.EXPRESSION_MISSING, "expressionTokens", "non-empty expression", item.expressionTokens));
  const recomputed = evaluate(item.expressionTokens);
  if (!item.answerModel || typeof item.answerModel !== "object" || item.answerModel.value !== recomputed) errors.push(issue(ERROR_CODES.ANSWER_INCORRECT, "answerModel.value", recomputed, item.answerModel?.value));
  if (!Array.isArray(item.operations) || item.operations.length === 0) errors.push(issue(ERROR_CODES.TRACE_INVALID, "operations", "non-empty trace", item.operations));
  validateLifecycle(item, errors);
  if (definition) validateGroupFidelity(item, errors);
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    validatedLevels: Object.freeze(["L1", "L2", "L3", "L4", "L5"]),
    patternGroupId: item.patternGroupId ?? null,
    patternSpecId: item.patternSpecId ?? null,
  });
}

export function assertValidG4AU08NumericCanonicalItem(item) {
  const result = validateG4AU08NumericCanonicalItem(item);
  if (!result.valid) {
    const failure = new Error(result.errors.map((entry) => entry.code).join(","));
    failure.name = "G4AU08NumericCanonicalValidationError";
    failure.validationResult = result;
    throw failure;
  }
  return item;
}

function mutation(item, mutationId) {
  const output = clone(item);
  output.mutationId = mutationId;
  switch (mutationId) {
    case "move_term_without_sign":
    case "sign_binding_changed":
    case "second_subtrahend_sign_flip":
      output.answerModel.value += 1;
      if (output.canonicalEvidence?.signedTermVector?.[1]) output.canonicalEvidence.signedTermVector[1].sign *= -1;
      break;
    case "grouping_not_useful":
      output.canonicalEvidence.usefulGroupingTermIndexes = [0, 0];
      break;
    case "non_equivalent_reorder":
    case "non_equivalent_permutation":
      output.canonicalEvidence.equivalentReorderedExpressionTokens = [1, "+", 1];
      break;
    case "term_dropped":
      output.canonicalEvidence.equivalentReorderedExpressionTokens = output.canonicalEvidence.equivalentReorderedExpressionTokens.slice(0, -2);
      break;
    case "term_duplicated":
      output.canonicalEvidence.equivalentReorderedExpressionTokens.push("+", 1);
      break;
    case "right_group_reinterpretation":
    case "reinterpret_as_divide_by_product":
      output.canonicalEvidence.leftAssociated = false;
      break;
    case "precedence_changing_parentheses":
      output.canonicalEvidence.operationOrderTrace = [];
      break;
    case "outside_operation_evaluated_first":
      output.canonicalEvidence.firstTraceOperation = null;
      break;
    case "parenthesis_group_removed":
      output.canonicalEvidence.parenthesisGroupCount = 0;
      break;
    case "subtract_difference_instead_of_sum":
      output.canonicalEvidence.groupedExpressionTokens = [10, "-", "(", 4, "-", 2, ")"];
      break;
    case "divisor_treated_as_multiplier":
      output.canonicalEvidence.equivalentReorderedExpressionTokens = [2, "×", 3, "×", 4];
      break;
    case "zero_divisor":
      if (Array.isArray(output.canonicalEvidence.groupedExpressionTokens)) output.canonicalEvidence.groupedExpressionTokens = [10, "÷", 0];
      else output.canonicalEvidence.factorReciprocalVector = [{ value: 0, exponent: -1 }];
      output.answerModel.value += 1;
      break;
    case "divide_by_quotient":
      output.canonicalEvidence.groupedExpressionTokens = [24, "÷", "(", 6, "÷", 2, ")"];
      break;
    case "divisor_omitted":
      output.canonicalEvidence.divisorProduct = 0;
      break;
    case "evaluate_all_left_to_right":
    case "additive_node_before_mul_div_node":
      output.canonicalEvidence.higherPrecedenceEvaluatedFirst = false;
      output.canonicalEvidence.firstTraceOperator = "+";
      break;
    case "redundant_parentheses_claimed_nonredundant":
    case "unparenthesized_ast_equal":
      output.canonicalEvidence.parenthesesEffect = false;
      output.canonicalEvidence.unparenthesizedValue = output.canonicalEvidence.parenthesizedValue;
      break;
    case "parenthesis_group_count_below_two":
      output.canonicalEvidence.parenthesisGroupCount = 1;
      break;
    case "operator_set_incomplete":
      output.canonicalEvidence.operatorSet = ["+", "-", "×"];
      break;
    case "ast_depth_exceeded":
      output.canonicalEvidence.astDepth = 5;
      break;
    case "non_integer_division":
      output.canonicalEvidence.exactIntegerDivision = false;
      break;
    default:
      output.patternGroupId = "pg_g4a_u08_unknown";
  }
  return deepFreeze(output);
}

export function getG4AU08NumericMutationIdsByPatternGroup() {
  return MUTATION_IDS_BY_GROUP;
}

export function buildG4AU08NumericMutationCases(item) {
  const ids = MUTATION_IDS_BY_GROUP[item?.patternGroupId] ?? [];
  return ids.map((mutationId) => Object.freeze({ mutationId, item: mutation(item, mutationId) }));
}

export function validateG4AU08NumericValidatorRegistry() {
  const definitions = listG4AU08NumericCanonicalPatternSpecs();
  const groupIds = new Set(definitions.map((row) => row.patternGroupId));
  const mutationGroupIds = Object.keys(MUTATION_IDS_BY_GROUP);
  const errors = [];
  if (definitions.length !== 16) errors.push("pattern_spec_count_mismatch");
  if (groupIds.size !== 11) errors.push("pattern_group_count_mismatch");
  if (mutationGroupIds.length !== 11 || mutationGroupIds.some((id) => !groupIds.has(id))) errors.push("mutation_group_coverage_mismatch");
  if (mutationGroupIds.some((id) => MUTATION_IDS_BY_GROUP[id].length < 2)) errors.push("mutation_count_below_minimum");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ patternSpecs: definitions.length, patternGroups: groupIds.size, mutationCoveredPatternGroups: mutationGroupIds.length }),
  });
}

export function getG4AU08NumericValidatorErrorCodes() {
  return ERROR_CODES;
}
