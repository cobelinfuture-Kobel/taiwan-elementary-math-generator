import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const preflight=read("data/curriculum/full-product/p05f/q062-g5a-u09-composite-polygon-area-source-authority-preflight.json");
const q037=read("data/curriculum/full-product/p05f/q037-g5a-u09-parallelogram-area-formula-source-authority-preflight.json");
const q046=read("data/curriculum/full-product/p05f/q046-g5a-u09-triangle-trapezoid-area-formulas-source-authority-preflight.json");
const q057=read("data/curriculum/full-product/p05f/q057-g5a-u09-area-unknown-dimension-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const KP="kp_g5a_u09_composite_polygon_area";
const CAPS=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"];
const sorted=v=>[...v].sort();

test("Q062 binds exact frozen row and Q061 D0 predecessor",()=>{
  const q=materializeP05EW5DirectProductVerticalSliceQueue();
  const row=q.queueEntries.find(x=>x.queuePosition===62);
  assert.equal(q.queueFrozen,true);
  assert.equal(q.queueRegistryParity,true);
  assert.equal(q.derivedRegistrySnapshot.queueDigest,"a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.ok(row);
  assert.equal(row.sliceId,"p05e_q062_r7_g5a_u09_5a09_profile_geometry_formula_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice062Implementation");
  assert.equal(row.previousSliceId,"p05e_q061_r7_g5a_u03_5a03a1_profile_geometry_property_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.primarySourceNodeId,"g5a_u09_5a09");
  assert.deepEqual(row.supportingSourceNodeIds,["g5a_u09_5a09"]);
  assert.equal(row.intraWavePrerequisiteRank,7);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(row.knowledgePointCount,1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(CAPS));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  const p=preflight.previousSliceD0Evidence;
  assert.equal(p.preflightPrNumber,965);
  assert.equal(p.productPrNumber,966);
  assert.equal(p.productHeadSha,"690e7ae3582282534ee7863d3a1a51c764897443");
  assert.equal(p.productMergeSha,"b610402fc072b961e7768d3a243df847cd7e639b");
  assert.equal(p.prGateRunId,"35159426753");
  assert.equal(p.pagesDeploymentRunId,"35159533291");
  assert.equal(p.exactPagesRunId,"35159533192");
  assert.equal(p.evidenceArtifactId,"10471294814");
  assert.equal(p.evidenceArtifactDigest,"sha256:5fd21f49b50b553c510ff20e51b16eff3cb47fb984fe2cb0d8e760c8d52f2d64");
  assert.equal(p.prGateConclusion,"success");
  assert.equal(p.pagesDeploymentConclusion,"success");
  assert.equal(p.exactPagesWorkflowConclusion,"success");
  assert.equal(p.status,"PASS_E6_D0_COMPLETE");
});

test("Q062 reuses verified G5A-U09 source identity from Q037 Q046 and Q057",()=>{
  const s=preflight.sourceAuthority;
  assert.equal(s.sourceNodeId,"g5a_u09_5a09");
  assert.equal(s.sourceTitle,"平行四邊形三角形梯形面積");
  assert.equal(s.sourcePdfTitle,"meow911_5a09_source.pdf");
  assert.equal(s.sourcePdfDriveFileId,"1fvDY9emawKVJgMNyt5oN-TbHvaRtpUy9");
  assert.equal(s.sourceMetadataDriveFileId,"1wWfnemvRk-X5As2l4UvEc2zKHGanlH0y");
  assert.equal(s.verificationNotesDriveFileId,"1NMsQLNSSWLbPbiQcWDXFhdn-Rzg9-iOo");
  for(const prior of [q037,q046,q057]) assert.equal(prior.sourceAuthority.sourcePdfDriveFileId,s.sourcePdfDriveFileId);
  assert.deepEqual(s.targetEvidencePages,[1]);
  assert.equal(s.targetEvidenceReconciliation.compositePolygonArea.sameSourceIdentityAlreadyCorroboratedByQ037Q046Q057,true);
  assert.equal(s.ocrUsedAsAuthority,false);
  assert.equal(s.r02AuthorityModified,false);
  assert.equal(s.sourceRefAmbiguity,false);
  assert.equal(s.manualSourceChoiceRequired,false);
});

test("Q062 locks exact R02 composite-polygon-area candidate on page 1",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5a_u09_5a09");
  const c=source?.candidates.find(x=>x.knowledgePointId===KP);
  assert.ok(c);
  assert.deepEqual(c,{
    knowledgePointId:KP,
    canonicalNameZh:"複合多邊形面積",
    capabilityStatement:"學生能分割成平行四邊形、三角形或梯形求面積。",
    reasoningInvariant:"各不重疊部分面積和等於原圖形面積。",
    category:"geometry",
    evidencePages:[1],
    applicationSuitability:"APPLICATION_COMPATIBLE"
  });
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoint,c);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
});

test("Q062 binds current R04 geometry-formula mapping and exact R05 closure",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const m=r04.getMapping(KP);
  const bound=preflight.runtimeCapabilityAuthority.mapping;
  assert.ok(m);
  assert.equal(m.mappingId,"r04map_g5a_u09_composite_polygon_area");
  assert.equal(m.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(m.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(m.appliedModifierIds,[]);
  assert.deepEqual(m.requiredRuntimeCapabilityIds,bound.requiredRuntimeCapabilityIds);
  assert.deepEqual(m.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(m.forbiddenRuntimeCapabilityIds,[]);
  const a=materializeR05DeliveryWaveRebase().getAssignment(KP);
  assert.ok(a);
  assert.equal(a.deliveryWaveId,"R05-W5");
  assert.equal(a.intraWavePrerequisiteRank,7);
  assert.equal(a.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(sorted(a.contractOnlyRequiredCapabilityIds),sorted(CAPS));
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(CAPS));
});

test("Q062 owns composite area only and protects prior G5A-U09 ownership",()=>{
  const q=materializeP05EW5DirectProductVerticalSliceQueue();
  const owners={
    kp_g5a_u09_parallelogram_area_formula:37,
    kp_g5a_u09_triangle_area_formula:46,
    kp_g5a_u09_trapezoid_area_formula:46,
    kp_g5a_u09_area_unknown_dimension:57,
    kp_g5a_u09_composite_polygon_area:62
  };
  for(const[kp,pos]of Object.entries(owners)){
    const row=q.queueEntries.find(x=>x.knowledgePointIds.includes(kp));
    assert.equal(row?.queuePosition,pos,kp);
  }
  const s=preflight.q062ScopeLock;
  assert.deepEqual(s.includedKnowledgePointIds,[KP]);
  assert.equal(s.protectedExistingSameSourceKnowledgePointOwnership.kp_g5a_u09_parallelogram_area_formula,"Q037");
  assert.equal(s.protectedExistingSameSourceKnowledgePointOwnership.kp_g5a_u09_triangle_area_formula,"Q046");
  assert.equal(s.protectedExistingSameSourceKnowledgePointOwnership.kp_g5a_u09_trapezoid_area_formula,"Q046");
  assert.equal(s.protectedExistingSameSourceKnowledgePointOwnership.kp_g5a_u09_area_unknown_dimension,"Q057");
  assert.equal(s.priorAreaFormulaSemanticsMayBeUsedAsPrerequisitesButNotReowned,true);
  assert.equal(s.compositePartsMustBeNonOverlapping,true);
  assert.equal(s.partAreaSumMustEqualOriginalCompositeArea,true);
});

test("Q062 excludes prior formula reownership application mixed modes and Q063+",()=>{
  const s=preflight.q062ScopeLock;
  for(const r of [
    "REOWN_PARALLELOGRAM_AREA_FORMULA",
    "REOWN_TRIANGLE_AREA_FORMULA",
    "REOWN_TRAPEZOID_AREA_FORMULA",
    "REOWN_AREA_UNKNOWN_DIMENSION",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "SAME_UNIT_MIXED_MODE",
    "CROSS_UNIT_MIXED_MODE",
    "Q063_OR_LATER_SEMANTICS"
  ]) assert.ok(s.excludedRelations.includes(r),r);
  for(const k of [
    "applicationImplementationAllowedByThisPreflight",
    "implementationAllowedByThisPreflight",
    "publicProductAdmissionAllowedByThisPreflight",
    "sameUnitMixedTouched",
    "crossUnitMixedTouched",
    "frozenQueueAuthorityTouched",
    "r02AuthorityTouched",
    "r04AuthorityTouched",
    "r05AuthorityTouched",
    "q063OrLaterTouched"
  ]) assert.equal(s[k],false,k);
});

test("Q062 preflight stays bounded and stops at implementation approval boundary",()=>{
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
  assert.equal(d.sourceAuthoritySufficientForQ062ImplementationPlanning,true);
  assert.equal(d.previousSliceD0Satisfied,true);
  assert.equal(d.r02AuthorityBoundForTargetKnowledgePoint,true);
  assert.equal(d.runtimeCapabilityContractLocked,true);
  assert.equal(d.sameSourcePriorSliceOwnershipProtected,true);
  assert.equal(d.q037Q046Q057SameSourceIdentityReusedWithoutReclassification,true);
  assert.equal(d.manualSourceChoiceRequired,false);
  assert.equal(d.sourceRefAmbiguity,false);
  assert.equal(d.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(d.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(d.nextTask,"P05F_W5DirectProductVerticalSlice062Implementation");
});
