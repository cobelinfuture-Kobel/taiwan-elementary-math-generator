import { ANSWER_STATUSES } from "./constants/answer-status.js";
import { createValidationResult } from "./validation-result.js";
import { validateDigitCount } from "./hooks/validate-digit-count.js";
import { validateNoFutureDomainLeakage } from "./hooks/validate-no-future-domain-leakage.js";
import { validateNoUnsupportedVisualDependency } from "./hooks/validate-no-unsupported-visual-dependency.js";
import { validateNumericRange } from "./hooks/validate-numeric-range.js";
import { validateSupportStatusCompatibility } from "./hooks/validate-support-status-compatibility.js";

function collectNumericCandidates(candidateItem) {
  const candidates = [];
  if (typeof candidateItem?.value === "number" || typeof candidateItem?.value === "string") {
    candidates.push(candidateItem.value);
  }
  if (typeof candidateItem?.candidateAnswer === "number" || typeof candidateItem?.candidateAnswer === "string") {
    candidates.push(candidateItem.candidateAnswer);
  }
  if (Array.isArray(candidateItem?.values)) {
    candidates.push(...candidateItem.values.filter((value) => typeof value === "number" || typeof value === "string"));
  }
  return candidates;
}

export function validateDomainBoundary(candidateItem = {}, patternSpec = {}) {
  const hookResults = [];
  const numericConstraint = patternSpec?.constraints?.numericRange ?? patternSpec?.constraints?.bounds ?? patternSpec?.constraints;
  const digitConstraint = patternSpec?.constraints?.digitConstraint ?? patternSpec?.constraints?.digits;

  for (const value of collectNumericCandidates(candidateItem)) {
    if (numericConstraint && typeof numericConstraint === "object") {
      hookResults.push(validateNumericRange(value, numericConstraint));
    }
    if (digitConstraint && typeof digitConstraint === "object") {
      hookResults.push(validateDigitCount(value, digitConstraint));
    }
  }

  if (candidateItem?.supportStatus !== undefined || patternSpec?.supportStatus !== undefined) {
    hookResults.push(
      validateSupportStatusCompatibility(candidateItem?.supportStatus, patternSpec?.supportStatus)
    );
  }

  hookResults.push(validateNoFutureDomainLeakage(candidateItem));
  hookResults.push(
    validateNoUnsupportedVisualDependency(
      candidateItem,
      patternSpec?.rendererRequirements ?? patternSpec?.visualConstraint ?? {}
    )
  );

  const errorCodes = [...new Set(hookResults.flatMap((result) => result.errorCodes))];
  const warnings = [...new Set(hookResults.flatMap((result) => result.warnings))];
  const visualBlocked = hookResults.some((result) => result.hookName === "validateNoUnsupportedVisualDependency" && !result.passed);

  return createValidationResult({
    validatorHook: "validateDomainBoundary",
    patternSpecId: patternSpec?.patternSpecId ?? null,
    answerStatus: visualBlocked
      ? ANSWER_STATUSES.BLOCKED_VISUAL_DEPENDENCY
      : errorCodes.length > 0
        ? ANSWER_STATUSES.INVALID
        : ANSWER_STATUSES.TO_BE_VERIFIED,
    errorCodes,
    warnings,
    normalizedInput: {
      candidateItem,
      patternSpecId: patternSpec?.patternSpecId ?? null
    },
    notes: hookResults
      .filter((result) => result.notes)
      .map((result) => result.notes)
      .join(" ")
  });
}
