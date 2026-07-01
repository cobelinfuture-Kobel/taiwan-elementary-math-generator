import { ERROR_CODES } from "./constants/error-codes.js";
import { SUPPORT_STATUS_VALUES } from "./constants/support-status.js";
import { createValidationResult } from "./validation-result.js";

const KNOWN_QUESTION_KINDS = Object.freeze([
  "decompose",
  "compose",
  "transcode",
  "sequence",
  "compare",
  "optimize_from_digits",
  "visual_reading",
  "representation_payment"
]);

function hasConstraintGroup(constraints) {
  return Boolean(constraints) && typeof constraints === "object" && Object.keys(constraints).length > 0;
}

export function validatePatternSpec(patternSpec = {}, options = {}) {
  const errorCodes = [];
  const notes = [];

  const requiredFields = [
    "patternSpecId",
    "questionKind",
    "supportStatus",
    "constraints",
    "answerModel",
    "validatorHooks",
    "sourceMetadata",
    "provenance"
  ];

  for (const field of requiredFields) {
    if (patternSpec[field] === undefined || patternSpec[field] === null) {
      errorCodes.push(ERROR_CODES.E_SCHEMA_REQUIRED_FIELD);
      notes.push(`Missing required field '${field}'.`);
    }
  }

  const allowedPatternSpecIds = Array.isArray(options.allowedPatternSpecIds) && options.allowedPatternSpecIds.length > 0
    ? options.allowedPatternSpecIds
    : null;
  const allowedHookNames = Array.isArray(options.allowedHookNames) && options.allowedHookNames.length > 0
    ? options.allowedHookNames
    : null;

  if (allowedPatternSpecIds && !allowedPatternSpecIds.includes(patternSpec.patternSpecId)) {
    errorCodes.push(ERROR_CODES.E_PATTERN_UNKNOWN);
    notes.push("PatternSpec ID is not recognized by the provided allow-list.");
  }

  if (!KNOWN_QUESTION_KINDS.includes(patternSpec.questionKind)) {
    errorCodes.push(ERROR_CODES.E_SCHEMA_REQUIRED_FIELD);
    notes.push("questionKind is missing or unsupported.");
  }

  if (!SUPPORT_STATUS_VALUES.includes(patternSpec.supportStatus)) {
    errorCodes.push(ERROR_CODES.E_SCHEMA_REQUIRED_FIELD);
    notes.push("supportStatus is missing or unsupported.");
  }

  if (!hasConstraintGroup(patternSpec.constraints)) {
    errorCodes.push(ERROR_CODES.E_SCHEMA_REQUIRED_FIELD);
    notes.push("constraints must contain at least one recognized group.");
  }

  if (!Array.isArray(patternSpec.validatorHooks) || patternSpec.validatorHooks.length === 0) {
    errorCodes.push(ERROR_CODES.E_PATTERN_HOOK_MISSING);
    notes.push("validatorHooks must be a non-empty array.");
  } else if (allowedHookNames && patternSpec.validatorHooks.some((hook) => !allowedHookNames.includes(hook))) {
    errorCodes.push(ERROR_CODES.E_PATTERN_HOOK_MISSING);
    notes.push("validatorHooks contains at least one unrecognized hook name.");
  }

  return createValidationResult({
    validatorHook: "validatePatternSpec",
    patternSpecId: patternSpec.patternSpecId ?? null,
    errorCodes: [...new Set(errorCodes)],
    notes: notes.join(" ")
  });
}
