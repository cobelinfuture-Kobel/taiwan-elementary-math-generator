import * as base from "./batch-a-browser-validator-g4a-extension.js";

const G4A_U08_PATTERN_SPEC_IDS = new Set([
  "ps_g4a_u08_parentheses_add_sub",
  "ps_g4a_u08_parentheses_mul_div",
  "ps_g4a_u08_mul_before_add_sub",
  "ps_g4a_u08_div_before_add_sub",
  "ps_g4a_u08_add_sub_left_to_right",
  "ps_g4a_u08_mul_div_left_to_right",
  "ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses",
  "ps_g4a_u08_mixed_with_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_with_parentheses"
]);
const G4A_U08_OVERLAY_SPEC_IDS = new Set([
  "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_with_parentheses"
]);
const OPERATORS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = Object.freeze({ "+": 1, "-": 1, "×": 2, "÷": 2 });

function issue(code, path, message = code, severity = "error") {
  return { code, severity, path, message };
}

function toRpn(tokens) {
  const output = [];
  const ops = [];
  for (const token of tokens) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") ops.push(token);
    else if (token === ")") {
      while (ops.length > 0 && ops[ops.length - 1] !== "(") output.push(ops.pop());
      if (ops.pop() !== "(") throw new Error("unmatched_parentheses");
    } else if (OPERATORS.has(token)) {
      while (ops.length > 0 && OPERATORS.has(ops[ops.length - 1]) && PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[token]) output.push(ops.pop());
      ops.push(token);
    } else throw new Error("invalid_token");
  }
  while (ops.length > 0) {
    const op = ops.pop();
    if (op === "(" || op === ")") throw new Error("unmatched_parentheses");
    output.push(op);
  }
  return output;
}

function evaluateExpressionTokens(tokens) {
  const stack = [];
  const operations = [];
  for (const token of toRpn(tokens)) {
    if (Number.isInteger(token)) {
      stack.push(token);
      continue;
    }
    const right = stack.pop();
    const left = stack.pop();
    if (!Number.isFinite(left) || !Number.isFinite(right)) throw new Error("operand_missing");
    let result;
    if (token === "+") result = left + right;
    else if (token === "-") result = left - right;
    else if (token === "×") result = left * right;
    else if (token === "÷") {
      if (right === 0 || left % right !== 0) throw new Error("division_not_exact");
      result = left / right;
    }
    operations.push({ op: token, left, right, result });
    stack.push(result);
  }
  if (stack.length !== 1) throw new Error("expression_invalid");
  return { finalAnswer: stack[0], operations, intermediateResults: operations.map((operation) => operation.result) };
}

function tokensToExpression(tokens) {
  return tokens.join(" ").replace("( ", "(").replace(" )", ")");
}

function validateG4AU08Expression(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  if (!G4A_U08_PATTERN_SPEC_IDS.has(patternSpecId)) return null;
  const errors = [];
  if (question.metadata?.sourceId !== "g4a_u08_4a08") errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));
  if (question.kind !== "g4aU08OrderOfOperationsExpression") errors.push(issue("batch_a_g4a_u08_kind_invalid", "kind"));
  if (!Array.isArray(question.expressionTokens) || question.expressionTokens.length < 3) {
    errors.push(issue("batch_a_g4a_u08_expression_tokens_invalid", "expressionTokens"));
    return { ok: false, errors, warnings: [] };
  }
  let evaluated;
  try {
    evaluated = evaluateExpressionTokens(question.expressionTokens);
  } catch (error) {
    errors.push(issue("batch_a_g4a_u08_expression_invalid", "expressionTokens", error.message));
    return { ok: false, errors, warnings: [] };
  }
  const expectedExpression = tokensToExpression(question.expressionTokens);
  if (question.expression !== expectedExpression) errors.push(issue("batch_a_g4a_u08_expression_text_invalid", "expression"));
  if (question.blankedDisplayText !== `${expectedExpression} = ______`) errors.push(issue("batch_a_g4a_u08_prompt_invalid", "blankedDisplayText"));
  for (const forbidden of ["括號", "乘除", "加減", "同級", "四則"]) if (String(question.blankedDisplayText ?? "").includes(forbidden)) errors.push(issue("batch_a_g4a_u08_prompt_label_leak", "blankedDisplayText"));
  if (question.finalAnswer !== evaluated.finalAnswer) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  if (question.answerText !== String(evaluated.finalAnswer)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (evaluated.finalAnswer < 0 || evaluated.finalAnswer > 9999) errors.push(issue("batch_a_g4a_u08_final_range_invalid", "finalAnswer"));
  for (const [index, value] of evaluated.intermediateResults.entries()) if (!Number.isInteger(value) || value < 0 || value > 9999) errors.push(issue("batch_a_g4a_u08_intermediate_range_invalid", `intermediateResults[${index}]`));
  for (const [index, operation] of evaluated.operations.entries()) {
    if (operation.op === "×" && operation.result > 500) errors.push(issue("batch_a_g4a_u08_multiplication_too_large", `operationOrderTrace[${index}]`));
    if (operation.op === "÷" && operation.result > 100) errors.push(issue("batch_a_g4a_u08_division_quotient_too_large", `operationOrderTrace[${index}]`));
  }
  if (question.largeAddSubOverlay !== G4A_U08_OVERLAY_SPEC_IDS.has(patternSpecId)) errors.push(issue("batch_a_g4a_u08_overlay_flag_invalid", "largeAddSubOverlay"));
  if (!Array.isArray(question.operationOrderTrace) || question.operationOrderTrace.length !== evaluated.operations.length) errors.push(issue("batch_a_g4a_u08_trace_invalid", "operationOrderTrace"));
  if (Array.isArray(question.operationOrderTrace)) for (let index = 0; index < Math.min(question.operationOrderTrace.length, evaluated.operations.length); index += 1) {
    const expected = evaluated.operations[index];
    const actual = question.operationOrderTrace[index];
    for (const key of ["op", "left", "right", "result"]) if (actual?.[key] !== expected[key]) errors.push(issue("batch_a_g4a_u08_trace_invalid", `operationOrderTrace[${index}].${key}`));
  }
  if (!Array.isArray(question.ruleTags) || question.ruleTags.length === 0) errors.push(issue("batch_a_g4a_u08_rule_tags_missing", "ruleTags"));
  if (question.hasParentheses !== question.expressionTokens.includes("(")) errors.push(issue("batch_a_g4a_u08_parentheses_flag_invalid", "hasParentheses"));
  if (question.hasMulDiv !== question.expressionTokens.some((token) => token === "×" || token === "÷")) errors.push(issue("batch_a_g4a_u08_mul_div_flag_invalid", "hasMulDiv"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserPlan(plan = {}) {
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}) {
  const g4aU08Expression = validateG4AU08Expression(question);
  if (g4aU08Expression) return g4aU08Expression;
  return base.validateBatchABrowserQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "s55e-g4a-u08-order-v1", validatedAt: null };
}
