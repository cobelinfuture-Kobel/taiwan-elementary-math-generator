export const G4A_U08_GENERATOR_VALIDATOR_DOMAIN_FULLFIX_VERSION = "glm-s07-g4a-u08-generator-validator-domain-v1";

const SOURCE_ID = "g4a_u08_4a08";
const NUMERIC_KIND = "g4aU08OrderOfOperationsExpression";
const REPAIRABLE_SHAPE = "mul_div_ltr_multiply_then_divide";
const MAX_MULTIPLICATION_RESULT = 500;
const MAX_DIVISION_QUOTIENT = 100;
const MAX_INTERMEDIATE_RESULT = 9999;
const OPERATORS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = Object.freeze({ "+": 1, "-": 1, "×": 2, "÷": 2 });

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

function toRpn(tokens) {
  const output = [];
  const stack = [];
  for (const token of tokens ?? []) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") stack.push(token);
    else if (token === ")") {
      while (stack.length > 0 && stack.at(-1) !== "(") output.push(stack.pop());
      if (stack.pop() !== "(") throw new Error("unmatched_parentheses");
    } else if (OPERATORS.has(token)) {
      while (
        stack.length > 0
        && OPERATORS.has(stack.at(-1))
        && PRECEDENCE[stack.at(-1)] >= PRECEDENCE[token]
      ) output.push(stack.pop());
      stack.push(token);
    } else throw new Error("invalid_token");
  }
  while (stack.length > 0) {
    const operator = stack.pop();
    if (operator === "(" || operator === ")") throw new Error("unmatched_parentheses");
    output.push(operator);
  }
  return output;
}

function evaluate(tokens) {
  const stack = [];
  const operations = [];
  for (const token of toRpn(tokens)) {
    if (Number.isInteger(token)) {
      stack.push(token);
      continue;
    }
    const right = stack.pop();
    const left = stack.pop();
    if (!Number.isInteger(left) || !Number.isInteger(right)) throw new Error("operand_invalid");
    let result;
    if (token === "+") result = left + right;
    else if (token === "-") result = left - right;
    else if (token === "×") result = left * right;
    else {
      if (right === 0 || left % right !== 0) throw new Error("division_not_exact");
      result = left / right;
    }
    operations.push({ op: token, left, right, result });
    stack.push(result);
  }
  if (stack.length !== 1) throw new Error("expression_invalid");
  return {
    finalAnswer: stack[0],
    operations,
    intermediateResults: operations.map((operation) => operation.result),
  };
}

function tokensToExpression(tokens) {
  return tokens.join(" ").replaceAll("( ", "(").replaceAll(" )", ")");
}

function isTargetQuestion(question) {
  return question?.sourceId === SOURCE_ID && question?.kind === NUMERIC_KIND;
}

function normalizeRepairableShape(question) {
  if (question?.shapeVariant !== REPAIRABLE_SHAPE) return { question, repaired: false };
  const tokens = question.expressionTokens;
  if (
    !Array.isArray(tokens)
    || tokens.length !== 5
    || tokens[1] !== "×"
    || tokens[3] !== "÷"
    || !tokens.every((token, index) => index % 2 === 1 ? typeof token === "string" : Number.isInteger(token))
  ) return { question, repaired: false };

  const [left, , multiplier, , divisor] = tokens;
  if (divisor === 0 || left % divisor !== 0) return { question, repaired: false };
  const multiplicationResult = left * multiplier;
  if (multiplicationResult <= MAX_MULTIPLICATION_RESULT) return { question, repaired: false };

  const safeMultiplier = Math.floor(MAX_MULTIPLICATION_RESULT / left);
  if (!Number.isInteger(safeMultiplier) || safeMultiplier < 2 || safeMultiplier >= multiplier) {
    return { question, repaired: false };
  }
  const normalizedTokens = [left, "×", safeMultiplier, "÷", divisor];
  const evaluated = evaluate(normalizedTokens);
  const expression = tokensToExpression(normalizedTokens);
  const normalized = {
    ...clone(question),
    expression: expression,
    expressionTokens: normalizedTokens,
    finalAnswer: evaluated.finalAnswer,
    answerText: String(evaluated.finalAnswer),
    displayText: `${expression} = ${evaluated.finalAnswer}`,
    blankedDisplayText: `${expression} = ______`,
    promptText: `${expression} = ______`,
    operationOrderTrace: evaluated.operations.map((operation, index) => ({ step: index + 1, ...operation })),
    intermediateResults: evaluated.intermediateResults,
    metadata: {
      ...(clone(question.metadata) ?? {}),
      generatorValidatorDomainFullFixVersion: G4A_U08_GENERATOR_VALIDATOR_DOMAIN_FULLFIX_VERSION,
      generatorValidatorDomainRepair: {
        shapeVariant: REPAIRABLE_SHAPE,
        originalMultiplier: multiplier,
        normalizedMultiplier: safeMultiplier,
        originalMultiplicationResult: multiplicationResult,
        normalizedMultiplicationResult: left * safeMultiplier,
      },
    },
  };
  return { question: normalized, repaired: true };
}

function validateQuestionDomain(question, questionIndex) {
  const errors = [];
  let evaluated;
  try {
    evaluated = evaluate(question.expressionTokens);
  } catch (error) {
    return [issue(
      "G4A_U08_GENERATOR_VALIDATOR_DOMAIN_EXPRESSION_INVALID",
      `questions[${questionIndex}].expressionTokens`,
      "Generator emitted an expression outside the exact-integer evaluation domain.",
      { cause: error.message, patternSpecId: question.patternSpecId, shapeVariant: question.shapeVariant },
    )];
  }
  if (
    !Number.isInteger(evaluated.finalAnswer)
    || evaluated.finalAnswer < 0
    || evaluated.finalAnswer > MAX_INTERMEDIATE_RESULT
  ) {
    errors.push(issue(
      "G4A_U08_GENERATOR_VALIDATOR_DOMAIN_FINAL_RANGE_INVALID",
      `questions[${questionIndex}].finalAnswer`,
      "Generator output final answer must stay inside the blocking validator range.",
      { actual: evaluated.finalAnswer, patternSpecId: question.patternSpecId, shapeVariant: question.shapeVariant },
    ));
  }
  for (const [operationIndex, operation] of evaluated.operations.entries()) {
    if (!Number.isInteger(operation.result) || operation.result < 0 || operation.result > MAX_INTERMEDIATE_RESULT) {
      errors.push(issue(
        "G4A_U08_GENERATOR_VALIDATOR_DOMAIN_INTERMEDIATE_RANGE_INVALID",
        `questions[${questionIndex}].operationOrderTrace[${operationIndex}]`,
        "Generator output intermediate result must stay inside the blocking validator range.",
        { operation, patternSpecId: question.patternSpecId, shapeVariant: question.shapeVariant },
      ));
    }
    if (operation.op === "×" && operation.result > MAX_MULTIPLICATION_RESULT) {
      errors.push(issue(
        "G4A_U08_GENERATOR_VALIDATOR_DOMAIN_MULTIPLICATION_TOO_LARGE",
        `questions[${questionIndex}].operationOrderTrace[${operationIndex}]`,
        "Generator multiplication result exceeds the blocking validator maximum.",
        { maximum: MAX_MULTIPLICATION_RESULT, operation, patternSpecId: question.patternSpecId, shapeVariant: question.shapeVariant },
      ));
    }
    if (operation.op === "÷" && operation.result > MAX_DIVISION_QUOTIENT) {
      errors.push(issue(
        "G4A_U08_GENERATOR_VALIDATOR_DOMAIN_DIVISION_QUOTIENT_TOO_LARGE",
        `questions[${questionIndex}].operationOrderTrace[${operationIndex}]`,
        "Generator division quotient exceeds the blocking validator maximum.",
        { maximum: MAX_DIVISION_QUOTIENT, operation, patternSpecId: question.patternSpecId, shapeVariant: question.shapeVariant },
      ));
    }
  }
  if (question.finalAnswer !== evaluated.finalAnswer || question.answerText !== String(evaluated.finalAnswer)) {
    errors.push(issue(
      "G4A_U08_GENERATOR_VALIDATOR_DOMAIN_ANSWER_MISMATCH",
      `questions[${questionIndex}].finalAnswer`,
      "Generator answer fields must match the normalized expression.",
      { expected: evaluated.finalAnswer, finalAnswer: question.finalAnswer, answerText: question.answerText },
    ));
  }
  return errors;
}

export function applyG4AU08GeneratorValidatorDomainFullFix(result, options = {}) {
  if (options?.sourceId !== SOURCE_ID || result?.ok !== true || !Array.isArray(result.questions)) return result;
  const normalizedQuestions = [];
  const errors = [];
  let repairedQuestionCount = 0;
  for (const [index, originalQuestion] of result.questions.entries()) {
    if (!isTargetQuestion(originalQuestion)) {
      normalizedQuestions.push(originalQuestion);
      continue;
    }
    const normalized = normalizeRepairableShape(originalQuestion);
    if (normalized.repaired) repairedQuestionCount += 1;
    normalizedQuestions.push(normalized.question);
    errors.push(...validateQuestionDomain(normalized.question, index));
  }
  if (errors.length > 0) {
    return {
      ...result,
      ok: false,
      questions: [],
      errors: [...(result.errors ?? []), ...errors],
      fullFix: {
        ...(result.fullFix ?? {}),
        version: G4A_U08_GENERATOR_VALIDATOR_DOMAIN_FULLFIX_VERSION,
        admitted: false,
        repairedQuestionCount,
        rejectedQuestionCount: new Set(errors.map((entry) => entry.path.split(".")[0])).size,
      },
    };
  }
  return {
    ...result,
    questions: normalizedQuestions,
    fullFix: {
      ...(result.fullFix ?? {}),
      version: G4A_U08_GENERATOR_VALIDATOR_DOMAIN_FULLFIX_VERSION,
      admitted: true,
      repairedQuestionCount,
      rejectedQuestionCount: 0,
    },
  };
}

export function validateG4AU08GeneratorValidatorDomainQuestion(question) {
  if (!isTargetQuestion(question)) return { ok: true, errors: [] };
  const errors = validateQuestionDomain(question, 0).map((entry) => ({
    ...entry,
    path: entry.path.replace(/^questions\[0\]\./, ""),
  }));
  return { ok: errors.length === 0, errors };
}
