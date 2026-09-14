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
const preflight=read("data/curriculum/full-product/p05f/q046-g5a-u09-triangle-trapezoid-area-formulas-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const KPS=["kp_g5a_u09_trapezoid_area_formula","kp_g5a_u09_triangle_area_formula"];
const REQUIRED_W5=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"];
const PROFILE_REQUIRED=["cap_geometry_formula_evaluation","cap_geometry_domain_validator","cap_geometry_diagram_representation"];
const DIRECT_CONTRACT_ONLY=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation"];
const sorted=values=>[...values].sort();

test("Q046 binds exact frozen queue row and Q045 E6 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===46); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q046_r4_g5a_u09_5a09_profile_geometry_formula_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice046Implementation");
  assert.equal(row.previousSliceId,"p05e_q045_r4_g5a_u07_5a07_profile_geometry_property_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.assignedDeliveryWaveId,"R05-W5");
  assert.equal(row.primarySourceNodeId,"g5a_u09_5a09");
  assert.deepEqual(row.supportingSourceNodeIds,["g5a_u09_5a09"]);
  assert.equal(row.intraWavePrerequisiteRank,4);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,2);
  assert.deepEqual(row.knowledgePointIds,KPS);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  const e=preflight.previousSliceD0Evidence;
  assert.equal(e.preflightPrNumber,932);
  assert.equal(e.productPrNumber,933);
  assert.equal(e.productHeadSha,"7bad8a5b167d4727efc14392436543319a09d64c");
  assert.equal(e.productMergeSha,"0581b6de445bbe8deeaeecffc98bb4d81186fcea");
  assert.equal(e.prGateRunId,"34817079931");
  assert.equal(e.exactPagesRunId,"34817196760");
  assert.equal(e.evidenceArtifactId,"10336632695");
  assert.equal(e.evidenceArtifactDigest,"sha256:3cab69a0ec24b2e23b3c430e29471dcb9f00c90417b58adad1aa72d93814c3a0");
  assert.equal(e.postMergeTestContractRepairPrNumber,934);
  assert.equal(e.postMergeTestContractRepairMergeSha,"11c1278e0601b891ad2a96c3b0bd76beee2e000f");
  assert.equal(e.status,"PASS_E6_D0_COMPLETE");
  assert.equal(e.prGateConclusion,"success");
  assert.equal(e.exactPagesWorkflowConclusion,"success");
  assert.equal(e.exactPagesEvidenceBoundToProductMergeSha,true);
});

test("Q046 binds exact R02 triangle and trapezoid formula candidates",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5a_u09_5a09"); assert.ok(source);
  assert.equal(source.sourceTitle,"平行四邊形三角形梯形面積");
  assert.equal(source.sourcePdfTitle,"meow911_5a09_source.pdf");
  assert.equal(source.pageCount,4);
  assert.deepEqual(source.reviewedPages,[1,2,3,4]);
  for(const kp of KPS){
    const candidate=source.candidates.find(x=>x.knowledgePointId===kp); assert.ok(candidate,kp);
    const bound=preflight.r02ReviewedCandidateAuthority.knowledgePoints.find(x=>x.knowledgePointId===kp); assert.ok(bound,kp);
    assert.deepEqual(bound,candidate);
    assert.equal(candidate.category,"geometry");
    assert.equal(candidate.applicationSuitability,"APPLICATION_COMPATIBLE");
  }
  const triangle=source.candidates.find(x=>x.knowledgePointId==="kp_g5a_u09_triangle_area_formula");
  const trapezoid=source.candidates.find(x=>x.knowledgePointId==="kp_g5a_u09_trapezoid_area_formula");
  assert.equal(triangle.canonicalNameZh,"三角形面積");
  assert.equal(triangle.capabilityStatement,"學生能以底乘高除以2求三角形面積。");
  assert.equal(triangle.reasoningInvariant,"同底等高三角形面積是平行四邊形的一半。");
  assert.deepEqual(triangle.evidencePages,[2]);
  assert.equal(trapezoid.canonicalNameZh,"梯形面積");
  assert.equal(trapezoid.capabilityStatement,"學生能以上下底和乘高除以2求梯形面積。");
  assert.equal(trapezoid.reasoningInvariant,"兩個全等梯形可拼成底為上下底和的平行四邊形。");
  assert.deepEqual(trapezoid.evidencePages,[3]);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
});

test("Q046 reuses current same-source identity while R02 remains semantic authority",()=>{
  const source=preflight.sourceAuthority;
  assert.equal(source.sourceNodeId,"g5a_u09_5a09");
  assert.equal(source.sourcePdfTitle,"meow911_5a09_source.pdf");
  assert.equal(source.sourcePdfDriveFileId,"1fvDY9emawKVJgMNyt5oN-TbHvaRtpUy9");
  assert.equal(source.sourceMetadataDriveFileId,"1wWfnemvRk-X5As2l4UvEc2zKHGanlH0y");
  assert.equal(source.verificationNotesDriveFileId,"1NMsQLNSSWLbPbiQcWDXFhdn-Rzg9-iOo");
  assert.equal(source.sourceUrlFromMetadata,"https://meow911.com/5a09/");
  assert.deepEqual(source.targetEvidenceReconciliation.triangleAreaFormula.r02EvidencePages,[2]);
  assert.deepEqual(source.targetEvidenceReconciliation.trapezoidAreaFormula.r02EvidencePages,[3]);
  assert.equal(source.targetEvidenceReconciliation.triangleAreaFormula.currentSemanticAuthority,"R02_FULL_PAGE_VISUAL_READBACK");
  assert.equal(source.targetEvidenceReconciliation.trapezoidAreaFormula.currentSemanticAuthority,"R02_FULL_PAGE_VISUAL_READBACK");
  assert.equal(source.targetEvidenceReconciliation.triangleAreaFormula.samePdfIdentityAlreadyCorroboratedByQ037,true);
  assert.equal(source.targetEvidenceReconciliation.trapezoidAreaFormula.samePdfIdentityAlreadyCorroboratedByQ037,true);
  assert.equal(source.targetEvidenceReconciliation.triangleAreaFormula.newTargetVisualReplayRequiredForPreflight,false);
  assert.equal(source.targetEvidenceReconciliation.trapezoidAreaFormula.newTargetVisualReplayRequiredForPreflight,false);
  assert.equal(source.verificationStateReconciliation.ocrUsedAsAuthority,false);
  assert.equal(source.sourceRefAmbiguity,false);
  assert.equal(source.manualSourceChoiceRequired,false);
});

test("Q046 binds current R04 geometry-formula mappings and exact R05 W5 closure",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const profile=r04.profiles.find(x=>x.profileId==="profile_geometry_formula"); assert.ok(profile);
  assert.deepEqual(profile.optionalCapabilityIds,[]);
  for(const kp of KPS){
    const mapping=r04.getMapping(kp); assert.ok(mapping,kp);
    assert.equal(mapping.mappingId,`r04map_${kp.replace(/^kp_/,"")}`);
    assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
    assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
    assert.deepEqual(mapping.appliedModifierIds,["mod_integer_division"]);
    for(const capabilityId of PROFILE_REQUIRED) assert.ok(mapping.requiredRuntimeCapabilityIds.includes(capabilityId),`${kp}:${capabilityId}`);
    assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_integer_division"),`${kp}:cap_integer_division`);
    assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
    assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
    assert.equal(mapping.runtimeCapabilityDeliveryState,"BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
    assert.deepEqual(sorted(mapping.undeliveredRequiredCapabilityIds),sorted(DIRECT_CONTRACT_ONLY));
    const bound=preflight.runtimeCapabilityAuthority.mappings.find(x=>x.knowledgePointId===kp); assert.ok(bound,kp);
    assert.deepEqual(bound.appliedModifierIds,mapping.appliedModifierIds);
    assert.deepEqual(bound.requiredRuntimeCapabilityIds,mapping.requiredRuntimeCapabilityIds);
    assert.deepEqual(bound.optionalRuntimeCapabilityIds,mapping.optionalRuntimeCapabilityIds);
    assert.deepEqual(bound.forbiddenRuntimeCapabilityIds,mapping.forbiddenRuntimeCapabilityIds);
    const assignment=r05.getAssignment(kp); assert.ok(assignment,kp);
    assert.equal(assignment.deliveryWaveId,"R05-W5");
    assert.equal(assignment.intraWavePrerequisiteRank,4);
    assert.equal(assignment.primaryRuntimeProfileId,"profile_geometry_formula");
    assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  }
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.queueAuthority.requiredW5CapabilityIds),sorted(REQUIRED_W5));
});

test("Q046 owns only triangle and trapezoid formula semantics and protects Q037 Q057 Q062",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.deepEqual(preflight.q046ScopeLock.includedKnowledgePointIds,KPS);
  for(const relation of [
    "COMPUTE_TRIANGLE_AREA_AS_BASE_TIMES_PERPENDICULAR_HEIGHT_DIVIDED_BY_TWO",
    "DERIVE_TRIANGLE_AREA_AS_HALF_OF_EQUAL_BASE_HEIGHT_PARALLELOGRAM",
    "COMPUTE_TRAPEZOID_AREA_AS_SUM_OF_PARALLEL_BASES_TIMES_PERPENDICULAR_HEIGHT_DIVIDED_BY_TWO",
    "DERIVE_TRAPEZOID_AREA_BY_PAIRING_TWO_CONGRUENT_TRAPEZOIDS_INTO_PARALLELOGRAM",
    "REQUIRE_HEIGHT_PERPENDICULAR_TO_SELECTED_BASE_OR_BASE_EXTENSION",
  ]) assert.ok(preflight.q046ScopeLock.includedRelations.includes(relation),relation);
  const q037=queue.queueEntries.find(x=>x.knowledgePointIds.includes("kp_g5a_u09_parallelogram_area_formula")); assert.ok(q037);
  assert.equal(q037.queuePosition,37);
  assert.deepEqual(preflight.q046ScopeLock.protectedExistingSameSourceKnowledgePointIds,["kp_g5a_u09_parallelogram_area_formula"]);
  const future={
    kp_g5a_u09_area_unknown_dimension:57,
    kp_g5a_u09_composite_polygon_area:62,
  };
  for(const [kp,position] of Object.entries(future)){
    const row=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp)); assert.ok(row,kp);
    assert.equal(row.queuePosition,position,kp);
    assert.equal(preflight.q046ScopeLock.deferredFrozenQueueOwnership[kp],`Q${String(position).padStart(3,"0")}`);
    assert.ok(preflight.q046ScopeLock.excludedSameSourceKnowledgePointIds.includes(kp));
  }
  assert.equal(preflight.q046ScopeLock.q037ParallelogramAreaSemanticsMayBeReusedAsPrerequisiteButNotReowned,true);
  assert.equal(preflight.q046ScopeLock.triangleAreaMustUseOneHalfOfBaseTimesPerpendicularHeight,true);
  assert.equal(preflight.q046ScopeLock.trapezoidAreaMustUseOneHalfOfParallelBaseSumTimesPerpendicularHeight,true);
  assert.equal(preflight.q046ScopeLock.selectedHeightMustBePerpendicularToSelectedBaseOrBaseExtension,true);
  assert.equal(preflight.q046ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q046ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q046ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q046ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q046ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q046ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q046ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q046ScopeLock.q047OrLaterTouched,false);
});

test("Q046 preflight uses bounded validation and stops before implementation",()=>{
  const b=preflight.preflightValidationBoundary;
  assert.equal(b.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(b.derivedLane,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(b.allowedLaneGateIds,["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(b.focusedNodeContractRequired,true);
  assert.equal(b.nodeOnlyReadbackRequired,true);
  assert.equal(b.fullRepositoryRegressionAllowed,false);
  assert.equal(b.globalBrowserReplayAllowed,false);
  assert.equal(b.productImplementationAllowed,false);
  assert.equal(b.publicProductAdmissionAllowed,false);
  const d=preflight.preflightDecision;
  assert.equal(d.exactFrozenQueueRowResolved,true);
  assert.equal(d.sourceAuthoritySufficientForQ046ImplementationPlanning,true);
  assert.equal(d.previousSliceD0Satisfied,true);
  assert.equal(d.r02AuthorityBoundForAllTargetKnowledgePoints,true);
  assert.equal(d.runtimeCapabilityContractLockedForAllTargetKnowledgePoints,true);
  assert.equal(d.q037SameSourcePredecessorSemanticsProtected,true);
  assert.equal(d.futureSameSourceSiblingProtectionLocked,true);
  assert.equal(d.manualSourceChoiceRequired,false);
  assert.equal(d.sourceRefAmbiguity,false);
  assert.equal(d.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(d.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(d.nextTask,"P05F_W5DirectProductVerticalSlice046Implementation");
});
