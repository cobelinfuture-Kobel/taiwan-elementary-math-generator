import { OPERATORS } from "../../core/constants.js";
import { buildDuplicateKey } from "../../core/generate-expression.js";
import { createBinaryNode, createGeneratedQuestionSkeleton, createValueNode } from "../../core/expression-model.js";
import { createIntegerValue } from "../../core/number-value.js";
import { buildBatchABrowserPlan, generateBatchABrowserQuestions as baseGenerateBatchABrowserQuestions } from "./batch-a-browser-generator.js";

const sourceId = "g3a_u03_3a03";
const twoStepWordProblemSpecId = "ps_g3a_u03_consecutive_multiplication_two_step_word_problem";
const zeroMiddleSpecId = "ps_g3a_u03_3digit_zero_middle_by_1digit";
const missingInferenceSpecId = "ps_g3a_u03_multiplication_missing_digit_inference";
const twoStepSpecId = "ps_g3a_u03_consecutive_multiplication_two_step";
const u03SpecIds = Object.freeze([
  "ps_g3a_u03_2digit_by_1digit_carry",
  "ps_g3a_u03_10_multiple_by_1digit",
  "ps_g3a_u03_3digit_by_1digit",
  twoStepSpecId,
  twoStepWordProblemSpecId,
  zeroMiddleSpecId,
  missingInferenceSpecId
]);
const thirdFactors = Object.freeze([3, 6, 10, 13, 17, 20]);
const wordProblemContexts = Object.freeze([
  ({ left, middle, third }) => `一個收納盒有 ${left} 排貼紙，每排有 ${middle} 張。老師準備了 ${third} 個收納盒，一共有多少張貼紙？`,
  ({ left, middle, third }) => `一層書架有 ${left} 排書，每排有 ${middle} 本。圖書角共有 ${third} 層書架，一共有多少本書？`,
  ({ left, middle, third }) => `一袋糖果有 ${left} 包，每包有 ${middle} 顆。活動準備了 ${third} 袋糖果，一共有多少顆糖果？`,
  ({ left, middle, third }) => `一個班有 ${left} 組，每組有 ${middle} 位學生。共有 ${third} 個班參加活動，一共有多少位學生？`,
  ({ left, middle, third }) => `一盒積木有 ${left} 層，每層有 ${middle} 塊。共有 ${third} 盒積木，一共有多少塊積木？`
]);

function buildTwoStepRows() {
  const rows = [];
  for (const third of thirdFactors) {
    for (let left = 2; left <= 9; left += 1) {
      for (let middle = 2; middle <= 9; middle += 1) {
        const product = left * middle * third;
        if (product <= 729) rows.push([left, middle, third]);
      }
    }
  }
  return Object.freeze(rows);
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) {
    acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  }
  return acc || 1;
}

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function permutationStep(seedValue, length) {
  const start = 3 + (seedValue % Math.max(1, length - 3));
  for (let candidate = start; candidate < start + length; candidate += 1) {
    const step = 1 + (candidate % Math.max(1, length - 1));
    if (gcd(step, length) === 1) return step;
  }
  return 1;
}

function wordProblemRowFor(sequenceNumber, seed) {
  const length = twoStepRows.length;
  const seedValue = hashSeed(`${sourceId}:${twoStepWordProblemSpecId}:${seed ?? "default"}`);
  const offset = seedValue % length;
  const step = permutationStep(seedValue, length);
  const index = (offset + ((sequenceNumber - 1) * step)) % length;
  return twoStepRows[index];
}

function contextIndexFor(sequenceNumber, operands, seed) {
  return hashSeed(`${seed ?? "default"}:${sequenceNumber}:${operands.join(":")}`) % wordProblemContexts.length;
}

function buildMissingRows() {
  const rows = [];
  const seen = new Set();
  function add(row) {
    const result = row.left * row.right;
    const blanks = row.blanks.map((blank) => `${blank.target}:${blank.placeValue}`).join("|");
    const key = `${row.left}x${row.right}=${result}|${blanks}`;
    if (!seen.has(key)) {
      seen.add(key);
      rows.push(row);
    }
  }
  for (let left = 23; left <= 987 && rows.length < 120; left += 17) {
    for (let right = 2; right <= 9 && rows.length < 120; right += 1) {
      const result = left * right;
      const leftPlaces = String(left).length === 2 ? [1, 0] : [2, 1, 0];
      const resultPlaces = Array.from({ length: String(result).length }, (_, index) => index);
      for (const leftPlace of leftPlaces) {
        for (const resultPlace of resultPlaces) {
          if (leftPlace !== resultPlace) add({ shape: "AC", left, right, blanks: [{ target: "left", placeValue: leftPlace }, { target: "result", placeValue: resultPlace }] });
          if (rows.length >= 120) break;
        }
        if (rows.length >= 120) break;
      }
    }
  }
  for (let left = 24; left <= 987 && rows.length < 240; left += 19) {
    for (let right = 2; right <= 9 && rows.length < 240; right += 1) {
      const result = left * right;
      const resultPlaces = Array.from({ length: String(result).length }, (_, index) => index).filter((placeValue) => placeValue !== 0);
      for (const resultPlace of resultPlaces) {
        add({ shape: "BC", left, right, blanks: [{ target: "right", placeValue: 0 }, { target: "result", placeValue: resultPlace }] });
        if (rows.length >= 240) break;
      }
    }
  }
  return Object.freeze(rows);
}

const twoStepRows = buildTwoStepRows();
const missingRows = buildMissingRows();

function isU03Plan(plan) {
  return plan?.sourceId === sourceId && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.some((id) => u03SpecIds.includes(id));
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

function pairFor(specId, sequenceNumber) {
  if (specId === "ps_g3a_u03_2digit_by_1digit_carry") return [10 + ((sequenceNumber * 17) % 90), 2 + ((sequenceNumber * 5) % 8)];
  if (specId === "ps_g3a_u03_10_multiple_by_1digit") return [10 * (1 + ((sequenceNumber - 1) % 9)), 2 + ((sequenceNumber * 3) % 8)];
  if (specId === "ps_g3a_u03_3digit_by_1digit") return [100 + ((sequenceNumber * 137) % 900), 2 + ((sequenceNumber * 5) % 8)];
  if (specId === zeroMiddleSpecId) return [100 * (1 + (sequenceNumber % 8)) + (1 + ((sequenceNumber * 7) % 9)), 2 + ((sequenceNumber * 5) % 8)];
  return null;
}

function metadata(specId) {
  return {
    sourceId,
    patternId: specId,
    patternTags: ["batch_a", "browser_bridge", sourceId, specId],
    skillTags: ["integer_multiplication"],
    difficultyTags: ["batch_a_browser_bridge", "g3a_u03_quality_locked"],
    curriculumNodeIds: [sourceId],
    canonicalSkillIds: ["integer_multiplication"],
    precedenceMode: "left_to_right",
    parenthesesMode: "none"
  };
}

function expressionFromOperands(operands) {
  let expression = createValueNode(createIntegerValue(operands[0]), 1);
  for (let index = 1; index < operands.length; index += 1) {
    expression = createBinaryNode(OPERATORS.MULTIPLY, expression, createValueNode(createIntegerValue(operands[index]), index + 1), { groupingHint: "leftAssociative" });
  }
  return expression;
}

function makeQuestion(specId, operands, sequenceNumber) {
  const expression = expressionFromOperands(operands);
  const answer = operands.reduce((product, value) => product * value, 1);
  const answerValue = createIntegerValue(answer);
  const question = createGeneratedQuestionSkeleton({
    id: `${specId}-${sequenceNumber}`,
    expression,
    operandCount: operands.length,
    operatorsUsed: operands.slice(1).map(() => OPERATORS.MULTIPLY),
    finalAnswer: answerValue,
    intermediateResults: [answerValue],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: buildDuplicateKey(expression),
    metadata: metadata(specId)
  });
  question.patternSpecId = specId;
  question.sourceId = sourceId;
  question.metadata = { ...question.metadata, sourceId };
  return question;
}

function makeWordProblemQuestion(sequenceNumber, seed) {
  const operands = wordProblemRowFor(sequenceNumber, seed);
  const question = makeQuestion(twoStepWordProblemSpecId, operands, sequenceNumber);
  const [left, middle, third] = operands;
  const answer = left * middle * third;
  const context = wordProblemContexts[contextIndexFor(sequenceNumber, operands, seed)]({ left, middle, third });
  question.kind = "multiplicationWordProblem";
  question.promptText = context;
  question.displayText = `${context} 答：${answer}`;
  question.blankedDisplayText = `${context} 答：____`;
  question.answerText = String(answer);
  question.finalAnswer = createIntegerValue(answer);
  question.metadata = {
    ...question.metadata,
    skillTags: ["integer_multiplication", "two_step_multiplication", "continuous_multiplication", "word_problem"],
    difficultyTags: ["batch_a_browser_bridge", "g3a_u03_quality_locked", "three_factor_product_word_problem"],
    contextTags: ["fixed_template", "word_problem"]
  };
  return question;
}

function placeIndex(value, placeValue) {
  return String(value).length - 1 - placeValue;
}

function mask(value, blanks) {
  const chars = String(value).split("");
  for (const blank of blanks) chars[blank.index] = "□";
  return chars.join("");
}

function blankFor(target, value, placeValue) {
  const index = placeIndex(value, placeValue);
  return { target, index, placeValue, digit: Number(String(value)[index]) };
}

function makeMissingQuestion(sequenceNumber) {
  const row = missingRows[(sequenceNumber - 1) % missingRows.length];
  const result = row.left * row.right;
  const blanks = row.blanks.map((blank) => blankFor(blank.target, blank.target === "left" ? row.left : blank.target === "right" ? row.right : result, blank.placeValue));
  const leftText = mask(row.left, blanks.filter((blank) => blank.target === "left"));
  const rightText = mask(row.right, blanks.filter((blank) => blank.target === "right"));
  const resultText = mask(result, blanks.filter((blank) => blank.target === "result"));
  const missingDigits = blanks.map((blank) => blank.digit);
  const answerText = missingDigits.join(",");
  return {
    id: `${missingInferenceSpecId}-${sequenceNumber}`,
    patternSpecId: missingInferenceSpecId,
    sourceId,
    kind: "multiplicationMissingDigit",
    operator: "multiply",
    shape: row.shape,
    left: row.left,
    right: row.right,
    result,
    blanks,
    missingDigits,
    answerOrder: "prompt_left_to_right",
    promptText: "依照□出現順序，填入正確的數字。",
    displayText: `${row.left} × ${row.right} = ${result}`,
    blankedDisplayText: `${leftText} × ${rightText} = ${resultText}`,
    answerText,
    finalAnswer: answerText,
    metadata: { ...metadata(missingInferenceSpecId), sourceId }
  };
}

function generateU03Question(specId, sequenceNumber, seed) {
  if (specId === twoStepSpecId) return makeQuestion(specId, twoStepRows[(sequenceNumber - 1) % twoStepRows.length], sequenceNumber);
  if (specId === twoStepWordProblemSpecId) return makeWordProblemQuestion(sequenceNumber, seed);
  if (specId === missingInferenceSpecId) return makeMissingQuestion(sequenceNumber);
  return makeQuestion(specId, pairFor(specId, sequenceNumber), sequenceNumber);
}

function questionKey(question) {
  if (question.kind === "multiplicationMissingDigit") return question.blankedDisplayText;
  if (question.kind === "multiplicationWordProblem") return question.blankedDisplayText;
  return question.duplicateKey ?? `${question.patternSpecId}:${JSON.stringify(question.expression)}`;
}

function interleaveByPattern(questions, allocation) {
  const buckets = new Map(allocation.map((entry) => [entry.patternSpecId, []]));
  for (const question of questions) buckets.get(question.patternSpecId)?.push(question);
  const output = [];
  let moved = true;
  while (moved) {
    moved = false;
    for (const entry of allocation) {
      const next = buckets.get(entry.patternSpecId)?.shift();
      if (next) {
        output.push(next);
        moved = true;
      }
    }
  }
  return output;
}

function orderQuestions(questions, plan, allocation) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  return interleaveByPattern(questions, allocation);
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!isU03Plan(plan)) return baseGenerateBatchABrowserQuestions(options);

  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? plan.allocation : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const seen = new Set();
  for (const entry of allocation) {
    if (!u03SpecIds.includes(entry.patternSpecId)) return baseGenerateBatchABrowserQuestions(options);
    let sequenceNumber = questions.length + 1;
    let acceptedForPattern = 0;
    let attempts = 0;
    while (acceptedForPattern < entry.questionCount && attempts < entry.questionCount * 50) {
      const question = generateU03Question(entry.patternSpecId, sequenceNumber + attempts, plan.generationSeed ?? options.generationSeed);
      const key = questionKey(question);
      if (!seen.has(key)) {
        seen.add(key);
        questions.push(question);
        acceptedForPattern += 1;
      }
      attempts += 1;
    }
    if (acceptedForPattern < entry.questionCount) {
      return { ok: false, plan, questions, allocation, errors: [{ code: "batch_a_g3a_u03_unique_pool_exhausted", severity: "error", path: entry.patternSpecId, message: "G3A-U03 unique question pool exhausted" }], warnings: [] };
    }
  }

  return { ok: true, plan, questions: orderQuestions(questions, plan, allocation), allocation, errors: [], warnings: [] };
}
