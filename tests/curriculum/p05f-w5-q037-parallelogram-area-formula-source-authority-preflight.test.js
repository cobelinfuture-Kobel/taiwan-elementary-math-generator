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
const preflight=read("data/curriculum/full-product/p05f/q037-g5a-u09-parallelogram-area-formula-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const KP="kp_g5a_u09_parallelogram_area_formula";
const REQUIRED_W5=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"];
const PROFILE_REQUIRED=["cap_geometry_formula_evaluation","cap_geometry_domain_validator","cap_geometry_diagram_representation"];
const DIRECT_CONTRACT_ONLY=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation"];
const sorted=values=>[...values].sort();

test("Q037 binds exact frozen queue row and Q036 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===37); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q037_r3_g5a_u09_5a09_profile_geometry_formula_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice037Implementation");
  assert.equal(row.previousSliceId,"p05e_q036_r3_g5a_u07_5a07_profile_geometry_property_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.assignedDeliveryWaveId,"R05-W5");
  assert.equal(row.primarySourceNodeId,"g5a_u09_5a09");
  assert.deepEqual(row.supportingSourceNodeIds,["g5a_u09_5a09"]);
  assert.equal(row.intraWavePrerequisiteRank,3);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,915);
  assert.equal(preflight.previousSliceD0Evidence.productHeadSha,"2edc70182674c8df903d9e5b0bba104fb2b052c2");
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"f4fa2905df9bd3e99d1772e6f71d724ce4221815");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId,"34763651807");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId,"34763723234");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34763723236");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10319937552");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:00ae31bb36316aa24fbd59dce7918462db69dae58474b41e9e1a287216279af7");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
});

test("Q037 binds exact R02 parallelogram-area candidate",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5a_u09_5a09"); assert.ok(source);
  assert.equal(source.sourceTitle,"平行四邊形三角形梯形面積");
  assert.equal(source.sourcePdfTitle,"meow911_5a09_source.pdf");
  assert.equal(source.pageCount,4);
  assert.deepEqual(source.reviewedPages,[1,2,3,4]);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP); assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh,"平行四邊形面積");
  assert.equal(candidate.capabilityStatement,"學生能以底乘高求平行四邊形面積。");
  assert.equal(candidate.reasoningInvariant,"剪拼為等底等高長方形後面積不變。");
  assert.equal(candidate.category,"geometry");
  assert.deepEqual(candidate.evidencePages,[1]);
  assert.equal(candidate.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoint,candidate);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
});

test("Q037 reconciles current direct PDF visual evidence without mutating R02",()=>{
  const source=preflight.sourceAuthority;
  assert.equal(source.sourceNodeId,"g5a_u09_5a09");
  assert.equal(source.sourcePdfTitle,"meow911_5a09_source.pdf");
  assert.equal(source.sourcePdfDriveFileId,"1fvDY9emawKVJgMNyt5oN-TbHvaRtpUy9");
  assert.equal(source.sourceMetadataDriveFileId,"1wWfnemvRk-X5As2l4UvEc2zKHGanlH0y");
  assert.equal(source.verificationNotesDriveFileId,"1NMsQLNSSWLbPbiQcWDXFhdn-Rzg9-iOo");
  assert.equal(source.sourceUrlFromMetadata,"https://meow911.com/5a09/");
  assert.deepEqual(source.targetEvidenceReconciliation.parallelogramAreaFormula.r02EvidencePages,[1]);
  assert.deepEqual(source.targetEvidenceReconciliation.parallelogramAreaFormula.directVisualCorroborationPages,[1,2]);
  assert.ok(source.targetEvidenceReconciliation.parallelogramAreaFormula.directVisualObservedPanels.includes("平行四邊形有2組底跟高"));
  assert.ok(source.targetEvidenceReconciliation.parallelogramAreaFormula.directVisualObservedPanels.includes("如何背住面積公式：平行四邊形底×高"));
  assert.equal(source.targetEvidenceReconciliation.r02AuthorityModified,false);
  assert.equal(source.verificationStateReconciliation.r02FullPageReviewIsCurrentSemanticAuthority,true);
  assert.equal(source.verificationStateReconciliation.currentDirectPdfVisualVerificationCompleted,true);
  assert.equal(source.verificationStateReconciliation.legacyPendingNotesRetainedAsProvenanceOnly,true);
  assert.equal(source.sourceRefAmbiguity,false);
  assert.equal(source.manualSourceChoiceRequired,false);
});

test("Q037 binds current R04 geometry-formula mapping and exact R05 W5 closure",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const mapping=r04.getMapping(KP); assert.ok(mapping);
  const profile=r04.profiles.find(x=>x.profileId==="profile_geometry_formula"); assert.ok(profile);
  assert.equal(mapping.mappingId,"r04map_g5a_u09_parallelogram_area_formula");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  for(const capabilityId of PROFILE_REQUIRED) assert.ok(mapping.requiredRuntimeCapabilityIds.includes(capabilityId),capabilityId);
  assert.deepEqual(profile.optionalCapabilityIds,[]);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(mapping.runtimeCapabilityDeliveryState,"BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
  assert.deepEqual(sorted(mapping.undeliveredRequiredCapabilityIds),sorted(DIRECT_CONTRACT_ONLY));
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.requiredRuntimeCapabilityIds,mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.optionalRuntimeCapabilityIds,mapping.optionalRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.forbiddenRuntimeCapabilityIds,mapping.forbiddenRuntimeCapabilityIds);
  const assignment=r05.getAssignment(KP); assert.ok(assignment);
  assert.equal(assignment.deliveryWaveId,"R05-W5");
  assert.equal(assignment.intraWavePrerequisiteRank,3);
  assert.equal(assignment.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.queueAuthority.requiredW5CapabilityIds),sorted(REQUIRED_W5));
});

test("Q037 scope owns only parallelogram base-height area semantics and protects future siblings",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.deepEqual(preflight.q037ScopeLock.includedKnowledgePointIds,[KP]);
  assert.ok(preflight.q037ScopeLock.includedRelations.includes("COMPUTE_PARALLELOGRAM_AREA_AS_BASE_TIMES_PERPENDICULAR_HEIGHT"));
  assert.ok(preflight.q037ScopeLock.includedRelations.includes("REQUIRE_HEIGHT_PERPENDICULAR_TO_SELECTED_BASE_OR_BASE_EXTENSION"));
  assert.ok(preflight.q037ScopeLock.includedRelations.includes("PRESERVE_AREA_UNDER_CUT_REARRANGEMENT_TO_EQUIVALENT_BASE_HEIGHT_RECTANGLE"));
  const future={
    kp_g5a_u09_triangle_area_formula:46,
    kp_g5a_u09_trapezoid_area_formula:46,
    kp_g5a_u09_area_unknown_dimension:57,
    kp_g5a_u09_composite_polygon_area:62,
  };
  for(const [kp,position] of Object.entries(future)){
    const row=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp)); assert.ok(row,kp);
    assert.equal(row.queuePosition,position,kp);
    assert.equal(preflight.q037ScopeLock.deferredFrozenQueueOwnership[kp],`Q${String(position).padStart(3,"0")}`);
    assert.ok(preflight.q037ScopeLock.excludedSameSourceKnowledgePointIds.includes(kp));
  }
  assert.equal(preflight.q037ScopeLock.baseHeightRolesMustRemainPaired,true);
  assert.equal(preflight.q037ScopeLock.selectedHeightMustBePerpendicularToSelectedBaseOrExtension,true);
  assert.equal(preflight.q037ScopeLock.cutRearrangementMustPreserveArea,true);
  assert.equal(preflight.q037ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q037ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q037ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q037ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q037ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q037ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q037ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q037ScopeLock.q038OrLaterTouched,false);
});

test("Q037 preflight uses bounded validation and stops before implementation",()=>{
  assert.equal(preflight.preflightValidationBoundary.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(preflight.preflightValidationBoundary.derivedLane,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(preflight.preflightValidationBoundary.allowedLaneGateIds,["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(preflight.preflightValidationBoundary.focusedNodeContractRequired,true);
  assert.equal(preflight.preflightValidationBoundary.nodeOnlyReadbackRequired,true);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(preflight.preflightDecision.exactFrozenQueueRowResolved,true);
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ037ImplementationPlanning,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.r02AuthorityBoundForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLockedForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.futureSameSourceSiblingProtectionLocked,true);
  assert.equal(preflight.preflightDecision.currentDirectPdfVisualVerificationCompleted,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice037Implementation");
});
