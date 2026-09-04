import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q003-g3b-u05-square-centimeter-area-unit-source-authority-preflight.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
];

test("P05F W5 Q003 frozen queue identity remains exact and Q002 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[2];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 3);
  assert.equal(slice.sliceId, "p05e_q003_r0_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice003Implementation");
  assert.equal(slice.previousSliceId, "p05e_q002_r0_g3a_u09_3a09_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g3b_u05_3b05");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.deepEqual(slice.knowledgePointIds, ["kp_area_square_centimeter_unit"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "e7c35eb7779ed2881330b527227eb0ea45f09be7");
  assert.equal(preflight.previousSliceD0Evidence.evidenceDefinitionMergeSha, "fb0b24399d13a20144f2e505397e02016f868d3f");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q003 reuses current R02 full-page reviewed authority and records Drive identity anomaly", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g3b_u05_3b05");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_3b05_cm2_area.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1JqksZyiKwD_cnZUN_zfmGlXwRpa_0w-8");
  assert.equal(preflight.sourceAuthority.reviewMethod, "R02_FULL_PAGE_VISUAL_READBACK_REUSE");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1]);
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.embeddedHeaderUrl, "https://meow911.com/3a06/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.metadataSourceUrl, "https://meow911.com/3b05/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q003 locks only the square-centimeter unit KP", () => {
  const authority = preflight.r02ReviewedCandidateAuthority;
  assert.equal(authority.knowledgePointId, "kp_area_square_centimeter_unit");
  assert.equal(authority.canonicalNameZh, "平方公分面積單位");
  assert.equal(authority.capabilityStatement, "學生能理解邊長1公分正方形的面積是1平方公分。");
  assert.equal(authority.reasoningInvariant, "面積單位由二維覆蓋單位形成，不等同於周長單位。");
  assert.equal(authority.applicationSuitability, "APPLICATION_COMPATIBLE");

  for (const forbiddenKp of [
    "kp_area_grid_counting",
    "kp_area_conservation_cut_rearrange",
    "kp_irregular_grid_area",
    "kp_area_compare_same_perimeter",
  ]) {
    assert.ok(preflight.q003ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }
  assert.equal(preflight.q003ScopeLock.requiresDiagramRepresentation, true);
  assert.equal(preflight.q003ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q003ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
});

test("P05F W5 Q003 preflight freezes W4-style event-driven post-merge evidence without adding a second PR trigger", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
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

test("P05F W5 Q003 preflight permits planning but not implementation or public admission", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ003ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice003Implementation");
});
