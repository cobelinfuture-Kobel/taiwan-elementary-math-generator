const SOURCE_ID = "g4a_u08_4a08";
const UNIT_CODE = "4A-U08";

const EXISTING_CONTRACTS = Object.freeze({
  tpl_app_add_three_quantities: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_add_sub_sequence", patternGroupId: "pg_g4a_u08_app_add_add", patternSpecId: "ps_g4a_u08_app_add_three_quantities", reasoningRole: "combine_three_same_unit_quantities", knownQuantityRoles: ["quantityA", "quantityB", "quantityC"], unknownQuantityRole: "combinedTotal", requiredOperationSequence: ["+", "+"], requiredIntermediateQuantities: ["partialSum"] }),
  tpl_app_add_then_subtract_state_change: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_add_sub_sequence", patternGroupId: "pg_g4a_u08_app_add_subtract", patternSpecId: "ps_g4a_u08_app_add_then_subtract_state_change", reasoningRole: "increase_then_decrease", knownQuantityRoles: ["initialAmount", "increaseAmount", "decreaseAmount"], unknownQuantityRole: "finalAmount", requiredOperationSequence: ["+", "-"], requiredIntermediateQuantities: ["amountAfterIncrease"] }),
  tpl_app_subtract_then_add_state_change: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_add_sub_sequence", patternGroupId: "pg_g4a_u08_app_subtract_add", patternSpecId: "ps_g4a_u08_app_subtract_then_add_state_change", reasoningRole: "decrease_then_increase", knownQuantityRoles: ["initialAmount", "decreaseAmount", "increaseAmount"], unknownQuantityRole: "finalAmount", requiredOperationSequence: ["-", "+"], requiredIntermediateQuantities: ["amountAfterDecrease"] }),
  tpl_app_subtract_twice_state_change: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_add_sub_sequence", patternGroupId: "pg_g4a_u08_app_subtract_subtract", patternSpecId: "ps_g4a_u08_app_subtract_twice_state_change", reasoningRole: "decrease_then_decrease", knownQuantityRoles: ["initialAmount", "firstDecrease", "secondDecrease"], unknownQuantityRole: "finalAmount", requiredOperationSequence: ["-", "-"], requiredIntermediateQuantities: ["amountAfterFirstDecrease"] }),
  tpl_app_adjusted_amount_then_subtract: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_parentheses_grouping", patternGroupId: "pg_g4a_u08_app_adjusted_amount_then_subtract", patternSpecId: "ps_g4a_u08_app_adjusted_amount_then_subtract", reasoningRole: "adjust_inner_amount_then_subtract", knownQuantityRoles: ["baseAmount", "adjustmentAmount", "paymentOrCapacity"], unknownQuantityRole: "remainingAmount", requiredOperationSequence: ["inner_adjustment", "-"], requiredIntermediateQuantities: ["adjustedAmount"] }),
  tpl_app_divide_by_group_product: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_parentheses_grouping", patternGroupId: "pg_g4a_u08_app_divide_by_group_product", patternSpecId: "ps_g4a_u08_app_divide_by_group_product", reasoningRole: "divide_by_group_product", knownQuantityRoles: ["totalAmount", "groupCount", "unitsPerGroup"], unknownQuantityRole: "amountPerUnit", requiredOperationSequence: ["×", "÷"], requiredIntermediateQuantities: ["totalUnitCount"] }),
  tpl_app_multiply_after_difference_then_add_sub: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_parentheses_grouping", patternGroupId: "pg_g4a_u08_app_difference_then_scale_overlay", patternSpecId: "ps_g4a_u08_app_multiply_after_difference_then_add_sub", reasoningRole: "multiply_adjusted_unit_then_overlay", knownQuantityRoles: ["baseUnitAmount", "differenceAmount", "quantity", "overlayAmount"], unknownQuantityRole: "finalAmount", requiredOperationSequence: ["-", "×", "overlay"], requiredIntermediateQuantities: ["adjustedUnitAmount", "scaledAmount"] }),
  tpl_app_multiply_then_share: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_mul_div_sequence", patternGroupId: "pg_g4a_u08_app_multiply_then_share", patternSpecId: "ps_g4a_u08_app_multiply_then_share", reasoningRole: "find_total_then_equal_share", knownQuantityRoles: ["groups", "amountPerGroup", "recipientCount"], unknownQuantityRole: "amountPerRecipient", requiredOperationSequence: ["×", "÷"], requiredIntermediateQuantities: ["totalAmount"] }),
  tpl_app_unit_rate_then_scale: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_mul_div_sequence", patternGroupId: "pg_g4a_u08_app_unit_rate_then_scale", patternSpecId: "ps_g4a_u08_app_unit_rate_then_scale", reasoningRole: "find_unit_rate_then_scale", knownQuantityRoles: ["knownTotal", "knownQuantity", "targetQuantity"], unknownQuantityRole: "targetTotal", requiredOperationSequence: ["÷", "×"], requiredIntermediateQuantities: ["unitRate"] }),
  tpl_app_divide_then_divide: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_mul_div_sequence", patternGroupId: "pg_g4a_u08_app_divide_then_divide", patternSpecId: "ps_g4a_u08_app_divide_then_divide", reasoningRole: "successive_equal_partition", knownQuantityRoles: ["totalAmount", "firstPartitionCount", "secondPartitionCount"], unknownQuantityRole: "amountPerFinalGroup", requiredOperationSequence: ["÷", "÷"], requiredIntermediateQuantities: ["amountAfterFirstPartition"] }),
  tpl_app_payment_minus_unit_cost_times_quantity: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub", patternGroupId: "pg_g4a_u08_app_payment_minus_unit_cost_times_quantity", patternSpecId: "ps_g4a_u08_app_payment_minus_unit_cost_times_quantity", reasoningRole: "payment_minus_single_cost_component", knownQuantityRoles: ["paymentAmount", "unitCost", "quantity"], unknownQuantityRole: "changeAmount", requiredOperationSequence: ["×", "-"], requiredIntermediateQuantities: ["totalCost"] }),
  tpl_app_subtract_divided_amount_or_add_divided_amount: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub", patternGroupId: "pg_g4a_u08_app_subtract_or_add_divided_amount", patternSpecId: "ps_g4a_u08_app_subtract_or_add_divided_amount", reasoningRole: "base_amount_plus_or_minus_equal_share_overlay", knownQuantityRoles: ["baseAmount", "sharedTotal", "shareCount"], unknownQuantityRole: "adjustedAmount", requiredOperationSequence: ["÷", "overlay"], requiredIntermediateQuantities: ["sharedAmount"] })
});

const EXTENSION_CONTRACTS = Object.freeze({
  tpl_ext_comparison_chain: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_add_sub_sequence", patternGroupId: "pg_g4a_u08_ext_comparison_chain", patternSpecId: "ps_g4a_u08_ext_comparison_chain", reasoningRole: "two_link_more_less_relation_chain", knownQuantityRoles: ["baseAmount", "firstDifference", "secondDifference"], unknownQuantityRole: "finalComparedAmount", requiredOperationSequence: ["+", "-"], requiredIntermediateQuantities: ["middleAmount"], requiredSemanticRelations: ["more_than", "less_than"] }),
  tpl_ext_equal_value_unit_price: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_mul_div_sequence", patternGroupId: "pg_g4a_u08_ext_equal_value_unit_price", patternSpecId: "ps_g4a_u08_ext_equal_value_unit_price", reasoningRole: "equal_total_value_find_unit_price", knownQuantityRoles: ["knownUnitPrice", "knownQuantity", "targetQuantity"], unknownQuantityRole: "targetUnitPrice", requiredOperationSequence: ["×", "÷"], requiredIntermediateQuantities: ["equalTotalValue"], requiredSemanticRelations: ["equal_total_value", "different_quantity"] }),
  tpl_ext_relative_difference: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_mul_div_sequence", patternGroupId: "pg_g4a_u08_ext_relative_difference", patternSpecId: "ps_g4a_u08_ext_relative_difference", reasoningRole: "same_direction_relative_increment", knownQuantityRoles: ["baseUnitValue", "comparedUnitValue", "quantity"], unknownQuantityRole: "totalDifference", requiredOperationSequence: ["-", "×"], requiredIntermediateQuantities: ["unitDifference"], requiredSemanticRelations: ["same_direction", "difference_not_sum"] }),
  tpl_ext_two_cost_component_payment: Object.freeze({ knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub", patternGroupId: "pg_g4a_u08_ext_two_cost_component_payment", patternSpecId: "ps_g4a_u08_ext_two_cost_component_payment", reasoningRole: "payment_minus_two_cost_components", knownQuantityRoles: ["paymentAmount", "unitCostA", "quantityA", "unitCostB", "quantityB"], unknownQuantityRole: "changeAmount", requiredOperationSequence: ["×", "×", "+", "-"], requiredIntermediateQuantities: ["componentCostA", "componentCostB", "totalCost"], requiredSemanticRelations: ["two_cost_components", "payment_covers_total"] })
});

const ALL_CONTRACTS = Object.freeze({ ...EXISTING_CONTRACTS, ...EXTENSION_CONTRACTS });

function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); return value; }
function requireObject(value, code) { if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(code); }

export function getG4AU08AdapterContracts() { return EXISTING_CONTRACTS; }
export function getG4AU08ExtensionAdapterContracts() { return EXTENSION_CONTRACTS; }
export function getG4AU08AllAdapterContracts() { return ALL_CONTRACTS; }

export function adaptG4AU08LegacyItem(legacyItem) {
  requireObject(legacyItem, "G4AU08_ADAPTER_ITEM_INVALID");
  const legacyTemplateId = legacyItem.templateFamilyId ?? legacyItem.templateId;
  if (typeof legacyTemplateId !== "string" || !legacyTemplateId) throw new Error("G4AU08_ADAPTER_TEMPLATE_ID_MISSING");
  const contract = ALL_CONTRACTS[legacyTemplateId];
  if (!contract) throw new Error(`G4AU08_ADAPTER_TEMPLATE_UNMAPPED:${legacyTemplateId}`);
  const prompt = legacyItem.prompt ?? legacyItem.question ?? legacyItem.text;
  if (typeof prompt !== "string" || !prompt.trim()) throw new Error("G4AU08_ADAPTER_PROMPT_MISSING");
  if (legacyItem.answer === undefined && legacyItem.answerModel === undefined) throw new Error("G4AU08_ADAPTER_ANSWER_MISSING");
  const canonical = {
    schemaName: "G4AU08CanonicalGeneratedItem", schemaVersion: 1, sourceId: SOURCE_ID, unitCode: UNIT_CODE,
    legacyTemplateId, legacyKnowledgePointId: legacyItem.knowledgePointId ?? null,
    knowledgePointId: contract.knowledgePointId, patternGroupId: contract.patternGroupId, patternSpecId: contract.patternSpecId,
    mode: "application", reasoningRole: contract.reasoningRole, prompt,
    operands: clone(legacyItem.operands ?? legacyItem.values ?? legacyItem.data?.operands ?? []),
    operations: clone(legacyItem.operations ?? legacyItem.data?.operations ?? contract.requiredOperationSequence),
    knownQuantityRoles: clone(contract.knownQuantityRoles), unknownQuantityRole: contract.unknownQuantityRole,
    requiredOperationSequence: clone(contract.requiredOperationSequence), requiredIntermediateQuantities: clone(contract.requiredIntermediateQuantities),
    intermediateValues: clone(legacyItem.intermediateValues ?? legacyItem.data?.intermediateValues ?? {}),
    unitFlow: clone(legacyItem.unitFlow ?? legacyItem.data?.unitFlow ?? null),
    semanticRelations: clone(legacyItem.semanticRelations ?? legacyItem.data?.semanticRelations ?? contract.requiredSemanticRelations ?? []),
    expression: legacyItem.expression ?? legacyItem.equation ?? null,
    answerModel: clone(legacyItem.answerModel ?? { value: legacyItem.answer }),
    context: clone(legacyItem.context ?? legacyItem.scenario ?? legacyItem.data?.context ?? null), seed: legacyItem.seed ?? null,
    lifecycle: Object.freeze({ adapterStatus: "implemented_hidden", validatorStatus: "implemented_hidden", selectorVisibility: "hidden", canonicalRouting: "disabled", productionUse: "forbidden" })
  };
  return deepFreeze(canonical);
}
