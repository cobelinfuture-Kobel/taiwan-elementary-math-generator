import {
  G4B_U04_SOURCE_ID,
  getG4BU04HiddenPatternSpecById,
} from "./source-pattern-g4b-u04-extension.js";

const MAX_BATCH_COUNT = 1000;
const MAX_INPUT = 99_999_999;

export const G4B_U04_TARGET_UNITS = Object.freeze([10, 100, 1000, 10000]);
export const G4B_U04_APPROXIMATION_CUES = Object.freeze(["大約", "大概", "差不多", "將近", "接近"]);
export const G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4b_u04_approx_language_classify",
  "ps_g4b_u04_approx_symbol_reading",
  "ps_g4b_u04_method_compare_outputs",
  "ps_g4b_u04_method_identify_from_result",
  "ps_g4b_u04_unconditional_round_down",
  "ps_g4b_u04_unconditional_round_up",
  "ps_g4b_u04_round_half_up",
  "ps_g4b_u04_inverse_digit_set",
  "ps_g4b_u04_inverse_original_values",
]);

const DIGIT_SET_CASES = Object.freeze([
  Object.freeze({ mask: "2□318", targetUnit: 10000, roundedValue: 30000 }),
  Object.freeze({ mask: "47□61", targetUnit: 1000, roundedValue: 47000 }),
  Object.freeze({ mask: "6□42", targetUnit: 1000, roundedValue: 6000 }),
  Object.freeze({ mask: "8□76", targetUnit: 1000, roundedValue: 9000 }),
]);

const ORIGINAL_VALUE_CASES = Object.freeze([
  Object.freeze({ mask: "4□□99", targetUnit: 1000, roundedValue: 45000 }),
  Object.freeze({ mask: "3□□49", targetUnit: 1000, roundedValue: 35000 }),
  Object.freeze({ mask: "7□□25", targetUnit: 1000, roundedValue: 72000 }),
  Object.freeze({ mask: "6□□75", targetUnit: 1000, roundedValue: 65000 }),
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s69")) {
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
    throw new Error(`G4BU04_GEN_INVALID_RANGE:${min}:${max}`);
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

export function g4bU04RoundDown(value, unit) {
  return Math.floor(value / unit) * unit;
}

export function g4bU04RoundUp(value, unit) {
  return Math.ceil(value / unit) * unit;
}

export function g4bU04RoundHalfUp(value, unit) {
  return Math.floor((value + unit / 2) / unit) * unit;
}

function targetPlaceLabel(unit) {
  return ({ 10: "十位", 100: "百位", 1000: "千位", 10000: "萬位" })[unit];
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function replaceMask(mask, replacement) {
  let index = 0;
  return Number([...mask].map((char) => (char === "□" ? replacement[index++] : char)).join(""));
}

export function enumerateG4BU04DigitMaskValues(mask) {
  const placeholderCount = [...mask].filter((char) => char === "□").length;
  if (placeholderCount !== 1 && placeholderCount !== 2) return [];
  const limit = 10 ** placeholderCount;
  const output = [];
  for (let value = 0; value < limit; value += 1) {
    const replacement = String(value).padStart(placeholderCount, "0");
    output.push(replaceMask(mask, replacement));
  }
  return output;
}

function makeValueAndUnit(seed, { nonMultiple = true } = {}) {
  const unit = randomChoice(seed, 1, G4B_U04_TARGET_UNITS);
  const quotientMax = Math.max(10, Math.floor((MAX_INPUT - unit) / unit));
  const quotient = randomInt(seed, 2, 10, Math.min(quotientMax, 9000));
  const remainder = nonMultiple ? randomInt(seed, 3, 1, unit - 1) : randomInt(seed, 3, 0, unit - 1);
  return { value: quotient * unit + remainder, targetUnit: unit };
}

function sampleLanguageClassification(seed) {
  const approximate = randomInt(seed, 1, 0, 1) === 0;
  const quantity = randomInt(seed, 2, 120, 98_000);
  if (approximate) {
    const cue = randomChoice(seed, 3, G4B_U04_APPROXIMATION_CUES);
    const statement = `這個地區${cue}有 ${formatNumber(quantity)} 位居民。`;
    return {
      promptText: `下面敘述中的數量是概數還是精確數？「${statement}」`,
      answerText: "概數",
      finalAnswer: "approximate",
      structuredAnswer: { classification: "approximate", evidenceCue: cue },
      input: { statement, precisionSignal: "approximate", evidenceCue: cue },
      derived: {},
    };
  }
  const statement = `教室裡正好有 ${quantity} 張椅子。`;
  return {
    promptText: `下面敘述中的數量是概數還是精確數？「${statement}」`,
    answerText: "精確數",
    finalAnswer: "exact",
    structuredAnswer: { classification: "exact", evidenceCue: "正好" },
    input: { statement, precisionSignal: "exact", evidenceCue: "正好" },
    derived: {},
  };
}

function sampleSymbolReading() {
  return {
    promptText: "符號「≈」讀作什麼？",
    answerText: "約等於",
    finalAnswer: "約等於",
    structuredAnswer: {
      symbol: "≈",
      canonicalReading: "約等於",
      acceptedReadings: ["約等於", "近似於"],
    },
    input: { symbol: "≈" },
    derived: {},
  };
}

function sampleMethodComparison(seed) {
  const { value, targetUnit } = makeValueAndUnit(seed);
  const outputs = {
    unconditionalDown: g4bU04RoundDown(value, targetUnit),
    unconditionalUp: g4bU04RoundUp(value, targetUnit),
    roundHalfUp: g4bU04RoundHalfUp(value, targetUnit),
  };
  return {
    promptText: `${formatNumber(value)} 取概數到${targetPlaceLabel(targetUnit)}，分別寫出無條件捨去、無條件進入和四捨五入的結果。`,
    answerText: `無條件捨去：${formatNumber(outputs.unconditionalDown)}；無條件進入：${formatNumber(outputs.unconditionalUp)}；四捨五入：${formatNumber(outputs.roundHalfUp)}`,
    finalAnswer: outputs,
    structuredAnswer: { value, targetUnit, outputs },
    input: { value, targetUnit },
    derived: outputs,
  };
}

function sampleMethodChoice(seed) {
  const { value, targetUnit } = makeValueAndUnit(seed);
  const down = g4bU04RoundDown(value, targetUnit);
  const up = g4bU04RoundUp(value, targetUnit);
  const halfUp = g4bU04RoundHalfUp(value, targetUnit);
  const method = halfUp === down ? "unconditional_up" : "unconditional_down";
  const shownResult = method === "unconditional_up" ? up : down;
  const methodLabel = method === "unconditional_up" ? "無條件進入法" : "無條件捨去法";
  return {
    promptText: `${formatNumber(value)} 取概數到${targetPlaceLabel(targetUnit)}得到 ${formatNumber(shownResult)}。在無條件捨去、無條件進入和四捨五入中，哪一種方法能唯一得到這個結果？`,
    answerText: methodLabel,
    finalAnswer: method,
    structuredAnswer: { method, shownResult },
    input: { value, targetUnit, shownResult },
    derived: { unconditionalDown: down, unconditionalUp: up, roundHalfUp: halfUp },
  };
}

function sampleDirectRounding(seed, method) {
  const { value, targetUnit } = makeValueAndUnit(seed);
  const answer = method === "down"
    ? g4bU04RoundDown(value, targetUnit)
    : method === "up"
      ? g4bU04RoundUp(value, targetUnit)
      : g4bU04RoundHalfUp(value, targetUnit);
  const label = method === "down" ? "無條件捨去" : method === "up" ? "無條件進入" : "四捨五入";
  return {
    promptText: `把 ${formatNumber(value)} 用${label}法取概數到${targetPlaceLabel(targetUnit)}。`,
    answerText: String(answer),
    finalAnswer: answer,
    structuredAnswer: { value: answer },
    input: { value, targetUnit, method },
    derived: { roundedValue: answer },
  };
}

function sampleInverseDigitSet(seed) {
  const selected = randomChoice(seed, 1, DIGIT_SET_CASES);
  const digits = [];
  for (let digit = 0; digit <= 9; digit += 1) {
    const completed = replaceMask(selected.mask, String(digit));
    if (g4bU04RoundHalfUp(completed, selected.targetUnit) === selected.roundedValue) digits.push(digit);
  }
  return {
    promptText: `${selected.mask} 用四捨五入法取概數到${targetPlaceLabel(selected.targetUnit)}後是 ${formatNumber(selected.roundedValue)}，□ 可以填哪些數字？`,
    answerText: digits.join("、"),
    finalAnswer: digits,
    structuredAnswer: { digits },
    input: selected,
    derived: { candidateCount: 10 },
  };
}

function sampleInverseOriginalValues(seed) {
  const selected = randomChoice(seed, 1, ORIGINAL_VALUE_CASES);
  const values = enumerateG4BU04DigitMaskValues(selected.mask)
    .filter((value) => g4bU04RoundHalfUp(value, selected.targetUnit) === selected.roundedValue);
  return {
    promptText: `一個數寫成 ${selected.mask}，用四捨五入法取概數到${targetPlaceLabel(selected.targetUnit)}後是 ${formatNumber(selected.roundedValue)}。原數可能是多少？請列出所有可能值。`,
    answerText: values.map(formatNumber).join("、"),
    finalAnswer: values,
    structuredAnswer: { values },
    input: selected,
    derived: {
      intervalStart: Math.max(0, selected.roundedValue - selected.targetUnit / 2),
      intervalEnd: Math.min(MAX_INPUT, selected.roundedValue + selected.targetUnit / 2 - 1),
    },
  };
}

function sampleForPattern(patternSpecId, seed) {
  switch (patternSpecId) {
    case "ps_g4b_u04_approx_language_classify": return sampleLanguageClassification(seed);
    case "ps_g4b_u04_approx_symbol_reading": return sampleSymbolReading();
    case "ps_g4b_u04_method_compare_outputs": return sampleMethodComparison(seed);
    case "ps_g4b_u04_method_identify_from_result": return sampleMethodChoice(seed);
    case "ps_g4b_u04_unconditional_round_down": return sampleDirectRounding(seed, "down");
    case "ps_g4b_u04_unconditional_round_up": return sampleDirectRounding(seed, "up");
    case "ps_g4b_u04_round_half_up": return sampleDirectRounding(seed, "half_up");
    case "ps_g4b_u04_inverse_digit_set": return sampleInverseDigitSet(seed);
    case "ps_g4b_u04_inverse_original_values": return sampleInverseOriginalValues(seed);
    default: throw new Error(`G4BU04_GEN_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  }
}

export function generateG4BU04ClassCQuestion({ patternSpecId, seed = "s69", sequence = 0 } = {}) {
  const spec = getG4BU04HiddenPatternSpecById(patternSpecId);
  if (!spec || spec.implementationClass !== "C" || !G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS.includes(patternSpecId)) {
    throw new Error(`G4BU04_GEN_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  }
  const seedLabel = `${seed}:${patternSpecId}:${sequence}`;
  const sample = sampleForPattern(patternSpecId, hashSeed(seedLabel));
  return deepFreeze({
    questionId: `g4b-u04-s69-${hashSeed(seedLabel).toString(16)}-${sequence}`,
    sourceId: G4B_U04_SOURCE_ID,
    unitCode: "4B-U04",
    unitTitle: "概數",
    kind: "g4bU04RoundingApproximation",
    representation: spec.mode === "concept" ? "concept_prompt" : spec.mode === "numeric" ? "numeric_rounding" : "inverse_rounding",
    applicationText: false,
    patternSpecId,
    formalMappingId: spec.formalMappingId,
    sourceMappingCandidateId: spec.sourceMappingCandidateId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: spec.mode,
    implementationClass: "C",
    depth: "N",
    answerModelShape: spec.answerModel.shape,
    promptText: sample.promptText,
    answerText: sample.answerText,
    finalAnswer: sample.finalAnswer,
    structuredAnswer: sample.structuredAnswer,
    input: sample.input,
    derived: sample.derived,
    sourceEvidence: spec.sourceEvidence,
    templateFamilyIds: [],
    selectorStatus: "hidden",
    canonicalRouting: "disabled",
    generatorRouting: "hidden_class_c_only_not_canonical",
    productionUse: "forbidden",
    fallbackUsed: false,
    genericFallbackAllowed: false,
    seedLabel,
  });
}

export function generateG4BU04ClassCBatch({
  questionCount = 9,
  patternSpecIds = G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS,
  seed = "s69-batch",
  ordering = "groupedByPattern",
} = {}) {
  if (!Number.isSafeInteger(questionCount) || questionCount < 1 || questionCount > MAX_BATCH_COUNT) {
    throw new Error(`G4BU04_GEN_QUESTION_COUNT_OUT_OF_RANGE:${questionCount}`);
  }
  const ids = [...new Set(patternSpecIds)];
  if (ids.length === 0 || ids.some((id) => !G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS.includes(id))) {
    throw new Error("G4BU04_GEN_PATTERN_SET_INVALID");
  }
  if (!new Set(["groupedByPattern", "shuffleAcrossPatterns"]).has(ordering)) {
    throw new Error(`G4BU04_GEN_ORDERING_INVALID:${ordering}`);
  }

  const allocations = Object.fromEntries(ids.map((id) => [id, 0]));
  for (let index = 0; index < questionCount; index += 1) allocations[ids[index % ids.length]] += 1;
  const questions = [];
  for (const patternSpecId of ids) {
    for (let sequence = 0; sequence < allocations[patternSpecId]; sequence += 1) {
      questions.push(generateG4BU04ClassCQuestion({ patternSpecId, seed, sequence }));
    }
  }
  const ordered = ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(questions, hashSeed(`${seed}:shuffle`))
    : questions;

  return deepFreeze({
    sourceId: G4B_U04_SOURCE_ID,
    task: "S69_G4B_U04_ClassCGeneratorAndBlockingValidator",
    questionCount,
    ordering,
    seed,
    patternSpecIds: ids,
    allocation: allocations,
    questions: ordered,
    lifecycle: {
      selectorStatus: "hidden",
      canonicalRouting: "disabled",
      productionUse: "forbidden",
      genericFallback: "forbidden",
    },
  });
}
