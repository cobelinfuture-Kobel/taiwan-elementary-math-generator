export const G3B_U01_WORD_PROBLEM_SOURCE_ID = "g3b_u01_3b01";

export const G3B_U01_WORD_PROBLEM_KPS = Object.freeze([
  Object.freeze({
    knowledgePointId: "kp_g3b_u01_wp_partitive_division",
    patternGroupId: "pg_g3b_u01_wp_partitive_division",
    displayName: "等分除：平分與單位量",
    patternSpecIds: Object.freeze([
      "ps_g3b_u01_wp_partitive_equal_sharing",
      "ps_g3b_u01_wp_partitive_unit_rate"
    ])
  }),
  Object.freeze({
    knowledgePointId: "kp_g3b_u01_wp_quotative_division",
    patternGroupId: "pg_g3b_u01_wp_quotative_division",
    displayName: "包含除：分裝與分組",
    patternSpecIds: Object.freeze([
      "ps_g3b_u01_wp_quotative_packaging_exact",
      "ps_g3b_u01_wp_quotative_grouping_exact"
    ])
  }),
  Object.freeze({
    knowledgePointId: "kp_g3b_u01_wp_division_with_remainder",
    patternGroupId: "pg_g3b_u01_wp_division_with_remainder",
    displayName: "有餘數除法應用題",
    patternSpecIds: Object.freeze([
      "ps_g3b_u01_wp_remainder_packaging_leftover",
      "ps_g3b_u01_wp_remainder_calendar_weeks_days"
    ])
  }),
  Object.freeze({
    knowledgePointId: "kp_g3b_u01_wp_remainder_interpretation",
    patternGroupId: "pg_g3b_u01_wp_remainder_interpretation",
    displayName: "餘數判讀：最多與最少",
    patternSpecIds: Object.freeze([
      "ps_g3b_u01_wp_remainder_floor_max_groups",
      "ps_g3b_u01_wp_remainder_ceil_min_containers"
    ])
  }),
  Object.freeze({
    knowledgePointId: "kp_g3b_u01_wp_two_step_division",
    patternGroupId: "pg_g3b_u01_wp_two_step_division",
    displayName: "兩步驟除法應用題",
    patternSpecIds: Object.freeze([
      "ps_g3b_u01_wp_two_step_divide_then_add",
      "ps_g3b_u01_wp_two_step_add_then_divide",
      "ps_g3b_u01_wp_two_step_divide_then_subtract",
      "ps_g3b_u01_wp_two_step_subtract_then_divide"
    ])
  })
]);

export const G3B_U01_WORD_PROBLEM_PATTERN_SPECS = Object.freeze([
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_partitive_equal_sharing", semanticModel: "partitive_division_equal_sharing", operationKind: "division", answerShape: "single_integer", templateTargetCount: 2 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_partitive_unit_rate", semanticModel: "partitive_division_unit_rate", operationKind: "division", answerShape: "single_integer", templateTargetCount: 2 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_quotative_packaging_exact", semanticModel: "quotative_division_packaging_exact", operationKind: "division", answerShape: "single_integer", templateTargetCount: 2 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_quotative_grouping_exact", semanticModel: "quotative_division_grouping_exact", operationKind: "division", answerShape: "single_integer", templateTargetCount: 2 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_remainder_packaging_leftover", semanticModel: "remainder_quotient_and_leftover", operationKind: "quotient_remainder", answerShape: "quotient_remainder", templateTargetCount: 2 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_remainder_calendar_weeks_days", semanticModel: "remainder_calendar_weeks_days", operationKind: "quotient_remainder", answerShape: "quotient_remainder", templateTargetCount: 2 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_remainder_floor_max_groups", semanticModel: "remainder_interpretation_floor", operationKind: "floor_division", answerShape: "single_integer", templateTargetCount: 2 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_remainder_ceil_min_containers", semanticModel: "remainder_interpretation_ceil", operationKind: "ceil_division", answerShape: "single_integer", templateTargetCount: 2 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_two_step_divide_then_add", semanticModel: "two_step_divide_then_add", operationKind: "divide_then_add", answerShape: "single_integer", templateTargetCount: 1 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_two_step_add_then_divide", semanticModel: "two_step_add_then_divide", operationKind: "add_then_divide", answerShape: "single_integer", templateTargetCount: 1 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_two_step_divide_then_subtract", semanticModel: "two_step_divide_then_subtract", operationKind: "divide_then_subtract", answerShape: "single_integer", templateTargetCount: 1 }),
  Object.freeze({ patternSpecId: "ps_g3b_u01_wp_two_step_subtract_then_divide", semanticModel: "two_step_subtract_then_divide", operationKind: "subtract_then_divide", answerShape: "single_integer", templateTargetCount: 1 })
]);

export const G3B_U01_WORD_PROBLEM_TEMPLATE_REQUIRED_FIELDS = Object.freeze([
  "templateId",
  "patternSpecId",
  "semanticModel",
  "operationModel",
  "answerModel",
  "unitModel",
  "slotModel",
  "promptTemplate"
]);

export const G3B_U01_WORD_PROBLEM_FIRST_PASS_TEMPLATE_TARGET = 20;

export function listG3BU01WordProblemKnowledgePoints() {
  return G3B_U01_WORD_PROBLEM_KPS.map((entry) => ({ ...entry, patternSpecIds: [...entry.patternSpecIds] }));
}

export function listG3BU01WordProblemPatternSpecs() {
  return G3B_U01_WORD_PROBLEM_PATTERN_SPECS.map((entry) => ({ ...entry }));
}

export function validateG3BU01WordProblemTemplateSpec(templateSpec = {}) {
  const errors = [];
  for (const field of G3B_U01_WORD_PROBLEM_TEMPLATE_REQUIRED_FIELDS) {
    if (!(field in templateSpec)) errors.push({ code: "g3b_u01_wp_template_field_missing", path: field, message: `${field} is required` });
  }
  const patternSpec = G3B_U01_WORD_PROBLEM_PATTERN_SPECS.find((entry) => entry.patternSpecId === templateSpec.patternSpecId);
  if (templateSpec.patternSpecId && !patternSpec) errors.push({ code: "g3b_u01_wp_template_pattern_unknown", path: "patternSpecId", message: "Unknown G3B-U01 word-problem PatternSpec" });
  if (patternSpec && templateSpec.semanticModel && patternSpec.semanticModel !== templateSpec.semanticModel) errors.push({ code: "g3b_u01_wp_template_semantic_mismatch", path: "semanticModel", message: "semanticModel must match PatternSpec contract" });
  if (templateSpec.answerModel && typeof templateSpec.answerModel !== "object") errors.push({ code: "g3b_u01_wp_template_answer_model_invalid", path: "answerModel", message: "answerModel must be an object" });
  if (templateSpec.unitModel && typeof templateSpec.unitModel !== "object") errors.push({ code: "g3b_u01_wp_template_unit_model_invalid", path: "unitModel", message: "unitModel must be an object" });
  if (templateSpec.slotModel && typeof templateSpec.slotModel !== "object") errors.push({ code: "g3b_u01_wp_template_slot_model_invalid", path: "slotModel", message: "slotModel must be an object" });
  if (templateSpec.promptTemplate && typeof templateSpec.promptTemplate !== "string") errors.push({ code: "g3b_u01_wp_template_prompt_invalid", path: "promptTemplate", message: "promptTemplate must be a string" });
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateG3BU01WordProblemRegistryContract() {
  const errors = [];
  const specIds = new Set(G3B_U01_WORD_PROBLEM_PATTERN_SPECS.map((entry) => entry.patternSpecId));
  for (const kp of G3B_U01_WORD_PROBLEM_KPS) {
    if (kp.patternSpecIds.length === 0) errors.push({ code: "g3b_u01_wp_kp_has_no_specs", path: kp.knowledgePointId });
    for (const specId of kp.patternSpecIds) {
      if (!specIds.has(specId)) errors.push({ code: "g3b_u01_wp_kp_spec_missing", path: `${kp.knowledgePointId}.${specId}` });
    }
  }
  const mappedSpecIds = new Set(G3B_U01_WORD_PROBLEM_KPS.flatMap((entry) => [...entry.patternSpecIds]));
  for (const specId of specIds) {
    if (!mappedSpecIds.has(specId)) errors.push({ code: "g3b_u01_wp_spec_unmapped", path: specId });
  }
  const templateTarget = G3B_U01_WORD_PROBLEM_PATTERN_SPECS.reduce((sum, entry) => sum + entry.templateTargetCount, 0);
  if (templateTarget !== G3B_U01_WORD_PROBLEM_FIRST_PASS_TEMPLATE_TARGET) errors.push({ code: "g3b_u01_wp_template_target_mismatch", path: "templateTargetCount" });
  return { ok: errors.length === 0, errors, warnings: [] };
}
