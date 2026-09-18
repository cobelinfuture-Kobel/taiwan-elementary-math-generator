import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q010-g5b-u11-bar-line-read-broken-axis-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q010_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q010_PREFLIGHT.validation.json");
const KPS=["kp_g5b_u11_bar_line_chart_reading","kp_g5b_u11_chart_scale_broken_axis"];
const FUTURE=["kp_g5b_u11_compare_two_data_series","kp_g5b_u11_construct_line_chart","kp_g5b_u11_line_chart_trend"];
const CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"];
const SLICE="p06e_q010_r2_g5b_u11_5b11_profile_chart_data_c1";

test("W6 Q010 preflight binds exact queue position 10 after Q009 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[9];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(p.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(slice.queuePosition,10);
  assert.equal(slice.sliceId,SLICE);
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice010Implementation");
  assert.equal(slice.previousSliceId,queue.orderedSliceIds[8]);
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g5b_u11_5b11");
  assert.equal(slice.intraWavePrerequisiteRank,2);
  assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.prNumber,989);
  assert.equal(p.predecessorD0Evidence.mergeSha,"bfe59b138418b03e5441becc5e61c6201e27c912");
  assert.equal(p.predecessorD0Evidence.postMergeWorkflowRunId,35362709946);
  assert.equal(p.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q010 binds 5B-U11 full-page source authority and exact two R02 candidates",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g5b_u11_5b11");
  assert.ok(source);
  assert.equal(source.sourceTitle,"長條圖與折線圖");
  assert.equal(source.sourcePdfTitle,"meow911_5b11_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  const targets=KPS.map(id=>source.candidates.find(row=>row.knowledgePointId===id));
  assert.ok(targets.every(Boolean));
  assert.deepEqual(targets.map(x=>x.canonicalNameZh),["長條圖折線圖報讀","圖表尺度與省略刻度"]);
  assert.equal(targets[0].capabilityStatement,"學生能依標題、座標軸與圖例讀取資料。");
  assert.equal(targets[0].reasoningInvariant,"每個點或長條必須依正確刻度對應數值。");
  assert.equal(targets[1].capabilityStatement,"學生能處理每格非1或有省略起點的圖表。");
  assert.equal(targets[1].reasoningInvariant,"數值必須依標示尺度換算，視覺高度不能直接當數值。");
  assert.deepEqual(targets.map(x=>x.evidencePages),[[1,2],[1,2]]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1iGM9Ji-q4SBcoG7y1Wza_UYtjvjxPsMX");
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q010 locks native chart runtime and exact frozen capability closure",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_chart_data");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_chart_data_model","cap_data_domain_validator","cap_chart_representation"]);
  for(const kp of KPS){
    const mapping=getR04KnowledgePointCapabilityMapping(kp);
    assert.ok(mapping);
    assert.equal(mapping.primaryRuntimeProfileId,"profile_chart_data");
    assert.equal(mapping.classificationRuleId,"rule_chart_data");
  }
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.deepEqual(p.runtimeCapabilityAuthority.dependencyClosureCapabilityIds,["cap_table_data_model"]);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.barAndLineChartValueReadingIsCore,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.nonUnitScaleMustBeSupported,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.omittedAxisStartMustBeSupported,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.visualHeightMayNotSubstituteForScaleValue,true);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q010 protects exact Q012 same-source future semantics",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g5b_u11_5b11");
  assert.deepEqual(FUTURE.map(id=>source.candidates.find(row=>row.knowledgePointId===id)?.canonicalNameZh),["雙資料系列比較","繪製折線圖","折線圖趨勢判讀"]);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.map(x=>x.knowledgePointId),FUTURE);
  assert.ok(p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.every(x=>x.futureQueuePosition===12&&x.futureSliceId==="p06e_q012_r3_g5b_u11_5b11_profile_chart_data_c1"));
  assert.equal(p.semanticProfileLock.implementationSemanticLock.lineChartTrendAsTargetIsCore,false);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.twoSeriesComparisonAsTargetIsCore,false);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.lineChartConstructionAsTargetIsCore,false);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.q012FutureKpReownershipAllowed,false);
});

test("W6 Q010 stays planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q010ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q010ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q010ScopeLock.q001ToQ009ProductMutationAllowed,false);
  assert.equal(p.q010ScopeLock.q011OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice010Implementation");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  const lane=validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(p.preflightDecision.sourceRefAmbiguity,false);
});
