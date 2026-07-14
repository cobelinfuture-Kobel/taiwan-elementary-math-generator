import { getG4AU08NumericCanonicalPatternSpec } from "./g4a-u08-numeric-canonical-hidden.js";

const SOURCE_ID = "g4a_u08_4a08";
const UNIT_CODE = "4A-U08";
const OPS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = { "+": 1, "-": 1, "×": 2, "÷": 2 };
const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

function toRpn(tokens) {
  const output = [];
  const stack = [];
  for (const token of tokens ?? []) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") stack.push(token);
    else if (token === ")") {
      while (stack.length && stack.at(-1) !== "(") output.push(stack.pop());
      if (stack.at(-1) === "(") stack.pop();
    } else if (OPS.has(token)) {
      while (stack.length && OPS.has(stack.at(-1)) && PRECEDENCE[stack.at(-1)] >= PRECEDENCE[token]) output.push(stack.pop());
      stack.push(token);
    }
  }
  while (stack.length) output.push(stack.pop());
  return output;
}

function evaluate(tokens) {
  const stack = [];
  for (const token of toRpn(tokens)) {
    if (Number.isInteger(token)) { stack.push(token); continue; }
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

function deriveEvidence(sample, definition) {
  const evidence = clone(sample.canonicalEvidence ?? {});
  const groupId = definition.patternGroupId;
  const tokens = sample.expressionTokens ?? [];
  if (["pg_g4a_u08_num_add_sub_left_assoc", "pg_g4a_u08_num_mul_div_left_assoc"].includes(groupId)) {
    return { ...evidence, leftAssociated: true, operationOrderTrace: clone(sample.operationOrderTrace ?? []), expressionTokens: clone(tokens) };
  }
  if (groupId === "pg_g4a_u08_num_parentheses_first") {
    return { ...evidence, parenthesisGroupCount: tokens.filter((token) => token === "(").length, firstTraceOperation: clone(sample.operationOrderTrace?.[0] ?? null) };
  }
  if (groupId === "pg_g4a_u08_num_mul_div_before_add_sub") {
    const firstTraceOperator = sample.operationOrderTrace?.[0]?.op ?? null;
    return { ...evidence, firstTraceOperator, higherPrecedenceEvaluatedFirst: ["×", "÷"].includes(firstTraceOperator), operationOrderTrace: clone(sample.operationOrderTrace ?? []) };
  }
  if (groupId === "pg_g4a_u08_num_parentheses_change_precedence") {
    const withoutParentheses = tokens.filter((token) => token !== "(" && token !== ")");
    const parenthesizedValue = evaluate(tokens);
    const unparenthesizedValue = evaluate(withoutParentheses);
    return { ...evidence, parenthesisGroupCount: tokens.filter((token) => token === "(").length, parenthesizedValue, unparenthesizedValue, parenthesesEffect: parenthesizedValue !== unparenthesizedValue };
  }
  if (groupId === "pg_g4a_u08_num_compound_parentheses") {
    return {
      ...evidence,
      parenthesisGroupCount: tokens.filter((token) => token === "(").length,
      operatorSet: [...new Set(tokens.filter((token) => OPS.has(token)))],
      exactIntegerDivision: sample.operationOrderTrace?.filter((step) => step.op === "÷").every((step) => Number.isInteger(step.result)) === true,
      intermediateValues: clone(sample.intermediateResults ?? []),
    };
  }
  return evidence;
}

export function adaptG4AU08NumericSampleForBrowser(sample) {
  if (!sample || typeof sample !== "object") throw new TypeError("G4AU08_NUMERIC_ITEM_INVALID");
  const definition = getG4AU08NumericCanonicalPatternSpec(sample.patternSpecId);
  if (!definition) throw new Error(`G4AU08_NUMERIC_PATTERN_SPEC_UNKNOWN:${sample.patternSpecId}`);
  return {
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
}

function error(code, field, expected, actual) {
  return { code, field, expected, actual };
}

export function validateG4AU08NumericCanonicalBrowserItem(item) {
  const errors = [];
  const definition = getG4AU08NumericCanonicalPatternSpec(item?.patternSpecId);
  if (!item || typeof item !== "object") return { valid: false, errors: [error("G4AU08_NUMERIC_ITEM_INVALID", "item", "object", item)] };
  if (item.schemaName !== "G4AU08NumericCanonicalGeneratedItem" || item.schemaVersion !== 1) errors.push(error("G4AU08_NUMERIC_SCHEMA_INVALID", "schema", "G4AU08NumericCanonicalGeneratedItem@1", `${item.schemaName}@${item.schemaVersion}`));
  if (item.sourceId !== SOURCE_ID || item.unitCode !== UNIT_CODE) errors.push(error("G4AU08_NUMERIC_SOURCE_UNIT_INVALID", "source", `${SOURCE_ID}/${UNIT_CODE}`, `${item.sourceId}/${item.unitCode}`));
  if (!definition) errors.push(error("G4AU08_NUMERIC_PATTERN_SPEC_UNKNOWN", "patternSpecId", "known numeric PatternSpec", item.patternSpecId));
  else {
    if (item.knowledgePointId !== definition.knowledgePointId) errors.push(error("G4AU08_NUMERIC_KP_MISMATCH", "knowledgePointId", definition.knowledgePointId, item.knowledgePointId));
    if (item.patternGroupId !== definition.patternGroupId) errors.push(error("G4AU08_NUMERIC_PATTERN_GROUP_MISMATCH", "patternGroupId", definition.patternGroupId, item.patternGroupId));
    if (item.reasoningRole !== definition.reasoningRole) errors.push(error("G4AU08_NUMERIC_REASONING_ROLE_MISMATCH", "reasoningRole", definition.reasoningRole, item.reasoningRole));
  }
  const answer = evaluate(item.expressionTokens);
  if (!Number.isInteger(answer) || item.answerModel?.value !== answer) errors.push(error("G4AU08_NUMERIC_ANSWER_INCORRECT", "answerModel.value", answer, item.answerModel?.value));
  if (!Array.isArray(item.operations) || item.operations.length === 0) errors.push(error("G4AU08_NUMERIC_TRACE_INVALID", "operations", "non-empty", item.operations));
  if (!item.canonicalEvidence || typeof item.canonicalEvidence !== "object") errors.push(error("G4AU08_NUMERIC_EVIDENCE_MISSING", "canonicalEvidence", "object", item.canonicalEvidence));
  const lifecycle = item.lifecycle;
  if (!lifecycle || lifecycle.selectorVisibility !== "hidden" || lifecycle.canonicalRouting !== "disabled" || lifecycle.productionUse !== "forbidden") errors.push(error("G4AU08_NUMERIC_LIFECYCLE_INVALID", "lifecycle", "hidden/disabled/forbidden", lifecycle));
  return { valid: errors.length === 0, errors, validatedLevels: ["L1", "L2", "L3", "L4", "L5"] };
}
