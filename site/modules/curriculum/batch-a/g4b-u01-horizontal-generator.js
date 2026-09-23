import {
  G4B_U01_SOURCE_ID,
  G4B_U01_HIDDEN_PATTERN_SPECS,
  getG4BU01HiddenPatternSpecById,
} from "./source-pattern-g4b-u01-horizontal-extension.js";

const MAX_GENERATION_ATTEMPTS = 96;
const MAX_HIDDEN_BATCH_COUNT = 1000;
const MAX_FINAL_VALUE = 9_999_999;

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s59d")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function randomInt(seed, offset, min, max) {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) {
    throw new Error(`G4B_U01_GEN_INVALID_RANGE:${min}:${max}`);
  }
  const mixed = mix32(seed + Math.imul(offset + 1, 0x9e3779b1));
  return min + (mixed % (max - min + 1));
}

function trailingZeroCount(value) {
  let current = Math.abs(value);
  let count = 0;
  while (current > 0 && current % 10 === 0) {
    count += 1;
    current /= 10;
  }
  return count;
}

function firstNonMultipleOf10(candidate, min, max) {
  let value = candidate;
  for (let i = 0; i <= max - min; i += 1) {
    if (value % 10 !== 0) return value;
    value += 1;
    if (value > max) value = min;
  }
  throw new Error("G4B_U01_GEN_NO_NON_TRAILING_ZERO_VALUE");
}

function sampleNonMultipleOf10(seed, offset, min, max) {
  return firstNonMultipleOf10(randomInt(seed, offset, min, max), min, max);
}

function multiplicationSample(a, b, extras = {}) {
  const answer = a * b;
  if (!Number.isSafeInteger(answer) || answer <= 0 || answer > MAX_FINAL_VALUE) return null;
  return {
    operator: "multiply",
    a,
    b,
    answer,
    quotient: null,
    remainder: null,
    ...extras,
  };
}

function divisionSample(dividend, divisor, quotient, remainder, extras = {}) {
  if (
    ![dividend, divisor, quotient, remainder].every(Number.isSafeInteger) ||
    divisor <= 0 ||
    quotient <= 0 ||
    remainder < 0 ||
    remainder >= divisor ||
    dividend !== divisor * quotient + remainder
  ) {
    return null;
  }
  return {
    operator: "divide",
    dividend,
    divisor,
    quotient,
    remainder,
    answer: quotient,
    ...extras,
  };
}

function sampleInternalZeroMultiplier(seed) {
  const a = randomInt(seed, 1, 100, 999);
  const digits = randomInt(seed, 2, 0, 1) === 0 ? 3 : 4;
  let b;
  if (digits === 3) {
    b = randomInt(seed, 3, 1, 9) * 100 + randomInt(seed, 4, 1, 9);
  } else {
    const thousands = randomInt(seed, 5, 1, 9);
    const ones = randomInt(seed, 6, 1, 9);
    const shape = randomInt(seed, 7, 0, 2);
    const hundreds = shape === 0 || shape === 2 ? 0 : randomInt(seed, 8, 1, 9);
    const tens = shape === 1 || shape === 2 ? 0 : randomInt(seed, 9, 1, 9);
    b = thousands * 1000 + hundreds * 100 + tens * 10 + ones;
  }
  return multiplicationSample(a, b, { internalZeroMultiplier: true });
}

function sampleOneTrailingFactor(seed, role) {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const offset = attempt * 13;
    const exponent = randomInt(seed, offset, 1, 3);
    const factor = 10 ** exponent;
    const baseMax = Math.floor(9999 / factor);
    const trailingValue = sampleNonMultipleOf10(seed, offset + 1, 1, baseMax) * factor;
    const otherMax = Math.min(9999, Math.floor(MAX_FINAL_VALUE / trailingValue));
    if (otherMax < 2) continue;
    const other = sampleNonMultipleOf10(seed, offset + 2, 2, otherMax);
    const a = role === "multiplicand" ? trailingValue : other;
    const b = role === "multiplier" ? trailingValue : other;
    const sampled = multiplicationSample(a, b, {
      trailingZeroRole: role,
      multiplicandTrailingZeroCount: trailingZeroCount(a),
      multiplierTrailingZeroCount: trailingZeroCount(b),
    });
    if (sampled) return sampled;
  }
  throw new Error(`G4B_U01_GEN_TRAILING_FACTOR_EXHAUSTED:${role}`);
}

function sampleBothTrailingFactors(seed) {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const offset = attempt * 17;
    const exponentA = randomInt(seed, offset, 1, 3);
    const exponentB = randomInt(seed, offset + 1, 1, 3);
    const factorA = 10 ** exponentA;
    const factorB = 10 ** exponentB;
    const baseAMax = Math.min(99, Math.floor(9999 / factorA));
    const baseBMax = Math.min(99, Math.floor(9999 / factorB));
    if (baseAMax < 1 || baseBMax < 1) continue;
    const baseA = sampleNonMultipleOf10(seed, offset + 2, 1, baseAMax);
    const baseB = sampleNonMultipleOf10(seed, offset + 3, 1, baseBMax);
    const a = baseA * factorA;
    const b = baseB * factorB;
    const sampled = multiplicationSample(a, b, {
      trailingZeroRole: "both",
      multiplicandTrailingZeroCount: exponentA,
      multiplierTrailingZeroCount: exponentB,
    });
    if (sampled) return sampled;
  }
  throw new Error("G4B_U01_GEN_BOTH_TRAILING_FACTORS_EXHAUSTED");
}

function samplePowerOfTenMultiplication(seed) {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const offset = attempt * 19;
    const totalExponent = randomInt(seed, offset, 1, 5);
    const exponentA = randomInt(seed, offset + 1, 0, totalExponent);
    const exponentB = totalExponent - exponentA;
    const factorA = 10 ** exponentA;
    const factorB = 10 ** exponentB;
    const baseAMax = Math.min(99, Math.floor(9999 / factorA));
    const baseBMax = Math.min(99, Math.floor(9999 / factorB));
    if (baseAMax < 2 || baseBMax < 2) continue;
    const baseA = sampleNonMultipleOf10(seed, offset + 2, 2, baseAMax);
    const baseB = sampleNonMultipleOf10(seed, offset + 3, 2, baseBMax);
    if (baseA * baseB * 10 ** totalExponent > MAX_FINAL_VALUE) continue;
    const a = baseA * factorA;
    const b = baseB * factorB;
    const sampled = multiplicationSample(a, b, {
      baseA,
      baseB,
      exponentA,
      exponentB,
      totalExponent,
    });
    if (sampled) return sampled;
  }
  throw new Error("G4B_U01_GEN_POWER10_EXHAUSTED");
}

function sampleDivision(seed, mode) {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const offset = attempt * 23;
    let divisor;
    let quotient;
    let dividendMin;
    let dividendMax;
    if (mode === "3d_3d") {
      quotient = randomInt(seed, offset, 1, 9);
      divisor = randomInt(seed, offset + 1, 100, Math.min(999, Math.floor(999 / quotient)));
      dividendMin = 100;
      dividendMax = 999;
    } else if (mode === "4d_3d_q2") {
      quotient = randomInt(seed, offset, 10, 99);
      const divisorMax = Math.min(999, Math.floor(9999 / quotient));
      if (divisorMax < 100) continue;
      divisor = randomInt(seed, offset + 1, 100, divisorMax);
      dividendMin = 1000;
      dividendMax = 9999;
    } else {
      quotient = randomInt(seed, offset, 1, 9);
      divisor = randomInt(seed, offset + 1, 100, 999);
      dividendMin = 1000;
      dividendMax = 9999;
    }
    const minimumRemainder = Math.max(0, dividendMin - divisor * quotient);
    const maximumRemainder = Math.min(divisor - 1, dividendMax - divisor * quotient);
    if (minimumRemainder > maximumRemainder) continue;
    const remainder = randomInt(seed, offset + 2, minimumRemainder, maximumRemainder);
    const sampled = divisionSample(divisor * quotient + remainder, divisor, quotient, remainder);
    if (sampled) return sampled;
  }
  throw new Error(`G4B_U01_GEN_DIVISION_EXHAUSTED:${mode}`);
}

function sampleTrailingZeroDivision(seed, requireRemainder) {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const offset = attempt * 29;
    const commonTrailingZeroCount = randomInt(seed, offset, 1, 3);
    const scale = 10 ** commonTrailingZeroCount;
    const reducedDivisorMax = Math.min(99, Math.floor(9999 / scale));
    if (reducedDivisorMax < 2) continue;
    const reducedDivisor = sampleNonMultipleOf10(seed, offset + 1, 2, reducedDivisorMax);
    const reducedDividendMax = Math.floor(99999 / scale);
    const quotientMax = Math.min(99, Math.floor(reducedDividendMax / reducedDivisor));
    if (quotientMax < 1) continue;
    const quotient = randomInt(seed, offset + 2, 1, quotientMax);
    const maximumReducedRemainder = Math.min(
      reducedDivisor - 1,
      reducedDividendMax - reducedDivisor * quotient,
    );
    const minimumReducedRemainder = requireRemainder ? 1 : 0;
    if (maximumReducedRemainder < minimumReducedRemainder) continue;
    const reducedRemainder = requireRemainder
      ? randomInt(seed, offset + 3, 1, maximumReducedRemainder)
      : 0;
    const reducedDividend = reducedDivisor * quotient + reducedRemainder;
    const dividend = reducedDividend * scale;
    const divisor = reducedDivisor * scale;
    if (dividend < 1000 || divisor < 100) continue;
    const remainder = reducedRemainder * scale;
    const sampled = divisionSample(dividend, divisor, quotient, remainder, {
      commonTrailingZeroCount,
      reducedDividend,
      reducedDivisor,
      reducedRemainder,
      remainderScale: scale,
    });
    if (sampled) return sampled;
  }
  throw new Error(
    `G4B_U01_GEN_TRAILING_ZERO_DIVISION_EXHAUSTED:${requireRemainder ? "remainder" : "exact"}`,
  );
}

function sampleForPatternSpec(patternSpecId, seed) {
  switch (patternSpecId) {
    case "ps_g4b_u01_3digit_by_3digit":
      return multiplicationSample(randomInt(seed, 1, 100, 999), randomInt(seed, 2, 100, 999));
    case "ps_g4b_u01_4digit_by_3digit":
      return multiplicationSample(randomInt(seed, 1, 1000, 9999), randomInt(seed, 2, 100, 999));
    case "ps_g4b_u01_multiplier_internal_zero":
      return sampleInternalZeroMultiplier(seed);
    case "ps_g4b_u01_multiplier_trailing_zero":
      return sampleOneTrailingFactor(seed, "multiplier");
    case "ps_g4b_u01_multiplicand_trailing_zero":
      return sampleOneTrailingFactor(seed, "multiplicand");
    case "ps_g4b_u01_both_factors_trailing_zero":
      return sampleBothTrailingFactors(seed);
    case "ps_g4b_u01_power10_multiplication":
      return samplePowerOfTenMultiplication(seed);
    case "ps_g4b_u01_3digit_div_3digit":
      return sampleDivision(seed, "3d_3d");
    case "ps_g4b_u01_4digit_div_3digit_2digit_quotient":
      return sampleDivision(seed, "4d_3d_q2");
    case "ps_g4b_u01_4digit_div_3digit_1digit_quotient":
      return sampleDivision(seed, "4d_3d_q1");
    case "ps_g4b_u01_trailing_zero_division_exact":
      return sampleTrailingZeroDivision(seed, false);
    case "ps_g4b_u01_trailing_zero_division_remainder_restore":
      return sampleTrailingZeroDivision(seed, true);
    default:
      throw new Error(`G4B_U01_GEN_PATTERN_SPEC_UNREGISTERED:${patternSpecId}`);
  }
}

function buildQuestion(spec, sampled, options) {
  const isMultiply = sampled.operator === "multiply";
  const left = isMultiply ? sampled.a : sampled.dividend;
  const right = isMultiply ? sampled.b : sampled.divisor;
  const symbol = isMultiply ? "×" : "÷";
  const requiresRemainderBlank = spec.answerModel.shape === "quotientRemainderAnswer";
  const promptText = `${left} ${symbol} ${right} = ${requiresRemainderBlank ? "______……______" : "______"}`;
  const answerText = isMultiply
    ? String(sampled.answer)
    : sampled.remainder > 0
      ? `${sampled.quotient}……${sampled.remainder}`
      : String(sampled.quotient);
  const equationModel = `${left} ${symbol} ${right} = ${answerText}`;
  const sequenceNumber = options.sequenceNumber ?? 1;
  return {
    id: options.id ?? `${spec.patternSpecId}-${sequenceNumber}`,
    sourceId: G4B_U01_SOURCE_ID,
    unitCode: "4B-U01",
    kind: "g4bU01HorizontalCalculation",
    phase: "S59D",
    patternSpecId: spec.patternSpecId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} 答案：${answerText}`,
    operator: sampled.operator,
    operands: isMultiply ? [sampled.a, sampled.b] : [sampled.dividend, sampled.divisor],
    quantities: { ...sampled },
    equationModel,
    answerModelShape: spec.answerModel.shape,
    finalAnswer: sampled.answer,
    quotient: sampled.quotient,
    remainder: sampled.remainder,
    answerText,
    divisionIdentityModel: isMultiply
      ? null
      : `${sampled.dividend} = ${sampled.divisor} × ${sampled.quotient} + ${sampled.remainder}`,
    representation: "horizontal_only",
    applicationText: false,
    selectorStatus: "hidden",
    generatorRouting: "hidden_only_not_canonical",
    productionUse: "forbidden",
    deterministicReplayKey: `${options.seed ?? "s59d"}:${spec.patternSpecId}:${sequenceNumber}`,
    metadata: {
      patternId: spec.patternSpecId,
      patternGroupId: spec.patternGroupId,
      sourceId: G4B_U01_SOURCE_ID,
      patternTags: ["batch_a", "g4b_u01", "s59d_hidden_generator"],
      skillTags: [sampled.operator === "multiply" ? "multi_digit_multiplication" : "multi_digit_division"],
      difficultyTags: ["horizontal_only", "s59d_hidden_deterministic"],
      curriculumNodeIds: [G4B_U01_SOURCE_ID],
    },
  };
}

function hasInternalZero(value) {
  const digits = String(value);
  return digits.slice(1, -1).includes("0") && digits[0] !== "0" && digits.at(-1) !== "0";
}

export function validateG4BU01HiddenGeneratedQuestion(question = {}) {
  const errors = [];
  const spec = getG4BU01HiddenPatternSpecById(
    question.patternSpecId ?? question.metadata?.patternId,
  );
  if (!spec) {
    errors.push(issue("G4B_U01_GEN_PATTERN_SPEC_UNREGISTERED", "patternSpecId", "PatternSpec is not registered."));
    return { ok: false, errors, warnings: [] };
  }
  if (question.sourceId !== G4B_U01_SOURCE_ID) errors.push(issue("G4B_U01_GEN_SOURCE_INVALID", "sourceId", "Source id is invalid."));
  if (question.kind !== "g4bU01HorizontalCalculation") errors.push(issue("G4B_U01_GEN_KIND_INVALID", "kind", "Question kind is invalid."));
  if (question.patternGroupId !== spec.patternGroupId) errors.push(issue("G4B_U01_GEN_GROUP_MISMATCH", "patternGroupId", "PatternGroup does not match PatternSpec."));
  if (question.knowledgePointId !== spec.knowledgePointId) errors.push(issue("G4B_U01_GEN_KP_MISMATCH", "knowledgePointId", "KnowledgePoint does not match PatternSpec."));
  if (question.representation !== "horizontal_only" || /\n/.test(question.promptText ?? "")) errors.push(issue("G4B_U01_GEN_NON_HORIZONTAL", "representation", "Only a single horizontal expression is allowed."));
  if (question.applicationText !== false || /[？?]/.test(question.promptText ?? "")) errors.push(issue("G4B_U01_GEN_APPLICATION_TEXT", "promptText", "Application wording is forbidden."));
  if (question.selectorStatus !== "hidden" || question.generatorRouting !== "hidden_only_not_canonical" || question.productionUse !== "forbidden") errors.push(issue("G4B_U01_GEN_SCOPE_PROMOTION", "productionUse", "Question escaped hidden scope."));
  if (!question.promptText || /\{[^}]+\}/.test(question.promptText)) errors.push(issue("G4B_U01_GEN_PROMPT_INVALID", "promptText", "Prompt is empty or unresolved."));

  const q = question.quantities ?? {};
  if (q.operator === "multiply") {
    if (question.finalAnswer !== q.a * q.b || question.answerText !== String(q.a * q.b)) errors.push(issue("G4B_U01_GEN_MULTIPLICATION_INVALID", "finalAnswer", "Multiplication answer is invalid."));
    if (q.a * q.b > MAX_FINAL_VALUE) errors.push(issue("G4B_U01_GEN_RESULT_RANGE", "finalAnswer", "Result exceeds the unit maximum."));
  } else if (q.operator === "divide") {
    if (q.divisor <= 0 || q.dividend !== q.divisor * q.quotient + q.remainder) errors.push(issue("G4B_U01_GEN_DIVISION_IDENTITY", "quantities", "Division identity is invalid."));
    if (q.remainder < 0 || q.remainder >= q.divisor) errors.push(issue("G4B_U01_GEN_REMAINDER_RANGE", "remainder", "Remainder is outside the legal range."));
    if (question.finalAnswer !== q.quotient || question.quotient !== q.quotient || question.remainder !== q.remainder) errors.push(issue("G4B_U01_GEN_DIVISION_ANSWER", "finalAnswer", "Division answer fields are invalid."));
  } else {
    errors.push(issue("G4B_U01_GEN_OPERATOR_INVALID", "operator", "Operator is invalid."));
  }

  switch (spec.patternSpecId) {
    case "ps_g4b_u01_3digit_by_3digit":
      if (String(q.a).length !== 3 || String(q.b).length !== 3) errors.push(issue("G4B_U01_GEN_DIGIT_SHAPE", "operands", "Expected 3-digit by 3-digit multiplication."));
      break;
    case "ps_g4b_u01_4digit_by_3digit":
      if (String(q.a).length !== 4 || String(q.b).length !== 3) errors.push(issue("G4B_U01_GEN_DIGIT_SHAPE", "operands", "Expected 4-digit by 3-digit multiplication."));
      break;
    case "ps_g4b_u01_multiplier_internal_zero":
      if (!hasInternalZero(q.b)) errors.push(issue("G4B_U01_GEN_INTERNAL_ZERO", "quantities.b", "Multiplier must contain an internal zero."));
      break;
    case "ps_g4b_u01_multiplier_trailing_zero":
      if (q.a % 10 === 0 || q.b % 10 !== 0) errors.push(issue("G4B_U01_GEN_TRAILING_ZERO_ROLE", "operands", "Only the multiplier may have trailing zeros."));
      break;
    case "ps_g4b_u01_multiplicand_trailing_zero":
      if (q.a % 10 !== 0 || q.b % 10 === 0) errors.push(issue("G4B_U01_GEN_TRAILING_ZERO_ROLE", "operands", "Only the multiplicand may have trailing zeros."));
      break;
    case "ps_g4b_u01_both_factors_trailing_zero":
      if (q.a % 10 !== 0 || q.b % 10 !== 0) errors.push(issue("G4B_U01_GEN_TRAILING_ZERO_ROLE", "operands", "Both factors must have trailing zeros."));
      break;
    case "ps_g4b_u01_power10_multiplication":
      if (q.answer !== q.baseA * q.baseB * 10 ** q.totalExponent) errors.push(issue("G4B_U01_GEN_POWER10", "quantities", "Power-of-ten scaling is invalid."));
      break;
    case "ps_g4b_u01_3digit_div_3digit":
      if (String(q.dividend).length !== 3 || String(q.divisor).length !== 3 || q.quotient > 9) errors.push(issue("G4B_U01_GEN_DIVISION_SHAPE", "quantities", "Expected 3-digit by 3-digit division with 1-digit quotient."));
      break;
    case "ps_g4b_u01_4digit_div_3digit_2digit_quotient":
      if (String(q.dividend).length !== 4 || String(q.divisor).length !== 3 || q.quotient < 10 || q.quotient > 99) errors.push(issue("G4B_U01_GEN_DIVISION_SHAPE", "quantities", "Expected 4-digit by 3-digit division with 2-digit quotient."));
      break;
    case "ps_g4b_u01_4digit_div_3digit_1digit_quotient":
      if (String(q.dividend).length !== 4 || String(q.divisor).length !== 3 || q.quotient > 9) errors.push(issue("G4B_U01_GEN_DIVISION_SHAPE", "quantities", "Expected 4-digit by 3-digit division with 1-digit quotient."));
      break;
    case "ps_g4b_u01_trailing_zero_division_exact":
      if (q.remainder !== 0 || q.commonTrailingZeroCount < 1) errors.push(issue("G4B_U01_GEN_EXACT_TRAILING_DIVISION", "quantities", "Expected exact trailing-zero division."));
      break;
    case "ps_g4b_u01_trailing_zero_division_remainder_restore":
      if (q.reducedRemainder <= 0 || q.remainder !== q.reducedRemainder * q.remainderScale) errors.push(issue("G4B_U01_GEN_REMAINDER_RESTORE", "remainder", "Original remainder scale was not restored."));
      break;
    default:
      break;
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4BU01HiddenQuestion(patternSpecId, options = {}) {
  const spec = getG4BU01HiddenPatternSpecById(patternSpecId);
  if (!spec) throw new Error(`G4B_U01_GEN_PATTERN_SPEC_UNREGISTERED:${patternSpecId}`);
  const sequenceNumber = options.sequenceNumber ?? 1;
  if (!Number.isSafeInteger(sequenceNumber) || sequenceNumber < 1) {
    throw new Error(`G4B_U01_GEN_SEQUENCE_INVALID:${sequenceNumber}`);
  }
  const seed = hashSeed(`${options.seed ?? "s59d"}:${patternSpecId}:${sequenceNumber}`);
  const sampled = sampleForPatternSpec(patternSpecId, seed);
  const question = buildQuestion(spec, sampled, { ...options, sequenceNumber });
  const validation = validateG4BU01HiddenGeneratedQuestion(question);
  if (!validation.ok) {
    throw new Error(`G4B_U01_GEN_STRUCTURAL_SELF_CHECK_FAILED:${validation.errors.map((entry) => entry.code).join(",")}`);
  }
  return question;
}

function normalizedPatternSpecIds(patternSpecIds) {
  const ids = patternSpecIds ?? G4B_U01_HIDDEN_PATTERN_SPECS.map((row) => row.patternSpecId);
  if (!Array.isArray(ids) || ids.length === 0 || new Set(ids).size !== ids.length) {
    throw new Error("G4B_U01_GEN_PATTERN_SPEC_SELECTION_INVALID");
  }
  for (const id of ids) {
    if (!getG4BU01HiddenPatternSpecById(id)) throw new Error(`G4B_U01_GEN_PATTERN_SPEC_UNREGISTERED:${id}`);
  }
  return [...ids];
}

export function generateG4BU01HiddenBatch(options = {}) {
  const count = options.count ?? 12;
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_HIDDEN_BATCH_COUNT) {
    throw new Error(`G4B_U01_GEN_COUNT_INVALID:${count}`);
  }
  const ordering = options.ordering ?? "grouped";
  if (!new Set(["grouped", "shuffled"]).has(ordering)) {
    throw new Error(`G4B_U01_GEN_ORDERING_INVALID:${ordering}`);
  }
  const ids = normalizedPatternSpecIds(options.patternSpecIds);
  const baseCount = Math.floor(count / ids.length);
  const extra = count % ids.length;
  const questions = [];
  ids.forEach((patternSpecId, specIndex) => {
    const allocation = baseCount + (specIndex < extra ? 1 : 0);
    for (let occurrence = 1; occurrence <= allocation; occurrence += 1) {
      questions.push(
        generateG4BU01HiddenQuestion(patternSpecId, {
          seed: options.seed ?? "s59d-batch",
          sequenceNumber: occurrence,
          id: `${patternSpecId}-${occurrence}`,
        }),
      );
    }
  });
  if (ordering === "shuffled") {
    const seed = hashSeed(options.seed ?? "s59d-batch");
    questions.sort((left, right) => {
      const leftRank = mix32(seed ^ hashSeed(left.deterministicReplayKey));
      const rightRank = mix32(seed ^ hashSeed(right.deterministicReplayKey));
      return leftRank - rightRank || left.id.localeCompare(right.id);
    });
  }
  return questions;
}

export function listG4BU01HiddenGeneratorPatternSpecIds() {
  return G4B_U01_HIDDEN_PATTERN_SPECS.map((row) => row.patternSpecId);
}
