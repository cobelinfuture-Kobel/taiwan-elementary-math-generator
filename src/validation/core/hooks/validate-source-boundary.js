import { ANSWER_STATUSES } from "../constants/answer-status.js";
import { ERROR_CODES } from "../constants/error-codes.js";

function createHookResult(overrides = {}) {
  return {
    hookName: "validateSourceBoundary",
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

function hasEvidence(sourceRefs) {
  if (Array.isArray(sourceRefs)) {
    return sourceRefs.length > 0;
  }
  return Boolean(sourceRefs);
}

function hasHumanReviewEvidence(provenance) {
  return Boolean(
    provenance?.humanReviewEvidence
    || provenance?.reviewedBy
    || provenance?.reviewedAt
    || provenance?.humanReviewCompleted === true
  );
}

function claimsSourceBacked(provenance) {
  return provenance?.sourceBacked === true
    || provenance?.sourceBackedStatus === "sourceBacked"
    || provenance?.sourceBoundaryStatus === "sourceBacked";
}

function isGeneratedOrigin(provenance) {
  return provenance?.generatedByAI === true
    || provenance?.generatedByRule === true
    || provenance?.generationMode === "ai_draft"
    || provenance?.generationMode === "rule_based"
    || provenance?.origin === "generatedFromPattern";
}

export function validateSourceBoundary(provenance = {}, answerStatus, sourceRefs) {
  const sourceEvidenceExists = hasEvidence(sourceRefs);
  const humanReviewExists = hasHumanReviewEvidence(provenance);

  const violations = [];

  if (isGeneratedOrigin(provenance) && claimsSourceBacked(provenance)) {
    violations.push(ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION);
  }

  if (claimsSourceBacked(provenance) && !sourceEvidenceExists) {
    violations.push(ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION);
  }

  if (answerStatus === ANSWER_STATUSES.VERIFIED && !(sourceEvidenceExists || humanReviewExists)) {
    violations.push(ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION);
  }

  if (answerStatus === ANSWER_STATUSES.HUMAN_REVIEWED && !humanReviewExists) {
    violations.push(ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION);
  }

  return createHookResult({
    passed: violations.length === 0,
    errorCodes: violations.length > 0 ? [ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION] : [],
    normalizedInput: {
      provenance,
      answerStatus: answerStatus ?? null,
      sourceEvidenceExists,
      humanReviewExists
    }
  });
}
