import { ANSWER_STATUSES } from "./constants/answer-status.js";
import { ERROR_CODES } from "./constants/error-codes.js";
import { SUPPORT_STATUSES } from "./constants/support-status.js";
import { WARNING_CODES } from "./constants/warning-codes.js";

export { createValidationResult } from "./validation-result.js";
export { validatePatternSpec } from "./validate-pattern-spec.js";
export { validateDomainBoundary } from "./validate-domain-boundary.js";
export { validateAnswerStatus } from "./validate-answer-status.js";
export { validateNumericRange } from "./hooks/validate-numeric-range.js";
export { validateDigitCount } from "./hooks/validate-digit-count.js";
export { validateSupportStatusCompatibility } from "./hooks/validate-support-status-compatibility.js";
export { validateNoFutureDomainLeakage } from "./hooks/validate-no-future-domain-leakage.js";
export { validateNoUnsupportedVisualDependency } from "./hooks/validate-no-unsupported-visual-dependency.js";
export { validateUniqueAnswer } from "./hooks/validate-unique-answer.js";
export { validateSourceBoundary } from "./hooks/validate-source-boundary.js";
export {
  ANSWER_STATUSES,
  VALIDATOR_ASSIGNABLE_ANSWER_STATUSES,
  FORBIDDEN_VALIDATOR_ANSWER_STATUSES
} from "./constants/answer-status.js";
export { ERROR_CODES, ERROR_CODE_VALUES } from "./constants/error-codes.js";
export { WARNING_CODES, WARNING_CODE_VALUES } from "./constants/warning-codes.js";
export { SUPPORT_STATUSES, SUPPORT_STATUS_VALUES } from "./constants/support-status.js";

export const constants = Object.freeze({
  ANSWER_STATUSES,
  ERROR_CODES,
  WARNING_CODES,
  SUPPORT_STATUSES
});
