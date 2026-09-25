import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q026-g6a-u08-effective-speed-current-wind-source-authority-preflight.json");
const q025=read("docs/ci/latest-p07f-w7-q025-pages-e2e.json");
const r02a=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const r02b=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const impact=read("data/project/change-impact/P07F_W7_Q026_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q026_PREFLIGHT.validation.json");
const KP="kp_effective_speed_current_wind";
const REQUIRED=["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_speed_rate_reasoning","cap_ratio_rate_validator","cap_quantity_dimension_unit_identity","cap_text_application_representation","cap_quantity_semantic_role_binding","cap_relation_model_binding","cap_word_problem_semantic_validation"];

test("Q026 exact frozen final successor follows Q025 D0",()=>{
 const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[25];
 assert.equal(q025.status,"PASS_E6_D0_COMPLETE");assert.equal(q025.exactHeadSha,"2f5a50b6284df48e16bcb6f23c8919fad7ed808d");
 assert.equal(row.queuePosition,26);assert.equal(row.sliceId,"p07e_q026_r15_g6a_u08_6a08_profile_speed_rate_c1");
 assert.equal(row.previousSliceId,"p07e_q025_r14_g6a_u08_6a08_profile_speed_rate_c1");assert.equal(row.primarySourceNodeId,"g6a_u08_6a08");
 assert.deepEqual([...row.supportingSourceNodeIds],["g6a_u08_6a08","g6b_u02_6b02"]);assert.equal(row.primaryRuntimeProfileId,"profile_speed_rate");
 assert.equal(row.intraWavePrerequisiteRank,15);assert.equal(row.knowledgePointCount,1);assert.deepEqual([...row.knowledgePointIds],[KP]);
 assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_speed_rate_reasoning"]);
});

test("Q026 binds exact primary and supporting R02 effective-speed candidate",()=>{
 const a=r02a.sourceRecords.find(x=>x.sourceNodeId==="g6a_u08_6a08"),b=r02b.sourceRecords.find(x=>x.sourceNodeId==="g6b_u02_6b02");
 for(const src of [a,b]){
  assert.ok(src);assert.equal(src.sourceTitle,"認識速率");assert.deepEqual(src.reviewedPages,[1,2]);
  const c=src.candidates.find(x=>x.knowledgePointId===KP);assert.ok(c);assert.equal(c.canonicalNameZh,"順逆流與有效速率");
  assert.equal(c.capabilityStatement,"學生能由本身速率與水流或風速求有效速率。");
  assert.equal(c.reasoningInvariant,"順向有效速率相加，逆向有效速率相減。");
 }
 assert.equal(pre.sourceAuthority.primary.sourcePdfDriveFileId,"1mI0hgM7Nknw01PFUCPf-IwgZTtUi3zP-");
 assert.equal(pre.sourceAuthority.supporting.sourcePdfDriveFileId,"1fvyF0xYVTUSRBJPIVTa5nfHb5li6wTi4");
 assert.equal(pre.sourceAuthority.connectorTextNotUsedAsSemanticAuthority,true);
});

test("Q026 exact R03 R04 R05 authority is frozen",()=>{
 const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
 assert.deepEqual(r03.map(x=>x.edgeId),["kpe_r03_0020"]);assert.deepEqual(r03.map(x=>x.fromKnowledgePointId),["kp_relative_speed_meeting_chasing"]);
 assert.ok(r03.every(x=>x.dependencyStrength==="required"&&x.dependencyRole==="relation_model_foundation"&&x.distanceBearing===true));
 assert.equal(r04.mappingId,"r04map_effective_speed_current_wind");assert.equal(r04.primaryRuntimeProfileId,"profile_speed_rate");assert.equal(r04.classificationRuleId,"rule_speed_rate");
 assert.deepEqual([...r04.appliedModifierIds],["mod_quantity_relation_semantics","mod_application_semantics"]);assert.deepEqual([...r04.requiredRuntimeCapabilityIds],REQUIRED);
 assert.deepEqual([...r04.optionalRuntimeCapabilityIds],["cap_unit_conversion","cap_global_context_binding","cap_pbl_task_set_projection"]);
 assert.equal(r05.assignmentId,"r05wave_effective_speed_current_wind");assert.equal(r05.deliveryWaveId,"R05-W7");assert.equal(r05.intraWavePrerequisiteRank,15);
 assert.equal(r05.prerequisiteWaveLowerBound,7);assert.equal(r05.waveEscalatedByPrerequisite,false);
 assert.deepEqual([...r05.contractOnlyRequiredCapabilityIds].sort(),["cap_speed_rate_reasoning","cap_ratio_percent_reasoning","cap_fraction_number_system","cap_ratio_rate_validator"].sort());
 assert.deepEqual([...r05.sourceNodeIds],["g6a_u08_6a08","g6b_u02_6b02"]);assert.equal(r05.productionAdmissionState,"PLANNED_NOT_ADMITTED");
});

test("Q026 semantic lock owns only effective speed from own speed and current/wind",()=>{
 const s=pre.semanticProfileLock.implementationSemanticLock;
 assert.equal(s.downstreamOrTailwindEffectiveSpeedAllowed,true);assert.equal(s.upstreamOrHeadwindEffectiveSpeedAllowed,true);
 assert.equal(s.sameDirectionAdditionRequired,true);assert.equal(s.oppositeDirectionSubtractionRequired,true);assert.equal(s.positiveOpposingEffectiveSpeedRequired,true);
 assert.equal(s.computeEffectiveSpeedFromOwnAndCurrentWindRequired,true);assert.equal(s.reverseSolveOwnSpeedAllowed,false);assert.equal(s.reverseSolveCurrentWindSpeedAllowed,false);
 assert.equal(s.speedUnitConversionOwnershipAllowed,false);assert.equal(s.averageSpeedReownershipAllowed,false);assert.equal(s.relativeSpeedMeetingChasingReownershipAllowed,false);
 assert.equal(s.sameUnitMixedModeAllowed,false);assert.equal(s.crossUnitMixedModeAllowed,false);
 assert.deepEqual(pre.r02ReviewedCandidateAuthority.protectedNonW7KnowledgePointIds,["kp_speed_unit_conversion"]);
 assert.equal(pre.r02ReviewedCandidateAuthority.sameSourceCandidateSetCompleteAfterQ026Implementation,false);
});

test("Q026 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
 assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.goalDistance.reduced,"D3_TO_D2");assert.equal(pre.executableAuthorityReadback.pending,false);
 assert.equal(pre.preflightDecision.predecessorQ025D0Verified,true);assert.equal(pre.preflightDecision.finalFrozenW7SliceResolved,true);
 assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ026ImplementationPlanning,true);assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
 assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice026Implementation");
 assert.equal(pre.q026ScopeLock.implementationAllowedByThisPreflight,false);assert.equal(pre.q026ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
 assert.equal(impact.unitKnowledgePointGateStatus[KP],"PLANNING_READY_IMPLEMENTATION_APPROVAL_REQUIRED");
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
 assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
});
