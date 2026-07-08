import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-submiddle-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "./visible-pattern-group-resolver.js";
import {
  G4A_U01_SOURCE_ID,
  generateBatchABrowserQuestions as generateBaseG4AU01Questions
} from "./g4a-u01-phase1-generator.js";

const BOUNDARY_DIFFERENCE_SPEC_ID = "ps_g4a_u01_boundary_number_difference";
const ARRANGEMENT_SPEC_ID = "ps_g4a_u01_digit_arrangement_max_min";
const MAX_BOUNDARY_DIFFERENCE_UNIQUE_COUNT = 8;
const PATTERN_SELECTOR = Object.freeze({
  ps_g4a_u01_compare_8digit: ["kp_g4a_u01_compare_8digit", "pg_g4a_u01_compare_8digit"],
  ps_g4a_u01_within_100million_compare: ["kp_g4a_u01_within_100million_compare", "pg_g4a_u01_within_100million_compare"],
  ps_g4a_u01_large_number_add_sub: ["kp_g4a_u01_large_number_add_sub", "pg_g4a_u01_large_number_add_sub"],
  ps_g4a_u01_8digit_place_value_decomposition: ["kp_g4a_u01_8digit_place_value_decomposition", "pg_g4a_u01_8digit_place_value_decomposition"],
  ps_g4a_u01_place_value_composition_to_number: ["kp_g4a_u01_place_value_composition_to_number", "pg_g4a_u01_place_value_composition_to_number"],
  ps_g4a_u01_same_digit_place_value_difference: ["kp_g4a_u01_same_digit_place_value_difference", "pg_g4a_u01_same_digit_place_value_difference"],
  ps_g4a_u01_nonstandard_place_value_composition: ["kp_g4a_u01_nonstandard_place_value_composition", "pg_g4a_u01_nonstandard_place_value_composition"],
  ps_g4a_u01_place_value_card_unit_model_composition: ["kp_g4a_u01_place_value_card_unit_model_composition", "pg_g4a_u01_place_value_card_unit_model_composition"],
  ps_g4a_u01_compare_first_different_place: ["kp_g4a_u01_compare_first_different_place", "pg_g4a_u01_compare_first_different_place"],
  ps_g4a_u01_missing_digit_comparison_possible_digits: ["kp_g4a_u01_missing_digit_comparison_possible_digits", "pg_g4a_u01_missing_digit_comparison_possible_digits"],
  ps_g4a_u01_missing_digit_comparison_extreme_digit: ["kp_g4a_u01_missing_digit_comparison_extreme_digit", "pg_g4a_u01_missing_digit_comparison_extreme_digit"],
  ps_g4a_u01_large_number_reading_writing_conversion: ["kp_g4a_u01_large_number_reading_writing_conversion", "pg_g4a_u01_large_number_reading_writing_conversion"],
  ps_g4a_u01_numeric_vs_chinese_number_compare: ["kp_g4a_u01_numeric_vs_chinese_number_compare", "pg_g4a_u01_numeric_vs_chinese_number_compare"],
  ps_g4a_u01_wan_mixed_notation_subtraction: ["kp_g4a_u01_wan_mixed_notation_subtraction", "pg_g4a_u01_wan_mixed_notation_subtraction"],
  ps_g4a_u01_boundary_number_difference: ["kp_g4a_u01_boundary_number_difference", "pg_g4a_u01_boundary_number_difference"],
  ps_g4a_u01_comparison_word_problem_total: ["kp_g4a_u01_comparison_word_problem_total", "pg_g4a_u01_comparison_word_problem_total"],
  ps_g4a_u01_large_number_unit_word_problem_add_subtract: ["kp_g4a_u01_large_number_unit_word_problem_add_subtract", "pg_g4a_u01_large_number_unit_word_problem_add_subtract"],
  ps_g4a_u01_digit_arrangement_max_min: ["kp_g4a_u01_digit_arrangement_max_min", "pg_g4a_u01_digit_arrangement_max_min"]
});
const DIGIT_CHINESE = Object.freeze(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]);
const ARRANGEMENT_DIGIT_SETS = Object.freeze([
  Object.freeze([1, 3, 6, 7, 9]),
  Object.freeze([0, 2, 4, 5, 8]),
  Object.freeze([1, 4, 5, 7, 8]),
  Object.freeze([0, 3, 4, 6, 9]),
  Object.freeze([2, 3, 5, 6, 7]),
  Object.freeze([0, 1, 4, 6, 8]),
  Object.freeze([1, 2, 5, 8, 9]),
  Object.freeze([0, 3, 5, 7, 8])
]);
const ARRANGEMENT_CONTEXTS = Object.freeze([
  Object.freeze({ item: "光纖長度", unit: "公分", unitSymbol: "cm", prefix: "光纖長度" }),
  Object.freeze({ item: "芒果箱號重量", unit: "公克", unitSymbol: "g", prefix: "芒果箱號" }),
  Object.freeze({ item: "滴灌量", unit: "毫升", unitSymbol: "ml", prefix: "滴灌量" }),
  Object.freeze({ item: "成分重量", unit: "毫克", unitSymbol: "mg", prefix: "成分重量" }),
  Object.freeze({ item: "機台間距", unit: "毫米", unitSymbol: "mm", prefix: "機台間距" })
]);

function issue(code, path, message, severity = "warning") {
  return { code, severity, path, message };
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((entry) => cloneValue(entry));
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

function randomInt(seedValue, min, max) {
  return min + (seedValue % (max - min + 1));
}

function shuffleQuestions(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  const shuffled = [...questions];
  let seedValue = hashSeed(`${plan.generationSeed}:g4a-u01-shuffle:${plan.sourceId}:${plan.questionCount}`);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swapIndex = randomInt(seedValue, 0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function questionKey(question) {
  return `${question?.patternSpecId}:${question?.blankedDisplayText ?? question?.displayText ?? question?.id}`;
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
    const unit = units[index];
    const omitLeadingOneInTens = digit === 1 && unit === "十" && (output === "" || output.endsWith("零"));
    output += `${omitLeadingOneInTens ? "" : DIGIT_CHINESE[digit]}${unit}`;
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
  if (!normalized.includes("萬")) return parseChineseSection(normalized);
  const [wanText, lowerText = ""] = normalized.split("萬");
  return parseChineseSection(wanText) * 10000 + parseChineseSection(lowerText);
}

function comparisonSymbol(left, right) {
  return left > right ? ">" : left < right ? "<" : "=";
}

function textQuestionMetadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
    skillTags: [...(definition.skillTags ?? [])],
    difficultyTags: [...(definition.difficultyTags ?? [])],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...(definition.canonicalSkillIds ?? [])]
  };
}

function numberFromDigits(digits) {
  return Number(digits.join(""));
}

function minNumberFromDigits(digits) {
  const sorted = [...digits].sort((a, b) => a - b);
  if (sorted[0] !== 0) return numberFromDigits(sorted);
  const firstNonZeroIndex = sorted.findIndex((digit) => digit > 0);
  const [first] = sorted.splice(firstNonZeroIndex, 1);
  return numberFromDigits([first, ...sorted]);
}

function arrangementPrompt(digits, mode, context) {
  const digitText = digits.join("、");
  if (mode === "numeric") {
    const zeroNote = digits.includes(0) ? "（萬位數字不能為 0）" : "";
    return `用 ${digitText} 這五個數字各一次，組成五位數。最大的數是多少？最小的數是多少？${zeroNote}`;
  }
  const zeroNote = digits.includes(0) ? "萬位不能為0。" : "";
  return `${context.prefix}用 ${digitText} 各一次組成五位數${context.unitSymbol}。最大幾${context.unit}？最小幾${context.unit}？${zeroNote}`;
}

function generateArrangementQuestion(definition, options = {}) {
  const sequenceNumber = Number.isInteger(options.sequenceNumber) && options.sequenceNumber > 0 ? options.sequenceNumber : 1;
  const seedValue = hashSeed(`${options.seed}:${sequenceNumber}`);
  const digits = [...ARRANGEMENT_DIGIT_SETS[(sequenceNumber + seedValue) % ARRANGEMENT_DIGIT_SETS.length]];
  const context = ARRANGEMENT_CONTEXTS[(sequenceNumber + seedValue) % ARRANGEMENT_CONTEXTS.length];
  const mode = sequenceNumber % 2 === 0 ? "wordProblem" : "numeric";
  const maxNumber = numberFromDigits([...digits].sort((a, b) => b - a));
  const minNumber = minNumberFromDigits(digits);
  const answerText = `最大：${maxNumber}；最小：${minNumber}`;
  const promptText = arrangementPrompt(digits, mode, context);
  const id = options.id ?? `${definition.patternSpecId}-${sequenceNumber}`;
  return {
    id,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: definition.kind,
    arrangementMode: mode,
    digits,
    maxNumber,
    minNumber,
    unit: mode === "wordProblem" ? context.unit : null,
    promptText,
    displayText: `${promptText} ${answerText}`,
    blankedDisplayText: `${promptText} ________`,
    answerText,
    finalAnswer: answerText,
    metadata: textQuestionMetadata(definition)
  };
}

function withRuntimeId(question, sequenceNumber) {
  return {
    ...question,
    id: `${question.patternSpecId}-${sequenceNumber}`
  };
}

function normalizeSameDigitQuestion(question, sequenceNumber) {
  const relationMode = sequenceNumber % 2 === 0 ? "sum" : "difference";
  const [firstValue, secondValue] = question.representedValues ?? [];
  const answer = relationMode === "sum" ? firstValue + secondValue : Math.abs(firstValue - secondValue);
  const promptAction = relationMode === "sum" ? "合起來是多少" : "相差多少";
  const displayAction = relationMode === "sum" ? "合起來是" : "相差";
  return withRuntimeId({
    ...question,
    placeValueRelationMode: relationMode,
    promptText: `在 ${question.value} 中，兩個 ${question.repeatedDigit} 所代表的數${promptAction}？`,
    displayText: `在 ${question.value} 中，兩個 ${question.repeatedDigit} 所代表的數${displayAction} ${answer}`,
    blankedDisplayText: `在 ${question.value} 中，兩個 ${question.repeatedDigit} 所代表的數${displayAction} ________`,
    answerText: String(answer),
    finalAnswer: answer,
    metadata: {
      ...question.metadata,
      skillTags: [...new Set([...(question.metadata?.skillTags ?? []), relationMode === "sum" ? "place_value_sum" : "place_value_difference_only"])]
    }
  }, sequenceNumber);
}

function normalizeReadingWritingQuestion(question, sequenceNumber) {
  const chineseText = numberToChinese(question.value);
  const conversionDirection = sequenceNumber % 2 === 0 ? "chinese_to_numeric" : "numeric_to_chinese";
  const answerText = conversionDirection === "numeric_to_chinese" ? chineseText : String(question.value);
  const promptText = conversionDirection === "numeric_to_chinese"
    ? `把 ${question.value} 寫成中文數詞。`
    : `把「${chineseText}」寫成阿拉伯數字。`;
  return withRuntimeId({
    ...question,
    chineseText,
    conversionDirection,
    promptText,
    displayText: `${promptText} 答：${answerText}`,
    blankedDisplayText: `${promptText} ________`,
    answerText,
    finalAnswer: answerText
  }, sequenceNumber);
}

function normalizeNumericVsChineseComparison(question, sequenceNumber) {
  const rightChineseText = numberToChinese(question.rightValue);
  const answerText = comparisonSymbol(question.leftValue, question.rightValue);
  return withRuntimeId({
    ...question,
    rightChineseText,
    parsedRightValue: parseChineseNumber(rightChineseText),
    promptText: `在□中填入 >、< 或 =：${question.leftValue} □ ${rightChineseText}`,
    displayText: `${question.leftValue} ${answerText} ${rightChineseText}`,
    blankedDisplayText: `${question.leftValue} □ ${rightChineseText}`,
    answerText,
    finalAnswer: answerText
  }, sequenceNumber);
}

function normalizeComparisonWordProblemTotal(question, sequenceNumber) {
  if (question.total > 99999999 || question.comparedValue < 0) return null;
  return withRuntimeId(question, sequenceNumber);
}

function normalizeQuestion(question, sequenceNumber) {
  if (!question) return null;
  if (question.kind === "g4aU01SameDigitPlaceValueDifference") return normalizeSameDigitQuestion(question, sequenceNumber);
  if (question.kind === "g4aU01LargeNumberReadingWritingConversion") return normalizeReadingWritingQuestion(question, sequenceNumber);
  if (question.kind === "g4aU01NumericVsChineseNumberCompare") return normalizeNumericVsChineseComparison(question, sequenceNumber);
  if (question.kind === "g4aU01ComparisonWordProblemTotal") return normalizeComparisonWordProblemTotal(question, sequenceNumber);
  return withRuntimeId(question, sequenceNumber);
}

function convertUniquePoolErrors(errors = [], warnings = []) {
  const blockingErrors = [];
  const nextWarnings = [...warnings];
  for (const error of errors) {
    if (error?.code === "batch_a_g4a_u01_unique_pool_exhausted") {
      nextWarnings.push(issue(
        "batch_a_g4a_u01_unique_pool_limited",
        error.path ?? "patternSpecId",
        `此題型題庫上限為 ${MAX_BOUNDARY_DIFFERENCE_UNIQUE_COUNT} 題；已先產生可用題目，混合模式會由其他知識點補足。`
      ));
    } else {
      blockingErrors.push(error);
    }
  }
  return { blockingErrors, warnings: nextWarnings };
}

function candidateOptionsForPattern(plan, patternSpecId, attempt) {
  const selector = PATTERN_SELECTOR[patternSpecId];
  if (!selector) return null;
  return {
    sourceId: G4A_U01_SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [selector[0]],
    selectedPatternGroupIds: [selector[1]],
    questionCount: 1,
    ordering: "groupedByPattern",
    includeAnswerKey: plan.includeAnswerKey,
    generationSeed: `${plan.generationSeed}:saturation:${attempt}:${patternSpecId}`
  };
}

function generateCandidateQuestion(plan, patternSpecId, attempt, sequenceNumber) {
  if (patternSpecId === ARRANGEMENT_SPEC_ID) {
    const definition = getBatchABrowserPatternDefinition(patternSpecId);
    if (!definition) return { question: null, errors: [issue("batch_a_pattern_missing", "patternSpecId", `Missing pattern '${patternSpecId}'.`, "error")], warnings: [] };
    return { question: generateArrangementQuestion(definition, { seed: `${plan.generationSeed}:${attempt}`, sequenceNumber }), errors: [], warnings: [] };
  }
  const options = candidateOptionsForPattern(plan, patternSpecId, attempt);
  if (!options) return { question: null, errors: [issue("batch_a_pattern_missing", "patternSpecId", `Missing pattern '${patternSpecId}'.`, "error")], warnings: [] };
  const generated = generateBaseG4AU01Questions(options);
  const converted = convertUniquePoolErrors(generated.errors ?? [], generated.warnings ?? []);
  return {
    question: normalizeQuestion(generated.questions?.[0], sequenceNumber),
    errors: converted.blockingErrors,
    warnings: converted.warnings
  };
}

function fillShortage(plan, questions, warnings) {
  const targetCount = plan.questionCount;
  if (questions.length >= targetCount) return { questions: questions.slice(0, targetCount), warnings };
  const candidatePatternIds = (plan.patternSpecIds ?? []).filter((patternSpecId) => patternSpecId !== BOUNDARY_DIFFERENCE_SPEC_ID && PATTERN_SELECTOR[patternSpecId]);
  if (candidatePatternIds.length === 0) {
    return {
      questions,
      warnings: [
        ...warnings,
        issue(
          "batch_a_g4a_u01_question_count_saturated",
          "questionCount",
          `此知識點最多只能產生 ${questions.length} 題；目前已產生全部可用題目。`
        )
      ]
    };
  }

  const output = [...questions];
  const seen = new Set(output.map(questionKey));
  const maxAttempts = Math.max(120, targetCount * candidatePatternIds.length * 20);
  for (let attempt = 1; output.length < targetCount && attempt <= maxAttempts; attempt += 1) {
    const patternSpecId = candidatePatternIds[(attempt - 1) % candidatePatternIds.length];
    const generated = generateCandidateQuestion(plan, patternSpecId, attempt, output.length + 1);
    const candidate = generated.question;
    const key = questionKey(candidate);
    if (candidate && !seen.has(key)) {
      seen.add(key);
      output.push(candidate);
    }
  }

  if (output.length < targetCount) {
    return {
      questions: output,
      warnings: [
        ...warnings,
        issue(
          "batch_a_g4a_u01_question_count_saturated",
          "questionCount",
          `混合模式要求 ${targetCount} 題，目前可產生 ${output.length} 題。`
        )
      ]
    };
  }
  return { questions: output, warnings };
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

function allocationForPlan(plan) {
  return Array.isArray(plan.allocation) && plan.allocation.length > 0
    ? cloneValue(plan.allocation)
    : allocateCounts(plan.patternSpecIds ?? [], plan.questionCount);
}

export function canGenerateG4AU01Phase1Questions(plan = {}) {
  return plan?.sourceId === G4A_U01_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((patternSpecId) => Boolean(PATTERN_SELECTOR[patternSpecId]));
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU01Phase1Questions(plan)) return generateBaseG4AU01Questions(options);

  const allocation = allocationForPlan(plan);
  const questions = [];
  const errors = [];
  const warnings = [];
  const seen = new Set();

  for (const entry of allocation) {
    let generatedForPattern = 0;
    const maxAttempts = Math.max(40, entry.questionCount * 16);
    for (let attempt = 1; generatedForPattern < entry.questionCount && attempt <= maxAttempts; attempt += 1) {
      const generated = generateCandidateQuestion(plan, entry.patternSpecId, attempt, questions.length + 1);
      errors.push(...generated.errors);
      warnings.push(...generated.warnings);
      const candidate = generated.question;
      const key = questionKey(candidate);
      if (candidate && !seen.has(key)) {
        seen.add(key);
        questions.push(candidate);
        generatedForPattern += 1;
      }
    }
    if (generatedForPattern < entry.questionCount) {
      warnings.push(issue(
        entry.patternSpecId === BOUNDARY_DIFFERENCE_SPEC_ID ? "batch_a_g4a_u01_unique_pool_limited" : "batch_a_g4a_u01_pattern_pool_limited",
        "patternSpecId",
        `${entry.patternSpecId} 要求 ${entry.questionCount} 題，只產生 ${generatedForPattern} 題。`
      ));
    }
  }

  if (errors.length > 0) {
    return { ok: false, plan, questions: [], allocation, errors, warnings };
  }

  const filled = fillShortage(plan, questions, warnings);
  const orderedQuestions = shuffleQuestions(filled.questions, plan);

  return {
    ok: true,
    plan,
    questions: orderedQuestions,
    allocation,
    errors: [],
    warnings: filled.warnings
  };
}
