import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q009-g5b-u10a-large-area-unit-identity-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];

test("P05F W5 Q009 frozen queue identity remains exact and Q008 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[8];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 9);
  assert.equal(slice.sliceId, "p05e_q009_r0_g5b_u10_5b10a_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice009Implementation");
  assert.equal(slice.previousSliceId, "p05e_q008_r0_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g5b_u10_5b10a");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.deepEqual(slice.knowledgePointIds, ["kp_g5b_u10a_large_area_unit_identity"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "80e6463ef66abbcafdeec4f4931f3536403a92a9");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34000572190");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "34000572146");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "9979367617");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:f37913df724483345f4b630e3f993465447337d1ba3a3af3653b642749a8cd23");
  assert.equal(preflight.previousSliceD0Evidence.postMergeTriggerEvent, "push");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q009 reuses current R02 full-page reviewed authority while stale Drive review metadata remains non-authoritative", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g5b_u10_5b10a");
  assert.equal(preflight.sourceAuthority.sourceTitle, "生活中的大單位");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_5b10a_source.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1pCtllVtZRsUAO4WFCqJlgMOMk_QNA5X8");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1Edjv6m2SkPhpuQTPaXmr5py77vyAZmXa");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "1ommruKq16k7kjn2B3fnFncGeIxUqqQ-p");
  assert.equal(preflight.sourceAuthority.sourceUrlFromMetadata, "https://meow911.com/5b10a/");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1]);
  assert.equal(preflight.sourceAuthority.reviewMethod, "R02_FULL_PAGE_VISUAL_READBACK_REUSE");
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.conflictingSourceRefObservedInReviewedAuthorities, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.metadataManualReviewed, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.metadataExtractionStatus, "pending");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.verificationNotesStatus, "pending");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q009 locks the exact R02 large-area-unit identity candidate and no sibling candidate", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g5b_u10_5b10a");
  assert.ok(source);
  assert.equal(source.sourceTitle, "生活中的大單位");
  assert.equal(source.sourcePdfTitle, "meow911_5b10a_source.pdf");
  assert.equal(source.pageCount, 1);
  assert.deepEqual(source.reviewedPages, [1]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === "kp_g5b_u10a_large_area_unit_identity");
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "公畝公頃平方公里辨識");
  assert.equal(candidate.capabilityStatement, "學生能選擇並辨認表示土地或地區面積的大單位。");
  assert.equal(candidate.reasoningInvariant, "單位選擇須符合面積尺度，不能與長度單位混用。");
  assert.equal(candidate.category, "measurement");
  assert.deepEqual(candidate.evidencePages, [1]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  assert.equal(preflight.r02ReviewedCandidateAuthority.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement, candidate.capabilityStatement);
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant, candidate.reasoningInvariant);

  for (const forbiddenKp of [
    "kp_g5b_u10a_hectare_square_meter_conversion",
    "kp_g5b_u10a_square_kilometer_hectare_conversion",
    "kp_g5b_u10a_metric_ton_kilogram_conversion",
    "kp_g5b_u10a_large_unit_estimation_application",
  ]) {
    assert.ok(preflight.q009ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }
});

test("P05F W5 Q009 locks recognition/scale-fit semantics and excludes conversions, formula arithmetic, estimation application, and Q010+", () => {
  assert.deepEqual(preflight.q009ScopeLock.includedRelations, [
    "RECOGNIZE_ARE_HECTARE_SQUARE_KILOMETER_AS_AREA_UNITS",
    "SELECT_LARGE_AREA_UNIT_BY_LAND_OR_REGION_SCALE",
    "DISTINGUISH_LARGE_AREA_UNIT_FROM_LENGTH_UNIT",
  ]);
  for (const relation of [
    "HECTARE_SQUARE_METER_CONVERSION",
    "SQUARE_KILOMETER_HECTARE_CONVERSION",
    "METRIC_TON_KILOGRAM_CONVERSION",
    "LARGE_UNIT_ESTIMATION_APPLICATION",
    "AREA_UNIT_CONVERSION_ARITHMETIC",
    "AREA_FORMULA_CALCULATION",
    "APPLICATION_CONTEXT",
  ]) {
    assert.ok(preflight.q009ScopeLock.excludedRelations.includes(relation));
  }
  assert.equal(preflight.q009ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q009ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q009ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q009ScopeLock.q010OrLaterTouched, false);
});

test("P05F W5 Q009 preserves the frozen geometry-formula profile and exact dependency closure despite R02 measurement category", () => {
  const mapping = getR04KnowledgePointCapabilityMapping("kp_g5b_u10a_large_area_unit_identity");
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
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, [
    "cap_geometry_property_reasoning",
  ]);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
  assert.equal(runtime.r02CandidateCategory, "measurement");
  assert.equal(runtime.profileCategoryMismatchAcknowledged, true);
  assert.equal(runtime.profileCategoryMismatchDisposition, "PRESERVE_FROZEN_QUEUE_PROFILE_NO_RECLASSIFICATION_DURING_PREFLIGHT");
});

test("P05F W5 Q009 inherits the proven Q003-Q008 Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.deepEqual(policy.provenPriorRunIds, [
    "33926418642",
    "33934940413",
    "33937587482",
    "33950114817",
    "33953512923",
    "34000572190",
  ]);
  assert.equal(policy.latestProvenRunId, "34000572190");
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

test("P05F W5 Q009 preflight permits implementation planning only and requires separate implementation approval", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ009ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLocked, true);
  assert.equal(preflight.preflightDecision.frozenProfileCategoryMismatchAcknowledged, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice009Implementation");
});
