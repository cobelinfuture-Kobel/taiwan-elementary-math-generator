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
export const G4A_U01_PHASE2_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u01_nonstandard_place_value_composition",
  "ps_g4a_u01_place_value_card_unit_model_composition",
  "ps_g4a_u01_compare_first_different_place",
  "ps_g4a_u01_missing_digit_comparison_possible_digits",
  "ps_g4a_u01_missing_digit_comparison_extreme_digit"
]);
export const G4A_U01_PHASE3_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u01_large_number_reading_writing_conversion",
  "ps_g4a_u01_numeric_vs_chinese_number_compare",
  "ps_g4a_u01_wan_mixed_notation_subtraction",
  "ps_g4a_u01_boundary_number_difference",
  "ps_g4a_u01_comparison_word_problem_total",
  "ps_g4a_u01_large_number_unit_word_problem_add_subtract"
]);
export const G4A_U01_PRINTABLE_PATTERN_SPEC_IDS = Object.freeze([
  ...G4A_U01_PHASE1_PATTERN_SPEC_IDS,
  ...G4A_U01_PHASE2_PATTERN_SPEC_IDS,
  ...G4A_U01_PHASE3_PATTERN_SPEC_IDS
]);

const compare8SpecId = "ps_g4a_u01_compare_8digit";
const compare100mSpecId = "ps_g4a_u01_within_100million_compare";
const addSubSpecId = "ps_g4a_u01_large_number_add_sub";
const decompositionSpecId = "ps_g4a_u01_8digit_place_value_decomposition";
const compositionSpecId = "ps_g4a_u01_place_value_composition_to_number";
const sameDigitDifferenceSpecId = "ps_g4a_u01_same_digit_place_value_difference";
const nonstandardCompositionSpecId = "ps_g4a_u01_nonstandard_place_value_composition";
const cardCompositionSpecId = "ps_g4a_u01_place_value_card_unit_model_composition";
const firstDifferentPlaceSpecId = "ps_g4a_u01_compare_first_different_place";
const possibleDigitsSpecId = "ps_g4a_u01_missing_digit_comparison_possible_digits";
const extremeDigitSpecId = "ps_g4a_u01_missing_digit_comparison_extreme_digit";
const readingWritingSpecId = "ps_g4a_u01_large_number_reading_writing_conversion";
const numericChineseCompareSpecId = "ps_g4a_u01_numeric_vs_chinese_number_compare";
const wanMixedSubtractionSpecId = "ps_g4a_u01_wan_mixed_notation_subtraction";
const boundaryDifferenceSpecId = "ps_g4a_u01_boundary_number_difference";
const comparisonWordProblemTotalSpecId = "ps_g4a_u01_comparison_word_problem_total";
const unitWordProblemSpecId = "ps_g4a_u01_large_number_unit_word_problem_add_subtract";

const DIGIT_CHINESE = Object.freeze(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]);
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

function countBetween(seedValue, min = 1, max = 99) {
  return min + (seedValue % (max - min + 1));
}

function digitsForValue(value) {
  return String(value).padStart(8, "0").split("").map((digit) => Number(digit));
}

function valueFromDigits(digits) {
  return Number(digits.join(""));
}

function placeModelForValue(value) {
  const digits = digitsForValue(value);
  return PLACE_UNITS.map((place, index) => ({ ...place, digit: digits[index], count: digits[index], representedValue: digits[index] * place.unit }));
}

function placeCountsForModel(placeModel) {
  return Object.fromEntries(PLACE_UNITS.map((place) => [place.key, placeModel.find((item) => item.key === place.key)?.count ?? 0]));
}

function compactExpansion(placeModel) {
  return placeModel.map((place) => `${place.digit}個${place.label}`).join("、");
}

function unitCountText(placeModel) {
  return placeModel.map((place) => `${place.count}個${place.label}`).join("、");
}

function chineseSection(section) {
  if (section === 0) return "";
  const values = [Math.floor(section / 1000), Math.floor(section / 100) % 10, Math.floor(section / 10) % 10, section % 10];
  const units = ["千", "百", "十", ""];
  let output = "";
  let pendingZero = false;
  for (let index = 0; index < values.length; index += 1) {
    const digit = values[index];
    if (digit === 0) {
      if (output) pendingZero = true;
      continue;
    }
    if (pendingZero) {
      output += "零";
      pendingZero = false;
    }
    output += `${DIGIT_CHINESE[digit]}${units[index]}`;
  }
  return output;
}

function numberToChinese(value) {
  if (value === 0) return "零";
  const wan = Math.floor(value / 10000);
  const lower = value % 10000;
  if (wan === 0) return chineseSection(lower);
  if (lower === 0) return `${chineseSection(wan)}萬`;
  return `${chineseSection(wan)}萬${lower < 1000 ? "零" : ""}${chineseSection(lower)}`;
}

function parseChineseSection(text) {
  const digitMap = new Map(DIGIT_CHINESE.map((digit, index) => [digit, index]));
  const unitMap = new Map([["千", 1000], ["百", 100], ["十", 10]]);
  let total = 0;
  let current = 0;
  for (const char of String(text ?? "")) {
    if (char === "零") continue;
    if (digitMap.has(char)) {
      current = digitMap.get(char);
      continue;
    }
    if (unitMap.has(char)) {
      total += (current || 1) * unitMap.get(char);
      current = 0;
    }
  }
  return total + current;
}

function parseChineseNumber(text) {
  const normalized = String(text ?? "").trim();
  if (normalized === "零") return 0;
  const [wanText, lowerText = ""] = normalized.split("萬");
  if (!normalized.includes("萬")) return parseChineseSection(normalized);
  return parseChineseSection(wanText) * 10000 + parseChineseSection(lowerText);
}

function formatWanMixed(value) {
  const wan = Math.floor(value / 10000);
  const lower = value % 10000;
  return lower === 0 ? `${wan}萬` : `${wan}萬${String(lower).padStart(4, "0")}`;
}

function parseWanMixed(text) {
  const [wanText, lowerText = "0"] = String(text ?? "").replace(/,/g, "").split("萬");
  return Number(wanText) * 10000 + Number(lowerText || 0);
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
  const value = valueFromDigits(digits);
  const firstPlace = PLACE_UNITS[highIndex];
  const secondPlace = PLACE_UNITS[lowIndex];
  const firstValue = repeatedDigit * firstPlace.unit;
  const secondValue = repeatedDigit * secondPlace.unit;
  const relationMode = sequenceNumber % 2 === 0 ? "sum" : "difference";
  const answer = relationMode === "sum" ? firstValue + secondValue : Math.abs(firstValue - secondValue);
  const promptAction = relationMode === "sum" ? "合起來是多少" : "相差多少";
  const displayAction = relationMode === "sum" ? "合起來是" : "相差";
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01SameDigitPlaceValueDifference",
    value,
    repeatedDigit,
    positions: [highIndex, lowIndex],
    representedValues: [firstValue, secondValue],
    placeValueRelationMode: relationMode,
    promptText: `在 ${value} 中，兩個 ${repeatedDigit} 所代表的數${promptAction}？`,
    displayText: `在 ${value} 中，兩個 ${repeatedDigit} 所代表的數${displayAction} ${answer}`,
    blankedDisplayText: `在 ${value} 中，兩個 ${repeatedDigit} 所代表的數${displayAction} ________`,
    answerText: String(answer),
    finalAnswer: answer,
    metadata: metadata(patternSpecId, "large_number_place_value", ["same_digit", "place_value_difference", relationMode === "sum" ? "place_value_sum" : "place_value_difference_only"])
  };
}

function makeNonstandardCompositionQuestion(sequenceNumber, seed) {
  const patternSpecId = nonstandardCompositionSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const millionCount = countBetween(seedValue, 10, 79);
  const candidatePlaces = PLACE_UNITS.slice(2);
  const includeCount = 2 + (mix32(seedValue + 19) % 4);
  const chosenIndexes = new Set();
  let cursor = mix32(seedValue + 37) % candidatePlaces.length;
  while (chosenIndexes.size < includeCount) {
    chosenIndexes.add(cursor % candidatePlaces.length);
    cursor += 1 + (mix32(seedValue + cursor + 53) % candidatePlaces.length);
  }
  const placeModel = [
    { ...PLACE_UNITS[1], count: millionCount },
    ...[...chosenIndexes].sort((a, b) => a - b).map((index, order) => ({
      ...candidatePlaces[index],
      count: countBetween(mix32(seedValue + 101 + index + order * 13), 1, 99)
    }))
  ].map((place) => ({ ...place, representedValue: place.count * place.unit }));
  const value = placeModel.reduce((sum, place) => sum + place.representedValue, 0);
  const prompt = unitCountText(placeModel);
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01NonstandardPlaceValueComposition",
    value,
    placeModel,
    placeCounts: placeCountsForModel(placeModel),
    promptText: `${prompt} 合起來是多少？`,
    displayText: `${prompt} 合起來是 ${value}`,
    blankedDisplayText: `${prompt} 合起來是 ________`,
    answerText: String(value),
    finalAnswer: value,
    metadata: metadata(patternSpecId, "large_number_place_value", ["nonstandard_composition", "count_1_to_99"])
  };
}

function makeCardCompositionQuestion(sequenceNumber, seed) {
  const patternSpecId = cardCompositionSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const includeCount = 2 + (seedValue % 4);
  const selected = new Set();
  let cursor = mix32(seedValue + 23) % PLACE_UNITS.length;
  while (selected.size < includeCount) {
    selected.add(cursor % PLACE_UNITS.length);
    cursor += 1 + (mix32(seedValue + cursor + 71) % PLACE_UNITS.length);
  }
  const placeModel = [...selected].sort((a, b) => a - b).map((index, order) => {
    const count = countBetween(mix32(seedValue + 211 + index + order * 17), 1, 9);
    return { ...PLACE_UNITS[index], count, representedValue: count * PLACE_UNITS[index].unit };
  });
  const value = placeModel.reduce((sum, place) => sum + place.representedValue, 0);
  const prompt = placeModel.map((place) => `${place.count}張${place.label}卡`).join("、");
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01PlaceValueCardComposition",
    value,
    placeModel,
    includedCardKeys: placeModel.map((place) => place.key),
    placeCounts: placeCountsForModel(placeModel),
    promptText: `位值卡：${prompt}，表示的數是多少？`,
    displayText: `位值卡：${prompt}，表示 ${value}`,
    blankedDisplayText: `位值卡：${prompt}，表示的數是 ________`,
    answerText: String(value),
    finalAnswer: value,
    metadata: metadata(patternSpecId, "large_number_place_value", ["card_model", "composition", "sparse_cards"])
  };
}

function makeFirstDifferentPlaceQuestion(sequenceNumber, seed) {
  const patternSpecId = firstDifferentPlaceSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const firstDifferentIndex = seedValue % 7;
  const leftDigits = Array.from({ length: 8 }, (_, index) => (index === 0 ? 1 + (mix32(seedValue + index) % 9) : mix32(seedValue + index) % 10));
  const rightDigits = [...leftDigits];
  const replacement = (leftDigits[firstDifferentIndex] + 1 + (mix32(seedValue + 91) % 8)) % 10;
  rightDigits[firstDifferentIndex] = firstDifferentIndex === 0 && replacement === 0 ? 9 : replacement;
  const left = valueFromDigits(leftDigits);
  const right = valueFromDigits(rightDigits);
  const place = PLACE_UNITS[firstDifferentIndex];
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01CompareFirstDifferentPlace",
    left,
    right,
    firstDifferentIndex,
    placeLabel: place.label,
    promptText: `比較 ${left} 和 ${right}，要先看哪一位？`,
    displayText: `比較 ${left} 和 ${right}，先看${place.label}`,
    blankedDisplayText: `比較 ${left} 和 ${right}，要先看 ________ 位`,
    answerText: place.label,
    finalAnswer: place.label,
    metadata: metadata(patternSpecId, "large_number_comparison", ["first_different_place"])
  };
}

function buildMissingDigitComparison(seedValue, relation) {
  const blankIndex = 1 + (seedValue % 5);
  const targetDigit = 2 + (mix32(seedValue + 11) % 6);
  const baseDigits = Array.from({ length: 8 }, (_, index) => (index === 0 ? 1 + (mix32(seedValue + index) % 9) : mix32(seedValue + index) % 10));
  const leftDigits = [...baseDigits];
  const rightDigits = [...baseDigits];
  rightDigits[blankIndex] = targetDigit;
  leftDigits[blankIndex] = null;
  const possibleDigits = [];
  for (let digit = 0; digit <= 9; digit += 1) {
    const candidateDigits = [...leftDigits];
    candidateDigits[blankIndex] = digit;
    const candidate = valueFromDigits(candidateDigits);
    const right = valueFromDigits(rightDigits);
    const ok = relation === ">" ? candidate > right : candidate < right;
    if (ok) possibleDigits.push(digit);
  }
  return { leftDigits, rightDigits, blankIndex, targetDigit, relation, right: valueFromDigits(rightDigits), possibleDigits };
}

function formatDigitsWithBlank(digits) {
  return digits.map((digit) => digit === null ? "□" : String(digit)).join("");
}

function makeMissingDigitPossibleQuestion(sequenceNumber, seed) {
  const patternSpecId = possibleDigitsSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const model = buildMissingDigitComparison(seedValue, sequenceNumber % 2 === 0 ? "<" : ">");
  const leftText = formatDigitsWithBlank(model.leftDigits);
  const answerText = model.possibleDigits.join(",");
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01MissingDigitComparisonPossibleDigits",
    ...model,
    promptText: `${leftText} ${model.relation} ${model.right}，□可以填哪些數？`,
    displayText: `${leftText} ${model.relation} ${model.right}，□可以填 ${answerText}`,
    blankedDisplayText: `${leftText} ${model.relation} ${model.right}，□可以填哪些數？ ________`,
    answerText,
    finalAnswer: [...model.possibleDigits],
    metadata: metadata(patternSpecId, "large_number_comparison", ["missing_digit", "possible_digits"])
  };
}

function makeMissingDigitExtremeQuestion(sequenceNumber, seed) {
  const patternSpecId = extremeDigitSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const model = buildMissingDigitComparison(seedValue, sequenceNumber % 2 === 0 ? "<" : ">");
  const extremeMode = sequenceNumber % 3 === 0 ? "min" : "max";
  const digit = extremeMode === "min" ? Math.min(...model.possibleDigits) : Math.max(...model.possibleDigits);
  const leftText = formatDigitsWithBlank(model.leftDigits);
  const promptExtreme = extremeMode === "min" ? "最小" : "最大";
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01MissingDigitComparisonExtremeDigit",
    ...model,
    extremeMode,
    extremeDigit: digit,
    promptText: `${leftText} ${model.relation} ${model.right}，□可填的${promptExtreme}數字是多少？`,
    displayText: `${leftText} ${model.relation} ${model.right}，□可填的${promptExtreme}數字是 ${digit}`,
    blankedDisplayText: `${leftText} ${model.relation} ${model.right}，□可填的${promptExtreme}數字是 ________`,
    answerText: String(digit),
    finalAnswer: digit,
    metadata: metadata(patternSpecId, "large_number_comparison", ["missing_digit", "extreme_digit"])
  };
}

function makeReadingWritingQuestion(sequenceNumber, seed) {
  const patternSpecId = readingWritingSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const value = integerBetween(seedValue, 1, 99999999);
  const chineseText = numberToChinese(value);
  const conversionDirection = sequenceNumber % 2 === 0 ? "chinese_to_numeric" : "numeric_to_chinese";
  const answerText = conversionDirection === "numeric_to_chinese" ? chineseText : String(value);
  const promptText = conversionDirection === "numeric_to_chinese"
    ? `把 ${value} 寫成中文數詞。`
    : `把「${chineseText}」寫成阿拉伯數字。`;
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01LargeNumberReadingWritingConversion",
    value,
    chineseText,
    conversionDirection,
    promptText,
    displayText: `${promptText} 答：${answerText}`,
    blankedDisplayText: `${promptText} ________`,
    answerText,
    finalAnswer: answerText,
    metadata: metadata(patternSpecId, "large_number_reading_writing", ["chinese_number", "conversion"])
  };
}

function makeNumericVsChineseCompareQuestion(sequenceNumber, seed) {
  const patternSpecId = numericChineseCompareSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const leftValue = integerBetween(seedValue, 1, 99999999);
  let rightValue = integerBetween(mix32(seedValue + 17), 1, 99999999);
  if (leftValue === rightValue) rightValue = rightValue === 99999999 ? 1 : rightValue + 1;
  const rightChineseText = numberToChinese(rightValue);
  const answerText = comparisonSymbol(leftValue, rightValue);
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01NumericVsChineseNumberCompare",
    leftValue,
    rightValue,
    rightChineseText,
    parsedRightValue: parseChineseNumber(rightChineseText),
    promptText: `在□中填入 >、< 或 =：${leftValue} □ ${rightChineseText}`,
    displayText: `${leftValue} ${answerText} ${rightChineseText}`,
    blankedDisplayText: `${leftValue} □ ${rightChineseText}`,
    answerText,
    finalAnswer: answerText,
    metadata: metadata(patternSpecId, "large_number_comparison", ["chinese_number", "mixed_notation"])
  };
}

function makeWanMixedSubtractionQuestion(sequenceNumber, seed) {
  const patternSpecId = wanMixedSubtractionSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const leftValue = integerBetween(seedValue, 1000000, 99999999);
  const rightValue = integerBetween(mix32(seedValue + 29), 1, Math.max(1, leftValue - 1));
  const leftWanText = formatWanMixed(leftValue);
  const rightWanText = formatWanMixed(rightValue);
  const answer = leftValue - rightValue;
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01WanMixedNotationSubtraction",
    leftValue,
    rightValue,
    leftWanText,
    rightWanText,
    promptText: `${leftWanText} - ${rightWanText} = 多少？`,
    displayText: `${leftWanText} - ${rightWanText} = ${answer}`,
    blankedDisplayText: `${leftWanText} - ${rightWanText} = ________`,
    answerText: String(answer),
    finalAnswer: answer,
    metadata: metadata(patternSpecId, "large_number_addition_subtraction", ["wan_notation", "subtraction"])
  };
}

function makeBoundaryDifferenceQuestion(sequenceNumber, seed) {
  const patternSpecId = boundaryDifferenceSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const largerDigitCount = 5 + (seedValue % 4);
  const smallerDigitCount = Math.max(1, largerDigitCount - 1 - (mix32(seedValue + 13) % 2));
  const largerValue = (10 ** largerDigitCount) - 1;
  const smallerValue = 10 ** (smallerDigitCount - 1);
  const difference = largerValue - smallerValue;
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01BoundaryNumberDifference",
    largerDigitCount,
    smallerDigitCount,
    largerValue,
    smallerValue,
    promptText: `最大的${largerDigitCount}位數和最小的${smallerDigitCount}位數相差多少？`,
    displayText: `最大的${largerDigitCount}位數 ${largerValue} 和最小的${smallerDigitCount}位數 ${smallerValue} 相差 ${difference}`,
    blankedDisplayText: `最大的${largerDigitCount}位數和最小的${smallerDigitCount}位數相差 ________`,
    answerText: String(difference),
    finalAnswer: difference,
    metadata: metadata(patternSpecId, "large_number_comparison", ["digit_count_boundary", "difference"])
  };
}

function makeComparisonWordProblemTotalQuestion(sequenceNumber, seed) {
  const patternSpecId = comparisonWordProblemTotalSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const baseValue = integerBetween(seedValue, 100000, 49999999);
  const deltaValue = integerBetween(mix32(seedValue + 41), 10000, Math.max(10000, Math.min(baseValue - 1, 20000000)));
  const relationMode = sequenceNumber % 2 === 0 ? "less" : "more";
  const comparedValue = relationMode === "more" ? baseValue + deltaValue : baseValue - deltaValue;
  const total = baseValue + comparedValue;
  const relationText = relationMode === "more" ? "多" : "少";
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01ComparisonWordProblemTotal",
    baseValue,
    deltaValue,
    relationMode,
    comparedValue,
    total,
    promptText: `甲倉庫有 ${baseValue} 個零件，乙倉庫比甲倉庫${relationText} ${deltaValue} 個，兩個倉庫共有多少個零件？`,
    displayText: `甲 ${baseValue}，乙 ${comparedValue}，合計 ${total}`,
    blankedDisplayText: `甲倉庫有 ${baseValue} 個零件，乙倉庫比甲倉庫${relationText} ${deltaValue} 個，兩個倉庫共有 ________ 個零件`,
    answerText: String(total),
    finalAnswer: total,
    metadata: metadata(patternSpecId, "large_number_word_problem", ["comparison", "total"])
  };
}

function makeUnitWordProblemQuestion(sequenceNumber, seed) {
  const patternSpecId = unitWordProblemSpecId;
  const seedValue = sequenceSeed(seed, patternSpecId, sequenceNumber);
  const units = ["人", "元", "公斤", "公噸", "萬元"];
  const unit = units[seedValue % units.length];
  const operator = sequenceNumber % 2 === 0 ? "subtract" : "add";
  let leftValue = integerBetween(seedValue, 10000, 60000000);
  let rightValue = integerBetween(mix32(seedValue + 59), 10000, 39999999);
  if (operator === "add" && leftValue + rightValue > 99999999) rightValue = 99999999 - leftValue;
  if (operator === "subtract" && rightValue > leftValue) [leftValue, rightValue] = [rightValue, leftValue];
  const numericAnswer = operator === "add" ? leftValue + rightValue : leftValue - rightValue;
  const operatorText = operator === "add" ? "增加" : "減少";
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    patternSpecId,
    sourceId: G4A_U01_SOURCE_ID,
    kind: "g4aU01LargeNumberUnitWordProblemAddSubtract",
    leftValue,
    rightValue,
    operator,
    unit,
    numericAnswer,
    promptText: `某城市原有 ${leftValue}${unit}，後來${operatorText} ${rightValue}${unit}，現在有多少${unit}？`,
    displayText: `${leftValue}${unit} ${operator === "add" ? "+" : "-"} ${rightValue}${unit} = ${numericAnswer}${unit}`,
    blankedDisplayText: `某城市原有 ${leftValue}${unit}，後來${operatorText} ${rightValue}${unit}，現在有 ________${unit}`,
    answerText: `${numericAnswer}${unit}`,
    finalAnswer: numericAnswer,
    metadata: metadata(patternSpecId, "large_number_word_problem", ["unit", operator])
  };
}

function generateQuestion(patternSpecId, sequenceNumber, seed) {
  if (patternSpecId === compare8SpecId) return makeComparisonQuestion(patternSpecId, sequenceNumber, seed, 10000000, 99999999);
  if (patternSpecId === compare100mSpecId) return makeComparisonQuestion(patternSpecId, sequenceNumber, seed, 0, 99999999);
  if (patternSpecId === addSubSpecId) return makeLargeNumberAddSubQuestion(sequenceNumber, seed);
  if (patternSpecId === decompositionSpecId) return makeDecompositionQuestion(sequenceNumber, seed);
  if (patternSpecId === compositionSpecId) return makeCompositionQuestion(sequenceNumber, seed);
  if (patternSpecId === sameDigitDifferenceSpecId) return makeSameDigitDifferenceQuestion(sequenceNumber, seed);
  if (patternSpecId === nonstandardCompositionSpecId) return makeNonstandardCompositionQuestion(sequenceNumber, seed);
  if (patternSpecId === cardCompositionSpecId) return makeCardCompositionQuestion(sequenceNumber, seed);
  if (patternSpecId === firstDifferentPlaceSpecId) return makeFirstDifferentPlaceQuestion(sequenceNumber, seed);
  if (patternSpecId === possibleDigitsSpecId) return makeMissingDigitPossibleQuestion(sequenceNumber, seed);
  if (patternSpecId === extremeDigitSpecId) return makeMissingDigitExtremeQuestion(sequenceNumber, seed);
  if (patternSpecId === readingWritingSpecId) return makeReadingWritingQuestion(sequenceNumber, seed);
  if (patternSpecId === numericChineseCompareSpecId) return makeNumericVsChineseCompareQuestion(sequenceNumber, seed);
  if (patternSpecId === wanMixedSubtractionSpecId) return makeWanMixedSubtractionQuestion(sequenceNumber, seed);
  if (patternSpecId === boundaryDifferenceSpecId) return makeBoundaryDifferenceQuestion(sequenceNumber, seed);
  if (patternSpecId === comparisonWordProblemTotalSpecId) return makeComparisonWordProblemTotalQuestion(sequenceNumber, seed);
  if (patternSpecId === unitWordProblemSpecId) return makeUnitWordProblemQuestion(sequenceNumber, seed);
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
    && plan.patternSpecIds.every((id) => G4A_U01_PRINTABLE_PATTERN_SPEC_IDS.includes(id));
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU01Phase1Questions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "batch_a_g4a_u01_printable_scope_mismatch", severity: "error", path: "patternSpecIds", message: "G4A-U01 printable generator scope mismatch" }], warnings: [] };
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
      errors.push({ code: "batch_a_g4a_u01_unique_pool_exhausted", severity: "error", path: entry.patternSpecId, message: `G4A-U01 題庫不足：${entry.patternSpecId} 要求 ${entry.questionCount} 題，只產生 ${accepted} 題。` });
    }
  }

  return { ok: errors.length === 0, plan, questions, allocation, errors, warnings };
}
