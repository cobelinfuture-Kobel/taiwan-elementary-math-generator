import { ERROR_CODES } from "../../../core/constants/error-codes.js";
import {
  composeFromPlaceValueParts,
  computePlaceValueParts,
  normalizeInteger
} from "../utils/normalize-number.js";

const HOOK_NAME = "validatePlaceValueComposition";

function createHookResult(overrides = {}) {
  return {
    hookName: HOOK_NAME,
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

function fail(normalizedInput, computedAnswer = null, notes = "") {
  return createHookResult({
    passed: false,
    errorCodes: [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH],
    computedAnswer,
    normalizedInput,
    notes
  });
}

export function validatePlaceValueComposition(parts, candidate, constraint = {}) {
  const composed = composeFromPlaceValueParts(parts);
  const candidateTotal = normalizeInteger(candidate);
  const allowRegrouping = constraint.allowRegrouping === true;
  const normalizedInput = {
    parts,
    candidate,
    constraint: { allowRegrouping }
  };

  if (composed === null || candidateTotal === null) {
    return fail(normalizedInput, null, "Invalid place-value composition input.");
  }

  const { parts: normalizedParts, total } = composed;
  const hasInvalidUngroupedPart = Object.values(normalizedParts).some((value) => value < 0 || value > 9);

  const computedAnswer = {
    normalizedParts,
    canonicalDecomposition: computePlaceValueParts(total),
    total
  };

  if (!allowRegrouping && hasInvalidUngroupedPart) {
    return fail({ ...normalizedInput, normalizedParts, candidateTotal }, computedAnswer, "Regrouping was not allowed.");
  }

  const passed = candidateTotal === total;
  return createHookResult({
    passed,
    errorCodes: passed ? [] : [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH],
    computedAnswer,
    normalizedInput: { ...normalizedInput, normalizedParts, candidateTotal }
  });
}
