import {
  G4A_U08_PHASE2B_TEMPLATE_BY_PATTERN_SPEC_ID,
  G4A_U08_SOURCE_ID,
  G4A_U08_UNIT_CODE,
} from "../registry/g4a-u08-phase2b-promotion.js";

const CONTRACTS = Object.freeze({
  tpl_ext_comparison_chain: Object.freeze({
    knowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    patternGroupId: "pg_g4a_u08_ext_comparison_chain",
    patternSpecId: "ps_g4a_u08_ext_comparison_chain",
    reasoningRole: "two_link_more_less_relation_chain",
    knownQuantityRoles: ["baseAmount", "firstDifference", "secondDifference"],
    unknownQuantityRole: "finalComparedAmount",
    requiredOperationSequence: ["+", "-"],
    requiredIntermediateQuantities: ["middleAmount"],
    requiredSemanticRelations: ["more_than", "less_than"],
  }),
  tpl_ext_equal_value_unit_price: Object.freeze({
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    patternGroupId: "pg_g4a_u08_ext_equal_value_unit_price",
    patternSpecId: "ps_g4a_u08_ext_equal_value_unit_price",
    reasoningRole: "equal_total_value_find_unit_price",
    knownQuantityRoles: ["knownUnitPrice", "knownQuantity", "targetQuantity"],
    unknownQuantityRole: "targetUnitPrice",
    requiredOperationSequence: ["×", "÷"],
    requiredIntermediateQuantities: ["equalTotalValue"],
    requiredSemanticRelations: ["equal_total_value", "different_quantity"],
  }),
  tpl_ext_relative_difference: Object.freeze({
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    patternGroupId: "pg_g4a_u08_ext_relative_difference",
    patternSpecId: "ps_g4a_u08_ext_relative_difference",
    reasoningRole: "same_direction_relative_increment",
    knownQuantityRoles: ["baseUnitValue", "comparedUnitValue", "quantity"],
    unknownQuantityRole: "totalDifference",
    requiredOperationSequence: ["-", "×"],
    requiredIntermediateQuantities: ["unitDifference"],
    requiredSemanticRelations: ["same_direction", "difference_not_sum"],
  }),
  tpl_ext_two_cost_component_payment: Object.freeze({
    knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub",
    patternGroupId: "pg_g4a_u08_ext_two_cost_component_payment",
    patternSpecId: "ps_g4a_u08_ext_two_cost_component_payment",
    reasoningRole: "payment_minus_two_cost_components",
    knownQuantityRoles: ["paymentAmount", "unitCostA", "quantityA", "unitCostB", "quantityB"],
    unknownQuantityRole: "changeAmount",
    requiredOperationSequence: ["×", "×", "+", "-"],
    requiredIntermediateQuantities: ["componentCostA", "componentCostB", "totalCost"],
    requiredSemanticRelations: ["two_cost_components", "payment_covers_total"],
  }),
});

const TEMPLATE_IDS = Object.freeze(Object.keys(CONTRACTS));
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

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
  return {
    templateFamilyId: "tpl_ext_comparison_chain",
    knowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    prompt: `甲班收集了${base}張卡片，乙班比甲班多${more}張，丙班比乙班少${less}張。丙班收集了幾張卡片？`,
    operands: [base, more, less],
    operations: ["+", "-"],
    intermediateValues: { middleAmount: middle },
    semanticRelations: ["more_than", "less_than"],
    expression: `${base} + ${more} - ${less}`,
    answerModel: { shape: "integer", value: middle - less, unit: "張" },
    context: { domain: "school_collection", entities: ["甲班", "乙班", "丙班"] },
    seed,
  };
}

function equalValueUnitPrice(rng, seed) {
  const [knownQuantity, targetQuantity] = choose(rng, [
    [3, 2], [3, 4], [4, 2], [4, 5], [5, 2], [5, 4], [6, 4], [8, 5], [8, 10],
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
    seed,
  };
}

function relativeDifference(rng, seed) {
  const baseUnitValue = integer(rng, 25, 80);
  const unitDifference = integer(rng, 5, 24);
  const comparedUnitValue = baseUnitValue + unitDifference;
  const quantity = integer(rng, 3, 12);
  return {
    templateFamilyId: "tpl_ext_relative_difference",
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    prompt: `甲種票每張${baseUnitValue}元，乙種票每張${comparedUnitValue}元。買${quantity}張乙種票比買同樣數量的甲種票多多少元？`,
    operands: [baseUnitValue, comparedUnitValue, quantity],
    operations: ["-", "×"],
    intermediateValues: { unitDifference },
    semanticRelations: ["same_direction", "difference_not_sum"],
    expression: `(${comparedUnitValue} - ${baseUnitValue}) × ${quantity}`,
    answerModel: { shape: "integer", value: unitDifference * quantity, unit: "元" },
    context: { domain: "ticket_purchase" },
    seed,
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
  return {
    templateFamilyId: "tpl_ext_two_cost_component_payment",
    knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub",
    prompt: `每本作業簿${unitCostA}元，買${quantityA}本；每盒彩筆${unitCostB}元，買${quantityB}盒。付${paymentAmount}元，應找回多少元？`,
    operands: [paymentAmount, unitCostA, quantityA, unitCostB, quantityB],
    operations: ["×", "×", "+", "-"],
    intermediateValues: { componentCostA, componentCostB, totalCost },
    semanticRelations: ["two_cost_components", "payment_covers_total"],
    expression: `${paymentAmount} - (${unitCostA} × ${quantityA} + ${unitCostB} × ${quantityB})`,
    answerModel: { shape: "integer", value: paymentAmount - totalCost, unit: "元" },
    context: { domain: "stationery_payment" },
    seed,
  };
}

const GENERATORS = Object.freeze({
  tpl_ext_comparison_chain: comparisonChain,
  tpl_ext_equal_value_unit_price: equalValueUnitPrice,
  tpl_ext_relative_difference: relativeDifference,
  tpl_ext_two_cost_component_payment: twoCostComponentPayment,
});

function adapt(legacy) {
  const contract = CONTRACTS[legacy.templateFamilyId];
  if (!contract) throw new Error(`G4AU08_BROWSER_TEMPLATE_UNMAPPED:${legacy.templateFamilyId}`);
  return deepFreeze({
    schemaName: "G4AU08CanonicalGeneratedItem",
    schemaVersion: 1,
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: G4A_U08_UNIT_CODE,
    legacyTemplateId: legacy.templateFamilyId,
    legacyKnowledgePointId: legacy.knowledgePointId,
    knowledgePointId: contract.knowledgePointId,
    patternGroupId: contract.patternGroupId,
    patternSpecId: contract.patternSpecId,
    mode: "application",
    reasoningRole: contract.reasoningRole,
    prompt: legacy.prompt,
    operands: clone(legacy.operands),
    operations: clone(legacy.operations),
    knownQuantityRoles: clone(contract.knownQuantityRoles),
    unknownQuantityRole: contract.unknownQuantityRole,
    requiredOperationSequence: clone(contract.requiredOperationSequence),
    requiredIntermediateQuantities: clone(contract.requiredIntermediateQuantities),
    intermediateValues: clone(legacy.intermediateValues),
    unitFlow: null,
    semanticRelations: clone(legacy.semanticRelations),
    expression: legacy.expression,
    answerModel: clone(legacy.answerModel),
    context: clone(legacy.context),
    seed: legacy.seed,
    lifecycle: Object.freeze({
      adapterStatus: "implemented_hidden",
      validatorStatus: "implemented_hidden",
      selectorVisibility: "hidden",
      canonicalRouting: "disabled",
      productionUse: "forbidden",
    }),
  });
}

function sameArray(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

export function getG4AU08Phase2BBrowserTemplateIds() {
  return TEMPLATE_IDS;
}

export function validateG4AU08Phase2BBrowserItem(item) {
  const errors = [];
  const contract = CONTRACTS[item?.legacyTemplateId];
  if (!item || typeof item !== "object") errors.push("item_invalid");
  if (!contract) errors.push("template_unmapped");
  if (item?.sourceId !== G4A_U08_SOURCE_ID || item?.unitCode !== G4A_U08_UNIT_CODE) errors.push("source_mismatch");
  if (contract) {
    if (item.knowledgePointId !== contract.knowledgePointId) errors.push("knowledge_point_mismatch");
    if (item.patternGroupId !== contract.patternGroupId) errors.push("pattern_group_mismatch");
    if (item.patternSpecId !== contract.patternSpecId) errors.push("pattern_spec_mismatch");
    if (!sameArray(item.requiredOperationSequence, contract.requiredOperationSequence)) errors.push("operation_sequence_mismatch");
    if (!sameArray(item.semanticRelations, contract.requiredSemanticRelations)) errors.push("semantic_relation_mismatch");
  }
  if (!Number.isInteger(item?.answerModel?.value)) errors.push("answer_not_integer");
  if (item?.lifecycle?.canonicalRouting !== "disabled" || item?.lifecycle?.productionUse !== "forbidden") errors.push("hidden_lifecycle_mismatch");
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function generateG4AU08Phase2BBrowserItem({ templateId, seed = 1 } = {}) {
  if (!TEMPLATE_IDS.includes(templateId)) throw new Error(`G4AU08_BROWSER_TEMPLATE_UNMAPPED:${templateId}`);
  const item = adapt(GENERATORS[templateId](makeRng(seed), seed));
  const validation = validateG4AU08Phase2BBrowserItem(item);
  if (!validation.valid) throw new Error(`G4AU08_BROWSER_VALIDATION_FAILED:${validation.errors.join(",")}`);
  return item;
}

export function resolveG4AU08Phase2BTemplateId(patternSpecId) {
  return G4A_U08_PHASE2B_TEMPLATE_BY_PATTERN_SPEC_ID[patternSpecId] ?? null;
}
