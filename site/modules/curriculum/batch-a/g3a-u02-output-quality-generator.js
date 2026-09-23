import { OPERATORS } from "../../core/constants.js";
import { buildDuplicateKey } from "../../core/generate-expression.js";
import { createBinaryNode, createGeneratedQuestionSkeleton, createValueNode } from "../../core/expression-model.js";
import { createIntegerValue } from "../../core/number-value.js";
import { createSeededRandom, randomIntBetween } from "../../core/random.js";
import { estimateAddSubToUnit } from "./context-estimate-core.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestion } from "./batch-a-browser-validator.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-submiddle-extension.js";

export const G3A_U02_SOURCE_ID = "g3a_u02_3a02";

const G3A_U02_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g3a_u02_4digit_add_multi_carry",
  "ps_g3a_u02_4digit_sub_multi_borrow",
  "ps_g3a_u02_estimate_nearest_thousand",
  "ps_g3a_u02_word_problem_estimation_add_sub",
  "ps_g3a_u02_add_missing_digit_operand",
  "ps_g3a_u02_sub_missing_digit_operand",
  "ps_g3a_u02_add_missing_digit_equation",
  "ps_g3a_u02_sub_missing_digit_equation",
  "ps_g3a_u02_sub_middle_missing_digit",
  "ps_g3a_u02_continuous_borrow_zero"
]);

const MAX_DUPLICATE_RETRY = 48;

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function issue(code, path, message) { return { code, severity: "error", path, message }; }

function hashText(value) {
  let acc = 0;
  for (const char of String(value ?? "g3a-u02")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function sequenceNumber(options = {}) { return Number.isInteger(options.sequenceNumber) && options.sequenceNumber > 0 ? options.sequenceNumber : 1; }
function sequenceState(options = {}, channel = "default") { return mix32((hashText(`${options.seed ?? "g3a-u02"}:${channel}`) + Math.imul(sequenceNumber(options), 0x9e3779b1)) >>> 0); }
function valueBetween(min, max, state) { return min + (state % (max - min + 1)); }
function digitBounds(digits) { return digits === 1 ? [1, 9] : [10 ** (digits - 1), (10 ** digits) - 1]; }
function variedValueWithDigits(digits, state) { const [min, max] = digitBounds(digits); return valueBetween(min, max, state); }
function roundToNearestThousand(value) { return Math.round(value / 1000) * 1000; }
function digitsToNumber(digits) { return Number(digits.join("")); }
function nonzeroDigit(state) { return 1 + (state % 9); }

function expressionMetadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds],
    precedenceMode: "left_to_right",
    parenthesesMode: "none"
  };
}

function textQuestionMetadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds]
  };
}

function targetCoveredDigits(definition, options = {}) {
  const coverage = definition.digitCoverage;
  if (!coverage || !Array.isArray(coverage.allowedDigits) || coverage.allowedDigits.length === 0) return null;
  return coverage.allowedDigits[(sequenceNumber(options) - 1) % coverage.allowedDigits.length] ?? null;
}

function createExpressionQuestion(definition, { left, right, operator, answer }, options = {}) {
  const leftValue = createIntegerValue(left);
  const rightValue = createIntegerValue(right);
  const answerValue = createIntegerValue(answer);
  const expression = createBinaryNode(operator, createValueNode(leftValue, 1), createValueNode(rightValue, 2), { groupingHint: "leftAssociative" });
  const question = createGeneratedQuestionSkeleton({
    id: options.id ?? `${definition.patternSpecId}-${sequenceNumber(options)}`,
    expression,
    operandCount: 2,
    operatorsUsed: [operator],
    finalAnswer: answerValue,
    intermediateResults: [answerValue],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: buildDuplicateKey(expression),
    metadata: expressionMetadata(definition)
  });
  question.patternSpecId = definition.patternSpecId;
  question.sourceId = definition.sourceId;
  question.left = left;
  question.right = right;
  question.operator = operator === OPERATORS.ADD ? "add" : "subtract";
  question.answer = answer;
  question.metadata = { ...question.metadata, sourceId: definition.sourceId, patternId: definition.patternSpecId };
  return question;
}

function additionCarryOperands(definition, options = {}) {
  const digits = targetCoveredDigits(definition, options) ?? 4;
  const state = sequenceState(options, `addition-carry-${digits}`);
  const rightDigits = [0, 0, 0, 0];
  const leftDigits = [0, 0, 0, 0];

  rightDigits[3] = nonzeroDigit(mix32(state + 11));
  leftDigits[3] = 10 - rightDigits[3];

  if (digits >= 2) {
    rightDigits[2] = nonzeroDigit(mix32(state + 23));
    const minTens = 9 - rightDigits[2];
    leftDigits[2] = valueBetween(minTens, 9, mix32(state + 29));
  } else {
    leftDigits[2] = 9;
  }

  rightDigits[1] = digits >= 3 ? nonzeroDigit(mix32(state + 37)) : 0;
  leftDigits[1] = valueBetween(0, 8, mix32(state + 41));

  leftDigits[0] = digits === 4 ? valueBetween(1, 7, mix32(state + 53)) : valueBetween(1, 8, mix32(state + 53));
  rightDigits[0] = digits === 4 ? valueBetween(1, Math.max(1, 8 - leftDigits[0]), mix32(state + 61)) : 0;

  const left = digitsToNumber(leftDigits);
  const right = digitsToNumber(rightDigits);
  return { left, right, operator: OPERATORS.ADD, answer: left + right };
}

function subtractionRegroupOperands(definition, options = {}) {
  if (definition.continuousBorrowZeroPolicy?.required === true) return continuousBorrowZeroOperands(definition, options);
  const digits = targetCoveredDigits(definition, options) ?? 4;
  const state = sequenceState(options, `subtraction-regroup-${digits}`);
  const rightDigits = [0, 0, 0, 0];
  const leftDigits = [0, 0, 0, 0];

  rightDigits[3] = nonzeroDigit(mix32(state + 13));
  leftDigits[3] = valueBetween(0, rightDigits[3] - 1, mix32(state + 17));

  rightDigits[2] = digits >= 2 ? valueBetween(0, 9, mix32(state + 31)) : 0;
  leftDigits[2] = valueBetween(0, rightDigits[2], mix32(state + 43));

  rightDigits[1] = digits >= 3 ? nonzeroDigit(mix32(state + 47)) : 0;
  leftDigits[1] = valueBetween(0, 9, mix32(state + 59));

  if (digits === 4) {
    rightDigits[0] = valueBetween(1, 7, mix32(state + 67));
    leftDigits[0] = valueBetween(rightDigits[0] + 1, 9, mix32(state + 71));
  } else {
    leftDigits[0] = valueBetween(1, 9, mix32(state + 71));
  }

  const left = digitsToNumber(leftDigits);
  const right = digitsToNumber(rightDigits);
  return { left, right, operator: OPERATORS.SUBTRACT, answer: left - right };
}

function continuousBorrowZeroOperands(definition, options = {}) {
  const digits = targetCoveredDigits(definition, options) ?? 3;
  const state = sequenceState(options, `continuous-borrow-zero-${digits}`);
  const rightDigits = [0, 0, 0, 0];
  const leftDigits = [0, 0, 0, 0];

  rightDigits[3] = nonzeroDigit(mix32(state + 79));
  leftDigits[3] = valueBetween(0, rightDigits[3] - 1, mix32(state + 83));
  rightDigits[2] = valueBetween(0, 9, mix32(state + 89));
  rightDigits[1] = digits >= 3 ? nonzeroDigit(mix32(state + 97)) : 0;
  if (digits === 4) rightDigits[0] = valueBetween(1, 7, mix32(state + 101));

  leftDigits[0] = digits === 4 ? valueBetween(rightDigits[0] + 1, 9, mix32(state + 107)) : valueBetween(2, 9, mix32(state + 107));
  leftDigits[1] = 0;
  leftDigits[2] = 0;

  const left = digitsToNumber(leftDigits);
  const right = digitsToNumber(rightDigits);
  return { left, right, operator: OPERATORS.SUBTRACT, answer: left - right };
}

function generateExpression(definition, options = {}) {
  if (definition.carryPolicy?.kind === "addition_carry") return createExpressionQuestion(definition, additionCarryOperands(definition, options), options);
  if (definition.carryPolicy?.kind === "subtraction_regroup") return createExpressionQuestion(definition, subtractionRegroupOperands(definition, options), options);
  throw new Error(`Unsupported G3A-U02 expression pattern: ${definition.patternSpecId}`);
}

function roundingValue(definition, options = {}) {
  const coverage = Array.isArray(definition.coverageValues) ? definition.coverageValues : [];
  if (coverage.length > 0 && sequenceNumber(options) <= coverage.length) return coverage[sequenceNumber(options) - 1];
  const state = sequenceState(options, "rounding-thousand-boundary");
  const base = 1000 * valueBetween(1, 9, state);
  const offsets = [-499, -250, -1, 0, 1, 249, 500, 731];
  return Math.min(definition.max, Math.max(definition.min, base + offsets[mix32(state + 7) % offsets.length]));
}

function generateRounding(definition, options = {}) {
  const value = roundingValue(definition, options);
  const answer = roundToNearestThousand(value);
  return {
    id: options.id ?? `${definition.patternSpecId}-${sequenceNumber(options)}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: "rounding",
    value,
    unit: definition.unit,
    promptText: `將 ${value} 估到最接近的千位數。`,
    displayText: `${value} 估到最接近的千位數是 ${answer}`,
    blankedDisplayText: `${value} 估到最接近的千位數是 ____`,
    answerText: String(answer),
    finalAnswer: answer,
    metadata: textQuestionMetadata(definition)
  };
}

function buildContextPrompt(left, right, operator) {
  if (operator === "add") return `書店上午賣出 ${left} 本書，下午賣出 ${right} 本書。先把兩個數估到最接近的千位，再估算一共約賣出幾本書？`;
  return `倉庫原有 ${left} 箱貨物，送出 ${right} 箱。先把兩個數估到最接近的千位，再估算大約還剩幾箱？`;
}

function generateContextEstimate(definition, options = {}) {
  const leftState = sequenceState(options, "context-left");
  const rightState = sequenceState(options, "context-right");
  let left = valueBetween(definition.min, definition.max, leftState);
  let right = valueBetween(definition.min, definition.max, rightState);
  if (left === right) right = definition.min + ((right - definition.min + 613) % (definition.max - definition.min + 1));
  const operator = mix32(leftState + rightState) % 2 === 0 ? "add" : "subtract";
  if (operator === "subtract" && right > left) [left, right] = [right, left];
  const estimate = estimateAddSubToUnit(left, right, operator, definition.unit);
  const promptText = buildContextPrompt(left, right, operator);
  return {
    id: options.id ?? `${definition.patternSpecId}-${sequenceNumber(options)}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: definition.kind,
    left,
    right,
    operator,
    unit: definition.unit,
    roundedLeft: estimate.roundedLeft,
    roundedRight: estimate.roundedRight,
    promptText,
    displayText: `${promptText} 答案：${estimate.answer}`,
    blankedDisplayText: `${promptText} 答案：____`,
    answerText: String(estimate.answer),
    finalAnswer: estimate.answer,
    explanationText: `${left}->${estimate.roundedLeft}; ${right}->${estimate.roundedRight}; ${estimate.answer}`,
    metadata: textQuestionMetadata(definition)
  };
}

function maskDigit(value, index) { const text = String(value); return `${text.slice(0, index)}□${text.slice(index + 1)}`; }
function placesForValue(value) { return Array.from({ length: String(value).length }, (_, index) => index); }
function placeValueForIndex(value, index) { return String(value).length - 1 - index; }
function indexForPlaceValue(value, placeValue) { const index = String(value).length - 1 - placeValue; return index >= 0 && index < String(value).length ? index : null; }
function chooseIndexForDistinctPlace(value, usedPlaceValues, state) {
  const candidates = placesForValue(value).filter((index) => !usedPlaceValues.has(placeValueForIndex(value, index)));
  return candidates.length === 0 ? null : candidates[state % candidates.length];
}
function chooseMiddleIndex(value, state) {
  const middleIndexes = [2, 1].map((placeValue) => indexForPlaceValue(value, placeValue)).filter((index) => index !== null);
  return middleIndexes.length === 0 ? null : middleIndexes[state % middleIndexes.length];
}
function makeBlank(target, value, index) { return { target, index, placeValue: placeValueForIndex(value, index), digit: Number(String(value)[index]) }; }
function maskMultipleDigits(value, blanks) { const chars = String(value).split(""); for (const blank of blanks) chars[blank.index] = "□"; return chars.join(""); }

function missingDigitOperands(definition, options = {}) {
  const rightDigits = definition.rightDigitCoverage[(sequenceNumber(options) - 1) % definition.rightDigitCoverage.length];
  const right = variedValueWithDigits(rightDigits, sequenceState(options, "missing-right"));
  const leftState = sequenceState(options, "missing-left");
  const left = definition.operator === "add" ? valueBetween(1000, Math.max(1000, 9999 - right), leftState) : valueBetween(Math.max(1000, right), 9999, leftState);
  const result = definition.operator === "add" ? left + right : left - right;
  const missingOperand = sequenceNumber(options) % 2 === 0 ? "right" : "left";
  const targetText = String(missingOperand === "left" ? left : right);
  const missingIndex = targetText.length === 1 ? 0 : 1 + (sequenceNumber(options) % (targetText.length - 1));
  return { left, right, result, missingOperand, missingIndex, missingDigit: Number(targetText[missingIndex]) };
}

function generateMissingDigit(definition, options = {}) {
  const model = missingDigitOperands(definition, options);
  const symbol = definition.operator === "add" ? "+" : "-";
  const leftText = model.missingOperand === "left" ? maskDigit(model.left, model.missingIndex) : String(model.left);
  const rightText = model.missingOperand === "right" ? maskDigit(model.right, model.missingIndex) : String(model.right);
  return {
    id: options.id ?? `${definition.patternSpecId}-${sequenceNumber(options)}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: "missingDigit",
    operator: definition.operator,
    left: model.left,
    right: model.right,
    result: model.result,
    missingOperand: model.missingOperand,
    missingIndex: model.missingIndex,
    missingDigit: model.missingDigit,
    promptText: "在□中填入正確的數字。",
    displayText: `${model.left} ${symbol} ${model.right} = ${model.result}`,
    blankedDisplayText: `${leftText} ${symbol} ${rightText} = ${model.result}`,
    answerText: String(model.missingDigit),
    finalAnswer: model.missingDigit,
    metadata: textQuestionMetadata(definition)
  };
}

function equationBlankModel(definition, options = {}) {
  const rightDigits = definition.rightDigitCoverage[(sequenceNumber(options) - 1) % definition.rightDigitCoverage.length];
  const right = variedValueWithDigits(rightDigits, sequenceState(options, "equation-right"));
  const leftState = sequenceState(options, "equation-left");
  const left = definition.operator === "add" ? valueBetween(1000, Math.max(1000, 9999 - right), leftState) : valueBetween(Math.max(1000, right), 9999, leftState);
  const result = definition.operator === "add" ? left + right : left - right;
  const usedPlaceValues = new Set();
  const rightPlaces = placesForValue(right);
  const defaultRightIndex = rightPlaces[(sequenceNumber(options) - 1) % rightPlaces.length];
  const forcedMiddleIndex = definition.middlePlaceRequired === true ? chooseMiddleIndex(right, mix32(sequenceState(options, "equation-middle"))) : null;
  const rightBlank = makeBlank("right", right, forcedMiddleIndex ?? defaultRightIndex);
  usedPlaceValues.add(rightBlank.placeValue);

  const resultIndex = chooseIndexForDistinctPlace(result, usedPlaceValues, mix32(sequenceState(options, "equation-result")));
  if (resultIndex === null) throw new Error("batch_a_g3a_u02_equation_result_blank_unavailable");
  const resultBlank = makeBlank("result", result, resultIndex);
  usedPlaceValues.add(resultBlank.placeValue);

  const leftIndex = chooseIndexForDistinctPlace(left, usedPlaceValues, mix32(sequenceState(options, "equation-left-blank")));
  const leftBlank = leftIndex === null ? null : makeBlank("left", left, leftIndex);
  const order = { left: 0, right: 1, result: 2 };
  const blanks = [leftBlank, rightBlank, resultBlank].filter(Boolean).sort((a, b) => order[a.target] - order[b.target] || a.index - b.index);
  return { left, right, result, blanks, missingDigits: blanks.map((blank) => blank.digit) };
}

function generateMissingDigitEquation(definition, options = {}) {
  const model = equationBlankModel(definition, options);
  const symbol = definition.operator === "add" ? "+" : "-";
  const leftBlanks = model.blanks.filter((blank) => blank.target === "left");
  const rightBlanks = model.blanks.filter((blank) => blank.target === "right");
  const resultBlanks = model.blanks.filter((blank) => blank.target === "result");
  const answerText = model.missingDigits.join(",");
  return {
    id: options.id ?? `${definition.patternSpecId}-${sequenceNumber(options)}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: "missingDigitEquation",
    operator: definition.operator,
    left: model.left,
    right: model.right,
    result: model.result,
    blanks: model.blanks,
    missingDigits: model.missingDigits,
    answerOrder: "prompt_left_to_right",
    promptText: "依照□出現順序，填入正確的數字。",
    displayText: `${model.left} ${symbol} ${model.right} = ${model.result}`,
    blankedDisplayText: `${maskMultipleDigits(model.left, leftBlanks)} ${symbol} ${maskMultipleDigits(model.right, rightBlanks)} = ${maskMultipleDigits(model.result, resultBlanks)}`,
    answerText,
    finalAnswer: answerText,
    metadata: textQuestionMetadata(definition)
  };
}

function hasRoundingShape(definition) { return definition.kind === "rounding" || (definition.kind !== "wordProblemEstimation" && Number.isSafeInteger(definition.unit)); }
function hasContextEstimateShape(definition) { return Array.isArray(definition.contextTags) && definition.contextTags.includes("fixed_template"); }

function generateQuestion(definition, options = {}) {
  if (definition.kind === "expression") return generateExpression(definition, options);
  if (definition.kind === "missingDigit") return generateMissingDigit(definition, options);
  if (definition.kind === "missingDigitEquation") return generateMissingDigitEquation(definition, options);
  if (hasContextEstimateShape(definition)) return generateContextEstimate(definition, options);
  if (hasRoundingShape(definition)) return generateRounding(definition, options);
  throw new Error(`Unsupported G3A-U02 pattern kind: ${definition.kind}`);
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

function questionKey(question) {
  if (typeof question?.blankedDisplayText === "string") return question.blankedDisplayText;
  if (typeof question?.duplicateKey === "string") return question.duplicateKey;
  if (Number.isSafeInteger(question?.left) && Number.isSafeInteger(question?.right)) return `${question.operator}:${question.left}:${question.right}`;
  return `${question?.patternSpecId}:${question?.id}`;
}

function shuffleQuestions(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  const output = [...questions];
  const randomFn = createSeededRandom(`${plan.generationSeed}:s45b2:g3a-u02:${plan.questionCount}`);
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIntBetween(randomFn, 0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function supportsPlan(plan) {
  return plan?.sourceId === G3A_U02_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0 && plan.patternSpecIds.every((id) => G3A_U02_PATTERN_SPEC_IDS.includes(id));
}

export function isG3AU02OutputQualityPlan(plan) { return supportsPlan(plan); }

export function generateG3AU02OutputQualityQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const validation = validateBatchABrowserPlan(plan);
  if (!validation.ok) return { ok: false, plan, questions: [], allocation: [], errors: validation.errors, warnings: validation.warnings };
  if (!supportsPlan(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [issue("batch_a_g3a_u02_plan_not_supported", "sourceId", "Unsupported G3A-U02 output quality plan.")], warnings: [] };

  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  const warnings = [];
  const seen = new Set();

  for (const entry of allocation) {
    const definition = getBatchABrowserPatternDefinition(entry.patternSpecId);
    if (!definition) { errors.push(issue("batch_a_pattern_missing", "patternSpecId", `Missing pattern '${entry.patternSpecId}'.`)); continue; }
    for (let index = 0; index < entry.questionCount; index += 1) {
      let accepted = null;
      let lastValidationErrors = [];
      for (let attempt = 0; attempt < MAX_DUPLICATE_RETRY; attempt += 1) {
        const sequenceForAttempt = questions.length + 1 + attempt * 997;
        const seed = `${plan.generationSeed}:${entry.patternSpecId}:${index + 1}:s45b2:${attempt}`;
        let question;
        try { question = generateQuestion(definition, { seed, sequenceNumber: sequenceForAttempt }); }
        catch (error) { lastValidationErrors = [issue(error.code ?? "batch_a_g3a_u02_generation_failed", entry.patternSpecId, error.message)]; continue; }
        const checked = validateBatchABrowserQuestion(question);
        if (!checked.ok) { lastValidationErrors = checked.errors; warnings.push(...checked.warnings); continue; }
        const key = questionKey(question);
        if (!seen.has(key)) { seen.add(key); accepted = question; warnings.push(...checked.warnings); break; }
      }
      if (accepted) questions.push(accepted);
      else {
        errors.push(...lastValidationErrors);
        errors.push(issue("batch_a_g3a_u02_duplicate_retry_exhausted", entry.patternSpecId, `Unable to produce a unique valid prompt for '${entry.patternSpecId}'.`));
      }
    }
  }

  return { ok: errors.length === 0, plan, questions: shuffleQuestions(questions, plan), allocation, errors, warnings };
}
