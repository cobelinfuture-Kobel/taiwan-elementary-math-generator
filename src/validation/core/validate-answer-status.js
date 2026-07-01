import {
  ANSWER_STATUSES,
  FORBIDDEN_VALIDATOR_ANSWER_STATUSES,
  VALIDATOR_ASSIGNABLE_ANSWER_STATUSES
} from "./constants/answer-status.js";
import { ERROR_CODES } from "./constants/error-codes.js";

function createResult(overrides = {}) {
  return {
    hookName: "validateAnswerStatus",
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

export function validateAnswerStatus(answerStatus, options = {}) {
  const {
    assignmentActor = "validator",
    deterministicPassed = false,
    blockingErrors = false,
    visualDependencyBlocked = false
  } = options;

  const knownStatus = Object.values(ANSWER_STATUSES).includes(answerStatus);
  if (!knownStatus || !VALIDATOR_ASSIGNABLE_ANSWER_STATUSES.includes(answerStatus) && assignmentActor === "validator") {
    return createResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION],
      normalizedInput: { answerStatus, assignmentActor }
    });
  }

  if (assignmentActor === "validator" && FORBIDDEN_VALIDATOR_ANSWER_STATUSES.includes(answerStatus)) {
    return createResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION],
      normalizedInput: { answerStatus, assignmentActor }
    });
  }

  const violations = [];

  if (answerStatus === ANSWER_STATUSES.COMPUTED && (!deterministicPassed || blockingErrors)) {
    violations.push(ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION);
  }

  if (answerStatus === ANSWER_STATUSES.BLOCKED_VISUAL_DEPENDENCY && !visualDependencyBlocked) {
    violations.push(ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION);
  }

  if (answerStatus === ANSWER_STATUSES.INVALID && !blockingErrors) {
    violations.push(ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION);
  }

  return createResult({
    passed: violations.length === 0,
    errorCodes: violations.length > 0 ? [ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION] : [],
    normalizedInput: {
      answerStatus,
      assignmentActor,
      deterministicPassed,
      blockingErrors,
      visualDependencyBlocked
    }
  });
}
