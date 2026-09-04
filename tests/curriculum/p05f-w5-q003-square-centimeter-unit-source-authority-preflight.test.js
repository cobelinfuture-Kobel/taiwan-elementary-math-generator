import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q003-g3b-u05-square-centimeter-unit-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
];
const EXPECTED_EXCLUDED_SIBLINGS = [
  "kp_area_grid_counting",
  "kp_area_conservation_cut_rearrange",
  "kp_irregular_grid_area",
  "kp_area_compare_same_perimeter",
];

function r02SourceRecord() {
  return r02.sourceRecords.find((row) => row.sourceNodeId === "g3b_u05_3b05");
}

function r02TargetCandidate() {
  return r02SourceRecord()?.candidates.find((row) => row.knowledgePointId === "kp_area_square_centimeter_unit");
}

test("P05F W5 Q003 frozen queue identity remains exact and Q002 D0 evidence is recorded", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[2];

  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistry?.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.equal(slice.queuePosition, 3);
  assert.equal(slice.sliceId, "p05e_q003_r0_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice003Implementation");
  assert.equal(slice.previousSliceId, "p05e_q002_r0_g3a_u09_3a09_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g3b_u05_3b05");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.deepEqual(slice.knowledgePointIds, ["kp_area_square_centimeter_unit"]);
  assert.deepEqual([...slice.requiredW5CapabilityIds].sort(), [...EXPECTED_CAPS].sort());

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "e7c35eb7779ed2881330b527227eb0ea45f09be7");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesDeploymentRunId, 33884662896);
  assert.equal(preflight.previousSliceD0Evidence.exactPostMergePagesE2ERunId, 33887577813);
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, 9942505386);
  assert.equal(
    preflight.previousSliceD0Evidence.evidenceArtifactDigest,
    "sha256:1d53e115a508763f1dd53677362f979111c0823f42f48ce22ff252755ee48460",
  );
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q003 source identity converges despite the cross-publisher source slug", () => {
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g3b_u05_3b05");
  assert.equal(preflight.sourceAuthority.sourceTitle, "面積與平方公分");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_3b05_cm2_area.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1JqksZyiKwD_cnZUN_zfmGlXwRpa_0w-8");
  assert.equal(preflight.sourceAuthority.pageCount, 1);
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1]);
  assert.equal(preflight.sourceAuthority.embeddedSourceUrl, "https://meow911.com/3a06/");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(
    preflight.sourceAuthority.sourceIdentityAnomaly.disposition,
    "RECORDED_NON_BLOCKING_CROSS_PUBLISHER_SOURCE_SLUG_MISMATCH",
  );
});

test("P05F W5 Q003 reconciles exactly to the R02 square-centimeter unit KnowledgePoint", () => {
  const source = r02SourceRecord();
  const candidate = r02TargetCandidate();

  assert.ok(source);
  assert.equal(source.sourceTitle, "面積與平方公分");
  assert.equal(source.sourcePdfTitle, "meow911_3b05_cm2_area.pdf");
  assert.equal(source.pageCount, 1);
  assert.deepEqual(source.reviewedPages, [1]);

  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "平方公分面積單位");
  assert.equal(candidate.capabilityStatement, "學生能理解邊長1公分正方形的面積是1平方公分。");
  assert.equal(candidate.reasoningInvariant, "面積單位由二維覆蓋單位形成，不等同於周長單位。");
  assert.equal(candidate.category, "geometry");
  assert.deepEqual(candidate.evidencePages, [1]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  assert.deepEqual(preflight.r02ReviewedCandidateAuthority, {
    manifestPath: "data/curriculum/global/candidates/r02/reviewed-source-candidate-pack.manifest.json",
    chunkPath: "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json",
    reviewMethod: "FULL_PAGE_VISUAL_READBACK",
    sourceNodeId: "g3b_u05_3b05",
    reviewedPages: [1],
    knowledgePointId: "kp_area_square_centimeter_unit",
    canonicalNameZh: candidate.canonicalNameZh,
    capabilityStatement: candidate.capabilityStatement,
    reasoningInvariant: candidate.reasoningInvariant,
    category: candidate.category,
    applicationSuitability: candidate.applicationSuitability,
  });
});

test("P05F W5 Q003 scope is limited to square-centimeter unit meaning and excludes sibling area KPs", () => {
  assert.deepEqual(preflight.sourceSiblingKnowledgePointsExcludedFromQ003, EXPECTED_EXCLUDED_SIBLINGS);
  assert.deepEqual(preflight.q003ScopeLock.includedRelations, [
    "RECOGNIZE_SQUARE_CENTIMETER_AS_AREA_UNIT",
    "IDENTIFY_ONE_SQUARE_CENTIMETER_AS_AREA_OF_ONE_CM_BY_ONE_CM_SQUARE",
    "MATCH_UNIT_SQUARE_REPRESENTATION_TO_ONE_SQUARE_CENTIMETER",
    "DISTINGUISH_AREA_UNIT_FROM_LINEAR_OR_PERIMETER_UNIT",
  ]);
  for (const relation of [
    "GRID_AREA_COUNTING",
    "AREA_CONSERVATION_CUT_REARRANGE",
    "IRREGULAR_GRID_AREA",
    "SAME_PERIMETER_AREA_COMPARISON",
    "RECTANGLE_SQUARE_AREA_FORMULA",
    "APPLICATION_CONTEXT",
  ]) {
    assert.ok(preflight.q003ScopeLock.excludedRelations.includes(relation), relation);
  }
  assert.equal(preflight.q003ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q003ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q003ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
});

test("P05F W5 Q003 locks automatic post-merge evidence to main push Q-specific paths without a second PR orchestrator", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.equal(policy.prStageOrchestrator, "PR_GATE_ONLY");
  assert.deepEqual(policy.allowedTriggerEvents, [
    "push_to_main_with_q_specific_paths",
    "workflow_dispatch_fallback",
  ]);
  assert.deepEqual(policy.forbiddenTriggerEvents, [
    "pull_request",
    "workflow_run_pages_fanout",
  ]);
  assert.equal(policy.workflowMaterializationDeferredUntilQ003ProductPathsExist, true);
  assert.equal(policy.secondPullRequestWorkflowAllowed, false);
  assert.ok(policy.qSpecificPathRule.includes("Q003-owned product paths"));
  assert.ok(policy.pagesSynchronizationRule.includes("SHA256"));
});

test("P05F W5 Q003 preflight remains planning-only and separately approval-gates implementation", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ003ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.postMergeTriggerPolicyLocked, true);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice003Implementation");
});
