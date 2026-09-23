import {
  ANSWER_STATUSES,
  FORBIDDEN_VALIDATOR_ANSWER_STATUSES
} from "./constants/answer-status.js";
import { ERROR_CODE_VALUES } from "./constants/error-codes.js";
import { WARNING_CODE_VALUES } from "./constants/warning-codes.js";

function normalizeArray(value, label) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array when provided.`);
  }
  return [...value];
}

function assertKnownCodes(codes, knownCodes, label) {
  for (const code of codes) {
    if (!knownCodes.includes(code)) {
      throw new RangeError(`Unknown ${label} code '${code}'.`);
    }
  }
}

export function createValidationResult(partial = {}) {
  const errorCodes = normalizeArray(partial.errorCodes, "errorCodes");
  const warnings = normalizeArray(partial.warnings, "warnings");

  assertKnownCodes(errorCodes, ERROR_CODE_VALUES, "error");
  assertKnownCodes(warnings, WARNING_CODE_VALUES, "warning");

  const answerStatus = partial.answerStatus
    ?? (errorCodes.length > 0 ? ANSWER_STATUSES.INVALID : ANSWER_STATUSES.TO_BE_VERIFIED);

  if (FORBIDDEN_VALIDATOR_ANSWER_STATUSES.includes(answerStatus)) {
    throw new RangeError(`Validator helper cannot assign answerStatus '${answerStatus}'.`);
  }

  const validationStatus = partial.validationStatus
    ?? (errorCodes.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass");

  const productionEligible = partial.productionEligible
    ?? errorCodes.length === 0;

  return {
    validationStatus,
    answerStatus,
    validatorHook: partial.validatorHook ?? null,
    patternSpecId: partial.patternSpecId ?? null,
    computedAnswer: partial.computedAnswer ?? null,
    normalizedInput: partial.normalizedInput ?? null,
    errorCodes,
    warnings,
    productionEligible: productionEligible && errorCodes.length === 0,
    notes: partial.notes ?? ""
  };
}
