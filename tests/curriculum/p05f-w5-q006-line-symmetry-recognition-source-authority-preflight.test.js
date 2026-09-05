import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q006-g5a-u07-line-symmetry-recognition-source-authority-preflight.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
];

test("P05F W5 Q006 frozen queue identity remains exact and Q005 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[5];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 6);
  assert.equal(slice.sliceId, "p05e_q006_r0_g5a_u07_5a07_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice006Implementation");
  assert.equal(slice.previousSliceId, "p05e_q005_r0_g4b_u10_4b10_profile_spatial_solid_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g5a_u07_5a07");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_property");
  assert.deepEqual(slice.knowledgePointIds, ["kp_g5a_u07_line_symmetry_recognition"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "4c25827b55d463892ff165f93227c2a6c82971e8");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "33937587482");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "33937587466");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "9960703026");
  assert.equal(preflight.previousSliceD0Evidence.postMergeTriggerEvent, "push");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q006 reuses current R02 full-page reviewed authority with matching 5a07 source identity", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g5a_u07_5a07");
  assert.equal(preflight.sourceAuthority.sourceTitle, "線對稱圖形");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_5a07_source.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1JPwhBQDMYUusVKd8mWFb1ZrO05-HFIQc");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1tcwVjjjRVwJr0mVOiacOTEzkaJiDYUMQ");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "1f_sRdp9ASamJbRAwdMnbW4FQo90vJXUB");
  assert.equal(preflight.sourceAuthority.reviewMethod, "R02_FULL_PAGE_VISUAL_READBACK_REUSE");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1]);
  assert.equal(preflight.sourceAuthority.sourceUrlFromMetadata, "https://meow911.com/5a07/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.disposition, "NONE_MATCHING_SOURCE_IDENTITY");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q006 locks only line-symmetry recognition from G5A-U07", () => {
  const authority = preflight.r02ReviewedCandidateAuthority;
  assert.equal(authority.chunkPath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
  assert.equal(authority.knowledgePointId, "kp_g5a_u07_line_symmetry_recognition");
  assert.equal(authority.canonicalNameZh, "線對稱圖形辨識");
  assert.equal(authority.capabilityStatement, "學生能判斷圖形是否能沿一直線摺合重疊。");
  assert.equal(authority.reasoningInvariant, "對稱線兩側對應部分形狀大小相同且方向相反。");
  assert.equal(authority.applicationSuitability, "APPLICATION_COMPATIBLE");

  for (const forbiddenKp of [
    "kp_g5a_u07_symmetry_axis_count",
    "kp_g5a_u07_symmetric_point_distance",
    "kp_g5a_u07_complete_symmetric_figure",
    "kp_g5a_u07_coordinate_reflection",
  ]) {
    assert.ok(preflight.q006ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }

  assert.deepEqual(preflight.q006ScopeLock.includedRelations, [
    "IDENTIFY_LINE_SYMMETRIC_FIGURE",
    "DISTINGUISH_LINE_SYMMETRIC_FROM_NON_SYMMETRIC_FIGURE",
    "RECOGNIZE_FOLD_OVERLAP_AS_LINE_SYMMETRY_CRITERION",
  ]);
  assert.equal(preflight.q006ScopeLock.requiresDiagramRepresentation, true);
  assert.equal(preflight.q006ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q006ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q006ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
});

test("P05F W5 Q006 locks the geometry-property runtime profile and exact W5 capability closure", () => {
  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_geometry_property");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_geometry_property_reasoning",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
  ]);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, []);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
});

test("P05F W5 Q006 inherits the Q003-Q005 proven main-push Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.deepEqual(policy.provenPriorRunIds, ["33926418642", "33934940413", "33937587482"]);
  assert.equal(policy.latestProvenRunId, "33937587482");
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

test("P05F W5 Q006 preflight permits planning but not implementation or public admission", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ006ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLocked, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice006Implementation");
});
