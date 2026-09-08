export const PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID = "P1-06";
export const PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE = "estimateTrialQuotient";
export const PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_OPERATION_FAMILY_ID =
  "PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT";
export const PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_SOURCE_ID = "g4a_u04_4a04";
export const PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_MASTERY_CREDIT =
  "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL";

export const PATH1_P1_06_TENS_SUFFICIENT_KP_ID =
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient";
export const PATH1_P1_06_TENS_INSUFFICIENT_KP_ID =
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient";

const CANONICAL_MODEL_BY_KP = Object.freeze({
  [PATH1_P1_06_TENS_SUFFICIENT_KP_ID]: Object.freeze({
    knowledgePointId: PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
    operationModelId: "op_g4a_u04_3digit_by_2digit_tens_sufficient",
    canonicalPatternSpecId: "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
    canonicalCase: "tens_sufficient",
  }),
  [PATH1_P1_06_TENS_INSUFFICIENT_KP_ID]: Object.freeze({
    knowledgePointId: PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
    operationModelId: "op_g4a_u04_3digit_by_2digit_tens_insufficient",
    canonicalPatternSpecId: "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
    canonicalCase: "tens_insufficient",
  }),
});

function spec(patternSpecId, representationType, applicableKnowledgePointIds, answerKind) {
  return Object.freeze({
    patternSpecId,
    representationType,
    applicableKnowledgePointIds: Object.freeze(applicableKnowledgePointIds),
    answerKind,
    path1ParentPatternId: "estimate_trial_quotient",
    path1BlockId: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID,
    relationId: null,
    wordProblemRelationMinted: false,
  });
}

export const PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPECS = Object.freeze([
  spec(
    "P106_ESTIMATE_DIVISOR_TENS_SELECT",
    "estimate_divisor_tens_select",
    [PATH1_P1_06_TENS_SUFFICIENT_KP_ID, PATH1_P1_06_TENS_INSUFFICIENT_KP_ID],
    "estimatedDivisor",
  ),
  spec(
    "P106_ESTIMATE_DIVISOR_TENS_FILL",
    "estimate_divisor_tens_fill",
    [PATH1_P1_06_TENS_SUFFICIENT_KP_ID, PATH1_P1_06_TENS_INSUFFICIENT_KP_ID],
    "estimatedDivisor",
  ),
  spec(
    "P106_ESTIMATE_THEN_DIVIDE_TENS_SUFFICIENT",
    "estimate_then_divide",
    [PATH1_P1_06_TENS_SUFFICIENT_KP_ID],
    "estimatePlusExactQuotientRemainder",
  ),
  spec(
    "P106_ESTIMATE_THEN_DIVIDE_TENS_INSUFFICIENT",
    "estimate_then_divide",
    [PATH1_P1_06_TENS_INSUFFICIENT_KP_ID],
    "estimatePlusExactQuotientRemainder",
  ),
]);

export const PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPEC_IDS = Object.freeze(
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPECS.map(({ patternSpecId }) => patternSpecId),
);

const SPEC_BY_ID = new Map(
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPECS.map((entry) => [entry.patternSpecId, entry]),
);

export function getPath1P106EstimateTrialQuotientPatternSpec(patternSpecId) {
  return SPEC_BY_ID.get(patternSpecId) ?? null;
}

export function getPath1P106CanonicalModel(knowledgePointId) {
  return CANONICAL_MODEL_BY_KP[knowledgePointId] ?? null;
}

export function isPath1P106SourceBackedEstimateDivisor(divisor) {
  if (!Number.isInteger(divisor) || divisor < 10 || divisor > 99) return false;
  const ones = divisor % 10;
  return [1, 2, 3, 4, 6, 7, 8, 9].includes(ones);
}

export function getPath1P106WholeTenEstimate(divisor) {
  if (!isPath1P106SourceBackedEstimateDivisor(divisor)) return null;
  const ones = divisor % 10;
  return ones <= 4 ? divisor - ones : divisor + (10 - ones);
}

export function getPath1P106CanonicalCase({ dividend, divisor }) {
  if (!Number.isInteger(dividend) || dividend < 100 || dividend > 999) return null;
  if (!Number.isInteger(divisor) || divisor < 10 || divisor > 99) return null;
  const firstTwoDigits = Math.floor(dividend / 10);
  return firstTwoDigits >= divisor ? "tens_sufficient" : "tens_insufficient";
}

export function buildPath1P106EstimateOptions(divisor) {
  const estimate = getPath1P106WholeTenEstimate(divisor);
  if (estimate == null) return null;
  const start = estimate <= 20 ? 10 : estimate >= 90 ? 70 : estimate - 20;
  return Object.freeze([start, start + 10, start + 20, start + 30]);
}

function exactDivision(dividend, divisor) {
  return Object.freeze({
    quotient: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
  });
}

export function renderPath1P106EstimateTrialQuotientPrompt({ patternSpecId, dividend, divisor }) {
  const patternSpec = getPath1P106EstimateTrialQuotientPatternSpec(patternSpecId);
  const estimate = getPath1P106WholeTenEstimate(divisor);
  if (!patternSpec || estimate == null) return null;
  if (patternSpecId === "P106_ESTIMATE_DIVISOR_TENS_SELECT") {
    const options = buildPath1P106EstimateOptions(divisor);
    const labels = ["A", "B", "C", "D"];
    const optionText = options.map((value, index) => `${labels[index]}. ${value}`).join("　");
    return `${dividend} ÷ ${divisor} 估商時，把除數 ${divisor} 看成哪一個整十數最合適？${optionText}`;
  }
  if (patternSpecId === "P106_ESTIMATE_DIVISOR_TENS_FILL") {
    return `${dividend} ÷ ${divisor} 估商時，可以把除數 ${divisor} 看成（　）來估算。`;
  }
  return `先把除數 ${divisor} 看成約 ${estimate} 來估商，再計算 ${dividend} ÷ ${divisor} 的商和餘數。`;
}

export function renderPath1P106EstimateTrialQuotientAnswerText({ patternSpecId, dividend, divisor }) {
  const patternSpec = getPath1P106EstimateTrialQuotientPatternSpec(patternSpecId);
  const estimate = getPath1P106WholeTenEstimate(divisor);
  if (!patternSpec || estimate == null) return null;
  if (patternSpec.answerKind === "estimatedDivisor") return `答案：${estimate}`;
  const { quotient, remainder } = exactDivision(dividend, divisor);
  return `估數 ${estimate}；${dividend} ÷ ${divisor} = ${quotient}…${remainder}`;
}
