const OPERATORS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = Object.freeze({ "+": 1, "-": 1, "×": 2, "÷": 2 });

function issue(code, path, expected, actual) {
  return { code, severity: "error", path, expected, actual };
}

function toRpn(tokens = []) {
  const output = [];
  const stack = [];
  for (const token of tokens) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") stack.push(token);
    else if (token === ")") {
      while (stack.length && stack.at(-1) !== "(") output.push(stack.pop());
      if (stack.at(-1) !== "(") return null;
      stack.pop();
    } else if (OPERATORS.has(token)) {
      while (stack.length && OPERATORS.has(stack.at(-1)) && PRECEDENCE[stack.at(-1)] >= PRECEDENCE[token]) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else {
      return null;
    }
  }
  while (stack.length) {
    const token = stack.pop();
    if (token === "(" || token === ")") return null;
    output.push(token);
  }
  return output;
}

function evaluateTokens(tokens) {
  const rpn = toRpn(tokens);
  if (!rpn) return NaN;
  const stack = [];
  for (const token of rpn) {
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

function evaluatePhase2B(question = {}) {
  const operands = question.operands;
  if (!Array.isArray(operands)) return NaN;
  switch (question.legacyTemplateId) {
    case "tpl_ext_comparison_chain":
      return operands.length >= 3 ? operands[0] + operands[1] - operands[2] : NaN;
    case "tpl_ext_equal_value_unit_price":
      return operands.length >= 3 && operands[2] !== 0 ? operands[0] * operands[1] / operands[2] : NaN;
    case "tpl_ext_relative_difference":
      return operands.length >= 3 ? (operands[1] - operands[0]) * operands[2] : NaN;
    case "tpl_ext_two_cost_component_payment":
      return operands.length >= 5 ? operands[0] - (operands[1] * operands[2] + operands[3] * operands[4]) : NaN;
    default:
      return NaN;
  }
}

export function recomputeG4AU08PublicQuestionAnswer(question = {}) {
  const tokens = Array.isArray(question.expressionTokens) && question.expressionTokens.length > 0
    ? question.expressionTokens
    : Array.isArray(question.equationTokens) && question.equationTokens.length > 0
      ? question.equationTokens
      : null;
  const tokenAnswer = tokens ? evaluateTokens(tokens) : NaN;
  if (Number.isFinite(tokenAnswer)) return tokenAnswer;
  return evaluatePhase2B(question);
}

export function validateG4AU08PublicQuestionArithmetic(question = {}) {
  const errors = [];
  const expected = recomputeG4AU08PublicQuestionAnswer(question);
  if (!Number.isInteger(expected)) {
    errors.push(issue("G4A_U08_PUBLIC_ARITHMETIC_EVIDENCE_MISSING", "question", "deterministic integer evidence", expected));
  } else {
    if (question.finalAnswer !== expected) {
      errors.push(issue("G4A_U08_PUBLIC_FINAL_ANSWER_INCORRECT", "finalAnswer", expected, question.finalAnswer));
    }
    const structuredValue = question.structuredAnswer?.value;
    if (structuredValue !== undefined && structuredValue !== expected) {
      errors.push(issue("G4A_U08_PUBLIC_STRUCTURED_ANSWER_INCORRECT", "structuredAnswer.value", expected, structuredValue));
    }
    const numericAnswerText = Number.parseInt(String(question.answerText ?? "").replaceAll(",", ""), 10);
    if (Number.isInteger(numericAnswerText) && numericAnswerText !== expected) {
      errors.push(issue("G4A_U08_PUBLIC_ANSWER_TEXT_INCORRECT", "answerText", expected, question.answerText));
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    expectedAnswer: expected,
    validatedLevels: Object.freeze(["arithmetic_evidence", "final_answer", "structured_answer", "answer_text"]),
  });
}
