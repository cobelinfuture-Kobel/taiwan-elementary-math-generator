import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q024-g6b-u04-successive-rate-change-source-authority-preflight.json");
const q023=read("docs/ci/latest-p07f-w7-q023-pages-e2e.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const impact=read("data/project/change-impact/P07F_W7_Q024_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q024_PREFLIGHT.validation.json");
const KP="kp_g6b_u04_successive_rate_change";
const REQUIRED=["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation","cap_relation_model_binding","cap_word_problem_semantic_validation"];

test("Q024 exact frozen successor follows Q023 D0",()=>{
 const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[23];
 assert.equal(q023.status,"PASS_E6_D0_COMPLETE");assert.equal(q023.exactHeadSha,"65fbe2def3f6705752f8f8cf20738faaf358849f");
 assert.equal(row.queuePosition,24);assert.equal(row.sliceId,"p07e_q024_r13_g6b_u04_6b04_profile_ratio_percent_c1");
 assert.equal(row.previousSliceId,"p07e_q023_r13_g6a_u08_6a08_profile_speed_rate_c1");assert.equal(row.primarySourceNodeId,"g6b_u04_6b04");
 assert.deepEqual([...row.supportingSourceNodeIds],["g6b_u04_6b04"]);assert.equal(row.primaryRuntimeProfileId,"profile_ratio_percent");
 assert.equal(row.intraWavePrerequisiteRank,13);assert.deepEqual([...row.knowledgePointIds],[KP]);
 assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
});

test("Q024 binds the exact R02 full-page reviewed successive-rate-change candidate",()=>{
 const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6b_u04_6b04"),c=src?.candidates.find(x=>x.knowledgePointId===KP);
 assert.ok(src);assert.equal(src.sourceTitle,"基準量與比較量");assert.equal(src.sourcePdfTitle,"meow911_6b04_source.pdf");assert.deepEqual(src.reviewedPages,[1,2]);
 assert.ok(c);assert.equal(c.canonicalNameZh,"連續增減率");assert.equal(c.capabilityStatement,"學生能處理連續折扣、成長或減少。");
 assert.equal(c.reasoningInvariant,"連續變化應乘各階段保留或成長因子，不能直接相加百分率。");assert.deepEqual(c.evidencePages,[1,2]);
 assert.equal(pre.sourceAuthority.sourcePdfDriveFileId,"1hfuht0gTaeU21wGybATAxszE9R5T8ted");
 assert.equal(pre.sourceAuthority.evidenceUse.r02ReviewedCandidateIsPrimarySemanticAuthority,true);
 assert.equal(pre.sourceAuthority.evidenceUse.q019DirectVisualNotesDoNotClaimExplicitSuccessiveRateChangeItem,true);
 assert.equal(pre.sourceAuthority.evidenceUse.noNewLiteralSourceExampleInvented,true);
});

test("Q024 exact R03 R04 R05 authority is frozen",()=>{
 const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
 assert.deepEqual(r03.map(x=>x.edgeId),["kpe_r03_0612","kpe_r03_0613","kpe_r03_0614"]);
 assert.deepEqual(r03.map(x=>x.fromKnowledgePointId),["kp_g5b_u08_percent_discount_increase_application","kp_g6b_u04_find_base_quantity","kp_g6b_u04_find_comparison_quantity"]);
 assert.ok(r03.every(x=>x.dependencyStrength==="required"&&x.dependencyRole==="relation_model_foundation"&&x.distanceBearing===true));
 assert.equal(r04.mappingId,"r04map_g6b_u04_successive_rate_change");assert.equal(r04.primaryRuntimeProfileId,"profile_ratio_percent");assert.equal(r04.classificationRuleId,"rule_ratio_percent");
 assert.deepEqual([...r04.appliedModifierIds],["mod_application_semantics"]);assert.deepEqual([...r04.requiredRuntimeCapabilityIds],REQUIRED);
 assert.deepEqual([...r04.optionalRuntimeCapabilityIds],["cap_global_context_binding","cap_pbl_task_set_projection"]);assert.deepEqual([...r04.shadowRequiredCapabilityIds],[]);
 assert.equal(r05.assignmentId,"r05wave_g6b_u04_successive_rate_change");assert.equal(r05.baseDeliveryWaveId,"R05-W7");assert.equal(r05.deliveryWaveId,"R05-W7");
 assert.equal(r05.intraWavePrerequisiteRank,13);assert.equal(r05.prerequisiteWaveLowerBound,7);assert.equal(r05.waveEscalatedByPrerequisite,false);
 assert.deepEqual([...r05.contractOnlyRequiredCapabilityIds].sort(),["cap_fraction_number_system","cap_ratio_percent_reasoning","cap_ratio_rate_validator"].sort());
 assert.deepEqual([...r05.sourceNodeIds],["g6b_u04_6b04"]);assert.equal(r05.productionAdmissionState,"PLANNED_NOT_ADMITTED");
});

test("Q024 owns successive composition without reowning prior single-stage or base/comparison/rate KPs",()=>{
 const s=pre.semanticProfileLock.implementationSemanticLock;
 assert.equal(s.multiStageDiscountAllowed,true);assert.equal(s.multiStageIncreaseAllowed,true);assert.equal(s.increaseThenDecreaseAllowed,true);assert.equal(s.decreaseThenIncreaseAllowed,true);
 assert.equal(s.stageFactorMultiplicationRequired,true);assert.equal(s.directPercentageAdditionAllowed,false);
 assert.equal(s.baseComparisonRateRelationPrerequisitesMayBeConsumed,true);assert.equal(s.predecessorKnowledgePointReownershipAllowed,false);
 assert.equal(s.simpleSingleStageDiscountIncreaseReownershipAllowed,false);assert.equal(s.sameUnitMixedModeAllowed,false);assert.equal(s.crossUnitMixedModeAllowed,false);
 assert.equal(pre.r02ReviewedCandidateAuthority.sameSourceCandidateSetCompleteAfterQ024Implementation,true);
});

test("Q024 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
 assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(pre.goalDistance.reduced,"D3_TO_D2");assert.equal(pre.executableAuthorityReadback.pending,false);
 assert.equal(pre.preflightDecision.predecessorQ023D0Verified,true);assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ024ImplementationPlanning,true);
 assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice024Implementation");
 assert.equal(pre.q024ScopeLock.implementationAllowedByThisPreflight,false);assert.equal(pre.q024ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
 assert.equal(impact.unitKnowledgePointGateStatus[KP],"PLANNING_READY_IMPLEMENTATION_APPROVAL_REQUIRED");
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
 assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
});
