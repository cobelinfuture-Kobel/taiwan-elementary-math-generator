import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q023-speed-distance-time-relation-source-authority-preflight.json");
const q022=read("docs/ci/latest-p07f-w7-q022-pages-e2e.json");
const r02a=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const r02b=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const sourceIndex=read("data/curriculum/full-product/p07e/w7-source-authority-index.json");
const impact=read("data/project/change-impact/P07F_W7_Q023_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q023_PREFLIGHT.validation.json");
const KP="kp_speed_distance_time_relation";
const REQUIRED=["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_speed_rate_reasoning","cap_ratio_rate_validator","cap_quantity_dimension_unit_identity","cap_text_application_representation","cap_quantity_semantic_role_binding"];

test("Q023 exact frozen successor follows Q022 D0",()=>{
 const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[22];
 assert.equal(q022.status,"PASS_E6_D0_COMPLETE");assert.equal(q022.exactHeadSha,"db1b1ab9f11bb160dcc6f07981946a8385921d6b");
 assert.equal(row.queuePosition,23);assert.equal(row.sliceId,"p07e_q023_r13_g6a_u08_6a08_profile_speed_rate_c1");
 assert.equal(row.previousSliceId,"p07e_q022_r12_g6b_u04_6b04_profile_ratio_percent_c1");assert.equal(row.primarySourceNodeId,"g6a_u08_6a08");
 assert.deepEqual([...row.supportingSourceNodeIds],["g6a_u08_6a08","g6b_u02_6b02"]);assert.equal(row.primaryRuntimeProfileId,"profile_speed_rate");
 assert.equal(row.intraWavePrerequisiteRank,13);assert.deepEqual([...row.knowledgePointIds],[KP]);
 assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_speed_rate_reasoning"]);
});

test("Q023 binds primary plus supporting R02 full-page visual authority",()=>{
 const a=r02a.sourceRecords.find(x=>x.sourceNodeId==="g6a_u08_6a08"),b=r02b.sourceRecords.find(x=>x.sourceNodeId==="g6b_u02_6b02");
 for(const src of [a,b]){assert.ok(src);assert.equal(src.sourceTitle,"認識速率");assert.deepEqual(src.reviewedPages,[1,2]);
  const c=src.candidates.find(x=>x.knowledgePointId===KP);assert.ok(c);assert.equal(c.canonicalNameZh,"速率距離時間關係");
  assert.equal(c.capabilityStatement,"學生能在距離、速率、時間三量間互求。");assert.equal(c.reasoningInvariant,"距離等於速率乘時間，三量單位必須相容。");}
 const ia=sourceIndex.sources.find(x=>x.sourceNodeId==="g6a_u08_6a08"),ib=sourceIndex.sources.find(x=>x.sourceNodeId==="g6b_u02_6b02");
 assert.equal(ia.role,"PRIMARY");assert.equal(ib.role,"SUPPORTING_FOR_G6A_U08_SPEED_ROWS");
 assert.equal(pre.sourceAuthority.primary.sourcePdfDriveFileId,"1mI0hgM7Nknw01PFUCPf-IwgZTtUi3zP-");
 assert.equal(pre.sourceAuthority.supporting.sourcePdfDriveFileId,"1fvyF0xYVTUSRBJPIVTa5nfHb5li6wTi4");
 assert.equal(pre.sourceAuthority.connectorTextNotUsedAsSemanticAuthority,true);
 assert.equal(pre.sourceAuthority.currentSemanticAuthority,"R02_FULL_PAGE_VISUAL_READBACK_PLUS_P07E_W7_SOURCE_AUTHORITY_INDEX");
});

test("Q023 exact R03 R04 R05 authority matches speed-rate profile",()=>{
 const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
 assert.deepEqual(r03.map(x=>x.edgeId),["kpe_r03_0656","kpe_r03_0657"]);
 assert.deepEqual(r03.map(x=>x.fromKnowledgePointId),["kp_g6a_u04_decimal_division_rate_application","kp_g6b_u04_base_comparison_rate_roles"]);
 assert.ok(r03.every(x=>x.dependencyStrength==="required"&&x.dependencyRole==="relation_model_foundation"&&x.distanceBearing===true));
 assert.equal(r04.mappingId,"r04map_speed_distance_time_relation");assert.equal(r04.primaryRuntimeProfileId,"profile_speed_rate");assert.equal(r04.classificationRuleId,"rule_speed_rate");
 assert.deepEqual([...r04.appliedModifierIds],["mod_quantity_relation_semantics"]);assert.deepEqual([...r04.requiredRuntimeCapabilityIds],REQUIRED);
 assert.deepEqual([...r04.optionalRuntimeCapabilityIds],["cap_unit_conversion","cap_global_context_binding"]);
 assert.equal(r05.assignmentId,"r05wave_speed_distance_time_relation");assert.equal(r05.baseDeliveryWaveId,"R05-W7");assert.equal(r05.deliveryWaveId,"R05-W7");
 assert.equal(r05.intraWavePrerequisiteRank,13);assert.equal(r05.prerequisiteWaveLowerBound,7);assert.equal(r05.waveEscalatedByPrerequisite,false);
 assert.deepEqual([...r05.contractOnlyRequiredCapabilityIds].sort(),["cap_speed_rate_reasoning","cap_ratio_percent_reasoning","cap_fraction_number_system","cap_ratio_rate_validator"].sort());
 assert.deepEqual([...r05.shadowRequiredCapabilityIds].sort(),["cap_quantity_dimension_unit_identity","cap_quantity_semantic_role_binding"].sort());
});

test("Q023 semantic scope owns only the three-way distance-speed-time relation",()=>{
 const s=pre.semanticProfileLock.implementationSemanticLock;
 assert.equal(s.solveDistanceFromSpeedAndTimeAllowed,true);assert.equal(s.solveSpeedFromDistanceAndTimeAllowed,true);assert.equal(s.solveTimeFromDistanceAndSpeedAllowed,true);
 assert.equal(s.compatibleDistanceTimeRateUnitsRequired,true);assert.equal(s.answerBackSubstitutionRequired,true);assert.equal(s.quantitySemanticRoleBindingRequired,true);
 assert.equal(s.speedUnitConversionOwnershipAllowed,false);assert.equal(s.averageSpeedOwnershipAllowed,false);assert.equal(s.relativeSpeedMeetingChasingOwnershipAllowed,false);
 assert.equal(s.effectiveSpeedCurrentWindOwnershipAllowed,false);assert.equal(s.sameUnitMixedModeAllowed,false);assert.equal(s.crossUnitMixedModeAllowed,false);
 assert.deepEqual(pre.r02ReviewedCandidateAuthority.protectedLaterW7KnowledgePointIds,["kp_average_speed_total_distance_time","kp_relative_speed_meeting_chasing","kp_effective_speed_current_wind"]);
});

test("Q023 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
 assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.goalDistance.reduced,"D3_TO_D2");assert.equal(pre.executableAuthorityReadback.pending,false);
 assert.equal(pre.preflightDecision.predecessorQ022D0Verified,true);assert.equal(pre.preflightDecision.primaryAndSupportingR02AuthorityBound,true);
 assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ023ImplementationPlanning,true);assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
 assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice023Implementation");
 assert.equal(pre.q023ScopeLock.implementationAllowedByThisPreflight,false);assert.equal(pre.q023ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
 assert.equal(impact.unitKnowledgePointGateStatus[KP],"PLANNING_READY_IMPLEMENTATION_APPROVAL_REQUIRED");
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
 assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
});
