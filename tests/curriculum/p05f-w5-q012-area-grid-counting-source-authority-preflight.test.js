import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q012-g3b-u05-area-grid-counting-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json", import.meta.url),
  "utf8",
));
const q003Implementation = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q003-g3b-u05-square-centimeter-area-unit-implementation.json", import.meta.url),
  "utf8",
));

const EXPECTED_KP = "kp_area_grid_counting";
const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];
const PROVEN_PRIOR_RUN_IDS = [
  "33926418642",
  "33934940413",
  "33937587482",
  "33950114817",
  "33953512923",
  "34000572190",
  "34013051969",
  "34028015591",
  "34040879338",
];

test("P05F W5 Q012 frozen queue identity remains exact and Q011 D0 plus attribution repair are satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[11];

  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistry.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.equal(slice.queuePosition, 12);
  assert.equal(slice.sliceId, "p05e_q012_r1_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice012Implementation");
  assert.equal(slice.previousSliceId, "p05e_q011_r1_g3a_u09_3a09_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g3b_u05_3b05");
  assert.equal(slice.intraWavePrerequisiteRank, 1);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(slice.knowledgePointCount, 1);
  assert.deepEqual(slice.knowledgePointIds, [EXPECTED_KP]);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, [EXPECTED_KP]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  const predecessor = preflight.previousSliceD0Evidence;
  assert.equal(predecessor.sliceId, "p05e_q011_r1_g3a_u09_3a09_profile_geometry_property_c1");
  assert.equal(predecessor.productMergeSha, "8f92fbc3faa8a6ca1e3af45d558dfe1e8e18b218");
  assert.equal(predecessor.prGateRunId, "34040772073");
  assert.equal(predecessor.exactPagesRunId, "34040879338");
  assert.equal(predecessor.pagesDeploymentRunId, "34040879295");
  assert.equal(predecessor.evidenceArtifactId, "9991650020");
  assert.equal(predecessor.evidenceArtifactDigest, "sha256:3b67fe88a39121d514d61ec9f074bdd52e4b70dfa030503791641bc31e188996");
  assert.equal(predecessor.status, "PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.postMergeAttribution.originalRepositoryRunId, "34040879292");
  assert.equal(predecessor.postMergeAttribution.repairPrNumber, 812);
  assert.equal(predecessor.postMergeAttribution.repairMergeSha, "dc083737d11cc28b131b77082b847c8d3f6af838");
  assert.equal(predecessor.postMergeAttribution.preQ011BaselineFailureCount, 108);
  assert.equal(predecessor.postMergeAttribution.postRepairFailureCount, 108);
  assert.equal(predecessor.postMergeAttribution.postRepairNewFailureCountVsBaseline, 0);
  assert.equal(predecessor.postMergeAttribution.q011ProductImplementationChangedByRepair, false);
  assert.equal(predecessor.postMergeAttribution.closeoutStatus, "Q011_PASS_E6_D0_COMPLETE_AND_POSTMERGE_ATTRIBUTED_REPAIRED");
});

test("P05F W5 Q012 locks the current Drive PDF identity and the exact page-1 grid-counting evidence", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  const source = preflight.sourceAuthority;
  assert.equal(source.sourceNodeId, "g3b_u05_3b05");
  assert.equal(source.sourceTitle, "面積與平方公分");
  assert.equal(source.sourcePdfTitle, "meow911_3b05_cm2_area.pdf");
  assert.equal(source.sourcePdfDriveFileId, "1JqksZyiKwD_cnZUN_zfmGlXwRpa_0w-8");
  assert.equal(source.sourceMetadataDriveFileId, "1MAikylRPat5hR2LMFx87mOOD0Sfir-O5");
  assert.equal(source.verificationNotesDriveFileId, "1BWQvqOYz1UXAuqfYh-l8WB6WUVMOLDni");
  assert.equal(source.sourceUrlFromMetadata, "https://meow911.com/3b05/");
  assert.equal(source.metadataSourceTitle, "平方公分與面積");
  assert.equal(source.embeddedHeaderUrlFromPdf, "https://meow911.com/3a06/");
  assert.equal(source.pageCount, 1);
  assert.equal(source.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(source.reviewedPages, [1]);

  assert.equal(source.page1DirectEvidence.regularGridCounting.panelTitle, "規則形狀的面積計算");
  assert.deepEqual(source.page1DirectEvidence.regularGridCounting.visibleStatements, ["每1小格面積=1cm²"]);
  assert.ok(source.page1DirectEvidence.regularGridCounting.directlySupportedConcepts.includes("COUNT_COMPLETE_UNIT_SQUARES"));
  assert.equal(source.page1DirectEvidence.gridCountingTechnique.panelTitle, "不規則形狀的面積 數格子的技巧");
  assert.equal(source.page1DirectEvidence.gridCountingTechnique.generalIrregularDecompositionAdmittedByQ012, false);
  assert.equal(source.page1DirectEvidence.halfSquareGridCounting.panelTitle, "正方形被平分的 數格子技巧");
  assert.deepEqual(source.page1DirectEvidence.halfSquareGridCounting.directlySupportedConcepts, [
    "COUNT_PARTIAL_HALF_UNIT_SQUARES",
    "PAIR_HALF_SQUARES_TO_WHOLE_UNITS",
  ]);
  assert.equal(source.sourceIdentityCrossCheck.sourceTitleNormalizationObserved, true);
  assert.equal(source.sourceIdentityCrossCheck.embeddedHeaderUrlMismatchObserved, true);
  assert.equal(source.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(source.driveMetadataReadback.metadataManualReviewed, false);
  assert.equal(source.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q012 locks the exact R02 grid-counting candidate and protects shipped Q003 semantics", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g3b_u05_3b05");
  assert.ok(source);
  assert.equal(source.sourceTitle, "面積與平方公分");
  assert.equal(source.sourcePdfTitle, "meow911_3b05_cm2_area.pdf");
  assert.deepEqual(source.reviewedPages, [1]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === EXPECTED_KP);
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "方格面積計數");
  assert.equal(candidate.capabilityStatement, "學生能以完整與部分單位方格計算圖形面積。");
  assert.equal(candidate.reasoningInvariant, "無重疊、無空隙的單位方格總數等於圖形面積。");
  assert.equal(candidate.category, "geometry");
  assert.deepEqual(candidate.evidencePages, [1]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  const locked = preflight.r02ReviewedCandidateAuthority;
  assert.equal(locked.knowledgePointId, candidate.knowledgePointId);
  assert.equal(locked.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(locked.capabilityStatement, candidate.capabilityStatement);
  assert.equal(locked.reasoningInvariant, candidate.reasoningInvariant);
  assert.equal(locked.applicationSuitability, candidate.applicationSuitability);

  assert.equal(q003Implementation.queueAuthority.knowledgePointId, "kp_area_square_centimeter_unit");
  assert.equal(q003Implementation.formalMapping.mappingId, "fm_g3b_u05_square_centimeter_area_unit_p05f3");
  assert.ok(q003Implementation.formalMapping.excludedRelations.includes("COUNT_AREA_GRID_SQUARES"));
  assert.equal(q003Implementation.scopeGuard.gridCountingTouched, false);
  assert.deepEqual(preflight.q012ScopeLock.protectedExistingSameSourceKnowledgePointIds, ["kp_area_square_centimeter_unit"]);
  assert.equal(preflight.q012ScopeLock.q003SameSourceProductSemanticsTouched, false);
});

test("P05F W5 Q012 reconciles grid-counting evidence without absorbing later same-source area semantics", () => {
  const reconciliation = preflight.sourceConstraintReconciliation;
  assert.equal(reconciliation.directPdfSupportsQ012KnowledgePointIdentity, true);
  assert.equal(reconciliation.directPdfSupportsCompleteUnitGridCounting, true);
  assert.equal(reconciliation.directPdfSupportsPartialHalfUnitGridCounting, true);
  assert.equal(reconciliation.directPdfSupportsPairingHalfSquaresIntoWholeUnits, true);
  assert.equal(reconciliation.r02SupportsCompleteAndPartialUnitSquareCounting, true);
  assert.equal(reconciliation.generalIrregularGridDecompositionAppearsInSource, true);
  assert.equal(reconciliation.generalIrregularGridDecompositionAllowedByThisPreflight, false);
  assert.equal(reconciliation.cutRearrangeAreaConservationAppearsInSource, true);
  assert.equal(reconciliation.cutRearrangeAreaConservationAllowedByThisPreflight, false);
  assert.equal(reconciliation.samePerimeterAreaComparisonAllowedByThisPreflight, false);
  assert.equal(reconciliation.realWorldAreaEstimationAllowedByThisPreflight, false);
  assert.equal(reconciliation.embeddedHeaderUrlMismatchIsNonBlocking, true);
  assert.equal(reconciliation.metadataTitleOrderDifferenceIsNonBlocking, true);
});

test("P05F W5 Q012 locks only the single grid-counting semantic surface and preserves Q003 plus Q013-or-later", () => {
  assert.deepEqual(preflight.q012ScopeLock.includedKnowledgePointIds, [EXPECTED_KP]);
  for (const relation of [
    "COUNT_COMPLETE_UNIT_SQUARES_FOR_AREA",
    "COUNT_PARTIAL_HALF_UNIT_SQUARES_FOR_AREA",
    "PAIR_HALF_UNIT_SQUARES_TO_EQUIVALENT_WHOLE_UNITS",
    "COMPUTE_AREA_FROM_UNIT_GRID_COUNT",
    "PRESERVE_NO_OVERLAP_NO_GAP_COVERAGE_INVARIANT",
  ]) {
    assert.ok(preflight.q012ScopeLock.includedRelations.includes(relation));
  }
  assert.deepEqual(preflight.q012ScopeLock.excludedKnowledgePointIdsFromSameSource, [
    "kp_area_square_centimeter_unit",
    "kp_area_conservation_cut_rearrange",
    "kp_irregular_grid_area",
    "kp_area_compare_same_perimeter",
  ]);
  for (const relation of [
    "IDENTIFY_ONE_SQUARE_CENTIMETER_AS_TARGET_KP",
    "GENERAL_IRREGULAR_GRID_AREA_DECOMPOSITION_OR_COMPLETION",
    "CUT_REARRANGE_AREA_CONSERVATION",
    "COMPARE_AREA_UNDER_SAME_PERIMETER",
    "RECTANGLE_AREA_FORMULA",
    "SQUARE_AREA_FORMULA",
    "PERIMETER_COMPUTATION",
    "REAL_WORLD_AREA_ESTIMATION",
    "APPLICATION_CONTEXT",
  ]) {
    assert.ok(preflight.q012ScopeLock.excludedRelations.includes(relation));
  }
  assert.equal(preflight.q012ScopeLock.requiresGeometryDiagramRepresentation, true);
  assert.equal(preflight.q012ScopeLock.requiresGeometryFormulaEvaluation, true);
  assert.equal(preflight.q012ScopeLock.requiresGeometryDomainValidator, true);
  assert.equal(preflight.q012ScopeLock.requiresGeometryPropertyReasoning, true);
  assert.equal(preflight.q012ScopeLock.applicationSuitabilityFromR02, "APPLICATION_COMPATIBLE");
  assert.equal(preflight.q012ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q012ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q012ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q012ScopeLock.q013OrLaterTouched, false);
  assert.equal(preflight.q012ScopeLock.frozenQueueAuthorityTouched, false);
});

test("P05F W5 Q012 preserves the exact R04 geometry-formula mapping and frozen capability closure", () => {
  const mapping = getR04KnowledgePointCapabilityMapping(EXPECTED_KP);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(mapping.classificationRuleId, "rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds, []);

  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_geometry_formula");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_geometry_formula_evaluation",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
  ]);
  assert.deepEqual(runtime.perKnowledgePointMappings, [{
    knowledgePointId: EXPECTED_KP,
    classificationRuleId: "rule_geometry_formula",
    appliedModifierIds: [],
  }]);
  assert.deepEqual(runtime.unionAppliedModifierIds, []);
  assert.deepEqual(runtime.modifierAddedRequiredCapabilityIds, []);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, ["cap_geometry_property_reasoning"]);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(runtime.r02CandidateCategories, ["geometry"]);
  assert.equal(runtime.frozenProfileClassificationRule, "rule_geometry_formula");
  assert.equal(runtime.profileCategoryMismatchAcknowledged, false);
  assert.equal(runtime.profileCategoryMismatchDisposition, "NONE");
});

test("P05F W5 Q012 inherits the proven Q003-Q011 Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.deepEqual(policy.provenPriorRunIds, PROVEN_PRIOR_RUN_IDS);
  assert.equal(policy.latestProvenRunId, "34040879338");
  assert.equal(policy.singlePullRequestOrchestratorMustRemain, true);
  assert.equal(policy.postMergeWorkflowPullRequestTriggerAllowed, false);
  assert.equal(policy.perQWorkflowRunTriggerAllowed, false);
  assert.equal(policy.automaticTrigger, "PUSH_MAIN_WITH_Q_SPECIFIC_PATHS_FILTER");
  assert.equal(policy.manualFallback, "workflow_dispatch");
  assert.equal(policy.qSpecificPathsMustBeDerivedFromExactImplementationDiff, true);
  assert.equal(policy.broadHistoricalSharedPathFanoutForbidden, true);
  assert.equal(policy.mustWaitForMatchingPagesDeployment, true);
  assert.equal(policy.mustVerifyExactDeployedBytesBySha256, true);
  assert.equal(policy.mustExerciseClassicUiGeneratorValidatorWorksheetRendererPrintArtifact, true);
  assert.equal(policy.materializeWorkflowDuringImplementationOrPostMergeEvidenceTask, true);
});

test("P05F W5 Q012 preflight stops at the implementation approval boundary", () => {
  const decision = preflight.preflightDecision;
  assert.equal(decision.sourceAuthoritySufficientForQ012ImplementationPlanning, true);
  assert.equal(decision.previousSliceD0Satisfied, true);
  assert.equal(decision.runtimeCapabilityContractLocked, true);
  assert.equal(decision.singleKnowledgePointSliceLocked, true);
  assert.equal(decision.existingSameSourceQ003Protected, true);
  assert.equal(decision.manualSourceChoiceRequired, false);
  assert.equal(decision.sourceRefAmbiguity, false);
  assert.equal(decision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(decision.nextTask, "P05F_W5DirectProductVerticalSlice012Implementation");
});
