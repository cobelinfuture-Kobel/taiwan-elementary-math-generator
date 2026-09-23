import {
  PATH1_P1_03_DIVERSITY_PROFILE_ID,
  PATH1_P1_03_KNOWLEDGE_POINT_ID,
  PATH1_P1_03_SOURCE_ID,
} from "./path1-p1-03-diversity.js";

export const PATH1_P1_03_ASSESSMENT_CANDIDATE_PROFILE_ID =
  "PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES_V2";

const PRIMARY_SOURCE_EVIDENCE =
  "batchA_02-題型總覽-4a02-整數的乘法.pdf:p1:二位數×二位數";
const PATTERN_SOURCE_EVIDENCE =
  "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json:P1-03:ps_g4a_u02_2digit_by_2digit:部分積與十位位移";

export const PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES = Object.freeze([
  Object.freeze({
    familyId: "C2_PARTIAL_PRODUCT_SLOT_COMPLETION",
    title: "部分積缺項完成",
    primarySourceEvidence: PRIMARY_SOURCE_EVIDENCE,
    sourceEvidence: PATTERN_SOURCE_EVIDENCE,
  }),
  Object.freeze({
    familyId: "C3_EQUIVALENT_PARTIAL_PRODUCT_EXPRESSION",
    title: "等值部分積分解式判斷",
    primarySourceEvidence: PRIMARY_SOURCE_EVIDENCE,
    sourceEvidence: PATTERN_SOURCE_EVIDENCE,
  }),
  Object.freeze({
    familyId: "C4_TENS_PARTIAL_PRODUCT_ALIGNMENT_JUDGEMENT",
    title: "十位部分積位值與對齊判斷",
    primarySourceEvidence: PRIMARY_SOURCE_EVIDENCE,
    sourceEvidence: PATTERN_SOURCE_EVIDENCE,
    assessmentEvidence:
      "數學_110上_四年級_彰化縣_國聖國小_第一次段考_南一:乘法算法是非題:ASSESSMENT_FORMAT_ONLY",
  }),
]);

export const PATH1_P1_03_DEFERRED_ASSESSMENT_FAMILIES = Object.freeze([
  Object.freeze({
    familyId: "MISSING_DIGIT_INFERENCE",
    reason: "CONSTRAINT_REASONING_EXCEEDS_P1_03_PRODUCT_AND_PARTIAL_PRODUCT_BOUNDARY",
  }),
  Object.freeze({
    familyId: "RELATED_PRODUCT_NEAR_ROUND_NUMBER",
    reason: "DISTRIBUTIVE_COMPENSATION_TRANSFER_IS_NOT_THE_FROZEN_P1_03_PARTIAL_PRODUCT_CORE",
  }),
  Object.freeze({
    familyId: "APPLICATION_WORD_PROBLEM",
    reason: "P1_03_FUSION_GATE_IS_NOT_APPLICABLE",
  }),
  Object.freeze({
    familyId: "MULTI_STEP_APPLICATION",
    reason: "MULTI_STEP_MODELING_IS_OUTSIDE_P1_03_CORE_SCOPE",
  }),
]);

function hashSeed(input) {
  let hash = 2166136261;
  for (const char of String(input)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle(values, seed) {
  const result = [...values];
  let state = hashSeed(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function allocateCounts(total, itemCount, seed) {
  const counts = Array.from({ length: itemCount }, () => 0);
  if (total < 1 || itemCount < 1) return counts;
  const base = Math.floor(total / itemCount);
  const remainder = total % itemCount;
  counts.fill(base);
  const start = hashSeed(seed) % itemCount;
  for (let index = 0; index < remainder; index += 1) {
    counts[(start + index) % itemCount] += 1;
  }
  return counts;
}

function nonZeroTwoDigit(value) {
  return Number.isInteger(value)
    && value >= 11
    && value <= 99
    && Math.floor(value / 10) !== 0
    && value % 10 !== 0;
}

function scopedOperands(leftFactor, rightFactor) {
  return nonZeroTwoDigit(leftFactor) && nonZeroTwoDigit(rightFactor);
}

function partialProductFacts(leftFactor, rightFactor) {
  const tensDigit = Math.floor(rightFactor / 10);
  const onesDigit = rightFactor % 10;
  const tensFactor = tensDigit * 10;
  const onesFactor = onesDigit;
  const tensPartialProduct = leftFactor * tensFactor;
  const onesPartialProduct = leftFactor * onesFactor;
  const product = leftFactor * rightFactor;
  return Object.freeze({
    leftFactor,
    rightFactor,
    tensDigit,
    onesDigit,
    tensFactor,
    onesFactor,
    tensPartialProduct,
    onesPartialProduct,
    product,
    reconstructedProduct: tensPartialProduct + onesPartialProduct,
  });
}

function familyRecord(familyId) {
  return PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.find((family) => family.familyId === familyId);
}

function baseMetadata(familyId, facts, answerRole) {
  const family = familyRecord(familyId);
  return {
    path1DiversityProfileId: PATH1_P1_03_DIVERSITY_PROFILE_ID,
    path1AssessmentCandidateProfileId: PATH1_P1_03_ASSESSMENT_CANDIDATE_PROFILE_ID,
    path1PatternFamilyId: familyId,
    canonicalKnowledgePointId: PATH1_P1_03_KNOWLEDGE_POINT_ID,
    sourceId: PATH1_P1_03_SOURCE_ID,
    primarySourceEvidence: family?.primarySourceEvidence,
    sourceEvidence: family?.sourceEvidence,
    assessmentEvidence: family?.assessmentEvidence ?? null,
    leftFactor: facts.leftFactor,
    rightFactor: facts.rightFactor,
    product: facts.product,
    tensDigit: facts.tensDigit,
    onesDigit: facts.onesDigit,
    tensFactor: facts.tensFactor,
    onesFactor: facts.onesFactor,
    tensPartialProduct: facts.tensPartialProduct,
    onesPartialProduct: facts.onesPartialProduct,
    reconstructedProduct: facts.reconstructedProduct,
    answerRole,
    candidateOnly: true,
    publicCutoverApproved: false,
    canonicalKnowledgePointMinted: false,
    missingDigitInferenceUsed: false,
    applicationPromptUsed: false,
    relationPromptUsed: false,
    relatedProductCompensationUsed: false,
    multiStepApplicationUsed: false,
  };
}

function slotCompletionItem(leftFactor, rightFactor, forcedMissingSlot = null) {
  const familyId = "C2_PARTIAL_PRODUCT_SLOT_COMPLETION";
  const facts = partialProductFacts(leftFactor, rightFactor);
  const missingSlot = forcedMissingSlot ?? (
    hashSeed(`${leftFactor}:${rightFactor}:slot`) % 2 === 0
      ? "TENS_PARTIAL_PRODUCT"
      : "ONES_PARTIAL_PRODUCT"
  );
  const expectedSlotValue = missingSlot === "TENS_PARTIAL_PRODUCT"
    ? facts.tensPartialProduct
    : facts.onesPartialProduct;
  const prompt = missingSlot === "TENS_PARTIAL_PRODUCT"
    ? `${leftFactor} × ${rightFactor}：${leftFactor} × ${facts.tensFactor} = ______；${leftFactor} × ${facts.onesFactor} = ${facts.onesPartialProduct}；最後乘積 = ${facts.product}`
    : `${leftFactor} × ${rightFactor}：${leftFactor} × ${facts.tensFactor} = ${facts.tensPartialProduct}；${leftFactor} × ${facts.onesFactor} = ______；最後乘積 = ${facts.product}`;
  return Object.freeze({
    generatedItemId: `path1-p1-03-candidate-${familyId}-${leftFactor}-${rightFactor}-${missingSlot}`,
    prompt,
    answerText: String(expectedSlotValue),
    mode: "numeric",
    operationFamilyId: "PATH1_TWO_DIGIT_BY_TWO_DIGIT_ASSESSMENT_CANDIDATE",
    sourceNodeId: PATH1_P1_03_SOURCE_ID,
    knowledgePointId: PATH1_P1_03_KNOWLEDGE_POINT_ID,
    metadata: Object.freeze({
      ...baseMetadata(familyId, facts, "partialProduct"),
      assessmentIntent: "PARTIAL_PRODUCT_SLOT_COMPLETION",
      missingSlot,
      expectedSlotValue,
      tensPartialProductIncludesPlaceShift: true,
    }),
  });
}

function expressionOptions(leftFactor, rightFactor) {
  const facts = partialProductFacts(leftFactor, rightFactor);
  const options = [
    {
      expression: `${leftFactor} × ${facts.tensFactor} + ${leftFactor} × ${facts.onesFactor}`,
      value: facts.product,
      isCorrect: true,
    },
    {
      expression: `${leftFactor} × ${facts.tensDigit} + ${leftFactor} × ${facts.onesFactor}`,
      value: leftFactor * facts.tensDigit + leftFactor * facts.onesFactor,
      isCorrect: false,
    },
    {
      expression: `${leftFactor} × ${facts.tensFactor} + ${leftFactor} × ${facts.onesFactor - 1}`,
      value: facts.product - leftFactor,
      isCorrect: false,
    },
    {
      expression: `${leftFactor} × ${facts.tensFactor - 10} + ${leftFactor} × ${facts.onesFactor}`,
      value: facts.product - leftFactor * 10,
      isCorrect: false,
    },
  ];
  const shuffled = seededShuffle(options, `${leftFactor}:${rightFactor}:equivalent-options`);
  return shuffled.map((option, index) => Object.freeze({
    label: ["A", "B", "C", "D"][index],
    ...option,
  }));
}

function equivalentExpressionItem(leftFactor, rightFactor) {
  const familyId = "C3_EQUIVALENT_PARTIAL_PRODUCT_EXPRESSION";
  const facts = partialProductFacts(leftFactor, rightFactor);
  const options = expressionOptions(leftFactor, rightFactor);
  const correct = options.find((option) => option.isCorrect);
  const optionText = options.map((option) => `${option.label}. ${option.expression}`).join("；");
  return Object.freeze({
    generatedItemId: `path1-p1-03-candidate-${familyId}-${leftFactor}-${rightFactor}`,
    prompt: `選出與 ${leftFactor} × ${rightFactor} 等值，且正確呈現十位與個位部分積的算式：${optionText}`,
    answerText: correct.label,
    mode: "choice",
    operationFamilyId: "PATH1_TWO_DIGIT_BY_TWO_DIGIT_ASSESSMENT_CANDIDATE",
    sourceNodeId: PATH1_P1_03_SOURCE_ID,
    knowledgePointId: PATH1_P1_03_KNOWLEDGE_POINT_ID,
    metadata: Object.freeze({
      ...baseMetadata(familyId, facts, "equivalentExpressionChoice"),
      assessmentIntent: "EQUIVALENT_PARTIAL_PRODUCT_EXPRESSION",
      optionExpressions: Object.freeze(options.map((option) => option.expression)),
      optionValues: Object.freeze(options.map((option) => option.value)),
      correctOptionLabel: correct.label,
      correctExpression: correct.expression,
      tensPartialProductIncludesPlaceShift: true,
    }),
  });
}

function alignmentChoices(leftFactor, rightFactor, forcedCorrectLabel = null) {
  const facts = partialProductFacts(leftFactor, rightFactor);
  const correct = {
    text: `十位部分積用 ${leftFactor} × ${facts.tensFactor} = ${facts.tensPartialProduct}，並從十位位置開始對齊`,
    isCorrect: true,
  };
  const wrong = {
    text: `十位部分積只算 ${leftFactor} × ${facts.tensDigit} = ${leftFactor * facts.tensDigit}，並從個位位置開始對齊`,
    isCorrect: false,
  };
  const correctFirst = forcedCorrectLabel === "甲"
    ? true
    : forcedCorrectLabel === "乙"
      ? false
      : hashSeed(`${leftFactor}:${rightFactor}:alignment`) % 2 === 0;
  const ordered = correctFirst ? [correct, wrong] : [wrong, correct];
  return ordered.map((choice, index) => Object.freeze({
    label: index === 0 ? "甲" : "乙",
    ...choice,
  }));
}

function alignmentJudgementItem(leftFactor, rightFactor, forcedCorrectLabel = null) {
  const familyId = "C4_TENS_PARTIAL_PRODUCT_ALIGNMENT_JUDGEMENT";
  const facts = partialProductFacts(leftFactor, rightFactor);
  const choices = alignmentChoices(leftFactor, rightFactor, forcedCorrectLabel);
  const correct = choices.find((choice) => choice.isCorrect);
  return Object.freeze({
    generatedItemId: `path1-p1-03-candidate-${familyId}-${leftFactor}-${rightFactor}-${correct.label}`,
    prompt: `${leftFactor} × ${rightFactor} 的十位部分積，哪個作法正確？甲：${choices[0].text}；乙：${choices[1].text}`,
    answerText: correct.label,
    mode: "choice",
    operationFamilyId: "PATH1_TWO_DIGIT_BY_TWO_DIGIT_ASSESSMENT_CANDIDATE",
    sourceNodeId: PATH1_P1_03_SOURCE_ID,
    knowledgePointId: PATH1_P1_03_KNOWLEDGE_POINT_ID,
    metadata: Object.freeze({
      ...baseMetadata(familyId, facts, "alignmentJudgement"),
      assessmentIntent: "TENS_PARTIAL_PRODUCT_ALIGNMENT_JUDGEMENT",
      alignmentChoiceTexts: Object.freeze(choices.map((choice) => choice.text)),
      correctChoiceLabel: correct.label,
      tensPartialProductIncludesPlaceShift: true,
    }),
  });
}

const FAMILY_BUILDERS = new Map([
  ["C2_PARTIAL_PRODUCT_SLOT_COMPLETION", slotCompletionItem],
  ["C3_EQUIVALENT_PARTIAL_PRODUCT_EXPRESSION", equivalentExpressionItem],
  ["C4_TENS_PARTIAL_PRODUCT_ALIGNMENT_JUDGEMENT", alignmentJudgementItem],
]);

function operandPairs() {
  const pairs = [];
  for (let leftFactor = 11; leftFactor <= 99; leftFactor += 1) {
    if (!nonZeroTwoDigit(leftFactor)) continue;
    for (let rightFactor = 11; rightFactor <= 99; rightFactor += 1) {
      if (!scopedOperands(leftFactor, rightFactor)) continue;
      pairs.push(Object.freeze({ leftFactor, rightFactor }));
    }
  }
  return Object.freeze(pairs);
}

const OPERAND_PAIRS = operandPairs();
const FAMILY_POOLS = new Map(PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.map(({ familyId }) => [
  familyId,
  Object.freeze(OPERAND_PAIRS.map(({ leftFactor, rightFactor }) => (
    FAMILY_BUILDERS.get(familyId)(leftFactor, rightFactor)
  ))),
]));

const ALL_PROMPTS = [...FAMILY_POOLS.values()].flat().map((entry) => entry.prompt);
export const PATH1_P1_03_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY =
  new Set(ALL_PROMPTS).size;

export function validatePath1P103AssessmentFamilyCandidate(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const familyId = metadata.path1PatternFamilyId;
  const leftFactor = Number(metadata.leftFactor);
  const rightFactor = Number(metadata.rightFactor);
  const facts = partialProductFacts(leftFactor, rightFactor);

  if (!PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.some((family) => family.familyId === familyId)) errors.push("UNKNOWN_CANDIDATE_FAMILY");
  if (entry?.knowledgePointId !== PATH1_P1_03_KNOWLEDGE_POINT_ID) errors.push("KP_ID_MISMATCH");
  if (metadata.canonicalKnowledgePointId !== PATH1_P1_03_KNOWLEDGE_POINT_ID) errors.push("CANONICAL_KP_METADATA_MISMATCH");
  if (!scopedOperands(leftFactor, rightFactor)) errors.push("OPERAND_OUT_OF_P1_03_SCOPE");
  if (metadata.product !== facts.product) errors.push("PRODUCT_INVARIANT_FAILED");
  if (metadata.tensPartialProduct !== facts.tensPartialProduct) errors.push("TENS_PARTIAL_PRODUCT_FAILED");
  if (metadata.onesPartialProduct !== facts.onesPartialProduct) errors.push("ONES_PARTIAL_PRODUCT_FAILED");
  if (metadata.reconstructedProduct !== facts.product) errors.push("RECONSTRUCTED_PRODUCT_FAILED");
  if (metadata.candidateOnly !== true || metadata.publicCutoverApproved !== false) errors.push("CANDIDATE_CUTOVER_SCOPE_LEAK");
  if (metadata.canonicalKnowledgePointMinted !== false) errors.push("CANONICAL_KP_MINTED");
  if (metadata.missingDigitInferenceUsed !== false) errors.push("MISSING_DIGIT_SCOPE_LEAK");
  if (metadata.applicationPromptUsed !== false) errors.push("APPLICATION_SCOPE_LEAK");
  if (metadata.relationPromptUsed !== false) errors.push("RELATION_SCOPE_LEAK");
  if (metadata.relatedProductCompensationUsed !== false) errors.push("COMPENSATION_SCOPE_LEAK");
  if (metadata.multiStepApplicationUsed !== false) errors.push("MULTI_STEP_SCOPE_LEAK");
  if (!String(metadata.primarySourceEvidence ?? "").includes("batchA_02-題型總覽-4a02-整數的乘法.pdf")) errors.push("PRIMARY_SOURCE_EVIDENCE_MISSING");
  if (!String(metadata.sourceEvidence ?? "").includes("ps_g4a_u02_2digit_by_2digit")) errors.push("PATTERN_SOURCE_EVIDENCE_MISSING");
  if (!String(entry?.prompt ?? "").trim()) errors.push("PROMPT_EMPTY");
  if (!String(entry?.answerText ?? "").trim()) errors.push("ANSWER_EMPTY");

  if (familyId === "C2_PARTIAL_PRODUCT_SLOT_COMPLETION") {
    if (entry?.mode !== "numeric") errors.push("C2_MODE_MISMATCH");
    if (metadata.answerRole !== "partialProduct") errors.push("C2_ANSWER_ROLE_MISMATCH");
    const expected = metadata.missingSlot === "TENS_PARTIAL_PRODUCT"
      ? facts.tensPartialProduct
      : metadata.missingSlot === "ONES_PARTIAL_PRODUCT"
        ? facts.onesPartialProduct
        : null;
    if (expected === null) errors.push("C2_UNKNOWN_MISSING_SLOT");
    if (metadata.expectedSlotValue !== expected) errors.push("C2_EXPECTED_SLOT_MISMATCH");
    if (entry?.answerText !== String(expected)) errors.push("C2_ANSWER_MISMATCH");
    if (metadata.tensPartialProductIncludesPlaceShift !== true) errors.push("C2_TENS_PLACE_SHIFT_MISSING");
  } else if (familyId === "C3_EQUIVALENT_PARTIAL_PRODUCT_EXPRESSION") {
    if (entry?.mode !== "choice") errors.push("C3_MODE_MISMATCH");
    if (metadata.answerRole !== "equivalentExpressionChoice") errors.push("C3_ANSWER_ROLE_MISMATCH");
    if (!Array.isArray(metadata.optionValues) || metadata.optionValues.length !== 4) errors.push("C3_OPTION_COUNT_MISMATCH");
    if ((metadata.optionValues ?? []).filter((value) => value === facts.product).length !== 1) errors.push("C3_CORRECT_OPTION_NOT_UNIQUE");
    if (!Array.isArray(metadata.optionExpressions) || metadata.optionExpressions.length !== 4) errors.push("C3_EXPRESSION_COUNT_MISMATCH");
    if (!metadata.optionExpressions?.includes(metadata.correctExpression)) errors.push("C3_CORRECT_EXPRESSION_MISSING");
    if (entry?.answerText !== metadata.correctOptionLabel) errors.push("C3_ANSWER_MISMATCH");
    if (metadata.tensPartialProductIncludesPlaceShift !== true) errors.push("C3_TENS_PLACE_SHIFT_MISSING");
  } else if (familyId === "C4_TENS_PARTIAL_PRODUCT_ALIGNMENT_JUDGEMENT") {
    if (entry?.mode !== "choice") errors.push("C4_MODE_MISMATCH");
    if (metadata.answerRole !== "alignmentJudgement") errors.push("C4_ANSWER_ROLE_MISMATCH");
    if (!Array.isArray(metadata.alignmentChoiceTexts) || metadata.alignmentChoiceTexts.length !== 2) errors.push("C4_CHOICE_COUNT_MISMATCH");
    if (!["甲", "乙"].includes(metadata.correctChoiceLabel)) errors.push("C4_CORRECT_LABEL_INVALID");
    if (entry?.answerText !== metadata.correctChoiceLabel) errors.push("C4_ANSWER_MISMATCH");
    if (metadata.tensPartialProductIncludesPlaceShift !== true) errors.push("C4_TENS_PLACE_SHIFT_MISSING");
    if (!String(metadata.assessmentEvidence ?? "").includes("ASSESSMENT_FORMAT_ONLY")) errors.push("C4_ASSESSMENT_FORMAT_EVIDENCE_MISSING");
  }

  return { ok: errors.length === 0, errors };
}

function rebalanceFamilySubvariants(familyId, items) {
  if (familyId === "C2_PARTIAL_PRODUCT_SLOT_COMPLETION") {
    return items.map((entry, index) => slotCompletionItem(
      entry.metadata.leftFactor,
      entry.metadata.rightFactor,
      index % 2 === 0 ? "TENS_PARTIAL_PRODUCT" : "ONES_PARTIAL_PRODUCT",
    ));
  }
  if (familyId === "C4_TENS_PARTIAL_PRODUCT_ALIGNMENT_JUDGEMENT") {
    return items.map((entry, index) => alignmentJudgementItem(
      entry.metadata.leftFactor,
      entry.metadata.rightFactor,
      index % 2 === 0 ? "甲" : "乙",
    ));
  }
  return items;
}

export function buildPath1P103AssessmentFamilyCandidates({
  count = 20,
  seed = "path1-p1-03-assessment-candidates-v2",
} = {}) {
  const requested = Math.max(1, Math.min(120, Number(count) || 20));
  const familyCounts = allocateCounts(
    requested,
    PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.length,
    `${seed}:families`,
  );
  const selected = [];

  for (let index = 0; index < PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.length; index += 1) {
    const familyId = PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES[index].familyId;
    const needed = familyCounts[index];
    const pool = FAMILY_POOLS.get(familyId) ?? [];
    if (pool.length < needed) {
      return {
        ok: false,
        items: [],
        errors: [{ code: "PATH1_P1_03_ASSESSMENT_CANDIDATE_CAPACITY_FAILED", familyId, requested: needed, available: pool.length }],
      };
    }
    const sampled = seededShuffle(pool, `${seed}:${familyId}`).slice(0, needed);
    selected.push(...rebalanceFamilySubvariants(familyId, sampled));
  }

  const items = seededShuffle(selected, `${seed}:cross-family`);
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P103AssessmentFamilyCandidate(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_03_ASSESSMENT_CANDIDATE_VALIDATION_FAILED", failures: validationFailures }],
    };
  }

  const duplicatePrompts = items.length - new Set(items.map((entry) => entry.prompt)).size;
  if (duplicatePrompts !== 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_03_ASSESSMENT_CANDIDATE_DUPLICATE_PROMPT", duplicatePrompts }],
    };
  }

  return {
    ok: true,
    items,
    errors: [],
    summary: {
      requested,
      generated: items.length,
      candidateFamilyCount: PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.length,
      distinctPromptCapacity: PATH1_P1_03_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY,
      publicCutoverApproved: false,
      familyCounts: Object.fromEntries(PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.map(({ familyId }) => [
        familyId,
        items.filter((entry) => entry.metadata.path1PatternFamilyId === familyId).length,
      ])),
      knowledgePointCounts: {
        [PATH1_P1_03_KNOWLEDGE_POINT_ID]: items.length,
      },
    },
  };
}
