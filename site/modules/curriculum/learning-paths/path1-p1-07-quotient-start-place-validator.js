import {
  PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID,
  PATH1_P1_07_QUOTIENT_START_PLACE_MASTERY_CREDIT,
  PATH1_P1_07_QUOTIENT_START_PLACE_OPERATION_FAMILY_ID,
  PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
  PATH1_P1_07_QUOTIENT_START_PLACE_SOURCE_ID,
  PATH1_P1_07_THREE_DIGIT_KP_ID,
  PATH1_P1_07_TWO_DIGIT_KP_ID,
  buildPath1P107Options,
  getPath1P107CanonicalModel,
  getPath1P107Case,
  getPath1P107QuotientStartPlacePatternSpec,
  getPath1P107StartPlaceLabel,
  renderPath1P107QuotientStartPlaceAnswerText,
  renderPath1P107QuotientStartPlacePrompt,
} from "./path1-p1-07-quotient-start-place-patterns.js";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function arraysEqual(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

export function validatePath1P107QuotientStartPlaceItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const patternSpecId = entry?.patternSpecId ?? metadata.representationPatternId;
  const patternSpec = getPath1P107QuotientStartPlacePatternSpec(patternSpecId);
  const knowledgePointId = entry?.knowledgePointId ?? metadata.knowledgePointId;
  const canonicalModel = getPath1P107CanonicalModel(knowledgePointId);
  const dividend = Number(entry?.dividend);
  const divisor = Number(entry?.divisor);
  const quotient = Number(entry?.quotient);
  const remainder = Number(entry?.remainder);
  const leadingDigit = Number(entry?.leadingDigit);
  const quotientDigits = Number(entry?.quotientDigits);
  const canonicalCase = getPath1P107Case({ dividend, divisor });

  if (!patternSpec) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_UNAPPROVED_PATTERN_SPEC", { patternSpecId }));
  if (!canonicalModel) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_KP_NOT_ALLOWED", { knowledgePointId }));
  if (entry?.mode !== "numeric") errors.push(issue("PATH1_P107_QUOTIENT_PLACE_QUESTION_MODE_SCOPE_LEAK"));
  if (entry?.operationFamilyId !== PATH1_P1_07_QUOTIENT_START_PLACE_OPERATION_FAMILY_ID) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_OPERATION_FAMILY_MISMATCH"));
  }
  if (entry?.sourceNodeId !== PATH1_P1_07_QUOTIENT_START_PLACE_SOURCE_ID) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_SOURCE_NODE_MISMATCH"));
  }
  if (entry?.path1BlockId !== PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID
      || metadata.path1BlockId !== PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_BLOCK_MISMATCH"));
  }
  if (metadata.practiceMode !== PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_PRACTICE_MODE_MISMATCH"));
  }
  if (metadata.representationPatternId !== patternSpecId || metadata.representationType !== entry?.representationType) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_PATTERN_METADATA_MISMATCH"));
  }

  if (!Number.isInteger(dividend) || dividend < 10 || dividend > 999) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_DIVIDEND_OUT_OF_SCOPE", { dividend }));
  }
  if (!Number.isInteger(divisor) || divisor < 2 || divisor > 9) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_DIVISOR_OUT_OF_SCOPE", { divisor }));
  }
  if (!canonicalCase) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_CASE_NOT_RECONSTRUCTABLE"));
  }
  if (!Number.isInteger(quotient) || !Number.isInteger(remainder) || remainder !== 0 || dividend !== divisor * quotient) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_EXACT_DIVISION_REQUIRED", { dividend, divisor, quotient, remainder }));
  }
  if (Number.isInteger(quotient) && String(quotient).includes("0")) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_ZERO_CASE_SCOPE_LEAK", { quotient }));
  }

  if (canonicalCase) {
    if (knowledgePointId !== canonicalCase.knowledgePointId) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_KP_WIDTH_MISMATCH", {
        knowledgePointId,
        expected: canonicalCase.knowledgePointId,
      }));
    }
    if (entry?.caseId !== canonicalCase.caseId || metadata.caseId !== canonicalCase.caseId) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_CASE_MISMATCH", {
        actual: entry?.caseId,
        expected: canonicalCase.caseId,
      }));
    }
    if (!Number.isInteger(leadingDigit) || leadingDigit !== canonicalCase.leadingDigit
        || metadata.leadingDigit !== canonicalCase.leadingDigit) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_LEADING_DIGIT_MISMATCH"));
    }
    if (entry?.startPlace !== canonicalCase.expectedStartPlace
        || metadata.startPlace !== canonicalCase.expectedStartPlace) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_START_PLACE_MISMATCH", {
        actual: entry?.startPlace,
        expected: canonicalCase.expectedStartPlace,
      }));
    }
    if (!Number.isInteger(quotientDigits) || quotientDigits !== canonicalCase.expectedQuotientDigits
        || metadata.quotientDigits !== canonicalCase.expectedQuotientDigits
        || String(quotient).length !== canonicalCase.expectedQuotientDigits) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_DIGIT_COUNT_MISMATCH", {
        quotientDigits,
        expected: canonicalCase.expectedQuotientDigits,
      }));
    }
  }

  if (canonicalModel) {
    if (entry?.operationModelId !== canonicalModel.operationModelId
        || metadata.operationModelId !== canonicalModel.operationModelId) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_OPERATION_MODEL_MISMATCH"));
    }
    if (!arraysEqual(entry?.semanticParentPatternSpecIds, canonicalModel.semanticParentPatternSpecIds)
        || !arraysEqual(metadata.semanticParentPatternSpecIds, canonicalModel.semanticParentPatternSpecIds)) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_SEMANTIC_PARENT_MISMATCH"));
    }
  }
  if (patternSpec && !patternSpec.applicableKnowledgePointIds.includes(knowledgePointId)) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_PATTERN_KP_MISMATCH", { patternSpecId, knowledgePointId }));
  }

  if (metadata.dividend !== dividend || metadata.divisor !== divisor || metadata.quotient !== quotient
      || metadata.remainder !== remainder) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_NUMERIC_METADATA_MISMATCH"));
  }
  if (metadata.exactDivisionRequired !== true) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_EXACT_FLAG_MISMATCH"));
  if (metadata.quotientZeroCaseUsed !== false) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_ZERO_CASE_FLAG_SCOPE_LEAK"));
  if (metadata.twoDigitDivisorRepresentationUsed !== false) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_TWO_DIGIT_DIVISOR_SCOPE_LEAK"));
  if (metadata.divisorEstimationUsed !== false) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_ESTIMATION_SCOPE_LEAK"));
  if (metadata.remainderContextInterpretationUsed !== false) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_REMAINDER_SCOPE_LEAK"));
  if (metadata.applicationPromptUsed !== false || metadata.relationPromptUsed !== false || metadata.wordProblemRelationUsed !== false) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_WORD_PROBLEM_SCOPE_LEAK"));
  }
  if (entry?.relationId !== null || metadata.relationId !== null || entry?.unknownRole !== null || metadata.unknownRole !== null) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_RELATION_SCOPE_LEAK"));
  }
  if (metadata.canonicalKnowledgePointMinted !== false) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_CANONICAL_KP_SCOPE_LEAK"));
  if (metadata.masteryCredit !== PATH1_P1_07_QUOTIENT_START_PLACE_MASTERY_CREDIT) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_MASTERY_SCOPE_LEAK"));
  }
  if (metadata.publicCutoverApplied !== false) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_PUBLIC_CUTOVER_SCOPE_LEAK"));
  if (patternSpec) {
    if (metadata.path1ParentPatternId !== patternSpec.path1ParentPatternId) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_PARENT_PATTERN_MISMATCH"));
    }
    if (patternSpec.relationId !== null || patternSpec.wordProblemRelationMinted !== false) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_PATTERN_RELATION_SCOPE_LEAK"));
    }
  }

  const expectedOptions = buildPath1P107Options({ patternSpecId, dividend, divisor });
  if (!arraysEqual(entry?.options, expectedOptions)) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_OPTIONS_MISMATCH"));
  }
  const expectedPrompt = renderPath1P107QuotientStartPlacePrompt({ patternSpecId, dividend, divisor });
  const expectedAnswerText = renderPath1P107QuotientStartPlaceAnswerText({ patternSpecId, dividend, divisor });
  if (entry?.prompt !== expectedPrompt) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_PROMPT_RECONSTRUCTION_FAILED"));
  if (entry?.answerText !== expectedAnswerText) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_ANSWER_TEXT_MISMATCH"));

  if (patternSpec && canonicalCase) {
    const expectedFinalAnswer = patternSpec.answerKind === "startPlace"
      ? getPath1P107StartPlaceLabel(canonicalCase.expectedStartPlace)
      : canonicalCase.expectedQuotientDigits;
    if (entry?.finalAnswer !== expectedFinalAnswer) {
      errors.push(issue("PATH1_P107_QUOTIENT_PLACE_FINAL_ANSWER_MISMATCH", {
        actual: entry?.finalAnswer,
        expected: expectedFinalAnswer,
      }));
    }
  }
  if (entry?.equationModel !== `${dividend} ÷ ${divisor} = ${quotient}`) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_EQUATION_MISMATCH"));
  }
  if (entry?.finalRemainder !== null) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_FINAL_REMAINDER_SCOPE_LEAK"));
  if (entry?.finalAnswerUnit !== null) errors.push(issue("PATH1_P107_QUOTIENT_PLACE_UNIT_SCOPE_LEAK"));

  if (knowledgePointId === PATH1_P1_07_TWO_DIGIT_KP_ID && (dividend < 10 || dividend > 99)) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_TWO_DIGIT_KP_DOMAIN_MISMATCH"));
  }
  if (knowledgePointId === PATH1_P1_07_THREE_DIGIT_KP_ID && (dividend < 100 || dividend > 999)) {
    errors.push(issue("PATH1_P107_QUOTIENT_PLACE_THREE_DIGIT_KP_DOMAIN_MISMATCH"));
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validatePath1P107QuotientStartPlaceItems(items) {
  if (!Array.isArray(items)) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("PATH1_P107_QUOTIENT_PLACE_ITEMS_ARRAY_REQUIRED")]),
    });
  }
  const errors = items.flatMap((entry, index) => {
    const validation = validatePath1P107QuotientStartPlaceItem(entry);
    return validation.errors.map((error) => issue(error.code, { ...error, index }));
  });
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
