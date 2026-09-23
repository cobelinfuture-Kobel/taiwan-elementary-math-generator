import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q014-g6b-u06-pie-chart-part-whole-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const capabilities=read("data/curriculum/global/runtime/r04/shared-runtime-capabilities.json");
const impact=read("data/project/change-impact/P06F_W6_Q014_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q014_PREFLIGHT.validation.json");
const TARGET="kp_g6b_u06_pie_chart_part_whole";
const RESERVED=[
  "kp_g6b_u06_pie_chart_percent_angle_conversion",
  "kp_g6b_u06_pie_chart_quantity_from_rate",
  "kp_g6b_u06_construct_pie_chart",
  "kp_g6b_u06_compare_pie_charts",
];
const CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"];

test("W6 Q014 preflight binds exact frozen queue position 14 after Q013 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[13];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,14);
  assert.equal(slice.sliceId,"p06e_q014_r5_g6b_u06_6b06_profile_chart_data_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice014Implementation");
  assert.equal(slice.previousSliceId,"p06e_q013_r4_g4a_u07_4a07_profile_pattern_relation_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6b_u06_6b06");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6b_u06_6b06"]);
  assert.equal(slice.intraWavePrerequisiteRank,5);
  assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[TARGET]);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,997);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"619d07232a0062d7a557125dc7e1929279b506c1");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35546087697);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q014 binds R02 full-page reviewed G6B-U06 part-whole authority and keeps stale Drive notes non-authoritative",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6b_u06_6b06");
  assert.ok(source);
  assert.equal(source.sourceTitle,"圓形圖");
  assert.equal(source.sourcePdfTitle,"meow911_6b06_source.pdf");
  assert.deepEqual(source.reviewedPages,[1]);
  const target=source.candidates.find(row=>row.knowledgePointId===TARGET);
  assert.ok(target);
  assert.equal(target.canonicalNameZh,"圓形圖部分與全體");
  assert.equal(target.capabilityStatement,"學生能理解整圓代表全體，各扇形代表部分。");
  assert.equal(target.reasoningInvariant,"所有扇形比例和為100%，圓心角和為360度。");
  assert.deepEqual(target.evidencePages,[1]);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.ocrUsedAsAuthority,false);
  assert.equal(p.sourceAuthority.driveMetadataReadback.verificationNotesStatus,"pending");
  assert.equal(p.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
  assert.deepEqual(p.r02ReviewedCandidateAuthority.reservedNonQ014KnowledgePointIds,RESERVED);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.reservedW6SuccessorKnowledgePointIds,["kp_g6b_u06_compare_pie_charts"]);
  assert.equal(p.r02ReviewedCandidateAuthority.sameSourceCandidateSetCompleteAfterQ014,false);
  assert.equal(p.r02ReviewedCandidateAuthority.remainingCandidateCountAfterQ014,4);
});

test("W6 Q014 locks profile_chart_data and exact frozen capability closure",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_chart_data");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_chart_data_model","cap_data_domain_validator","cap_chart_representation"]);
  const mapping=getR04KnowledgePointCapabilityMapping(TARGET);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_chart_data");
  assert.equal(mapping.classificationRuleId,"rule_chart_data");
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  const chartData=capabilities.capabilities.find(row=>row.capabilityId==="cap_chart_data_model");
  assert.ok(chartData);
  assert.deepEqual(chartData.dependsOn,["cap_table_data_model"]);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q014 locks pie-chart part-whole semantics without absorbing conversion construction quantity or Q016 comparison",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.wholeCircleRepresentsOneWhole,true);
  assert.equal(s.sectorRepresentsPartOfWhole,true);
  assert.equal(s.allSectorPercentSharesSumTo100,true);
  assert.equal(s.allSectorCentralAnglesSumTo360AsWholeClosureOnly,true);
  assert.equal(s.explicitPercentAngleConversionIsCore,false);
  assert.equal(s.quantityFromRateIsCore,false);
  assert.equal(s.pieChartConstructionIsCore,false);
  assert.equal(s.crossChartComparisonIsCore,false);
  assert.equal(s.q016ComparePieChartsReownershipAllowed,false);
  assert.equal(s.probabilityTopicAdmitted,false);
  assert.equal(s.applicationContextIsCore,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
});

test("W6 Q014 remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q014ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q014ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q014ScopeLock.q001ToQ013ProductMutationAllowed,false);
  assert.equal(p.q014ScopeLock.q015OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice014Implementation");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.q016ComparePieChartsImplementation,false);
  const lane=validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(p.preflightDecision.sourceRefAmbiguity,false);
});
