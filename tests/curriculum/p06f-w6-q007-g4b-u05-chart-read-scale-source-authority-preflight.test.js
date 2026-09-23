import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q007-g4b-u05-chart-read-scale-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q007_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q007_PREFLIGHT.validation.json");
const KPS=["kp_g4b_u05_bar_chart_reading","kp_g4b_u05_chart_scale_interpretation"];
const CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"];
const SLICE="p06e_q007_r1_g4b_u05_4b05_profile_chart_data_c1";

test("W6 Q007 preflight binds the exact seventh executable queue slice after Q006 D0",()=>{
  const materialized=materializeP06EW6DirectProductVerticalSliceQueue(),slice=materialized.queueEntries[6];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(p.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(slice.queuePosition,7);
  assert.equal(slice.sliceId,SLICE);
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice007Implementation");
  assert.equal(slice.previousSliceId,queue.orderedSliceIds[5]);
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4b_u05_4b05");
  assert.equal(slice.intraWavePrerequisiteRank,1);
  assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.prNumber,983);
  assert.equal(p.predecessorD0Evidence.mergeSha,"5935607b872cfda455e3fd92166e2c8ae7a0ccc8");
  assert.equal(p.predecessorD0Evidence.postMergeWorkflowRunId,35344768307);
  assert.equal(p.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.classicUiAcceptanceStatus,"PASS_P06F_W6_Q006_CLASSIC_UI_ACCEPTANCE");
});

test("W6 Q007 source authority binds the two R02 full-page reviewed chart candidates",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g4b_u05_4b05");
  assert.ok(source);
  assert.equal(source.sourceTitle,"統計圖表");
  assert.equal(source.sourcePdfTitle,"meow911_4b05_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  const targets=KPS.map(id=>source.candidates.find(row=>row.knowledgePointId===id));
  assert.ok(targets.every(Boolean));
  assert.equal(targets[0].canonicalNameZh,"長條圖報讀");
  assert.equal(targets[0].capabilityStatement,"學生能依標題、座標軸與刻度讀取長條圖資料。");
  assert.equal(targets[0].reasoningInvariant,"長條高度必須依縱軸尺度轉換為實際數值。");
  assert.equal(targets[1].canonicalNameZh,"圖表刻度判讀");
  assert.equal(targets[1].capabilityStatement,"學生能判斷每格代表量並處理非一單位刻度。");
  assert.equal(targets[1].reasoningInvariant,"資料值等於格數乘每格代表量。");
  assert.deepEqual(targets.map(x=>x.evidencePages),[[1,2],[1,2]]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"11iHvRfLxyJSFP3a1A9BWiOyQrhDoGgsO");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,855124);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q007 locks the native chart-data runtime envelope and exact W6 capability closure",()=>{
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
  assert.equal(p.semanticProfileLock.classification,"NATIVE_CHART_DATA_RUNTIME_WITH_SOURCE_BACKED_BAR_CHART_AND_SCALE_SEMANTICS");
  assert.equal(p.semanticProfileLock.implementationSemanticLock.barChartReadingIsCore,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.nonUnitScaleMustBeSupported,true);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q007 protects Q009 same-source successors and does not expand product scope",()=>{
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.map(x=>x.knowledgePointId),[
    "kp_g4b_u05_bar_chart_construction",
    "kp_g4b_u05_chart_missing_value_total",
    "kp_g4b_u05_multi_category_chart_compare"
  ]);
  assert.equal(p.q007ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q007ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q007ScopeLock.q001ToQ006ProductMutationAllowed,false);
  assert.equal(p.q007ScopeLock.q008OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice007Implementation");
});

test("W6 Q007 preflight remains SHARED_RUNTIME_BOUNDED and Node-only",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.q008OrLater,false);
  const lane=validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(p.preflightDecision.sourceRefAmbiguity,false);
});
