import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q011-g4a-u07-multiplicative-pattern-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q011_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q011_PREFLIGHT.validation.json");
const TARGET="kp_g4a_u07_quantity_multiplicative_pattern";
const FUTURE="kp_g4a_u07_pattern_missing_term_reasoning";
const PREV=["kp_g4a_u07_geometric_arrangement_count","kp_g4a_u07_quantity_additive_pattern","kp_g4a_u07_input_output_table_rule"];
const CAPS=["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"];

test("W6 Q011 preflight binds exact queue position 11 after Q010 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[10];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,11);
  assert.equal(slice.sliceId,"p06e_q011_r3_g4a_u07_4a07_profile_pattern_relation_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice011Implementation");
  assert.equal(slice.previousSliceId,"p06e_q010_r2_g5b_u11_5b11_profile_chart_data_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4a_u07_4a07");
  assert.equal(slice.intraWavePrerequisiteRank,3);
  assert.equal(slice.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.deepEqual(slice.knowledgePointIds,[TARGET]);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,991);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"8a30a528e7a7fccd577cf2d12ae4336699c31ac1");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35496589216);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q011 reuses G4A-U07 reviewed source authority for multiplicative pattern",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g4a_u07_4a07");
  assert.ok(source);
  assert.equal(source.sourceTitle,"數量關係與規律");
  assert.equal(source.sourcePdfTitle,"meow911_4a07_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  const target=source.candidates.find(row=>row.knowledgePointId===TARGET);
  assert.ok(target);
  assert.equal(target.canonicalNameZh,"倍數型數量規律");
  assert.equal(target.capabilityStatement,"學生能辨認固定倍數成長或縮減的規律。");
  assert.equal(target.reasoningInvariant,"相鄰階段的倍率保持固定。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(p.sourceAuthority.reusedFromQ005AndQ006SourceAuthority,true);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.embeddedHeaderUrlMismatch.sourceRefAmbiguity,false);
});

test("W6 Q011 locks profile_pattern_relation and exact frozen capability delta",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_pattern_relation");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
  const mapping=getR04KnowledgePointCapabilityMapping(TARGET);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.equal(mapping.classificationRuleId,"rule_pattern_relation");
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.equal(p.runtimeCapabilityAuthority.symbolicRelationReasoningRequiredForQ011,false);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q011 protects Q005/Q006 predecessors and exact Q013 same-source future KP",()=>{
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedPredecessorKnowledgePointIds,PREV);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.map(x=>x.knowledgePointId),[FUTURE]);
  assert.equal(p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates[0].futureQueuePosition,13);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.fixedMultiplicativeFactorIsCore,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.adjacentStageRatioMustRemainConstant,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.additivePatternAsTargetIsCore,false);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.inputOutputTableRuleAsTargetIsCore,false);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.missingTermReasoningAsTargetIsCore,false);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.q013FutureKpReownershipAllowed,false);
});

test("W6 Q011 stays planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q011ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q011ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q011ScopeLock.q001ToQ010ProductMutationAllowed,false);
  assert.equal(p.q011ScopeLock.q012OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice011Implementation");
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
