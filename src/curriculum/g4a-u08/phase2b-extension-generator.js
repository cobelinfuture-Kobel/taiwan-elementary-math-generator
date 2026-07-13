import { adaptG4AU08LegacyItem } from "./canonical-generated-item-adapter.js";
import { assertValidG4AU08CanonicalItem } from "./canonical-validator-contract.js";

const TEMPLATE_IDS = Object.freeze([
  "tpl_ext_comparison_chain",
  "tpl_ext_equal_value_unit_price",
  "tpl_ext_relative_difference",
  "tpl_ext_two_cost_component_payment"
]);

function makeRng(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function integer(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function choose(rng, values) {
  return values[integer(rng, 0, values.length - 1)];
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }
  return x;
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function comparisonChain(rng, seed) {
  const base = integer(rng, 120, 480);
  const more = integer(rng, 20, 90);
  const less = integer(rng, 10, more - 1);
  const middle = base + more;
  const answer = middle - less;
  return {
    templateFamilyId: "tpl_ext_comparison_chain",
    knowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    prompt: `甲班收集了${base}張卡片，乙班比甲班多${more}張，丙班比乙班少${less}張。丙班收集了幾張卡片？`,
    operands: [base, more, less],
    operations: ["+", "-"],
    intermediateValues: { middleAmount: middle },
    semanticRelations: ["more_than", "less_than"],
    expression: `${base} + ${more} - ${less}`,
    answerModel: { shape: "integer", value: answer, unit: "張" },
    context: { domain: "school_collection", entities: ["甲班", "乙班", "丙班"] },
    seed
  };
}

function equalValueUnitPrice(rng, seed) {
  const [knownQuantity, targetQuantity] = choose(rng, [
    [3, 2],
    [3, 4],
    [4, 2],
    [4, 5],
    [5, 2],
    [5, 4],
    [6, 4],
    [8, 5],
    [8, 10]
  ]);
  const commonFactor = integer(rng, 6, 20);
  const total = lcm(knownQuantity, targetQuantity) * commonFactor;
  const knownUnitPrice = total / knownQuantity;
  const targetUnitPrice = total / targetQuantity;
  return {
    templateFamilyId: "tpl_ext_equal_value_unit_price",
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    prompt: `每盒彩筆${knownUnitPrice}元，買${knownQuantity}盒的總價，和買${targetQuantity}本筆記本的總價相同。每本筆記本多少元？`,
    operands: [knownUnitPrice, knownQuantity, targetQuantity],
    operations: ["×", "÷"],
    intermediateValues: { equalTotalValue: total },
    semanticRelations: ["equal_total_value", "different_quantity"],
    expression: `${knownUnitPrice} × ${knownQuantity} ÷ ${targetQuantity}`,
    answerModel: { shape: "integer", value: targetUnitPrice, unit: "元" },
    context: { domain: "stationery_purchase" },
    seed
  };
}

function relativeDifference(rng, seed) {
  const baseUnitValue = integer(rng, 25, 80);
  const unitDifference = integer(rng, 5, 24);
  const comparedUnitValue = baseUnitValue + unitDifference;
  const quantity = integer(rng, 3, 12);
  const answer = unitDifference * quantity;
  return {
    templateFamilyId: "tpl_ext_relative_difference",
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    prompt: `甲種票每張${baseUnitValue}元，乙種票每張${comparedUnitValue}元。買${quantity}張乙種票比買同樣數量的甲種票多多少元？`,
    operands: [baseUnitValue, comparedUnitValue, quantity],
    operations: ["-", "×"],
    intermediateValues: { unitDifference },
    semanticRelations: ["same_direction", "difference_not_sum"],
    expression: `(${comparedUnitValue} - ${baseUnitValue}) × ${quantity}`,
    answerModel: { shape: "integer", value: answer, unit: "元" },
    context: { domain: "ticket_purchase" },
    seed
  };
}

function twoCostComponentPayment(rng, seed) {
  const unitCostA = integer(rng, 18, 45);
  const quantityA = integer(rng, 2, 6);
  const unitCostB = integer(rng, 25, 60);
  const quantityB = integer(rng, 2, 5);
  const componentCostA = unitCostA * quantityA;
  const componentCostB = unitCostB * quantityB;
  const totalCost = componentCostA + componentCostB;
  const paymentAmount = Math.ceil((totalCost + integer(rng, 20, 120)) / 100) * 100;
  const answer = paymentAmount - totalCost;
  return {
    templateFamilyId: "tpl_ext_two_cost_component_payment",
    knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub",
    prompt: `每本作業簿${unitCostA}元，買${quantityA}本；每盒彩筆${unitCostB}元，買${quantityB}盒。付${paymentAmount}元，應找回多少元？`,
    operands: [paymentAmount, unitCostA, quantityA, unitCostB, quantityB],
    operations: ["×", "×", "+", "-"],
    intermediateValues: { componentCostA, componentCostB, totalCost },
    semanticRelations: ["two_cost_components", "payment_covers_total"],
    expression: `${paymentAmount} - (${unitCostA} × ${quantityA} + ${unitCostB} × ${quantityB})`,
    answerModel: { shape: "integer", value: answer, unit: "元" },
    context: { domain: "stationery_payment" },
    seed
  };
}

const GENERATORS = Object.freeze({
  tpl_ext_comparison_chain: comparisonChain,
  tpl_ext_equal_value_unit_price: equalValueUnitPrice,
  tpl_ext_relative_difference: relativeDifference,
  tpl_ext_two_cost_component_payment: twoCostComponentPayment
});

export function getG4AU08Phase2BTemplateIds() {
  return TEMPLATE_IDS;
}

export function generateG4AU08Phase2BItem({ templateId, seed = 1 } = {}) {
  if (!TEMPLATE_IDS.includes(templateId)) throw new Error(`G4AU08_PHASE2B_TEMPLATE_UNMAPPED:${templateId}`);
  const legacy = GENERATORS[templateId](makeRng(seed), seed);
  const canonical = adaptG4AU08LegacyItem(legacy);
  assertValidG4AU08CanonicalItem(canonical);
  return canonical;
}

export function generateG4AU08Phase2BBatch({ count = 4, seed = 1 } = {}) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("G4AU08_PHASE2B_COUNT_INVALID");
  return Object.freeze(Array.from({ length: count }, (_, index) => generateG4AU08Phase2BItem({
    templateId: TEMPLATE_IDS[index % TEMPLATE_IDS.length],
    seed: seed + index
  })));
}
