import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q013-g4a-u07-missing-term-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q013_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q013_PREFLIGHT.validation.json");
const TARGET="kp_g4a_u07_pattern_missing_term_reasoning";
const PREV=["kp_g4a_u07_quantity_additive_pattern","kp_g4a_u07_quantity_multiplicative_pattern","kp_g4a_u07_input_output_table_rule","kp_g4a_u07_geometric_arrangement_count"];
const CAPS=["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"];

test("W6 Q013 preflight binds exact frozen queue position 13 after Q012 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[12];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,13);
  assert.equal(slice.sliceId,"p06e_q013_r4_g4a_u07_4a07_profile_pattern_relation_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice013Implementation");
  assert.equal(slice.previousSliceId,"p06e_q012_r3_g5b_u11_5b11_profile_chart_data_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4a_u07_4a07");
  assert.deepEqual(slice.supportingSourceNodeIds,["g4a_u07_4a07"]);
  assert.equal(slice.intraWavePrerequisiteRank,4);
  assert.equal(slice.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[TARGET]);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,995);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"516ff2b34169bee9ba8eeb937909144f8219fd41");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35512569108);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q013 reuses G4A-U07 reviewed source authority for missing-term reasoning",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g4a_u07_4a07");
  assert.ok(source);
  assert.equal(source.sourceTitle,"數量關係與規律");
  assert.equal(source.sourcePdfTitle,"meow911_4a07_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  const target=source.candidates.find(row=>row.knowledgePointId===TARGET);
  assert.ok(target);
  assert.equal(target.canonicalNameZh,"規律缺項推理");
  assert.equal(target.capabilityStatement,"學生能由前後項與規則求中間或指定位置的未知量。");
  assert.equal(target.reasoningInvariant,"未知項必須同時滿足其前後相鄰關係。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(p.sourceAuthority.reusedFromQ005Q006Q011SourceAuthority,true);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.embeddedHeaderUrlMismatch.sourceRefAmbiguity,false);
  assert.equal(p.r02ReviewedCandidateAuthority.sameSourceCandidateSetCompleteAfterQ013,true);
});

test("W6 Q013 locks profile_pattern_relation and exact frozen capability delta",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_pattern_relation");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
  const mapping=getR04KnowledgePointCapabilityMapping(TARGET);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.equal(mapping.classificationRuleId,"rule_pattern_relation");
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.equal(p.runtimeCapabilityAuthority.symbolicRelationReasoningRequiredForQ013,false);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q013 locks bidirectional missing-term semantics without reowning predecessor KPs",()=>{
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedPredecessorKnowledgePointIds,PREV);
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.missingTermReasoningIsCore,true);
  assert.equal(s.unknownMustSatisfyPreviousAdjacency,true);
  assert.equal(s.unknownMustSatisfyNextAdjacency,true);
  assert.equal(s.bothNeighborConstraintsMustAgree,true);
  assert.equal(s.additiveRuleFamilyMayBeSupportingEvidence,true);
  assert.equal(s.multiplicativeRuleFamilyMayBeSupportingEvidence,true);
  assert.equal(s.additivePatternAsTargetIsCore,false);
  assert.equal(s.multiplicativePatternAsTargetIsCore,false);
  assert.equal(s.geometricArrangementAsTargetIsCore,false);
  assert.equal(s.inputOutputTableRuleAsTargetIsCore,false);
  assert.equal(s.q005PredecessorReownershipAllowed,false);
  assert.equal(s.q006PredecessorReownershipAllowed,false);
  assert.equal(s.q011PredecessorReownershipAllowed,false);
  assert.equal(s.symbolicNthTermFormulaIsCore,false);
});

test("W6 Q013 remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q013ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q013ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q013ScopeLock.q001ToQ012ProductMutationAllowed,false);
  assert.equal(p.q013ScopeLock.q014OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice013Implementation");
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
