import {
  getG5AU08HiddenPatternSpecById,
} from "./source-pattern-g5a-u08-extension.js";
import {
  ALLOWED_SDG_IDS,
  G5A_U08_S60H_PATTERN_SPEC_IDS,
  SPEC_POLICY,
} from "./g5a-u08-application-generator.js";
import {
  G5A_U08_BLOCKING_CODES,
  G5A_U08_WARNING_CODES,
} from "./g5a-u08-numeric-validator.js";

function issue(code, path, message, stage, severity = "error") {
  return { code, severity, path, message, stage };
}

function add(errors, code, path, message, stage) {
  if (!errors.some((row) => row.code === code && row.path === path)) {
    errors.push(issue(code, path, message, stage));
  }
}

function isInteger(value) {
  return Number.isSafeInteger(value);
}

function numericValues(value, output = []) {
  if (isInteger(value)) output.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => numericValues(entry, output));
  else if (value && typeof value === "object") Object.values(value).forEach((entry) => numericValues(entry, output));
  return output;
}

function hasTraditionalChinese(text) {
  return typeof text === "string" && /[\u3400-\u9fff]/u.test(text);
}

function validateIdentity(question, errors) {
  const stage = "identity_and_scope";
  const spec = getG5AU08HiddenPatternSpecById(question?.patternSpecId);
  const policy = SPEC_POLICY[question?.patternSpecId];
  if (question?.sourceId !== "g5a_u08_5a08" || question?.unitCode !== "5A-U08") {
    add(errors, "G5A_U08_SOURCE_ID_MISMATCH", "sourceId", "題目來源不是 G5A-U08。", stage);
  }
  if (!spec || !policy || !G5A_U08_S60H_PATTERN_SPEC_IDS.includes(question?.patternSpecId)) {
    add(errors, "G5A_U08_PATTERN_SPEC_MISMATCH", "patternSpecId", "PatternSpec 不在 S60H 核准範圍。", stage);
    return null;
  }
  if (question.patternGroupId !== spec.patternGroupId) {
    add(errors, "G5A_U08_PATTERN_GROUP_MISMATCH", "patternGroupId", "PatternGroup 與 PatternSpec 不一致。", stage);
  }
  if (question.knowledgePointId !== spec.knowledgePointId) {
    add(errors, "G5A_U08_KNOWLEDGE_POINT_MISMATCH", "knowledgePointId", "KnowledgePoint 與 PatternSpec 不一致。", stage);
  }
  if (question.mode !== spec.mode) {
    add(errors, "G5A_U08_MODE_MISMATCH", "mode", "題型 mode 與 PatternSpec 不一致。", stage);
  }
  if (question.templateFamilyId !== policy.templateFamilyId || question.templateFamilyId !== spec.templateFamilyId) {
    add(errors, "G5A_U08_PATTERN_SPEC_MISMATCH", "templateFamilyId", "TemplateFamily 與 PatternSpec 不一致。", stage);
  }
  const expectsContextualReasoning = spec.contextualReasoning === true;
  if (question.contextualReasoning !== expectsContextualReasoning) {
    add(errors, "G5A_U08_MODE_MISMATCH", "contextualReasoning", "情境推理旗標與 PatternSpec 不一致。", stage);
  }
  if (
    question.kind !== "g5aU08IntegerFourOperations" ||
    question.generatorRouting !== "hidden_application_not_canonical" ||
    question.fallbackUsed === true ||
    question.genericFallbackAllowed === true
  ) {
    add(errors, "G5A_U08_GENERIC_FALLBACK_FORBIDDEN", "generatorRouting", "S60H 禁止 generic fallback 或公開 routing。", stage);
  }
  return { spec, policy };
}

function validateDepth(question, policy, errors) {
  const stage = "depth_and_semantic_delta";
  if (!policy.depths.includes(question.depth)) {
    add(errors, "G5A_U08_DEPTH_NOT_ALLOWED", "depth", "題目深度不在 TemplateFamily allowlist。", stage);
  }
  if (question.depth === "N_PLUS_2") {
    add(errors, "G5A_U08_N_PLUS_2_FORBIDDEN_IN_CORE", "depth", "核心 S60H 禁止 N+2。", stage);
  }
  const expected = policy.deltaByDepth[question.depth] ?? null;
  if (!Array.isArray(question.semanticDeltaIds) || !expected) {
    add(errors, "G5A_U08_SEMANTIC_DELTA_COUNT_INVALID", "semanticDeltaIds", "semantic delta 結構無效。", stage);
    return;
  }
  const expectedCount = question.depth === "N_PLUS_1" ? 1 : 0;
  if (question.semanticDeltaIds.length !== expectedCount) {
    add(errors, "G5A_U08_SEMANTIC_DELTA_COUNT_INVALID", "semanticDeltaIds", "N+1 必須恰有一個 semantic delta；N 必須為零。", stage);
  }
  if (
    question.semanticDeltaIds.length !== expected.length ||
    question.semanticDeltaIds.some((id, index) => id !== expected[index])
  ) {
    add(errors, "G5A_U08_SEMANTIC_DELTA_NOT_ALLOWED", "semanticDeltaIds", "semantic delta 不在 PatternSpec allowlist。", stage);
  }
}

function validateContext(question, policy, errors) {
  const stage = "context_and_language";
  const context = question.context ?? {};
  if (!policy.contexts.includes(context.contextType)) {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "context.contextType", "情境類型不受此 PatternSpec 支援。", stage);
  }
  if (!hasTraditionalChinese(question.promptText)) {
    add(errors, "G5A_U08_EXPRESSION_PARSE_FAILED", "promptText", "應用題必須使用可讀的繁體中文情境。", stage);
  }
  if (question.applicationText !== true || question.representation !== "application_text") {
    add(errors, "G5A_U08_MODE_MISMATCH", "applicationText", "S60H 題目必須是情境文字題。", stage);
  }
  if (!Array.isArray(question.unitFlow) || question.unitFlow.length < 2 || !question.unitFlow.every((row) => typeof row === "string" && row.length > 0)) {
    add(errors, "G5A_U08_UNIT_FLOW_INVALID", "unitFlow", "UnitFlow 不完整。", stage);
  }
  if (!question.roleBindings || typeof question.roleBindings !== "object") {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "roleBindings", "RoleBinding 不完整。", stage);
  }
  if (numericValues(question.roleBindings).some((value) => value < 0)) {
    add(errors, "G5A_U08_NEGATIVE_QUANTITY_FORBIDDEN", "roleBindings", "情境數量不得為負數。", stage);
  }
  if (context.contextType === "sdg") {
    if (!ALLOWED_SDG_IDS.includes(context.sdgGoalId)) {
      add(errors, "G5A_U08_ROLE_BINDING_INVALID", "context.sdgGoalId", "SDG goal 不在核准清單。", stage);
    }
    if (
      context.sdgActionAffectsMath !== true ||
      typeof context.semanticRelevance !== "string" ||
      context.semanticRelevance.length < 8
    ) {
      add(errors, "G5A_U08_SDG_LABEL_ONLY_CONTEXT", "context.semanticRelevance", "SDG 行動必須實際影響數量關係。", stage);
    }
  } else if (context.sdgGoalId !== null || context.sdgActionAffectsMath !== false) {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "context", "一般生活情境不得偽裝為 SDG。", stage);
  }
  if (context.dataStatus !== "fictionalized_for_practice" && !context.sourceRef) {
    add(errors, "G5A_U08_REAL_STATISTIC_SOURCE_REQUIRED", "context.sourceRef", "非虛構統計必須提供 sourceRef。", stage);
  }
}

function validateExpressionAnswer(question, expectedExpression, expectedValue, expectedUnit, errors) {
  const stage = "answer_and_expression";
  const answer = question.structuredAnswer ?? {};
  if (
    question.answerModelShape !== "expressionAnswer" ||
    question.canonicalExpression !== expectedExpression ||
    question.finalAnswer !== expectedValue ||
    answer.expression !== expectedExpression ||
    answer.value !== expectedValue ||
    answer.unit !== expectedUnit
  ) {
    add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "structuredAnswer", "一式解題的算式、數值或單位不一致。", stage);
  }
  if (typeof question.canonicalExpression !== "string" || question.canonicalExpression.includes("\n")) {
    add(errors, "G5A_U08_SINGLE_EXPRESSION_REQUIRED", "canonicalExpression", "來源要求只列一個計算式。", stage);
  }
}

function validateSameRate(question, errors) {
  const r = question.roleBindings ?? {};
  if (![r.rate, r.countA, r.countB, r.total].every(isInteger) || r.countA <= 0 || r.countB <= 0) {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "roleBindings", "同率兩組的角色綁定錯誤。", "semantic_contract");
    return;
  }
  const expected = r.rate * r.countA + r.rate * r.countB;
  if (r.total !== expected) add(errors, "G5A_U08_REQUIRED_FACT_UNUSED", "roleBindings.total", "兩組數量必須各使用一次。", "semantic_contract");
  validateExpressionAnswer(question, `${r.rate}×${r.countA}＋${r.rate}×${r.countB}`, expected, "元", errors);
}

function validateProductDifference(question, errors) {
  const r = question.roleBindings ?? {};
  const removed = r.reservedOrRemovedCount;
  if (![r.rate, r.availableCount, removed, r.remainingTotal].every(isInteger) || r.availableCount < removed) {
    add(errors, "G5A_U08_IMPOSSIBLE_ALLOCATION", "roleBindings", "移除組數不得超過可用組數。", "semantic_contract");
    return;
  }
  const expected = r.rate * r.availableCount - r.rate * removed;
  if (r.remainingTotal !== expected) add(errors, "G5A_U08_ROLE_BINDING_INVALID", "roleBindings.remainingTotal", "剩餘容量錯誤。", "semantic_contract");
  validateExpressionAnswer(question, `${r.rate}×${r.availableCount}－${r.rate}×${removed}`, expected, "個", errors);
}

function validateDiscount(question, errors) {
  const r = question.roleBindings ?? {};
  if (![r.unitPrice, r.quantity, r.discountGroupSize, r.discountPerGroup, r.payment, r.change].every(isInteger)) {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "roleBindings", "折扣找零角色綁定錯誤。", "semantic_contract");
    return;
  }
  if (r.discountGroupSize <= 0 || r.quantity % r.discountGroupSize !== 0) {
    add(errors, "G5A_U08_IMPOSSIBLE_ALLOCATION", "roleBindings.quantity", "購買數量必須可完整套用固定組數折扣。", "semantic_contract");
    return;
  }
  const groups = r.quantity / r.discountGroupSize;
  const cost = r.unitPrice * r.quantity - r.discountPerGroup * groups;
  if (r.payment < cost) add(errors, "G5A_U08_PAYMENT_INSUFFICIENT", "roleBindings.payment", "要求找零時付款額必須足夠。", "semantic_contract");
  const expected = r.payment - cost;
  if (r.change !== expected) add(errors, "G5A_U08_NUMERIC_ANSWER_INCORRECT", "roleBindings.change", "找零金額錯誤。", "semantic_contract");
  validateExpressionAnswer(question, `${r.payment}－(${r.unitPrice}×${r.quantity}－${r.discountPerGroup}×${groups})`, expected, "元", errors);
}

function validateAdjustUnit(question, errors) {
  const r = question.roleBindings ?? {};
  if (![r.startingTotal, r.originalUnitAmount, r.unitAdjustment, r.count, r.remainingTotal].every(isInteger)) {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "roleBindings", "單位量調整角色綁定錯誤。", "semantic_contract");
    return;
  }
  if (r.originalUnitAmount <= r.unitAdjustment) {
    add(errors, "G5A_U08_NEGATIVE_QUANTITY_FORBIDDEN", "roleBindings.unitAdjustment", "調整後單位量必須為正。", "semantic_contract");
  }
  const used = (r.originalUnitAmount - r.unitAdjustment) * r.count;
  if (r.startingTotal < used) add(errors, "G5A_U08_IMPOSSIBLE_ALLOCATION", "roleBindings.startingTotal", "起始總量不足。", "semantic_contract");
  const expected = r.startingTotal - used;
  if (r.remainingTotal !== expected) add(errors, "G5A_U08_NUMERIC_ANSWER_INCORRECT", "roleBindings.remainingTotal", "剩餘量錯誤。", "semantic_contract");
  const unit = question.structuredAnswer?.unit;
  validateExpressionAnswer(question, `${r.startingTotal}－(${r.originalUnitAmount}－${r.unitAdjustment})×${r.count}`, expected, unit, errors);
}

function validateGroupSelect(question, errors) {
  const r = question.roleBindings ?? {};
  if (![r.total, r.groupCount, r.selectedGroupCount, r.selectedQuantity].every(isInteger) || r.groupCount <= 0) {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "roleBindings", "分組選取角色綁定錯誤。", "semantic_contract");
    return;
  }
  if (r.total % r.groupCount !== 0 || r.selectedGroupCount > r.groupCount) {
    add(errors, "G5A_U08_IMPOSSIBLE_ALLOCATION", "roleBindings", "必須平均分組且選取組數不得超過總組數。", "semantic_contract");
  }
  const expected = r.total / r.groupCount * r.selectedGroupCount;
  if (r.selectedQuantity !== expected) add(errors, "G5A_U08_NUMERIC_ANSWER_INCORRECT", "roleBindings.selectedQuantity", "選取數量錯誤。", "semantic_contract");
  validateExpressionAnswer(question, `${r.total}÷${r.groupCount}×${r.selectedGroupCount}`, expected, question.structuredAnswer?.unit, errors);
}

function validateNearRoundPrice(question, errors) {
  const r = question.roleBindings ?? {};
  if (![r.nearRoundUnitPrice, r.quantity, r.totalCost, r.roundAnchor, r.offset].every(isInteger)) {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "roleBindings", "接近整數單價角色綁定錯誤。", "semantic_contract");
    return;
  }
  if (Math.abs(r.nearRoundUnitPrice - r.roundAnchor) !== r.offset || r.offset < 1 || r.offset > 9) {
    add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "roleBindings.roundAnchor", "單價與湊整基準不一致。", "semantic_contract");
  }
  const expected = r.nearRoundUnitPrice * r.quantity;
  if (r.totalCost !== expected) add(errors, "G5A_U08_NUMERIC_ANSWER_INCORRECT", "roleBindings.totalCost", "總價錯誤。", "semantic_contract");
  validateExpressionAnswer(question, `${r.nearRoundUnitPrice}×${r.quantity}`, expected, "元", errors);
}

function validateNestedGrouping(question, errors) {
  const r = question.roleBindings ?? {};
  if (![r.total, r.itemsPerFirstGroup, r.secondGroupCount, r.groupsPerSecondContainer].every(isInteger)) {
    add(errors, "G5A_U08_ROLE_BINDING_INVALID", "roleBindings", "雙層分組角色綁定錯誤。", "semantic_contract");
    return;
  }
  if (
    r.itemsPerFirstGroup <= 0 || r.secondGroupCount <= 0 ||
    r.total % r.itemsPerFirstGroup !== 0 ||
    (r.total / r.itemsPerFirstGroup) % r.secondGroupCount !== 0
  ) {
    add(errors, "G5A_U08_IMPOSSIBLE_ALLOCATION", "roleBindings", "兩層分組都必須整除。", "semantic_contract");
  }
  const expected = r.total / r.itemsPerFirstGroup / r.secondGroupCount;
  if (r.groupsPerSecondContainer !== expected) add(errors, "G5A_U08_NUMERIC_ANSWER_INCORRECT", "roleBindings.groupsPerSecondContainer", "第二層每組數量錯誤。", "semantic_contract");
  validateExpressionAnswer(question, `${r.total}÷${r.itemsPerFirstGroup}÷${r.secondGroupCount}`, expected, question.structuredAnswer?.unit, errors);
}

function validateDirectAverage(question, errors) {
  const r = question.roleBindings ?? {};
  if (!Array.isArray(r.values) || r.values.length !== r.count || !r.values.every(isInteger) || !isInteger(r.average)) {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "roleBindings", "平均數角色綁定錯誤。", "semantic_contract");
    return;
  }
  const total = r.values.reduce((sum, value) => sum + value, 0);
  if (total % r.count !== 0 || total / r.count !== r.average || question.finalAnswer !== r.average) {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "roleBindings.average", "總和、個數與平均不一致。", "semantic_contract");
  }
  if (question.answerModelShape !== "numericAnswer" || question.structuredAnswer?.average !== r.average) {
    add(errors, "G5A_U08_NUMERIC_ANSWER_INCORRECT", "structuredAnswer", "平均數答案模型錯誤。", "answer_and_expression");
  }
}

function validateAverageShare(question, errors) {
  const r = question.roleBindings ?? {};
  const answer = question.structuredAnswer ?? {};
  if (!Array.isArray(r.payments) || r.payments.length !== r.count || !r.payments.every(isInteger) || !isInteger(r.averageShare) || !isInteger(r.transferAmount)) {
    add(errors, "G5A_U08_ALLOCATION_TRANSFER_INCORRECT", "roleBindings", "平均分攤角色綁定錯誤。", "semantic_contract");
    return;
  }
  const total = r.payments.reduce((sum, value) => sum + value, 0);
  if (total % r.count !== 0 || total / r.count !== r.averageShare) {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "roleBindings.averageShare", "平均分攤額錯誤。", "semantic_contract");
  }
  const highIndex = r.payments.findIndex((value) => value > r.averageShare);
  const lowIndex = r.payments.findIndex((value) => value < r.averageShare);
  const expectedTransfer = r.payments[highIndex] - r.averageShare;
  const names = ["甲", "乙", "丙", "丁", "戊"];
  if (
    expectedTransfer !== r.transferAmount ||
    answer.averageShare !== r.averageShare ||
    answer.from !== names[lowIndex] ||
    answer.to !== names[highIndex] ||
    answer.transferAmount !== expectedTransfer ||
    question.finalAnswer !== expectedTransfer
  ) {
    add(errors, "G5A_U08_ALLOCATION_TRANSFER_INCORRECT", "structuredAnswer", "補款方向或金額錯誤。", "semantic_contract");
  }
  if (question.answerModelShape !== "allocationTransferAnswer") {
    add(errors, "G5A_U08_ALLOCATION_TRANSFER_INCORRECT", "answerModelShape", "答案模型必須是 allocationTransferAnswer。", "answer_and_expression");
  }
}

function validateAverageInverse(question, errors) {
  const r = question.roleBindings ?? {};
  const answer = question.structuredAnswer ?? {};
  if (!isInteger(r.average) || !isInteger(r.count) || !Array.isArray(r.knownValues) || !r.knownValues.every(isInteger) || !isInteger(r.missingValue)) {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "roleBindings", "平均逆推角色綁定錯誤。", "semantic_contract");
    return;
  }
  if (r.knownValues.length !== r.count - 1) {
    add(errors, "G5A_U08_AVERAGE_MISSING_VALUE_NOT_UNIQUE", "roleBindings.knownValues", "已知項目數不足以唯一反推缺項。", "semantic_contract");
  }
  const total = r.average * r.count;
  const missing = total - r.knownValues.reduce((sum, value) => sum + value, 0);
  if (missing !== r.missingValue || answer.variant !== "inverse" || answer.total !== total || answer.missingValue !== missing || question.finalAnswer !== missing) {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "structuredAnswer", "平均逆推總量或缺項錯誤。", "semantic_contract");
  }
  if (question.answerModelShape !== "averageInverseAnswer") {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "answerModelShape", "答案模型必須是 averageInverseAnswer。", "answer_and_expression");
  }
}

function validateAverageUpdate(question, errors) {
  const r = question.roleBindings ?? {};
  const answer = question.structuredAnswer ?? {};
  if (![r.average, r.count, r.memberValue, r.newAverage].every(isInteger)) {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "roleBindings", "平均更新角色綁定錯誤。", "semantic_contract");
    return;
  }
  const newCount = r.count + 1;
  const numerator = r.average * r.count + r.memberValue;
  if (numerator % newCount !== 0) {
    add(errors, "G5A_U08_NONINTEGER_RESULT_FORBIDDEN", "roleBindings", "更新後平均必須是整數。", "semantic_contract");
  }
  const expected = numerator / newCount;
  if (
    expected !== r.newAverage ||
    answer.variant !== "update" ||
    answer.oldTotal !== r.average * r.count ||
    answer.newCount !== newCount ||
    answer.newAverage !== expected ||
    question.finalAnswer !== expected
  ) {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "structuredAnswer", "平均更新關係錯誤。", "semantic_contract");
  }
  if (question.answerModelShape !== "averageInverseAnswer") {
    add(errors, "G5A_U08_AVERAGE_CONTRACT_BROKEN", "answerModelShape", "答案模型必須是 averageInverseAnswer。", "answer_and_expression");
  }
}

function validatePattern(question, errors) {
  switch (question.patternSpecId) {
    case "ps_g5a_u08_app_two_same_rate_groups_sum": return validateSameRate(question, errors);
    case "ps_g5a_u08_app_two_product_groups_difference": return validateProductDifference(question, errors);
    case "ps_g5a_u08_app_discount_change": return validateDiscount(question, errors);
    case "ps_g5a_u08_app_adjust_unit_remaining": return validateAdjustUnit(question, errors);
    case "ps_g5a_u08_app_group_select": return validateGroupSelect(question, errors);
    case "ps_g5a_u08_app_near_round_unit_price": return validateNearRoundPrice(question, errors);
    case "ps_g5a_u08_app_nested_grouping": return validateNestedGrouping(question, errors);
    case "ps_g5a_u08_app_direct_average": return validateDirectAverage(question, errors);
    case "ps_g5a_u08_app_average_share_transfer": return validateAverageShare(question, errors);
    case "ps_g5a_u08_app_average_inverse": return validateAverageInverse(question, errors);
    case "ps_g5a_u08_app_average_update": return validateAverageUpdate(question, errors);
    default: add(errors, "G5A_U08_PATTERN_SPEC_MISMATCH", "patternSpecId", "PatternSpec 未實作。", "identity_and_scope");
  }
}

export function validateG5AU08ApplicationQuestion(question) {
  const errors = [];
  const warnings = [];
  const identity = validateIdentity(question, errors);
  if (identity) {
    validateDepth(question, identity.policy, errors);
    validateContext(question, identity.policy, errors);
    validatePattern(question, errors);
  }
  const valid = errors.length === 0;
  return Object.freeze({
    valid,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    output: valid ? question : null,
  });
}

function allocationFromQuestions(questions, selector) {
  const counts = {};
  for (const question of questions) {
    const key = selector(question);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function validateG5AU08ApplicationBatch(batch) {
  const errors = [];
  const warnings = [];
  const questions = Array.isArray(batch?.questions) ? batch.questions : [];
  if (batch?.sourceId !== "g5a_u08_5a08" || batch?.unitCode !== "5A-U08" || batch?.kind !== "g5aU08ApplicationBatch") {
    add(errors, "G5A_U08_SOURCE_ID_MISMATCH", "batch.sourceId", "批次來源不是 G5A-U08。", "production_gate");
  }
  if (
    batch?.generatorRouting !== "hidden_application_not_canonical" ||
    batch?.fallbackUsed === true ||
    questions.length !== batch?.questionCount
  ) {
    add(errors, "G5A_U08_GENERIC_FALLBACK_FORBIDDEN", "batch.generatorRouting", "批次 routing、fallback 或題數契約錯誤。", "production_gate");
  }
  questions.forEach((question, index) => {
    const result = validateG5AU08ApplicationQuestion(question);
    for (const entry of result.errors) {
      errors.push({ ...entry, path: `questions[${index}].${entry.path}` });
    }
  });

  const actualSpec = allocationFromQuestions(questions, (row) => row.patternSpecId);
  const actualDepth = allocationFromQuestions(questions, (row) => row.depth);
  const actualContext = allocationFromQuestions(questions, (row) => row.context.contextType);
  for (const [id, count] of Object.entries(batch?.specAllocation ?? {})) {
    if ((actualSpec[id] ?? 0) !== count) add(errors, "G5A_U08_PATTERN_SPEC_MISMATCH", "batch.specAllocation", "PatternSpec allocation 與題目不一致。", "production_gate");
  }
  for (const key of ["N", "N_PLUS_1"]) {
    if ((actualDepth[key] ?? 0) !== (batch?.depthAllocation?.[key] ?? 0)) add(errors, "G5A_U08_DEPTH_NOT_ALLOWED", "batch.depthAllocation", "深度配置與題目不一致。", "production_gate");
  }
  for (const key of ["daily_life", "sdg"]) {
    if ((actualContext[key] ?? 0) !== (batch?.contextAllocation?.[key] ?? 0)) add(errors, "G5A_U08_ROLE_BINDING_INVALID", "batch.contextAllocation", "情境配置與題目不一致。", "production_gate");
  }

  const promptCounts = new Map();
  for (const question of questions) promptCounts.set(question.promptText, (promptCounts.get(question.promptText) ?? 0) + 1);
  const duplicateCount = [...promptCounts.values()].filter((count) => count > 1).length;
  if (duplicateCount > 0) {
    warnings.push(issue("G5A_U08_DUPLICATE_SURFACE_CONTEXT", "questions", `批次中有 ${duplicateCount} 組重複題面。`, "production_gate", "warning"));
  }

  const valid = errors.length === 0;
  return Object.freeze({
    valid,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    output: valid ? batch : null,
    acceptedQuestions: valid ? questions : Object.freeze([]),
  });
}

export { G5A_U08_BLOCKING_CODES, G5A_U08_WARNING_CODES };
