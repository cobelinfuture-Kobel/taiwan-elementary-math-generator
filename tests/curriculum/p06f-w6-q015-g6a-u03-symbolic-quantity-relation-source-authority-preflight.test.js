import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q015-g6a-u03-symbolic-quantity-relation-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q015_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q015_PREFLIGHT.validation.json");
const TARGET="kp_g6a_u03_symbolic_quantity_relation";
const FUTURE=["kp_g6a_u03_geometric_count_generalization","kp_g6a_u03_input_output_general_rule","kp_g6a_u03_linear_pattern_nth_term","kp_g6a_u03_relation_equation_unknown"];
const CAPS=["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"];

test("W6 Q015 preflight binds exact frozen queue position 15 after Q014 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[14];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,15);
  assert.equal(slice.sliceId,"p06e_q015_r6_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice015Implementation");
  assert.equal(slice.previousSliceId,"p06e_q014_r5_g6b_u06_6b06_profile_chart_data_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u03_6a03");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u03_6a03"]);
  assert.equal(slice.intraWavePrerequisiteRank,6);
  assert.equal(slice.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[TARGET]);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,1000);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"b23340fd6c9be7ddb704cc3459e504f6ea0b3711");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35548287917);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q015 binds G6A-U03 full-page reviewed source authority and target evidence page 1",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u03_6a03");
  assert.ok(source);
  assert.equal(source.sourceTitle,"數量關係與規律問題");
  assert.equal(source.sourcePdfTitle,"meow911_6a03_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2,3]);
  const target=source.candidates.find(row=>row.knowledgePointId===TARGET);
  assert.ok(target);
  assert.equal(target.canonicalNameZh,"以符號表示數量關係");
  assert.equal(target.capabilityStatement,"學生能用字母或符號表示兩量間的運算關係。");
  assert.equal(target.reasoningInvariant,"相同符號在同一問題中代表固定未知量。");
  assert.deepEqual(target.evidencePages,[1]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"19GD5TcGJKNpJQTHnOKB8eSQsQu73YN-N");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,1179557);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
  assert.equal(p.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q015 locks profile_pattern_relation while preserving optional symbolic capability boundary",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_pattern_relation");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
  assert.deepEqual(profile.optionalCapabilityIds,["cap_symbolic_relation_reasoning"]);
  const mapping=getR04KnowledgePointCapabilityMapping(TARGET);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.equal(mapping.classificationRuleId,"rule_pattern_relation");
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.equal(p.runtimeCapabilityAuthority.symbolicRelationReasoningProfileOptional,true);
  assert.equal(p.runtimeCapabilityAuthority.symbolicRelationReasoningRequiredByFrozenQueue,false);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
  assert.equal(p.runtimeCapabilityAuthority.wordProblemProfileReclassificationAllowed,false);
});

test("W6 Q015 locks symbolic quantity relation semantics without absorbing Q017 or Q018",()=>{
  assert.deepEqual([...p.r02ReviewedCandidateAuthority.reservedW6SuccessorKnowledgePointIds].sort(),[...FUTURE].sort());
  assert.equal(p.r02ReviewedCandidateAuthority.remainingCandidateCountAfterQ015,4);
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.symbolicQuantityRelationRepresentationIsCore,true);
  assert.equal(s.letterOrSymbolMayRepresentQuantity,true);
  assert.equal(s.sameSymbolRepresentsFixedUnknownWithinProblem,true);
  assert.equal(s.operationRelationMustBePreserved,true);
  assert.equal(s.solvingRelationEquationUnknownIsCore,false);
  assert.equal(s.inputOutputGeneralRuleIsCore,false);
  assert.equal(s.geometricCountGeneralizationIsCore,false);
  assert.equal(s.linearPatternNthTermIsCore,false);
  assert.equal(s.applicationContextIsCore,false);
  assert.equal(s.wordProblemSemanticProfileIsCore,false);
  assert.equal(s.symbolicRelationReasoningMayNotBecomeHiddenFrozenQueueRequirement,true);
});

test("W6 Q015 remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q015ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q015ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q015ScopeLock.q001ToQ014ProductMutationAllowed,false);
  assert.equal(p.q015ScopeLock.q016OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice015Implementation");
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
