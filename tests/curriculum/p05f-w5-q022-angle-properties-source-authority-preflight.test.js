import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const preflight = readJson("data/curriculum/full-product/p05f/q022-g3a-u05-angle-properties-source-authority-preflight.json");
const q010 = readJson("data/curriculum/full-product/p05f/q010-g3a-u05-right-angle-recognition-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const TARGET_KPS = [
  "kp_acute_obtuse_angle_qualitative_classification",
  "kp_rectangle_square_right_angle_properties",
];
const FROZEN_W5_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
];
const R04_REQUIRED_CAPS = [
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_property_reasoning",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation",
];
const REQUIRED_PRODUCT_NODES = [
  "SOURCE_EVIDENCE",
  "KNOWLEDGE_POINT_IDENTITY",
  "TAG_REGISTRY_BINDING",
  "FORMAL_MAPPING",
  "PATTERN_SPEC",
  "SHARED_GENERATOR_BINDING",
  "DETERMINISTIC_VALIDATOR_BINDING",
  "PUBLIC_SOURCE_ADAPTER",
  "PUBLIC_UI_SELECTION",
  "WORKSHEET_AND_ANSWER_KEY",
  "PRODUCTION_HTML",
  "CHROMIUM_PDF_AND_PRINT",
  "PRODUCT_ADMISSION_CLAIM",
];

test("Q022 preflight binds the exact frozen queue-position-22 row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueFrozen, true);
  const row = queue.queueEntries.find((entry) => entry.queuePosition === 22);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q022_r2_g3a_u05_3a05_profile_geometry_property_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice022Implementation");
  assert.equal(row.previousSliceId, "p05e_q021_r1_g5b_u10_5b10a_profile_geometry_formula_c1");
  assert.equal(row.primarySourceNodeId, "g3a_u05_3a05");
  assert.deepEqual(row.supportingSourceNodeIds, ["g3a_u05_3a05"]);
  assert.equal(row.primaryRuntimeProfileId, "profile_geometry_property");
  assert.equal(row.intraWavePrerequisiteRank, 2);
  assert.equal(row.chunkIndex, 1);
  assert.equal(row.knowledgePointCount, 2);
  assert.deepEqual(row.knowledgePointIds, TARGET_KPS);
  assert.deepEqual([...row.requiredW5CapabilityIds].sort(), [...FROZEN_W5_CAPS].sort());
  assert.equal(row.targetEvidenceLevel, "E6_D0_COMPLETE");
  assert.deepEqual(row.requiredProductNodes, REQUIRED_PRODUCT_NODES);
  assert.equal(preflight.queueAuthority.queueVersion, queue.derivedRegistrySnapshot.queueVersion);
  assert.equal(preflight.queueAuthority.queueDigest, queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.supportingSourceNodeIds, row.supportingSourceNodeIds);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, row.knowledgePointIds);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, row.requiredW5CapabilityIds);
  assert.equal(preflight.queueAuthority.targetEvidenceLevel, row.targetEvidenceLevel);
  assert.deepEqual(preflight.queueAuthority.requiredProductNodes, row.requiredProductNodes);
});

test("Q022 preflight binds exact R02 reviewed candidates and protects same-source prior targets", () => {
  const source = r02.sourceRecords.find((entry) => entry.sourceNodeId === "g3a_u05_3a05");
  assert.ok(source);
  assert.equal(source.sourceTitle, "角與形狀");
  assert.equal(source.sourcePdfTitle, "meow911_3a05_angles.pdf");
  assert.equal(source.pageCount, 1);
  assert.deepEqual(source.reviewedPages, [1]);
  const expected = new Map(preflight.r02ReviewedCandidateAuthority.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  for (const id of TARGET_KPS) {
    const candidate = source.candidates.find((row) => row.knowledgePointId === id);
    assert.ok(candidate, id);
    const bound = expected.get(id);
    assert.ok(bound, id);
    assert.equal(bound.canonicalNameZh, candidate.canonicalNameZh);
    assert.equal(bound.capabilityStatement, candidate.capabilityStatement);
    assert.equal(bound.reasoningInvariant, candidate.reasoningInvariant);
    assert.equal(bound.category, "geometry");
    assert.deepEqual(bound.evidencePages, [1]);
    assert.equal(bound.applicationSuitability, "APPLICATION_COMPATIBLE");
  }
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds, source.candidates.map((row) => row.knowledgePointId));
  assert.deepEqual(preflight.q022ScopeLock.excludedSameSourceKnowledgePointIds, ["kp_angle_parts_identification", "kp_right_angle_recognition"]);
  assert.equal(preflight.sourceConstraintReconciliation.priorSameSourceKnowledgePointAbsorption, false);
  assert.equal(preflight.sourceConstraintReconciliation.rightAngleRecognitionUsedAsBenchmarkOnly, true);
});

test("Q022 reuses the already-reviewed Q010 source identity without creating a new source ambiguity", () => {
  assert.equal(q010.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(q010.sourceAuthority.sourceNodeId, preflight.sourceAuthority.sourceNodeId);
  assert.equal(q010.sourceAuthority.sourcePdfTitle, preflight.sourceAuthority.sourcePdfTitle);
  assert.equal(q010.sourceAuthority.sourcePdfDriveFileId, preflight.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(q010.sourceAuthority.sourceMetadataDriveFileId, preflight.sourceAuthority.sourceMetadataDriveFileId);
  assert.equal(q010.sourceAuthority.verificationNotesDriveFileId, preflight.sourceAuthority.verificationNotesDriveFileId);
  assert.equal(q010.sourceAuthority.sourceUrlFromMetadata, preflight.sourceAuthority.sourceUrlFromMetadata);
  assert.equal(q010.sourceAuthority.pageCount, 1);
  assert.deepEqual(q010.sourceAuthority.reviewedPages, [1]);
  assert.equal(q010.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.disposition, "MATCHING_SOURCE_ID_FILE_AND_URL_WITH_NON_BLOCKING_TITLE_NORMALIZATION");
  assert.deepEqual(preflight.sourceAuthority.page1DirectEvidence.targetPanelLabels, ["ACUTE_OBTUSE_QUALITATIVE_CLASSIFICATION", "RECTANGLE_SQUARE_SIDES_AND_ANGLES"]);
  assert.ok(q010.sourceAuthority.page1DirectEvidence.samePagePanelsExplicitlyOutsideQ010.includes("ACUTE_OBTUSE_QUALITATIVE_CLASSIFICATION"));
  assert.ok(q010.sourceAuthority.page1DirectEvidence.samePagePanelsExplicitlyOutsideQ010.includes("RECTANGLE_SQUARE_SIDES_AND_ANGLES"));
});

test("Q022 binds current R04 geometry-property mappings and distinguishes the frozen W5 contract-only subset", () => {
  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  for (const id of TARGET_KPS) {
    const mapping = r04.getMapping(id);
    assert.ok(mapping, id);
    assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_property");
    assert.equal(mapping.classificationRuleId, "rule_geometry_property");
    assert.deepEqual(mapping.appliedModifierIds, []);
    assert.deepEqual(mapping.requiredRuntimeCapabilityIds, R04_REQUIRED_CAPS);
    assert.deepEqual(mapping.optionalRuntimeCapabilityIds, ["cap_geometry_construction"]);
    assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds, []);
    assert.equal(mapping.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
    assert.deepEqual([...mapping.undeliveredRequiredCapabilityIds].sort(), [...FROZEN_W5_CAPS].sort());
    for (const capabilityId of FROZEN_W5_CAPS) assert.ok(mapping.requiredRuntimeCapabilityIds.includes(capabilityId), capabilityId);
    assert.ok(mapping.requiredRuntimeCapabilityIds.length > FROZEN_W5_CAPS.length);
  }
  assert.equal(preflight.runtimeCapabilityAuthority.profileId, "profile_geometry_property");
  assert.equal(preflight.runtimeCapabilityAuthority.classificationRuleId, "rule_geometry_property");
  assert.deepEqual(preflight.runtimeCapabilityAuthority.appliedModifierIds, []);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.exactR04RequiredRuntimeCapabilityIds, R04_REQUIRED_CAPS);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.optionalRuntimeCapabilityIds, ["cap_geometry_construction"]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.forbiddenRuntimeCapabilityIds, []);
  assert.equal(preflight.runtimeCapabilityAuthority.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
  assert.deepEqual([...preflight.runtimeCapabilityAuthority.undeliveredRequiredCapabilityIds].sort(), [...FROZEN_W5_CAPS].sort());
  assert.deepEqual([...preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds].sort(), [...FROZEN_W5_CAPS].sort());
  assert.equal(preflight.runtimeCapabilityAuthority.frozenW5CapabilityInterpretation, "CONTRACT_ONLY_UNDELIVERED_SUBSET_OF_R04_REQUIRED_RUNTIME_CAPABILITIES");
  assert.equal(preflight.runtimeCapabilityAuthority.r02CandidateCategory, "geometry");
  assert.equal(preflight.runtimeCapabilityAuthority.r02CategoryAlignedWithFrozenProfile, true);
  assert.equal(preflight.runtimeCapabilityAuthority.profileCategoryMismatchAcknowledged, false);
});

test("Q022 prior-slice D0 evidence is exact and preflight remains non-implementation", () => {
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber, 872);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "ab767a7dd0fd618f0abe5706066b1975f23e422e");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId, "34449919612");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "34450071953");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34450071910");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "10141206658");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:4b74593cb588f5e671faf425c85a4ba9aaa80060c2c76b73c5b9a436d8a4ff01");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesWorkflowConclusion, "success");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesEvidenceUploaded, true);
  assert.equal(preflight.q022ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q022ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q022ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.preflightValidationBoundary.productImplementationAllowed, false);
  assert.equal(preflight.preflightValidationBoundary.publicProductAdmissionAllowed, false);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed, false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice022Implementation");
});

test("Q022 scope lock forbids semantic expansion beyond the two frozen geometry-property KPs", () => {
  assert.deepEqual(preflight.q022ScopeLock.includedKnowledgePointIds, TARGET_KPS);
  for (const relation of [
    "ANGLE_PARTS_IDENTIFICATION_AS_TARGET_KP",
    "RIGHT_ANGLE_RECOGNITION_AS_TARGET_KP",
    "NUMERIC_ANGLE_MEASUREMENT",
    "PROTRACTOR_MEASUREMENT",
    "ANGLE_CONSTRUCTION",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "Q023_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q022ScopeLock.excludedRelations.includes(relation), relation);
  assert.equal(preflight.sourceConstraintReconciliation.numericDegreeMeasurementExpansion, false);
  assert.equal(preflight.sourceConstraintReconciliation.protractorMeasurementExpansion, false);
  assert.equal(preflight.sourceConstraintReconciliation.angleConstructionExpansion, false);
  assert.equal(preflight.sourceConstraintReconciliation.applicationImplementationAllowed, false);
  assert.equal(preflight.q022ScopeLock.frozenQueueAuthorityTouched, false);
  assert.equal(preflight.q022ScopeLock.q023OrLaterTouched, false);
});
