import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import {
  G6A_U01_PATTERN_SPEC_IDS,
  G6A_U01_SOURCE_ID,
  getBatchABrowserPatternDefinition,
} from "./source-pattern-full-product-p01d2-extension.js";

const SPEC_SET = new Set(G6A_U01_PATTERN_SPEC_IDS);
const PRIME_POOL = Object.freeze([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113]);
const COMPOSITE_POOL = Object.freeze([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 27, 28, 30, 32, 33, 35, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 66, 70, 72, 75, 80, 84, 90, 96, 100, 108, 112, 120]);
const FACTOR_NUMBER_POOL = Object.freeze([12, 18, 20, 24, 27, 28, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 72, 75, 80, 84, 90, 96, 100, 108, 120, 126, 140, 144, 150, 168, 180, 200, 210, 216, 225, 240, 252, 270, 288, 300, 315, 320, 336, 360, 375, 400, 420, 450, 480]);
const COMMON_PRODUCTS = Object.freeze([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24]);
const COPRIME_TAIL_PAIRS = Object.freeze([[2, 3], [3, 4], [4, 5], [5, 6], [5, 7], [7, 8], [7, 9], [8, 9], [9, 10], [11, 12], [11, 13]]);
const LCM_PAIRS = Object.freeze(Array.from({ length: 35 }, (_, index) => index + 2)
  .flatMap((left) => Array.from({ length: 35 }, (_, index) => index + 2)
    .filter((right) => right > left && leastCommonMultiple(left, right) <= 900)
    .map((right) => Object.freeze([left, right]))));

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "p01d2")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function state(seed, index, channel) {
  return mix32((hashSeed(`${seed}:${channel}`) + Math.imul(Math.max(1, Number(index) || 1), 0x9e3779b1)) >>> 0);
}

function pick(values, seed, index, channel) {
  return values[state(seed, index, channel) % values.length];
}

export function isPrime(value) {
  if (!Number.isSafeInteger(value) || value < 2) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) if (value % divisor === 0) return false;
  return true;
}

export function primeFactors(value) {
  if (!Number.isSafeInteger(value) || value < 2) return [];
  const output = [];
  let remaining = value;
  for (let divisor = 2; divisor * divisor <= remaining; divisor += divisor === 2 ? 1 : 2) {
    while (remaining % divisor === 0) {
      output.push(divisor);
      remaining /= divisor;
    }
  }
  if (remaining > 1) output.push(remaining);
  return output;
}

export function primeExponentMap(value) {
  const map = {};
  for (const factor of primeFactors(value)) map[factor] = (map[factor] ?? 0) + 1;
  return map;
}

export function greatestCommonFactor(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

export function leastCommonMultiple(left, right) {
  if (left === 0 || right === 0) return 0;
  return Math.abs((left / greatestCommonFactor(left, right)) * right);
}

function factorProductText(factors) {
  return factors.join(" × ");
}

function exponentText(exponents) {
  return Object.entries(exponents)
    .map(([prime, exponent]) => exponent === 1 ? prime : `${prime}^${exponent}`)
    .join(" × ");
}

function metadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["full_product_w1", G6A_U01_SOURCE_ID, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [G6A_U01_SOURCE_ID],
    canonicalSkillIds: [...definition.canonicalSkillIds],
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
  };
}

function questionBase(definition, index, promptText, answerText, fields = {}) {
  return {
    id: `${definition.patternSpecId}-${index}`,
    sourceId: G6A_U01_SOURCE_ID,
    patternSpecId: definition.patternSpecId,
    kind: "g6aU01NumberTheory",
    operation: definition.operation,
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText: String(answerText),
    finalAnswer: answerText,
    metadata: metadata(definition),
    ...fields,
  };
}

function classification(value) {
  if (value === 1) return "兩者皆非";
  return isPrime(value) ? "質數" : "合數";
}

function generateClassification(definition, index, seed) {
  const mode = index % 3;
  const value = mode === 1 ? 1 : mode === 2
    ? pick(PRIME_POOL, seed, index, `${definition.patternSpecId}:prime`)
    : pick(COMPOSITE_POOL, seed, index, `${definition.patternSpecId}:composite`);
  const answer = classification(value);
  return questionBase(definition, index, `${value} 是質數、合數，還是兩者皆非？`, answer, { value, classification: answer, divisors: divisorsOf(value) });
}

function divisorsOf(value) {
  if (!Number.isSafeInteger(value) || value < 1) return [];
  const divisors = [];
  for (let divisor = 1; divisor * divisor <= value; divisor += 1) {
    if (value % divisor !== 0) continue;
    divisors.push(divisor);
    if (divisor * divisor !== value) divisors.push(value / divisor);
  }
  return divisors.sort((a, b) => a - b);
}

function generatePrimeInterval(definition, index, seed) {
  const start = 1 + (state(seed, index, `${definition.patternSpecId}:start`) % 70);
  const width = 10 + (state(seed, index, `${definition.patternSpecId}:width`) % 16);
  const end = Math.min(100, start + width);
  const primes = [];
  for (let value = start; value <= end; value += 1) if (isPrime(value)) primes.push(value);
  const answer = primes.join("、");
  return questionBase(definition, index, `列出 ${start} 到 ${end} 之間的所有質數。`, answer, { start, end, primes });
}

function generateFactorization(definition, index, seed) {
  const value = pick(FACTOR_NUMBER_POOL, seed, index, definition.patternSpecId);
  const factors = primeFactors(value);
  const exponents = primeExponentMap(value);
  const exponentForm = exponentText(exponents);
  const productForm = factorProductText(factors);
  if (definition.operation === "prime_factorization_product") {
    return questionBase(definition, index, `把 ${value} 分解成質因數的乘積。`, productForm, { value, primeFactors: factors, primeExponents: exponents, productForm, exponentForm });
  }
  return questionBase(definition, index, `用指數記法寫出 ${value} 的質因數分解。`, exponentForm, { value, primeFactors: factors, primeExponents: exponents, productForm, exponentForm });
}

function pairWithCommonProduct(seed, index, channel) {
  const commonProduct = pick(COMMON_PRODUCTS, seed, index, `${channel}:common`);
  const [leftTail, rightTail] = pick(COPRIME_TAIL_PAIRS, seed, index, `${channel}:tails`);
  const left = commonProduct * leftTail;
  const right = commonProduct * rightTail;
  return { left, right, commonProduct, leftTail, rightTail, commonPrimeFactors: primeFactors(commonProduct) };
}

function shortDivisionTrace(data) {
  let left = data.left;
  let right = data.right;
  const steps = [];
  for (const divisor of data.commonPrimeFactors) {
    const nextLeft = left / divisor;
    const nextRight = right / divisor;
    steps.push({ divisor, leftBefore: left, rightBefore: right, leftAfter: nextLeft, rightAfter: nextRight });
    left = nextLeft;
    right = nextRight;
  }
  return steps;
}

function traceText(steps) {
  return steps.map((step) => `${step.divisor}：${step.leftBefore},${step.rightBefore}→${step.leftAfter},${step.rightAfter}`).join("；");
}

function generateShortDivision(definition, index, seed) {
  const data = pairWithCommonProduct(seed, index, definition.patternSpecId);
  const steps = shortDivisionTrace(data);
  if (definition.operation === "short_division_trace") {
    const answer = traceText(steps);
    return questionBase(definition, index, `用共同質因數短除 ${data.left} 和 ${data.right}，寫出每一步。`, answer, { ...data, steps, traceText: answer });
  }
  const answer = `共同因數乘積 ${data.commonProduct}；末端商 ${data.leftTail}、${data.rightTail}`;
  return questionBase(definition, index, `用短除法處理 ${data.left} 和 ${data.right}，寫出共同因數乘積與最後兩個互質的商。`, answer, { ...data, steps });
}

function generateGcf(definition, index, seed) {
  const data = pairWithCommonProduct(seed, index, definition.patternSpecId);
  const gcf = greatestCommonFactor(data.left, data.right);
  const leftPrimeExponents = primeExponentMap(data.left);
  const rightPrimeExponents = primeExponentMap(data.right);
  const prompt = definition.operation === "gcf_direct"
    ? `求 ${data.left} 和 ${data.right} 的最大公因數。`
    : `已知 ${data.left} = ${exponentText(leftPrimeExponents)}，${data.right} = ${exponentText(rightPrimeExponents)}，求最大公因數。`;
  return questionBase(definition, index, prompt, gcf, { ...data, gcf, leftPrimeExponents, rightPrimeExponents });
}

function generateLcm(definition, index, seed) {
  const [left, right] = pick(LCM_PAIRS, seed, index, definition.patternSpecId);
  const lcm = leastCommonMultiple(left, right);
  const gcf = greatestCommonFactor(left, right);
  const leftPrimeExponents = primeExponentMap(left);
  const rightPrimeExponents = primeExponentMap(right);
  const prompt = definition.operation === "lcm_direct"
    ? `求 ${left} 和 ${right} 的最小公倍數。`
    : `已知 ${left} = ${exponentText(leftPrimeExponents)}，${right} = ${exponentText(rightPrimeExponents)}，求最小公倍數。`;
  return questionBase(definition, index, prompt, lcm, { left, right, lcm, gcf, leftPrimeExponents, rightPrimeExponents });
}

function generateQuestion(definition, index, seed) {
  if (definition.operation === "classify_prime_composite_neither") return generateClassification(definition, index, seed);
  if (definition.operation === "list_primes_in_interval") return generatePrimeInterval(definition, index, seed);
  if (["prime_factorization_product", "prime_factorization_exponents"].includes(definition.operation)) return generateFactorization(definition, index, seed);
  if (["short_division_trace", "short_division_common_product"].includes(definition.operation)) return generateShortDivision(definition, index, seed);
  if (["gcf_direct", "gcf_from_prime_exponents"].includes(definition.operation)) return generateGcf(definition, index, seed);
  if (["lcm_direct", "lcm_from_prime_exponents"].includes(definition.operation)) return generateLcm(definition, index, seed);
  throw new Error(`g6a_u01_operation_not_supported:${definition.operation}`);
}

function allocate(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return { patternSpecId, questionCount: count };
  }).filter((row) => row.questionCount > 0);
}

function shuffled(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  return [...questions].sort((left, right) => state(plan.generationSeed, 1, left.id) - state(plan.generationSeed, 1, right.id));
}

export function canGenerateG6AU01NumberTheoryQuestions(plan = {}) {
  return plan.sourceId === G6A_U01_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((patternSpecId) => SPEC_SET.has(patternSpecId));
}

export function validateG6AU01NumberTheoryQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const definition = getBatchABrowserPatternDefinition(question.patternSpecId ?? question.metadata?.patternId);
  if (!definition || definition.sourceId !== G6A_U01_SOURCE_ID || definition.kind !== "g6aU01NumberTheory") add("g6a_u01_pattern_not_supported", "patternSpecId");
  if (question.sourceId !== G6A_U01_SOURCE_ID || question.metadata?.sourceId !== G6A_U01_SOURCE_ID) add("g6a_u01_source_mismatch", "sourceId");
  if (String(question.blankedDisplayText ?? "").includes("{")) add("g6a_u01_prompt_slot_unresolved", "blankedDisplayText");
  try {
    if (question.operation === "classify_prime_composite_neither") {
      const expected = classification(question.value);
      if (question.classification !== expected || question.answerText !== expected) add("g6a_u01_classification_invalid", "answerText");
    } else if (question.operation === "list_primes_in_interval") {
      const expected = [];
      for (let value = question.start; value <= question.end; value += 1) if (isPrime(value)) expected.push(value);
      if (JSON.stringify(question.primes) !== JSON.stringify(expected) || question.answerText !== expected.join("、")) add("g6a_u01_prime_interval_invalid", "answerText");
    } else if (["prime_factorization_product", "prime_factorization_exponents"].includes(question.operation)) {
      const factors = primeFactors(question.value);
      const exponents = primeExponentMap(question.value);
      const expected = question.operation === "prime_factorization_product" ? factorProductText(factors) : exponentText(exponents);
      if (JSON.stringify(question.primeFactors) !== JSON.stringify(factors) || JSON.stringify(question.primeExponents) !== JSON.stringify(exponents) || question.answerText !== expected) add("g6a_u01_prime_factorization_invalid", "answerText");
    } else if (["short_division_trace", "short_division_common_product"].includes(question.operation)) {
      const expectedGcf = greatestCommonFactor(question.left, question.right);
      const steps = shortDivisionTrace({ left: question.left, right: question.right, commonPrimeFactors: primeFactors(expectedGcf) });
      if (expectedGcf !== question.commonProduct || greatestCommonFactor(question.leftTail, question.rightTail) !== 1) add("g6a_u01_short_division_invariant_invalid", "commonProduct");
      const expectedAnswer = question.operation === "short_division_trace"
        ? traceText(steps)
        : `共同因數乘積 ${expectedGcf}；末端商 ${question.left / expectedGcf}、${question.right / expectedGcf}`;
      if (question.answerText !== expectedAnswer) add("g6a_u01_short_division_answer_invalid", "answerText");
    } else if (["gcf_direct", "gcf_from_prime_exponents"].includes(question.operation)) {
      const expected = greatestCommonFactor(question.left, question.right);
      if (question.gcf !== expected || Number(question.answerText) !== expected) add("g6a_u01_gcf_invalid", "answerText");
    } else if (["lcm_direct", "lcm_from_prime_exponents"].includes(question.operation)) {
      const expected = leastCommonMultiple(question.left, question.right);
      if (question.lcm !== expected || Number(question.answerText) !== expected || question.gcf * question.lcm !== question.left * question.right) add("g6a_u01_lcm_invalid", "answerText");
    } else add("g6a_u01_operation_not_supported", "operation");
  } catch (error) {
    add(error.code ?? error.message ?? "g6a_u01_validation_exception", "question");
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG6AU01NumberTheoryQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG6AU01NumberTheoryQuestions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "g6a_u01_plan_not_supported", severity: "error", path: "plan", message: "G6A-U01 plan is outside admitted PatternSpecs." }], warnings: [] };
  }
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? clone(plan.allocation) : allocate(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const entry of allocation) {
    if (!SPEC_SET.has(entry.patternSpecId)) {
      errors.push({ code: "g6a_u01_pattern_not_supported", severity: "error", path: entry.patternSpecId, message: "Unsupported G6A-U01 PatternSpec." });
      continue;
    }
    const definition = getBatchABrowserPatternDefinition(entry.patternSpecId);
    for (let offset = 0; offset < entry.questionCount; offset += 1) {
      const question = generateQuestion(definition, questions.length + 1, `${plan.generationSeed}:${entry.patternSpecId}`);
      const validation = validateG6AU01NumberTheoryQuestion(question);
      errors.push(...validation.errors);
      questions.push(question);
    }
  }
  return {
    ok: errors.length === 0 && questions.length === plan.questionCount,
    plan,
    questions: shuffled(questions, plan),
    allocation,
    errors,
    warnings: [],
  };
}

// PGC-R04 final number-theory LCM parameter expansion
