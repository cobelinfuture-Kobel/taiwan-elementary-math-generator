import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import {
  G5B_U05_PATTERN_SPEC_IDS,
  G5B_U05_SOURCE_ID,
  getBatchABrowserPatternDefinition,
} from "./source-pattern-full-product-p01d1-extension.js";

const DIGITS_ZH = Object.freeze(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]);
const SECTION_UNITS = Object.freeze(["", "萬", "億", "兆"]);
const PLACE_LABELS = Object.freeze([
  "百兆", "十兆", "兆", "千億", "百億", "十億", "億", "千萬", "百萬", "十萬", "萬", "千", "百", "十", "個",
]);
const MIN_VALUE = 100000000;
const MAX_VALUE = 999999999999999;
const SPEC_SET = new Set(G5B_U05_PATTERN_SPEC_IDS);

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "p01d1")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
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

function section(seed, index, channel) {
  return state(seed, index, channel) % 10000;
}

function largeNumber(seed, index, channel = "large-number") {
  const top = 1 + (state(seed, index, `${channel}:top`) % 800);
  const value = top * 1000000000000
    + section(seed, index, `${channel}:yi`) * 100000000
    + section(seed, index, `${channel}:wan`) * 10000
    + section(seed, index, `${channel}:low`);
  return Math.min(MAX_VALUE, value);
}

function chineseSection(value) {
  if (value === 0) return "";
  const digits = [Math.floor(value / 1000), Math.floor(value / 100) % 10, Math.floor(value / 10) % 10, value % 10];
  const units = ["千", "百", "十", ""];
  let output = "";
  let pendingZero = false;
  for (let index = 0; index < digits.length; index += 1) {
    const digit = digits[index];
    if (digit === 0) {
      if (output) pendingZero = true;
      continue;
    }
    if (pendingZero) {
      output += "零";
      pendingZero = false;
    }
    const unit = units[index];
    const omitLeadingOne = digit === 1 && unit === "十" && output === "";
    output += `${omitLeadingOne ? "" : DIGITS_ZH[digit]}${unit}`;
  }
  return output;
}

export function numberToChineseLarge(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_VALUE) throw new Error("g5b_u05_large_number_out_of_range");
  if (value === 0) return "零";
  const sections = [];
  let remaining = value;
  while (remaining > 0) {
    sections.push(remaining % 10000);
    remaining = Math.floor(remaining / 10000);
  }
  let output = "";
  let zeroBetween = false;
  for (let index = sections.length - 1; index >= 0; index -= 1) {
    const current = sections[index];
    if (current === 0) {
      if (output) zeroBetween = true;
      continue;
    }
    if (output && (zeroBetween || current < 1000)) output += "零";
    output += `${chineseSection(current)}${SECTION_UNITS[index]}`;
    zeroBetween = false;
  }
  return output.replace(/零+/g, "零").replace(/零$/g, "");
}

function parseChineseSection(text) {
  const digitMap = new Map(DIGITS_ZH.map((digit, index) => [digit, index]));
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

export function chineseLargeToNumber(text) {
  const normalized = String(text ?? "").replaceAll(" ", "").trim();
  if (normalized === "零") return 0;
  if (!normalized) throw new Error("g5b_u05_chinese_number_empty");
  const bigUnits = new Map([["兆", 1000000000000], ["億", 100000000], ["萬", 10000]]);
  let total = 0;
  let buffer = "";
  for (const char of normalized) {
    if (bigUnits.has(char)) {
      total += parseChineseSection(buffer) * bigUnits.get(char);
      buffer = "";
    } else {
      buffer += char;
    }
  }
  total += parseChineseSection(buffer);
  if (!Number.isSafeInteger(total) || total < 0 || total > MAX_VALUE) throw new Error("g5b_u05_chinese_number_out_of_range");
  return total;
}

function placeComponents(value) {
  const text = String(value).padStart(PLACE_LABELS.length, "0");
  return text.split("").map((digitText, index) => {
    const digit = Number(digitText);
    const unit = 10 ** (PLACE_LABELS.length - index - 1);
    return Object.freeze({ index, digit, label: PLACE_LABELS[index], unit, representedValue: digit * unit });
  });
}

function expandedForm(value) {
  return placeComponents(value).filter((row) => row.digit > 0).map((row) => String(row.representedValue)).join(" + ");
}

function metadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["full_product_w1", G5B_U05_SOURCE_ID, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [G5B_U05_SOURCE_ID],
    canonicalSkillIds: [...definition.canonicalSkillIds],
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
  };
}

function questionBase(definition, index, promptText, answerText, fields = {}) {
  return {
    id: `${definition.patternSpecId}-${index}`,
    sourceId: G5B_U05_SOURCE_ID,
    patternSpecId: definition.patternSpecId,
    kind: "g5bU05LargeNumber",
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

function generateDigitValue(definition, index, seed) {
  const value = largeNumber(seed, index, definition.patternSpecId);
  const candidates = placeComponents(value).filter((row) => row.digit > 0);
  const target = candidates[state(seed, index, "digit-value-target") % candidates.length];
  return questionBase(
    definition,
    index,
    `${value} 中的數字 ${target.digit} 在${target.label}位，表示多少？`,
    target.representedValue,
    { value, targetIndex: target.index, targetDigit: target.digit, placeLabel: target.label, representedValue: target.representedValue },
  );
}

function generateComposition(definition, index, seed) {
  const value = largeNumber(seed, index, definition.patternSpecId);
  const components = placeComponents(value).filter((row) => row.digit > 0);
  const promptParts = components.map((row) => `${row.digit}個${row.label}`);
  return questionBase(
    definition,
    index,
    `${promptParts.join("、")}，合起來是多少？`,
    value,
    { value, placeComponents: components },
  );
}

function generateReadingWriting(definition, index, seed) {
  const value = largeNumber(seed, index, definition.patternSpecId);
  const chineseText = numberToChineseLarge(value);
  if (definition.operation === "numeric_to_chinese") {
    return questionBase(definition, index, `把 ${value} 寫成中文數字。`, chineseText, { value, chineseText, conversionDirection: "numeric_to_chinese" });
  }
  return questionBase(definition, index, `把「${chineseText}」寫成數字。`, value, { value, chineseText, conversionDirection: "chinese_to_numeric" });
}

function powerOfTenData(seed, index, channel) {
  const exponent = 1 + (state(seed, index, `${channel}:exponent`) % 4);
  const factor = 10 ** exponent;
  const base = MIN_VALUE + (state(seed, index, `${channel}:base`) % 800000000);
  return { exponent, factor, base };
}

function generatePowerOfTen(definition, index, seed) {
  const data = powerOfTenData(seed, index, definition.patternSpecId);
  if (definition.operation === "multiply_power_of_ten") {
    const answer = data.base * data.factor;
    return questionBase(definition, index, `${data.base} 乘以 ${data.factor} 是多少？`, answer, { ...data, operand: data.base, answerValue: answer });
  }
  const dividend = data.base * data.factor;
  return questionBase(definition, index, `${dividend} 除以 ${data.factor} 是多少？`, data.base, { ...data, operand: dividend, answerValue: data.base });
}

function generateExpandedForm(definition, index, seed) {
  const value = largeNumber(seed, index, definition.patternSpecId);
  const expansion = expandedForm(value);
  return questionBase(definition, index, `把 ${value} 展開成各位值的和。`, expansion, { value, expansion, placeComponents: placeComponents(value).filter((row) => row.digit > 0) });
}

function generateComparison(definition, index, seed) {
  const left = largeNumber(seed, index, `${definition.patternSpecId}:left`);
  let right = largeNumber(seed, index, `${definition.patternSpecId}:right`);
  if (right === left) right = right < MAX_VALUE ? right + 1 : right - 1;
  const symbol = left > right ? ">" : "<";
  return questionBase(definition, index, `在 ${left} 和 ${right} 之間填入 >、< 或 =。`, symbol, { left, right, comparisonSymbol: symbol });
}

function generateQuestion(definition, index, seed) {
  if (definition.operation === "digit_value") return generateDigitValue(definition, index, seed);
  if (definition.operation === "place_composition") return generateComposition(definition, index, seed);
  if (["numeric_to_chinese", "chinese_to_numeric"].includes(definition.operation)) return generateReadingWriting(definition, index, seed);
  if (["multiply_power_of_ten", "divide_power_of_ten_exact"].includes(definition.operation)) return generatePowerOfTen(definition, index, seed);
  if (definition.operation === "expanded_form") return generateExpandedForm(definition, index, seed);
  if (definition.operation === "comparison") return generateComparison(definition, index, seed);
  throw new Error(`g5b_u05_operation_not_supported:${definition.operation}`);
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
  return [...questions].sort((left, right) => (
    state(plan.generationSeed, 1, left.id) - state(plan.generationSeed, 1, right.id)
  ));
}

export function canGenerateG5BU05LargeNumberQuestions(plan = {}) {
  return plan.sourceId === G5B_U05_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((patternSpecId) => SPEC_SET.has(patternSpecId));
}

export function validateG5BU05LargeNumberQuestion(question = {}) {
  const errors = [];
  const definition = getBatchABrowserPatternDefinition(question.patternSpecId ?? question.metadata?.patternId);
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (!definition || definition.sourceId !== G5B_U05_SOURCE_ID || definition.kind !== "g5bU05LargeNumber") add("g5b_u05_pattern_not_supported", "patternSpecId");
  if (question.sourceId !== G5B_U05_SOURCE_ID || question.metadata?.sourceId !== G5B_U05_SOURCE_ID) add("g5b_u05_source_mismatch", "sourceId");
  if (String(question.blankedDisplayText ?? "").includes("{")) add("g5b_u05_prompt_slot_unresolved", "blankedDisplayText");
  try {
    if (question.operation === "digit_value") {
      const component = placeComponents(question.value)[question.targetIndex];
      if (!component || component.digit !== question.targetDigit || component.label !== question.placeLabel) add("g5b_u05_digit_value_target_invalid", "targetIndex");
      if (question.representedValue !== component?.representedValue || Number(question.answerText) !== component?.representedValue) add("g5b_u05_digit_value_answer_invalid", "answerText");
    } else if (question.operation === "place_composition") {
      const expected = (question.placeComponents ?? []).reduce((sum, row) => sum + row.digit * row.unit, 0);
      if (expected !== question.value || Number(question.answerText) !== expected) add("g5b_u05_composition_answer_invalid", "answerText");
    } else if (question.operation === "numeric_to_chinese") {
      if (numberToChineseLarge(question.value) !== question.chineseText || question.answerText !== question.chineseText) add("g5b_u05_numeric_to_chinese_invalid", "answerText");
    } else if (question.operation === "chinese_to_numeric") {
      const expected = chineseLargeToNumber(question.chineseText);
      if (expected !== question.value || Number(question.answerText) !== expected) add("g5b_u05_chinese_to_numeric_invalid", "answerText");
    } else if (question.operation === "multiply_power_of_ten") {
      const expected = question.operand * question.factor;
      if (question.factor !== 10 ** question.exponent || question.answerValue !== expected || Number(question.answerText) !== expected) add("g5b_u05_power_multiplication_invalid", "answerText");
    } else if (question.operation === "divide_power_of_ten_exact") {
      const expected = question.operand / question.factor;
      if (!Number.isInteger(expected) || question.factor !== 10 ** question.exponent || question.answerValue !== expected || Number(question.answerText) !== expected) add("g5b_u05_power_division_invalid", "answerText");
    } else if (question.operation === "expanded_form") {
      const expected = expandedForm(question.value);
      if (question.expansion !== expected || question.answerText !== expected) add("g5b_u05_expanded_form_invalid", "answerText");
    } else if (question.operation === "comparison") {
      const expected = question.left > question.right ? ">" : question.left < question.right ? "<" : "=";
      if (question.comparisonSymbol !== expected || question.answerText !== expected) add("g5b_u05_comparison_invalid", "answerText");
    } else {
      add("g5b_u05_operation_not_supported", "operation");
    }
  } catch (error) {
    add(error.code ?? error.message ?? "g5b_u05_validation_exception", "question");
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG5BU05LargeNumberQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG5BU05LargeNumberQuestions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "g5b_u05_plan_not_supported", severity: "error", path: "plan", message: "G5B-U05 plan is outside admitted PatternSpecs." }], warnings: [] };
  }
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0
    ? clone(plan.allocation)
    : allocate(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const entry of allocation) {
    if (!SPEC_SET.has(entry.patternSpecId)) {
      errors.push({ code: "g5b_u05_pattern_not_supported", severity: "error", path: entry.patternSpecId, message: "Unsupported G5B-U05 PatternSpec." });
      continue;
    }
    const definition = getBatchABrowserPatternDefinition(entry.patternSpecId);
    for (let offset = 0; offset < entry.questionCount; offset += 1) {
      const question = generateQuestion(definition, questions.length + 1, `${plan.generationSeed}:${entry.patternSpecId}`);
      const validation = validateG5BU05LargeNumberQuestion(question);
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
