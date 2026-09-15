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
const preflight=read("data/curriculum/full-product/p05f/q049-g6b-u03-prism-surface-area-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const KP="kp_g6b_u03_prism_surface_area";
const REQUIRED_W5=["cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_solid_geometry_representation","cap_spatial_solid_reasoning"];
const PROFILE_REQUIRED=["cap_spatial_solid_reasoning","cap_geometry_domain_validator","cap_solid_geometry_representation"];
const PROFILE_OPTIONAL=["cap_geometry_construction"];
const sorted=values=>[...values].sort();

test("Q049 binds exact frozen queue row and Q048 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===49); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q049_r4_g6b_u03_6b03_profile_spatial_solid_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice049Implementation");
  assert.equal(row.previousSliceId,"p05e_q048_r4_g5b_u07_5b07_profile_spatial_solid_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.assignedDeliveryWaveId,"R05-W5");
  assert.equal(row.primarySourceNodeId,"g6b_u03_6b03");
  assert.deepEqual(row.supportingSourceNodeIds,["g6b_u03_6b03"]);
  assert.equal(row.intraWavePrerequisiteRank,4);
  assert.equal(row.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.preflightPrNumber,939);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,940);
  assert.equal(preflight.previousSliceD0Evidence.productHeadSha,"258ddc64ac337b199d731523a13e69d5fa4ad8c8");
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"7de4019ff3957e77aa035fc03d01f38f750271ad");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId,"34913966250");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId,"34914077928");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34914077936");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10375920460");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:5ddfbef224c52083ca3f160da33dc094a9923977cded8a1014a11c84f1f8b898");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.prGateConclusion,"success");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentConclusion,"success");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesWorkflowConclusion,"success");
});

test("Q049 binds exact R02 prism surface-area candidate",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g6b_u03_6b03"); assert.ok(source);
  assert.equal(source.sourceTitle,"柱體體積與表面積");
  assert.equal(source.sourcePdfTitle,"meow911_6b03_source.pdf");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP); assert.ok(candidate);
  assert.deepEqual(candidate,{
    knowledgePointId:KP,
    canonicalNameZh:"柱體表面積",
    capabilityStatement:"學生能加總兩個底面與各側面求表面積。",
    reasoningInvariant:"所有外露面恰計一次，側面展開總寬等於底面周長。",
    category:"geometry",
    evidencePages:[1,2],
    applicationSuitability:"APPLICATION_COMPATIBLE",
  });
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoints,[candidate]);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
  assert.equal(preflight.r02ReviewedCandidateAuthority.chunkBlobSha,"2902e380adc896d6bd554b58272d9b65797cd844");
});

test("Q049 source identity resolves legacy pending notes with current direct full-page visual verification",()=>{
  const source=preflight.sourceAuthority;
  assert.equal(source.sourceNodeId,"g6b_u03_6b03");
  assert.equal(source.sourceTitle,"柱體體積與表面積");
  assert.equal(source.sourcePdfTitle,"meow911_6b03_source.pdf");
  assert.equal(source.sourcePdfDriveFileId,"10LlUyzn4WOkxHAY3S9SsZeGT0i_ixV9u");
  assert.equal(source.sourceMetadataDriveFileId,"166jSxr7CwhLSrHc--uSlPwCUzCk0vyr7");
  assert.equal(source.verificationNotesDriveFileId,"1MWLwKWehiRhekfnmf2zX1-kck2t0Azlg");
  assert.equal(source.originalFileNameFromMetadata,"題型總覽-6b03-柱體體積與表面積.pdf");
  assert.equal(source.sourceUrl,"https://meow911.com/6b03/");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(source.legacySourceMetadataState.manualReviewed,false);
  assert.equal(source.legacySourceMetadataState.extractionStatus,"pending");
  assert.equal(source.legacyVerificationNotesState.status,"pending");
  assert.equal(source.legacyVerificationNotesState.visualVerificationCompleted,false);
  assert.equal(source.legacyVerificationNotesState.doNotTreatOcrAsAuthority,true);
  assert.equal(source.currentDirectVisualVerification.completed,true);
  assert.equal(source.currentDirectVisualVerification.method,"CHATGPT_DIRECT_RENDERED_PDF_FULL_PAGE_VISUAL_VERIFICATION");
  assert.deepEqual(source.currentDirectVisualVerification.reviewedPages,[1,2]);
  assert.ok(source.currentDirectVisualVerification.page1Observations.some(x=>x.includes("柱體的面與邊關係")));
  assert.ok(source.currentDirectVisualVerification.page2Observations.some(x=>x.includes("三角柱體表面積")));
  assert.ok(source.currentDirectVisualVerification.page2Observations.some(x=>x.includes("梯形柱體表面積")));
  assert.ok(source.currentDirectVisualVerification.page2Observations.some(x=>x.includes("平行四邊形柱體表面積")));
  assert.equal(source.currentDirectVisualVerification.r02SemanticAuthorityPreserved,true);
  assert.equal(source.targetEvidenceReconciliation.prismSurfaceArea.r02CapabilityStatement,"學生能加總兩個底面與各側面求表面積。");
  assert.equal(source.targetEvidenceReconciliation.prismSurfaceArea.r02ReasoningInvariant,"所有外露面恰計一次，側面展開總寬等於底面周長。");
  assert.equal(source.ocrUsedAsAuthority,false);
  assert.equal(source.sourceRefAmbiguity,false);
  assert.equal(source.manualSourceChoiceRequired,false);
});

test("Q049 binds current R04 spatial-solid mapping and exact R05 W5 closure",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  const row=queue.queueEntries.find(x=>x.queuePosition===49); assert.ok(row);
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const profile=r04.profiles.find(x=>x.profileId==="profile_spatial_solid"); assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,PROFILE_REQUIRED);
  assert.deepEqual(profile.optionalCapabilityIds,PROFILE_OPTIONAL);
  const mapping=r04.getMapping(KP); assert.ok(mapping);
  assert.equal(mapping.mappingId,"r04map_g6b_u03_prism_surface_area");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(mapping.classificationRuleId,"rule_spatial_solid");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,PROFILE_OPTIONAL);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  const bound=preflight.runtimeCapabilityAuthority.mappings.find(x=>x.knowledgePointId===KP); assert.ok(bound);
  assert.deepEqual(bound.requiredRuntimeCapabilityIds,mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(bound.optionalRuntimeCapabilityIds,mapping.optionalRuntimeCapabilityIds);
  assert.deepEqual(bound.forbiddenRuntimeCapabilityIds,mapping.forbiddenRuntimeCapabilityIds);
  const assignment=r05.getAssignment(KP); assert.ok(assignment);
  assert.equal(assignment.deliveryWaveId,"R05-W5");
  assert.equal(assignment.intraWavePrerequisiteRank,4);
  assert.equal(assignment.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.requiredW5CapabilityIds.includes("cap_geometry_construction"),false);
});

test("Q049 owns only prism surface area and protects Q055 Q060 plus non-W5 cylinder sibling",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.deepEqual(preflight.q049ScopeLock.includedKnowledgePointIds,[KP]);
  for(const relation of [
    "SUM_TWO_BASES_AND_ALL_LATERAL_FACES_FOR_PRISM_SURFACE_AREA",
    "COUNT_EACH_EXPOSED_FACE_EXACTLY_ONCE",
    "LATERAL_NET_TOTAL_WIDTH_EQUALS_BASE_PERIMETER",
  ]) assert.ok(preflight.q049ScopeLock.includedRelations.includes(relation));
  const owners={
    kp_g6b_u03_prism_base_area_height_volume:55,
    kp_g6b_u03_triangular_prism_volume:60,
    kp_g6b_u03_composite_prism_volume_surface:60,
  };
  for(const [kp,position] of Object.entries(owners)){
    const owner=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp)); assert.ok(owner,kp);
    assert.equal(owner.queuePosition,position,kp);
    assert.equal(preflight.q049ScopeLock.protectedFrozenQueueOwnership[kp],`Q${String(position).padStart(3,"0")}`);
  }
  assert.equal(queue.queueEntries.some(x=>x.knowledgePointIds.includes("kp_g6b_u03_cylinder_volume")),false);
  assert.deepEqual(preflight.q049ScopeLock.protectedNonW5SiblingCandidateIds,["kp_g6b_u03_cylinder_volume"]);
  assert.equal(preflight.q049ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q049ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q049ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q049ScopeLock.sameSourceSiblingSemanticsTouched,false);
  assert.equal(preflight.q049ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q049ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q049ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q049ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q049ScopeLock.q050OrLaterTouched,false);
});

test("Q049 preflight uses bounded validation and stops before implementation",()=>{
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
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ049ImplementationPlanning,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.r02AuthorityBoundForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.currentDirectPdfVisualVerificationCompleted,true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLockedForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.futureSameSourceFrozenOwnershipProtected,true);
  assert.equal(preflight.preflightDecision.nonW5SameSourceSiblingProtected,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice049Implementation");
});
