import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "./visible-pattern-group-resolver.js";
import {
  G4A_U01_SOURCE_ID,
  canGenerateG4AU01Phase1Questions,
  generateBatchABrowserQuestions as generateBaseG4AU01Questions
} from "./g4a-u01-phase1-generator.js";

export { canGenerateG4AU01Phase1Questions };

const BOUNDARY_DIFFERENCE_SPEC_ID = "ps_g4a_u01_boundary_number_difference";
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
  ps_g4a_u01_large_number_unit_word_problem_add_subtract: ["kp_g4a_u01_large_number_unit_word_problem_add_subtract", "pg_g4a_u01_large_number_unit_word_problem_add_subtract"]
});
const DIGIT_CHINESE = Object.freeze(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]);

function issue(code, path, message, severity = "warning") {
  return { code, severity, path, message };
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

function normalizeReadingWritingQuestion(question) {
  const chineseText = numberToChinese(question.value);
  const conversionDirection = question.conversionDirection;
  const answerText = conversionDirection === "numeric_to_chinese" ? chineseText : String(question.value);
  const promptText = conversionDirection === "numeric_to_chinese"
    ? `把 ${question.value} 寫成中文數詞。`
    : `把「${chineseText}」寫成阿拉伯數字。`;
  return {
    ...question,
    chineseText,
    promptText,
    displayText: `${promptText} 答：${answerText}`,
    blankedDisplayText: `${promptText} ________`,
    answerText,
    finalAnswer: answerText
  };
}

function normalizeNumericVsChineseComparison(question) {
  const rightChineseText = numberToChinese(question.rightValue);
  const answerText = comparisonSymbol(question.leftValue, question.rightValue);
  return {
    ...question,
    rightChineseText,
    parsedRightValue: parseChineseNumber(rightChineseText),
    promptText: `在□中填入 >、< 或 =：${question.leftValue} □ ${rightChineseText}`,
    displayText: `${question.leftValue} ${answerText} ${rightChineseText}`,
    blankedDisplayText: `${question.leftValue} □ ${rightChineseText}`,
    answerText,
    finalAnswer: answerText
  };
}

function normalizeComparisonWordProblemTotal(question) {
  if (question.total > 99999999 || question.comparedValue < 0) return null;
  return question;
}

function normalizeQuestion(question) {
  if (!question) return null;
  if (question.kind === "g4aU01LargeNumberReadingWritingConversion") return normalizeReadingWritingQuestion(question);
  if (question.kind === "g4aU01NumericVsChineseNumberCompare") return normalizeNumericVsChineseComparison(question);
  if (question.kind === "g4aU01ComparisonWordProblemTotal") return normalizeComparisonWordProblemTotal(question);
  return question;
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
    const options = candidateOptionsForPattern(plan, patternSpecId, attempt);
    if (!options) continue;
    const generated = generateBaseG4AU01Questions(options);
    const candidate = normalizeQuestion(generated.questions?.[0]);
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

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const base = generateBaseG4AU01Questions(options);
  const converted = convertUniquePoolErrors(base.errors ?? [], base.warnings ?? []);
  if (converted.blockingErrors.length > 0) {
    return { ...base, errors: converted.blockingErrors, warnings: converted.warnings, ok: false };
  }

  const normalizedQuestions = (base.questions ?? []).map(normalizeQuestion).filter(Boolean);
  const normalizedWarnings = converted.warnings;
  const filled = fillShortage(base.plan ?? plan, normalizedQuestions, normalizedWarnings);
  const orderedQuestions = shuffleQuestions(filled.questions, base.plan ?? plan);

  return {
    ...base,
    ok: true,
    questions: orderedQuestions,
    errors: [],
    warnings: filled.warnings
  };
}
