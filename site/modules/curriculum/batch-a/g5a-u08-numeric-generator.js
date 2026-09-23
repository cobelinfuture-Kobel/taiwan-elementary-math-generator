import {
  G5A_U08_SOURCE_ID,
  getG5AU08HiddenPatternSpecById,
} from "./source-pattern-g5a-u08-extension.js";

const MAX_BATCH_COUNT = 1000;
const MAX_ATTEMPTS = 128;
const OPERATORS = Object.freeze(["+", "-", "×", "÷"]);

export const G5A_U08_S60G_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g5a_u08_mixed_precedence_3op",
  "ps_g5a_u08_mixed_precedence_4op",
  "ps_g5a_u08_add_sub_signed_regroup",
  "ps_g5a_u08_consecutive_subtraction",
  "ps_g5a_u08_mul_div_factor_regroup",
  "ps_g5a_u08_continuous_division",
  "ps_g5a_u08_distributive_expand_add",
  "ps_g5a_u08_distributive_expand_sub",
  "ps_g5a_u08_common_factor_add",
  "ps_g5a_u08_common_factor_sub",
  "ps_g5a_u08_near_round_add_multi",
  "ps_g5a_u08_round_completion_add",
  "ps_g5a_u08_near_round_sub_two",
  "ps_g5a_u08_near_round_sub_multi",
  "ps_g5a_u08_near_round_multiply_below",
  "ps_g5a_u08_near_round_multiply_above",
  "ps_g5a_u08_missing_operator_sequence",
  "ps_g5a_u08_equivalence_valid",
  "ps_g5a_u08_equivalence_invalid_duplicate_factor",
]);

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s60g")) {
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
    throw new Error(`G5A_U08_GEN_INVALID_RANGE:${min}:${max}`);
  }
  const mixed = mix32(seed + Math.imul(offset + 1, 0x9e3779b1));
  return min + (mixed % (max - min + 1));
}

function randomChoice(seed, offset, values) {
  return values[randomInt(seed, offset, 0, values.length - 1)];
}

function deterministicShuffle(values, seed) {
  const output = [...values];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(seed, output.length - index, 0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function evaluateOperatorSequence(operands, operators) {
  const values = [...operands];
  const ops = [...operators];
  for (let index = 0; index < ops.length;) {
    if (ops[index] === "×" || ops[index] === "÷") {
      const left = values[index];
      const right = values[index + 1];
      if (ops[index] === "÷" && right === 0) return null;
      const result = ops[index] === "×" ? left * right : left / right;
      if (!Number.isFinite(result)) return null;
      values.splice(index, 2, result);
      ops.splice(index, 1);
    } else {
      index += 1;
    }
  }
  let result = values[0];
  for (let index = 0; index < ops.length; index += 1) {
    result = ops[index] === "+" ? result + values[index + 1] : result - values[index + 1];
  }
  return result;
}

function enumerateOperatorSequences(operands) {
  const results = [];
  for (const first of OPERATORS) {
    for (const second of OPERATORS) {
      const value = evaluateOperatorSequence(operands, [first, second]);
      if (Number.isSafeInteger(value) && value >= 0) {
        results.push({ operators: [first, second], value });
      }
    }
  }
  return results;
}

function baseQuestion(patternSpecId, sample, seedLabel) {
  const spec = getG5AU08HiddenPatternSpecById(patternSpecId);
  if (!spec || !G5A_U08_S60G_PATTERN_SPEC_IDS.includes(patternSpecId)) {
    throw new Error(`G5A_U08_GEN_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  }
  return Object.freeze({
    sourceId: G5A_U08_SOURCE_ID,
    unitCode: "5A-U08",
    unitTitle: "整數四則",
    kind: "g5aU08IntegerFourOperations",
    representation: sample.mode === "numeric" ? "numeric_expression" : "reasoning_expression",
    applicationText: false,
    patternSpecId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: sample.mode,
    depth: "N",
    semanticDeltaIds: Object.freeze([]),
    answerModelShape: sample.answerModelShape,
    promptText: sample.promptText,
    answerText: sample.answerText,
    finalAnswer: sample.finalAnswer,
    structuredAnswer: sample.structuredAnswer ?? null,
    quantities: Object.freeze(sample.quantities),
    canonicalExpression: sample.canonicalExpression,
    strategyProof: Object.freeze(sample.strategyProof ?? {}),
    generatorRouting: "hidden_only_not_canonical",
    fallbackUsed: false,
    genericFallbackAllowed: false,
    seedLabel,
  });
}

function sampleMixedPrecedence3(seed) {
  const a = randomInt(seed, 1, 120, 700);
  const b = randomInt(seed, 2, 8, 45);
  const c = randomInt(seed, 3, 2, 9);
  const d = randomInt(seed, 4, 1, Math.min(90, a + b * c));
  const answer = a + b * c - d;
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${a}＋${b}×${c}－${d}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: `${a}+${b}*${c}-${d}`,
    quantities: { a, b, c, d },
    strategyProof: { multiplicationFirst: b * c, naiveLeftToRightValue: (a + b) * c - d },
  };
}

function sampleMixedPrecedence4(seed) {
  const a = randomInt(seed, 1, 200, 900);
  const b = randomInt(seed, 2, 5, 35);
  const c = randomInt(seed, 3, 2, 9);
  const e = randomInt(seed, 4, 2, 9);
  const quotient = randomInt(seed, 5, 2, 30);
  const d = e * quotient;
  const answer = a + b * c - quotient;
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${a}＋${b}×${c}－${d}÷${e}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: `${a}+${b}*${c}-${d}/${e}`,
    quantities: { a, b, c, d, e },
    strategyProof: { multiplicationFirst: b * c, divisionFirst: quotient },
  };
}

function sampleSignedRegroup(seed) {
  const roundBase = randomChoice(seed, 1, [100, 1000]);
  const b = randomInt(seed, 2, 11, roundBase - 11);
  const d = roundBase - b;
  const a = randomInt(seed, 3, roundBase, roundBase * 3);
  const c = randomInt(seed, 4, 20, roundBase);
  const answer = a - b + c - d;
  if (answer < 0) return sampleSignedRegroup(mix32(seed + 1));
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${a}－${b}＋${c}－${d}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: `${a}-${b}+${c}-${d}`,
    quantities: { a, b, c, d },
    strategyProof: { positiveTerms: [a, c], negativeTerms: [b, d], negativeTermSum: roundBase },
  };
}

function sampleConsecutiveSubtraction(seed) {
  const count = randomInt(seed, 1, 2, 4);
  const subtrahends = Array.from({ length: count }, (_, index) => randomInt(seed, index + 2, 10, 250));
  const sum = subtrahends.reduce((total, value) => total + value, 0);
  const answer = randomInt(seed, 12, 50, 800);
  const minuend = sum + answer;
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${[minuend, ...subtrahends].join("－")}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: `${minuend}-${subtrahends.join("-")}`,
    quantities: { minuend, subtrahends },
    strategyProof: { combinedSubtrahend: sum, normalizedExpression: `${minuend}－(${sum})` },
  };
}

function sampleMulDivFactorRegroup(seed) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const offset = attempt * 11;
    const divisor = randomInt(seed, offset + 1, 3, 12);
    const a = randomInt(seed, offset + 2, 11, 99);
    if (a % divisor === 0) continue;
    const multiplier = divisor * randomInt(seed, offset + 3, 2, 12);
    const extra = randomInt(seed, offset + 4, 2, 9);
    const numerator = a * multiplier * extra;
    if (numerator % divisor !== 0) continue;
    const answer = numerator / divisor;
    return {
      mode: "numeric",
      answerModelShape: "numericAnswer",
      promptText: `${a}÷${divisor}×${multiplier}×${extra}＝______`,
      answerText: String(answer),
      finalAnswer: answer,
      canonicalExpression: `${a}/${divisor}*${multiplier}*${extra}`,
      quantities: { a, divisor, multiplier, extra },
      strategyProof: {
        nonIntegerLeftToRightIntermediate: a / divisor,
        cancellationFactor: divisor,
        regroupedMultiplier: multiplier / divisor,
      },
    };
  }
  throw new Error("G5A_U08_GEN_MUL_DIV_REGROUP_EXHAUSTED");
}

function sampleContinuousDivision(seed) {
  const divisorA = randomInt(seed, 1, 2, 15);
  const divisorB = randomInt(seed, 2, 2, 15);
  const quotient = randomInt(seed, 3, 2, 60);
  const dividend = divisorA * divisorB * quotient;
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${dividend}÷${divisorA}÷${divisorB}＝______`,
    answerText: String(quotient),
    finalAnswer: quotient,
    canonicalExpression: `${dividend}/${divisorA}/${divisorB}`,
    quantities: { dividend, divisors: [divisorA, divisorB] },
    strategyProof: { combinedDivisor: divisorA * divisorB, normalizedExpression: `${dividend}÷(${divisorA * divisorB})` },
  };
}

function sampleDistributiveExpand(seed, operation) {
  const a = randomInt(seed, 1, 50, 900);
  const b = operation === "add" ? randomInt(seed, 2, 10, 500) : randomInt(seed, 2, 10, a - 1);
  const c = randomInt(seed, 3, 2, 30);
  const inner = operation === "add" ? a + b : a - b;
  const answer = inner * c;
  const symbol = operation === "add" ? "＋" : "－";
  const ascii = operation === "add" ? "+" : "-";
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `(${a}${symbol}${b})×${c}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: `(${a}${ascii}${b})*${c}`,
    quantities: { a, b, c },
    strategyProof: {
      expandedTerms: operation === "add" ? [a * c, b * c] : [a * c, -(b * c)],
      expandedExpression: `${a}×${c}${symbol}${b}×${c}`,
    },
  };
}

function sampleCommonFactor(seed, operation) {
  const a = randomInt(seed, 1, operation === "add" ? 10 : 20, 200);
  const b = operation === "add" ? randomInt(seed, 2, 10, 200) : randomInt(seed, 2, 5, a - 1);
  const c = randomInt(seed, 3, 3, 50);
  const answer = (operation === "add" ? a + b : a - b) * c;
  const symbol = operation === "add" ? "＋" : "－";
  const ascii = operation === "add" ? "+" : "-";
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${a}×${c}${symbol}${b}×${c}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: `${a}*${c}${ascii}${b}*${c}`,
    quantities: { a, b, c },
    strategyProof: { commonFactor: c, factoredExpression: `(${a}${symbol}${b})×${c}` },
  };
}

function nearRoundTerm(seed, offset, base) {
  return base - randomInt(seed, offset, 1, Math.min(9, base - 1));
}

function sampleNearRoundAdd(seed) {
  const count = randomInt(seed, 1, 3, 5);
  const bases = Array.from({ length: count }, (_, index) => randomChoice(seed, index + 2, [100, 1000, 10000]));
  const terms = bases.map((base, index) => nearRoundTerm(seed, index + 10, base));
  const answer = terms.reduce((sum, value) => sum + value, 0);
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${terms.join("＋")}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: terms.join("+"),
    quantities: { terms, roundBases: bases },
    strategyProof: { compensationOffsets: bases.map((base, index) => base - terms[index]) },
  };
}

function sampleRoundCompletionAdd(seed) {
  const base = randomChoice(seed, 1, [100, 1000, 10000]);
  const x = randomInt(seed, 2, 5, Math.min(95, base - 5));
  const pairA = base - x;
  const pairB = x;
  const extraA = randomInt(seed, 3, 20, 500);
  const extraB = randomInt(seed, 4, 20, 500);
  const terms = [pairA, extraA, pairB, extraB];
  const answer = terms.reduce((sum, value) => sum + value, 0);
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${terms.join("＋")}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: terms.join("+"),
    quantities: { terms },
    strategyProof: { completionPairIndices: [0, 2], completionPairSum: base },
  };
}

function sampleNearRoundSub(seed, count) {
  const bases = Array.from({ length: count }, (_, index) => randomChoice(seed, index + 1, [100, 1000]));
  const subtrahends = bases.map((base, index) => nearRoundTerm(seed, index + 10, base));
  const subtrahendSum = subtrahends.reduce((sum, value) => sum + value, 0);
  const answer = randomInt(seed, 30, 50, 900);
  const minuend = subtrahendSum + answer;
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${minuend}－${subtrahends.join("－")}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: `${minuend}-${subtrahends.join("-")}`,
    quantities: { minuend, subtrahends, roundBases: bases },
    strategyProof: { compensationOffsets: bases.map((base, index) => base - subtrahends[index]) },
  };
}

function sampleNearRoundMultiply(seed, direction) {
  const base = randomChoice(seed, 1, [100, 1000, 10000]);
  const offset = randomInt(seed, 2, 1, 9);
  const factor = direction === "below" ? base - offset : base + offset;
  const multiplier = randomInt(seed, 3, 2, direction === "below" ? 99 : 300);
  const answer = factor * multiplier;
  return {
    mode: "numeric",
    answerModelShape: "numericAnswer",
    promptText: `${factor}×${multiplier}＝______`,
    answerText: String(answer),
    finalAnswer: answer,
    canonicalExpression: `${factor}*${multiplier}`,
    quantities: { factor, multiplier, roundBase: base, offset, direction },
    strategyProof: {
      compensationExpression: direction === "below"
        ? `${base}×${multiplier}－${offset}×${multiplier}`
        : `${base}×${multiplier}＋${offset}×${multiplier}`,
    },
  };
}

function sampleMissingOperator(seed) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const offset = attempt * 7;
    const operands = [
      randomInt(seed, offset + 1, 2, 20),
      randomInt(seed, offset + 2, 2, 12),
      randomInt(seed, offset + 3, 2, 20),
    ];
    const candidates = enumerateOperatorSequences(operands);
    const byValue = new Map();
    for (const candidate of candidates) {
      const bucket = byValue.get(candidate.value) ?? [];
      bucket.push(candidate.operators);
      byValue.set(candidate.value, bucket);
    }
    const uniqueCandidates = candidates.filter((candidate) => byValue.get(candidate.value).length === 1);
    if (uniqueCandidates.length === 0) continue;
    const selected = uniqueCandidates[randomInt(seed, offset + 4, 0, uniqueCandidates.length - 1)];
    return {
      mode: "reasoning",
      answerModelShape: "operatorSequenceAnswer",
      promptText: `${operands[0]} □ ${operands[1]} □ ${operands[2]}＝${selected.value}`,
      answerText: selected.operators.join("、"),
      finalAnswer: selected.value,
      structuredAnswer: { operators: selected.operators },
      canonicalExpression: `${operands[0]}${selected.operators[0]}${operands[1]}${selected.operators[1]}${operands[2]}`,
      quantities: { operands, target: selected.value },
      strategyProof: { solutionCount: 1, allowedOperators: OPERATORS },
    };
  }
  throw new Error("G5A_U08_GEN_OPERATOR_SEQUENCE_EXHAUSTED");
}

function sampleEquivalence(seed, valid) {
  const a = randomInt(seed, 1, valid ? 2 : 10, 80);
  const b = valid ? randomInt(seed, 2, 2, 80) : randomInt(seed, 2, 2, a - 1);
  const c = randomInt(seed, 3, 2, 20);
  const leftValue = valid ? a * c + b * c : a * c - b * c;
  const rightValue = valid ? (a + b) * c : (a - b) * c * c;
  return {
    mode: "reasoning",
    answerModelShape: "equalityJudgementAnswer",
    promptText: `${a}×${c}${valid ? "＋" : "－"}${b}×${c} ${valid ? "＝" : "□"} ${valid ? `(${a}＋${b})×${c}` : `(${a}－${b})×${c}×${c}`}，兩式相等嗎？`,
    answerText: valid ? "相等" : "不相等，多乘了一個公因數",
    finalAnswer: valid ? 1 : 0,
    structuredAnswer: {
      isEqual: valid,
      leftValue,
      rightValue,
      errorType: valid ? null : "duplicated_common_factor",
    },
    canonicalExpression: valid
      ? `${a}*${c}+${b}*${c}=(${a}+${b})*${c}`
      : `${a}*${c}-${b}*${c}!=(${a}-${b})*${c}*${c}`,
    quantities: { a, b, c },
    strategyProof: { commonFactor: c },
  };
}

function sampleForPatternSpec(patternSpecId, seed) {
  switch (patternSpecId) {
    case "ps_g5a_u08_mixed_precedence_3op": return sampleMixedPrecedence3(seed);
    case "ps_g5a_u08_mixed_precedence_4op": return sampleMixedPrecedence4(seed);
    case "ps_g5a_u08_add_sub_signed_regroup": return sampleSignedRegroup(seed);
    case "ps_g5a_u08_consecutive_subtraction": return sampleConsecutiveSubtraction(seed);
    case "ps_g5a_u08_mul_div_factor_regroup": return sampleMulDivFactorRegroup(seed);
    case "ps_g5a_u08_continuous_division": return sampleContinuousDivision(seed);
    case "ps_g5a_u08_distributive_expand_add": return sampleDistributiveExpand(seed, "add");
    case "ps_g5a_u08_distributive_expand_sub": return sampleDistributiveExpand(seed, "sub");
    case "ps_g5a_u08_common_factor_add": return sampleCommonFactor(seed, "add");
    case "ps_g5a_u08_common_factor_sub": return sampleCommonFactor(seed, "sub");
    case "ps_g5a_u08_near_round_add_multi": return sampleNearRoundAdd(seed);
    case "ps_g5a_u08_round_completion_add": return sampleRoundCompletionAdd(seed);
    case "ps_g5a_u08_near_round_sub_two": return sampleNearRoundSub(seed, 2);
    case "ps_g5a_u08_near_round_sub_multi": return sampleNearRoundSub(seed, randomInt(seed, 1, 3, 4));
    case "ps_g5a_u08_near_round_multiply_below": return sampleNearRoundMultiply(seed, "below");
    case "ps_g5a_u08_near_round_multiply_above": return sampleNearRoundMultiply(seed, "above");
    case "ps_g5a_u08_missing_operator_sequence": return sampleMissingOperator(seed);
    case "ps_g5a_u08_equivalence_valid": return sampleEquivalence(seed, true);
    case "ps_g5a_u08_equivalence_invalid_duplicate_factor": return sampleEquivalence(seed, false);
    default: throw new Error(`G5A_U08_GEN_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  }
}

export function generateG5AU08HiddenQuestion(patternSpecId, seed = "s60g") {
  const normalizedSeed = hashSeed(`${seed}:${patternSpecId}`);
  return baseQuestion(patternSpecId, sampleForPatternSpec(patternSpecId, normalizedSeed), String(seed));
}

function normalizeSelectedPatternSpecIds(selectedPatternSpecIds) {
  const selected = selectedPatternSpecIds == null
    ? [...G5A_U08_S60G_PATTERN_SPEC_IDS]
    : [...new Set(selectedPatternSpecIds)];
  if (selected.length === 0) throw new Error("G5A_U08_GEN_EMPTY_PATTERN_SELECTION");
  for (const id of selected) {
    if (!G5A_U08_S60G_PATTERN_SPEC_IDS.includes(id)) {
      throw new Error(`G5A_U08_GEN_PATTERN_SPEC_UNSUPPORTED:${id}`);
    }
  }
  return selected;
}

export function generateG5AU08HiddenBatch({
  questionCount,
  seed = "s60g-batch",
  selectedPatternSpecIds = null,
  ordering = "grouped",
} = {}) {
  if (!Number.isSafeInteger(questionCount) || questionCount < 1 || questionCount > MAX_BATCH_COUNT) {
    throw new Error(`G5A_U08_GEN_QUESTION_COUNT_INVALID:${questionCount}`);
  }
  if (!new Set(["grouped", "shuffled"]).has(ordering)) {
    throw new Error(`G5A_U08_GEN_ORDERING_INVALID:${ordering}`);
  }
  const selected = normalizeSelectedPatternSpecIds(selectedPatternSpecIds);
  const counts = new Map(selected.map((id) => [id, 0]));
  for (let index = 0; index < questionCount; index += 1) {
    counts.set(selected[index % selected.length], counts.get(selected[index % selected.length]) + 1);
  }

  const rows = [];
  for (const patternSpecId of selected) {
    const count = counts.get(patternSpecId);
    for (let index = 0; index < count; index += 1) {
      rows.push(generateG5AU08HiddenQuestion(patternSpecId, `${seed}:${patternSpecId}:${index}`));
    }
  }
  const questions = ordering === "shuffled" ? deterministicShuffle(rows, hashSeed(seed)) : rows;
  return Object.freeze({
    sourceId: G5A_U08_SOURCE_ID,
    unitCode: "5A-U08",
    kind: "g5aU08IntegerFourOperationsBatch",
    questionCount,
    ordering,
    seed: String(seed),
    selectedPatternSpecIds: Object.freeze(selected),
    allocation: Object.freeze(Object.fromEntries(counts)),
    generatorRouting: "hidden_only_not_canonical",
    fallbackUsed: false,
    questions: Object.freeze(questions),
  });
}
