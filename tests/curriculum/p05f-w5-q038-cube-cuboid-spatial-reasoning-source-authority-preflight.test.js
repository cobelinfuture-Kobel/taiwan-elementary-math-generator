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
const preflight=read("data/curriculum/full-product/p05f/q038-g5a-u10a1-cube-cuboid-spatial-reasoning-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const q029Visual=read("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-source-visual-pattern-contract.json");
const KP="kp_g5a_u10a1_cube_cuboid_spatial_reasoning";
const REQUIRED_W5=["cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_solid_geometry_representation","cap_spatial_solid_reasoning"];
const PROFILE_REQUIRED=["cap_spatial_solid_reasoning","cap_geometry_domain_validator","cap_solid_geometry_representation"];
const PROFILE_OPTIONAL=["cap_geometry_construction"];
const sorted=values=>[...values].sort();

test("Q038 binds exact frozen queue row and Q037 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===38); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q038_r3_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice038Implementation");
  assert.equal(row.previousSliceId,"p05e_q037_r3_g5a_u09_5a09_profile_geometry_formula_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.assignedDeliveryWaveId,"R05-W5");
  assert.equal(row.primarySourceNodeId,"g5a_u10_5a10a1");
  assert.deepEqual(row.supportingSourceNodeIds,["g5a_u10_5a10a1"]);
  assert.equal(row.intraWavePrerequisiteRank,3);
  assert.equal(row.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.preflightPrNumber,916);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,917);
  assert.equal(preflight.previousSliceD0Evidence.productHeadSha,"d33ca0665984fff7c7983d2375c38d56bb733acd");
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"750071e39f7dd59b87c7dd75f93427a4cc489a19");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId,"34789059091");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId,"34789138982");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34789138969");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10327610825");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:f23ed61172170814b10e5e42e563f0948d1b1c6387342985fc43dc7d5b767509");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
});

test("Q038 binds exact R02 cube-cuboid spatial-reasoning candidate",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5a_u10_5a10a1"); assert.ok(source);
  assert.equal(source.sourceTitle,"正方體和長方體");
  assert.equal(source.sourcePdfTitle,"meow911_5a10a1_source.pdf");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP); assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh,"正方體長方體空間推理");
  assert.equal(candidate.capabilityStatement,"學生能由缺面、塗色或切割條件推論立體關係。");
  assert.equal(candidate.reasoningInvariant,"推論必須保持面、稜、頂點的固定鄰接結構。");
  assert.equal(candidate.category,"geometry");
  assert.deepEqual(candidate.evidencePages,[1,2]);
  assert.equal(candidate.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoint,candidate);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
});

test("Q038 reuses verified same-source identity and Q029 exact visual evidence without reclassifying prior ownership",()=>{
  const source=preflight.sourceAuthority;
  assert.equal(source.sourceNodeId,"g5a_u10_5a10a1");
  assert.equal(source.sourcePdfDriveFileId,"1LVpCn7I1t17SpWbwCXLfHjghTBQ7lwL5");
  assert.equal(source.sourceMetadataDriveFileId,"12paKtt2_iSSyIPjRvmfM9R1NTT3w7YIs");
  assert.equal(source.verificationNotesDriveFileId,"15FkOhd4GwDZ9GRSQzW121WYhx183mhkM");
  assert.equal(source.sourceUrlFromMetadata,"https://meow911.com/5a10a1/");
  assert.equal(source.embeddedHeaderUrlAlias,"https://meow911.com/5a10b/");
  assert.equal(source.targetEvidenceReconciliation.embeddedHeaderUrlAliasIsNonBlocking,true);
  const evidence=source.targetEvidenceReconciliation.cubeCuboidSpatialReasoning;
  assert.deepEqual(evidence.r02EvidencePages,[1,2]);
  assert.deepEqual(evidence.q029ExactPdfVisualCorroborationPages,[1,2]);
  assert.ok(evidence.q029ObservedTargetAdjacentPanels.includes("正方體切割後表面積變化"));
  assert.ok(evidence.q029ObservedTargetAdjacentPanels.includes("由正方體三個視圖在展開圖標色"));
  assert.equal(evidence.q029RestrictionReleasedOnlyForExactQ038Target,true);
  assert.equal(evidence.q008Q018Q029OwnershipPreserved,true);
  assert.equal(source.targetEvidenceReconciliation.r02AuthorityModified,false);
  assert.equal(source.sourceIdentityReuse.q008AuthorityConfirmed,true);
  assert.equal(source.sourceIdentityReuse.q018AuthorityConfirmed,true);
  assert.equal(source.sourceIdentityReuse.q029AuthorityConfirmed,true);
  assert.equal(source.sourceIdentityReuse.samePdfDriveFileIdConfirmed,true);
  assert.equal(source.sourceRefAmbiguity,false);
  assert.equal(source.manualSourceChoiceRequired,false);
  assert.equal(q029Visual.sourceAuthority.sourcePdfDriveFileId,source.sourcePdfDriveFileId);
  assert.equal(q029Visual.scopeGuard.q038CubeCuboidSpatialReasoningTouched,false);
  assert.ok(q029Visual.sourceAuthority.directVisualEvidence.page1.observedPanels.includes("正方體切割後表面積變化"));
  assert.ok(q029Visual.sourceAuthority.directVisualEvidence.page2.observedPanels.includes("由正方體三個視圖在展開圖標色"));
});

test("Q038 binds current R04 spatial-solid mapping including optional construction and exact R05 W5 closure",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const mapping=r04.getMapping(KP); assert.ok(mapping);
  const profile=r04.profiles.find(x=>x.profileId==="profile_spatial_solid"); assert.ok(profile);
  assert.equal(mapping.mappingId,"r04map_g5a_u10a1_cube_cuboid_spatial_reasoning");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(mapping.classificationRuleId,"rule_spatial_solid");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(profile.requiredCapabilityIds,PROFILE_REQUIRED);
  assert.deepEqual(profile.optionalCapabilityIds,PROFILE_OPTIONAL);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,PROFILE_OPTIONAL);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.requiredRuntimeCapabilityIds,mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.optionalRuntimeCapabilityIds,mapping.optionalRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.forbiddenRuntimeCapabilityIds,mapping.forbiddenRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.profileOptionalCapabilityIds,PROFILE_OPTIONAL);
  for(const capabilityId of PROFILE_REQUIRED) assert.ok(mapping.requiredRuntimeCapabilityIds.includes(capabilityId),capabilityId);
  const assignment=r05.getAssignment(KP); assert.ok(assignment);
  assert.equal(assignment.deliveryWaveId,"R05-W5");
  assert.equal(assignment.intraWavePrerequisiteRank,3);
  assert.equal(assignment.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.queueAuthority.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(preflight.q038ScopeLock.geometryConstructionRemainsOptionalNotW5Required,true);
  assert.equal(REQUIRED_W5.includes("cap_geometry_construction"),false);
});

test("Q038 owns only conditional cube-cuboid spatial reasoning and protects Q008 Q018 Q029 semantics",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.deepEqual(preflight.q038ScopeLock.includedKnowledgePointIds,[KP]);
  assert.ok(preflight.q038ScopeLock.includedRelations.includes("INFER_HIDDEN_OR_MISSING_FACE_POSITION_UNDER_CUBE_CUBOID_CONDITIONS"));
  assert.ok(preflight.q038ScopeLock.includedRelations.includes("INFER_FACE_COLOR_POSITION_UNDER_MULTIVIEW_OR_CONDITIONAL_INFORMATION"));
  assert.ok(preflight.q038ScopeLock.includedRelations.includes("INFER_CUBE_CUBOID_RELATION_AFTER_CUTTING_CONDITION_WITHOUT_SURFACE_AREA_ARITHMETIC"));
  assert.ok(preflight.q038ScopeLock.includedRelations.includes("PRESERVE_FIXED_FACE_EDGE_VERTEX_ADJACENCY_DURING_SPATIAL_INFERENCE"));
  const owners={
    kp_g5a_u10a1_cube_cuboid_faces_edges_vertices:8,
    kp_g5a_u10a1_cube_cuboid_edge_length:18,
    kp_g5a_u10a1_cube_cuboid_face_relationship:18,
    kp_g5a_u10a1_cube_cuboid_net:29,
  };
  for(const [kp,position] of Object.entries(owners)){
    const row=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp)); assert.ok(row,kp);
    assert.equal(row.queuePosition,position,kp);
    assert.equal(preflight.q038ScopeLock.protectedFrozenQueueOwnership[kp],`Q${String(position).padStart(3,"0")}`);
    assert.ok(preflight.q038ScopeLock.protectedExistingSameSourceKnowledgePointIds.includes(kp));
  }
  assert.ok(preflight.q038ScopeLock.excludedRelations.includes("REOWN_NET_FOLDABILITY_OR_NET_COMPLETION"));
  assert.ok(preflight.q038ScopeLock.excludedRelations.includes("SURFACE_AREA_FORMULA_OR_ARITHMETIC"));
  assert.ok(preflight.q038ScopeLock.excludedRelations.includes("VOLUME_FORMULA_OR_ARITHMETIC"));
  assert.equal(preflight.q038ScopeLock.missingFaceInferenceMustPreserveFixedAdjacency,true);
  assert.equal(preflight.q038ScopeLock.faceColorInferenceMayUseViewpointAsConditionButMayNotReownGenericViewpointKP,true);
  assert.equal(preflight.q038ScopeLock.cuttingInferenceMayUseCutConditionButMayNotComputeSurfaceArea,true);
  assert.equal(preflight.q038ScopeLock.baseFaceEdgeVertexFactsMayBeUsedAsPrerequisitesButNotReowned,true);
  assert.equal(preflight.q038ScopeLock.netFoldabilityMayNotBeUsedAsQ038TargetSemantic,true);
  assert.equal(preflight.q038ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q038ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q038ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q038ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q038ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q038ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q038ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q038ScopeLock.q039OrLaterTouched,false);
});

test("Q038 preflight uses bounded validation and stops before implementation",()=>{
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
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ038ImplementationPlanning,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.r02AuthorityBoundForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLockedForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.sameSourcePriorSliceOwnershipProtected,true);
  assert.equal(preflight.preflightDecision.q029ExactPdfVisualEvidenceReusedWithoutReclassification,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice038Implementation");
});
