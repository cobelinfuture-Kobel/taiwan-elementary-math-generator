import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q002-g6a-u05-ratio-value-source-authority-preflight.json");
const q001=read("data/curriculum/full-product/p07f/q001-g6a-u05-ratio-notation-order-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const KP="kp_g6a_u05_ratio_value";

test("W7 Q002 preflight binds the exact second frozen queue slice after Q001 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  const slice=result.queueEntries[1];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueEntries.length,26);
  assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,2);
  assert.equal(slice.sliceId,"p07e_q002_r6_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice002Implementation");
  assert.equal(slice.previousSliceId,"p07e_q001_r5_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u05_6a05");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u05_6a05"]);
  assert.equal(slice.intraWavePrerequisiteRank,6);
  assert.equal(slice.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW7CapabilityIds,["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
  assert.equal(p.queueAuthority.queueDigest,"ad37a23f07b3de22a088f5bf9f59e2b45f13cc3c350bb84def21860d21135843");
  assert.equal(p.predecessorD0Evidence.q001Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q001MergeSha,"843c06eacf7018f49c5a26b48f4440a778d79639");
  assert.equal(p.predecessorD0Evidence.q001PostMergeWorkflowRunId,35583148993);
  assert.equal(p.predecessorD0Evidence.q001PostMergeWorkflowRunAttempt,2);
  assert.equal(p.predecessorD0Evidence.exactDeployedAssetDigestParity,true);
  assert.equal(p.predecessorD0Evidence.classicUiAcceptanceStatus,"PASS_P07F_W7_Q001_CLASSIC_UI_ACCEPTANCE");
});

test("W7 Q002 binds the R02 ratio-value candidate to page 2 of the same reviewed source",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u05_6a05");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"比值");
  assert.equal(target.capabilityStatement,"學生能以比的前項除以後項求比值。");
  assert.equal(target.reasoningInvariant,"後項不得為0，比值與分數a除以b等價。");
  assert.deepEqual(target.evidencePages,[2]);
  assert.equal(target.category,"ratio");
  assert.equal(target.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,q001.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,q001.sourceAuthority.sourcePdfSizeBytes);
  assert.equal(p.sourceAuthority.sourcePdfSha256,q001.sourceAuthority.sourcePdfSha256);
  assert.deepEqual(p.sourceAuthority.reviewedPages,[1,2,3,4]);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.ok(q001.sourceAuthority.directPageEvidence.page2.visibleFamilies.includes("RATIO_VALUE_TO_PROPORTION_CROSS_MULTIPLICATION"));
  assert.deepEqual(p.sourceAuthority.evidenceResolution.exactQ002DirectVisualAnchorPages,[2]);
  assert.equal(p.sourceAuthority.directPageEvidence.page2.q002DirectEvidenceResolution,"RATIO_VALUE_PORTION_ONLY");
  assert.equal(p.sourceAuthority.directPageEvidence.page2.semanticIdentity,"RATIO_VALUE_EQUALS_ANTECEDENT_DIVIDED_BY_NONZERO_CONSEQUENT");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q002 protects Q001 predecessor ownership and all later G6A-U05 KPs",()=>{
  assert.deepEqual(p.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointRows.map(x=>x.knowledgePointId),["kp_g6a_u05_ratio_notation_order"]);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.futureOwnedKnowledgePointRows.map(x=>x.knowledgePointId),[
    "kp_g6a_u05_equivalent_ratio",
    "kp_g6a_u05_simplify_ratio",
    "kp_g6a_u05_ratio_partition_application"
  ]);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.futureOwnedKnowledgePointRows.map(x=>x.queuePosition),[3,5,9]);
  const excluded=p.q002ScopeLock.excludedRelations;
  assert.ok(excluded.includes("RATIO_NOTATION_ROLE_TEACHING_REOWNERSHIP"));
  assert.ok(excluded.includes("EQUIVALENT_RATIO_TRANSFORMATION"));
  assert.ok(excluded.includes("SIMPLIFY_TO_COPRIME_INTEGER_RATIO"));
  assert.ok(excluded.includes("RATIO_PARTITION_APPLICATION"));
  assert.ok(excluded.includes("PROPORTION_CROSS_MULTIPLICATION"));
  assert.ok(excluded.includes("Q003_OR_LATER_IMPLEMENTATION"));
});

test("W7 Q002 profile_ratio_percent mapping is exact and unmodified",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_ratio_percent");assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,[
    "cap_ratio_percent_reasoning",
    "cap_ratio_rate_validator",
    "cap_text_application_representation"
  ]);
  assert.deepEqual(profile.optionalCapabilityIds,[]);
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(mapping.classificationRuleId,"rule_ratio_percent");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W7 Q002 semantic lock admits ratio value only",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"RATIO_VALUE_EQUALS_ANTECEDENT_DIVIDED_BY_NONZERO_CONSEQUENT");
  assert.equal(s.q001OrderedAntecedentConsequentRolesRemainPrerequisite,true);
  assert.equal(s.q001RoleOrderMustBePreserved,true);
  assert.equal(s.ratioValueOperation,"ANTECEDENT_DIVIDED_BY_CONSEQUENT");
  assert.equal(s.consequentMustBeNonZero,true);
  assert.equal(s.fractionEquivalenceAOverBRequired,true);
  assert.equal(s.ratioNotationTeachingReownershipAllowed,false);
  assert.equal(s.equivalentRatioTransformationAllowed,false);
  assert.equal(s.simplestIntegerRatioTransformationAllowed,false);
  assert.equal(s.ratioPartitionApplicationAllowed,false);
  assert.equal(s.proportionCrossMultiplicationAllowed,false);
  assert.equal(s.directProportionTableOrGraphAllowed,false);
  assert.equal(s.percentConversionAllowed,false);
  assert.equal(s.applicationContextAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
});

test("W7 Q002 preflight stays planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q002_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q002_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(impact.scopeGuards.q001ProductMutation,false);
  assert.equal(impact.scopeGuards.q003OrLater,false);
  assert.equal(p.q002ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q002ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q002ScopeLock.frozenQueueTouched,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice002Implementation");
});
