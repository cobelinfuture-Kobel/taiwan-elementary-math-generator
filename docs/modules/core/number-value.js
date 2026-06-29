import { NUMBER_DOMAINS } from "./constants.js";

function createNumberValueError(code, message) {
  const error = new TypeError(message);
  error.code = code;
  return error;
}

export function createIntegerValue(value) {
  if (!Number.isSafeInteger(value)) {
    throw createNumberValueError(
      "number_value_not_safe_integer",
      `Expected a safe integer NumberValue input, received '${value}'.`
    );
  }

  return {
    kind: NUMBER_DOMAINS.INTEGER,
    raw: {
      value
    },
    canonicalText: String(value)
  };
}

export function isIntegerValue(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    value.kind === NUMBER_DOMAINS.INTEGER &&
    value.raw !== null &&
    typeof value.raw === "object" &&
    Number.isSafeInteger(value.raw.value) &&
    value.canonicalText === String(value.raw.value)
  );
}

export function assertIntegerValue(numberValue) {
  if (!isIntegerValue(numberValue)) {
    throw createNumberValueError(
      "number_value_invalid",
      "Expected an integer NumberValue."
    );
  }

  return numberValue;
}

export function getIntegerRawValue(numberValue) {
  return assertIntegerValue(numberValue).raw.value;
}

export function numberValueToCanonicalText(numberValue) {
  return assertIntegerValue(numberValue).canonicalText;
}
