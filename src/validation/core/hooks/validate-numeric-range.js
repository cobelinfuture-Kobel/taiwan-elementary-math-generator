import { ERROR_CODES } from "../constants/error-codes.js";

function createHookResult(overrides = {}) {
  return {
    hookName: "validateNumericRange",
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

export function validateNumericRange(value, constraint = {}) {
  const normalizedValue = typeof value === "string" && value.trim() !== ""
    ? Number(value)
    : value;

  if (typeof normalizedValue !== "number" || Number.isNaN(normalizedValue) || !Number.isFinite(normalizedValue)) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_RANGE_OUT_OF_SCOPE],
      normalizedInput: { value }
    });
  }

  const {
    minValue,
    maxValue,
    allowZero = true,
    allowNegative = true,
    integerOnly = false
  } = constraint;

  const failed =
    (typeof minValue === "number" && normalizedValue < minValue)
    || (typeof maxValue === "number" && normalizedValue > maxValue)
    || (integerOnly && !Number.isInteger(normalizedValue))
    || (!allowZero && normalizedValue === 0)
    || (!allowNegative && normalizedValue < 0);

  return createHookResult({
    passed: !failed,
    errorCodes: failed ? [ERROR_CODES.E_RANGE_OUT_OF_SCOPE] : [],
    normalizedInput: {
      value: normalizedValue,
      constraint: {
        minValue: minValue ?? null,
        maxValue: maxValue ?? null,
        allowZero,
        allowNegative,
        integerOnly
      }
    }
  });
}
