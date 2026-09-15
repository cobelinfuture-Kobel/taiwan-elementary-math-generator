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
const preflight=read("data/curriculum/full-product/p05f/q050-g4b-u07-composite-perimeter-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const KP="kp_g4b_u07_composite_perimeter";
const REQUIRED_W5=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"];
const PROFILE_REQUIRED=["cap_geometry_formula_evaluation","cap_geometry_domain_validator","cap_geometry_diagram_representation"];
const sorted=v=>[...v].sort();

test("Q050 binds exact frozen queue row and Q049 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===50); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q050_r5_g4b_u07_4b07_profile_geometry_formula_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice050Implementation");
  assert.equal(row.previousSliceId,"p05e_q049_r4_g6b_u03_6b03_profile_spatial_solid_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.assignedDeliveryWaveId,"R05-W5");
  assert.equal(row.primarySourceNodeId,"g4b_u07_4b07");
  assert.deepEqual(row.supportingSourceNodeIds,["g4b_u07_4b07"]);
  assert.equal(row.intraWavePrerequisiteRank,5);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.preflightPrNumber,941);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,942);
  assert.equal(preflight.previousSliceD0Evidence.productHeadSha,"76b090900d601b3d03168811791cdd490f868b51");
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"59d913da8c2e954a080d3f0ff6464145402ef662");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId,"34920521923");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId,"34920618442");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34920618367");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10377369689");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:eb957e944ec73f8731d6361d31157386bbb4f69953258bce726281c5fbf7c759");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.prGateConclusion,"success");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentConclusion,"success");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesWorkflowConclusion,"success");
});

test("Q050 binds exact R02 composite-perimeter candidate and same-source authority",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4b_u07_4b07"); assert.ok(source);
  assert.equal(source.sourceTitle,"周長與面積");
  assert.equal(source.sourcePdfTitle,"meow911_4b07_source.pdf");
  assert.equal(source.pageCount,3);
  assert.deepEqual(source.reviewedPages,[1,2,3]);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP); assert.ok(candidate);
  assert.deepEqual(candidate,{
    knowledgePointId:KP,
    canonicalNameZh:"複合圖形周長",
    capabilityStatement:"學生能辨認複合圖形外框並求周長。",
    reasoningInvariant:"共用內部邊不計入周長，缺邊可由對應長度關係補出。",
    category:"geometry",
    evidencePages:[1],
    applicationSuitability:"APPLICATION_COMPATIBLE",
  });
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoint,candidate);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId,"19yZxx2bt_rQgqAA7Rx4HALoL3l3nfpw-");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId,"1X-hyC3X8aw72FoLJql5v7BbUq601yjS5");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId,"1xYu4mXNY1R7JlNteWn65_9LsvZ8vwm_4");
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.compositePerimeter.q034SamePagePerimeterBoundaryAuthorityReused,true);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.compositePerimeter.q043SameSourceCandidateIdentityReused,true);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.compositePerimeter.newDirectTargetPanelReplayRequired,false);
  assert.equal(preflight.sourceAuthority.embeddedHeaderUrlMismatchObserved,true);
  assert.equal(preflight.sourceAuthority.embeddedHeaderUrlMismatchIsNonBlocking,true);
  assert.equal(preflight.sourceAuthority.ocrUsedAsAuthority,false);
  assert.equal(preflight.sourceAuthority.sourceRefAmbiguity,false);
  assert.equal(preflight.sourceAuthority.manualSourceChoiceRequired,false);
});

test("Q050 binds current R04 geometry-formula mapping and exact R05 W5 closure",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  const row=queue.queueEntries.find(x=>x.queuePosition===50); assert.ok(row);
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const profile=r04.profiles.find(x=>x.profileId==="profile_geometry_formula"); assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,PROFILE_REQUIRED);
  assert.deepEqual(profile.optionalCapabilityIds,[]);
  const mapping=r04.getMapping(KP); assert.ok(mapping);
  assert.equal(mapping.mappingId,"r04map_g4b_u07_composite_perimeter");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.requiredRuntimeCapabilityIds,mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.optionalRuntimeCapabilityIds,mapping.optionalRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.forbiddenRuntimeCapabilityIds,mapping.forbiddenRuntimeCapabilityIds);
  const assignment=r05.getAssignment(KP); assert.ok(assignment);
  assert.equal(assignment.deliveryWaveId,"R05-W5");
  assert.equal(assignment.intraWavePrerequisiteRank,5);
  assert.equal(assignment.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
});

test("Q050 owns only composite perimeter and protects earlier g4b-u07 frozen ownership",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.deepEqual(preflight.q050ScopeLock.includedKnowledgePointIds,[KP]);
  for(const relation of [
    "TRACE_COMPOSITE_OUTER_BOUNDARY",
    "EXCLUDE_SHARED_INTERIOR_EDGES_FROM_PERIMETER",
    "INFER_MISSING_BOUNDARY_LENGTH_FROM_CORRESPONDING_RECTILINEAR_LENGTH_RELATIONS",
    "SUM_EACH_OUTER_BOUNDARY_SEGMENT_EXACTLY_ONCE",
  ]) assert.ok(preflight.q050ScopeLock.includedRelations.includes(relation));
  const owners={
    kp_g4b_u07_rectangle_square_area_formula:26,
    kp_g4b_u07_composite_rectilinear_area:34,
    kp_g4b_u07_perimeter_path_sum:34,
    kp_g4b_u07_rectangle_square_perimeter_formula:43,
  };
  for(const [kp,position] of Object.entries(owners)){
    const owner=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp)); assert.ok(owner,kp);
    assert.equal(owner.queuePosition,position,kp);
    assert.equal(preflight.q050ScopeLock.protectedExistingSameSourceKnowledgePointOwnership[kp],`Q${String(position).padStart(3,"0")}`);
  }
  assert.deepEqual(preflight.q050ScopeLock.prerequisiteSemanticsReusedNotReowned,["kp_g4b_u07_perimeter_path_sum","kp_g4b_u07_rectangle_square_perimeter_formula"]);
  assert.equal(preflight.q050ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q050ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q050ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q050ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q050ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q050ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q050ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q050ScopeLock.q051OrLaterTouched,false);
});

test("Q050 preflight uses bounded validation and stops before implementation",()=>{
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
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ050ImplementationPlanning,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.r02AuthorityBoundForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLockedForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.priorSameSourceFrozenOwnershipProtected,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice050Implementation");
});
