import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR02GlobalKnowledgePointRegistry} from "../../src/curriculum/global/r02-global-kp-candidate-reconciliation.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const preflight=read("data/curriculum/full-product/p05f/q063-g5a-u06-missing-addend-structure-source-authority-preflight.json");
const source=read("data/curriculum/knowledge/units/g5a_u06_5a06.knowledge-operation.json");
const evidence=read("data/curriculum/application/evidence/w02-source13-pdf-evidence-inventory.json");
const index=read("data/curriculum/global/candidates/r02/source-authority-reconciliation-index.json");
const policy=read("data/curriculum/global/runtime/r04/runtime-capability-mapping-policy.json");
const KP="kp_g5a_u06_missing_addend_structure";
const CAPS=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"];
const SIBLINGS=[
  "kp_g5a_u06_unlike_fraction_add",
  "kp_g5a_u06_unlike_fraction_sub",
  "kp_g5a_u06_mixed_improper_add_sub",
  "kp_g5a_u06_measurement_difference_context",
  "kp_g5a_u06_reciprocal_unit_fraction_sum",
  "kp_g5a_u06_unlike_fraction_compare"
];
const sorted=v=>[...v].sort();

test("Q063 is the exact final frozen W5 row and Q062 D0 predecessor is bound",()=>{
  const q=materializeP05EW5DirectProductVerticalSliceQueue();
  const row=q.queueEntries.find(x=>x.queuePosition===63);
  assert.equal(q.queueFrozen,true);
  assert.equal(q.queueRegistryParity,true);
  assert.equal(q.metrics.queueSliceCount,63);
  assert.equal(q.derivedRegistrySnapshot.queueDigest,"a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.ok(row);
  assert.equal(row,q.queueEntries.at(-1));
  assert.equal(row.sliceId,"p05e_q063_r9_g5a_u06_5a06_profile_geometry_property_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice063Implementation");
  assert.equal(row.previousSliceId,"p05e_q062_r7_g5a_u09_5a09_profile_geometry_formula_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.primarySourceNodeId,"g5a_u06_5a06");
  assert.deepEqual(row.supportingSourceNodeIds,["g5a_u06_5a06"]);
  assert.equal(row.intraWavePrerequisiteRank,9);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(CAPS));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  const p=preflight.previousSliceD0Evidence;
  assert.equal(p.preflightPrNumber,967);
  assert.equal(p.productPrNumber,968);
  assert.equal(p.productHeadSha,"fa84eff929e4f4e403fd3508393186761b433c82");
  assert.equal(p.productMergeSha,"b0d7a5ae08aacdf71ba66a337dc55c2a6318453c");
  assert.equal(p.prGateRunId,"35167263378");
  assert.equal(p.exactPagesRunId,"35167346117");
  assert.equal(p.evidenceArtifactId,"10475258693");
  assert.equal(p.evidenceArtifactDigest,"sha256:f7d7778b1f9d9b0aa2a5baa74b331d11114b008df829c1f5e4e4e9841a379c41");
  assert.equal(p.prGateConclusion,"success");
  assert.equal(p.exactPagesWorkflowConclusion,"success");
  assert.equal(p.exactPagesEvidenceBoundToProductMergeSha,true);
  assert.equal(p.status,"PASS_E6_D0_COMPLETE");
});

test("Q063 binds the W02 full-page source evidence and exact missing-addend candidate",()=>{
  assert.equal(source.sourceNodeId,"g5a_u06_5a06");
  assert.equal(source.sourceTitle,"異分母分數加減");
  assert.equal(source.domainFamily,"unlike_denominator_fraction_addition_subtraction");
  assert.equal(source.sourceEvidence.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(source.sourceEvidence.reviewedPages,[1,2]);
  assert.equal(source.sourceEvidence.sha256,"670d4916c1627177cbd483942b5829fb4dab3dc622fc832b9f2a7abba2e30f83");
  const candidate=source.knowledgePoints.find(x=>x.candidateId===KP);
  assert.deepEqual(candidate,{
    candidateId:KP,
    name:"分數和的缺項推理",
    scope:"由總和與已知分數求未知加數，含三角形配置。",
    evidencePages:[1,2],
    applicationClassification:"APPLICATION_NOT_APPLICABLE",
    classificationRationale:"屬算式結構與逆運算推理。"
  });
  assert.deepEqual(preflight.sourceAuthority.targetCandidate,candidate);
  const inv=evidence.records.find(x=>x.sourceNodeId==="g5a_u06_5a06");
  assert.ok(inv);
  assert.equal(inv.sourcePdfDriveFileId,"1E6TqH-QfF7UMiSgUL1hl5_luge50rPy3");
  assert.equal(inv.sourcePdfFileName,"meow911_5a06_source.pdf");
  assert.equal(inv.sha256,"670d4916c1627177cbd483942b5829fb4dab3dc622fc832b9f2a7abba2e30f83");
  assert.equal(inv.pageCount,2);
  assert.equal(inv.contentIdentityGroup,"pdf_670d4916c162");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId,inv.sourcePdfDriveFileId);
  assert.equal(preflight.sourceAuthority.sourcePdfSha256,inv.sha256);
  assert.equal(preflight.sourceAuthority.sourceRefAmbiguity,false);
  assert.equal(preflight.sourceAuthority.manualSourceChoiceRequired,false);
});

test("Q063 target is reconciled into R02 from W02 authority without alias",()=>{
  const entry=index.existingAuthoritySources.find(x=>x.sourceNodeId==="g5a_u06_5a06");
  assert.ok(entry);
  assert.equal(entry.authorityPath,"data/curriculum/knowledge/units/g5a_u06_5a06.knowledge-operation.json");
  assert.equal(entry.projectionMode,"PAGE_EVIDENCED_W02_CANDIDATE_RECONCILIATION");
  assert.equal(entry.candidateStatus,"CANDIDATE_ONLY");
  assert.equal(index.semanticIdentityRules.canonicalKnowledgePointAliases[KP],undefined);
  const r02=materializeR02GlobalKnowledgePointRegistry();
  const row=r02.knowledgePoints.find(x=>x.knowledgePointId===KP);
  assert.ok(row);
  assert.equal(row.canonicalNameZh,"分數和的缺項推理");
  assert.equal(row.capabilityStatement,"學生能由總和與已知分數求未知加數，含三角形配置。");
  assert.equal(row.reasoningInvariant,"由總和與已知分數求未知加數，含三角形配置；改變數值或題面時必須保留相同核心判定或運算關係。");
  assert.equal(row.candidateStatus,"CANDIDATE_ONLY");
  assert.deepEqual(row.sourceRefs.map(x=>x.sourceNodeId),["g5a_u06_5a06"]);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.r02CanonicalKnowledgePointId,row.knowledgePointId);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.r02CanonicalNameZh,row.canonicalNameZh);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.r02CapabilityStatement,row.capabilityStatement);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.r02ReasoningInvariant,row.reasoningInvariant);
  assert.equal(preflight.sourceAuthority.targetEvidenceReconciliation.canonicalAliasApplied,false);
});

test("Q063 binds the current frozen R04 geometry-property mapping and R05 rank-9 closure",()=>{
  const geometryRuleIndex=policy.classificationRules.findIndex(x=>x.ruleId==="rule_geometry_property");
  const fractionRuleIndex=policy.classificationRules.findIndex(x=>x.ruleId==="rule_fraction");
  assert.ok(geometryRuleIndex>=0&&fractionRuleIndex>=0&&geometryRuleIndex<fractionRuleIndex);
  assert.ok(policy.classificationRules[geometryRuleIndex].anyTerms.includes("三角形"));
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const m=r04.getMapping(KP);
  const bound=preflight.runtimeCapabilityAuthority.mapping;
  assert.ok(m);
  assert.equal(m.mappingId,"r04map_g5a_u06_missing_addend_structure");
  assert.equal(m.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(m.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(m.appliedModifierIds,[]);
  assert.deepEqual(m.requiredRuntimeCapabilityIds,bound.requiredRuntimeCapabilityIds);
  assert.deepEqual(m.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(m.forbiddenRuntimeCapabilityIds,[]);
  const a=materializeR05DeliveryWaveRebase().getAssignment(KP);
  assert.ok(a);
  assert.equal(a.deliveryWaveId,"R05-W5");
  assert.equal(a.intraWavePrerequisiteRank,9);
  assert.equal(a.primaryRuntimeProfileId,"profile_geometry_property");
  assert.deepEqual(sorted(a.contractOnlyRequiredCapabilityIds),sorted(CAPS));
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(CAPS));
  const tension=preflight.runtimeCapabilityAuthority.runtimeSemanticTension;
  assert.equal(tension.present,true);
  assert.equal(tension.frozenRuntimeProfileMustRemain,"profile_geometry_property");
  assert.equal(tension.mathematicalCoreMustRemain,"FRACTION_SUM_MISSING_ADDEND_INVERSE_REASONING");
  assert.equal(tension.implementationMayNotReclassifyR04,true);
  assert.equal(tension.implementationMustValidateFractionEquality,true);
});

test("Q063 owns only missing-addend reasoning and protects all six same-source non-target candidates",()=>{
  const sourceIds=source.knowledgePoints.map(x=>x.candidateId);
  assert.deepEqual(preflight.sameSourceAuthorityBoundary.sameSourceCandidateIds,sourceIds);
  assert.deepEqual(sorted(preflight.sameSourceAuthorityBoundary.protectedNonTargetCandidateIds),sorted(SIBLINGS));
  assert.equal(preflight.sameSourceAuthorityBoundary.q063OwnsOnlyMissingAddendStructure,true);
  const q=materializeP05EW5DirectProductVerticalSliceQueue();
  const row=q.queueEntries.at(-1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  for(const sibling of SIBLINGS) assert.equal(row.knowledgePointIds.includes(sibling),false,sibling);
  const s=preflight.q063ScopeLock;
  assert.deepEqual(s.includedKnowledgePointIds,[KP]);
  assert.equal(s.unknownAddendMustReconstructTotal,true);
  assert.equal(s.fractionSemanticCoreMustBeValidated,true);
  assert.equal(s.triangleConfigurationIsRepresentationNotGeometryReownership,true);
  assert.equal(s.applicationSuitabilityFromW02,"APPLICATION_NOT_APPLICABLE");
});

test("Q063 excludes sibling reownership generic geometry drift mixed modes and post-W5 expansion",()=>{
  const s=preflight.q063ScopeLock;
  for(const relation of [
    "REOWN_UNLIKE_FRACTION_ADDITION",
    "REOWN_UNLIKE_FRACTION_SUBTRACTION",
    "REOWN_MIXED_IMPROPER_ADD_SUB",
    "REOWN_MEASUREMENT_DIFFERENCE_CONTEXT",
    "REOWN_RECIPROCAL_UNIT_FRACTION_SUM",
    "REOWN_UNLIKE_FRACTION_COMPARE",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "GENERIC_GEOMETRY_PROPERTY_SUBSTITUTION",
    "TRIANGLE_SIDE_OR_ANGLE_PROPERTY_CONTENT",
    "SAME_UNIT_MIXED_MODE",
    "CROSS_UNIT_MIXED_MODE",
    "FROZEN_QUEUE_RECLASSIFICATION",
    "POST_W5_QUEUE_EXPANSION"
  ]) assert.ok(s.excludedRelations.includes(relation),relation);
  for(const key of [
    "applicationImplementationAllowedByThisPreflight",
    "implementationAllowedByThisPreflight",
    "publicProductAdmissionAllowedByThisPreflight",
    "sameUnitMixedTouched",
    "crossUnitMixedTouched",
    "frozenQueueAuthorityTouched",
    "r02AuthorityTouched",
    "r04AuthorityTouched",
    "r05AuthorityTouched",
    "postW5QueueTouched"
  ]) assert.equal(s[key],false,key);
});

test("Q063 preflight remains bounded and stops at the final implementation approval boundary",()=>{
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
  assert.equal(d.finalFrozenW5SliceConfirmed,true);
  assert.equal(d.sourceAuthoritySufficientForQ063ImplementationPlanning,true);
  assert.equal(d.previousSliceD0Satisfied,true);
  assert.equal(d.w02AuthorityBoundForTargetKnowledgePoint,true);
  assert.equal(d.r02ReconciledCandidateBoundForTargetKnowledgePoint,true);
  assert.equal(d.runtimeCapabilityContractLocked,true);
  assert.equal(d.runtimeSemanticTensionExplicitlyBounded,true);
  assert.equal(d.sameSourceNonTargetCandidatesProtected,true);
  assert.equal(d.manualSourceChoiceRequired,false);
  assert.equal(d.sourceRefAmbiguity,false);
  assert.equal(d.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(d.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(d.nextTask,"P05F_W5DirectProductVerticalSlice063Implementation");
});
