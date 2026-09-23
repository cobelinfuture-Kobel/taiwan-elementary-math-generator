import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q005-g4b-u10-cubic-centimeter-unit-source-authority-preflight.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
];

test("P05F W5 Q005 frozen queue identity remains exact and Q004 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[4];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 5);
  assert.equal(slice.sliceId, "p05e_q005_r0_g4b_u10_4b10_profile_spatial_solid_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice005Implementation");
  assert.equal(slice.previousSliceId, "p05e_q004_r0_g4b_u02_4b02_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g4b_u10_4b10");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.deepEqual(slice.knowledgePointIds, ["kp_g4b_u10_cubic_centimeter_unit"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "eb538bb879164830995f11d908a1931e31f0bd03");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "33934940413");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "33934940406");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "9959859146");
  assert.equal(preflight.previousSliceD0Evidence.postMergeTriggerEvent, "push");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q005 reuses current R02 full-page reviewed authority with matching 4b10 source identity", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g4b_u10_4b10");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_4b10_source.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1WvktYZkvxrWVdzPr68Z8GNauosbF2POG");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1D0tFC88EPUmyAFhhlljuho_PZIAoZNsZ");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "1-Glky7Y0RnnmiY7lQ68x2jJnYYOdFKSZ");
  assert.equal(preflight.sourceAuthority.reviewMethod, "R02_FULL_PAGE_VISUAL_READBACK_REUSE");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.embeddedHeaderUrl, "https://meow911.com/4b10/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.metadataSourceUrl, "https://meow911.com/4b10/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.disposition, "NON_BLOCKING_TITLE_VARIATION_MATCHING_SOURCE_IDENTITY");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q005 locks only the cubic-centimeter unit knowledge point from G4B-U10", () => {
  const authority = preflight.r02ReviewedCandidateAuthority;
  assert.equal(authority.chunkPath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
  assert.equal(authority.knowledgePointId, "kp_g4b_u10_cubic_centimeter_unit");
  assert.equal(authority.canonicalNameZh, "立方公分體積單位");
  assert.equal(authority.capabilityStatement, "學生能理解邊長1公分正方體的體積是1立方公分。");
  assert.equal(authority.reasoningInvariant, "體積單位是三維堆疊單位，不等同面積或長度單位。");
  assert.equal(authority.applicationSuitability, "APPLICATION_COMPATIBLE");

  for (const forbiddenKp of [
    "kp_g4b_u10_unit_cube_counting",
    "kp_g4b_u10_layered_cube_counting",
    "kp_g4b_u10_volume_conservation_rearrangement",
    "kp_g4b_u10_rectangular_prism_volume_structure",
  ]) {
    assert.ok(preflight.q005ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }
  assert.equal(preflight.q005ScopeLock.requiresSolidGeometryRepresentation, true);
  assert.equal(preflight.q005ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q005ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q005ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
});

test("P05F W5 Q005 locks the spatial-solid runtime profile and its exact W5 dependency closure", () => {
  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_spatial_solid");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_spatial_solid_reasoning",
    "cap_geometry_domain_validator",
    "cap_solid_geometry_representation",
  ]);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, ["cap_geometry_property_reasoning"]);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
});

test("P05F W5 Q005 inherits the Q003/Q004-proven main-push Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.deepEqual(policy.provenPriorRunIds, ["33926418642", "33934940413"]);
  assert.equal(policy.latestProvenRunId, "33934940413");
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

test("P05F W5 Q005 preflight permits planning but not implementation or public admission", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ005ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLocked, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice005Implementation");
});
