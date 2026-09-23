export const G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID =
  "s76j_g4a_u08_phase2b_resolver_selector_worksheet";

export const G4A_U08_SOURCE_ID = "g4a_u08_4a08";
export const G4A_U08_UNIT_CODE = "4A-U08";

export const G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g4a_u08_app_add_sub_sequence",
  "kp_g4a_u08_app_mul_div_sequence",
  "kp_g4a_u08_app_mul_div_before_add_sub",
]);

export const G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS = Object.freeze([
  "pg_g4a_u08_ext_comparison_chain",
  "pg_g4a_u08_ext_equal_value_unit_price",
  "pg_g4a_u08_ext_relative_difference",
  "pg_g4a_u08_ext_two_cost_component_payment",
]);

export const G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u08_ext_comparison_chain",
  "ps_g4a_u08_ext_equal_value_unit_price",
  "ps_g4a_u08_ext_relative_difference",
  "ps_g4a_u08_ext_two_cost_component_payment",
]);

export const G4A_U08_PHASE2B_TEMPLATE_BY_PATTERN_SPEC_ID = Object.freeze({
  ps_g4a_u08_ext_comparison_chain: "tpl_ext_comparison_chain",
  ps_g4a_u08_ext_equal_value_unit_price: "tpl_ext_equal_value_unit_price",
  ps_g4a_u08_ext_relative_difference: "tpl_ext_relative_difference",
  ps_g4a_u08_ext_two_cost_component_payment: "tpl_ext_two_cost_component_payment",
});

export const G4A_U08_PHASE2B_PUBLIC_CONTROLS = Object.freeze({
  questionModes: Object.freeze(["mixed", "application"]),
  defaults: Object.freeze({ questionMode: "application" }),
  arbitraryPatternSpecInjection: false,
  genericFallback: false,
});

export const G4A_U08_PHASE2B_PROMOTION_LIFECYCLE = Object.freeze({
  task: "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
  promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  sourceId: G4A_U08_SOURCE_ID,
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_required",
  canonicalRouting: "enabled",
  worksheetStatus: "worksheet_eligible",
  rendererStatus: "existing_generic_renderer_only",
  productionUse: "preview_only_pending_s76k",
  requiredNextGate: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
});

const promotedKnowledgePoints = new Set(G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS);
const promotedPatternGroups = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);
const promotedPatternSpecs = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS);

export function isS76JPromotedG4AU08KnowledgePointId(value) {
  return promotedKnowledgePoints.has(value);
}

export function isS76JPromotedG4AU08PatternGroupId(value) {
  return promotedPatternGroups.has(value);
}

export function isS76JPromotedG4AU08PatternSpecId(value) {
  return promotedPatternSpecs.has(value);
}

export function validateG4AU08Phase2BPromotionProjection() {
  const errors = [];
  if (G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 3) errors.push("knowledge_point_count_mismatch");
  if (G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS.length !== 4) errors.push("pattern_group_count_mismatch");
  if (G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS.length !== 4) errors.push("pattern_spec_count_mismatch");
  if (new Set(G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS).size !== 3) errors.push("duplicate_knowledge_point_id");
  if (new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS).size !== 4) errors.push("duplicate_pattern_group_id");
  if (new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS).size !== 4) errors.push("duplicate_pattern_spec_id");
  if (Object.keys(G4A_U08_PHASE2B_TEMPLATE_BY_PATTERN_SPEC_ID).length !== 4) errors.push("template_map_count_mismatch");
  if (G4A_U08_PHASE2B_PROMOTION_LIFECYCLE.productionUse !== "preview_only_pending_s76k") errors.push("production_scope_mismatch");
  if (G4A_U08_PHASE2B_PROMOTION_LIFECYCLE.rendererStatus !== "existing_generic_renderer_only") errors.push("renderer_scope_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: 3, patternGroups: 4, patternSpecs: 4 }),
  });
}
