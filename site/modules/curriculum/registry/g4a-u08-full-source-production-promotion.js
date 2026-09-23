import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
} from "./batch-a-selector-g4a-u08-all-canonical.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  validateG4AU08AllCanonicalPublicSelectorProjection,
} from "./batch-a-selector-composer.js";

export const G4A_U08_FULL_SOURCE_PROMOTION_OVERLAY_ID =
  "s76r_g4a_u08_full_source_production_promotion";
export const G4A_U08_FULL_SOURCE_ID = "g4a_u08_4a08";
export const G4A_U08_FULL_SOURCE_UNIT_CODE = "4A-U08";

export const G4A_U08_FULL_SOURCE_COUNTS = Object.freeze({
  knowledgePoints: 15,
  patternGroups: 28,
  patternSpecs: 33,
});

export const G4A_U08_FULL_SOURCE_LIFECYCLE = Object.freeze({
  task: "S76R_G4A_U08_FullSourceStressHTMLPDFAndD0Reevaluation",
  status: "full_source_stress_integrated_pending_ci",
  selectorStatus: "15_canonical_knowledge_points_visible",
  resolverStatus: "28_canonical_pattern_groups_explicitly_selectable",
  runtimeStatus: "33_pattern_specs_blocking_validated",
  validatorStatus: "full_source_mutation_gate_required",
  worksheetStatus: "112_question_full_coverage_candidate",
  rendererStatus: "existing_generic_renderer_full_source_stress_candidate",
  htmlPdfStatus: "full_source_html_pdf_required",
  browserUiStatus: "15_kp_dom_generate_preview_print_required",
  productionUse: "allowed_after_s76r_ci_and_fresh_main_deployed_closeout",
  distance: "D1_G4A_U08_FULL_SOURCE_STRESS_AND_DEPLOYED_CLOSEOUT_PENDING",
  requiredNextGate: "S76R2_G4A_U08_DeployedPagesAndFreshMainD0Closeout",
});

export const G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE = Object.freeze({
  publicCountMatrix: Object.freeze([1, 15, 28, 33, 56, 112, 200, 1000]),
  maximumAcceptedQuestionCount: 1000,
  firstRejectedQuestionCount: 1001,
  smokeQuestionCount: 112,
  expectedDomCellCount: 224,
  requiredVisibleKnowledgePointCount: 15,
  requiredPatternGroupCount: 28,
  requiredPatternSpecCount: 33,
  requiredMutationCoveredPatternGroupCount: 28,
  requiredQuestionCount: 112,
  requiredAnswerKeyItemCount: 112,
  requiredSemanticPassRate: 1,
  requiredArithmeticPassRate: 1,
  requiredBlockingMutationPassRate: 1,
  requiredDomOverflowCount: 0,
  requiredPdfBoundingBoxOverflowCount: 0,
  requiredInternalIdLeakCount: 0,
  requiredUnresolvedPlaceholderCount: 0,
  genericFallback: false,
  publicPatternSpecInjection: false,
});

export function getG4AU08FullSourceProductionProjection() {
  const knowledgePointIds = [
    ...new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.primaryKnowledgePointId)),
  ];
  const patternGroupIds = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.patternGroupId);
  const patternSpecIds = [
    ...new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.flatMap((row) => row.patternSpecIds)),
  ];
  return Object.freeze({
    productionPromotionOverlayId: G4A_U08_FULL_SOURCE_PROMOTION_OVERLAY_ID,
    sourceId: G4A_U08_FULL_SOURCE_ID,
    unitCode: G4A_U08_FULL_SOURCE_UNIT_CODE,
    knowledgePointIds: Object.freeze(knowledgePointIds),
    patternGroupIds: Object.freeze(patternGroupIds),
    patternSpecIds: Object.freeze(patternSpecIds),
    lifecycle: G4A_U08_FULL_SOURCE_LIFECYCLE,
    stressAcceptance: G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE,
  });
}

export function validateG4AU08FullSourceProductionProjection() {
  const projection = getG4AU08FullSourceProductionProjection();
  const selector = validateG4AU08AllCanonicalPublicSelectorProjection();
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U08_FULL_SOURCE_ID);
  const visibleRows = listVisibleBatchAKnowledgePoints()
    .filter((row) => row.sourceId === G4A_U08_FULL_SOURCE_ID);
  const errors = [...selector.errors];
  if (projection.knowledgePointIds.length !== G4A_U08_FULL_SOURCE_COUNTS.knowledgePoints) errors.push("knowledge_point_count_mismatch");
  if (projection.patternGroupIds.length !== G4A_U08_FULL_SOURCE_COUNTS.patternGroups) errors.push("pattern_group_count_mismatch");
  if (projection.patternSpecIds.length !== G4A_U08_FULL_SOURCE_COUNTS.patternSpecs) errors.push("pattern_spec_count_mismatch");
  if (new Set(projection.knowledgePointIds).size !== projection.knowledgePointIds.length) errors.push("duplicate_knowledge_point_id");
  if (new Set(projection.patternGroupIds).size !== projection.patternGroupIds.length) errors.push("duplicate_pattern_group_id");
  if (new Set(projection.patternSpecIds).size !== projection.patternSpecIds.length) errors.push("duplicate_pattern_spec_id");
  if (availability.visibleCount !== G4A_U08_FULL_SOURCE_COUNTS.knowledgePoints) errors.push("selector_visible_count_mismatch");
  if (visibleRows.length !== G4A_U08_FULL_SOURCE_COUNTS.knowledgePoints) errors.push("visible_registry_count_mismatch");
  if (G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.maximumAcceptedQuestionCount !== 1000) errors.push("maximum_count_mismatch");
  if (G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.firstRejectedQuestionCount !== 1001) errors.push("rejection_boundary_mismatch");
  if (G4A_U08_FULL_SOURCE_LIFECYCLE.distance.startsWith("D0")) errors.push("premature_d0");
  if (G4A_U08_FULL_SOURCE_LIFECYCLE.productionUse === "allowed") errors.push("premature_production_activation");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: G4A_U08_FULL_SOURCE_COUNTS,
    lifecycle: G4A_U08_FULL_SOURCE_LIFECYCLE,
  });
}
