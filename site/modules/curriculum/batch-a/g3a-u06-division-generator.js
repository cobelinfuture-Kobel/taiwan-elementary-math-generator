import { OPERATORS } from "../../core/constants.js";
import { buildDuplicateKey } from "../../core/generate-expression.js";
import { createBinaryNode, createGeneratedQuestionSkeleton, createValueNode } from "../../core/expression-model.js";
import { createIntegerValue } from "../../core/number-value.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as baseGenerateBatchABrowserQuestions } from "./g3a-u03-quality-generator.js";
import { makeDivisionWithRemainderQuestion } from "./g3a-u06-remainder-generator.js";
import { makeQuotativeDivisionPackagingQuestion, makePartitiveDivisionEqualSharingQuestion } from "./g3a-u06-word-problem-generator.js";
import { makeParityRangeMissingDigitQuestion } from "./g3a-u06-parity-generator.js";

const sourceId = "g3a_u06_3a06";
const exactSpecId = "ps_g3a_u06_exact_division_check";
const divisibilitySpecId = "ps_g3a_u06_divisibility_exact_check";
const remainderSpecId = "ps_g3a_u06_division_with_remainder";
const packagingSpecId = "ps_g3a_u06_quotative_division_packaging";
const sharingSpecId = "ps_g3a_u06_partitive_division_equal_sharing";
const paritySpecId = "ps_g3a_u06_parity_range_missing_digit";
const u06SpecIds = Object.freeze([exactSpecId, divisibilitySpecId, remainderSpecId, packagingSpecId, sharingSpecId, paritySpecId]);

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

function metadata(patternSpecId, extraSkillTags = [], extraDifficultyTags = []) {
  return {
    patternId: patternSpecId,
    sourceId,
    patternTags: ["batch_a", "browser_bridge", sourceId, patternSpecId],
    skillTags: ["integer_division_exact", ...extraSkillTags],
    difficultyTags: ["batch_a_browser_bridge", ...extraDifficultyTags],
    curriculumNodeIds: [sourceId],
    canonicalSkillIds: ["integer_division_exact"],
    precedenceMode: "left_to_right",
    parenthesesMode: "none"
  };
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

function makeExactDivisionQuestion(sequenceNumber, seed) {
  const { dividend, divisor, quotient } = exactDivisionOperands(sequenceNumber, seed, 10, 99);
  const expression = expressionFromOperands(dividend, divisor);
  const answerValue = createIntegerValue(quotient);
  const question = createGeneratedQuestionSkeleton({ id: `${exactSpecId}-${sequenceNumber}`, expression, operandCount: 2, operatorsUsed: [OPERATORS.DIVIDE], finalAnswer: answerValue, intermediateResults: [answerValue], blankTarget: { type: "finalAnswer" }, duplicateKey: buildDuplicateKey(expression), metadata: metadata(exactSpecId, ["two_digit", "one_digit", "exact_division"], ["two_digit_division_exact"]) });
  question.patternSpecId = exactSpecId;
  question.sourceId = sourceId;
  question.metadata = { ...question.metadata, sourceId };
  question.dividend = dividend;
  question.divisor = divisor;
  question.quotient = quotient;
  return question;
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
  return question.duplicateKey ?? `${question.patternSpecId}:${question.displayText ?? question.id}`;
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

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!isU06DivisionPlan(plan)) return baseGenerateBatchABrowserQuestions(options);
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const seen = new Set();
  const errors = [];
  for (const entry of allocation) {
    if (!u06SpecIds.includes(entry.patternSpecId)) return baseGenerateBatchABrowserQuestions(options);
    let acceptedForPattern = 0;
    let attempts = 0;
    while (acceptedForPattern < entry.questionCount && attempts < entry.questionCount * 80) {
      const shouldBeDivisible = entry.patternSpecId === divisibilitySpecId ? acceptedForPattern % 2 === 0 : null;
      const sequenceNumber = attempts + 1;
      const question = generateU06Question(entry.patternSpecId, sequenceNumber, plan.generationSeed ?? options.generationSeed, { shouldBeDivisible });
      const key = questionKey(question);
      if (question && !seen.has(key)) {
        seen.add(key);
        questions.push(question);
        acceptedForPattern += 1;
      }
      attempts += 1;
    }
    if (acceptedForPattern < entry.questionCount) errors.push({ code: "batch_a_g3a_u06_unique_pool_exhausted", severity: "error", path: entry.patternSpecId, message: "G3A-U06 unique division question pool exhausted" });
  }
  return { ok: errors.length === 0, plan, questions, allocation, errors, warnings: [] };
}
