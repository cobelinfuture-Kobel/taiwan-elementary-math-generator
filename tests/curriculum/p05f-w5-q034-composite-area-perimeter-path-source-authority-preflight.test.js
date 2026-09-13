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
const preflight=read("data/curriculum/full-product/p05f/q034-g4b-u07-composite-area-perimeter-path-source-authority-preflight.json");
const q026=read("data/curriculum/full-product/p05f/q026-g4b-u07-rectangle-square-area-formula-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const KPS=["kp_g4b_u07_composite_rectilinear_area","kp_g4b_u07_perimeter_path_sum"];
const REQUIRED_W5=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"];
const DIRECT_R04_CONTRACT_ONLY=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation"];
const sorted=values=>[...values].sort();

test("Q034 binds exact frozen queue row and Q033 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===34); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q034_r3_g4b_u07_4b07_profile_geometry_formula_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice034Implementation");
  assert.equal(row.previousSliceId,"p05e_q033_r3_g4b_u02_4b02_profile_geometry_property_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.primarySourceNodeId,"g4b_u07_4b07");
  assert.equal(row.intraWavePrerequisiteRank,3);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,2);
  assert.deepEqual(row.knowledgePointIds,KPS);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,908);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"d9294906d947b454463ccb26cf2ecc4d720a6933");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId,"34733749964");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId,"34733802710");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34733802755");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10310710023");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:38a37e1a69dc462b7630b28ad371a72bff6f2a74c9a4defa4c1f3066cb692e66");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
});

test("Q034 binds both exact R02 candidates and reuses Q026 same-source identity without inventing visual evidence",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4b_u07_4b07"); assert.ok(source);
  assert.equal(source.sourceTitle,"周長與面積");
  assert.equal(source.sourcePdfTitle,"meow911_4b07_source.pdf");
  assert.equal(source.pageCount,3);
  assert.deepEqual(source.reviewedPages,[1,2,3]);
  const candidates=KPS.map(id=>source.candidates.find(x=>x.knowledgePointId===id));
  assert.ok(candidates.every(Boolean));
  assert.equal(candidates[0].canonicalNameZh,"複合直角圖形面積");
  assert.equal(candidates[0].capabilityStatement,"學生能以分割或補形求複合圖形面積。");
  assert.equal(candidates[0].reasoningInvariant,"分割面積和或大圖扣小圖必須與原圖覆蓋區域等值。");
  assert.deepEqual(candidates[0].evidencePages,[2]);
  assert.equal(candidates[1].canonicalNameZh,"周長與封閉邊界");
  assert.equal(candidates[1].capabilityStatement,"學生能將封閉圖形各邊長相加求周長。");
  assert.equal(candidates[1].reasoningInvariant,"周長只計外部邊界一次，內部線段不列入。");
  assert.deepEqual(candidates[1].evidencePages,[1]);
  for(let i=0;i<KPS.length;i++){
    assert.equal(preflight.r02ReviewedCandidateAuthority[i].knowledgePointId,candidates[i].knowledgePointId);
    assert.equal(preflight.r02ReviewedCandidateAuthority[i].capabilityStatement,candidates[i].capabilityStatement);
    assert.equal(preflight.r02ReviewedCandidateAuthority[i].reasoningInvariant,candidates[i].reasoningInvariant);
    assert.deepEqual(preflight.r02ReviewedCandidateAuthority[i].evidencePages,candidates[i].evidencePages);
  }
  assert.equal(q026.sourceAuthority.sourcePdfDriveFileId,preflight.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(q026.sourceAuthority.sourceMetadataDriveFileId,preflight.sourceAuthority.sourceMetadataDriveFileId);
  assert.equal(q026.sourceAuthority.verificationNotesDriveFileId,preflight.sourceAuthority.verificationNotesDriveFileId);
  assert.equal(q026.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity,false);
  assert.equal(preflight.sourceAuthority.sourceRefAmbiguity,false);
  assert.ok(q026.sourceAuthority.directVisualEvidence.page2.observedPanels.includes("複合L形的面積"));
  assert.ok(q026.sourceAuthority.directVisualEvidence.page2.observedPanels.includes("複合凸形的面積算法"));
  assert.ok(q026.sourceAuthority.directVisualEvidence.page2.observedPanels.includes("複合凹形的面積"));
  assert.deepEqual(preflight.sourceAuthority.targetEvidenceReconciliation.compositeRectilinearArea.q026DirectVisualCorroborationPages,[2]);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.perimeterPathSum.newDirectVisualClaimAddedByQ034Preflight,false);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.embeddedHeaderUrlMismatchIsNonBlocking,true);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.r02AuthorityModified,false);
});

test("Q034 binds current R04 mappings and exact R05 dependency-closed W5 capabilities",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const mappings=KPS.map(id=>r04.getMapping(id));
  const assignments=KPS.map(id=>r05.getAssignment(id));
  assert.ok(mappings.every(Boolean));
  assert.ok(assignments.every(Boolean));
  for(let i=0;i<KPS.length;i++){
    const mapping=mappings[i];
    const bound=preflight.runtimeCapabilityAuthority.perKnowledgePointMappings[i];
    const assignment=assignments[i];
    assert.equal(mapping.knowledgePointId,KPS[i]);
    assert.equal(mapping.mappingId,`r04map_${KPS[i].replace(/^kp_/,"")}`);
    assert.equal(mapping.mappingId,bound.mappingId);
    assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
    assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
    assert.deepEqual(mapping.appliedModifierIds,[]);
    assert.deepEqual(mapping.requiredRuntimeCapabilityIds,bound.requiredRuntimeCapabilityIds);
    assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
    assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
    assert.equal(mapping.runtimeCapabilityDeliveryState,"BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
    assert.deepEqual(sorted(mapping.undeliveredRequiredCapabilityIds),sorted(DIRECT_R04_CONTRACT_ONLY));
    assert.equal(assignment.deliveryWaveId,"R05-W5");
    assert.equal(assignment.intraWavePrerequisiteRank,3);
    assert.equal(assignment.primaryRuntimeProfileId,"profile_geometry_formula");
    assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  }
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.directR04ContractOnlyCapabilityIds),sorted(DIRECT_R04_CONTRACT_ONLY));
  assert.deepEqual(preflight.runtimeCapabilityAuthority.r05DependencyClosureCapabilityIds,["cap_geometry_property_reasoning"]);
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.queueAuthority.requiredW5CapabilityIds),sorted(REQUIRED_W5));
});

test("Q034 scope reuses Q026 area formula and protects frozen Q043/Q050 ownership",()=>{
  assert.deepEqual(preflight.q034ScopeLock.includedKnowledgePointIds,KPS);
  assert.deepEqual(preflight.q034ScopeLock.protectedExistingSameSourceKnowledgePointIds,["kp_g4b_u07_rectangle_square_area_formula"]);
  assert.deepEqual(sorted(preflight.q034ScopeLock.excludedSameSourceKnowledgePointIds),sorted(["kp_g4b_u07_rectangle_square_perimeter_formula","kp_g4b_u07_composite_perimeter"]));
  assert.equal(preflight.q034ScopeLock.deferredFrozenQueueOwnership.kp_g4b_u07_rectangle_square_perimeter_formula,"Q043");
  assert.equal(preflight.q034ScopeLock.deferredFrozenQueueOwnership.kp_g4b_u07_composite_perimeter,"Q050");
  assert.equal(preflight.q034ScopeLock.compositeAreaMustPreserveCoverageEquivalence,true);
  assert.equal(preflight.q034ScopeLock.perimeterMustUseOuterBoundaryOnly,true);
  assert.equal(preflight.q034ScopeLock.q026AreaFormulaPrerequisiteReusedNotReowned,true);
  assert.equal(preflight.q034ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q034ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q034ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q034ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q034ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q034ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q034ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q034ScopeLock.q035OrLaterTouched,false);
});

test("Q034 preflight uses bounded validation and stops before separately approved implementation",()=>{
  assert.equal(preflight.preflightValidationBoundary.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(preflight.preflightValidationBoundary.derivedLane,"SHARED_RUNTIME_BOUNDED");
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(preflight.preflightDecision.exactFrozenQueueRowResolved,true);
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ034ImplementationPlanning,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice034Implementation");
});
