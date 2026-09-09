export const PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID = "P1-07";
export const PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE = "quotientStartPlace";
export const PATH1_P1_07_QUOTIENT_START_PLACE_OPERATION_FAMILY_ID =
  "PATH1_P1_07_QUOTIENT_START_PLACE";
export const PATH1_P1_07_QUOTIENT_START_PLACE_SOURCE_ID = "g3b_u01_3b01";
export const PATH1_P1_07_QUOTIENT_START_PLACE_MASTERY_CREDIT =
  "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL";

export const PATH1_P1_07_TWO_DIGIT_KP_ID =
  "kp_g3b_u01_2digit_division_place_value_cases";
export const PATH1_P1_07_THREE_DIGIT_KP_ID =
  "kp_g3b_u01_3digit_division_place_value_cases";

const TWO_DIGIT_PARENT_PATTERN_IDS = Object.freeze([
  "ps_g3b_u01_2digit_by_1digit_regroup_tens",
  "ps_g3b_u01_2digit_leading_digit_insufficient",
  "ps_g3b_u01_2digit_leading_digit_exact",
]);
const THREE_DIGIT_PARENT_PATTERN_IDS = Object.freeze([
  "ps_g3b_u01_3digit_by_1digit_regroup_hundreds",
  "ps_g3b_u01_3digit_hundreds_insufficient",
  "ps_g3b_u01_3digit_hundreds_exact",
]);

const CANONICAL_MODEL_BY_KP = Object.freeze({
  [PATH1_P1_07_TWO_DIGIT_KP_ID]: Object.freeze({
    knowledgePointId: PATH1_P1_07_TWO_DIGIT_KP_ID,
    operationModelId: "op_g3b_u01_two_digit_exact_division_place_value",
    dividendDigits: 2,
    semanticParentPatternSpecIds: TWO_DIGIT_PARENT_PATTERN_IDS,
  }),
  [PATH1_P1_07_THREE_DIGIT_KP_ID]: Object.freeze({
    knowledgePointId: PATH1_P1_07_THREE_DIGIT_KP_ID,
    operationModelId: "op_g3b_u01_three_digit_exact_division_place_value",
    dividendDigits: 3,
    semanticParentPatternSpecIds: THREE_DIGIT_PARENT_PATTERN_IDS,
  }),
});

function spec(patternSpecId, representationType, applicableKnowledgePointIds, answerKind) {
  return Object.freeze({
    patternSpecId,
    representationType,
    applicableKnowledgePointIds: Object.freeze(applicableKnowledgePointIds),
    answerKind,
    path1ParentPatternId: "quotient_start_place_cases",
    path1BlockId: PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID,
    relationId: null,
    wordProblemRelationMinted: false,
  });
}

export const PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPECS = Object.freeze([
  spec(
    "P107_2DIGIT_START_PLACE_SELECT",
    "quotient_start_place_select",
    [PATH1_P1_07_TWO_DIGIT_KP_ID],
    "startPlace",
  ),
  spec(
    "P107_2DIGIT_QUOTIENT_DIGIT_COUNT",
    "quotient_digit_count_select",
    [PATH1_P1_07_TWO_DIGIT_KP_ID],
    "quotientDigits",
  ),
  spec(
    "P107_3DIGIT_START_PLACE_SELECT",
    "quotient_start_place_select",
    [PATH1_P1_07_THREE_DIGIT_KP_ID],
    "startPlace",
  ),
  spec(
    "P107_3DIGIT_QUOTIENT_DIGIT_COUNT",
    "quotient_digit_count_select",
    [PATH1_P1_07_THREE_DIGIT_KP_ID],
    "quotientDigits",
  ),
]);

export const PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPEC_IDS = Object.freeze(
  PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPECS.map(({ patternSpecId }) => patternSpecId),
);

const SPEC_BY_ID = new Map(
  PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPECS.map((entry) => [entry.patternSpecId, entry]),
);

export function getPath1P107QuotientStartPlacePatternSpec(patternSpecId) {
  return SPEC_BY_ID.get(patternSpecId) ?? null;
}

export function getPath1P107CanonicalModel(knowledgePointId) {
  return CANONICAL_MODEL_BY_KP[knowledgePointId] ?? null;
}

export function getPath1P107Case({ dividend, divisor }) {
  if (!Number.isInteger(divisor) || divisor < 2 || divisor > 9) return null;
  if (Number.isInteger(dividend) && dividend >= 10 && dividend <= 99) {
    const leadingDigit = Math.floor(dividend / 10);
    return Object.freeze({
      caseId: leadingDigit < divisor
        ? "P107_2DIGIT_LEADING_INSUFFICIENT"
        : "P107_2DIGIT_LEADING_SUFFICIENT",
      dividendDigits: 2,
      leadingDigit,
      expectedStartPlace: leadingDigit < divisor ? "ONES" : "TENS",
      expectedQuotientDigits: leadingDigit < divisor ? 1 : 2,
      knowledgePointId: PATH1_P1_07_TWO_DIGIT_KP_ID,
    });
  }
  if (Number.isInteger(dividend) && dividend >= 100 && dividend <= 999) {
    const leadingDigit = Math.floor(dividend / 100);
    return Object.freeze({
      caseId: leadingDigit < divisor
        ? "P107_3DIGIT_HUNDREDS_INSUFFICIENT"
        : "P107_3DIGIT_HUNDREDS_SUFFICIENT",
      dividendDigits: 3,
      leadingDigit,
      expectedStartPlace: leadingDigit < divisor ? "TENS" : "HUNDREDS",
      expectedQuotientDigits: leadingDigit < divisor ? 2 : 3,
      knowledgePointId: PATH1_P1_07_THREE_DIGIT_KP_ID,
    });
  }
  return null;
}

export function getPath1P107StartPlaceLabel(startPlace) {
  return ({ ONES: "個位", TENS: "十位", HUNDREDS: "百位" })[startPlace] ?? null;
}

export function buildPath1P107Options({ patternSpecId, dividend, divisor }) {
  const patternSpec = getPath1P107QuotientStartPlacePatternSpec(patternSpecId);
  const canonicalCase = getPath1P107Case({ dividend, divisor });
  if (!patternSpec || !canonicalCase) return null;
  if (patternSpec.answerKind === "startPlace") {
    return Object.freeze(canonicalCase.dividendDigits === 2 ? ["十位", "個位"] : ["百位", "十位"]);
  }
  return Object.freeze(canonicalCase.dividendDigits === 2 ? [1, 2] : [2, 3]);
}

export function renderPath1P107QuotientStartPlacePrompt({ patternSpecId, dividend, divisor }) {
  const patternSpec = getPath1P107QuotientStartPlacePatternSpec(patternSpecId);
  const canonicalCase = getPath1P107Case({ dividend, divisor });
  if (!patternSpec || !canonicalCase) return null;
  const options = buildPath1P107Options({ patternSpecId, dividend, divisor });
  const optionText = options.map((value, index) => `${index === 0 ? "A" : "B"}. ${value}`).join("　");
  if (patternSpec.answerKind === "startPlace") {
    return `${dividend} ÷ ${divisor} 的商，最高位應從哪一位開始寫？${optionText}`;
  }
  return `${dividend} ÷ ${divisor} 的商是幾位數？${optionText}`;
}

export function renderPath1P107QuotientStartPlaceAnswerText({ patternSpecId, dividend, divisor }) {
  const patternSpec = getPath1P107QuotientStartPlacePatternSpec(patternSpecId);
  const canonicalCase = getPath1P107Case({ dividend, divisor });
  if (!patternSpec || !canonicalCase) return null;
  if (patternSpec.answerKind === "startPlace") {
    return `答案：${getPath1P107StartPlaceLabel(canonicalCase.expectedStartPlace)}`;
  }
  return `答案：${canonicalCase.expectedQuotientDigits}位數`;
}
