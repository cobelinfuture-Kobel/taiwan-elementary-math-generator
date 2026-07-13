import {
  G4A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  G4A_U08_STRESS_ACCEPTANCE,
  validateG4AU08ProductionPromotionProjection,
} from "./g4a-u08-production-promotion.js";
import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
  G4A_U08_SOURCE_ID,
} from "./g4a-u08-phase2b-promotion.js";

export const G4A_U08_D0_PRODUCTION_CLOSEOUT_ID =
  "s76l_g4a_u08_full_source_d0_production_closeout";

export const G4A_U08_D0_EVIDENCE = Object.freeze({
  integrationTask: "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
  integrationMergeCommit: "2e81565f503476540adfb67e9822d2fe0a4aa1bb",
  stressTask: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
  stressPromotionOverlayId: G4A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  stressImplementationPr: 154,
  stressMergeCommit: "c995a2e5d741bbc07f000205eed8d145b7002f13",
  stressHeadSha: "268f7e5344c850ed02116bd97ad6dfe4d9f344bd",
  smokeWorkflowRunId: 29268903266,
  smokeArtifactId: 8286611935,
  smokeArtifactDigest: "sha256:baf1d77e6b989b5efee273adeda91c1b909e70033cc4b84caa3e96b684f93e66",
  smokeArtifactExpiresAt: "2026-08-12T17:04:39Z",
  standardWorkflowCount: 8,
  standardWorkflowFailures: 0,
});

export const G4A_U08_D0_PRODUCTION_LIFECYCLE = Object.freeze({
  closeoutTask: "S76L_G4A_U08_FullSourceD0CloseoutAndBatchAMigrationReadback",
  status: "full_source_d0_closeout_integrated",
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_accepted",
  worksheetStatus: "worksheet_eligible",
  rendererStatus: "existing_generic_renderer_verified",
  htmlPdfStatus: "production_smoke_pass",
  productionUse: "allowed",
  distance: "D0_G4A_U08",
  batchAMigrationStatus: "readback_accepted",
  requiredNextGate: "S77_BatchA_NextUnitSourcePriorityLock",
});

export function getG4AU08D0ProductionCloseoutProjection() {
  return Object.freeze({
    closeoutId: G4A_U08_D0_PRODUCTION_CLOSEOUT_ID,
    sourceId: G4A_U08_SOURCE_ID,
    knowledgePointIds: Object.freeze([...G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS]),
    patternGroupIds: Object.freeze([...G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS]),
    patternSpecIds: Object.freeze([...G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS]),
    lifecycle: G4A_U08_D0_PRODUCTION_LIFECYCLE,
    stressAcceptance: Object.freeze({
      ...G4A_U08_STRESS_ACCEPTANCE,
      numericLegacyPatternSpecCount: 10,
      phase2AApplicationPatternSpecCount: 12,
      phase2BCanonicalPatternSpecCount: 4,
      totalExecutablePatternSpecCount: 26,
      primaryStressQuestionCount: 1806,
    }),
    evidence: G4A_U08_D0_EVIDENCE,
  });
}

export function validateG4AU08D0ProductionCloseoutProjection() {
  const errors = [];
  const stressProjection = validateG4AU08ProductionPromotionProjection();
  if (!stressProjection.ok) errors.push(...stressProjection.errors.map((code) => `s76k:${code}`));
  if (G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 3) errors.push("knowledge_point_count_mismatch");
  if (G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS.length !== 4) errors.push("pattern_group_count_mismatch");
  if (G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS.length !== 4) errors.push("pattern_spec_count_mismatch");
  if (G4A_U08_D0_PRODUCTION_LIFECYCLE.productionUse !== "allowed") errors.push("production_use_not_allowed");
  if (G4A_U08_D0_PRODUCTION_LIFECYCLE.distance !== "D0_G4A_U08") errors.push("distance_not_d0");
  if (G4A_U08_D0_PRODUCTION_LIFECYCLE.htmlPdfStatus !== "production_smoke_pass") errors.push("html_pdf_not_accepted");
  if (G4A_U08_D0_PRODUCTION_LIFECYCLE.batchAMigrationStatus !== "readback_accepted") errors.push("batch_a_migration_not_accepted");
  if (G4A_U08_D0_PRODUCTION_LIFECYCLE.requiredNextGate !== "S77_BatchA_NextUnitSourcePriorityLock") errors.push("next_gate_mismatch");
  if (G4A_U08_D0_EVIDENCE.standardWorkflowCount !== 8 || G4A_U08_D0_EVIDENCE.standardWorkflowFailures !== 0) errors.push("workflow_evidence_mismatch");
  if (!G4A_U08_D0_EVIDENCE.smokeArtifactDigest.startsWith("sha256:")) errors.push("artifact_digest_missing");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: 3,
      patternGroups: 4,
      patternSpecs: 4,
      totalExecutablePatternSpecs: 26,
      primaryStressQuestions: 1806,
    }),
  });
}
