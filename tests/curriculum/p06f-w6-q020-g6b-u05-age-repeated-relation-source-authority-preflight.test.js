import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q020-g6b-u05-age-repeated-relation-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const KP="kp_g6b_u05_age_or_repeated_relation_problem";

test("W6 Q020 preflight verifies Q019 exact deployed E6/D0 and classifies full-regression failures as baseline-only",()=>{
  const d=p.predecessorD0Evidence.immediatePredecessor;
  assert.equal(d.implementationPrNumber,1010);
  assert.equal(d.implementationMergeSha,"2b819e648cabf44947c3f260ebab3583c7fb2aeb");
  assert.equal(d.postMergeTriggerRepairPrNumber,1011);
  assert.equal(d.d0CloseoutMergeSha,"708541e019225168e3e7520c10db319140092330");
  assert.equal(d.pagesDeployWorkflowRunId,35564642705);
  assert.equal(d.postMergeWorkflowRunId,35564642690);
  assert.equal(d.postMergeWorkflowConclusion,"success");
  assert.equal(d.liveReportStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(d.classicUiAcceptanceStatus,"PASS_P06F_W6_Q019_CLASSIC_UI_ACCEPTANCE");
  const a=p.predecessorD0Evidence.postMergeFullRegressionAttribution;
  assert.equal(a.currentFailureCount,134);
  assert.equal(a.comparisonQ018FailureCount,134);
  assert.equal(a.originalBaselineFailureCount,134);
  assert.equal(a.addedFailureCount,0);
  assert.equal(a.removedFailureCount,0);
  assert.equal(a.failureNameSetIdenticalAcrossAllThree,true);
  assert.equal(a.classification,"BASELINE_ONLY_NON_GATING_FOR_Q019_D0");
  assert.equal(p.predecessorD0Evidence.currentMainCompatibilityReadback.q019ProductRuntimeSelectorWorksheetPathsChanged,false);
});

test("W6 Q020 preflight binds exact frozen final queue position 20 after Q019 D0",()=>{
  const result=materializeP06EW6DirectProductVerticalSliceQueue();
  const slice=result.queueEntries[19];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueEntries.length,20);
  assert.equal(slice.queuePosition,20);
  assert.equal(slice.sliceId,"p06e_q020_r11_g6b_u05_6b05_profile_word_problem_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice020Implementation");
  assert.equal(slice.previousSliceId,"p06e_q019_r10_g6b_u05_6b05_profile_decimal_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6b_u05_6b05");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6b_u05_6b05"]);
  assert.equal(slice.intraWavePrerequisiteRank,11);
  assert.equal(slice.primaryRuntimeProfileId,"profile_word_problem");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW6CapabilityIds,["cap_symbolic_relation_reasoning"]);
  assert.equal(p.queueAuthority.isFinalFrozenW6Slice,true);
});

test("W6 Q020 reuses exact G6B-U05 full-page source authority and binds the R02 age-invariant candidate",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6b_u05_6b05");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"年齡與不變差關係");
  assert.equal(target.capabilityStatement,"學生能利用經過相同時間後年齡差不變解題。");
  assert.equal(target.reasoningInvariant,"兩人的年齡同增同減時差量保持不變。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(target.category,"problem");
  assert.equal(target.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"19lrR3_bvpKIoJq5DsKaiQOUecsCzNDsl");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,849178);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"1be6a253b422a427bf4a20a09ee478400f39a11e9b817c1acee308e5f6b9403b");
  assert.equal(p.sourceAuthority.pageCount,2);
  assert.equal(p.sourceAuthority.reviewMethod,"REUSED_CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI_FROM_Q019");
  assert.deepEqual(p.sourceAuthority.visualReadback.targetEvidencePages,[1]);
  assert.equal(p.sourceAuthority.visualReadback.sourceSemanticIdentities[0],"AGE_DIFFERENCE_INVARIANT_UNDER_EQUAL_TIME_SHIFT");
  assert.equal(p.sourceAuthority.evidenceResolution.page2MayNotBeUsedToReownQ019SumDifferenceCore,true);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W6 Q020 frozen profile_word_problem mapping is exact and W6 dependency is symbolic-relation reasoning",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_word_problem");assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,[
    "cap_symbolic_relation_reasoning",
    "cap_relation_model_binding",
    "cap_word_problem_semantic_validation",
    "cap_text_application_representation"
  ]);
  assert.deepEqual(profile.optionalCapabilityIds,["cap_global_context_binding","cap_pbl_task_set_projection"]);
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_word_problem");
  assert.equal(mapping.classificationRuleId,"rule_word_problem");
  assert.deepEqual(mapping.appliedModifierIds,["mod_application_semantics"]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,p.runtimeCapabilityAuthority.exactMappingOptionalRuntimeCapabilityIds);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,["cap_symbolic_relation_reasoning"]);
  assert.equal(p.runtimeCapabilityAuthority.profileSemanticAlignment.present,true);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q020 semantic lock keeps equal-time-shift age difference invariant as core and protects adjacent source ownership",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"AGE_DIFFERENCE_INVARIANT_UNDER_EQUAL_TIME_SHIFT");
  assert.equal(s.ageContextIsSemanticCore,true);
  assert.equal(s.bothAgesUseSameTimeShift,true);
  assert.equal(s.ageDifferenceMustRemainInvariant,true);
  assert.equal(s.shiftedAgeRelationMustBeSatisfiedWhenPresent,true);
  assert.equal(s.shiftedRelationMayUseSourceBackedMultiplicativeCondition,true);
  assert.equal(s.currentAndShiftedRelationsMustBackSubstitute,true);
  assert.equal(s.invalidNegativeAgeStatesMustFailClosed,true);
  assert.equal(s.q019SumDifferenceCoreReownershipAllowed,false);
  assert.equal(s.generalSumMultipleProblemReownershipAllowed,false);
  assert.equal(s.generalDifferenceMultipleProblemReownershipAllowed,false);
  assert.equal(s.workOrDistributionStrategyReownershipAllowed,false);
  assert.equal(s.genericSequenceOrRecurrenceReownershipAllowed,false);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,["kp_g6b_u05_sum_difference_problem"]);
});

test("W6 Q020 remains planning-only SHARED_RUNTIME_BOUNDED and stops before implementation",()=>{
  assert.equal(p.q020ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q020ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q020ScopeLock.q001ToQ019ProductMutationAllowed,false);
  assert.equal(p.q020ScopeLock.frozenQueueTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice020Implementation");
  const impact=read("data/project/change-impact/P06F_W6_Q020_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P06F_W6_Q020_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(p.preflightDecision.sourceRefAmbiguity,false);
});
