import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q018-g6a-u03-relation-equation-unknown-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q018_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q018_PREFLIGHT.validation.json");
const KP="kp_g6a_u03_relation_equation_unknown",CAPS=["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"];
const PREV=["kp_g6a_u03_symbolic_quantity_relation","kp_g6a_u03_geometric_count_generalization","kp_g6a_u03_input_output_general_rule","kp_g6a_u03_linear_pattern_nth_term"];

test("W6 Q018 preflight binds exact frozen queue position 18 after Q017 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[17];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,18);
  assert.equal(slice.sliceId,"p06e_q018_r9_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice018Implementation");
  assert.equal(slice.previousSliceId,"p06e_q017_r7_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u03_6a03");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u03_6a03"]);
  assert.equal(slice.intraWavePrerequisiteRank,9);
  assert.equal(slice.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,1006);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"99375010c6ff016551d1b75f67cde4fa444e01ac");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35555786950);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q018 reuses G6A-U03 full-page reviewed authority and binds relation-equation candidate",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u03_6a03");assert.ok(source);
  assert.equal(source.sourceTitle,"數量關係與規律問題");assert.equal(source.sourcePdfTitle,"meow911_6a03_source.pdf");assert.deepEqual(source.reviewedPages,[1,2,3]);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"數量關係列式求未知量");
  assert.equal(target.capabilityStatement,"學生能依關係式反向運算求未知量。");
  assert.equal(target.reasoningInvariant,"解出的未知量代回原關係必須同時滿足所有條件。");
  assert.deepEqual(target.evidencePages,[2]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"19GD5TcGJKNpJQTHnOKB8eSQsQu73YN-N");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,1179557);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,PREV);
  assert.equal(p.r02ReviewedCandidateAuthority.sameSourceCandidateSetCompleteAfterQ018,true);
  assert.equal(p.r02ReviewedCandidateAuthority.remainingCandidateCountAfterQ018,0);
});

test("W6 Q018 locks target to profile_pattern_relation and exact frozen W6 capability set",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_pattern_relation");assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
  assert.deepEqual(profile.optionalCapabilityIds,["cap_symbolic_relation_reasoning"]);
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.equal(mapping.classificationRuleId,"rule_pattern_relation");
  assert.equal(mapping.requiredRuntimeCapabilityIds.includes("cap_pattern_sequence_reasoning"),true);
  assert.equal(mapping.requiredRuntimeCapabilityIds.includes("cap_pattern_relation_validator"),true);
  assert.equal(mapping.optionalRuntimeCapabilityIds.includes("cap_symbolic_relation_reasoning"),true);
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.equal(p.runtimeCapabilityAuthority.symbolicRelationReasoningRequiredByFrozenQueue,false);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q018 semantic lock isolates unknown solving from all predecessor-owned G6A-U03 capabilities",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.solveRelationEquationUnknownIsCore,true);
  assert.equal(s.reverseOperationFromRelationIsCore,true);
  assert.equal(s.solvedUnknownMustSatisfyOriginalRelation,true);
  assert.equal(s.substitutionBackValidationRequired,true);
  assert.equal(s.genericSymbolicQuantityRelationReownershipAllowed,false);
  assert.equal(s.geometricCountGeneralizationReownershipAllowed,false);
  assert.equal(s.inputOutputGeneralRuleReownershipAllowed,false);
  assert.equal(s.linearPatternNthTermReownershipAllowed,false);
  assert.deepEqual(p.q018ScopeLock.includedRelations,["SOLVE_RELATION_EQUATION_UNKNOWN","VERIFY_SOLVED_UNKNOWN_BY_SUBSTITUTION"]);
  assert.equal(p.q018ScopeLock.excludedRelations.includes("GENERALIZE_GEOMETRIC_COUNT_BY_STAGE"),true);
  assert.equal(p.q018ScopeLock.excludedRelations.includes("GENERALIZE_INPUT_OUTPUT_RULE"),true);
  assert.equal(p.q018ScopeLock.excludedRelations.includes("DERIVE_LINEAR_PATTERN_NTH_TERM"),true);
});

test("W6 Q018 remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q018ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q018ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q018ScopeLock.q001ToQ017ProductMutationAllowed,false);
  assert.equal(p.q018ScopeLock.q019OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice018Implementation");
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
