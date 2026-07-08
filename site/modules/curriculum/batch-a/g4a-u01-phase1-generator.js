import { OPERATORS } from "../../core/constants.js";
import { buildDuplicateKey } from "../../core/generate-expression.js";
import { createBinaryNode, createGeneratedQuestionSkeleton, createValueNode } from "../../core/expression-model.js";
import { createIntegerValue } from "../../core/number-value.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";

export const G4A_U01_SOURCE_ID = "g4a_u01_4a01";
export const G4A_U01_PHASE1_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u01_compare_8digit",
  "ps_g4a_u01_within_100million_compare",
  "ps_g4a_u01_large_number_add_sub",
  "ps_g4a_u01_8digit_place_value_decomposition",
  "ps_g4a_u01_place_value_composition_to_number",
  "ps_g4a_u01_same_digit_place_value_difference"
]);

const compare8SpecId = "ps_g4a_u01_compare_8digit";
const compare100mSpecId = "ps_g4a_u01_within_100million_compare";
const addSubSpecId = "ps_g4a_u01_large_number_add_sub";
const decompositionSpecId = "ps_g4a_u01_8digit_place_value_decomposition";
const compositionSpecId = "ps_g4a_u01_place_value_composition_to_number";
const sameDigitDifferenceSpecId = "ps_g4a_u01_same_digit_place_value_difference";

const PLACE_UNITS = Object.freeze([
  Object.freeze({ key: "tenMillions", label: "千萬", unit: 10000000 }),
  Object.freeze({ key: "millions", label: "百萬", unit: 1000000 }),
  Object.freeze({ key: "hundredThousands", label: "十萬", unit: 100000 }),
  Object.freeze({ key: "tenThousands", label: "萬", unit: 10000 }),
  Object.freeze({ key: "thousands", label: "千", unit: 1000 }),
  Object.freeze({ key: "hundreds", label: "百", unit: 100 }),
  Object.freeze({ key: "tens", label: "十", unit: 10 }),
  Object.freeze({ key: "ones", label: "一", unit: 1 })
]);

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function sequenceSeed(seed, patternSpecId, sequenceNumber) {
  return mix32((hashSeed(`${seed}:${patternSpecId}`) + Math.imul(Math.max(1, sequenceNumber), 0x9e3779b1)) >>> 0);
}

function integerBetween(seedValue, min, max) {
  return min + (seedValue % (max - min + 1));
}

function digitsForValue(value) {
  return String(value).padStart(8, "0").split("").map((digit) => Number(digit));
}

function placeModelForValue(value) {
  const digits = digitsForValue(value);
  return PLACE_UNITS.map((place, index) => ({ ...place, digit: digits[index], representedValue: digits[index] * place.unit }));
}

function compactExpansion(placeModel) {
  return placeModel.map((place) => `${place.digit}個${place.label}`).join("、");
}

function metadata(patternSpecId, canonicalSkillId, extraTags = []) {
  return {
    patternId: patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    patternTags: ["batch_a", "browser_bridge", G4A_U01_SOURCE_ID, patternSpecId],
    skillTags: [canonicalSkillId, ...extraTags],
    difficultyTags: ["batch_a_browser_bridge", "g4a_u01"],
    curriculumNodeIds: [G4A_U01_SOURCE_ID],
    canonicalSkillIds: [canonicalSkillId]
  };
}

function comparisonSymbol(left, right) {
  return left > right ? ">" : left < right ? "<" : "=";
}

function makeComparisonQuestion(patternSpecId, sequenceNumber, seed, min, max) {
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const left = integerBetween(seedValue, min, max);
  let right = integerBetween(mix32(seedValue + 17), min, max);
  if (left === right && min < max) right = right === max ? min : right + 1;
  const answerText = comparisonSymbol(left, right);
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "comparison",
    left,
    right,
    promptText: `在□中填入 >、< 或 =：${left} □ ${right}`,
    displayText: `${left} ${answerText} ${right}`,
    blankedDisplayText: `${left} □ ${right}`,
    answerText,
    finalAnswer: answerText,
    metadata: metadata(patternSpecId, "large_number_comparison", ["comparison"])
  };
}

function expressionFromOperands(left, right, operator) {
  return createBinaryNode(operator, createValueNode(createIntegerValue(left), 1), createValueNode(createIntegerValue(right), 2), { groupingHint: "leftAssociative" });
}

function makeLargeNumberAddSubQuestion(sequenceNumber, seed) {
  const patternSpecId = addSubSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const operator = sequenceNumber % 2 === 0 ? OPERATORS.SUBTRACT : OPERATORS.ADD;
  let left;
  let right;
  let answer;
  if (operator === OPERATORS.ADD) {
    left = integerBetween(seedValue, 10000, 49999999);
    right = integerBetween(mix32(seedValue + 31), 10000, Math.min(49999999, 99999999 - left));
    answer = left + right;
  } else {
    left = integerBetween(seedValue, 10000, 99999999);
    right = integerBetween(mix32(seedValue + 31), 10000, left);
    answer = left - right;
  }
  const expression = expressionFromOperands(left, right, operator);
  const answerValue = createIntegerValue(answer);
  const question = createGeneratedQuestionSkeleton({
    id: `${patternSpecId}-${sequenceNumber}`,
    expression,
    operandCount: 2,
    operatorsUsed: [operator],
    finalAnswer: answerValue,
    intermediateResults: [answerValue],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: buildDuplicateKey(expression),
    metadata: metadata(patternSpecId, "large_number_addition_subtraction", ["large_number", operator === OPERATORS.ADD ? "addition" : "subtraction"])
  });
  question.patternSpecId = patternSpecId;
  question.sourceId = G4A_U01_SOURCE_ID;
  question.metadata.sourceId = G4A_U01_SOURCE_ID;
  question.left = left;
  question.right = right;
  question.operator = operator;
  question.answerText = String(answer);
  return question;
}

function makeDecompositionQuestion(sequenceNumber, seed) {
  const patternSpecId = decompositionSpecId;
  const value = integerBetween(sequenceSeed(seed, patternSpecId, sequenceNumber), 10000000, 99999999);
  const placeModel = placeModelForValue(value);
  const answerText = compactExpansion(placeModel);
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01PlaceValueDecomposition",
    value,
    placeModel,
    digitsByPlace: Object.fromEntries(placeModel.map((place) => [place.key, place.digit])),
    placeValues: Object.fromEntries(placeModel.map((place) => [place.key, place.representedValue])),
    promptText: `${value} 是由哪些位值組成？`,
    displayText: `${value} = ${answerText}`,
    blankedDisplayText: `${value} = ___個千萬、___個百萬、___個十萬、___個萬、___個千、___個百、___個十、___個一`,
    answerText,
    finalAnswer: answerText,
    metadata: metadata(patternSpecId, "large_number_place_value", ["eight_digit", "decomposition"])
  };
}

function makeCompositionQuestion(sequenceNumber, seed) {
  const patternSpecId = compositionSpecId;
  const value = integerBetween(sequenceSeed(seed, patternSpecId, sequenceNumber), 10000000, 99999999);
  const placeModel = placeModelForValue(value);
  const prompt = compactExpansion(placeModel);
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01PlaceValueComposition",
    value,
    placeModel,
    placeCounts: Object.fromEntries(placeModel.map((place) => [place.key, place.digit])),
    promptText: `${prompt} 合起來是多少？`,
    displayText: `${prompt} 合起來是 ${value}`,
    blankedDisplayText: `${prompt} 合起來是 ________`,
    answerText: String(value),
    finalAnswer: value,
    metadata: metadata(patternSpecId, "large_number_place_value", ["eight_digit", "composition"])
  };
}

function makeSameDigitDifferenceQuestion(sequenceNumber, seed) {
  const patternSpecId = sameDigitDifferenceSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const repeatedDigit = 2 + (seedValue % 8);
  const highIndex = seedValue % 6;
  const lowIndex = highIndex + 1 + (mix32(seedValue + 53) % (7 - highIndex));
  const digits = Array.from({ length: 8 }, (_, index) => {
    const candidate = (index + sequenceNumber + 3) % 10;
    return candidate === repeatedDigit ? (candidate + 1) % 10 : candidate;
  });
  digits[0] = digits[0] === 0 ? 1 : digits[0];
  if (digits[0] === repeatedDigit && highIndex !== 0 && lowIndex !== 0) digits[0] = repeatedDigit === 9 ? 8 : 9;
  digits[highIndex] = repeatedDigit;
  digits[lowIndex] = repeatedDigit;
  const value = Number(digits.join(""));
  const firstPlace = PLACE_UNITS[highIndex];
  const secondPlace = PLACE_UNITS[lowIndex];
  const firstValue = repeatedDigit * firstPlace.unit;
  const secondValue = repeatedDigit * secondPlace.unit;
  const difference = Math.abs(firstValue - secondValue);
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01SameDigitPlaceValueDifference",
    value,
    repeatedDigit,
    positions: [highIndex, lowIndex],
    representedValues: [firstValue, secondValue],
    promptText: `在 ${value} 中，兩個 ${repeatedDigit} 所代表的數相差多少？`,
    displayText: `在 ${value} 中，兩個 ${repeatedDigit} 所代表的數相差 ${difference}`,
    blankedDisplayText: `在 ${value} 中，兩個 ${repeatedDigit} 所代表的數相差 ________`,
    answerText: String(difference),
    finalAnswer: difference,
    metadata: metadata(patternSpecId, "large_number_place_value", ["same_digit", "place_value_difference"])
  };
}

function generateQuestion(patternSpecId, sequenceNumber, seed) {
  if (patternSpecId === compare8SpecId) return makeComparisonQuestion(patternSpecId, sequenceNumber, seed, 10000000, 99999999);
  if (patternSpecId === compare100mSpecId) return makeComparisonQuestion(patternSpecId, sequenceNumber, seed, 0, 99999999);
  if (patternSpecId === addSubSpecId) return makeLargeNumberAddSubQuestion(sequenceNumber, seed);
  if (patternSpecId === decompositionSpecId) return makeDecompositionQuestion(sequenceNumber, seed);
  if (patternSpecId === compositionSpecId) return makeCompositionQuestion(sequenceNumber, seed);
  if (patternSpecId === sameDigitDifferenceSpecId) return makeSameDigitDifferenceQuestion(sequenceNumber, seed);
  return null;
}

function allocateCounts(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: count };
  }).filter((entry) => entry.questionCount > 0);
}

function questionKey(question) {
  return question?.duplicateKey ?? `${question?.patternSpecId}:${question?.blankedDisplayText ?? question?.displayText ?? question?.id}`;
}

export function canGenerateG4AU01Phase1Questions(plan = {}) {
  return plan?.sourceId === G4A_U01_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => G4A_U01_PHASE1_PATTERN_SPEC_IDS.includes(id));
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU01Phase1Questions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "batch_a_g4a_u01_phase1_scope_mismatch", severity: "error", path: "patternSpecIds", message: "G4A-U01 Phase 1 generator scope mismatch" }], warnings: [] };
  }
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  const warnings = [];
  const seen = new Set();

  for (const entry of allocation) {
    let accepted = 0;
    let attempts = 0;
    const maxAttempts = Math.max(80, entry.questionCount * 80);
    while (accepted < entry.questionCount && attempts < maxAttempts) {
      const sequenceNumber = attempts + 1;
      const question = generateQuestion(entry.patternSpecId, sequenceNumber, plan.generationSeed);
      const key = questionKey(question);
      if (question && !seen.has(key)) {
        seen.add(key);
        questions.push(question);
        accepted += 1;
      }
      attempts += 1;
    }
    if (accepted < entry.questionCount) {
      errors.push({ code: "batch_a_g4a_u01_phase1_unique_pool_exhausted", severity: "error", path: entry.patternSpecId, message: `G4A-U01 Phase 1 題庫不足：${entry.patternSpecId} 要求 ${entry.questionCount} 題，只產生 ${accepted} 題。` });
    }
  }

  return { ok: errors.length === 0, plan, questions, allocation, errors, warnings };
}
