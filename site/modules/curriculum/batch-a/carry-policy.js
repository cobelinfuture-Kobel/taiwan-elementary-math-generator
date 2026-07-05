import { OPERATORS } from "../../core/constants.js";
import { collectOperandValues, collectOperators } from "../../core/expression-model.js";
import { getIntegerRawValue, isIntegerValue } from "../../core/number-value.js";

export const BATCH_A_CARRY_POLICY_ISSUE_CODES = Object.freeze({
  MISSING: "batch_a_carry_policy_missing",
  OPERATOR_UNSUPPORTED: "batch_a_carry_policy_operator_unsupported",
  OPERAND_COUNT_INVALID: "batch_a_carry_policy_operand_count_invalid",
  ADDITION_CARRY_REQUIRED_NOT_SATISFIED: "batch_a_addition_carry_required_not_satisfied",
  ADDITION_CARRY_OVERFLOW_NOT_ALLOWED: "batch_a_addition_carry_overflow_not_allowed",
  SUBTRACTION_REGROUP_REQUIRED_NOT_SATISFIED: "batch_a_subtraction_regroup_required_not_satisfied"
});

const COLUMN_INDEX_BY_NAME = Object.freeze({ ones: 0, tens: 1, hundreds: 2, thousands: 3 });

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
  const checkedColumns = Array.isArray(options.checkedColumns) && options.checkedColumns.length > 0 ? options.checkedColumns : ["ones", "tens", "hundreds"];
  return checkedColumns.map((column) => COLUMN_INDEX_BY_NAME[column]).filter((columnIndex) => Number.isInteger(columnIndex) && columnIndex >= 0);
}

function digitAt(value, columnIndex, base) {
  return Math.floor(value / (base ** columnIndex)) % base;
}

function operatorsFor(question) {
  return Array.isArray(question.operatorsUsed) && question.operatorsUsed.length > 0 ? question.operatorsUsed : collectOperators(question.expression);
}

function twoOperands(policy, question) {
  const operands = extractBatchAExpressionOperandValues(question.expression);
  const expectedOperandCount = Array.isArray(policy.operandPositions) ? policy.operandPositions.length : 2;
  if (expectedOperandCount !== 2 || operands.length !== 2) {
    return { ok: false, operands, errors: [issue(BATCH_A_CARRY_POLICY_ISSUE_CODES.OPERAND_COUNT_INVALID, "expression", "Policy requires two integer operands.")] };
  }
  return { ok: true, operands, errors: [] };
}

export function hasAdditionCarry(leftOperand, rightOperand, base = 10, options = {}) {
  const left = rawInteger(leftOperand);
  const right = rawInteger(rightOperand);
  const normalizedBase = normalizeBase(base);
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left < 0 || right < 0) return false;
  const checkedColumnIndexes = normalizeCheckedColumnIndexes(options);
  if (checkedColumnIndexes.length === 0) return false;
  const checkedColumnSet = new Set(checkedColumnIndexes);
  const maxColumnIndex = Math.max(...checkedColumnIndexes);
  let incomingCarry = 0;
  for (let columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex += 1) {
    const columnSum = digitAt(left, columnIndex, normalizedBase) + digitAt(right, columnIndex, normalizedBase) + incomingCarry;
    const producesCarry = columnSum >= normalizedBase;
    if (checkedColumnSet.has(columnIndex) && producesCarry) return true;
    incomingCarry = producesCarry ? 1 : 0;
  }
  return false;
}

export function hasAdditionCarryIntoTenThousands(leftOperand, rightOperand, base = 10) {
  const left = rawInteger(leftOperand);
  const right = rawInteger(rightOperand);
  const normalizedBase = normalizeBase(base);
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left < 0 || right < 0) return false;
  let incomingCarry = 0;
  for (let columnIndex = 0; columnIndex <= COLUMN_INDEX_BY_NAME.thousands; columnIndex += 1) {
    const columnSum = digitAt(left, columnIndex, normalizedBase) + digitAt(right, columnIndex, normalizedBase) + incomingCarry;
    const producesCarry = columnSum >= normalizedBase;
    if (columnIndex === COLUMN_INDEX_BY_NAME.thousands) return producesCarry;
    incomingCarry = producesCarry ? 1 : 0;
  }
  return false;
}

export function countSubtractionRegroups(leftOperand, rightOperand, base = 10, options = {}) {
  const left = rawInteger(leftOperand);
  const right = rawInteger(rightOperand);
  const normalizedBase = normalizeBase(base);
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left < 0 || right < 0) return 0;
  const checkedColumnIndexes = normalizeCheckedColumnIndexes(options);
  if (checkedColumnIndexes.length === 0) return 0;
  const checkedColumnSet = new Set(checkedColumnIndexes);
  const maxColumnIndex = Math.max(...checkedColumnIndexes);
  let incomingRegroup = 0;
  let regroupCount = 0;
  for (let columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex += 1) {
    const leftDigit = digitAt(left, columnIndex, normalizedBase);
    const rightDigit = digitAt(right, columnIndex, normalizedBase) + incomingRegroup;
    const producesRegroup = leftDigit < rightDigit;
    if (checkedColumnSet.has(columnIndex) && producesRegroup) regroupCount += 1;
    incomingRegroup = producesRegroup ? 1 : 0;
  }
  return regroupCount;
}

export function hasSubtractionRegroup(leftOperand, rightOperand, base = 10, options = {}) {
  return countSubtractionRegroups(leftOperand, rightOperand, base, options) > 0;
}

export function extractBatchAExpressionOperandValues(expression) {
  return collectOperandValues(expression).map((operand) => rawInteger(operand)).filter((operand) => Number.isSafeInteger(operand));
}

function validateAdditionCarryPolicy(carryPolicy, question) {
  const errors = [];
  const operators = operatorsFor(question);
  if (operators.length !== 1 || operators[0] !== OPERATORS.ADD) {
    return { ok: false, errors: [issue(BATCH_A_CARRY_POLICY_ISSUE_CODES.OPERATOR_UNSUPPORTED, "operatorsUsed", "ADD required.")], warnings: [] };
  }
  const operandResult = twoOperands(carryPolicy, question);
  if (!operandResult.ok) return { ok: false, errors: operandResult.errors, warnings: [] };
  const operands = operandResult.operands;
  const base = normalizeBase(carryPolicy.base);
  if (carryPolicy.allowCarryIntoTenThousands === false && hasAdditionCarryIntoTenThousands(operands[0], operands[1], base)) {
    errors.push(issue(BATCH_A_CARRY_POLICY_ISSUE_CODES.ADDITION_CARRY_OVERFLOW_NOT_ALLOWED, "carryPolicy.allowCarryIntoTenThousands", "Overflow carry not allowed."));
  }
  if (!hasAdditionCarry(operands[0], operands[1], base, carryPolicy)) {
    errors.push(issue(BATCH_A_CARRY_POLICY_ISSUE_CODES.ADDITION_CARRY_REQUIRED_NOT_SATISFIED, "carryPolicy.mode", "Carry required."));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

function validateSubtractionRegroupPolicy(carryPolicy, question) {
  const operators = operatorsFor(question);
  if (operators.length !== 1 || operators[0] !== OPERATORS.SUBTRACT) {
    return { ok: false, errors: [issue(BATCH_A_CARRY_POLICY_ISSUE_CODES.OPERATOR_UNSUPPORTED, "operatorsUsed", "SUBTRACT required.")], warnings: [] };
  }
  const operandResult = twoOperands(carryPolicy, question);
  if (!operandResult.ok) return { ok: false, errors: operandResult.errors, warnings: [] };
  const operands = operandResult.operands;
  const base = normalizeBase(carryPolicy.base);
  const minRegroupCount = Number.isInteger(carryPolicy.minRegroupCount) && carryPolicy.minRegroupCount > 0 ? carryPolicy.minRegroupCount : 1;
  const regroupCount = countSubtractionRegroups(operands[0], operands[1], base, carryPolicy);
  const errors = regroupCount >= minRegroupCount ? [] : [issue(BATCH_A_CARRY_POLICY_ISSUE_CODES.SUBTRACTION_REGROUP_REQUIRED_NOT_SATISFIED, "carryPolicy.mode", "Regroup count below requirement.")];
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchAQuestionCarryPolicy(definition, question = {}) {
  const carryPolicy = definition?.carryPolicy;
  if (!carryPolicy) return { ok: true, errors: [], warnings: [] };
  if (carryPolicy.kind === "addition_carry") return validateAdditionCarryPolicy(carryPolicy, question);
  if (carryPolicy.kind === "subtraction_regroup") return validateSubtractionRegroupPolicy(carryPolicy, question);
  return { ok: false, errors: [issue(BATCH_A_CARRY_POLICY_ISSUE_CODES.OPERATOR_UNSUPPORTED, "carryPolicy.kind", "Policy kind unsupported.")], warnings: [] };
}
