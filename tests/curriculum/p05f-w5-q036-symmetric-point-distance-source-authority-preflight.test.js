import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const preflight=read("data/curriculum/full-product/p05f/q036-g5a-u07-symmetric-point-distance-source-authority-preflight.json");
const q006=read("data/curriculum/full-product/p05f/q006-g5a-u07-line-symmetry-recognition-source-authority-preflight.json");
const q016=read("data/curriculum/full-product/p05f/q016-g5a-u07-symmetry-axis-count-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const KP="kp_g5a_u07_symmetric_point_distance";
const REQUIRED_W5=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"];
const PROFILE_REQUIRED=["cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation"];
const PROFILE_OPTIONAL=["cap_geometry_construction"];
const sorted=values=>[...values].sort();

test("Q036 binds exact frozen queue row and Q035 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===36); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q036_r3_g5a_u07_5a07_profile_geometry_property_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice036Implementation");
  assert.equal(row.previousSliceId,"p05e_q035_r3_g4b_u10_4b10_profile_spatial_solid_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.assignedDeliveryWaveId,"R05-W5");
  assert.equal(row.primarySourceNodeId,"g5a_u07_5a07");
  assert.deepEqual(row.supportingSourceNodeIds,["g5a_u07_5a07"]);
  assert.equal(row.intraWavePrerequisiteRank,3);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,913);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"119fd7dae77083fb4cb54868957fbe1eab84996b");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId,"34753774817");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId,"34753882860");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34753882872");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10315679601");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:fc5d7c34824345c104056b7336b64ef5bf8143e89d05900929d3468082df0211");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
});

test("Q036 binds exact R02 symmetric-point-distance candidate",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5a_u07_5a07"); assert.ok(source);
  assert.equal(source.sourceTitle,"線對稱圖形");
  assert.equal(source.sourcePdfTitle,"meow911_5a07_source.pdf");
  assert.equal(source.pageCount,1);
  assert.deepEqual(source.reviewedPages,[1]);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP); assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh,"對應點與對稱軸距離");
  assert.equal(candidate.capabilityStatement,"學生能找出線對稱圖形的對應點。");
  assert.equal(candidate.reasoningInvariant,"對應點連線垂直於對稱軸，且兩點到軸距離相等。");
  assert.equal(candidate.category,"geometry");
  assert.deepEqual(candidate.evidencePages,[1]);
  assert.equal(candidate.applicationSuitability,"APPLICATION_COMPATIBLE");
  const bound=preflight.r02ReviewedCandidateAuthority.knowledgePoint;
  assert.deepEqual(bound,candidate);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
});

test("Q036 reuses verified Q006 and Q016 source identity without reowning their semantics",()=>{
  for(const prior of [q006,q016]){
    assert.equal(prior.sourceAuthority.sourceNodeId,preflight.sourceAuthority.sourceNodeId);
    assert.equal(prior.sourceAuthority.sourcePdfTitle,preflight.sourceAuthority.sourcePdfTitle);
    assert.equal(prior.sourceAuthority.sourcePdfDriveFileId,preflight.sourceAuthority.sourcePdfDriveFileId);
    assert.equal(prior.sourceAuthority.sourceMetadataDriveFileId,preflight.sourceAuthority.sourceMetadataDriveFileId);
    assert.equal(prior.sourceAuthority.verificationNotesDriveFileId,preflight.sourceAuthority.verificationNotesDriveFileId);
    assert.equal(prior.sourceAuthority.sourceUrlFromMetadata,preflight.sourceAuthority.sourceUrlFromMetadata);
  }
  assert.equal(preflight.sourceAuthority.sourceIdentityReuse.sameSourceNodeConfirmed,true);
  assert.equal(preflight.sourceAuthority.sourceIdentityReuse.samePdfIdentityConfirmed,true);
  assert.equal(preflight.sourceAuthority.sourceIdentityReuse.sameMetadataIdentityConfirmed,true);
  assert.equal(preflight.sourceAuthority.sourceIdentityReuse.sourceRefAmbiguity,false);
  assert.equal(preflight.sourceAuthority.manualSourceChoiceRequired,false);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.symmetricPointDistance.q006PriorRestrictionReleasedOnlyForExactQ036Target,true);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.symmetricPointDistance.q016PriorRestrictionReleasedOnlyForExactQ036Target,true);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.r02AuthorityModified,false);
});

test("Q036 binds current R04 geometry-property mapping and exact R05 W5 capability contract",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const mapping=r04.getMapping(KP); assert.ok(mapping);
  const profile=r04.profiles.find(x=>x.profileId==="profile_geometry_property"); assert.ok(profile);
  assert.equal(mapping.mappingId,"r04map_g5a_u07_symmetric_point_distance");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mapping.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  for(const capabilityId of PROFILE_REQUIRED) assert.ok(mapping.requiredRuntimeCapabilityIds.includes(capabilityId),capabilityId);
  assert.deepEqual(profile.optionalCapabilityIds,PROFILE_OPTIONAL);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,PROFILE_OPTIONAL);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.requiredRuntimeCapabilityIds,mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.optionalRuntimeCapabilityIds,mapping.optionalRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.forbiddenRuntimeCapabilityIds,mapping.forbiddenRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.profileRequiredCapabilityIds,PROFILE_REQUIRED);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.profileOptionalCapabilityIds,PROFILE_OPTIONAL);
  const assignment=r05.getAssignment(KP); assert.ok(assignment);
  assert.equal(assignment.deliveryWaveId,"R05-W5");
  assert.equal(assignment.intraWavePrerequisiteRank,3);
  assert.equal(assignment.primaryRuntimeProfileId,"profile_geometry_property");
  assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.queueAuthority.requiredW5CapabilityIds),sorted(REQUIRED_W5));
});

test("Q036 scope owns only symmetric-point equal perpendicular offset semantics",()=>{
  assert.deepEqual(preflight.q036ScopeLock.includedKnowledgePointIds,[KP]);
  assert.ok(preflight.q036ScopeLock.includedRelations.includes("IDENTIFY_CORRESPONDING_POINT_ACROSS_SYMMETRY_AXIS"));
  assert.ok(preflight.q036ScopeLock.includedRelations.includes("REQUIRE_CORRESPONDING_POINT_CONNECTOR_PERPENDICULAR_TO_SYMMETRY_AXIS"));
  assert.ok(preflight.q036ScopeLock.includedRelations.includes("PRESERVE_EQUAL_DISTANCE_FROM_CORRESPONDING_POINTS_TO_SYMMETRY_AXIS"));
  assert.equal(preflight.q036ScopeLock.protectedFrozenQueueOwnership.kp_g5a_u07_line_symmetry_recognition,"Q006");
  assert.equal(preflight.q036ScopeLock.protectedFrozenQueueOwnership.kp_g5a_u07_symmetry_axis_count,"Q016");
  assert.equal(preflight.q036ScopeLock.protectedFrozenQueueOwnership.kp_g5a_u07_complete_symmetric_figure,"Q045");
  assert.ok(preflight.q036ScopeLock.excludedKnowledgePointIdsFromSameSource.includes("kp_g5a_u07_complete_symmetric_figure"));
  assert.ok(preflight.q036ScopeLock.excludedKnowledgePointIdsFromSameSource.includes("kp_g5a_u07_coordinate_reflection"));
  assert.equal(preflight.q036ScopeLock.distanceSemanticsLimitedToEqualPerpendicularOffsetsFromSymmetryAxis,true);
  assert.equal(preflight.q036ScopeLock.correspondingPointConnectorMustRemainPerpendicularToSymmetryAxis,true);
  assert.equal(preflight.q036ScopeLock.correspondingPointsMustRemainEquidistantFromSymmetryAxis,true);
  assert.equal(preflight.q036ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q036ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q036ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q036ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q036ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q036ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q036ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q036ScopeLock.q037OrLaterTouched,false);
});

test("Q036 preflight uses bounded validation and stops before separately approved implementation",()=>{
  assert.equal(preflight.preflightValidationBoundary.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(preflight.preflightValidationBoundary.derivedLane,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(preflight.preflightValidationBoundary.allowedLaneGateIds,["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(preflight.preflightValidationBoundary.focusedNodeContractRequired,true);
  assert.equal(preflight.preflightValidationBoundary.nodeOnlyReadbackRequired,true);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(preflight.preflightDecision.exactFrozenQueueRowResolved,true);
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ036ImplementationPlanning,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice036Implementation");
});
