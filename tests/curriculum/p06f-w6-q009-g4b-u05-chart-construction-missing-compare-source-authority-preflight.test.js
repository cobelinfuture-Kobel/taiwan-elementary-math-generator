import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q009-g4b-u05-chart-construction-missing-compare-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q009_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q009_PREFLIGHT.validation.json");
const KPS=["kp_g4b_u05_bar_chart_construction","kp_g4b_u05_chart_missing_value_total","kp_g4b_u05_multi_category_chart_compare"];
const CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"];
const SLICE="p06e_q009_r2_g4b_u05_4b05_profile_chart_data_c1";

test("W6 Q009 preflight binds exact queue position 9 after Q008 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[8];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(p.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(slice.queuePosition,9);
  assert.equal(slice.sliceId,SLICE);
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice009Implementation");
  assert.equal(slice.previousSliceId,queue.orderedSliceIds[7]);
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4b_u05_4b05");
  assert.equal(slice.intraWavePrerequisiteRank,2);
  assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,987);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"eb289ece6a32a8617de2005103508d6c18143b0f");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35358205496);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.sameSourcePredecessor.prNumber,985);
  assert.equal(p.predecessorD0Evidence.sameSourcePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q009 reuses G4B-U05 full-page visual authority for all three final same-source candidates",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g4b_u05_4b05");
  assert.ok(source);
  assert.equal(source.sourceTitle,"統計圖表");
  assert.equal(source.sourcePdfTitle,"meow911_4b05_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  const targets=KPS.map(id=>source.candidates.find(row=>row.knowledgePointId===id));
  assert.ok(targets.every(Boolean));
  assert.deepEqual(targets.map(x=>x.canonicalNameZh),["繪製長條圖","圖表合計與缺值","多類別圖表比較"]);
  assert.equal(targets[0].capabilityStatement,"學生能由資料表設定刻度並畫出正確長條圖。");
  assert.equal(targets[0].reasoningInvariant,"每個類別長條高度須與資料值及共同尺度一致。");
  assert.equal(targets[1].capabilityStatement,"學生能由總量與部分圖表資料求缺失值。");
  assert.equal(targets[1].reasoningInvariant,"所有類別數值和必須等於指定總量。");
  assert.equal(targets[2].capabilityStatement,"學生能比較不同類別的大小、差量與排序。");
  assert.equal(targets[2].reasoningInvariant,"所有比較必須使用相同尺度與對應類別。");
  assert.deepEqual(targets.map(x=>x.evidencePages),[[1,2],[1,2],[1,2]]);
  assert.equal(p.sourceAuthority.reusedFromQ007SourceAuthority,true);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q009 locks native chart semantics and exact frozen capability closure",()=>{
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
  assert.equal(p.semanticProfileLock.classification,"NATIVE_CHART_DATA_RUNTIME_WITH_SOURCE_BACKED_CONSTRUCTION_MISSING_AND_COMPARE_SEMANTICS");
  assert.equal(p.semanticProfileLock.implementationSemanticLock.barChartConstructionIsCore,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.missingValueFromTotalIsCore,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.multiCategoryComparisonIsCore,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.q007PredecessorReownershipAllowed,false);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q009 is final G4B-U05 W6 slice without mixed/application/Q010 expansion",()=>{
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates,[]);
  assert.equal(p.preflightDecision.finalSameSourceW6Slice,true);
  assert.equal(p.q009ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q009ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q009ScopeLock.q001ToQ008ProductMutationAllowed,false);
  assert.equal(p.q009ScopeLock.q010OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice009Implementation");
});

test("W6 Q009 preflight remains SHARED_RUNTIME_BOUNDED and Node-only",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.q010OrLater,false);
  const lane=validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(p.preflightDecision.sourceRefAmbiguity,false);
});
