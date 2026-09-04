import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q004-g4b-u02-parallel-lines-recognition-source-authority-preflight.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
];

test("P05F W5 Q004 frozen queue identity remains exact and Q003 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[3];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 4);
  assert.equal(slice.sliceId, "p05e_q004_r0_g4b_u02_4b02_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice004Implementation");
  assert.equal(slice.previousSliceId, "p05e_q003_r0_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g4b_u02_4b02");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_property");
  assert.deepEqual(slice.knowledgePointIds, ["kp_g4b_u02_parallel_lines_recognition"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "c55cc1039d0b5f09bc3ce5666406d9229690874f");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "33926418642");
  assert.equal(preflight.previousSliceD0Evidence.postMergeTriggerEvent, "push");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q004 reuses current R02 full-page reviewed authority with matching source identity", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g4b_u02_4b02");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_4b02_source.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1ysaTTFTY37MC_gNzt1uh6yo2W34OGjIU");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1UfUX4Z9LCwI0tOYgT1s3CNvTdt68s_Dn");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "14udBZgATyNSvLfkInWb3lFKSlPWrWDXI");
  assert.equal(preflight.sourceAuthority.reviewMethod, "R02_FULL_PAGE_VISUAL_READBACK_REUSE");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.embeddedHeaderUrl, "https://meow911.com/4b02/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.metadataSourceUrl, "https://meow911.com/4b02/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q004 locks only parallel-line recognition from G4B-U02", () => {
  const authority = preflight.r02ReviewedCandidateAuthority;
  assert.equal(authority.chunkPath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
  assert.equal(authority.knowledgePointId, "kp_g4b_u02_parallel_lines_recognition");
  assert.equal(authority.canonicalNameZh, "平行線辨識");
  assert.equal(authority.capabilityStatement, "學生能辨認同平面內不相交且距離固定的直線。");
  assert.equal(authority.reasoningInvariant, "平行線延伸後仍不相交，方向保持一致。");
  assert.equal(authority.applicationSuitability, "APPLICATION_COMPATIBLE");

  for (const forbiddenKp of [
    "kp_g4b_u02_perpendicular_lines_recognition",
    "kp_g4b_u02_parallel_distance_construction",
    "kp_g4b_u02_quadrilateral_classification",
    "kp_g4b_u02_quadrilateral_inclusion_relation",
  ]) {
    assert.ok(preflight.q004ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }
  assert.equal(preflight.q004ScopeLock.requiresDiagramRepresentation, true);
  assert.equal(preflight.q004ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q004ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
});

test("P05F W5 Q004 inherits the proven Q003 main-push Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.equal(policy.inheritedFromQ003ProvenRunId, "33926418642");
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

test("P05F W5 Q004 preflight permits planning but not implementation or public admission", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ004ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice004Implementation");
});
