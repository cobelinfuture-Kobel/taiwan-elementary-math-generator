import { OPERATORS } from "../../core/constants.js";
import { buildDuplicateKey } from "../../core/generate-expression.js";
import { createBinaryNode, createGeneratedQuestionSkeleton, createValueNode } from "../../core/expression-model.js";
import { createIntegerValue } from "../../core/number-value.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as baseGenerateBatchABrowserQuestions } from "./g3a-u03-quality-generator.js";
import { makeDivisionWithRemainderQuestion } from "./g3a-u06-remainder-generator.js";
import { makeQuotativeDivisionPackagingQuestion, makePartitiveDivisionEqualSharingQuestion } from "./g3a-u06-word-problem-generator.js";
import { makeParityRangeMissingDigitQuestion } from "./g3a-u06-parity-generator.js";
import { canGenerateG3BU01BatchAQuestions, generateBatchABrowserQuestions as generateG3BU01BatchABrowserQuestions } from "./g3b-u01-division-generator.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-submiddle-extension.js";

const sourceId = "g3a_u06_3a06";
const exactSpecId = "ps_g3a_u06_exact_division_check";
const divisibilitySpecId = "ps_g3a_u06_divisibility_exact_check";
const remainderSpecId = "ps_g3a_u06_division_with_remainder";
const packagingSpecId = "ps_g3a_u06_quotative_division_packaging";
const sharingSpecId = "ps_g3a_u06_partitive_division_equal_sharing";
const paritySpecId = "ps_g3a_u06_parity_range_missing_digit";
const u06SpecIds = Object.freeze([exactSpecId, divisibilitySpecId, remainderSpecId, packagingSpecId, sharingSpecId, paritySpecId]);

const g3bU01SourceId = "g3b_u01_3b01";
const g3bU01ThreeDigitSpecId = "ps_g3b_u01_3digit_by_1digit_regroup_hundreds";
const g3bU01TwoDigitSpecId = "ps_g3b_u01_2digit_by_1digit_regroup_tens";
const g3bU01SpecIds = Object.freeze([g3bU01ThreeDigitSpecId, g3bU01TwoDigitSpecId]);

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) {
    acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  }
  return acc || 1;
}

function allocateCounts(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const questionCountForPattern = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: questionCountForPattern };
  }).filter((entry) => entry.questionCount > 0);
}

function isU06DivisionPlan(plan) {
  return plan?.sourceId === sourceId && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.every((id) => u06SpecIds.includes(id));
}

function isG3BU01DivisionPlan(plan) {
  return plan?.sourceId === g3bU01SourceId && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.every((id) => g3bU01SpecIds.includes(id));
}

function metadataFor(patternSpecId, targetSourceId, canonicalSkillId = "integer_division_exact", extraSkillTags = [], extraDifficultyTags = []) {
  return {
    patternId: patternSpecId,
    sourceId: targetSourceId,
    patternTags: ["batch_a", "browser_bridge", targetSourceId, patternSpecId],
    skillTags: [canonicalSkillId, ...extraSkillTags],
    difficultyTags: ["batch_a_browser_bridge", ...extraDifficultyTags],
    curriculumNodeIds: [targetSourceId],
    canonicalSkillIds: [canonicalSkillId],
    precedenceMode: "left_to_right",
    parenthesesMode: "none"
  };
}

function metadata(patternSpecId, extraSkillTags = [], extraDifficultyTags = []) {
  return metadataFor(patternSpecId, sourceId, "integer_division_exact", extraSkillTags, extraDifficultyTags);
}

function quotientForDividendRange(divisor, minDividend, maxDividend) {
  const minQuotient = Math.ceil(minDividend / divisor);
  const maxQuotient = Math.floor(maxDividend / divisor);
  return { minQuotient, maxQuotient };
}

function exactDivisionOperands(sequenceNumber, seed, minDividend = 10, maxDividend = 99) {
  const seedValue = hashSeed(`${seed}:exact:${sequenceNumber}`);
  const divisor = 2 + (seedValue % 8);
  const { minQuotient, maxQuotient } = quotientForDividendRange(divisor, minDividend, maxDividend);
  const quotientSpan = maxQuotient - minQuotient + 1;
  const quotient = minQuotient + (Math.floor(seedValue / 11) % quotientSpan);
  return { dividend: divisor * quotient, divisor, quotient };
}

function expressionFromOperands(dividend, divisor) {
  return createBinaryNode(OPERATORS.DIVIDE, createValueNode(createIntegerValue(dividend), 1), createValueNode(createIntegerValue(divisor), 2), { groupingHint: "leftAssociative" });
}

function makeExactDivisionQuestionFor({ patternSpecId, targetSourceId, sequenceNumber, seed, minDividend, maxDividend, skillTags, difficultyTags }) {
  const { dividend, divisor, quotient } = exactDivisionOperands(sequenceNumber, `${targetSourceId}:${patternSpecId}:${seed}`, minDividend, maxDividend);
  const expression = expressionFromOperands(dividend, divisor);
  const answerValue = createIntegerValue(quotient);
  const question = createGeneratedQuestionSkeleton({
    id: `${patternSpecId}-${sequenceNumber}`,
    expression,
    operandCount: 2,
    operatorsUsed: [OPERATORS.DIVIDE],
    finalAnswer: answerValue,
    intermediateResults: [answerValue],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: buildDuplicateKey(expression),
    metadata: metadataFor(patternSpecId, targetSourceId, "integer_division_exact", skillTags, difficultyTags)
  });
  question.patternSpecId = patternSpecId;
  question.sourceId = targetSourceId;
  question.metadata = { ...question.metadata, sourceId: targetSourceId };
  question.dividend = dividend;
  question.divisor = divisor;
  question.quotient = quotient;
  return question;
}

function makeExactDivisionQuestion(sequenceNumber, seed) {
  return makeExactDivisionQuestionFor({
    patternSpecId: exactSpecId,
    targetSourceId: sourceId,
    sequenceNumber,
    seed,
    minDividend: 10,
    maxDividend: 99,
    skillTags: ["two_digit", "one_digit", "exact_division"],
    difficultyTags: ["two_digit_division_exact"]
  });
}

function makeG3BU01Question(patternSpecId, sequenceNumber, seed) {
  if (patternSpecId === g3bU01ThreeDigitSpecId) {
    return makeExactDivisionQuestionFor({
      patternSpecId,
      targetSourceId: g3bU01SourceId,
      sequenceNumber,
      seed,
      minDividend: 100,
      maxDividend: 999,
      skillTags: ["three_digit", "one_digit", "exact_division"],
      difficultyTags: ["three_digit_division_exact"]
    });
  }
  if (patternSpecId === g3bU01TwoDigitSpecId) {
    return makeExactDivisionQuestionFor({
      patternSpecId,
      targetSourceId: g3bU01SourceId,
      sequenceNumber,
      seed,
      minDividend: 10,
      maxDividend: 99,
      skillTags: ["two_digit", "one_digit", "exact_division", "regroup_tens"],
      difficultyTags: ["two_digit_division_exact"]
    });
  }
  return null;
}

function nonDivisibleDividend(divisor, seedValue, minDividend = 20, maxDividend = 99) {
  const span = maxDividend - minDividend + 1;
  const start = minDividend + (Math.floor(seedValue / 17) % span);
  for (let offset = 0; offset < span; offset += 1) {
    const candidate = minDividend + ((start - minDividend + offset) % span);
    if (candidate % divisor !== 0) return candidate;
  }
  return minDividend + 1;
}

function divisibilityOperands(sequenceNumber, seed, shouldBeDivisible) {
  const target = shouldBeDivisible ? "yes" : "no";
  const seedValue = hashSeed(`${seed}:divisibility:${target}:${sequenceNumber}`);
  const divisor = 2 + (seedValue % 8);
  let dividend;
  if (shouldBeDivisible) {
    const { minQuotient, maxQuotient } = quotientForDividendRange(divisor, 20, 99);
    const quotient = minQuotient + (Math.floor(seedValue / 13) % (maxQuotient - minQuotient + 1));
    dividend = divisor * quotient;
  } else {
    dividend = nonDivisibleDividend(divisor, seedValue, 20, 99);
  }
  return { dividend, divisor, quotient: Math.floor(dividend / divisor), remainder: dividend % divisor, isDivisible: dividend % divisor === 0 };
}

function makeDivisibilityQuestion(sequenceNumber, seed, shouldBeDivisible) {
  const model = divisibilityOperands(sequenceNumber, seed, shouldBeDivisible);
  const answerText = model.isDivisible ? "可以" : "不可以";
  return { id: `${divisibilitySpecId}-${sequenceNumber}-${shouldBeDivisible ? "yes" : "no"}`, patternSpecId: divisibilitySpecId, sourceId, kind: "divisibilityCheck", dividend: model.dividend, divisor: model.divisor, quotient: model.quotient, remainder: model.remainder, isDivisible: model.isDivisible, promptText: `${model.dividend} ÷ ${model.divisor} 可以整除嗎？`, displayText: `${model.dividend} ÷ ${model.divisor} 可以整除嗎？${answerText}`, blankedDisplayText: `${model.dividend} ÷ ${model.divisor} 可以整除嗎？____`, answerText, finalAnswer: createIntegerValue(model.isDivisible ? 1 : 0), metadata: metadata(divisibilitySpecId, ["divisibility", "exact_division", "check"], ["divisibility_check"]) };
}

function questionKey(question) {
  if (question.kind === "divisibilityCheck") return question.blankedDisplayText;
  return question.duplicateKey ?? `${question.patternSpecId}:${question.blankedDisplayText ?? question.displayText ?? question.id}`;
}

function generateU06Question(patternSpecId, sequenceNumber, seed, options = {}) {
  if (patternSpecId === exactSpecId) return makeExactDivisionQuestion(sequenceNumber, seed);
  if (patternSpecId === divisibilitySpecId) return makeDivisibilityQuestion(sequenceNumber, seed, options.shouldBeDivisible === true);
  if (patternSpecId === remainderSpecId) return makeDivisionWithRemainderQuestion(sequenceNumber);
  if (patternSpecId === packagingSpecId) return makeQuotativeDivisionPackagingQuestion(sequenceNumber);
  if (patternSpecId === sharingSpecId) return makePartitiveDivisionEqualSharingQuestion(sequenceNumber);
  if (patternSpecId === paritySpecId) return makeParityRangeMissingDigitQuestion(sequenceNumber);
  return null;
}

function labelForPattern(patternSpecId) {
  return getBatchABrowserPatternDefinition(patternSpecId)?.title ?? patternSpecId;
}

function shouldBeDivisibleFor(patternSpecId, sequenceNumber) {
  return patternSpecId === divisibilitySpecId ? sequenceNumber % 2 === 1 : null;
}

function warningForShortfall(entry, acceptedForPattern) {
  const missing = Math.max(0, entry.questionCount - acceptedForPattern);
  return {
    code: "batch_a_pattern_pool_fallback",
    severity: "warning",
    path: entry.patternSpecId,
    message: `知識點/題型「${labelForPattern(entry.patternSpecId)}」可用題庫不足：要求 ${entry.questionCount} 題，目前只產生 ${acceptedForPattern} 題；系統會改由同單元其他知識點補足 ${missing} 題。`
  };
}

function allocationFromQuestions(questions, originalAllocation) {
  const counts = new Map();
  for (const question of questions) counts.set(question.patternSpecId, (counts.get(question.patternSpecId) ?? 0) + 1);
  return [...counts.entries()].map(([patternSpecId, questionCount]) => {
    const original = originalAllocation.find((entry) => entry.patternSpecId === patternSpecId);
    return original?.patternGroupId ? { patternSpecId, patternGroupId: original.patternGroupId, questionCount } : { patternSpecId, questionCount };
  });
}

function acceptCandidate({ patternSpecId, sequenceNumber, plan, options, makeQuestion, seen, questions }) {
  const shouldBeDivisible = shouldBeDivisibleFor(patternSpecId, sequenceNumber);
  const question = makeQuestion(patternSpecId, sequenceNumber, plan.generationSeed ?? options.generationSeed, { shouldBeDivisible });
  const key = question ? questionKey(question) : null;
  if (!question || seen.has(key)) return false;
  seen.add(key);
  questions.push(question);
  return true;
}

function generatePlannedDivisionQuestions({ plan, allocation, patternSpecIds, makeQuestion, errorCode, errorMessage, options }) {
  const questions = [];
  const seen = new Set();
  const errors = [];
  const warnings = [];
  const shortfalls = [];
  const nextSequenceByPattern = new Map(patternSpecIds.map((patternSpecId) => [patternSpecId, 1]));

  for (const entry of allocation) {
    if (!patternSpecIds.includes(entry.patternSpecId)) return baseGenerateBatchABrowserQuestions(options);
    let acceptedForPattern = 0;
    let attempts = 0;
    const maxAttempts = Math.max(80, entry.questionCount * 80);
    while (acceptedForPattern < entry.questionCount && attempts < maxAttempts) {
      const sequenceNumber = nextSequenceByPattern.get(entry.patternSpecId) ?? 1;
      nextSequenceByPattern.set(entry.patternSpecId, sequenceNumber + 1);
      if (acceptCandidate({ patternSpecId: entry.patternSpecId, sequenceNumber, plan, options, makeQuestion, seen, questions })) {
        acceptedForPattern += 1;
      }
      attempts += 1;
    }
    if (acceptedForPattern < entry.questionCount) {
      shortfalls.push({ entry, acceptedForPattern, missing: entry.questionCount - acceptedForPattern });
      warnings.push(warningForShortfall(entry, acceptedForPattern));
    }
  }

  const targetQuestionCount = Number.isInteger(plan.questionCount) ? plan.questionCount : questions.length;
  let fallbackAttempts = 0;
  const fallbackAttemptLimit = Math.max(240, targetQuestionCount * patternSpecIds.length * 120);
  while (questions.length < targetQuestionCount && fallbackAttempts < fallbackAttemptLimit) {
    const patternSpecId = patternSpecIds[fallbackAttempts % patternSpecIds.length];
    const sequenceNumber = nextSequenceByPattern.get(patternSpecId) ?? 1;
    nextSequenceByPattern.set(patternSpecId, sequenceNumber + 1);
    acceptCandidate({ patternSpecId, sequenceNumber, plan, options, makeQuestion, seen, questions });
    fallbackAttempts += 1;
  }

  if (questions.length < targetQuestionCount) {
    const shortfallText = shortfalls.length > 0
      ? shortfalls.map((item) => `「${labelForPattern(item.entry.patternSpecId)}」要求 ${item.entry.questionCount} 題，只產生 ${item.acceptedForPattern} 題`).join("；")
      : "沒有單一題型回報短缺，但總題數仍未補滿";
    errors.push({
      code: errorCode,
      severity: "error",
      path: "questionCount",
      message: `${errorMessage}；同單元其他知識點補題後仍缺 ${targetQuestionCount - questions.length} 題。庫池不足明細：${shortfallText}`
    });
  }

  return { ok: errors.length === 0, plan, questions, allocation: allocationFromQuestions(questions, allocation), errors, warnings };
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG3BU01BatchAQuestions(plan)) return generateG3BU01BatchABrowserQuestions(options);
  if (isG3BU01DivisionPlan(plan)) {
    const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
    return generatePlannedDivisionQuestions({
      plan,
      allocation,
      patternSpecIds: g3bU01SpecIds,
      makeQuestion: makeG3BU01Question,
      errorCode: "batch_a_g3b_u01_unique_pool_exhausted",
      errorMessage: "G3B-U01 division question pool exhausted",
      options
    });
  }

  if (!isU06DivisionPlan(plan)) return baseGenerateBatchABrowserQuestions(options);
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
  return generatePlannedDivisionQuestions({
    plan,
    allocation,
    patternSpecIds: u06SpecIds,
    makeQuestion: generateU06Question,
    errorCode: "batch_a_g3a_u06_unique_pool_exhausted",
    errorMessage: "G3A-U06 division question pool exhausted",
    options
  });
}
