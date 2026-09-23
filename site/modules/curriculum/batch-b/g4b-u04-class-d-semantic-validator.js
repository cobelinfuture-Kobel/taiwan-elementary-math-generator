import {
  getG4BU04HiddenPatternSpecById,
} from "./source-pattern-g4b-u04-extension.js";
import {
  G4B_U04_BLOCKING_CODES,
  G4B_U04_VALIDATOR_STAGES,
} from "./g4b-u04-class-c-validator.js";
import {
  G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS,
  G4B_U04_S70_CONTROLLED_TEMPLATES,
  G4B_U04_S70_TEMPLATE_IDS,
  g4bU04MethodLabel,
  g4bU04RoundByMethod,
  g4bU04TargetPlaceLabel,
  renderG4BU04ControlledTemplate,
} from "./g4b-u04-class-d-semantic-generator.js";

const MAX_INPUT = 99_999_999;
const MAX_ANSWER = 999_999_999;
const TARGET_UNITS = Object.freeze([10, 100, 1000, 10000]);
const GROUP_SIZES = Object.freeze([10, 100, 1000]);
const DENOMINATIONS = Object.freeze([100, 1000]);
const METHODS = Object.freeze(["down", "up", "halfUp"]);
const DISCOUNT_POLICY = "whole_denomination_round_down";
const DISCOUNT_DENOMINATION = 1000;

const REQUIRED_FIELDS = Object.freeze([
  "questionId", "sourceId", "unitCode", "unitTitle", "kind", "representation",
  "applicationText", "patternSpecId", "formalMappingId", "sourceMappingCandidateId",
  "patternGroupId", "knowledgePointId", "mode", "implementationClass", "depth",
  "answerModelShape", "promptText", "answerText", "finalAnswer", "structuredAnswer",
  "input", "context", "templateRoles", "templateRoleBindings", "semanticTemplateId",
  "derived", "sourceEvidence", "templateFamilyIds", "selectorStatus", "canonicalRouting",
  "generatorRouting", "productionUse", "fallbackUsed", "genericFallbackAllowed", "seedLabel",
]);

export const G4B_U04_S70_BLOCKING_CODES = G4B_U04_BLOCKING_CODES;
export const G4B_U04_S70_VALIDATOR_STAGES = G4B_U04_VALIDATOR_STAGES;

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

function exactKeys(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function sameObject(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
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
  if (question?.kind !== "g4bU04RoundingApproximation" || question?.representation !== "controlled_semantic_application") {
    add(errors, "G4BU04_PATTERN_KIND_MISMATCH", "kind", "題型 kind／representation 不符合 S70。", stage);
  }
  const spec = getG4BU04HiddenPatternSpecById(question?.patternSpecId);
  if (!spec || spec.implementationClass !== "D" || !G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS.includes(question?.patternSpecId)) {
    add(errors, "G4BU04_PATTERN_SPEC_NOT_LOCKED", "patternSpecId", "PatternSpec 不在 S70 Class D 核准範圍。", stage);
    return null;
  }
  if (question.patternGroupId !== spec.patternGroupId) {
    add(errors, "G4BU04_PATTERN_GROUP_MISMATCH", "patternGroupId", "PatternGroup 與 PatternSpec 不一致。", stage);
  }
  if (question.knowledgePointId !== spec.knowledgePointId) {
    add(errors, "G4BU04_KNOWLEDGE_POINT_MISMATCH", "knowledgePointId", "KnowledgePoint 與 PatternSpec 不一致。", stage);
  }
  if (question.formalMappingId !== spec.formalMappingId || question.sourceMappingCandidateId !== spec.sourceMappingCandidateId) {
    add(errors, "G4BU04_SOURCE_MAPPING_REF_MISMATCH", "formalMappingId", "FormalMapping traceability 不一致。", stage);
  }
  return spec;
}

function validateLifecycle(question, errors) {
  const stage = "lifecycle_and_scope";
  if (
    question?.implementationClass !== "D"
    || question?.depth !== "S"
    || question?.applicationText !== true
    || !["application", "operation_estimation"].includes(question?.mode)
  ) {
    add(errors, "G4BU04_LIFECYCLE_STATE_INVALID", "implementationClass", "S70 只允許隱藏 Class D semantic 題目。", stage);
  }
  if (question?.selectorStatus !== "hidden" || question?.canonicalRouting !== "disabled") {
    add(errors, "G4BU04_PUBLIC_ROUTING_FORBIDDEN", "canonicalRouting", "S70 禁止 public selector 與 canonical routing。", stage);
  }
  if (question?.productionUse !== "forbidden") {
    add(errors, "G4BU04_PRODUCTION_USE_FORBIDDEN", "productionUse", "S70 禁止 production use。", stage);
  }
}

function validateDomain(question, errors) {
  const stage = "integer_domain_and_boundary";
  const numericValues = allNumericLeaves(question?.input ?? {});
  if (numericValues.some((value) => !isInteger(value))) {
    add(errors, "G4BU04_NONINTEGER_INPUT", "input", "Class D 計算輸入必須全部為整數。", stage);
  }
  if (numericValues.some((value) => value < 0)) {
    add(errors, "G4BU04_DECIMAL_NEGATIVE_DOMAIN_LEAKAGE", "input", "概數情境題禁止負數或小數輸入。", stage);
  }
  if (numericValues.some((value) => value > MAX_INPUT)) {
    add(errors, "G4BU04_INPUT_OUT_OF_RANGE", "input", "輸入超出核准整數範圍。", stage);
  }
  for (const key of ["targetUnit", "targetUnitA", "targetUnitB"]) {
    if (question?.input?.[key] !== undefined && !TARGET_UNITS.includes(question.input[key])) {
      add(errors, "G4BU04_TARGET_UNIT_NOT_ALLOWED", `input.${key}`, "取概數位值不在允許範圍。", stage);
    }
  }
  for (const key of ["groupSize", "capacityOrIncrement"]) {
    if (question?.input?.[key] !== undefined && !GROUP_SIZES.includes(question.input[key])) {
      add(errors, "G4BU04_GROUP_SIZE_NOT_ALLOWED", `input.${key}`, "群組大小不在來源核准範圍。", stage);
    }
  }
  if (question?.input?.denomination !== undefined && !DENOMINATIONS.includes(question.input.denomination)) {
    add(errors, "G4BU04_PAYMENT_DENOMINATION_NOT_ALLOWED", "input.denomination", "付款面額只允許 100 或 1000 元。", stage);
  }
  for (const key of ["factor", "divisor"]) {
    if (question?.input?.[key] !== undefined && (!isInteger(question.input[key]) || question.input[key] < 2 || question.input[key] > 9)) {
      add(errors, "G4BU04_FACTOR_DIVISOR_OUT_OF_RANGE", `input.${key}`, "乘數或除數必須在 2～9。", stage);
    }
  }
  for (const key of ["method", "methodA", "methodB"]) {
    if (question?.input?.[key] !== undefined && !METHODS.includes(question.input[key])) {
      add(errors, "G4BU04_FORMULA_MISMATCH", `input.${key}`, "取概數方法不在核准範圍。", "formula_and_operation");
    }
  }
}

function expectedRoles(question) {
  const input = question.input ?? {};
  const context = question.context ?? {};
  switch (question.semanticTemplateId) {
    case "tpl_g4b_u04_floor_complete_pack":
      return { total: input.total, itemUnit: context.itemUnit, groupSize: input.groupSize, containerClassifier: context.containerClassifier, containerName: context.containerName };
    case "tpl_g4b_u04_ceiling_pack_all":
      return { total: input.total, itemUnit: context.itemUnit, capacity: input.capacityOrIncrement, containerClassifier: context.containerClassifier, containerName: context.containerName };
    case "tpl_g4b_u04_ceiling_saving_periods":
      return { increment: input.capacityOrIncrement, target: input.total };
    case "tpl_g4b_u04_payment_amount":
    case "tpl_g4b_u04_payment_banknote_count":
      return { price: input.price, denomination: input.denomination };
    case "tpl_g4b_u04_discount_amount_round_down":
    case "tpl_g4b_u04_discount_banknote_count_round_down":
      return { productName: context.productName, price: input.price, denomination: input.denomination };
    case "tpl_g4b_u04_population_total":
    case "tpl_g4b_u04_population_difference":
      return {
        operandA: input.operandA,
        unitLabel: context.unitLabel,
        methodALabel: g4bU04MethodLabel(input.methodA),
        targetPlaceLabelA: g4bU04TargetPlaceLabel(input.targetUnitA),
        operandB: input.operandB,
        methodBLabel: g4bU04MethodLabel(input.methodB),
        targetPlaceLabelB: g4bU04TargetPlaceLabel(input.targetUnitB),
      };
    case "tpl_g4b_u04_recurring_cost_multiply":
      return { value: input.value, methodLabel: g4bU04MethodLabel(input.method), targetPlaceLabel: g4bU04TargetPlaceLabel(input.targetUnit), factor: input.factor };
    case "tpl_g4b_u04_equal_share_divide":
      return { value: input.value, methodLabel: g4bU04MethodLabel(input.method), targetPlaceLabel: g4bU04TargetPlaceLabel(input.targetUnit), divisor: input.divisor };
    default:
      return null;
  }
}

function validateTemplate(question, spec, errors) {
  const stage = "semantic_template_and_units";
  const templateId = question.semanticTemplateId;
  const template = G4B_U04_S70_CONTROLLED_TEMPLATES[templateId];
  if (
    !template
    || !G4B_U04_S70_TEMPLATE_IDS.includes(templateId)
    || !spec.templateFamilyIds.includes(templateId)
    || !sameObject(question.templateFamilyIds, [templateId])
    || question.input?.templateFamilyId !== templateId
  ) {
    add(errors, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED", "semanticTemplateId", "語意模板不在 PatternSpec 白名單。", stage);
    return;
  }
  if (template.mappingCandidateId !== spec.sourceMappingCandidateId) {
    add(errors, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED", "semanticTemplateId", "模板與 source mapping 不一致。", stage);
  }
  const roles = expectedRoles(question);
  if (!roles || !sameObject(question.templateRoles, roles) || !exactKeys(question.templateRoles, template.requiredRoles)) {
    add(errors, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED", "templateRoles", "模板角色、placeholder 與輸入綁定不一致。", stage);
  }
  if (!sameObject(question.templateRoleBindings, template.roleBindings)) {
    add(errors, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED", "templateRoleBindings", "模板 role binding 與 S67 overlay 不一致。", stage);
  }
  if (roles && question.promptText !== renderG4BU04ControlledTemplate(templateId, roles)) {
    add(errors, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED", "promptText", "題面不是受控模板的確定性渲染結果。", stage);
  }
  if (/\{\{?\s*[A-Za-z0-9_.-]+\s*\}?\}/.test(question.promptText ?? "")) {
    add(errors, "G4BU04_UNRESOLVED_PLACEHOLDER", "promptText", "題目含未解析 placeholder。", stage);
  }
}

function validateNumericAnswer(question, expectedValue, expectedUnit, errors) {
  if (
    question.answerModelShape !== "numericAnswer"
    || !exactKeys(question.structuredAnswer, ["value", "unitLabel"])
    || question.structuredAnswer.value !== expectedValue
    || question.structuredAnswer.unitLabel !== expectedUnit
    || question.finalAnswer !== expectedValue
  ) {
    add(errors, "G4BU04_ANSWER_MODEL_MISMATCH", "structuredAnswer", "numericAnswer 封閉 schema、數值或單位不正確。", "answer_model");
  }
  if (!isInteger(expectedValue) || expectedValue < 0 || expectedValue > MAX_ANSWER) {
    add(errors, "G4BU04_ANSWER_OUT_OF_RANGE", "structuredAnswer.value", "答案超出核准範圍。", "answer_model");
  }
}

function validateMoneyAmountAnswer(question, expectedAmount, errors) {
  if (
    question.answerModelShape !== "moneyAmountAnswer"
    || !exactKeys(question.structuredAnswer, ["amount", "currency", "unitLabel"])
    || question.structuredAnswer?.amount !== expectedAmount
    || question.structuredAnswer?.currency !== "TWD"
    || question.structuredAnswer?.unitLabel !== "元"
    || question.finalAnswer !== expectedAmount
  ) {
    add(errors, "G4BU04_ANSWER_MODEL_MISMATCH", "structuredAnswer", "moneyAmountAnswer 不符合封閉 schema。", "answer_model");
  }
}

function validateBanknoteCountAnswer(question, expectedCount, denomination, errors) {
  if (
    question.answerModelShape !== "banknoteCountAnswer"
    || !exactKeys(question.structuredAnswer, ["count", "denomination", "currency", "unitLabel"])
    || question.structuredAnswer?.count !== expectedCount
    || question.structuredAnswer?.denomination !== denomination
    || question.structuredAnswer?.currency !== "TWD"
    || question.structuredAnswer?.unitLabel !== "張"
    || question.finalAnswer !== expectedCount
  ) {
    add(errors, "G4BU04_ANSWER_MODEL_MISMATCH", "structuredAnswer", "banknoteCountAnswer 不符合封閉 schema。", "answer_model");
  }
}

function validateFloor(question, errors) {
  const { total, groupSize } = question.input;
  const expected = Math.floor(total / groupSize);
  const remainder = total % groupSize;
  if (question.finalAnswer !== expected || question.derived?.quotient !== expected) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "finalAnswer", "最多完整組數公式錯誤。", "formula_and_operation");
    add(errors, "G4BU04_FLOOR_REMAINDER_COUNTED", "finalAnswer", "餘數不得算成完整組。", "formula_and_operation");
  }
  if (remainder === 0 || question.derived?.remainder !== remainder) {
    add(errors, "G4BU04_FLOOR_REMAINDER_COUNTED", "derived.remainder", "S70 floor 情境必須保留非零餘數。", "formula_and_operation");
  }
  validateNumericAnswer(question, expected, question.context.containerClassifier, errors);
}

function validateCeiling(question, errors) {
  const { total, capacityOrIncrement } = question.input;
  const expected = Math.ceil(total / capacityOrIncrement);
  const remainder = total % capacityOrIncrement;
  if (question.finalAnswer !== expected || question.derived?.minimumRequired !== expected) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "finalAnswer", "最少需求數量公式錯誤。", "formula_and_operation");
    add(errors, "G4BU04_CEILING_REMAINDER_DISCARDED", "finalAnswer", "非零餘數必須再增加一個單位。", "formula_and_operation");
  }
  if (remainder === 0 || question.derived?.remainder !== remainder) {
    add(errors, "G4BU04_CEILING_REMAINDER_DISCARDED", "derived.remainder", "S70 ceiling 情境必須保留非零餘數。", "formula_and_operation");
  }
  const unit = question.semanticTemplateId === "tpl_g4b_u04_ceiling_saving_periods" ? "月" : question.context.containerClassifier;
  validateNumericAnswer(question, expected, unit, errors);
}

function validatePaymentAmount(question, errors) {
  const { price, denomination } = question.input;
  const expectedAmount = Math.ceil(price / denomination) * denomination;
  const candidateAmount = question.structuredAnswer?.amount;
  validateMoneyAmountAnswer(question, expectedAmount, errors);
  if (!isInteger(candidateAmount) || candidateAmount < price) {
    add(errors, "G4BU04_PAYMENT_INSUFFICIENT", "structuredAnswer.amount", "付款金額不足。", "formula_and_operation");
  }
  if (!isInteger(candidateAmount) || candidateAmount % denomination !== 0 || candidateAmount - denomination >= price) {
    add(errors, "G4BU04_PAYMENT_NOT_MINIMUM_MULTIPLE", "structuredAnswer.amount", "付款金額不是最小足額面額倍數。", "formula_and_operation");
  }
  if (price % denomination === 0) {
    add(errors, "G4BU04_PAYMENT_NOT_MINIMUM_MULTIPLE", "input.price", "S70 付款題必須包含非零餘額。", "formula_and_operation");
  }
}

function validateBanknoteCount(question, errors) {
  const { price, denomination } = question.input;
  const expectedCount = Math.ceil(price / denomination);
  const candidateCount = question.structuredAnswer?.count;
  validateBanknoteCountAnswer(question, expectedCount, denomination, errors);
  if (!isInteger(candidateCount) || candidateCount * denomination < price) {
    add(errors, "G4BU04_BANKNOTE_COUNT_NOT_MINIMUM", "structuredAnswer.count", "鈔票張數不足。", "formula_and_operation");
  }
  if (isInteger(candidateCount) && (candidateCount - 1) * denomination >= price) {
    add(errors, "G4BU04_ONE_FEWER_NOTE_SUFFICIENT", "structuredAnswer.count", "少一張仍足額，答案不是最小張數。", "formula_and_operation");
  }
}

function validateDiscountCommon(question, errors) {
  const { price, denomination, discountPolicy } = question.input ?? {};
  const expectedAmount = Math.floor(price / denomination) * denomination;
  const expectedCount = expectedAmount / denomination;
  const remainder = price - expectedAmount;
  if (
    denomination !== DISCOUNT_DENOMINATION
    || discountPolicy !== DISCOUNT_POLICY
    || question.context?.contextDomain !== "discount_price"
    || question.context?.productName !== "除濕機"
  ) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "input.discountPolicy", "特價整千元情境的來源邊界不正確。", "formula_and_operation");
  }
  if (
    !isInteger(price)
    || !isInteger(expectedAmount)
    || expectedAmount >= price
    || remainder <= 0
    || remainder >= denomination
    || expectedAmount % denomination !== 0
  ) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "derived.discountedAmount", "特價必須是低於定價的最大整千元倍數。", "formula_and_operation");
  }
  if (
    question.derived?.discountedAmount !== expectedAmount
    || question.derived?.count !== expectedCount
    || question.derived?.remainder !== remainder
    || question.derived?.savings !== remainder
    || question.derived?.originalPrice !== price
  ) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "derived", "特價捨去的衍生值不正確。", "formula_and_operation");
  }
  return { expectedAmount, expectedCount, denomination };
}

function validateDiscountAmount(question, errors) {
  const { expectedAmount } = validateDiscountCommon(question, errors);
  validateMoneyAmountAnswer(question, expectedAmount, errors);
}

function validateDiscountBanknoteCount(question, errors) {
  const { expectedAmount, expectedCount, denomination } = validateDiscountCommon(question, errors);
  validateBanknoteCountAnswer(question, expectedCount, denomination, errors);
  if (expectedCount * denomination !== expectedAmount || expectedAmount >= question.input.price) {
    add(errors, "G4BU04_FORMULA_MISMATCH", "structuredAnswer.count", "特價鈔票張數必須等於捨去後特價除以面額。", "formula_and_operation");
  }
}

function validateRoundedPair(question, operation, errors) {
  const input = question.input;
  const roundedA = g4bU04RoundByMethod(input.operandA, input.methodA, input.targetUnitA);
  const roundedB = g4bU04RoundByMethod(input.operandB, input.methodB, input.targetUnitB);
  if (question.derived?.roundedA !== roundedA || question.derived?.roundedB !== roundedB) {
    add(errors, "G4BU04_ROUNDED_OPERAND_MISMATCH", "derived", "先取概數後的兩個運算元不正確。", "formula_and_operation");
  }
  const expected = operation === "add" ? roundedA + roundedB : Math.abs(roundedA - roundedB);
  if (question.finalAnswer !== expected || question.derived?.operation !== operation) {
    add(errors, "G4BU04_ESTIMATED_OPERATION_MISMATCH", "finalAnswer", "取概數後的加減估算結果錯誤。", "formula_and_operation");
  }
  if (operation === "subtract" && expected <= 0) {
    add(errors, "G4BU04_SUBTRACTION_NEGATIVE_OR_ZERO_TRIVIAL", "finalAnswer", "減法估算不得為零或負向平凡題。", "formula_and_operation");
  }
  validateNumericAnswer(question, expected, question.context.unitLabel, errors);
}

function validateRoundThenMultiply(question, errors) {
  const { value, method, targetUnit, factor } = question.input;
  const roundedValue = g4bU04RoundByMethod(value, method, targetUnit);
  const expected = roundedValue * factor;
  if (question.derived?.roundedValue !== roundedValue) {
    add(errors, "G4BU04_ROUNDED_OPERAND_MISMATCH", "derived.roundedValue", "乘法前的概數不正確。", "formula_and_operation");
  }
  if (question.finalAnswer !== expected) {
    add(errors, "G4BU04_ESTIMATED_OPERATION_MISMATCH", "finalAnswer", "概數乘法估算錯誤。", "formula_and_operation");
  }
  validateNumericAnswer(question, expected, "元", errors);
}

function validateRoundThenDivide(question, errors) {
  const { value, method, targetUnit, divisor } = question.input;
  const roundedValue = g4bU04RoundByMethod(value, method, targetUnit);
  if (question.derived?.roundedValue !== roundedValue) {
    add(errors, "G4BU04_ROUNDED_OPERAND_MISMATCH", "derived.roundedValue", "除法前的概數不正確。", "formula_and_operation");
  }
  if (roundedValue % divisor !== 0) {
    add(errors, "G4BU04_DIVISION_NONINTEGER", "input.divisor", "取概數後必須能被除數整除。", "formula_and_operation");
  }
  const expected = roundedValue / divisor;
  if (!isInteger(expected) || question.finalAnswer !== expected) {
    add(errors, "G4BU04_ESTIMATED_OPERATION_MISMATCH", "finalAnswer", "概數除法估算錯誤。", "formula_and_operation");
  }
  validateNumericAnswer(question, expected, "元", errors);
}

function validatePattern(question, errors) {
  switch (question.patternSpecId) {
    case "ps_g4b_u04_floor_complete_groups": validateFloor(question, errors); break;
    case "ps_g4b_u04_ceiling_minimum_required": validateCeiling(question, errors); break;
    case "ps_g4b_u04_payment_amount_ceiling": validatePaymentAmount(question, errors); break;
    case "ps_g4b_u04_payment_banknote_count": validateBanknoteCount(question, errors); break;
    case "ps_g4b_u04_round_then_add": validateRoundedPair(question, "add", errors); break;
    case "ps_g4b_u04_round_then_subtract": validateRoundedPair(question, "subtract", errors); break;
    case "ps_g4b_u04_round_then_multiply": validateRoundThenMultiply(question, errors); break;
    case "ps_g4b_u04_round_then_divide": validateRoundThenDivide(question, errors); break;
    case "ps_g4b_u04_discount_payment_amount_round_down": validateDiscountAmount(question, errors); break;
    case "ps_g4b_u04_discount_banknote_count_round_down": validateDiscountBanknoteCount(question, errors); break;
    default: break;
  }
}

function validateSurface(question, errors) {
  if (/(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_/i.test(question?.promptText ?? "")) {
    add(errors, "G4BU04_INTERNAL_ID_LEAKAGE", "promptText", "題面洩漏內部 curriculum ID。", "final_surface_contract");
  }
  if (
    question?.fallbackUsed !== false
    || question?.genericFallbackAllowed !== false
    || question?.generatorRouting !== "hidden_class_d_only_not_canonical"
  ) {
    add(errors, "G4BU04_GENERIC_FALLBACK_FORBIDDEN", "generatorRouting", "S70 禁止 generic fallback。", "final_surface_contract");
  }
}

export function validateG4BU04ClassDQuestion(question) {
  const errors = [];
  const spec = validateIdentity(question, errors);
  validateLifecycle(question, errors);
  validateDomain(question, errors);
  if (spec) {
    if (question.mode !== spec.mode || question.answerModelShape !== spec.answerModel.shape) {
      add(errors, "G4BU04_ANSWER_MODEL_MISMATCH", "answerModelShape", "題目 mode／答案模型與 authority 不一致。", "answer_model");
    }
    validateTemplate(question, spec, errors);
    validatePattern(question, errors);
  }
  validateSurface(question, errors);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
}

export function validateG4BU04ClassDBatch(batchOrQuestions) {
  const questions = Array.isArray(batchOrQuestions) ? batchOrQuestions : batchOrQuestions?.questions;
  if (!Array.isArray(questions)) {
    const error = issue("G4BU04_REQUIRED_FIELD_MISSING", "questions", "批次缺少 questions。", "identity_and_schema");
    return Object.freeze({ ok: false, errors: Object.freeze([error]), warnings: Object.freeze([]), acceptedQuestions: Object.freeze([]) });
  }
  const errors = [];
  for (let index = 0; index < questions.length; index += 1) {
    const result = validateG4BU04ClassDQuestion(questions[index]);
    for (const row of result.errors) errors.push(Object.freeze({ ...row, path: `questions[${index}].${row.path}` }));
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    acceptedQuestions: errors.length === 0 ? Object.freeze([...questions]) : Object.freeze([]),
  });
}
