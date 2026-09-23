import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q008-g5a-u10a1-cube-cuboid-faces-edges-vertices-source-authority-preflight.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
];

test("P05F W5 Q008 frozen queue identity remains exact and Q007 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[7];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 8);
  assert.equal(slice.sliceId, "p05e_q008_r0_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice008Implementation");
  assert.equal(slice.previousSliceId, "p05e_q007_r0_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g5a_u10_5a10a1");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.deepEqual(slice.knowledgePointIds, ["kp_g5a_u10a1_cube_cuboid_faces_edges_vertices"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "0b978af92e463785b6cce6ddc614e260b9ccde18");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "33953512923");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "33953512905");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "9965609917");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:6078271f601714ae1806572f2692f689627e58239fe3d33149a80d8a703afd35");
  assert.equal(preflight.previousSliceD0Evidence.postMergeTriggerEvent, "push");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q008 reuses current R02 full-page reviewed authority and preserves the 5a10a1/5a10b URL anomaly without source ambiguity", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g5a_u10_5a10a1");
  assert.equal(preflight.sourceAuthority.sourceTitle, "正方體和長方體");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_5a10a1_source.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1LVpCn7I1t17SpWbwCXLfHjghTBQ7lwL5");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "12paKtt2_iSSyIPjRvmfM9R1NTT3w7YIs");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "15FkOhd4GwDZ9GRSQzW121WYhx183mhkM");
  assert.equal(preflight.sourceAuthority.reviewMethod, "R02_FULL_PAGE_VISUAL_READBACK_REUSE");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(preflight.sourceAuthority.sourceUrlFromMetadata, "https://meow911.com/5a10a1/");
  assert.equal(preflight.sourceAuthority.embeddedHeaderUrlFromDriveText, "https://meow911.com/5a10b/");
  assert.equal(
    preflight.sourceAuthority.sourceIdentityAnomaly.disposition,
    "NON_BLOCKING_EMBEDDED_URL_ALIAS_MATCHING_TITLE_FILE_AND_R02_SOURCE_IDENTITY",
  );
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q008 locks only cube/cuboid faces-edges-vertices authority from G5A-U10a1", () => {
  const authority = preflight.r02ReviewedCandidateAuthority;
  assert.equal(authority.chunkPath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
  assert.equal(authority.knowledgePointId, "kp_g5a_u10a1_cube_cuboid_faces_edges_vertices");
  assert.equal(authority.canonicalNameZh, "正方體長方體構成要素");
  assert.equal(authority.capabilityStatement, "學生能辨認正方體、長方體的面、稜與頂點。");
  assert.equal(authority.reasoningInvariant, "兩者均有6面、12稜、8頂點，面與稜的形狀長度條件不同。");
  assert.equal(authority.applicationSuitability, "APPLICATION_COMPATIBLE");

  for (const forbiddenKp of [
    "kp_g5a_u10a1_cube_cuboid_face_relationship",
    "kp_g5a_u10a1_cube_cuboid_net",
    "kp_g5a_u10a1_cube_cuboid_edge_length",
    "kp_g5a_u10a1_cube_cuboid_spatial_reasoning",
  ]) {
    assert.ok(preflight.q008ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }

  assert.deepEqual(preflight.q008ScopeLock.includedRelations, [
    "IDENTIFY_CUBE_CUBOID_FACES_EDGES_VERTICES",
    "RECOGNIZE_CUBE_CUBOID_FIXED_ELEMENT_COUNTS",
    "DISTINGUISH_CUBE_CUBOID_ELEMENT_STRUCTURE",
  ]);
  assert.equal(preflight.q008ScopeLock.requiresSolidGeometryRepresentation, true);
  assert.equal(preflight.q008ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q008ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q008ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
});

test("P05F W5 Q008 locks the spatial-solid runtime profile and exact W5 capability closure", () => {
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

test("P05F W5 Q008 inherits the proven Q003-Q007 Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.deepEqual(policy.provenPriorRunIds, [
    "33926418642",
    "33934940413",
    "33937587482",
    "33950114817",
    "33953512923",
  ]);
  assert.equal(policy.latestProvenRunId, "33953512923");
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

test("P05F W5 Q008 preflight permits planning but not implementation or public admission", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ008ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLocked, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.sourceIdentityAnomalyAcknowledged, true);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice008Implementation");
});
