import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q018-g5a-u10a1-edge-length-face-relationship-source-authority-preflight.json", import.meta.url), "utf8"));
const r02 = JSON.parse(readFileSync(new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json", import.meta.url), "utf8"));
const q008 = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q008-g5a-u10a1-cube-cuboid-faces-edges-vertices-source-authority-preflight.json", import.meta.url), "utf8"));

const EDGE = "kp_g5a_u10a1_cube_cuboid_edge_length";
const FACE = "kp_g5a_u10a1_cube_cuboid_face_relationship";
const TARGETS = [EDGE, FACE];
const SOURCE = "g5a_u10_5a10a1";

test("Q018 preflight locks exact frozen row and predecessor boundary", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const q017 = queue.queueEntries[16];
  const q018 = queue.queueEntries[17];
  const q019 = queue.queueEntries[18];
  assert.equal(q017.queuePosition, 17);
  assert.deepEqual(q017.knowledgePointIds, [
    "kp_g5a_u10a_prism_pyramid_elements",
    "kp_g5a_u10a_solid_cross_section",
  ]);
  assert.equal(q018.queuePosition, 18);
  assert.equal(q018.sliceId, "p05e_q018_r1_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(q018.primarySourceNodeId, SOURCE);
  assert.equal(q018.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.deepEqual(q018.knowledgePointIds, TARGETS);
  assert.equal(q019.queuePosition, 19);
  assert.equal(preflight.queueAuthority.queuePosition, q018.queuePosition);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, q018.knowledgePointIds);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, q018.requiredW5CapabilityIds);
});

test("Q018 preflight consumes true Q017 D0 predecessor evidence", () => {
  const evidence = preflight.previousSliceD0Evidence;
  assert.equal(evidence.sliceId, "p05e_q017_r1_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(evidence.productImplementationPrNumber, 851);
  assert.equal(evidence.productMergeSha, "a38602952da39f1abfe635016016e5350f8e03af");
  assert.equal(evidence.exactPagesRunId, "34313497967");
  assert.equal(evidence.pagesDeploymentRunId, "34313497950");
  assert.equal(evidence.evidenceArtifactId, "10089242169");
  assert.equal(evidence.evidenceArtifactDigest, "sha256:24f05c8502821feb9eb235d44eb63e4e8e4720ef8b9d2ebb4c04e3c1aa9054eb");
  assert.equal(evidence.status, "PASS_E6_D0_COMPLETE");
});

test("Q018 source identity reuses reviewed Q008 authority without ambiguity", () => {
  const source = preflight.sourceAuthority;
  assert.equal(source.sourceNodeId, SOURCE);
  assert.equal(source.sourceTitle, q008.sourceAuthority.sourceTitle);
  assert.equal(source.sourcePdfTitle, q008.sourceAuthority.sourcePdfTitle);
  assert.equal(source.sourcePdfDriveFileId, q008.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(source.sourceMetadataDriveFileId, q008.sourceAuthority.sourceMetadataDriveFileId);
  assert.equal(source.verificationNotesDriveFileId, q008.sourceAuthority.verificationNotesDriveFileId);
  assert.equal(source.originalFileNameFromMetadata, q008.sourceAuthority.originalFileNameFromMetadata);
  assert.equal(source.sourceIdentityAnomaly.disposition, q008.sourceAuthority.sourceIdentityAnomaly.disposition);
  assert.equal(source.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.deepEqual(source.reviewedPages, [1, 2]);
});

test("Q018 locks exactly the two R02 reviewed candidate semantics", () => {
  const sourceRecord = r02.sourceRecords.find((record) => record.sourceNodeId === SOURCE);
  assert.ok(sourceRecord);
  assert.deepEqual(sourceRecord.reviewedPages, [1, 2]);
  const authorityById = new Map(preflight.r02ReviewedCandidateAuthorities.map((entry) => [entry.knowledgePointId, entry]));
  assert.deepEqual([...authorityById.keys()], TARGETS);
  for (const kpId of TARGETS) {
    const candidate = sourceRecord.candidates.find((entry) => entry.knowledgePointId === kpId);
    const authority = authorityById.get(kpId);
    assert.ok(candidate, `R02 candidate missing ${kpId}`);
    assert.equal(authority.canonicalNameZh, candidate.canonicalNameZh);
    assert.equal(authority.capabilityStatement, candidate.capabilityStatement);
    assert.equal(authority.reasoningInvariant, candidate.reasoningInvariant);
    assert.equal(authority.category, candidate.category);
    assert.equal(authority.applicationSuitability, candidate.applicationSuitability);
    assert.deepEqual(authority.reviewedPages, candidate.evidencePages);
  }
});

test("Q018 runtime capability closure exactly matches frozen queue authority", () => {
  const exact = [
    "cap_geometry_domain_validator",
    "cap_geometry_property_reasoning",
    "cap_solid_geometry_representation",
    "cap_spatial_solid_reasoning",
  ];
  assert.deepEqual(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds, exact);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, exact);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.dependencyClosureAddedCapabilityIds, ["cap_geometry_property_reasoning"]);
});

test("Q018 scope excludes other same-source KPs and does not implement product semantics", () => {
  const scope = preflight.q018ScopeLock;
  assert.deepEqual(scope.includedKnowledgePointIds, TARGETS);
  assert.deepEqual(scope.excludedKnowledgePointIdsFromSameSource, [
    "kp_g5a_u10a1_cube_cuboid_faces_edges_vertices",
    "kp_g5a_u10a1_cube_cuboid_net",
    "kp_g5a_u10a1_cube_cuboid_spatial_reasoning",
  ]);
  assert.equal(scope.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(scope.implementationAllowedByThisPreflight, false);
  assert.equal(scope.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(scope.q008SameSourceProductSemanticsTouched, false);
  assert.equal(scope.q019OrLaterTouched, false);
});

test("Q018 preflight is sufficient for planning but implementation requires separate operator approval", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ018ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.atomicTwoKnowledgePointSliceLocked, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice018Implementation");
});
