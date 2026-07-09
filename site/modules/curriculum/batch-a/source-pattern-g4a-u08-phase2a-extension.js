import {
  G4A_U08_SOURCE_ID,
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-g4a-u08-extension.js";

export { G4A_U08_SOURCE_ID };

export const G4A_U08_PHASE2A_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u08_app_add_three_quantities",
  "ps_g4a_u08_app_add_then_subtract_state_change",
  "ps_g4a_u08_app_subtract_then_add_state_change",
  "ps_g4a_u08_app_subtract_twice_state_change",
  "ps_g4a_u08_app_adjusted_amount_then_subtract",
  "ps_g4a_u08_app_divide_by_group_product",
  "ps_g4a_u08_app_multiply_after_difference_then_add_sub",
  "ps_g4a_u08_app_multiply_then_share",
  "ps_g4a_u08_app_unit_rate_then_scale",
  "ps_g4a_u08_app_divide_then_divide",
  "ps_g4a_u08_app_payment_minus_unit_cost_times_quantity",
  "ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount"
]);

function phase2ADefinition({ patternSpecId, knowledgePointId, title, storyTemplateId, equationModelShape, allowedUnitDomains, operationOrderTags }) {
  return Object.freeze({
    patternSpecId,
    sourceId: G4A_U08_SOURCE_ID,
    phase: "Phase2A",
    title,
    kind: "g4aU08ApplicationWordProblem",
    knowledgePointId,
    storyTemplateId,
    equationModelShape,
    allowedUnitDomains: Object.freeze([...allowedUnitDomains]),
    operationOrderTags: Object.freeze([...operationOrderTags]),
    answerModel: Object.freeze({ shape: "equation_plus_answer", fields: Object.freeze(["equationModel", "finalAnswerWithUnit"]) }),
    canonicalSkillIds: Object.freeze(["integer_order_of_operations_application"]),
    skillTags: Object.freeze(["order_of_operations", "application_word_problem", ...operationOrderTags]),
    difficultyTags: Object.freeze(["batch_a_browser_bridge", "g4a_u08_phase2a_application"])
  });
}

const definitions = Object.freeze({
  ps_g4a_u08_app_add_three_quantities: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_add_three_quantities",
    knowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    title: "應用題：連續加法",
    storyTemplateId: "tpl_app_add_three_quantities",
    equationModelShape: "a + b + c",
    allowedUnitDomains: ["count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["add_sub_left_to_right", "additive_aggregation"]
  }),
  ps_g4a_u08_app_add_then_subtract_state_change: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_add_then_subtract_state_change",
    knowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    title: "應用題：先加再減",
    storyTemplateId: "tpl_app_add_then_subtract_state_change",
    equationModelShape: "a + b - c",
    allowedUnitDomains: ["count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["add_sub_left_to_right", "state_change"]
  }),
  ps_g4a_u08_app_subtract_then_add_state_change: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_subtract_then_add_state_change",
    knowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    title: "應用題：先減再加",
    storyTemplateId: "tpl_app_subtract_then_add_state_change",
    equationModelShape: "a - b + c",
    allowedUnitDomains: ["count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["add_sub_left_to_right", "state_change"]
  }),
  ps_g4a_u08_app_subtract_twice_state_change: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_subtract_twice_state_change",
    knowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    title: "應用題：連續減法",
    storyTemplateId: "tpl_app_subtract_twice_state_change",
    equationModelShape: "a - b - c",
    allowedUnitDomains: ["count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["add_sub_left_to_right", "state_change"]
  }),
  ps_g4a_u08_app_adjusted_amount_then_subtract: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_adjusted_amount_then_subtract",
    knowledgePointId: "kp_g4a_u08_app_parentheses_grouping",
    title: "應用題：括號調整量",
    storyTemplateId: "tpl_app_adjusted_amount_then_subtract",
    equationModelShape: "outer - (base - decrease)",
    allowedUnitDomains: ["money", "capacity", "weight", "length"],
    operationOrderTags: ["parentheses_first", "adjusted_amount"]
  }),
  ps_g4a_u08_app_divide_by_group_product: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_divide_by_group_product",
    knowledgePointId: "kp_g4a_u08_app_parentheses_grouping",
    title: "應用題：括號內乘除",
    storyTemplateId: "tpl_app_divide_by_group_product",
    equationModelShape: "total ÷ (groups × perGroup)",
    allowedUnitDomains: ["count_items", "capacity", "weight"],
    operationOrderTags: ["parentheses_first", "mul_div_left_to_right"]
  }),
  ps_g4a_u08_app_multiply_after_difference_then_add_sub: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_multiply_after_difference_then_add_sub",
    knowledgePointId: "kp_g4a_u08_app_parentheses_grouping",
    title: "應用題：括號混合乘除加減",
    storyTemplateId: "tpl_app_multiply_after_difference_then_add_sub",
    equationModelShape: "unit × (planned - cancelled) + extra",
    allowedUnitDomains: ["count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["parentheses_first", "mul_div_before_add_sub"]
  }),
  ps_g4a_u08_app_multiply_then_share: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_multiply_then_share",
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    title: "應用題：先乘再除",
    storyTemplateId: "tpl_app_multiply_then_share",
    equationModelShape: "boxes × perBox ÷ groups",
    allowedUnitDomains: ["count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["mul_div_left_to_right"]
  }),
  ps_g4a_u08_app_unit_rate_then_scale: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_unit_rate_then_scale",
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    title: "應用題：先除再乘",
    storyTemplateId: "tpl_app_unit_rate_then_scale",
    equationModelShape: "total ÷ knownUnits × targetUnits",
    allowedUnitDomains: ["money", "count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["mul_div_left_to_right", "unit_rate"]
  }),
  ps_g4a_u08_app_divide_then_divide: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_divide_then_divide",
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    title: "應用題：連續除法",
    storyTemplateId: "tpl_app_divide_then_divide",
    equationModelShape: "total ÷ groups ÷ peoplePerGroup",
    allowedUnitDomains: ["count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["mul_div_left_to_right"]
  }),
  ps_g4a_u08_app_payment_minus_unit_cost_times_quantity: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_payment_minus_unit_cost_times_quantity",
    knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub",
    title: "應用題：乘法成本後找零",
    storyTemplateId: "tpl_app_payment_minus_unit_cost_times_quantity",
    equationModelShape: "payment - unitPrice × quantity",
    allowedUnitDomains: ["money"],
    operationOrderTags: ["mul_div_before_add_sub", "payment_change"]
  }),
  ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount: phase2ADefinition({
    patternSpecId: "ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount",
    knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub",
    title: "應用題：單純先除再加減",
    storyTemplateId: "tpl_app_subtract_divided_amount_or_add_divided_amount",
    equationModelShape: "payment - total ÷ groups",
    allowedUnitDomains: ["money", "count_items", "capacity", "weight", "length", "time"],
    operationOrderTags: ["mul_div_before_add_sub"]
  })
});

export function isG4AU08Phase2APatternSpecId(patternSpecId) {
  return G4A_U08_PHASE2A_PATTERN_SPEC_IDS.includes(patternSpecId);
}

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return definitions[patternSpecId] ?? baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const baseIds = baseGetPatternIds(sourceId);
  if (sourceId === G4A_U08_SOURCE_ID) return [...baseIds, ...G4A_U08_PHASE2A_PATTERN_SPEC_IDS];
  return baseIds;
}
