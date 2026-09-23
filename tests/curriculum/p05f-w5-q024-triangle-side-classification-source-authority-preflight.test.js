import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const preflight = readJson("data/curriculum/full-product/p05f/q024-g4a-u05-triangle-side-classification-source-authority-preflight.json");
const q013 = readJson("data/curriculum/full-product/p05f/q013-g4a-u05-triangle-elements-naming-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const KP = "kp_g4a_u05_triangle_side_classification";
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

test("Q024 preflight binds the exact frozen queue-position-24 row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueFrozen, true);
  const row = queue.queueEntries.find((entry) => entry.queuePosition === 24);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q024_r2_g4a_u05_4a05_profile_geometry_property_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice024Implementation");
  assert.equal(row.previousSliceId, "p05e_q023_r2_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(row.previousSliceMustBeD0Complete, true);
  assert.equal(row.assignedDeliveryWaveId, "R05-W5");
  assert.equal(row.primarySourceNodeId, "g4a_u05_4a05");
  assert.deepEqual(row.supportingSourceNodeIds, ["g4a_u05_4a05"]);
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

test("Q024 binds the exact R02 side-classification candidate and protects all sibling semantics", () => {
  const source = r02.sourceRecords.find((entry) => entry.sourceNodeId === "g4a_u05_4a05");
  assert.ok(source);
  assert.equal(source.sourceTitle, "三角形與全等");
  assert.equal(source.sourcePdfTitle, "meow911_4a05_source.pdf");
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
  assert.equal(preflight.q024ScopeLock.equalSideCountDeterminesClass, true);
  assert.equal(preflight.q024ScopeLock.rotationDoesNotChangeClass, true);
  assert.deepEqual(preflight.q024ScopeLock.protectedExistingSameSourceKnowledgePointIds, ["kp_g4a_u05_triangle_elements_naming"]);
  for (const id of ["kp_g4a_u05_triangle_elements_naming", "kp_g4a_u05_triangle_angle_classification", "kp_g4a_u05_triangle_inequality", "kp_g4a_u05_congruent_triangle_correspondence"]) assert.ok(preflight.q024ScopeLock.excludedSameSourceKnowledgePointIds.includes(id), id);
});

test("Q024 reuses Q013 same-source identity and preserves its known non-blocking metadata mismatch", () => {
  assert.equal(q013.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(q013.sourceAuthority.sourceNodeId, preflight.sourceAuthority.sourceNodeId);
  assert.equal(q013.sourceAuthority.sourcePdfTitle, preflight.sourceAuthority.sourcePdfTitle);
  assert.equal(q013.sourceAuthority.sourcePdfDriveFileId, preflight.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(q013.sourceAuthority.sourceMetadataDriveFileId, preflight.sourceAuthority.sourceMetadataDriveFileId);
  assert.equal(q013.sourceAuthority.verificationNotesDriveFileId, preflight.sourceAuthority.verificationNotesDriveFileId);
  assert.equal(q013.sourceAuthority.sourceUrlFromMetadata, preflight.sourceAuthority.sourceUrlFromMetadata);
  assert.equal(q013.sourceAuthority.embeddedHeaderUrlFromPdf, preflight.sourceAuthority.embeddedHeaderUrlFromPdf);
  assert.equal(q013.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.embeddedHeaderUrlMismatchObserved, true);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.metadataTitleVsR02TitleDifferenceObserved, true);
});

test("Q024 binds current R04 geometry-property mapping and exact contract-only subset", () => {
  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  const mapping = r04.getMapping(KP);
  assert.ok(mapping);
  assert.equal(mapping.mappingId, "r04map_g4a_u05_triangle_side_classification");
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

test("Q024 prior-slice evidence is pinned to Q023 D0 and preflight remains non-implementation", () => {
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber, 876);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "9dce5990719b1e8b76d0e6692602a2482e1a5eed");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId, "34477036808");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34477190605");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "10152033394");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:53a991283d35e552e001a6a435ea9ba141b8e87e46b9c61830f7cbed30523686");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesWorkflowConclusion, "success");
  assert.equal(preflight.q024ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q024ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q024ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed, false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice024Implementation");
});

test("Q024 scope lock forbids angle, inequality, congruence, construction, application, and Q025+ expansion", () => {
  assert.deepEqual(preflight.q024ScopeLock.includedKnowledgePointIds, [KP]);
  for (const relation of [
    "TRIANGLE_ELEMENTS_NAMING_AS_TARGET_KP",
    "CLASSIFY_TRIANGLE_BY_ANGLE_TYPE",
    "APPLY_TRIANGLE_INEQUALITY",
    "MATCH_CONGRUENT_TRIANGLE_CORRESPONDING_SIDES",
    "MATCH_CONGRUENT_TRIANGLE_CORRESPONDING_ANGLES",
    "GEOMETRY_CONSTRUCTION",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "Q025_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q024ScopeLock.excludedRelations.includes(relation), relation);
  assert.equal(preflight.q024ScopeLock.frozenQueueAuthorityTouched, false);
  assert.equal(preflight.q024ScopeLock.r04AuthorityTouched, false);
  assert.equal(preflight.q024ScopeLock.q025OrLaterTouched, false);
});
