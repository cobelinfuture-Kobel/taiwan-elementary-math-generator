import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q007-g5a-u10a-solid-shape-classification-source-authority-preflight.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
];

test("P05F W5 Q007 frozen queue identity remains exact and Q006 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[6];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 7);
  assert.equal(slice.sliceId, "p05e_q007_r0_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice007Implementation");
  assert.equal(slice.previousSliceId, "p05e_q006_r0_g5a_u07_5a07_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g5a_u10_5a10a");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.deepEqual(slice.knowledgePointIds, ["kp_g5a_u10a_solid_shape_classification"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "0f386d75c86b98fc0998f797ef3f5850fa20ef6b");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "33950114817");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "33950114802");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "9964549168");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:0a99461f4a59ae62154925a398af3ad8dc75f29e09c87e1bee9a2ceadc517c69");
  assert.equal(preflight.previousSliceD0Evidence.postMergeTriggerEvent, "push");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q007 reuses current R02 full-page reviewed authority with matching 5a10a source identity", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g5a_u10_5a10a");
  assert.equal(preflight.sourceAuthority.sourceTitle, "柱體錐體和球");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_5a10a_source.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1ErBCKyfIoXn0yswNUpNzlBcMNb8wkaqq");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1EPSIaZ3lj01KlT-6YPExiRk-jS4MoNT2");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "1mQvjboJNScUEnLbrIBxABAvmbT1Ynr5n");
  assert.equal(preflight.sourceAuthority.reviewMethod, "R02_FULL_PAGE_VISUAL_READBACK_REUSE");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(preflight.sourceAuthority.sourceUrlFromMetadata, "https://meow911.com/5a10a/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.disposition, "NONE_MATCHING_SOURCE_IDENTITY");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q007 locks only solid-shape classification from G5A-U10a", () => {
  const authority = preflight.r02ReviewedCandidateAuthority;
  assert.equal(authority.chunkPath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
  assert.equal(authority.knowledgePointId, "kp_g5a_u10a_solid_shape_classification");
  assert.equal(authority.canonicalNameZh, "柱體錐體與球分類");
  assert.equal(authority.capabilityStatement, "學生能依底面、側面與頂點特徵分類立體形體。");
  assert.equal(authority.reasoningInvariant, "柱體有兩個全等平行底面，錐體向一頂點收斂，球無平面底面。");
  assert.equal(authority.applicationSuitability, "APPLICATION_COMPATIBLE");

  for (const forbiddenKp of [
    "kp_g5a_u10a_prism_pyramid_elements",
    "kp_g5a_u10a_solid_net_correspondence",
    "kp_g5a_u10a_solid_cross_section",
    "kp_g5a_u10a_solid_viewpoint_representation",
  ]) {
    assert.ok(preflight.q007ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }

  assert.deepEqual(preflight.q007ScopeLock.includedRelations, [
    "CLASSIFY_SOLIDS_BY_BASE_SIDE_VERTEX_FEATURES",
    "DISTINGUISH_COLUMN_CONE_SPHERE",
    "RECOGNIZE_DEFINING_SOLID_FEATURES",
  ]);
  assert.equal(preflight.q007ScopeLock.requiresSolidGeometryRepresentation, true);
  assert.equal(preflight.q007ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q007ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q007ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
});

test("P05F W5 Q007 locks the spatial-solid runtime profile and exact W5 capability closure", () => {
  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_spatial_solid");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_spatial_solid_reasoning",
    "cap_geometry_domain_validator",
    "cap_solid_geometry_representation",
  ]);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, [
    "cap_geometry_property_reasoning",
  ]);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
});

test("P05F W5 Q007 inherits the Q003-Q006 proven main-push Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.deepEqual(policy.provenPriorRunIds, ["33926418642", "33934940413", "33937587482", "33950114817"]);
  assert.equal(policy.latestProvenRunId, "33950114817");
  assert.equal(policy.singlePullRequestOrchestratorMustRemain, true);
  assert.equal(policy.postMergeWorkflowPullRequestTriggerAllowed, false);
  assert.equal(policy.perQWorkflowRunTriggerAllowed, false);
  assert.equal(policy.automaticTrigger, "PUSH_MAIN_WITH_Q_SPECIFIC_PATHS_FILTER");
  assert.equal(policy.manualFallback, "workflow_dispatch");
  assert.equal(policy.qSpecificPathsMustBeDerivedFromExactImplementationDiff, true);
  assert.equal(policy.broadHistoricalSharedPathFanoutForbidden, true);
  assert.equal(policy.mustVerifyExactDeployedBytesBySha256, true);
  assert.equal(policy.mustExerciseClassicUiGeneratorValidatorWorksheetRendererPrintArtifact, true);
});

test("P05F W5 Q007 preflight permits planning but not implementation or public admission", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ007ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLocked, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice007Implementation");
});
