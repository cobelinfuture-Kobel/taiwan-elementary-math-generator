import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q025-g6a-u08-average-and-relative-speed-source-authority-preflight.json");
const q024=read("docs/ci/latest-p07f-w7-q024-pages-e2e.json");
const r02a=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const r02b=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const impact=read("data/project/change-impact/P07F_W7_Q025_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q025_PREFLIGHT.validation.json");
const KPS=["kp_average_speed_total_distance_time","kp_relative_speed_meeting_chasing"];
const AVG_REQUIRED=["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_speed_rate_reasoning","cap_ratio_rate_validator","cap_quantity_dimension_unit_identity","cap_text_application_representation","cap_quantity_semantic_role_binding"];
const REL_REQUIRED=[...AVG_REQUIRED,"cap_relation_model_binding","cap_word_problem_semantic_validation"];

test("Q025 exact frozen two-KP successor follows Q024 D0",()=>{
 const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[24];
 assert.equal(q024.status,"PASS_E6_D0_COMPLETE");assert.equal(q024.exactHeadSha,"23654f2af6f638a52ea0ed0b3a934e0f874e9194");
 assert.equal(row.queuePosition,25);assert.equal(row.sliceId,"p07e_q025_r14_g6a_u08_6a08_profile_speed_rate_c1");
 assert.equal(row.previousSliceId,"p07e_q024_r13_g6b_u04_6b04_profile_ratio_percent_c1");assert.equal(row.primarySourceNodeId,"g6a_u08_6a08");
 assert.deepEqual([...row.supportingSourceNodeIds],["g6a_u08_6a08","g6b_u02_6b02"]);assert.equal(row.primaryRuntimeProfileId,"profile_speed_rate");
 assert.equal(row.intraWavePrerequisiteRank,14);assert.equal(row.knowledgePointCount,2);assert.deepEqual([...row.knowledgePointIds],KPS);
 assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_speed_rate_reasoning"]);
});

test("Q025 binds exact primary and supporting R02 candidates",()=>{
 const a=r02a.sourceRecords.find(x=>x.sourceNodeId==="g6a_u08_6a08"),b=r02b.sourceRecords.find(x=>x.sourceNodeId==="g6b_u02_6b02");
 for(const src of [a,b]){
  assert.ok(src);assert.equal(src.sourceTitle,"認識速率");assert.deepEqual(src.reviewedPages,[1,2]);
  const avg=src.candidates.find(x=>x.knowledgePointId===KPS[0]),rel=src.candidates.find(x=>x.knowledgePointId===KPS[1]);
  assert.equal(avg.canonicalNameZh,"全程平均速率");assert.equal(avg.capabilityStatement,"學生能以總距離除以總時間求平均速率。");
  assert.equal(avg.reasoningInvariant,"平均速率不能直接平均各段速率，必須使用全程總量。");
  assert.equal(rel.canonicalNameZh,"相遇追趕相對速率");assert.equal(rel.capabilityStatement,"學生能以速率和或差處理相遇與追趕。");
  assert.equal(rel.reasoningInvariant,"相向距離縮短率為速率和，同向追趕率為速率差。");
 }
 assert.equal(pre.sourceAuthority.primary.sourcePdfDriveFileId,"1mI0hgM7Nknw01PFUCPf-IwgZTtUi3zP-");
 assert.equal(pre.sourceAuthority.supporting.sourcePdfDriveFileId,"1fvyF0xYVTUSRBJPIVTa5nfHb5li6wTi4");
 assert.equal(pre.sourceAuthority.connectorTextNotUsedAsSemanticAuthority,true);
});

test("Q025 average-speed exact R03 R04 R05 authority is frozen",()=>{
 const r03=getR03DirectPrerequisites(KPS[0]),r04=getR04KnowledgePointCapabilityMapping(KPS[0]),r05=getR05DeliveryWaveAssignment(KPS[0]);
 assert.deepEqual(r03.map(x=>x.edgeId),["kpe_r03_0009"]);assert.deepEqual(r03.map(x=>x.fromKnowledgePointId),["kp_speed_distance_time_relation"]);
 assert.ok(r03.every(x=>x.dependencyStrength==="required"&&x.dependencyRole==="relation_model_foundation"&&x.distanceBearing===true));
 assert.equal(r04.mappingId,"r04map_average_speed_total_distance_time");assert.equal(r04.primaryRuntimeProfileId,"profile_speed_rate");assert.equal(r04.classificationRuleId,"rule_speed_rate");
 assert.deepEqual([...r04.appliedModifierIds],["mod_quantity_relation_semantics"]);assert.deepEqual([...r04.requiredRuntimeCapabilityIds],AVG_REQUIRED);
 assert.deepEqual([...r04.optionalRuntimeCapabilityIds],["cap_unit_conversion","cap_global_context_binding"]);
 assert.equal(r05.assignmentId,"r05wave_average_speed_total_distance_time");assert.equal(r05.deliveryWaveId,"R05-W7");assert.equal(r05.intraWavePrerequisiteRank,14);assert.equal(r05.prerequisiteWaveLowerBound,7);assert.equal(r05.waveEscalatedByPrerequisite,false);
});

test("Q025 relative-speed exact R03 R04 R05 authority is frozen",()=>{
 const r03=getR03DirectPrerequisites(KPS[1]),r04=getR04KnowledgePointCapabilityMapping(KPS[1]),r05=getR05DeliveryWaveAssignment(KPS[1]);
 assert.deepEqual(r03.map(x=>x.edgeId),["kpe_r03_0650","kpe_r03_0651"]);
 assert.deepEqual(r03.map(x=>x.fromKnowledgePointId),["kp_g4a_u08_num_add_sub_left_assoc","kp_speed_distance_time_relation"]);
 assert.ok(r03.every(x=>x.dependencyStrength==="required"&&x.dependencyRole==="relation_model_foundation"&&x.distanceBearing===true));
 assert.equal(r04.mappingId,"r04map_relative_speed_meeting_chasing");assert.equal(r04.primaryRuntimeProfileId,"profile_speed_rate");assert.equal(r04.classificationRuleId,"rule_speed_rate");
 assert.deepEqual([...r04.appliedModifierIds],["mod_quantity_relation_semantics","mod_application_semantics"]);assert.deepEqual([...r04.requiredRuntimeCapabilityIds],REL_REQUIRED);
 assert.deepEqual([...r04.optionalRuntimeCapabilityIds],["cap_unit_conversion","cap_global_context_binding","cap_pbl_task_set_projection"]);
 assert.equal(r05.assignmentId,"r05wave_relative_speed_meeting_chasing");assert.equal(r05.deliveryWaveId,"R05-W7");assert.equal(r05.intraWavePrerequisiteRank,14);assert.equal(r05.prerequisiteWaveLowerBound,7);assert.equal(r05.waveEscalatedByPrerequisite,false);
});

test("Q025 semantics distinguish total-average from relative-speed relation",()=>{
 const s=pre.semanticProfileLock.implementationSemanticLock;
 assert.equal(s.totalDistanceOverTotalTimeRequired,true);assert.equal(s.directSegmentSpeedArithmeticMeanAllowed,false);
 assert.equal(s.meetingUsesSpeedSumRequired,true);assert.equal(s.chasingUsesPositiveSpeedDifferenceRequired,true);
 assert.equal(s.compatibleDistanceTimeRateUnitsRequired,true);assert.equal(s.quantitySemanticRoleBindingRequired,true);assert.equal(s.answerBackSubstitutionRequired,true);
 assert.equal(s.speedUnitConversionOwnershipAllowed,false);assert.equal(s.effectiveSpeedCurrentWindOwnershipAllowed,false);assert.equal(s.predecessorSpeedRelationReownershipAllowed,false);
 assert.equal(s.sameUnitMixedModeAllowed,false);assert.equal(s.crossUnitMixedModeAllowed,false);
 assert.deepEqual(pre.r02ReviewedCandidateAuthority.protectedLaterW7KnowledgePointIds,["kp_effective_speed_current_wind"]);
});

test("Q025 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
 assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.goalDistance.reduced,"D3_TO_D2");assert.equal(pre.executableAuthorityReadback.pending,false);
 assert.equal(pre.preflightDecision.predecessorQ024D0Verified,true);assert.equal(pre.preflightDecision.exactTwoKnowledgePointSetResolved,true);
 assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ025ImplementationPlanning,true);assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
 assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice025Implementation");
 assert.equal(pre.q025ScopeLock.implementationAllowedByThisPreflight,false);assert.equal(pre.q025ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(impact.currentKnowledgePointIds,KPS);
 assert.ok(Object.values(impact.unitKnowledgePointGateStatus).every(x=>x==="PLANNING_READY_IMPLEMENTATION_APPROVAL_REQUIRED"));
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
 assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
});
