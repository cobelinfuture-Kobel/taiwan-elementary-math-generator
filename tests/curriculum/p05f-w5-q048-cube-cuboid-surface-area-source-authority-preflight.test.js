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
const preflight=read("data/curriculum/full-product/p05f/q048-g5b-u07-cube-cuboid-surface-area-source-authority-preflight.json");
const q040=read("data/curriculum/full-product/p05f/q040-g5b-u07-surface-area-from-net-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const KPS=["kp_g5b_u07_cube_surface_area","kp_g5b_u07_cuboid_surface_area"];
const REQUIRED_W5=["cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_solid_geometry_representation","cap_spatial_solid_reasoning"];
const PROFILE_REQUIRED=["cap_spatial_solid_reasoning","cap_geometry_domain_validator","cap_solid_geometry_representation"];
const PROFILE_OPTIONAL=["cap_geometry_construction"];
const sorted=values=>[...values].sort();

test("Q048 binds exact frozen queue row and Q047 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===48); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q048_r4_g5b_u07_5b07_profile_spatial_solid_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice048Implementation");
  assert.equal(row.previousSliceId,"p05e_q047_r4_g5b_u01_5b01_profile_spatial_solid_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.assignedDeliveryWaveId,"R05-W5");
  assert.equal(row.primarySourceNodeId,"g5b_u07_5b07");
  assert.deepEqual(row.supportingSourceNodeIds,["g5b_u07_5b07"]);
  assert.equal(row.intraWavePrerequisiteRank,4);
  assert.equal(row.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,2);
  assert.deepEqual(row.knowledgePointIds,KPS);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.preflightPrNumber,937);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,938);
  assert.equal(preflight.previousSliceD0Evidence.productHeadSha,"0566298b42d6eb3fa428c1223fc155eee245ec75");
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"6eb9026051fb8da0245040b54699f8f1671d7240");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId,"34865251145");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId,"34865796988");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34865796936");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10357595236");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:7836e1b0917d53f2450e9e3246d3dc65e0a7bb51d48bbadcc8d47acd6885a043");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
});

test("Q048 binds exact R02 cube and cuboid surface-area candidates",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5b_u07_5b07"); assert.ok(source);
  assert.equal(source.sourceTitle,"表面積");
  assert.equal(source.sourcePdfTitle,"meow911_5b07_source.pdf");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  const expected={
    kp_g5b_u07_cube_surface_area:{canonicalNameZh:"正方體表面積",capabilityStatement:"學生能以一面面積乘6求正方體表面積。",reasoningInvariant:"六個全等正方形面共同構成外表面。"},
    kp_g5b_u07_cuboid_surface_area:{canonicalNameZh:"長方體表面積",capabilityStatement:"學生能計算長方體三組相對面的總面積。",reasoningInvariant:"表面積等於長寬、長高、寬高三種面積各兩個。"},
  };
  for(const kp of KPS){
    const candidate=source.candidates.find(x=>x.knowledgePointId===kp); assert.ok(candidate,kp);
    assert.equal(candidate.canonicalNameZh,expected[kp].canonicalNameZh);
    assert.equal(candidate.capabilityStatement,expected[kp].capabilityStatement);
    assert.equal(candidate.reasoningInvariant,expected[kp].reasoningInvariant);
    assert.equal(candidate.category,"geometry");
    assert.deepEqual(candidate.evidencePages,[1,2]);
    assert.equal(candidate.applicationSuitability,"APPLICATION_COMPATIBLE");
    assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoints.find(x=>x.knowledgePointId===kp),candidate);
  }
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
});

test("Q048 reuses Q040 verified same-source identity without re-owning net surface area",()=>{
  const source=preflight.sourceAuthority;
  assert.equal(source.sourceNodeId,"g5b_u07_5b07");
  assert.equal(source.sourcePdfTitle,"meow911_5b07_source.pdf");
  assert.equal(source.sourcePdfDriveFileId,"19zLc-rrV6lauqhpxr6undOHHpcg__RKz");
  assert.equal(source.sourceMetadataDriveFileId,"1UHzU1OMhmO38Z-baRZl8wjWocGv5fOfa");
  assert.equal(source.verificationNotesDriveFileId,"1oMN8VzmrIhbmfeVUIJqWvc8RjVJYpzbL");
  assert.equal(source.sourceUrl,"https://meow911.com/5b07/");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(q040.sourceAuthority.sourceNodeId,source.sourceNodeId);
  assert.equal(q040.sourceAuthority.sourcePdfTitle,source.sourcePdfTitle);
  assert.equal(q040.sourceAuthority.sourcePdfDriveFileId,source.sourcePdfDriveFileId);
  assert.equal(q040.sourceAuthority.sourceMetadataDriveFileId,source.sourceMetadataDriveFileId);
  assert.equal(q040.sourceAuthority.verificationNotesDriveFileId,source.verificationNotesDriveFileId);
  assert.equal(q040.sourceAuthority.sourceUrlFromMetadata,source.sourceUrl);
  assert.equal(source.targetEvidenceReconciliation.cubeSurfaceArea.samePdfIdentityAlreadyCorroboratedByQ040,true);
  assert.equal(source.targetEvidenceReconciliation.cuboidSurfaceArea.samePdfIdentityAlreadyCorroboratedByQ040,true);
  assert.equal(source.targetEvidenceReconciliation.cubeSurfaceArea.newTargetVisualReplayRequiredForPreflight,false);
  assert.equal(source.targetEvidenceReconciliation.cuboidSurfaceArea.newTargetVisualReplayRequiredForPreflight,false);
  assert.equal(source.sourceIdentityReuse.q040AuthorityConfirmed,true);
  assert.equal(source.sourceIdentityReuse.q040CurrentDirectPdfVisualVerificationCompleted,true);
  assert.equal(source.sourceRefAmbiguity,false);
  assert.equal(source.manualSourceChoiceRequired,false);
  assert.equal(source.ocrUsedAsAuthority,false);
});

test("Q048 binds current R04 spatial-solid mappings and exact R05 W5 closure",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const profile=r04.profiles.find(x=>x.profileId==="profile_spatial_solid"); assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,PROFILE_REQUIRED);
  assert.deepEqual(profile.optionalCapabilityIds,PROFILE_OPTIONAL);
  for(const kp of KPS){
    const mapping=r04.getMapping(kp); assert.ok(mapping,kp);
    assert.equal(mapping.mappingId,`r04map_${kp.replace(/^kp_/,"")}`);
    assert.equal(mapping.primaryRuntimeProfileId,"profile_spatial_solid");
    assert.equal(mapping.classificationRuleId,"rule_spatial_solid");
    assert.deepEqual(mapping.appliedModifierIds,[]);
    assert.deepEqual(mapping.optionalRuntimeCapabilityIds,PROFILE_OPTIONAL);
    assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
    const bound=preflight.runtimeCapabilityAuthority.mappings.find(x=>x.knowledgePointId===kp); assert.ok(bound,kp);
    assert.deepEqual(bound.requiredRuntimeCapabilityIds,mapping.requiredRuntimeCapabilityIds);
    assert.deepEqual(bound.optionalRuntimeCapabilityIds,mapping.optionalRuntimeCapabilityIds);
    assert.deepEqual(bound.forbiddenRuntimeCapabilityIds,mapping.forbiddenRuntimeCapabilityIds);
    const assignment=r05.getAssignment(kp); assert.ok(assignment,kp);
    assert.equal(assignment.deliveryWaveId,"R05-W5");
    assert.equal(assignment.intraWavePrerequisiteRank,4);
    assert.equal(assignment.primaryRuntimeProfileId,"profile_spatial_solid");
    assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  }
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(preflight.runtimeCapabilityAuthority.surfaceAreaTermAlsoMatchesGeometryFormulaButSpatialRulePrecedencePreserved,true);
  assert.equal(preflight.runtimeCapabilityAuthority.mappingPolicyModifierMatchCountPerTarget,0);
  assert.equal(preflight.q048ScopeLock.geometryConstructionRemainsOptionalNotW5Required,true);
  assert.equal(REQUIRED_W5.includes("cap_geometry_construction"),false);
});

test("Q048 owns only direct cube/cuboid formulas and protects Q040 Q054 Q059 same-source ownership",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.deepEqual(preflight.q048ScopeLock.includedKnowledgePointIds,KPS);
  for(const relation of [
    "COMPUTE_CUBE_SURFACE_AREA_AS_ONE_FACE_AREA_TIMES_SIX",
    "DERIVE_CUBE_SURFACE_AREA_FROM_SIX_CONGRUENT_SQUARE_FACES",
    "COMPUTE_CUBOID_SURFACE_AREA_AS_TWO_TIMES_SUM_OF_LENGTH_WIDTH_LENGTH_HEIGHT_WIDTH_HEIGHT",
    "PAIR_OPPOSITE_CONGRUENT_FACES_IN_CUBOID_SURFACE_AREA_MODEL",
  ]) assert.ok(preflight.q048ScopeLock.includedRelations.includes(relation));
  const owners={
    kp_g5b_u07_surface_area_from_net:40,
    kp_g5b_u07_composite_surface_area_hidden_faces:54,
    kp_g5b_u07_surface_area_unknown_dimension:59,
  };
  for(const [kp,position] of Object.entries(owners)){
    const owner=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp)); assert.ok(owner,kp);
    assert.equal(owner.queuePosition,position,kp);
    assert.equal(preflight.q048ScopeLock.protectedFrozenQueueOwnership[kp],`Q${String(position).padStart(3,"0")}`);
  }
  assert.ok(preflight.q048ScopeLock.excludedRelations.includes("REOWN_SURFACE_AREA_FROM_NET"));
  assert.ok(preflight.q048ScopeLock.excludedRelations.includes("COMPOSITE_HIDDEN_FACE_SURFACE_AREA_AS_TARGET_KP"));
  assert.ok(preflight.q048ScopeLock.excludedRelations.includes("SOLVE_UNKNOWN_DIMENSION_FROM_SURFACE_AREA_AS_TARGET_KP"));
  assert.equal(preflight.q048ScopeLock.q040SurfaceAreaFromNetMayBeUsedAsSupportingRepresentationKnowledgeButNotReowned,true);
  assert.equal(preflight.q048ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q048ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q048ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q048ScopeLock.sameSourceSiblingSemanticsTouched,false);
  assert.equal(preflight.q048ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q048ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q048ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q048ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q048ScopeLock.q049OrLaterTouched,false);
});

test("Q048 preflight uses bounded validation and stops before implementation",()=>{
  assert.equal(preflight.preflightValidationBoundary.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(preflight.preflightValidationBoundary.derivedLane,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(preflight.preflightValidationBoundary.allowedLaneGateIds,["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(preflight.preflightValidationBoundary.focusedNodeContractRequired,true);
  assert.equal(preflight.preflightValidationBoundary.nodeOnlyReadbackRequired,true);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.productImplementationAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.publicProductAdmissionAllowed,false);
  assert.equal(preflight.preflightDecision.exactFrozenQueueRowResolved,true);
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ048ImplementationPlanning,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.r02AuthorityBoundForAllTargetKnowledgePoints,true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLockedForAllTargetKnowledgePoints,true);
  assert.equal(preflight.preflightDecision.sameSourcePriorSliceOwnershipProtected,true);
  assert.equal(preflight.preflightDecision.futureSameSourceOwnershipProtected,true);
  assert.equal(preflight.preflightDecision.q040SameSourceIdentityReusedWithoutReclassification,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice048Implementation");
});
