import {
  getG4BU04HiddenPatternSpecById,
} from "./source-pattern-g4b-u04-extension.js";
import {
  G4B_U04_APPROXIMATION_CUES,
  G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS,
  G4B_U04_TARGET_UNITS,
  enumerateG4BU04DigitMaskValues,
  g4bU04RoundDown,
  g4bU04RoundHalfUp,
  g4bU04RoundUp,
} from "./g4b-u04-class-c-generator.js";

const MAX_INPUT = 99_999_999;
const MAX_ANSWER = 999_999_999;
const REQUIRED_FIELDS = Object.freeze([
  "questionId", "sourceId", "unitCode", "unitTitle", "kind", "representation",
  "applicationText", "patternSpecId", "formalMappingId", "sourceMappingCandidateId",
  "patternGroupId", "knowledgePointId", "mode", "implementationClass", "depth",
  "answerModelShape", "promptText", "answerText", "finalAnswer", "structuredAnswer",
  "input", "derived", "sourceEvidence", "templateFamilyIds", "selectorStatus",
  "canonicalRouting", "generatorRouting", "productionUse", "fallbackUsed",
  "genericFallbackAllowed", "seedLabel",
]);

export const G4B_U04_BLOCKING_CODES = Object.freeze([
  "G4BU04_REQUIRED_FIELD_MISSING",
  "G4BU04_SOURCE_ID_MISMATCH",
  "G4BU04_UNIT_IDENTITY_MISMATCH",
  "G4BU04_PATTERN_KIND_MISMATCH",
  "G4BU04_PATTERN_SPEC_NOT_LOCKED",
  "G4BU04_PATTERN_GROUP_MISMATCH",
  "G4BU04_KNOWLEDGE_POINT_MISMATCH",
  "G4BU04_SOURCE_MAPPING_REF_MISMATCH",
  "G4BU04_LIFECYCLE_STATE_INVALID",
  "G4BU04_PUBLIC_ROUTING_FORBIDDEN",
  "G4BU04_PRODUCTION_USE_FORBIDDEN",
  "G4BU04_NONINTEGER_INPUT",
  "G4BU04_INPUT_OUT_OF_RANGE",
  "G4BU04_TARGET_UNIT_NOT_ALLOWED",
  "G4BU04_GROUP_SIZE_NOT_ALLOWED",
  "G4BU04_PAYMENT_DENOMINATION_NOT_ALLOWED",
  "G4BU04_FACTOR_DIVISOR_OUT_OF_RANGE",
  "G4BU04_DECIMAL_NEGATIVE_DOMAIN_LEAKAGE",
  "G4BU04_FORMULA_MISMATCH",
  "G4BU04_OUTPUT_NOT_MULTIPLE_OF_UNIT",
  "G4BU04_ROUND_DIRECTION_MISMATCH",
  "G4BU04_HALF_UP_THRESHOLD_MISMATCH",
  "G4BU04_FLOOR_REMAINDER_COUNTED",
  "G4BU04_CEILING_REMAINDER_DISCARDED",
  "G4BU04_PAYMENT_INSUFFICIENT",
  "G4BU04_PAYMENT_NOT_MINIMUM_MULTIPLE",
  "G4BU04_BANKNOTE_COUNT_NOT_MINIMUM",
  "G4BU04_ONE_FEWER_NOTE_SUFFICIENT",
  "G4BU04_ROUNDED_OPERAND_MISMATCH",
  "G4BU04_ESTIMATED_OPERATION_MISMATCH",
  "G4BU04_SUBTRACTION_NEGATIVE_OR_ZERO_TRIVIAL",
  "G4BU04_DIVISION_NONINTEGER",
  "G4BU04_ANSWER_MODEL_MISMATCH",
  "G4BU04_ANSWER_OUT_OF_RANGE",
  "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED",
  "G4BU04_UNIT_CLASSIFIER_MISMATCH",
  "G4BU04_UNRESOLVED_PLACEHOLDER",
  "G4BU04_METHOD_CHOICE_AMBIGUOUS",
  "G4BU04_METHOD_SHARED_HALF_UP_RESULT",
  "G4BU04_INVERSE_INTERVAL_NOT_CLAMPED",
  "G4BU04_INVERSE_VISIBLE_DIGIT_MISMATCH",
  "G4BU04_INVERSE_SOLUTION_SET_INCOMPLETE",
  "G4BU04_INTERNAL_ID_LEAKAGE",
  "G4BU04_GENERIC_FALLBACK_FORBIDDEN",
]);

export const G4B_U04_VALIDATOR_STAGES = Object.freeze([
  Object.freeze({ stage: 1, name: "identity_and_schema", codeCount: 8 }),
  Object.freeze({ stage: 2, name: "lifecycle_and_scope", codeCount: 3 }),
  Object.freeze({ stage: 3, name: "integer_domain_and_boundary", codeCount: 7 }),
  Object.freeze({ stage: 4, name: "formula_and_operation", codeCount: 14 }),
  Object.freeze({ stage: 5, name: "answer_model", codeCount: 2 }),
  Object.freeze({ stage: 6, name: "semantic_template_and_units", codeCount: 3 }),
  Object.freeze({ stage: 7, name: "ambiguity_and_inverse", codeCount: 5 }),
  Object.freeze({ stage: 8, name: "final_surface_contract", codeCount: 2 }),
]);

function issue(code, path, message, stage) {
  return Object.freeze({ code, severity: "error", path, message, stage });
}

function add(errors, code, path, message, stage) {
  if (!errors.some((row) => row.code === code && row.path === path)) {
    errors.push(issue(code, path, message, stage));
  }
}

function isInteger(value) {
  return Number.isSafeInteger(value);
}

function sameArray(left, right) {
  return Array.isArray(left) && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function exactKeys(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return sameArray(actual, expected);
}

function isSortedUniqueIntegers(values, min, max) {
  return Array.isArray(values)
    && values.length > 0
    && values.every((value) => isInteger(value) && value >= min && value <= max)
    && values.every((value, index) => index === 0 || values[index - 1] < value);
}

function allNumericLeaves(value, output = []) {
  if (typeof value === "number") output.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => allNumericLeaves(entry, output));
  else if (value && typeof value === "object") Object.values(value).forEach((entry) => allNumericLeaves(entry, output));
  return output;
}

function validateIdentity(question, errors) {
  const stage = "identity_and_schema";
  for (const field of REQUIRED_FIELDS) {
    if (!Object.hasOwn(question ?? {}, field)) {
      add(errors, "G4BU04_REQUIRED_FIELD_MISSING", field, `缺少必要欄位：${field}。`, stage);
    }
  }
  if (question?.sourceId !== "g4b_u04_4b04") {
    add(errors, "G4BU04_SOURCE_ID_MISMATCH", "sourceId", "題目來源不是 G4B-U04。", stage);
  }
  if (question?.unitCode !== "4B-U04" || question?.unitTitle !== "概數") {
    add(errors, "G4BU04_UNIT_IDENTITY_MISMATCH", "unitCode", "單元識別與概數單元不一致。", stage);
  }
  if (question?.kind !== "g4bU04RoundingApproximation") {
    add(errors, "G4BU04_PATTERN_KIND_MISMATCH", "kind", "題型 kind 不符合 G4B-U04。", stage);
  }
  const spec = getG4BU04HiddenPatternSpecById(question?.patternSpecId);
  if (!spec || spec.implementationClass !== "C" || !G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS.includes(question?.patternSpecId)) {
    add(errors, "G4BU04_PATTERN_SPEC_NOT_LOCKED", "patternSpecId", "PatternSpec 不在 S69 Class C 核准範圍。", stage);
    return null;
  }
  if (question.patternGroupId !== spec.patternGroupId) {
    add(errors, "G4BU04_PATTERN_GROUP_MISMATCH", "patternGroupId", "PatternGroup 與 PatternSpec 不一致。", stage);
  }
  if (question.knowledgePointId !== spec.knowledgePointId) {
    add(errors, "G4BU04_KNOWLEDGE_POINT_MISMATCH", "knowledgePointId", "KnowledgePoint 與 PatternSpec 不一致。", stage);
  }
  if (
    question.formalMappingId !== spec.formalMappingId
    || question.sourceMappingCandidateId !== spec.sourceMappingCandidateId
  ) {
    add(errors, "G4BU04_SOURCE_MAPPING_REF_MISMATCH", "formalMappingId", "FormalMapping traceability 不一致。", stage);
  }
  return spec;
}

function validateLifecycle(question, errors) {
  const stage = "lifecycle_and_scope";
  if (
    question?.implementationClass !== "C"
    || question?.depth !== "N"
    || question?.applicationText !== false
    || !["concept", "numeric", "reasoning"].includes(question?.mode)
  ) {
    add(errors, "G4BU04_LIFECYCLE_STATE_INVALID", "implementationClass", "S69 只允許隱藏 Class C Level N 題目。", stage);
  }
  if (question?.selectorStatus !== "hidden" || question?.canonicalRouting !== "disabled") {
    add(errors, "G4BU04_PUBLIC_ROUTING_FORBIDDEN", "canonicalRouting", "S69 禁止 public selector 與 canonical routing。", stage);
  }
  if (question?.productionUse !== "forbidden") {
    add(errors, "G4BU04_PRODUCTION_USE_FORBIDDEN", "productionUse", "S69 禁止 production use。", stage);
  }
}

function validateDomain(question, errors) {
  const stage = "integer_domain_and_boundary";
  const numericValues = allNumericLeaves(question?.input ?? {});
  if (numericValues.some((value) => !isInteger(value))) {
    add(errors, "G4BU04_NONINTEGER_INPUT", "input", "Class C 輸入必須全部為整數。", stage);
  }
  if (numericValues.some((value) => value < 0)) {
    add(errors, "G4BU04_DECIMAL_NEGATIVE_DOMAIN_LEAKAGE", "input", "概數核心題禁止負數或小數輸入。", stage);
  }
  if (numericValues.some((value) => value > MAX_ANSWER)) {
    add(errors, "G4BU04_INPUT_OUT_OF_RANGE", "input", "輸入超出核准整數範圍。", stage);
  }
  const targetUnit = question?.input?.targetUnit;
  if (targetUnit !== undefined && !G4B_U04_TARGET_UNITS.includes(targetUnit)) {
    add(errors, "G4BU04_TARGET_UNIT_NOT_ALLOWED", "input.targetUnit", "取概數位值不在允許範圍。", stage);
  }
}

function validateAnswerShape(question, expectedShape, allowedKeys, errors) {
  const stage = "answer_model";
  if (question.answerModelShape !== expectedShape || !exactKeys(question.structuredAnswer, allowedKeys)) {
    add(errors, "G4BU04_ANSWER_MODEL_MISMATCH", "structuredAnswer", "答案模型或封閉 schema 不符合 contract。", stage);
  }
  const numericAnswers = allNumericLeaves(question.structuredAnswer ?? {});
  if (numericAnswers.some((value) => value < 0 || value > MAX_ANSWER)) {
    add(errors, "G4BU04_ANSWER_OUT_OF_RANGE", "structuredAnswer", "答案超出核准範圍。", stage);
  }
}

function validateLanguage(question, errors) {
  const input = question.input ?? {};
  const expected = input.precisionSignal;
  validateAnswerShape(question, "classificationAnswer", ["classification", "evidenceCue"], errors);
  if (!["approximate", "exact"].includes(expected)
    || question.structuredAnswer?.classification !== expected
    || question.finalAnswer !== expected
    || question.structuredAnswer?.evidenceCue !== input.evidenceCue) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "structuredAnswer.classification", "概數／精確數分類與語意線索不一致。", "formula_and_operation");
  }
  if (expected === "approximate" && !G4B_U04_APPROXIMATION_CUES.includes(input.evidenceCue)) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "input.evidenceCue", "概數線索不在來源核准清單。", "formula_and_operation");
  }
  if (expected === "exact" && input.evidenceCue !== "正好") {
    add(errors, "G4BU04_FORMULA_MISMATCH", "input.evidenceCue", "精確數敘述缺少明確精確線索。", "formula_and_operation");
  }
}

function validateSymbol(question, errors) {
  validateAnswerShape(question, "symbolReadingAnswer", ["symbol", "canonicalReading", "acceptedReadings"], errors);
  const answer = question.structuredAnswer ?? {};
  if (
    question.input?.symbol !== "≈"
    || answer.symbol !== "≈"
    || answer.canonicalReading !== "約等於"
    || !sameArray(answer.acceptedReadings, ["約等於", "近似於"])
    || question.finalAnswer !== "約等於"
  ) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "structuredAnswer", "約等號讀法不符合來源 contract。", "formula_and_operation");
  }
}

function expectedRounding(input) {
  const value = input?.value;
  const unit = input?.targetUnit;
  return {
    unconditionalDown: g4bU04RoundDown(value, unit),
    unconditionalUp: g4bU04RoundUp(value, unit),
    roundHalfUp: g4bU04RoundHalfUp(value, unit),
  };
}

function validateMethodComparison(question, errors) {
  validateAnswerShape(question, "methodComparisonAnswer", ["value", "targetUnit", "outputs"], errors);
  const expected = expectedRounding(question.input);
  const answer = question.structuredAnswer ?? {};
  if (!exactKeys(answer.outputs, ["unconditionalDown", "unconditionalUp", "roundHalfUp"])) {
    add(errors, "G4BU04_ANSWER_MODEL_MISMATCH", "structuredAnswer.outputs", "方法比較輸出 schema 未封閉。", "answer_model");
  }
  if (
    answer.value !== question.input?.value
    || answer.targetUnit !== question.input?.targetUnit
    || JSON.stringify(answer.outputs) !== JSON.stringify(expected)
    || JSON.stringify(question.finalAnswer) !== JSON.stringify(expected)
  ) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "structuredAnswer.outputs", "三種取概數結果不正確。", "formula_and_operation");
  }
  if (Object.values(expected).some((value) => value % question.input.targetUnit !== 0)) {
    add(errors, "G4BU04_OUTPUT_NOT_MULTIPLE_OF_UNIT", "structuredAnswer.outputs", "概數結果不是指定位值的倍數。", "formula_and_operation");
  }
}

function validateMethodChoice(question, errors) {
  validateAnswerShape(question, "methodChoiceAnswer", ["method", "shownResult"], errors);
  const input = question.input ?? {};
  const outputs = expectedRounding(input);
  const matches = [
    ["unconditional_down", outputs.unconditionalDown],
    ["unconditional_up", outputs.unconditionalUp],
    ["round_half_up", outputs.roundHalfUp],
  ].filter(([, value]) => value === input.shownResult);
  const answer = question.structuredAnswer ?? {};
  if (input.value % input.targetUnit === 0 || matches.length !== 1) {
    add(errors, "G4BU04_METHOD_CHOICE_AMBIGUOUS", "input.shownResult", "顯示結果無法唯一判定取概數方法。", "ambiguity_and_inverse");
  }
  if (input.shownResult === outputs.roundHalfUp) {
    add(errors, "G4BU04_METHOD_SHARED_HALF_UP_RESULT", "input.shownResult", "顯示結果與四捨五入共用，禁止作為唯一方法答案。", "ambiguity_and_inverse");
  }
  if (
    !["unconditional_down", "unconditional_up"].includes(answer.method)
    || answer.method !== matches[0]?.[0]
    || answer.shownResult !== input.shownResult
    || question.finalAnswer !== answer.method
  ) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "structuredAnswer.method", "唯一方法答案不正確。", "formula_and_operation");
  }
}

function validateDirectRounding(question, method, errors) {
  validateAnswerShape(question, "numericAnswer", ["value"], errors);
  const { value, targetUnit } = question.input ?? {};
  const expected = method === "down"
    ? g4bU04RoundDown(value, targetUnit)
    : method === "up"
      ? g4bU04RoundUp(value, targetUnit)
      : g4bU04RoundHalfUp(value, targetUnit);
  if (question.structuredAnswer?.value !== expected || question.finalAnswer !== expected) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "finalAnswer", "取概數公式結果不正確。", "formula_and_operation");
  }
  if (expected % targetUnit !== 0) {
    add(errors, "G4BU04_OUTPUT_NOT_MULTIPLE_OF_UNIT", "finalAnswer", "概數結果不是指定位值的倍數。", "formula_and_operation");
  }
  if ((method === "down" && expected > value) || (method === "up" && expected < value)) {
    add(errors, "G4BU04_ROUND_DIRECTION_MISMATCH", "finalAnswer", "無條件捨去／進入方向錯誤。", "formula_and_operation");
  }
  if (method === "half_up" && question.derived?.roundedValue !== expected) {
    add(errors, "G4BU04_HALF_UP_THRESHOLD_MISMATCH", "derived.roundedValue", "四捨五入臨界規則錯誤。", "formula_and_operation");
  }
}

function validateDigitMask(question, placeholderCount, errors) {
  const stage = "ambiguity_and_inverse";
  const input = question.input ?? {};
  const pattern = placeholderCount === 1 ? /^[1-9][0-9]*□[0-9]+$/ : /^[1-9][0-9]*□□[0-9]+$/;
  const lengthMin = placeholderCount === 1 ? 3 : 4;
  if (
    typeof input.mask !== "string"
    || !pattern.test(input.mask)
    || input.mask.length < lengthMin
    || input.mask.length > 8
    || [...input.mask].filter((char) => char === "□").length !== placeholderCount
  ) {
    add(errors, "G4BU04_INVERSE_VISIBLE_DIGIT_MISMATCH", "input.mask", "逆向題數字遮罩不符合 S67 grammar。", stage);
    return [];
  }
  const values = enumerateG4BU04DigitMaskValues(input.mask)
    .filter((value) => g4bU04RoundHalfUp(value, input.targetUnit) === input.roundedValue);
  if (values.some((value) => value < 0 || value > MAX_INPUT)) {
    add(errors, "G4BU04_INVERSE_INTERVAL_NOT_CLAMPED", "input", "逆向區間未限制在全域非負輸入範圍。", stage);
  }
  return values;
}

function validateInverseDigitSet(question, errors) {
  validateAnswerShape(question, "digitSetAnswer", ["digits"], errors);
  const values = validateDigitMask(question, 1, errors);
  const expectedDigits = values.map((value) => Number(String(value)[question.input.mask.indexOf("□")]));
  const digits = question.structuredAnswer?.digits;
  if (!isSortedUniqueIntegers(digits, 0, 9) || !sameArray(digits, expectedDigits) || !sameArray(question.finalAnswer, expectedDigits)) {
    add(errors, "G4BU04_INVERSE_SOLUTION_SET_INCOMPLETE", "structuredAnswer.digits", "未知數字集合遺漏、多收、重複或未排序。", "ambiguity_and_inverse");
  }
}

function validateInverseOriginalValues(question, errors) {
  validateAnswerShape(question, "possibleValuesAnswer", ["values"], errors);
  const expected = validateDigitMask(question, 2, errors);
  const values = question.structuredAnswer?.values;
  if (!isSortedUniqueIntegers(values, 0, MAX_INPUT) || values.length > 100 || !sameArray(values, expected) || !sameArray(question.finalAnswer, expected)) {
    add(errors, "G4BU04_INVERSE_SOLUTION_SET_INCOMPLETE", "structuredAnswer.values", "可能原數集合遺漏、多收、重複或未排序。", "ambiguity_and_inverse");
  }
  const lower = Math.max(0, question.input.roundedValue - question.input.targetUnit / 2);
  const upper = Math.min(MAX_INPUT, question.input.roundedValue + question.input.targetUnit / 2 - 1);
  if (question.derived?.intervalStart !== lower || question.derived?.intervalEnd !== upper) {
    add(errors, "G4BU04_INVERSE_INTERVAL_NOT_CLAMPED", "derived", "逆向四捨五入區間沒有正確截斷。", "ambiguity_and_inverse");
  }
}

function validatePattern(question, errors) {
  switch (question.patternSpecId) {
    case "ps_g4b_u04_approx_language_classify": validateLanguage(question, errors); break;
    case "ps_g4b_u04_approx_symbol_reading": validateSymbol(question, errors); break;
    case "ps_g4b_u04_method_compare_outputs": validateMethodComparison(question, errors); break;
    case "ps_g4b_u04_method_identify_from_result": validateMethodChoice(question, errors); break;
    case "ps_g4b_u04_unconditional_round_down": validateDirectRounding(question, "down", errors); break;
    case "ps_g4b_u04_unconditional_round_up": validateDirectRounding(question, "up", errors); break;
    case "ps_g4b_u04_round_half_up": validateDirectRounding(question, "half_up", errors); break;
    case "ps_g4b_u04_inverse_digit_set": validateInverseDigitSet(question, errors); break;
    case "ps_g4b_u04_inverse_original_values": validateInverseOriginalValues(question, errors); break;
    default: break;
  }
}

function validateSemanticAndSurface(question, errors) {
  if (!Array.isArray(question?.templateFamilyIds) || question.templateFamilyIds.length !== 0) {
    add(errors, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED", "templateFamilyIds", "Class C 題目不得掛載 Class D 情境模板。", "semantic_template_and_units");
  }
  if (/\{\{?\s*[A-Za-z0-9_.-]+\s*\}?\}/.test(question?.promptText ?? "")) {
    add(errors, "G4BU04_UNRESOLVED_PLACEHOLDER", "promptText", "題目含未解析 placeholder。", "semantic_template_and_units");
  }
  if (/(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_/i.test(question?.promptText ?? "")) {
    add(errors, "G4BU04_INTERNAL_ID_LEAKAGE", "promptText", "題面洩漏內部 curriculum ID。", "final_surface_contract");
  }
  if (
    question?.fallbackUsed !== false
    || question?.genericFallbackAllowed !== false
    || question?.generatorRouting !== "hidden_class_c_only_not_canonical"
  ) {
    add(errors, "G4BU04_GENERIC_FALLBACK_FORBIDDEN", "generatorRouting", "S69 禁止 generic fallback。", "final_surface_contract");
  }
}

export function validateG4BU04ClassCQuestion(question) {
  const errors = [];
  const spec = validateIdentity(question, errors);
  validateLifecycle(question, errors);
  validateDomain(question, errors);
  if (spec) {
    if (question.mode !== spec.mode || question.answerModelShape !== spec.answerModel.shape) {
      add(errors, "G4BU04_ANSWER_MODEL_MISMATCH", "answerModelShape", "題目 mode／答案模型與 authority 不一致。", "answer_model");
    }
    validatePattern(question, errors);
  }
  validateSemanticAndSurface(question, errors);
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
  });
}

export function validateG4BU04ClassCBatch(batchOrQuestions) {
  const questions = Array.isArray(batchOrQuestions) ? batchOrQuestions : batchOrQuestions?.questions;
  if (!Array.isArray(questions)) {
    const error = issue("G4BU04_REQUIRED_FIELD_MISSING", "questions", "批次缺少 questions。", "identity_and_schema");
    return Object.freeze({ ok: false, errors: Object.freeze([error]), warnings: Object.freeze([]), acceptedQuestions: Object.freeze([]) });
  }
  const errors = [];
  for (let index = 0; index < questions.length; index += 1) {
    const result = validateG4BU04ClassCQuestion(questions[index]);
    for (const row of result.errors) errors.push(Object.freeze({ ...row, path: `questions[${index}].${row.path}` }));
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    acceptedQuestions: errors.length === 0 ? Object.freeze([...questions]) : Object.freeze([]),
  });
}
