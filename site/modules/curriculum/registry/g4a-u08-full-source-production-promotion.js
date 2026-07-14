import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
} from "./batch-a-selector-g4a-u08-all-canonical.js";

export const G4A_U08_FULL_SOURCE_PRODUCTION_PROMOTION_ID =
  "s76r_g4a_u08_full_source_production_promotion";

const knowledgePointIds = Object.freeze([
  ...new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.primaryKnowledgePointId)),
]);
const patternGroupIds = Object.freeze(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.patternGroupId));
const patternSpecIds = Object.freeze([
  ...new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.flatMap((row) => row.patternSpecIds)),
]);

export const G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE = Object.freeze({
  publicCountMatrix: Object.freeze([28, 56, 280, 1000]),
  maximumAcceptedQuestionCount: 1000,
  firstRejectedQuestionCount: 1001,
  htmlPdfSmokeQuestionCount: 280,
  knowledgePointCount: 15,
  patternGroupCount: 28,
  patternSpecCount: 33,
  requiredMutationCoveredPatternGroupCount: 28,
  requiredDomOverflowCount: 0,
  requiredPdfBoundingBoxOverflowCount: 0,
  requiredInternalIdLeakCount: 0,
  requiredUnresolvedPlaceholderCount: 0,
});

export const G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE = Object.freeze({
  task: "S76R_G4A_U08_FullSourceStressHTMLPDFAndD0Reevaluation",
  status: "full_source_production_candidate_pending_ci",
  selectorStatus: "15_kp_visible",
  runtimeStatus: "28_group_blocking_validated_runtime",
  validatorStatus: "33_pattern_spec_contracts_reachable",
  worksheetStatus: "28_group_worksheet_reachable",
  rendererStatus: "existing_generic_renderer_full_source_candidate",
  htmlPdfStatus: "full_source_smoke_required",
  productionUse: "preview_only_pending_s76r_ci",
  distanceBefore: "D1_G4A_U08_ALL_CANONICAL_PUBLIC_ROUTING_MERGED",
  distanceAfterCandidate: "D0_G4A_U08_PENDING_S76R_CI_AND_PROMOTION",
  requiredNextGate: "S76R_CI_THEN_PRODUCTION_PROMOTION",
});

export function getG4AU08FullSourceProductionProjection() {
  return Object.freeze({
    promotionId: G4A_U08_FULL_SOURCE_PRODUCTION_PROMOTION_ID,
    sourceId: "g4a_u08_4a08",
    knowledgePointIds,
    patternGroupIds,
    patternSpecIds,
    lifecycle: G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE,
    stressAcceptance: G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE,
  });
}

export function validateG4AU08FullSourceProductionProjection() {
  const errors = [];
  if (knowledgePointIds.length !== 15) errors.push("knowledge_point_count_mismatch");
  if (patternGroupIds.length !== 28) errors.push("pattern_group_count_mismatch");
  if (patternSpecIds.length !== 33) errors.push("pattern_spec_count_mismatch");
  if (new Set(patternGroupIds).size !== patternGroupIds.length) errors.push("duplicate_pattern_group");
  if (G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.some((row) => row.visibilityStatus !== "visible" || row.holdReason !== null)) errors.push("canonical_group_visibility_invalid");
  if (G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.firstRejectedQuestionCount !== 1001) errors.push("rejection_boundary_mismatch");
  if (G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE.productionUse !== "preview_only_pending_s76r_ci") errors.push("premature_production_promotion");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: knowledgePointIds.length,
      patternGroups: patternGroupIds.length,
      patternSpecs: patternSpecIds.length,
    }),
  });
}
