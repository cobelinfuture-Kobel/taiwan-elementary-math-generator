import {
  G4B_U04_SOURCE_ID,
  getG4BU04HiddenPatternSpecById,
} from "./source-pattern-g4b-u04-extension.js";
import {
  G4B_U04_TARGET_UNITS,
  g4bU04RoundDown,
  g4bU04RoundHalfUp,
  g4bU04RoundUp,
} from "./g4b-u04-class-c-generator.js";

const MAX_BATCH_COUNT = 1000;
const MAX_INPUT = 99_999_999;
const MAX_ANSWER = 999_999_999;
const PAYMENT_DENOMINATIONS = Object.freeze([100, 1000]);
const DISCOUNT_DENOMINATION = 1000;
const CONTEXT_GROUP_SIZES = Object.freeze([10, 100, 1000]);
const METHODS = Object.freeze(["down", "up", "halfUp"]);

export const G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4b_u04_floor_complete_groups",
  "ps_g4b_u04_ceiling_minimum_required",
  "ps_g4b_u04_payment_amount_ceiling",
  "ps_g4b_u04_payment_banknote_count",
  "ps_g4b_u04_round_then_add",
  "ps_g4b_u04_round_then_subtract",
  "ps_g4b_u04_round_then_multiply",
  "ps_g4b_u04_round_then_divide",
  "ps_g4b_u04_discount_payment_amount_round_down",
  "ps_g4b_u04_discount_banknote_count_round_down",
]);

export const G4B_U04_S70_TEMPLATE_IDS = Object.freeze([
  "tpl_g4b_u04_floor_complete_pack",
  "tpl_g4b_u04_ceiling_pack_all",
  "tpl_g4b_u04_ceiling_saving_periods",
  "tpl_g4b_u04_payment_amount",
  "tpl_g4b_u04_payment_banknote_count",
  "tpl_g4b_u04_population_total",
  "tpl_g4b_u04_population_difference",
  "tpl_g4b_u04_recurring_cost_multiply",
  "tpl_g4b_u04_equal_share_divide",
  "tpl_g4b_u04_discount_amount_round_down",
  "tpl_g4b_u04_discount_banknote_count_round_down",
]);

export const G4B_U04_S70_CONTROLLED_TEMPLATES = Object.freeze({
  tpl_g4b_u04_floor_complete_pack: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_floor_complete_groups",
    requiredRoles: Object.freeze(["total", "itemUnit", "groupSize", "containerClassifier", "containerName"]),
    roleBindings: Object.freeze({
      total: "input.total",
      itemUnit: "context.itemUnit",
      groupSize: "input.groupSize",
      containerClassifier: "context.containerClassifier",
      containerName: "context.containerName",
    }),
    answerUnitRole: "containerClassifier",
  }),
  tpl_g4b_u04_ceiling_pack_all: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_ceiling_minimum_required",
    requiredRoles: Object.freeze(["total", "itemUnit", "capacity", "containerClassifier", "containerName"]),
    roleBindings: Object.freeze({
      total: "input.total",
      itemUnit: "context.itemUnit",
      capacity: "input.capacityOrIncrement",
      containerClassifier: "context.containerClassifier",
      containerName: "context.containerName",
    }),
    answerUnitRole: "containerClassifier",
  }),
  tpl_g4b_u04_ceiling_saving_periods: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_ceiling_minimum_required",
    requiredRoles: Object.freeze(["increment", "target"]),
    roleBindings: Object.freeze({ increment: "input.capacityOrIncrement", target: "input.total" }),
    answerUnitRole: "月",
  }),
  tpl_g4b_u04_payment_amount: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_payment_amount_ceiling",
    requiredRoles: Object.freeze(["price", "denomination"]),
    roleBindings: Object.freeze({ price: "input.price", denomination: "input.denomination" }),
    answerUnitRole: "元",
  }),
  tpl_g4b_u04_payment_banknote_count: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_payment_banknote_count",
    requiredRoles: Object.freeze(["price", "denomination"]),
    roleBindings: Object.freeze({ price: "input.price", denomination: "input.denomination" }),
    answerUnitRole: "張",
  }),
  tpl_g4b_u04_population_total: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_round_then_add",
    requiredRoles: Object.freeze(["operandA", "unitLabel", "methodALabel", "targetPlaceLabelA", "operandB", "methodBLabel", "targetPlaceLabelB"]),
    roleBindings: Object.freeze({
      operandA: "input.operandA",
      unitLabel: "context.unitLabel",
      methodALabel: "derived.methodLabel(input.methodA)",
      targetPlaceLabelA: "derived.targetPlaceLabel(input.targetUnitA)",
      operandB: "input.operandB",
      methodBLabel: "derived.methodLabel(input.methodB)",
      targetPlaceLabelB: "derived.targetPlaceLabel(input.targetUnitB)",
    }),
    answerUnitRole: "unitLabel",
  }),
  tpl_g4b_u04_population_difference: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_round_then_subtract",
    requiredRoles: Object.freeze(["operandA", "unitLabel", "methodALabel", "targetPlaceLabelA", "operandB", "methodBLabel", "targetPlaceLabelB"]),
    roleBindings: Object.freeze({
      operandA: "input.operandA",
      unitLabel: "context.unitLabel",
      methodALabel: "derived.methodLabel(input.methodA)",
      targetPlaceLabelA: "derived.targetPlaceLabel(input.targetUnitA)",
      operandB: "input.operandB",
      methodBLabel: "derived.methodLabel(input.methodB)",
      targetPlaceLabelB: "derived.targetPlaceLabel(input.targetUnitB)",
    }),
    answerUnitRole: "unitLabel",
  }),
  tpl_g4b_u04_recurring_cost_multiply: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_round_then_multiply",
    requiredRoles: Object.freeze(["value", "methodLabel", "targetPlaceLabel", "factor"]),
    roleBindings: Object.freeze({
      value: "input.value",
      methodLabel: "derived.methodLabel(input.method)",
      targetPlaceLabel: "derived.targetPlaceLabel(input.targetUnit)",
      factor: "input.factor",
    }),
    answerUnitRole: "元",
  }),
  tpl_g4b_u04_equal_share_divide: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_round_then_divide",
    requiredRoles: Object.freeze(["value", "methodLabel", "targetPlaceLabel", "divisor"]),
    roleBindings: Object.freeze({
      value: "input.value",
      methodLabel: "derived.methodLabel(input.method)",
      targetPlaceLabel: "derived.targetPlaceLabel(input.targetUnit)",
      divisor: "input.divisor",
    }),
    answerUnitRole: "元",
  }),
  tpl_g4b_u04_discount_amount_round_down: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_discount_payment_amount_round_down",
    requiredRoles: Object.freeze(["productName", "price", "denomination"]),
    roleBindings: Object.freeze({
      productName: "context.productName",
      price: "input.price",
      denomination: "input.denomination",
    }),
    answerUnitRole: "元",
  }),
  tpl_g4b_u04_discount_banknote_count_round_down: Object.freeze({
    mappingCandidateId: "fmc_g4b_u04_discount_banknote_count_round_down",
    requiredRoles: Object.freeze(["productName", "price", "denomination"]),
    roleBindings: Object.freeze({
      productName: "context.productName",
      price: "input.price",
      denomination: "input.denomination",
    }),
    answerUnitRole: "張",
  }),
});

const FLOOR_CONTEXTS = Object.freeze([
  Object.freeze({ itemUnit: "顆", containerClassifier: "盒", containerName: "橘子" }),
  Object.freeze({ itemUnit: "枝", containerClassifier: "捆", containerName: "鉛筆" }),
  Object.freeze({ itemUnit: "顆", containerClassifier: "袋", containerName: "球" }),
]);

const CEILING_CONTEXTS = Object.freeze([
  Object.freeze({ itemUnit: "顆", containerClassifier: "個", containerName: "紙箱" }),
  Object.freeze({ itemUnit: "本", containerClassifier: "個", containerName: "書箱" }),
  Object.freeze({ itemUnit: "頂", containerClassifier: "個", containerName: "收納袋" }),
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s70")) {
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
    throw new Error(`G4BU04_D_GEN_INVALID_RANGE:${min}:${max}`);
  }
  return min + (mix32(seed + Math.imul(offset + 1, 0x9e3779b1)) % (max - min + 1));
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

function formatNumber(value) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

export function g4bU04MethodLabel(method) {
  return ({ down: "無條件捨去法", up: "無條件進入法", halfUp: "四捨五入法" })[method] ?? null;
}

export function g4bU04TargetPlaceLabel(unit) {
  return ({ 10: "十位", 100: "百位", 1000: "千位", 10000: "萬位" })[unit] ?? null;
}

export function g4bU04DenominationLabel(denomination) {
  return ({ 100: "百元", 1000: "千元" })[denomination] ?? null;
}

export function g4bU04RoundByMethod(value, method, unit) {
  if (method === "down") return g4bU04RoundDown(value, unit);
  if (method === "up") return g4bU04RoundUp(value, unit);
  if (method === "halfUp") return g4bU04RoundHalfUp(value, unit);
  throw new Error(`G4BU04_D_GEN_METHOD_UNSUPPORTED:${method}`);
}

export function renderG4BU04ControlledTemplate(templateId, roles) {
  switch (templateId) {
    case "tpl_g4b_u04_floor_complete_pack":
      return `有 ${formatNumber(roles.total)}${roles.itemUnit}，每 ${formatNumber(roles.groupSize)}${roles.itemUnit} 裝成一${roles.containerClassifier}${roles.containerName}，最多可以裝成幾${roles.containerClassifier}完整的${roles.containerName}？`;
    case "tpl_g4b_u04_ceiling_pack_all":
      return `有 ${formatNumber(roles.total)}${roles.itemUnit}，每${roles.containerClassifier}${roles.containerName}最多裝 ${formatNumber(roles.capacity)}${roles.itemUnit}，全部裝完至少需要幾${roles.containerClassifier}${roles.containerName}？`;
    case "tpl_g4b_u04_ceiling_saving_periods":
      return `每月存 ${formatNumber(roles.increment)} 元，要存到至少 ${formatNumber(roles.target)} 元，至少需要幾個月？`;
    case "tpl_g4b_u04_payment_amount":
      return `商品售價 ${formatNumber(roles.price)} 元，只用 ${formatNumber(roles.denomination)} 元鈔票付款，至少要付多少元？`;
    case "tpl_g4b_u04_payment_banknote_count":
      return `商品售價 ${formatNumber(roles.price)} 元，只用 ${formatNumber(roles.denomination)} 元鈔票付款，至少需要幾張？`;
    case "tpl_g4b_u04_population_total":
      return `甲地有 ${formatNumber(roles.operandA)}${roles.unitLabel}，用${roles.methodALabel}取概數到${roles.targetPlaceLabelA}；乙地有 ${formatNumber(roles.operandB)}${roles.unitLabel}，用${roles.methodBLabel}取概數到${roles.targetPlaceLabelB}。兩地合計約有多少${roles.unitLabel}？`;
    case "tpl_g4b_u04_population_difference":
      return `甲地有 ${formatNumber(roles.operandA)}${roles.unitLabel}，用${roles.methodALabel}取概數到${roles.targetPlaceLabelA}；乙地有 ${formatNumber(roles.operandB)}${roles.unitLabel}，用${roles.methodBLabel}取概數到${roles.targetPlaceLabelB}。兩地相差約多少${roles.unitLabel}？`;
    case "tpl_g4b_u04_recurring_cost_multiply":
      return `每期費用是 ${formatNumber(roles.value)} 元，用${roles.methodLabel}取概數到${roles.targetPlaceLabel}後，估算 ${roles.factor} 期的總費用約是多少元？`;
    case "tpl_g4b_u04_equal_share_divide":
      return `總費用是 ${formatNumber(roles.value)} 元，用${roles.methodLabel}取概數到${roles.targetPlaceLabel}後，由 ${roles.divisor} 人平均分攤，每人約付多少元？`;
    case "tpl_g4b_u04_discount_amount_round_down":
      return `${roles.productName}定價 ${formatNumber(roles.price)} 元，特價只算整${g4bU04DenominationLabel(roles.denomination)}。買一台特價是多少元？`;
    case "tpl_g4b_u04_discount_banknote_count_round_down":
      return `${roles.productName}定價 ${formatNumber(roles.price)} 元，特價只算整${g4bU04DenominationLabel(roles.denomination)}。買一台要拿幾張${g4bU04DenominationLabel(roles.denomination)}鈔票？`;
    default:
      throw new Error(`G4BU04_D_GEN_TEMPLATE_UNSUPPORTED:${templateId}`);
  }
}

function sourceForRounded(roundedValue, method, unit, seed, offset) {
  const remainder = randomInt(seed, offset, 1, unit - 1);
  if (method === "down") return roundedValue + remainder;
  if (method === "up") return roundedValue - remainder;
  const half = unit / 2;
  return roundedValue + randomInt(seed, offset, -half, half - 1);
}

function semanticPayload(templateId, input, context, roles, derived, answer, answerText) {
  const template = G4B_U04_S70_CONTROLLED_TEMPLATES[templateId];
  return {
    promptText: renderG4BU04ControlledTemplate(templateId, roles),
    answerText,
    finalAnswer: answer.finalAnswer,
    structuredAnswer: answer.structuredAnswer,
    input: { ...input, templateFamilyId: templateId },
    context,
    templateRoles: roles,
    templateRoleBindings: template.roleBindings,
    semanticTemplateId: templateId,
    derived,
  };
}

function sampleFloorGroups(seed) {
  const groupSize = randomChoice(seed, 1, CONTEXT_GROUP_SIZES);
  const quotient = randomInt(seed, 2, 12, 800);
  const remainder = randomInt(seed, 3, 1, groupSize - 1);
  const total = quotient * groupSize + remainder;
  const context = randomChoice(seed, 4, FLOOR_CONTEXTS);
  return semanticPayload(
    "tpl_g4b_u04_floor_complete_pack",
    { total, groupSize },
    context,
    { total, groupSize, ...context },
    { quotient, remainder },
    { finalAnswer: quotient, structuredAnswer: { value: quotient, unitLabel: context.containerClassifier } },
    `${quotient}${context.containerClassifier}`,
  );
}

function sampleCeilingMinimum(seed) {
  const capacityOrIncrement = randomChoice(seed, 1, CONTEXT_GROUP_SIZES);
  const quotient = randomInt(seed, 2, 8, 700);
  const remainder = randomInt(seed, 3, 1, capacityOrIncrement - 1);
  const total = quotient * capacityOrIncrement + remainder;
  if (randomInt(seed, 4, 0, 1) === 1) {
    return semanticPayload(
      "tpl_g4b_u04_ceiling_saving_periods",
      { total, capacityOrIncrement },
      { unitLabel: "月", contextDomain: "saving" },
      { increment: capacityOrIncrement, target: total },
      { floorCount: quotient, remainder, minimumRequired: quotient + 1 },
      { finalAnswer: quotient + 1, structuredAnswer: { value: quotient + 1, unitLabel: "月" } },
      `${quotient + 1}個月`,
    );
  }
  const context = randomChoice(seed, 5, CEILING_CONTEXTS);
  return semanticPayload(
    "tpl_g4b_u04_ceiling_pack_all",
    { total, capacityOrIncrement },
    { ...context, contextDomain: "packing" },
    { total, capacity: capacityOrIncrement, ...context },
    { floorCount: quotient, remainder, minimumRequired: quotient + 1 },
    { finalAnswer: quotient + 1, structuredAnswer: { value: quotient + 1, unitLabel: context.containerClassifier } },
    `${quotient + 1}${context.containerClassifier}`,
  );
}

function samplePayment(seed, countOnly) {
  const denomination = randomChoice(seed, 1, PAYMENT_DENOMINATIONS);
  const baseCount = randomInt(seed, 2, 2, 90);
  const remainder = randomInt(seed, 3, 1, denomination - 1);
  const price = baseCount * denomination + remainder;
  const count = baseCount + 1;
  const amount = count * denomination;
  const templateId = countOnly ? "tpl_g4b_u04_payment_banknote_count" : "tpl_g4b_u04_payment_amount";
  const answer = countOnly
    ? { finalAnswer: count, structuredAnswer: { count, denomination, currency: "TWD", unitLabel: "張" } }
    : { finalAnswer: amount, structuredAnswer: { amount, currency: "TWD", unitLabel: "元" } };
  return semanticPayload(
    templateId,
    { price, denomination },
    { currency: "TWD", unitLabel: countOnly ? "張" : "元", contextDomain: "payment" },
    { price, denomination },
    { count, amount, remainder, oneFewerAmount: (count - 1) * denomination },
    answer,
    countOnly ? `${count}張` : `${amount}元`,
  );
}

function sampleDiscountRoundDown(seed, countOnly) {
  const denomination = DISCOUNT_DENOMINATION;
  const count = randomInt(seed, 1, 2, 90);
  const remainder = randomInt(seed, 2, 1, denomination - 1);
  const price = count * denomination + remainder;
  const amount = count * denomination;
  const productName = "除濕機";
  const templateId = countOnly
    ? "tpl_g4b_u04_discount_banknote_count_round_down"
    : "tpl_g4b_u04_discount_amount_round_down";
  const answer = countOnly
    ? { finalAnswer: count, structuredAnswer: { count, denomination, currency: "TWD", unitLabel: "張" } }
    : { finalAnswer: amount, structuredAnswer: { amount, currency: "TWD", unitLabel: "元" } };
  return semanticPayload(
    templateId,
    { price, denomination, discountPolicy: "whole_denomination_round_down" },
    { currency: "TWD", unitLabel: countOnly ? "張" : "元", contextDomain: "discount_price", productName },
    { productName, price, denomination },
    { discountedAmount: amount, count, remainder, savings: remainder, originalPrice: price },
    answer,
    countOnly ? `${count}張` : `${formatNumber(amount)}元`,
  );
}

function makeRoundedOperand(seed, offset) {
  const targetUnit = randomChoice(seed, offset, G4B_U04_TARGET_UNITS);
  const method = randomChoice(seed, offset + 1, METHODS);
  const maxMultiplier = Math.floor((MAX_INPUT - targetUnit) / targetUnit);
  const roundedValue = targetUnit * randomInt(seed, offset + 2, 20, Math.min(maxMultiplier, 1800));
  const value = sourceForRounded(roundedValue, method, targetUnit, seed, offset + 3);
  return { value, method, targetUnit, roundedValue };
}

function sampleRoundThenAddSubtract(seed, subtract) {
  const left = makeRoundedOperand(seed, 1);
  let right = makeRoundedOperand(seed, 10);
  if (subtract && left.roundedValue === right.roundedValue) {
    right = { ...right, roundedValue: right.roundedValue + right.targetUnit };
    right.value = sourceForRounded(right.roundedValue, right.method, right.targetUnit, seed, 15);
  }
  const input = {
    operandA: left.value,
    operandB: right.value,
    methodA: left.method,
    methodB: right.method,
    targetUnitA: left.targetUnit,
    targetUnitB: right.targetUnit,
  };
  const unitLabel = "人";
  const roles = {
    operandA: left.value,
    operandB: right.value,
    methodALabel: g4bU04MethodLabel(left.method),
    methodBLabel: g4bU04MethodLabel(right.method),
    targetPlaceLabelA: g4bU04TargetPlaceLabel(left.targetUnit),
    targetPlaceLabelB: g4bU04TargetPlaceLabel(right.targetUnit),
    unitLabel,
  };
  const result = subtract ? Math.abs(left.roundedValue - right.roundedValue) : left.roundedValue + right.roundedValue;
  const templateId = subtract ? "tpl_g4b_u04_population_difference" : "tpl_g4b_u04_population_total";
  return semanticPayload(
    templateId,
    input,
    { unitLabel, contextDomain: "population" },
    roles,
    { roundedA: left.roundedValue, roundedB: right.roundedValue, operation: subtract ? "subtract" : "add" },
    { finalAnswer: result, structuredAnswer: { value: result, unitLabel } },
    `${formatNumber(result)}${unitLabel}`,
  );
}

function sampleRoundThenMultiply(seed) {
  const factor = randomInt(seed, 1, 2, 9);
  const targetUnit = randomChoice(seed, 2, G4B_U04_TARGET_UNITS);
  const method = randomChoice(seed, 3, METHODS);
  const maxByAnswer = Math.floor(MAX_ANSWER / (targetUnit * factor));
  const maxByInput = Math.floor((MAX_INPUT - targetUnit) / targetUnit);
  const maxMultiplier = Math.min(maxByAnswer, maxByInput, 50_000);
  const roundedValue = targetUnit * randomInt(seed, 4, 20, maxMultiplier);
  const value = sourceForRounded(roundedValue, method, targetUnit, seed, 5);
  const result = roundedValue * factor;
  return semanticPayload(
    "tpl_g4b_u04_recurring_cost_multiply",
    { value, method, targetUnit, factor },
    { unitLabel: "元", contextDomain: "recurring_cost" },
    { value, methodLabel: g4bU04MethodLabel(method), targetPlaceLabel: g4bU04TargetPlaceLabel(targetUnit), factor },
    { roundedValue, operation: "multiply" },
    { finalAnswer: result, structuredAnswer: { value: result, unitLabel: "元" } },
    `${formatNumber(result)}元`,
  );
}

function sampleRoundThenDivide(seed) {
  const divisor = randomInt(seed, 1, 2, 9);
  const targetUnit = randomChoice(seed, 2, G4B_U04_TARGET_UNITS);
  const method = randomChoice(seed, 3, METHODS);
  const maxMultiplier = Math.min(1500, Math.floor((MAX_INPUT - targetUnit) / (targetUnit * divisor)));
  const multiplier = randomInt(seed, 4, 10, maxMultiplier);
  const roundedValue = targetUnit * divisor * multiplier;
  const value = sourceForRounded(roundedValue, method, targetUnit, seed, 5);
  const result = roundedValue / divisor;
  return semanticPayload(
    "tpl_g4b_u04_equal_share_divide",
    { value, method, targetUnit, divisor },
    { unitLabel: "元", contextDomain: "equal_share" },
    { value, methodLabel: g4bU04MethodLabel(method), targetPlaceLabel: g4bU04TargetPlaceLabel(targetUnit), divisor },
    { roundedValue, operation: "divide" },
    { finalAnswer: result, structuredAnswer: { value: result, unitLabel: "元" } },
    `${formatNumber(result)}元`,
  );
}

function sampleForPattern(patternSpecId, seed) {
  switch (patternSpecId) {
    case "ps_g4b_u04_floor_complete_groups": return sampleFloorGroups(seed);
    case "ps_g4b_u04_ceiling_minimum_required": return sampleCeilingMinimum(seed);
    case "ps_g4b_u04_payment_amount_ceiling": return samplePayment(seed, false);
    case "ps_g4b_u04_payment_banknote_count": return samplePayment(seed, true);
    case "ps_g4b_u04_round_then_add": return sampleRoundThenAddSubtract(seed, false);
    case "ps_g4b_u04_round_then_subtract": return sampleRoundThenAddSubtract(seed, true);
    case "ps_g4b_u04_round_then_multiply": return sampleRoundThenMultiply(seed);
    case "ps_g4b_u04_round_then_divide": return sampleRoundThenDivide(seed);
    case "ps_g4b_u04_discount_payment_amount_round_down": return sampleDiscountRoundDown(seed, false);
    case "ps_g4b_u04_discount_banknote_count_round_down": return sampleDiscountRoundDown(seed, true);
    default: throw new Error(`G4BU04_D_GEN_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  }
}

export function generateG4BU04ClassDQuestion({ patternSpecId, seed = "s70", sequence = 0 } = {}) {
  const spec = getG4BU04HiddenPatternSpecById(patternSpecId);
  if (!spec || spec.implementationClass !== "D" || !G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS.includes(patternSpecId)) {
    throw new Error(`G4BU04_D_GEN_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  }
  const seedLabel = `${seed}:${patternSpecId}:${sequence}`;
  const sample = sampleForPattern(patternSpecId, hashSeed(seedLabel));
  return deepFreeze({
    questionId: `g4b-u04-s70-${hashSeed(seedLabel).toString(16)}-${sequence}`,
    sourceId: G4B_U04_SOURCE_ID,
    unitCode: "4B-U04",
    unitTitle: "概數",
    kind: "g4bU04RoundingApproximation",
    representation: "controlled_semantic_application",
    applicationText: true,
    patternSpecId,
    formalMappingId: spec.formalMappingId,
    sourceMappingCandidateId: spec.sourceMappingCandidateId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: spec.mode,
    implementationClass: "D",
    depth: "S",
    answerModelShape: spec.answerModel.shape,
    promptText: sample.promptText,
    answerText: sample.answerText,
    finalAnswer: sample.finalAnswer,
    structuredAnswer: sample.structuredAnswer,
    input: sample.input,
    context: sample.context,
    templateRoles: sample.templateRoles,
    templateRoleBindings: sample.templateRoleBindings,
    semanticTemplateId: sample.semanticTemplateId,
    derived: sample.derived,
    sourceEvidence: spec.sourceEvidence,
    templateFamilyIds: [sample.semanticTemplateId],
    selectorStatus: "hidden",
    canonicalRouting: "disabled",
    generatorRouting: "hidden_class_d_only_not_canonical",
    productionUse: "forbidden",
    fallbackUsed: false,
    genericFallbackAllowed: false,
    seedLabel,
  });
}

export function generateG4BU04ClassDBatch({
  questionCount = G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS.length,
  patternSpecIds = G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS,
  seed = "s70-batch",
  ordering = "groupedByPattern",
} = {}) {
  if (!Number.isSafeInteger(questionCount) || questionCount < 1 || questionCount > MAX_BATCH_COUNT) {
    throw new Error(`G4BU04_D_GEN_QUESTION_COUNT_OUT_OF_RANGE:${questionCount}`);
  }
  const ids = [...new Set(patternSpecIds)];
  if (ids.length === 0 || ids.some((id) => !G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS.includes(id))) {
    throw new Error("G4BU04_D_GEN_PATTERN_SET_INVALID");
  }
  if (!new Set(["groupedByPattern", "shuffleAcrossPatterns"]).has(ordering)) {
    throw new Error(`G4BU04_D_GEN_ORDERING_INVALID:${ordering}`);
  }
  const allocations = Object.fromEntries(ids.map((id) => [id, 0]));
  for (let index = 0; index < questionCount; index += 1) allocations[ids[index % ids.length]] += 1;
  const questions = [];
  for (const patternSpecId of ids) {
    for (let sequence = 0; sequence < allocations[patternSpecId]; sequence += 1) {
      questions.push(generateG4BU04ClassDQuestion({ patternSpecId, seed, sequence }));
    }
  }
  const ordered = ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(questions, hashSeed(`${seed}:shuffle`))
    : questions;
  return deepFreeze({
    sourceId: G4B_U04_SOURCE_ID,
    task: "S70_G4B_U04_ClassDSemanticGeneratorAndBlockingValidator",
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
