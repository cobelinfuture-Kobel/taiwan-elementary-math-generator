import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q010-g3a-u05-right-angle-recognition-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
];

test("P05F W5 Q010 frozen queue identity remains exact and Q009 D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[9];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 10);
  assert.equal(slice.sliceId, "p05e_q010_r1_g3a_u05_3a05_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice010Implementation");
  assert.equal(slice.previousSliceId, "p05e_q009_r0_g5b_u10_5b10a_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g3a_u05_3a05");
  assert.equal(slice.intraWavePrerequisiteRank, 1);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_property");
  assert.deepEqual(slice.knowledgePointIds, ["kp_right_angle_recognition"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "f80ccf7d77d2d2c076554506a63c5701f6b2d909");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34013051969");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "34013051958");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "9983068926");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:c08ecbde522100d5dc6d78e9919bb9c97975142e5ffd0d217dd35b67a1ab9642");
  assert.equal(preflight.previousSliceD0Evidence.postMergeTriggerEvent, "push");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q010 locks the current Drive PDF identity and full-page visual source authority", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g3a_u05_3a05");
  assert.equal(preflight.sourceAuthority.sourceTitle, "角與形狀");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_3a05_angles.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1SqfJ5IqI4lCeDGMA5TNhTd0MNw4BAe6K");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1J8_Wr7DfKC3dD9f-AdgJxxHGw-GAJI4o");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "1yr0uwYGMdUkYF5DQ_laE5BloO8Bb2LUW");
  assert.equal(preflight.sourceAuthority.sourceUrlFromMetadata, "https://meow911.com/3a05/");
  assert.equal(preflight.sourceAuthority.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1]);
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.targetPanel, "MIDDLE_LEFT_RIGHT_ANGLE_RECOGNITION");
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.panelTitle, "認識直角");
  assert.deepEqual(preflight.sourceAuthority.page1DirectEvidence.visibleStatements, [
    "三角板這個位置的夾角叫作直角",
    "紅色線是直角符號",
  ]);
  assert.deepEqual(preflight.sourceAuthority.page1DirectEvidence.directlySupportedConcepts, [
    "RIGHT_ANGLE_RECOGNITION_USING_SET_SQUARE_MODEL",
    "RIGHT_ANGLE_SYMBOL_MARKER",
  ]);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceTitleNormalizationObserved, true);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.conflictingSourceRefObservedInReviewedAuthorities, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.metadataManualReviewed, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.metadataExtractionStatus, "pending");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.verificationNotesStatus, "pending");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q010 locks the exact R02 right-angle-recognition candidate and excludes sibling source candidates", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g3a_u05_3a05");
  assert.ok(source);
  assert.equal(source.sourceTitle, "角與形狀");
  assert.equal(source.sourcePdfTitle, "meow911_3a05_angles.pdf");
  assert.equal(source.pageCount, 1);
  assert.deepEqual(source.reviewedPages, [1]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === "kp_right_angle_recognition");
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "直角辨識");
  assert.equal(candidate.capabilityStatement, "學生能以直角模型辨認圖形中的直角。");
  assert.equal(candidate.reasoningInvariant, "直角的開口大小固定，與邊長及旋轉方向無關。");
  assert.equal(candidate.category, "geometry");
  assert.deepEqual(candidate.evidencePages, [1]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  assert.equal(preflight.r02ReviewedCandidateAuthority.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement, candidate.capabilityStatement);
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant, candidate.reasoningInvariant);

  for (const forbiddenKp of [
    "kp_angle_parts_identification",
    "kp_acute_obtuse_angle_qualitative_classification",
    "kp_rectangle_square_right_angle_properties",
  ]) {
    assert.ok(preflight.q010ScopeLock.excludedKnowledgePointIdsFromSameSource.includes(forbiddenKp));
  }
});

test("P05F W5 Q010 reconciles direct PDF evidence with the R02 rotation/side-length invariant without admitting numeric degree measure", () => {
  const reconciliation = preflight.sourceConstraintReconciliation;
  assert.equal(reconciliation.directPdfSupportsR02KnowledgePointIdentity, true);
  assert.equal(reconciliation.directPdfSupportsSetSquareRightAngleModel, true);
  assert.equal(reconciliation.directPdfSupportsRightAngleSymbolMarker, true);
  assert.equal(reconciliation.rotationIndependenceExplicitlyStatedInTargetPanel, false);
  assert.equal(reconciliation.rotationIndependenceAuthority, "R02_REVIEWED_CANDIDATE_REASONING_INVARIANT");
  assert.equal(reconciliation.sideLengthIndependenceExplicitlyStatedInTargetPanel, false);
  assert.equal(reconciliation.sideLengthIndependenceAuthority, "R02_REVIEWED_CANDIDATE_REASONING_INVARIANT");
  assert.equal(reconciliation.numeric90DegreeTerminologyAppearsElsewhereOnPage, true);
  assert.equal(reconciliation.numeric90DegreeMeasureAllowedByThisPreflight, false);
});

test("P05F W5 Q010 locks right-angle recognition only and preserves Q001 plus future same-source semantics", () => {
  assert.deepEqual(preflight.q010ScopeLock.includedRelations, [
    "RECOGNIZE_RIGHT_ANGLE_FROM_DIAGRAM",
    "IDENTIFY_RIGHT_ANGLE_SYMBOL",
  ]);
  assert.deepEqual(preflight.q010ScopeLock.permittedDiagramVariationInvariants, [
    "ROTATION_INVARIANT_RIGHT_ANGLE_OPENING",
    "SIDE_LENGTH_INVARIANT_RIGHT_ANGLE_OPENING",
  ]);
  assert.deepEqual(preflight.q010ScopeLock.protectedExistingSameSourceKnowledgePointIds, [
    "kp_angle_parts_identification",
  ]);
  for (const relation of [
    "IDENTIFY_ANGLE_PARTS",
    "COMPARE_ANGLE_SIZE",
    "CLASSIFY_ACUTE_RIGHT_OBTUSE",
    "COUNT_QUADRILATERAL_ANGLES",
    "RECTANGLE_SQUARE_PROPERTY_REASONING",
    "ANGLE_MEASURE_NUMERIC",
    "ANGLE_CONSTRUCTION",
    "APPLICATION_CONTEXT",
  ]) {
    assert.ok(preflight.q010ScopeLock.excludedRelations.includes(relation));
  }
  assert.equal(preflight.q010ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q010ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q010ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q010ScopeLock.q001SameSourceProductSemanticsTouched, false);
  assert.equal(preflight.q010ScopeLock.q011OrLaterTouched, false);
});

test("P05F W5 Q010 preserves the frozen geometry-property runtime profile and exact capability closure", () => {
  const mapping = getR04KnowledgePointCapabilityMapping("kp_right_angle_recognition");
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_property");
  assert.equal(mapping.classificationRuleId, "rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds, []);

  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_geometry_property");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_geometry_property_reasoning",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
  ]);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, []);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
  assert.equal(runtime.r02CandidateCategory, "geometry");
  assert.equal(runtime.frozenProfileClassificationRule, "rule_geometry_property");
  assert.equal(runtime.profileCategoryMismatchAcknowledged, false);
  assert.equal(runtime.profileCategoryMismatchDisposition, "NONE");
});

test("P05F W5 Q010 inherits the proven Q003-Q009 Q-specific post-merge evidence contract", () => {
  const policy = preflight.postMergeEvidenceTriggerPolicy;
  assert.equal(policy.effectiveFromQueuePosition, 3);
  assert.deepEqual(policy.provenPriorRunIds, [
    "33926418642",
    "33934940413",
    "33937587482",
    "33950114817",
    "33953512923",
    "34000572190",
    "34013051969",
  ]);
  assert.equal(policy.latestProvenRunId, "34013051969");
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

test("P05F W5 Q010 preflight permits implementation planning only and requires separate implementation approval", () => {
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ010ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLocked, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice010Implementation");
});
