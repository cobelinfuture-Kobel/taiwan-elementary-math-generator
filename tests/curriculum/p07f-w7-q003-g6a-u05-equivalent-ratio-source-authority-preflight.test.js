import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q003-g6a-u05-equivalent-ratio-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const KP="kp_g6a_u05_equivalent_ratio";

test("W7 Q003 preflight binds exact third frozen queue slice after Q002 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue(),slice=result.queueEntries[2];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueEntries.length,26);assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,3);
  assert.equal(slice.sliceId,"p07e_q003_r7_g6a_u05_6a05_profile_integer_operations_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice003Implementation");
  assert.equal(slice.previousSliceId,"p07e_q002_r6_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u05_6a05");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u05_6a05"]);
  assert.equal(slice.intraWavePrerequisiteRank,7);
  assert.equal(slice.primaryRuntimeProfileId,"profile_integer_operations");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW7CapabilityIds,[]);
  assert.equal(p.predecessorD0Evidence.q002Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q002MergeSha,"43b622b851b9d242b6bddcc95f45d0faf2444d73");
  assert.equal(p.predecessorD0Evidence.q002PostMergeWorkflowRunId,35591837212);
  assert.equal(p.predecessorD0Evidence.exactDeployedAssetDigestParity,true);
});

test("W7 Q003 source authority resolves equivalent-ratio semantics on page 3 only",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u05_6a05");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"相等的比");
  assert.equal(target.capabilityStatement,"學生能以同比例乘除建立相等的比。");
  assert.equal(target.reasoningInvariant,"前後項同乘或同除非零數時比值不變。");
  assert.deepEqual(target.evidencePages,[3]);assert.equal(target.category,"ratio");
  assert.deepEqual(p.sourceAuthority.evidenceResolution.exactQ003DirectVisualAnchorPages,[3]);
  assert.equal(p.sourceAuthority.directPageEvidence.page3.q003DirectEvidenceResolution,"EQUIVALENT_RATIO_COMMON_SCALE_FACTOR_ONLY");
  assert.equal(p.sourceAuthority.directPageEvidence.page3.semanticIdentity,"EQUIVALENT_RATIO_PRESERVES_RATIO_VALUE_UNDER_COMMON_NONZERO_SCALE_FACTOR");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q003 preserves frozen integer-operations execution envelope without changing semantic ownership",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP);assert.ok(r04);
  const r05=getR05DeliveryWaveAssignment(KP);assert.ok(r05);
  assert.equal(r05.primaryRuntimeProfileId,"profile_integer_operations");
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.baseDeliveryWaveId,"R05-W1");
  assert.equal(r05.waveEscalatedByPrerequisite,true);
  assert.equal(r05.intraWavePrerequisiteRank,7);
  assert.equal(r04.primaryRuntimeProfileId,r05.primaryRuntimeProfileId);
  assert.equal(p.runtimeCapabilityAuthority.queueFrozenProfileId,r05.primaryRuntimeProfileId);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
  assert.equal(p.runtimeCapabilityAuthority.semanticProfileInterpretation,"EXECUTION_ENVELOPE_ONLY_NOT_KNOWLEDGE_POINT_SEMANTIC_OWNER");
  assert.equal(p.runtimeCapabilityAuthority.genericIntegerOperationsSemanticReownershipAllowed,false);
});

test("W7 Q003 semantic lock allows common scale only and protects Q001 Q002 Q005 Q009 ownership",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"EQUIVALENT_RATIO_PRESERVES_RATIO_VALUE_UNDER_COMMON_NONZERO_SCALE_FACTOR");
  assert.equal(s.q001OrderedAntecedentConsequentRolesRemainPrerequisite,true);
  assert.equal(s.q002RatioValueEqualityRemainsPrerequisite,true);
  assert.equal(s.commonScaleFactorMustBeAppliedToBothTerms,true);
  assert.equal(s.commonScaleFactorMustBeNonzero,true);
  assert.equal(s.forwardCommonIntegerMultiplicationAllowed,true);
  assert.equal(s.reverseCommonIntegerDivisionAllowedOnlyWhenExactOnBothTerms,true);
  assert.equal(s.ratioValueMustRemainInvariant,true);
  assert.equal(s.crossProductEqualityMayBeUsedByValidatorInternally,true);
  assert.equal(s.crossMultiplicationMayNotBeTaughtOrSurfacedAsQ003Method,true);
  assert.equal(s.q001RatioNotationTeachingReownershipAllowed,false);
  assert.equal(s.q002RatioValueTeachingReownershipAllowed,false);
  assert.equal(s.simplestIntegerRatioFinalFormRequired,false);
  assert.equal(s.simplifyToCoprimeRatioAllowed,false);
  assert.equal(s.ratioPartitionApplicationAllowed,false);
  assert.equal(s.percentConversionAllowed,false);
  assert.equal(s.applicationContextAllowed,false);
  assert.equal(s.genericIntegerOperationsDrillAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
});

test("W7 Q003 preflight stays planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q003_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q003_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(impact.scopeGuards.q001ProductMutation,false);
  assert.equal(impact.scopeGuards.q002ProductMutation,false);
  assert.equal(impact.scopeGuards.q004OrLater,false);
  assert.equal(p.q003ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q003ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice003Implementation");
});
