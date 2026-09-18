import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q008-g3b-u10-table-construct-extrema-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q008_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q008_PREFLIGHT.validation.json");
const KPS=["kp_construct_two_way_table","kp_table_extrema_and_missing_value"];
const CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"];
const SLICE="p06e_q008_r2_g3b_u10_3b10_profile_chart_data_c1";

test("W6 Q008 preflight binds the exact eighth executable queue slice after Q007 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[7];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(p.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(slice.queuePosition,8);
  assert.equal(slice.sliceId,SLICE);
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice008Implementation");
  assert.equal(slice.previousSliceId,queue.orderedSliceIds[6]);
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g3b_u10_3b10");
  assert.equal(slice.intraWavePrerequisiteRank,2);
  assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.prNumber,985);
  assert.equal(p.predecessorD0Evidence.mergeSha,"a4f45ae6c8637adbff35b6fcb0435c5c01fca930");
  assert.equal(p.predecessorD0Evidence.postMergeWorkflowRunId,35348774519);
  assert.equal(p.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.classicUiAcceptanceStatus,"PASS_P06F_W6_Q007_CLASSIC_UI_ACCEPTANCE");
});

test("W6 Q008 reuses one-page G3B-U10 visual authority and binds the two final same-source R02 candidates",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g3b_u10_3b10");
  assert.ok(source);
  assert.equal(source.sourceTitle,"統計表");
  assert.equal(source.sourcePdfTitle,"meow911_3b10_statistics_table.pdf");
  assert.deepEqual(source.reviewedPages,[1]);
  const targets=KPS.map(id=>source.candidates.find(row=>row.knowledgePointId===id));
  assert.ok(targets.every(Boolean));
  assert.equal(targets[0].canonicalNameZh,"建立二維統計表");
  assert.equal(targets[0].capabilityStatement,"學生能把具有兩種分類條件的資料整理成二維表格。");
  assert.equal(targets[0].reasoningInvariant,"每筆原始資料恰好進入一個交叉分類格，列欄合計與總數一致。");
  assert.equal(targets[1].canonicalNameZh,"表格最大最小與缺值推理");
  assert.equal(targets[1].capabilityStatement,"學生能由表格找最大、最小、合計或缺失資料。");
  assert.equal(targets[1].reasoningInvariant,"比較與計算必須使用同一欄列語意，合計與部分資料保持一致。");
  assert.deepEqual(targets.map(x=>x.evidencePages),[[1],[1]]);
  assert.equal(p.sourceAuthority.reusedFromQ003Q004SourceAuthority,true);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q008 preserves table semantics inside the frozen historical chart-data envelope",()=>{
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
  assert.equal(p.semanticProfileArtifactLock.classification,"HISTORICAL_GENERIC_DATA_PROFILE_TERM_COLLISION");
  assert.equal(p.semanticProfileArtifactLock.implementationSemanticLock.twoWayTableConstructionIsCore,true);
  assert.equal(p.semanticProfileArtifactLock.implementationSemanticLock.extremaTotalAndMissingValueReasoningIsCore,true);
  assert.equal(p.semanticProfileArtifactLock.implementationSemanticLock.barLinePieChartReadingIsCore,false);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q008 is the final G3B-U10 W6 slice and does not expand into Q009 or chart semantics",()=>{
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates,[]);
  assert.equal(p.q008ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q008ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q008ScopeLock.q001ToQ007ProductMutationAllowed,false);
  assert.equal(p.q008ScopeLock.q009OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice008Implementation");
});

test("W6 Q008 preflight remains SHARED_RUNTIME_BOUNDED and Node-only",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.q009OrLater,false);
  const lane=validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(p.preflightDecision.sourceRefAmbiguity,false);
});
