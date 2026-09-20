import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q012-g5b-u11-compare-construct-trend-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q012_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q012_PREFLIGHT.validation.json");
const KPS=["kp_g5b_u11_compare_two_data_series","kp_g5b_u11_construct_line_chart","kp_g5b_u11_line_chart_trend"];
const PREV=["kp_g5b_u11_bar_line_chart_reading","kp_g5b_u11_chart_scale_broken_axis"];
const CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"];

test("W6 Q012 preflight binds exact queue position 12 after Q011 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[11];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,12);
  assert.equal(slice.sliceId,"p06e_q012_r3_g5b_u11_5b11_profile_chart_data_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice012Implementation");
  assert.equal(slice.previousSliceId,"p06e_q011_r3_g4a_u07_4a07_profile_pattern_relation_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g5b_u11_5b11");
  assert.equal(slice.intraWavePrerequisiteRank,3);
  assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,993);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"160a1bedf9f9c460fe0c43effaa641104eab4890");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35498111953);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.rerunRequiredCodeChange,false);
});

test("W6 Q012 reuses G5B-U11 reviewed source authority for exact three candidates",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g5b_u11_5b11");
  assert.ok(source);
  assert.equal(source.sourceTitle,"長條圖與折線圖");
  assert.equal(source.sourcePdfTitle,"meow911_5b11_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  const targets=KPS.map(id=>source.candidates.find(row=>row.knowledgePointId===id));
  assert.ok(targets.every(Boolean));
  assert.deepEqual(targets.map(x=>x.canonicalNameZh),["雙資料系列比較","繪製折線圖","折線圖趨勢判讀"]);
  assert.equal(targets[0].reasoningInvariant,"比較必須使用相同時間或類別位置與共同尺度。");
  assert.equal(targets[1].reasoningInvariant,"每個資料點位置須同時符合橫軸類別與縱軸數值。");
  assert.equal(targets[2].reasoningInvariant,"趨勢由相鄰資料點變化決定，不可只看單一點。");
  assert.equal(p.sourceAuthority.reusedFromQ010SourceAuthority,true);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
});

test("W6 Q012 locks profile_chart_data and exact frozen capability closure",()=>{
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
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q012 locks comparison, construction and trend semantics without reowning Q010",()=>{
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedPredecessorKnowledgePointIds,PREV);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.matchedCategoryOrTimeAlignmentRequired,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.commonScaleRequiredForSeriesComparison,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.lineChartConstructionRequiresScalePointPlacementAndOrderedConnection,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.lineChartTrendRequiresAdjacentPointChanges,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.trendCannotBeInferredFromSinglePoint,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.q010ValueReadingReownershipAllowed,false);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.q010BrokenAxisReownershipAllowed,false);
});

test("W6 Q012 stays planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q012ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q012ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q012ScopeLock.q001ToQ011ProductMutationAllowed,false);
  assert.equal(p.q012ScopeLock.q013OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice012Implementation");
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
