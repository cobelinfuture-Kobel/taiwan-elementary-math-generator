import { ERROR_CODES } from "../constants/error-codes.js";

function createHookResult(overrides = {}) {
  return {
    hookName: "validateDigitCount",
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

function parseDigitString(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (!Number.isInteger(value)) {
      return null;
    }
    return String(Math.abs(value));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^[+-]?\d+$/.test(trimmed)) {
      return trimmed.replace(/^[+-]/, "");
    }
  }

  return null;
}

export function validateDigitCount(value, constraint = {}) {
  const digitString = parseDigitString(value);
  if (!digitString) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_FOUR_DIGIT_CONSTRAINT],
      normalizedInput: { value }
    });
  }

  const hasLeadingZero = digitString.length > 1 && digitString.startsWith("0");
  if (constraint.allowLeadingZero === false && hasLeadingZero) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_INVALID_LEADING_ZERO],
      normalizedInput: { value, digitString }
    });
  }

  const { digitCount, minDigits, maxDigits } = constraint;
  const digitLength = digitString.length;

  const invalidConstraint =
    (digitCount !== undefined && (!Number.isInteger(digitCount) || digitCount < 1))
    || (minDigits !== undefined && (!Number.isInteger(minDigits) || minDigits < 1))
    || (maxDigits !== undefined && (!Number.isInteger(maxDigits) || maxDigits < 1))
    || (minDigits !== undefined && maxDigits !== undefined && minDigits > maxDigits);

  if (invalidConstraint) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_FOUR_DIGIT_CONSTRAINT],
      normalizedInput: { value, digitString, constraint }
    });
  }

  const failed =
    (Number.isInteger(digitCount) && digitLength !== digitCount)
    || (Number.isInteger(minDigits) && digitLength < minDigits)
    || (Number.isInteger(maxDigits) && digitLength > maxDigits);

  return createHookResult({
    passed: !failed,
    errorCodes: failed ? [ERROR_CODES.E_FOUR_DIGIT_CONSTRAINT] : [],
    normalizedInput: {
      value,
      digitString,
      digitLength
    }
  });
}
