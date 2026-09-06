import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q011-g3a-u09-circle-compass-construction-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_construction",
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
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
];

test("P05F W5 Q011 frozen queue identity remains exact and Q010 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[10];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 11);
  assert.equal(slice.sliceId, "p05e_q011_r1_g3a_u09_3a09_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice011Implementation");
  assert.equal(slice.previousSliceId, "p05e_q010_r1_g3a_u05_3a05_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g3a_u09_3a09");
  assert.equal(slice.intraWavePrerequisiteRank, 1);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_property");
  assert.deepEqual(slice.knowledgePointIds, ["kp_circle_compass_construction"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "5d8b37c17474259f223b1751ec77a23ce5d316f2");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34028015591");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "34028015568");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "9987690405");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:cac179e8a85d393adac21510ebcc2ffea3fe68efa9eeeecad17e21d8f1d21b0e");
  assert.equal(preflight.previousSliceD0Evidence.postMergeTriggerEvent, "push");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q011 locks the current Drive PDF identity and full-page visual source authority", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g3a_u09_3a09");
  assert.equal(preflight.sourceAuthority.sourceTitle, "圓");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_3a09_circle.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1nvx2cakQe_A5HqTi6u6MWhVrPi6D32IL");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1yih0bHxQUSuGCyD_9lp9Ey4ULy7QBp6o");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "10vibFtZAvwGu3PscBZE7X4qyQ2gNyKVC");
  assert.equal(preflight.sourceAuthority.sourceUrlFromMetadata, "https://meow911.com/3a09/");
  assert.equal(preflight.sourceAuthority.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.targetPanel, "MIDDLE_RIGHT_COMPASS_CIRCLE_CONSTRUCTION");
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.panelTitle, "畫圓的方法");
  assert.deepEqual(preflight.sourceAuthority.page1DirectEvidence.visibleLabels, ["尖針", "半徑", "鉛筆心"]);
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.constructionDiagramObserved, true);
  assert.deepEqual(preflight.sourceAuthority.page1DirectEvidence.directlySupportedConcepts, [
    "COMPASS_POINT_FIXED_AT_CENTER",
    "COMPASS_OPENING_EQUALS_RADIUS",
    "COMPASS_ROTATION_TRACES_CIRCLE",
  ]);
  assert.equal(preflight.sourceAuthority.page2BoundaryEvidence.targetConstructionEvidencePresent, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.disposition, "RECORDED_NON_BLOCKING_EMBEDDED_HEADER_URL_MISMATCH");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.metadataManualReviewed, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.metadataExtractionStatus, "pending");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.verificationNotesStatus, "pending");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q011 locks the exact R02 compass-construction candidate and excludes sibling source candidates", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g3a_u09_3a09");
  assert.ok(source);
  assert.equal(source.sourceTitle, "圓");
  assert.equal(source.sourcePdfTitle, "meow911_3a09_circle.pdf");
  assert.equal(source.pageCount, 2);
  assert.deepEqual(source.reviewedPages, [1, 2]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === "kp_circle_compass_construction");
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "用圓規畫圓");
  assert.equal(candidate.capabilityStatement, "學生能以指定圓心與半徑使用圓規畫圓。");
  assert.equal(candidate.reasoningInvariant, "圓規針腳固定於圓心，筆尖與圓心距離始終等於半徑。");
  assert.equal(candidate.category, "geometry");
  assert.deepEqual(candidate.evidencePages, [1, 2]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_NOT_APPLICABLE");

  assert.equal(preflight.r02ReviewedCandidateAuthority.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement, candidate.capabilityStatement);
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant, candidate.reasoningInvariant);

  for (const forbiddenKp of [
    "kp_circle_center_radius_diameter",
    "kp_circle_radius_diameter_measure_compare",
    "kp_circle_point_position_and_intersection",
  ]) {
    assert.ok(preflight.q011ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }
});

test("P05F W5 Q011 reconciles direct PDF construction evidence without admitting sibling construction variants", () => {
  const reconciliation = preflight.sourceConstraintReconciliation;
  assert.equal(reconciliation.directPdfSupportsR02KnowledgePointIdentity, true);
  assert.equal(reconciliation.directPdfSupportsCompassPointFixedAtCenter, true);
  assert.equal(reconciliation.directPdfSupportsRadiusAsCompassOpening, true);
  assert.equal(reconciliation.directPdfSupportsCompassRotationConstruction, true);
  assert.equal(reconciliation.directConstructionEvidenceConcentratedOnPage1, true);
  assert.equal(reconciliation.page2ReviewedForScopeBoundaryOnly, true);
  assert.equal(reconciliation.concentricAndFoldLineConstructionVariantsAppearOnPage1, true);
  assert.equal(reconciliation.concentricAndFoldLineVariantsAllowedByThisPreflight, false);
  assert.equal(reconciliation.embeddedHeaderUrlMismatchIsNonBlocking, true);
});

test("P05F W5 Q011 locks compass construction only and preserves Q002 plus future same-source semantics", () => {
  assert.deepEqual(preflight.q011ScopeLock.includedRelations, [
    "CONSTRUCT_CIRCLE_WITH_COMPASS_FROM_SPECIFIED_CENTER_AND_RADIUS",
    "KEEP_COMPASS_POINT_FIXED_AT_CENTER",
    "KEEP_COMPASS_OPENING_EQUAL_TO_RADIUS",
    "ROTATE_COMPASS_TO_TRACE_CIRCLE",
  ]);
  assert.deepEqual(preflight.q011ScopeLock.protectedExistingSameSourceKnowledgePointIds, [
    "kp_circle_center_radius_diameter",
  ]);
  for (const relation of [
    "CIRCLE_PART_LABEL_IDENTIFICATION",
    "RADIUS_DIAMETER_MEASUREMENT",
    "COMPUTE_RADIUS_FROM_DIAMETER",
    "COMPUTE_DIAMETER_FROM_RADIUS",
    "COMPARE_RADIUS_DIAMETER_MEASUREMENTS",
    "CIRCLE_POINT_POSITION",
    "TWO_CIRCLE_INTERSECTION",
    "TWO_CIRCLE_TANGENCY",
    "COMPASS_LENGTH_COMPARISON",
    "CONCENTRIC_CIRCLE_CONSTRUCTION",
    "FOLD_LINE_RADIUS_CONSTRUCTION",
    "APPLICATION_CONTEXT",
  ]) {
    assert.ok(preflight.q011ScopeLock.excludedRelations.includes(relation));
  }
  assert.equal(preflight.q011ScopeLock.requiresGeometryDiagramRepresentation, true);
  assert.equal(preflight.q011ScopeLock.requiresGeometryConstructionCapability, true);
  assert.equal(preflight.q011ScopeLock.applicationSuitabilityFromR02, "APPLICATION_NOT_APPLICABLE");
  assert.equal(preflight.q011ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q011ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q011ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q011ScopeLock.q002SameSourceProductSemanticsTouched, false);
  assert.equal(preflight.q011ScopeLock.q012OrLaterTouched, false);
});

test("P05F W5 Q011 preserves the frozen geometry-property profile plus construction modifier and exact capability closure", () => {
  const mapping = getR04KnowledgePointCapabilityMapping("kp_circle_compass_construction");
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_property");
  assert.equal(mapping.classificationRuleId, "rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds, ["mod_geometry_construction"]);

  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_geometry_property");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_geometry_property_reasoning",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
  ]);
  assert.deepEqual(runtime.appliedModifierIds, ["mod_geometry_construction"]);
  assert.deepEqual(runtime.modifierAddedRequiredCapabilityIds, ["cap_geometry_construction"]);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, []);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
  assert.equal(runtime.r02CandidateCategory, "geometry");
  assert.equal(runtime.frozenProfileClassificationRule, "rule_geometry_property");
  assert.equal(runtime.profileCategoryMismatchAcknowledged, false);
  assert.equal(runtime.profileCategoryMismatchDisposition, "NONE");
});

test("P05F W5 Q011 inherits the proven Q003-Q010 Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.deepEqual(policy.provenPriorRunIds, PROVEN_PRIOR_RUN_IDS);
  assert.equal(policy.latestProvenRunId, "34028015591");
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

test("P05F W5 Q011 preflight permits implementation planning only and requires separate implementation approval", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ011ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLocked, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice011Implementation");
});
