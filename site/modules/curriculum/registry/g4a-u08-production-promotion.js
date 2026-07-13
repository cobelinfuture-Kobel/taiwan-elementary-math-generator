import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
  G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  G4A_U08_SOURCE_ID,
} from "./g4a-u08-phase2b-promotion.js";
import { G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID } from "./g4a-u08-worksheet-promotion.js";

export const G4A_U08_PRODUCTION_PROMOTION_OVERLAY_ID =
  "s76k_g4a_u08_full_source_production_promotion";

export const G4A_U08_PRODUCTION_LIFECYCLE = Object.freeze({
  task: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
  status: "production_stress_and_semantic_qa_integrated_pending_ci",
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_accepted",
  worksheetStatus: "worksheet_eligible",
  rendererStatus: "existing_generic_renderer_stress_candidate",
  htmlPdfStatus: "production_smoke_required",
  productionUse: "allowed_after_s76k_ci",
  distance: "D1_G4A_U08_PRODUCTION_STRESS_PENDING_D0_CLOSEOUT",
  requiredNextGate: "S76L_G4A_U08_FullSourceD0CloseoutAndBatchAMigrationReadback",
});

export const G4A_U08_STRESS_ACCEPTANCE = Object.freeze({
  publicCountMatrix: Object.freeze([1, 4, 17, 64, 120, 200, 1000]),
  maximumAcceptedQuestionCount: 1000,
  firstRejectedQuestionCount: 1001,
  smokeQuestionCount: 120,
  promotedKnowledgePointCount: 3,
  promotedPatternGroupCount: 4,
  promotedPatternSpecCount: 4,
  semanticFamilies: Object.freeze([
    "comparison_chain",
    "equal_value_unit_price",
    "relative_difference",
    "two_cost_component_payment",
  ]),
  requiredSemanticPassRate: 1,
  requiredArithmeticPassRate: 1,
  requiredBlockingMutationPassRate: 1,
  requiredDomOverflowCount: 0,
  requiredPdfBoundingBoxOverflowCount: 0,
  requiredInternalIdLeakCount: 0,
  requiredUnresolvedPlaceholderCount: 0,
});

export function getG4AU08ProductionPromotionProjection() {
  return Object.freeze({
    productionPromotionOverlayId: G4A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    worksheetPromotionOverlayId: G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
    sourceId: G4A_U08_SOURCE_ID,
    knowledgePointIds: Object.freeze([...G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS]),
    patternGroupIds: Object.freeze([...G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS]),
    patternSpecIds: Object.freeze([...G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS]),
    lifecycle: G4A_U08_PRODUCTION_LIFECYCLE,
    stressAcceptance: G4A_U08_STRESS_ACCEPTANCE,
  });
}

export function validateG4AU08ProductionPromotionProjection() {
  const errors = [];
  if (G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 3) errors.push("knowledge_point_count_mismatch");
  if (G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS.length !== 4) errors.push("pattern_group_count_mismatch");
  if (G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS.length !== 4) errors.push("pattern_spec_count_mismatch");
  if (G4A_U08_PRODUCTION_LIFECYCLE.requiredNextGate !== "S76L_G4A_U08_FullSourceD0CloseoutAndBatchAMigrationReadback") errors.push("next_gate_mismatch");
  if (G4A_U08_PRODUCTION_LIFECYCLE.distance.startsWith("D0")) errors.push("premature_d0");
  if (G4A_U08_STRESS_ACCEPTANCE.maximumAcceptedQuestionCount !== 1000) errors.push("maximum_count_mismatch");
  if (G4A_U08_STRESS_ACCEPTANCE.firstRejectedQuestionCount !== 1001) errors.push("rejection_boundary_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS.length,
    }),
  });
}
