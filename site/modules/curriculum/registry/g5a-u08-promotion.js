import {
  G5A_U08_HIDDEN_PATTERN_GROUPS,
  G5A_U08_HIDDEN_PATTERN_SPECS,
} from "../batch-a/source-pattern-g5a-u08-extension.js";

export const G5A_U08_PROMOTION_REGISTRY_ID = "s60i_g5a_u08_integer_four_operations_promotion";
export const G5A_U08_SOURCE_ID = "g5a_u08_5a08";

export const G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g5a_u08_mixed_operation_order",
  "kp_g5a_u08_add_sub_equivalent_regroup",
  "kp_g5a_u08_mul_div_equivalent_regroup",
  "kp_g5a_u08_distributive_expand",
  "kp_g5a_u08_common_factor_extract",
  "kp_g5a_u08_near_round_add_compensation",
  "kp_g5a_u08_near_round_sub_compensation",
  "kp_g5a_u08_near_round_multiply_compensation",
  "kp_g5a_u08_missing_operator_inference",
  "kp_g5a_u08_equivalence_error_judgement",
  "kp_g5a_u08_average_inverse_update",
]);

export const G5A_U08_PROMOTED_PATTERN_GROUP_IDS = Object.freeze(
  G5A_U08_HIDDEN_PATTERN_GROUPS.map((row) => row.patternGroupId),
);

export const G5A_U08_PROMOTED_PATTERN_SPEC_IDS = Object.freeze(
  G5A_U08_HIDDEN_PATTERN_SPECS.map((row) => row.patternSpecId),
);

export const G5A_U08_PUBLIC_CONTROLS = Object.freeze({
  questionModes: Object.freeze(["mixed", "numeric", "application", "reasoning"]),
  depthModes: Object.freeze(["mixed", "N", "N_PLUS_1"]),
  contextModes: Object.freeze(["mixed", "daily_life", "sdg"]),
  defaults: Object.freeze({
    questionMode: "mixed",
    depthMode: "mixed",
    contextMode: "mixed",
  }),
  publicNPlus2: false,
  publicFormalEquation: false,
});

export const G5A_U08_PROMOTION_LIFECYCLE = Object.freeze({
  task: "S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration",
  promotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
  sourceId: G5A_U08_SOURCE_ID,
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_accepted",
  worksheetStatus: "not_eligible",
  productionUse: "forbidden",
  activationStatus: "selector_resolver_and_canonical_runtime_integrated_worksheet_pending",
  requiredNextGate: "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
});

const promotedKnowledgePointIds = new Set(G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS);
const promotedPatternGroupIds = new Set(G5A_U08_PROMOTED_PATTERN_GROUP_IDS);
const promotedPatternSpecIds = new Set(G5A_U08_PROMOTED_PATTERN_SPEC_IDS);

export function isS60IPromotedG5AU08KnowledgePointId(value) {
  return promotedKnowledgePointIds.has(value);
}

export function isS60IPromotedG5AU08PatternGroupId(value) {
  return promotedPatternGroupIds.has(value);
}

export function isS60IPromotedG5AU08PatternSpecId(value) {
  return promotedPatternSpecIds.has(value);
}

export function validateG5AU08PromotionProjection() {
  const errors = [];
  if (G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 11) errors.push("knowledge_point_count_mismatch");
  if (G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length !== 17) errors.push("pattern_group_count_mismatch");
  if (G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length !== 30) errors.push("pattern_spec_count_mismatch");
  if (new Set(G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS).size !== 11) errors.push("duplicate_knowledge_point_id");
  if (new Set(G5A_U08_PROMOTED_PATTERN_GROUP_IDS).size !== 17) errors.push("duplicate_pattern_group_id");
  if (new Set(G5A_U08_PROMOTED_PATTERN_SPEC_IDS).size !== 30) errors.push("duplicate_pattern_spec_id");
  if (G5A_U08_HIDDEN_PATTERN_GROUPS.some((row) => row.visibilityStatus !== "hidden")) errors.push("hidden_group_authority_mutated");
  if (G5A_U08_HIDDEN_PATTERN_SPECS.some((row) => row.selectorStatus !== "hidden" || row.productionUse !== "forbidden")) {
    errors.push("hidden_pattern_authority_mutated");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: 11,
      patternGroups: G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length,
    }),
  });
}
