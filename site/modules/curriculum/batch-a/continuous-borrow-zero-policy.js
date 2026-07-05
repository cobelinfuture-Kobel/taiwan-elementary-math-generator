import { countSubtractionRegroups, extractBatchAExpressionOperandValues } from "./carry-policy.js";

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function digitAt(value, columnIndex) {
  return Math.floor(value / (10 ** columnIndex)) % 10;
}

export function hasContinuousBorrowThroughZero(left, right) {
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left < 1000 || right < 100 || left < right) {
    return false;
  }
  const hasZeroInMiddle = digitAt(left, 1) === 0 || digitAt(left, 2) === 0;
  const regroupCount = countSubtractionRegroups(left, right, 10, {
    checkedColumns: ["ones", "tens", "hundreds"]
  });
  return hasZeroInMiddle && regroupCount >= 3;
}

export function validateContinuousBorrowZeroPolicy(definition, question) {
  if (definition?.continuousBorrowZeroPolicy?.required !== true) {
    return { ok: true, errors: [], warnings: [] };
  }
  const operands = extractBatchAExpressionOperandValues(question.expression);
  if (operands.length !== 2) {
    return { ok: false, errors: [issue("batch_a_continuous_borrow_zero_operands_invalid", "expression", "continuous borrow zero requires two operands")] , warnings: [] };
  }
  const ok = hasContinuousBorrowThroughZero(operands[0], operands[1]);
  return {
    ok,
    errors: ok ? [] : [issue("batch_a_continuous_borrow_zero_not_satisfied", "continuousBorrowZeroPolicy", "continuous borrow through zero is required")],
    warnings: []
  };
}
