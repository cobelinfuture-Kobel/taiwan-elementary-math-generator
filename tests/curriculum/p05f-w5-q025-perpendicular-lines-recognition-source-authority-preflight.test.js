import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const preflight = readJson("data/curriculum/full-product/p05f/q025-g4b-u02-perpendicular-lines-recognition-source-authority-preflight.json");
const q004 = readJson("data/curriculum/full-product/p05f/q004-g4b-u02-parallel-lines-recognition-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const KP = "kp_g4b_u02_perpendicular_lines_recognition";
const REQUIRED_W5 = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
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

test("Q025 preflight binds the exact frozen queue-position-25 row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueFrozen, true);
  const row = queue.queueEntries.find((entry) => entry.queuePosition === 25);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q025_r2_g4b_u02_4b02_profile_geometry_property_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice025Implementation");
  assert.equal(row.previousSliceId, "p05e_q024_r2_g4a_u05_4a05_profile_geometry_property_c1");
  assert.equal(row.previousSliceMustBeD0Complete, true);
  assert.equal(row.assignedDeliveryWaveId, "R05-W5");
  assert.equal(row.primarySourceNodeId, "g4b_u02_4b02");
  assert.deepEqual(row.supportingSourceNodeIds, ["g4b_u02_4b02"]);
  assert.equal(row.intraWavePrerequisiteRank, 2);
  assert.equal(row.primaryRuntimeProfileId, "profile_geometry_property");
  assert.equal(row.chunkIndex, 1);
  assert.equal(row.knowledgePointCount, 1);
  assert.deepEqual(row.knowledgePointIds, [KP]);
  assert.deepEqual([...row.requiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.equal(row.targetEvidenceLevel, "E6_D0_COMPLETE");
  assert.deepEqual(row.requiredProductNodes, REQUIRED_PRODUCT_NODES);
  assert.equal(row.admissionState, "QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED");
  assert.equal(row.productProductionAdmitted, false);
  assert.equal(row.implementationAllowedByP05E, false);
  assert.equal(preflight.queueAuthority.queueVersion, queue.derivedRegistrySnapshot.queueVersion);
  assert.equal(preflight.queueAuthority.queueDigest, queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, row.knowledgePointIds);
});

test("Q025 binds the exact R02 perpendicular-lines candidate and protects all sibling semantics", () => {
  const source = r02.sourceRecords.find((entry) => entry.sourceNodeId === "g4b_u02_4b02");
  assert.ok(source);
  assert.equal(source.sourceTitle, "垂直平行與四邊形");
  assert.equal(source.sourcePdfTitle, "meow911_4b02_source.pdf");
  assert.equal(source.pageCount, 2);
  assert.deepEqual(source.reviewedPages, [1, 2]);
  const candidate = source.candidates.find((row) => row.knowledgePointId === KP);
  assert.ok(candidate);
  assert.equal(preflight.r02ReviewedCandidateAuthority.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement, candidate.capabilityStatement);
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant, candidate.reasoningInvariant);
  assert.equal(preflight.r02ReviewedCandidateAuthority.category, "geometry");
  assert.equal(preflight.r02ReviewedCandidateAuthority.applicationSuitability, "APPLICATION_COMPATIBLE");
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds, source.candidates.map((row) => row.knowledgePointId));
  assert.equal(preflight.q025ScopeLock.rightAngleIntersectionDeterminesPerpendicularity, true);
  assert.equal(preflight.q025ScopeLock.segmentLengthDoesNotChangePerpendicularity, true);
  assert.deepEqual(preflight.q025ScopeLock.protectedExistingSameSourceKnowledgePointIds, ["kp_g4b_u02_parallel_lines_recognition"]);
  for (const id of [
    "kp_g4b_u02_parallel_lines_recognition",
    "kp_g4b_u02_parallel_distance_construction",
    "kp_g4b_u02_quadrilateral_classification",
    "kp_g4b_u02_quadrilateral_inclusion_relation",
  ]) assert.ok(preflight.q025ScopeLock.excludedSameSourceKnowledgePointIds.includes(id), id);
});

test("Q025 reuses Q004 same-source identity without inventing a new source reference", () => {
  assert.equal(q004.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(q004.sourceAuthority.sourceNodeId, preflight.sourceAuthority.sourceNodeId);
  assert.equal(q004.sourceAuthority.sourcePdfTitle, preflight.sourceAuthority.sourcePdfTitle);
  assert.equal(q004.sourceAuthority.sourcePdfDriveFileId, preflight.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(q004.sourceAuthority.sourceMetadataDriveFileId, preflight.sourceAuthority.sourceMetadataDriveFileId);
  assert.equal(q004.sourceAuthority.verificationNotesDriveFileId, preflight.sourceAuthority.verificationNotesDriveFileId);
  assert.equal(q004.sourceAuthority.sourceUrlFromMetadata, preflight.sourceAuthority.sourceUrlFromMetadata);
  assert.equal(q004.sourceAuthority.embeddedHeaderUrlFromDriveText, preflight.sourceAuthority.embeddedHeaderUrlFromPriorSourceReadback);
  assert.equal(q004.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceIdentityAnomaly, false);
});

test("Q025 binds current R04 geometry-property mapping and exact contract-only subset", () => {
  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  const mapping = r04.getMapping(KP);
  assert.ok(mapping);
  assert.equal(mapping.mappingId, preflight.runtimeCapabilityAuthority.mappingId);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_property");
  assert.equal(mapping.classificationRuleId, "rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds, []);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds, preflight.runtimeCapabilityAuthority.requiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds, ["cap_geometry_construction"]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds, []);
  assert.equal(mapping.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
  assert.deepEqual([...mapping.undeliveredRequiredCapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.deepEqual([...preflight.runtimeCapabilityAuthority.contractOnlyRequiredCapabilityIdsFromCurrentR04].sort(), [...REQUIRED_W5].sort());
  assert.deepEqual([...preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.equal(preflight.runtimeCapabilityAuthority.r02CategoryAlignedWithFrozenProfile, true);
  assert.equal(preflight.runtimeCapabilityAuthority.r04AuthorityTouched, false);
});

test("Q025 prior-slice evidence is pinned to the repaired Q024 E6 D0 acceptance", () => {
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber, 878);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "2e228def835e8a8c3b1581769de92868b3b5a7d2");
  assert.equal(preflight.previousSliceD0Evidence.samplingRepairPrNumber, 879);
  assert.equal(preflight.previousSliceD0Evidence.samplingRepairMergeSha, "344dc75608948bcee2e84be736ddc3c65f13b333");
  assert.equal(preflight.previousSliceD0Evidence.triggerRepairPrNumber, 880);
  assert.equal(preflight.previousSliceD0Evidence.finalAcceptanceMergeSha, "7591c3343f11aa7b115ac519a39823ed6694de57");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "34489781907");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34489782013");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "10157243610");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:beb618563ed05513381a433313cbcfada3ef837ab9bb26d27c42021aa4c4e945");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesWorkflowConclusion, "success");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentConclusion, "success");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesEvidenceUploaded, true);
});

test("Q025 remains preflight-only and forbids sibling, construction, application, and Q026+ expansion", () => {
  assert.deepEqual(preflight.q025ScopeLock.includedKnowledgePointIds, [KP]);
  for (const relation of [
    "PARALLEL_LINES_RECOGNITION_AS_TARGET_KP",
    "PARALLEL_DISTANCE_MEASUREMENT",
    "PARALLEL_LINE_CONSTRUCTION",
    "QUADRILATERAL_CLASSIFICATION",
    "QUADRILATERAL_INCLUSION_RELATION",
    "NUMERIC_ANGLE_MEASUREMENT",
    "GEOMETRY_CONSTRUCTION",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "Q026_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q025ScopeLock.excludedRelations.includes(relation), relation);
  assert.equal(preflight.q025ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q025ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q025ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q025ScopeLock.frozenQueueAuthorityTouched, false);
  assert.equal(preflight.q025ScopeLock.r04AuthorityTouched, false);
  assert.equal(preflight.q025ScopeLock.q026OrLaterTouched, false);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed, false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice025Implementation");
});
