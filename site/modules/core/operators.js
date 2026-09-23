import { OPERATORS } from "./constants.js";
import {
  assertIntegerValue,
  createIntegerValue,
  getIntegerRawValue
} from "./number-value.js";

const NORMALIZED_OPERATOR_MAP = Object.freeze({
  "+": OPERATORS.ADD,
  "-": OPERATORS.SUBTRACT,
  "×": OPERATORS.MULTIPLY,
  "*": OPERATORS.MULTIPLY,
  "÷": OPERATORS.DIVIDE,
  "/": OPERATORS.DIVIDE
});

const DISPLAY_OPERATOR_MAP = Object.freeze({
  [OPERATORS.ADD]: "+",
  [OPERATORS.SUBTRACT]: "-",
  [OPERATORS.MULTIPLY]: "×",
  [OPERATORS.DIVIDE]: "÷"
});

function createOperatorError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function normalizeOperatorToken(token) {
  if (typeof token !== "string") {
    return null;
  }

  return NORMALIZED_OPERATOR_MAP[token] ?? null;
}

export function isSupportedOperator(token) {
  return normalizeOperatorToken(token) !== null;
}

export function canApplyExactIntegerDivision(left, right) {
  const leftValue = typeof left === "number" ? left : getIntegerRawValue(left);
  const rightValue = typeof right === "number" ? right : getIntegerRawValue(right);

  return rightValue !== 0 && Number.isSafeInteger(leftValue) && leftValue % rightValue === 0;
}

export function getOperatorDisplayToken(operator) {
  const normalized = normalizeOperatorToken(operator);
  if (!normalized) {
    throw createOperatorError("operator_invalid", `Unsupported operator '${operator}'.`);
  }

  return DISPLAY_OPERATOR_MAP[normalized];
}

export function applyIntegerOperator(left, operator, right) {
  const normalized = normalizeOperatorToken(operator);
  if (!normalized) {
    throw createOperatorError("operator_invalid", `Unsupported operator '${operator}'.`);
  }

  assertIntegerValue(left);
  assertIntegerValue(right);

  const leftValue = getIntegerRawValue(left);
  const rightValue = getIntegerRawValue(right);

  if (normalized === OPERATORS.ADD) {
    return createIntegerValue(leftValue + rightValue);
  }

  if (normalized === OPERATORS.SUBTRACT) {
    return createIntegerValue(leftValue - rightValue);
  }

  if (normalized === OPERATORS.MULTIPLY) {
    return createIntegerValue(leftValue * rightValue);
  }

  if (rightValue === 0) {
    throw createOperatorError("division_by_zero", "Division by zero is not allowed.");
  }

  if (!canApplyExactIntegerDivision(leftValue, rightValue)) {
    throw createOperatorError("division_not_exact_integer", "Division must produce an exact integer quotient.");
  }

  return createIntegerValue(leftValue / rightValue);
}
