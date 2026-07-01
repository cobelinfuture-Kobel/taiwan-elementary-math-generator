import { ERROR_CODES } from "../../../core/constants/error-codes.js";
import {
  buildNumberFromDigits,
  hasLeadingZero,
  normalizeDigitArray,
  normalizeInteger
} from "../utils/normalize-number.js";

const HOOK_NAME = "validateDigitArrangementMaxMin";

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

function normalizeCandidates(candidates = {}) {
  return {
    max: candidates.max ?? candidates.maximum ?? candidates.candidateMax,
    min: candidates.min ?? candidates.minimum ?? candidates.candidateMin
  };
}

function computeMinimumDigits(digits, fourDigitRequired) {
  const ascending = [...digits].sort((a, b) => a - b);
  if (!fourDigitRequired || ascending[0] !== 0) {
    return ascending;
  }

  const firstNonZeroIndex = ascending.findIndex((digit) => digit !== 0);
  if (firstNonZeroIndex === -1) {
    return null;
  }

  const [firstNonZero] = ascending.splice(firstNonZeroIndex, 1);
  return [firstNonZero, ...ascending];
}

export function validateDigitArrangementMaxMin(digits, candidates = {}, constraint = {}) {
  const normalizedDigits = normalizeDigitArray(digits);
  const fourDigitRequired = constraint.fourDigitRequired ?? true;
  const allowRepeatedDigits = constraint.allowRepeatedDigits === true;
  const candidateValues = normalizeCandidates(candidates);
  const candidateMax = normalizeInteger(candidateValues.max);
  const candidateMin = normalizeInteger(candidateValues.min);
  const normalizedInput = {
    digits,
    candidates,
    constraint: {
      fourDigitRequired,
      allowRepeatedDigits
    }
  };

  if (normalizedDigits === null || candidateMax === null || candidateMin === null) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_DIGIT_ARRANGEMENT_MAX, ERROR_CODES.E_DIGIT_ARRANGEMENT_MIN],
      normalizedInput,
      notes: "Invalid digit arrangement input."
    });
  }

  const duplicateRejected = !allowRepeatedDigits && new Set(normalizedDigits).size !== normalizedDigits.length;
  const digitCountRejected = fourDigitRequired && normalizedDigits.length !== 4;

  if (duplicateRejected || digitCountRejected) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_DIGIT_ARRANGEMENT_MAX, ERROR_CODES.E_DIGIT_ARRANGEMENT_MIN],
      normalizedInput: { ...normalizedInput, normalizedDigits },
      notes: duplicateRejected ? "Repeated digits are not allowed." : "Four digits are required."
    });
  }

  if (fourDigitRequired && (hasLeadingZero(candidateValues.max) || hasLeadingZero(candidateValues.min))) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_INVALID_LEADING_ZERO],
      normalizedInput: { ...normalizedInput, normalizedDigits, candidateMax, candidateMin }
    });
  }

  const maxDigits = [...normalizedDigits].sort((a, b) => b - a);
  const minDigits = computeMinimumDigits(normalizedDigits, fourDigitRequired);

  if (minDigits === null) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_INVALID_LEADING_ZERO],
      normalizedInput: { ...normalizedInput, normalizedDigits }
    });
  }

  const max = buildNumberFromDigits(maxDigits);
  const min = buildNumberFromDigits(minDigits);
  const errorCodes = [];

  if (candidateMax !== max) {
    errorCodes.push(ERROR_CODES.E_DIGIT_ARRANGEMENT_MAX);
  }
  if (candidateMin !== min) {
    errorCodes.push(ERROR_CODES.E_DIGIT_ARRANGEMENT_MIN);
  }

  return createHookResult({
    passed: errorCodes.length === 0,
    errorCodes,
    computedAnswer: {
      digits: normalizedDigits,
      max,
      min
    },
    normalizedInput: { ...normalizedInput, normalizedDigits, candidateMax, candidateMin }
  });
}
