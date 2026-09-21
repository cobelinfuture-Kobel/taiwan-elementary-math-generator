import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q016-g6b-u06-compare-pie-charts-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q016_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q016_PREFLIGHT.validation.json");
const TARGET="kp_g6b_u06_compare_pie_charts";
const CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"];
const NON_Q016=["kp_g6b_u06_pie_chart_percent_angle_conversion","kp_g6b_u06_pie_chart_quantity_from_rate","kp_g6b_u06_construct_pie_chart"];

test("W6 Q016 preflight binds exact frozen queue position 16 after Q015 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[15];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,16);
  assert.equal(slice.sliceId,"p06e_q016_r6_g6b_u06_6b06_profile_chart_data_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice016Implementation");
  assert.equal(slice.previousSliceId,"p06e_q015_r6_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6b_u06_6b06");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6b_u06_6b06"]);
  assert.equal(slice.intraWavePrerequisiteRank,6);
  assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[TARGET]);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,1002);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"619bdfb2230ece80abd5c54a17be4ccd26bfbcff");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35551905025);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q016 reuses G6B-U06 full-page reviewed source authority and binds compare target",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6b_u06_6b06");
  assert.ok(source);
  assert.equal(source.sourceTitle,"圓形圖");
  assert.equal(source.sourcePdfTitle,"meow911_6b06_source.pdf");
  assert.deepEqual(source.reviewedPages,[1]);
  const target=source.candidates.find(row=>row.knowledgePointId===TARGET);
  assert.ok(target);
  assert.equal(target.canonicalNameZh,"比較圓形圖");
  assert.equal(target.capabilityStatement,"學生能比較不同總量圓形圖的比例與實際數量。");
  assert.equal(target.reasoningInvariant,"相同扇形比例不代表實際數量相同，必須結合各圖總量。");
  assert.deepEqual(target.evidencePages,[1]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1mVO-Fp8NqR68eevJ3aJK-MdoiHEYWqhz");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,518350);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.sourceRefAmbiguity,false);
});

test("W6 Q016 locks profile_chart_data plus table dependency closure",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_chart_data");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_chart_data_model","cap_data_domain_validator","cap_chart_representation"]);
  const mapping=getR04KnowledgePointCapabilityMapping(TARGET);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_chart_data");
  assert.equal(mapping.classificationRuleId,"rule_chart_data");
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.deepEqual(p.runtimeCapabilityAuthority.dependencyClosureCapabilityIds,["cap_table_data_model"]);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q016 locks cross-chart comparison semantics without reowning adjacent candidates",()=>{
  assert.deepEqual([...p.r02ReviewedCandidateAuthority.sameSourceNonQ016KnowledgePointIds].sort(),[...NON_Q016].sort());
  assert.equal(p.r02ReviewedCandidateAuthority.remainingCandidateCountAfterQ016,3);
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.crossChartComparisonIsCore,true);
  assert.equal(s.compareSectorProportionsAcrossCharts,true);
  assert.equal(s.compareActualQuantitiesAcrossDifferentTotals,true);
  assert.equal(s.eachChartTotalMustRemainBoundToItsOwnChart,true);
  assert.equal(s.equalSectorRateDoesNotImplyEqualActualQuantityAcrossDifferentTotals,true);
  assert.equal(s.actualQuantityComparisonMayUseTotalTimesSectorRateAsSupportingCalculation,true);
  assert.equal(s.standaloneQuantityFromRateCandidateReownershipAllowed,false);
  assert.equal(s.q014PartWholePredecessorReownershipAllowed,false);
  assert.equal(s.explicitPercentAngleConversionIsCore,false);
  assert.equal(s.pieChartConstructionIsCore,false);
  assert.equal(s.probabilityTopicAdmitted,false);
});

test("W6 Q016 remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q016ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q016ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q016ScopeLock.q001ToQ015ProductMutationAllowed,false);
  assert.equal(p.q016ScopeLock.q017OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice016Implementation");
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
