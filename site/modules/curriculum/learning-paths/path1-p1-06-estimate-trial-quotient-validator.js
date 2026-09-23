import {
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_MASTERY_CREDIT,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_OPERATION_FAMILY_ID,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_SOURCE_ID,
  PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
  buildPath1P106EstimateOptions,
  getPath1P106CanonicalCase,
  getPath1P106CanonicalModel,
  getPath1P106EstimateTrialQuotientPatternSpec,
  getPath1P106WholeTenEstimate,
  isPath1P106SourceBackedEstimateDivisor,
  renderPath1P106EstimateTrialQuotientAnswerText,
  renderPath1P106EstimateTrialQuotientPrompt,
} from "./path1-p1-06-estimate-trial-quotient-patterns.js";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

export function validatePath1P106EstimateTrialQuotientItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const patternSpecId = entry?.patternSpecId ?? metadata.representationPatternId;
  const patternSpec = getPath1P106EstimateTrialQuotientPatternSpec(patternSpecId);
  const knowledgePointId = entry?.knowledgePointId ?? metadata.knowledgePointId;
  const canonicalModel = getPath1P106CanonicalModel(knowledgePointId);
  const dividend = Number(entry?.dividend);
  const divisor = Number(entry?.divisor);
  const estimateDivisor = Number(entry?.estimateDivisor);
  const quotient = Number(entry?.quotient);
  const remainder = Number(entry?.remainder);
  const firstTwoDigits = Number(entry?.firstTwoDigits);

  if (!patternSpec) errors.push(issue("PATH1_P106_ESTIMATE_UNAPPROVED_PATTERN_SPEC", { patternSpecId }));
  if (!canonicalModel) errors.push(issue("PATH1_P106_ESTIMATE_KP_NOT_ALLOWED", { knowledgePointId }));
  if (entry?.mode !== "numeric") errors.push(issue("PATH1_P106_ESTIMATE_QUESTION_MODE_SCOPE_LEAK"));
  if (entry?.operationFamilyId !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_OPERATION_FAMILY_ID) {
    errors.push(issue("PATH1_P106_ESTIMATE_OPERATION_FAMILY_MISMATCH"));
  }
  if (entry?.sourceNodeId !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_SOURCE_ID) {
    errors.push(issue("PATH1_P106_ESTIMATE_SOURCE_NODE_MISMATCH"));
  }
  if (entry?.path1BlockId !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID
      || metadata.path1BlockId !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID) {
    errors.push(issue("PATH1_P106_ESTIMATE_BLOCK_MISMATCH"));
  }
  if (metadata.practiceMode !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE) {
    errors.push(issue("PATH1_P106_ESTIMATE_PRACTICE_MODE_MISMATCH"));
  }
  if (metadata.representationPatternId !== patternSpecId || metadata.representationType !== entry?.representationType) {
    errors.push(issue("PATH1_P106_ESTIMATE_PATTERN_METADATA_MISMATCH"));
  }

  if (!Number.isInteger(dividend) || dividend < 100 || dividend > 999) {
    errors.push(issue("PATH1_P106_ESTIMATE_DIVIDEND_OUT_OF_SCOPE", { dividend }));
  }
  if (!Number.isInteger(divisor) || divisor < 10 || divisor > 99) {
    errors.push(issue("PATH1_P106_ESTIMATE_DIVISOR_OUT_OF_SCOPE", { divisor }));
  }
  if (!isPath1P106SourceBackedEstimateDivisor(divisor)) {
    errors.push(issue("PATH1_P106_ESTIMATE_DIVISOR_EVIDENCE_BOUNDARY_FAILED", { divisor }));
  }
  const expectedEstimate = getPath1P106WholeTenEstimate(divisor);
  if (!Number.isInteger(estimateDivisor) || estimateDivisor !== expectedEstimate) {
    errors.push(issue("PATH1_P106_ESTIMATE_WHOLE_TEN_MISMATCH", { estimateDivisor, expectedEstimate }));
  }
  const expectedFirstTwoDigits = Math.floor(dividend / 10);
  if (!Number.isInteger(firstTwoDigits) || firstTwoDigits !== expectedFirstTwoDigits) {
    errors.push(issue("PATH1_P106_ESTIMATE_FIRST_TWO_DIGITS_MISMATCH", { firstTwoDigits, expectedFirstTwoDigits }));
  }
  const expectedCase = getPath1P106CanonicalCase({ dividend, divisor });
  if (metadata.canonicalCase !== expectedCase) {
    errors.push(issue("PATH1_P106_ESTIMATE_CANONICAL_CASE_MISMATCH", { actual: metadata.canonicalCase, expectedCase }));
  }

  if (canonicalModel) {
    if (entry?.operationModelId !== canonicalModel.operationModelId || metadata.operationModelId !== canonicalModel.operationModelId) {
      errors.push(issue("PATH1_P106_ESTIMATE_OPERATION_MODEL_MISMATCH"));
    }
    if (entry?.canonicalPatternSpecId !== canonicalModel.canonicalPatternSpecId
        || metadata.canonicalPatternSpecId !== canonicalModel.canonicalPatternSpecId) {
      errors.push(issue("PATH1_P106_ESTIMATE_CANONICAL_PATTERN_MISMATCH"));
    }
    if (expectedCase !== canonicalModel.canonicalCase) {
      errors.push(issue("PATH1_P106_ESTIMATE_KP_CASE_MISMATCH", { knowledgePointId, expectedCase }));
    }
  }
  if (patternSpec && !patternSpec.applicableKnowledgePointIds.includes(knowledgePointId)) {
    errors.push(issue("PATH1_P106_ESTIMATE_PATTERN_KP_MISMATCH", { patternSpecId, knowledgePointId }));
  }

  const expectedQuotient = Math.floor(dividend / divisor);
  const expectedRemainder = dividend % divisor;
  if (!Number.isInteger(quotient) || quotient !== expectedQuotient) {
    errors.push(issue("PATH1_P106_ESTIMATE_QUOTIENT_MISMATCH", { quotient, expectedQuotient }));
  }
  if (!Number.isInteger(remainder) || remainder !== expectedRemainder || remainder < 0 || remainder >= divisor) {
    errors.push(issue("PATH1_P106_ESTIMATE_REMAINDER_MISMATCH", { remainder, expectedRemainder, divisor }));
  }
  if (divisor * quotient + remainder !== dividend) {
    errors.push(issue("PATH1_P106_ESTIMATE_DIVISION_RECONSTRUCTION_FAILED"));
  }

  if (knowledgePointId === PATH1_P1_06_TENS_SUFFICIENT_KP_ID && firstTwoDigits < divisor) {
    errors.push(issue("PATH1_P106_ESTIMATE_TENS_SUFFICIENT_BOUNDARY_FAILED"));
  }
  if (knowledgePointId === PATH1_P1_06_TENS_INSUFFICIENT_KP_ID && firstTwoDigits >= divisor) {
    errors.push(issue("PATH1_P106_ESTIMATE_TENS_INSUFFICIENT_BOUNDARY_FAILED"));
  }

  if (metadata.dividend !== dividend || metadata.divisor !== divisor || metadata.estimateDivisor !== estimateDivisor
      || metadata.quotient !== quotient || metadata.remainder !== remainder || metadata.firstTwoDigits !== firstTwoDigits) {
    errors.push(issue("PATH1_P106_ESTIMATE_NUMERIC_METADATA_MISMATCH"));
  }
  if (metadata.estimateStrategy !== "nearest_whole_ten_source_unambiguous") {
    errors.push(issue("PATH1_P106_ESTIMATE_STRATEGY_MISMATCH"));
  }
  if (metadata.estimateTieConventionApplied !== false) errors.push(issue("PATH1_P106_ESTIMATE_TIE_CONVENTION_SCOPE_LEAK"));
  if (entry?.relationId !== null || metadata.relationId !== null) errors.push(issue("PATH1_P106_ESTIMATE_RELATION_SCOPE_LEAK"));
  if (entry?.unknownRole !== null || metadata.unknownRole !== null) errors.push(issue("PATH1_P106_ESTIMATE_UNKNOWN_ROLE_SCOPE_LEAK"));
  if (metadata.applicationPromptUsed !== false || metadata.relationPromptUsed !== false) errors.push(issue("PATH1_P106_ESTIMATE_APPLICATION_SCOPE_LEAK"));
  if (metadata.unitConversionUsed !== false) errors.push(issue("PATH1_P106_ESTIMATE_UNIT_CONVERSION_SCOPE_LEAK"));
  if (metadata.remainderContextInterpretationUsed !== false) errors.push(issue("PATH1_P106_ESTIMATE_REMAINDER_CONTEXT_SCOPE_LEAK"));
  if (metadata.quotientPlaceTeachingUsed !== false) errors.push(issue("PATH1_P106_ESTIMATE_QUOTIENT_PLACE_SCOPE_LEAK"));
  if (metadata.canonicalKnowledgePointMinted !== false) errors.push(issue("PATH1_P106_ESTIMATE_CANONICAL_KP_SCOPE_LEAK"));
  if (metadata.masteryCredit !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_MASTERY_CREDIT) errors.push(issue("PATH1_P106_ESTIMATE_MASTERY_SCOPE_LEAK"));
  if (metadata.publicCutoverApplied !== false) errors.push(issue("PATH1_P106_ESTIMATE_PUBLIC_CUTOVER_SCOPE_LEAK"));

  if (patternSpec) {
    if (metadata.path1ParentPatternId !== patternSpec.path1ParentPatternId) errors.push(issue("PATH1_P106_ESTIMATE_PARENT_PATTERN_MISMATCH"));
    if (patternSpec.relationId !== null || patternSpec.wordProblemRelationMinted !== false) errors.push(issue("PATH1_P106_ESTIMATE_PATTERN_RELATION_SCOPE_LEAK"));
  }

  if (patternSpec?.representationType === "estimate_divisor_tens_select") {
    const expectedOptions = buildPath1P106EstimateOptions(divisor);
    if (!Array.isArray(entry?.options) || entry.options.length !== 4
        || entry.options.some((value, index) => value !== expectedOptions[index])) {
      errors.push(issue("PATH1_P106_ESTIMATE_OPTIONS_MISMATCH"));
    }
  } else if (entry?.options !== null) {
    errors.push(issue("PATH1_P106_ESTIMATE_UNEXPECTED_OPTIONS"));
  }

  const expectedPrompt = renderPath1P106EstimateTrialQuotientPrompt({ patternSpecId, dividend, divisor });
  const expectedAnswerText = renderPath1P106EstimateTrialQuotientAnswerText({ patternSpecId, dividend, divisor });
  if (entry?.prompt !== expectedPrompt) errors.push(issue("PATH1_P106_ESTIMATE_PROMPT_RECONSTRUCTION_FAILED"));
  if (entry?.answerText !== expectedAnswerText) errors.push(issue("PATH1_P106_ESTIMATE_ANSWER_TEXT_MISMATCH"));

  const estimateOnly = patternSpec?.answerKind === "estimatedDivisor";
  if (estimateOnly) {
    if (Number(entry?.finalAnswer) !== estimateDivisor || entry?.finalRemainder !== null || entry?.equationModel !== null) {
      errors.push(issue("PATH1_P106_ESTIMATE_FINAL_ESTIMATE_ANSWER_MISMATCH"));
    }
  } else if (patternSpec) {
    if (Number(entry?.finalAnswer) !== quotient || Number(entry?.finalRemainder) !== remainder) {
      errors.push(issue("PATH1_P106_ESTIMATE_FINAL_DIVISION_ANSWER_MISMATCH"));
    }
    if (entry?.equationModel !== `${dividend} ÷ ${divisor} = ${quotient}…${remainder}`) {
      errors.push(issue("PATH1_P106_ESTIMATE_EQUATION_MISMATCH"));
    }
  }
  if (entry?.finalAnswerUnit !== null) errors.push(issue("PATH1_P106_ESTIMATE_UNIT_SCOPE_LEAK"));

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validatePath1P106EstimateTrialQuotientItems(items) {
  if (!Array.isArray(items)) {
    return Object.freeze({ ok: false, errors: Object.freeze([issue("PATH1_P106_ESTIMATE_ITEMS_ARRAY_REQUIRED")]) });
  }
  const errors = items.flatMap((entry, index) => {
    const validation = validatePath1P106EstimateTrialQuotientItem(entry);
    return validation.errors.map((error) => issue(error.code, { ...error, index }));
  });
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
