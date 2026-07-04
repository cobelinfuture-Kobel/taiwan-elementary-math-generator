import { OPERATORS } from "../../core/constants.js";
import { collectOperandValues, collectOperators } from "../../core/expression-model.js";
import { getIntegerRawValue, isIntegerValue } from "../../core/number-value.js";

export const BATCH_A_CARRY_POLICY_ISSUE_CODES = Object.freeze({
  MISSING: "batch_a_carry_policy_missing",
  OPERATOR_UNSUPPORTED: "batch_a_carry_policy_operator_unsupported",
  OPERAND_COUNT_INVALID: "batch_a_carry_policy_operand_count_invalid",
  ADDITION_CARRY_REQUIRED_NOT_SATISFIED: "batch_a_addition_carry_required_not_satisfied",
  ADDITION_CARRY_OVERFLOW_NOT_ALLOWED: "batch_a_addition_carry_overflow_not_allowed"
});

const COLUMN_INDEX_BY_NAME = Object.freeze({
  ones: 0,
  tens: 1,
  hundreds: 2,
  thousands: 3
});

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function rawInteger(value) {
  if (Number.isSafeInteger(value)) return value;
  if (isIntegerValue(value)) return getIntegerRawValue(value);
  return null;
}

function normalizeBase(base) {
  return Number.isInteger(base) && base > 1 ? base : 10;
}

function normalizeCheckedColumnIndexes(options = {}) {
  const checkedColumns = Array.isArray(options.checkedColumns) && options.checkedColumns.length > 0
    ? options.checkedColumns
    : ["ones", "tens", "hundreds"];

  return checkedColumns
    .map((column) => COLUMN_INDEX_BY_NAME[column])
    .filter((columnIndex) => Number.isInteger(columnIndex) && columnIndex >= 0);
}

function digitAt(value, columnIndex, base) {
  return Math.floor(value / (base ** columnIndex)) % base;
}

export function hasAdditionCarry(leftOperand, rightOperand, base = 10, options = {}) {
  const left = rawInteger(leftOperand);
  const right = rawInteger(rightOperand);
  const normalizedBase = normalizeBase(base);
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left < 0 || right < 0) {
    return false;
  }

  const checkedColumnIndexes = normalizeCheckedColumnIndexes(options);
  if (checkedColumnIndexes.length === 0) {
    return false;
  }

  const checkedColumnSet = new Set(checkedColumnIndexes);
  const maxColumnIndex = Math.max(...checkedColumnIndexes);
  let incomingCarry = 0;

  for (let columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex += 1) {
    const columnSum = digitAt(left, columnIndex, normalizedBase) + digitAt(right, columnIndex, normalizedBase) + incomingCarry;
    const producesCarry = columnSum >= normalizedBase;
    if (checkedColumnSet.has(columnIndex) && producesCarry) {
      return true;
    }
    incomingCarry = producesCarry ? 1 : 0;
  }

  return false;
}

export function hasAdditionCarryIntoTenThousands(leftOperand, rightOperand, base = 10) {
  const left = rawInteger(leftOperand);
  const right = rawInteger(rightOperand);
  const normalizedBase = normalizeBase(base);
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left < 0 || right < 0) {
    return false;
  }

  let incomingCarry = 0;
  for (let columnIndex = 0; columnIndex <= COLUMN_INDEX_BY_NAME.thousands; columnIndex += 1) {
    const columnSum = digitAt(left, columnIndex, normalizedBase) + digitAt(right, columnIndex, normalizedBase) + incomingCarry;
    const producesCarry = columnSum >= normalizedBase;
    if (columnIndex === COLUMN_INDEX_BY_NAME.thousands) {
      return producesCarry;
    }
    incomingCarry = producesCarry ? 1 : 0;
  }

  return false;
}

export function extractBatchAExpressionOperandValues(expression) {
  return collectOperandValues(expression)
    .map((operand) => rawInteger(operand))
    .filter((operand) => Number.isSafeInteger(operand));
}

export function validateBatchAQuestionCarryPolicy(definition, question = {}) {
  const errors = [];
  const carryPolicy = definition?.carryPolicy;
  if (!carryPolicy) {
    return { ok: true, errors, warnings: [] };
  }

  if (carryPolicy.kind !== "addition_carry") {
    errors.push(issue(
      BATCH_A_CARRY_POLICY_ISSUE_CODES.OPERATOR_UNSUPPORTED,
      "carryPolicy.kind",
      `Carry policy kind '${carryPolicy.kind}' is not supported by the Batch A browser bridge.`
    ));
    return { ok: false, errors, warnings: [] };
  }

  const operators = Array.isArray(question.operatorsUsed) && question.operatorsUsed.length > 0
    ? question.operatorsUsed
    : collectOperators(question.expression);
  if (operators.length !== 1 || operators[0] !== OPERATORS.ADD) {
    errors.push(issue(
      BATCH_A_CARRY_POLICY_ISSUE_CODES.OPERATOR_UNSUPPORTED,
      "operatorsUsed",
      "Addition carry policy requires exactly one ADD operator."
    ));
    return { ok: false, errors, warnings: [] };
  }

  const operands = extractBatchAExpressionOperandValues(question.expression);
  const expectedOperandCount = Array.isArray(carryPolicy.operandPositions)
    ? carryPolicy.operandPositions.length
    : 2;
  if (expectedOperandCount !== 2 || operands.length !== 2) {
    errors.push(issue(
      BATCH_A_CARRY_POLICY_ISSUE_CODES.OPERAND_COUNT_INVALID,
      "expression",
      "Addition carry policy requires exactly two integer operands."
    ));
    return { ok: false, errors, warnings: [] };
  }

  const base = normalizeBase(carryPolicy.base);
  if (carryPolicy.allowCarryIntoTenThousands === false && hasAdditionCarryIntoTenThousands(operands[0], operands[1], base)) {
    errors.push(issue(
      BATCH_A_CARRY_POLICY_ISSUE_CODES.ADDITION_CARRY_OVERFLOW_NOT_ALLOWED,
      "carryPolicy.allowCarryIntoTenThousands",
      "Addition carry into ten-thousands is not allowed for this PatternSpec."
    ));
  }

  if (!hasAdditionCarry(operands[0], operands[1], base, carryPolicy)) {
    errors.push(issue(
      BATCH_A_CARRY_POLICY_ISSUE_CODES.ADDITION_CARRY_REQUIRED_NOT_SATISFIED,
      "carryPolicy.mode",
      "This PatternSpec requires at least one addition carry in the checked columns."
    ));
  }

  return { ok: errors.length === 0, errors, warnings: [] };
}
