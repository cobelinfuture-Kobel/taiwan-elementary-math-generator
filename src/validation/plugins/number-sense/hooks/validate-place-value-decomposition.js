import { ERROR_CODES } from "../../../core/constants/error-codes.js";
import {
  computePlaceValueParts,
  getPlaceValue,
  normalizeInteger,
  normalizePlaceName,
  normalizePlaceValueParts
} from "../utils/normalize-number.js";

const HOOK_NAME = "validatePlaceValueDecomposition";

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

function fail(normalizedInput, notes = "") {
  return createHookResult({
    passed: false,
    errorCodes: [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH],
    normalizedInput,
    notes
  });
}

function extractCandidateValue(candidate) {
  if (candidate && typeof candidate === "object") {
    return candidate.value ?? candidate.candidate ?? candidate.candidateValue ?? candidate.answer;
  }
  return candidate;
}

function validateDigitValue(request, candidate) {
  const digit = normalizeInteger(request.digit);
  const place = normalizePlaceName(request.place);
  const placeValue = getPlaceValue(request.place);
  const candidateValue = normalizeInteger(extractCandidateValue(candidate));

  const normalizedInput = {
    mode: "digit_value",
    digit: request.digit,
    place: request.place,
    candidateValue: extractCandidateValue(candidate)
  };

  if (digit === null || digit < 0 || digit > 9 || place === null || placeValue === null || candidateValue === null) {
    return fail(normalizedInput, "Invalid digit-value input.");
  }

  const value = digit * placeValue;
  return createHookResult({
    passed: candidateValue === value,
    errorCodes: candidateValue === value ? [] : [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH],
    computedAnswer: {
      digit,
      place,
      placeValue,
      value
    },
    normalizedInput: {
      ...normalizedInput,
      digit,
      place,
      candidateValue
    }
  });
}

export function validatePlaceValueDecomposition(n, parts, constraint = {}) {
  if (n && typeof n === "object" && n.mode === "digit_value") {
    return validateDigitValue(n, parts);
  }

  if (parts && typeof parts === "object" && parts.mode === "digit_value") {
    return validateDigitValue(parts, constraint?.candidateValue ?? constraint?.candidate ?? constraint?.value);
  }

  const value = normalizeInteger(n);
  const expected = computePlaceValueParts(value);
  const normalizedParts = normalizePlaceValueParts(parts);
  const normalizedInput = {
    value: n,
    parts,
    constraint: {
      allowOmittedZeroParts: constraint.allowOmittedZeroParts ?? false
    }
  };

  if (value === null || expected === null || normalizedParts === null) {
    return fail(normalizedInput, "Invalid place-value decomposition input.");
  }

  const allowOmittedZeroParts = constraint.allowOmittedZeroParts === true;
  const { parts: providedParts, provided } = normalizedParts;

  for (const place of ["thousands", "hundreds", "tens", "ones"]) {
    if (!provided[place]) {
      if (allowOmittedZeroParts && expected[place] === 0) {
        continue;
      }
      return fail({ ...normalizedInput, value, normalizedParts: providedParts }, `Missing ${place} part.`);
    }

    if (providedParts[place] !== expected[place]) {
      return createHookResult({
        passed: false,
        errorCodes: [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH],
        computedAnswer: expected,
        normalizedInput: { ...normalizedInput, value, normalizedParts: providedParts }
      });
    }
  }

  if (!provided.total || providedParts.total !== expected.total) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH],
      computedAnswer: expected,
      normalizedInput: { ...normalizedInput, value, normalizedParts: providedParts }
    });
  }

  return createHookResult({
    computedAnswer: expected,
    normalizedInput: { ...normalizedInput, value, normalizedParts: providedParts }
  });
}
