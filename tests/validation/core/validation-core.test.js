import test from "node:test";
import assert from "node:assert/strict";

import {
  ANSWER_STATUSES,
  ERROR_CODES,
  SUPPORT_STATUSES,
  WARNING_CODES,
  constants,
  createValidationResult,
  validateAnswerStatus,
  validateDigitCount,
  validateDomainBoundary,
  validateNoFutureDomainLeakage,
  validateNumericRange,
  validatePatternSpec,
  validateSourceBoundary,
  validateSupportStatusCompatibility,
  validateUniqueAnswer
} from "../../../src/validation/core/index.js";

test("core constants match the S21F contract counts", () => {
  assert.equal(Object.keys(ERROR_CODES).length, 27);
  assert.equal(Object.keys(WARNING_CODES).length, 4);
  assert.equal(Object.values(constants.ANSWER_STATUSES).length, 7);
});

test("createValidationResult defaults to fail and non-production when blocking errors exist", () => {
  const result = createValidationResult({
    errorCodes: [ERROR_CODES.E_RANGE_OUT_OF_SCOPE]
  });

  assert.equal(result.validationStatus, "fail");
  assert.equal(result.answerStatus, ANSWER_STATUSES.INVALID);
  assert.equal(result.productionEligible, false);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.computedAnswer, null);
  assert.equal(result.normalizedInput, null);
});

test("createValidationResult rejects forbidden validator answer statuses and unknown codes", () => {
  assert.throws(() => createValidationResult({ answerStatus: ANSWER_STATUSES.VERIFIED }), /cannot assign/);
  assert.throws(() => createValidationResult({ errorCodes: ["E_NOT_REAL"] }), /Unknown error code/);
});

test("validateNumericRange enforces integer and bound constraints", () => {
  const result = validateNumericRange("12.5", {
    minValue: 1,
    maxValue: 20,
    integerOnly: true,
    allowZero: false,
    allowNegative: false
  });

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_RANGE_OUT_OF_SCOPE]);
});

test("validateDigitCount rejects leading zeroes and wrong digit lengths", () => {
  const leadingZero = validateDigitCount("0123", {
    digitCount: 4,
    allowLeadingZero: false
  });
  const wrongLength = validateDigitCount(123, {
    digitCount: 4,
    allowLeadingZero: false
  });

  assert.deepEqual(leadingZero.errorCodes, [ERROR_CODES.E_INVALID_LEADING_ZERO]);
  assert.deepEqual(wrongLength.errorCodes, [ERROR_CODES.E_FOUR_DIGIT_CONSTRAINT]);
});

test("validateSupportStatusCompatibility blocks items that overstate support", () => {
  const result = validateSupportStatusCompatibility(
    SUPPORT_STATUSES.V1_NUMBER_SENSE_SUPPORTED,
    SUPPORT_STATUSES.V1_TEXT_FALLBACK_SUPPORTED
  );

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_SUPPORT_STATUS_MISMATCH]);
});

test("validateNoFutureDomainLeakage detects decimals and future-domain markers", () => {
  const result = validateNoFutureDomainLeakage({
    promptDomain: "fractions",
    values: [3.5]
  });

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_FUTURE_DOMAIN_LEAKAGE]);
});

test("validateUniqueAnswer fails obvious ambiguity and warns on borderline prompts", () => {
  const failResult = validateUniqueAnswer("Choose all possible answers.", {
    acceptedAnswers: [1, 2]
  });
  const warningResult = validateUniqueAnswer("Find the answer.", {}, {
    allowMultipleRepresentations: true
  });

  assert.deepEqual(failResult.errorCodes, [ERROR_CODES.E_ANSWER_NOT_UNIQUE]);
  assert.deepEqual(warningResult.warnings, [WARNING_CODES.W_HUMAN_REVIEW_RECOMMENDED]);
});

test("validateSourceBoundary rejects generated items claiming source-backed or verified without evidence", () => {
  const sourceBackedViolation = validateSourceBoundary(
    { generatedByAI: true, sourceBacked: true },
    ANSWER_STATUSES.COMPUTED,
    []
  );
  const verifiedViolation = validateSourceBoundary(
    { generatedByRule: true },
    ANSWER_STATUSES.VERIFIED,
    []
  );

  assert.deepEqual(sourceBackedViolation.errorCodes, [ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION]);
  assert.deepEqual(verifiedViolation.errorCodes, [ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION]);
});

test("validatePatternSpec runs structural checks only; accepts generic PatternSpec when no allow-list is provided", () => {
  const result = validatePatternSpec({
    patternSpecId: "spec_custom_unit",
    questionKind: "decompose",
    supportStatus: SUPPORT_STATUSES.V1_NUMBER_SENSE_SUPPORTED,
    constraints: { numericRange: { minValue: 0, maxValue: 100 } },
    answerModel: { answerModelType: "scalarNumberAnswer" },
    validatorHooks: ["validateNumericRange"],
    sourceMetadata: { createdBy: "test" },
    provenance: { generationMode: "rule_based" }
  });

  assert.equal(result.validationStatus, "pass");
  assert.equal(result.errorCodes.length, 0);
});

test("validatePatternSpec allow-list mode rejects unknown patternSpecId", () => {
  const result = validatePatternSpec(
    {
      patternSpecId: "spec_unknown",
      questionKind: "decompose",
      supportStatus: SUPPORT_STATUSES.V1_NUMBER_SENSE_SUPPORTED,
      constraints: { numericRange: { minValue: 0, maxValue: 100 } },
      answerModel: { answerModelType: "scalarNumberAnswer" },
      validatorHooks: ["validateNumericRange"],
      sourceMetadata: { createdBy: "test" },
      provenance: { generationMode: "rule_based" }
    },
    { allowedPatternSpecIds: ["spec_pv_4digit_decompose"] }
  );

  assert.equal(result.validationStatus, "fail");
  assert.match(result.errorCodes.join(","), /E_PATTERN_UNKNOWN/);
});

test("validatePatternSpec catches missing hooks and empty validatorHooks", () => {
  const result = validatePatternSpec({
    patternSpecId: "spec_test",
    questionKind: "decompose",
    supportStatus: SUPPORT_STATUSES.V1_NUMBER_SENSE_SUPPORTED,
    constraints: {},
    answerModel: {},
    validatorHooks: [],
    sourceMetadata: {},
    provenance: {}
  });

  assert.equal(result.validationStatus, "fail");
  assert.match(result.errorCodes.join(","), /E_PATTERN_HOOK_MISSING/);
});

test("validatePatternSpec allow-list mode rejects unknown hook names", () => {
  const result = validatePatternSpec(
    {
      patternSpecId: "spec_test",
      questionKind: "decompose",
      supportStatus: SUPPORT_STATUSES.V1_NUMBER_SENSE_SUPPORTED,
      constraints: { numericRange: { minValue: 0, maxValue: 100 } },
      answerModel: { answerModelType: "scalarNumberAnswer" },
      validatorHooks: ["validateNumericRange", "validateFutureDomainHook"],
      sourceMetadata: { createdBy: "test" },
      provenance: { generationMode: "rule_based" }
    },
    { allowedHookNames: ["validateNumericRange", "validateDigitCount"] }
  );

  assert.equal(result.validationStatus, "fail");
  assert.match(result.errorCodes.join(","), /E_PATTERN_HOOK_MISSING/);
});

test("validateAnswerStatus forbids validator assignment of verified and enforces computed prerequisites", () => {
  const verifiedResult = validateAnswerStatus(ANSWER_STATUSES.VERIFIED, {
    assignmentActor: "validator"
  });
  const computedResult = validateAnswerStatus(ANSWER_STATUSES.COMPUTED, {
    assignmentActor: "validator",
    deterministicPassed: false
  });

  assert.equal(verifiedResult.passed, false);
  assert.equal(computedResult.passed, false);
  assert.deepEqual(computedResult.errorCodes, [ERROR_CODES.E_PROVENANCE_STATUS_VIOLATION]);
});

test("validateDomainBoundary aggregates global core hooks and blocks unsupported visual items", () => {
  const result = validateDomainBoundary(
    {
      value: "0123",
      supportStatus: SUPPORT_STATUSES.V1_NUMBER_SENSE_SUPPORTED,
      requiresVisualExtraction: true
    },
    {
      patternSpecId: "spec_money_4digit_counting",
      supportStatus: SUPPORT_STATUSES.V1_TEXT_FALLBACK_SUPPORTED,
      constraints: {
        numericRange: {
          minValue: 1000,
          maxValue: 9999,
          allowZero: false,
          allowNegative: false,
          integerOnly: true
        },
        digitConstraint: {
          digitCount: 4,
          allowLeadingZero: false
        }
      },
      rendererRequirements: {
        requiresVisualRenderer: true,
        textFallbackAvailable: false
      }
    }
  );

  assert.equal(result.validationStatus, "fail");
  assert.equal(result.answerStatus, ANSWER_STATUSES.BLOCKED_VISUAL_DEPENDENCY);
  assert.match(result.errorCodes.join(","), /E_INVALID_LEADING_ZERO/);
  assert.match(result.errorCodes.join(","), /E_SUPPORT_STATUS_MISMATCH/);
  assert.match(result.errorCodes.join(","), /E_VISUAL_DEPENDENCY_UNSTRUCTURED/);
});
