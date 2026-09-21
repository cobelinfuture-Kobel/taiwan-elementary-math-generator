import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q017-g6a-u03-generalization-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q017_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q017_PREFLIGHT.validation.json");
const GEO="kp_g6a_u03_geometric_count_generalization",IO="kp_g6a_u03_input_output_general_rule";
const TARGETS=[GEO,IO],CAPS=["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"],Q018=["kp_g6a_u03_linear_pattern_nth_term","kp_g6a_u03_relation_equation_unknown"];

test("W6 Q017 preflight binds exact frozen queue position 17 after Q016 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[16];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,17);
  assert.equal(slice.sliceId,"p06e_q017_r7_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice017Implementation");
  assert.equal(slice.previousSliceId,"p06e_q016_r6_g6b_u06_6b06_profile_chart_data_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u03_6a03");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u03_6a03"]);
  assert.equal(slice.intraWavePrerequisiteRank,7);
  assert.equal(slice.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,TARGETS);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,1004);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"d09ec11edf5fa105d3faa8c1dbac28faaf96d5ed");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.postMergeWorkflowRunId,35553173121);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q017 reuses G6A-U03 full-page reviewed authority and binds both target candidates",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u03_6a03");
  assert.ok(source);
  assert.equal(source.sourceTitle,"數量關係與規律問題");
  assert.equal(source.sourcePdfTitle,"meow911_6a03_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2,3]);
  const geo=source.candidates.find(row=>row.knowledgePointId===GEO);
  const io=source.candidates.find(row=>row.knowledgePointId===IO);
  assert.equal(geo.canonicalNameZh,"圖形規律一般化");
  assert.equal(geo.capabilityStatement,"學生能將階段圖形數量表示成項次公式。");
  assert.equal(geo.reasoningInvariant,"公式須分離固定部分與每階段新增部分。");
  assert.deepEqual(geo.evidencePages,[1]);
  assert.equal(io.canonicalNameZh,"輸入輸出一般式");
  assert.equal(io.capabilityStatement,"學生能由多組對應值歸納一般規則。");
  assert.equal(io.reasoningInvariant,"一般式必須解釋所有已知輸入輸出對。");
  assert.deepEqual(io.evidencePages,[2]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"19GD5TcGJKNpJQTHnOKB8eSQsQu73YN-N");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,1179557);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W6 Q017 locks both targets to profile_pattern_relation and frozen W6 capability set",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_pattern_relation");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
  assert.deepEqual(profile.optionalCapabilityIds,["cap_symbolic_relation_reasoning"]);
  for(const id of TARGETS){
    const mapping=getR04KnowledgePointCapabilityMapping(id);
    assert.ok(mapping,id);
    assert.equal(mapping.primaryRuntimeProfileId,"profile_pattern_relation",id);
    assert.equal(mapping.classificationRuleId,"rule_pattern_relation",id);
    assert.equal(mapping.requiredRuntimeCapabilityIds.includes("cap_pattern_sequence_reasoning"),true,id);
    assert.equal(mapping.requiredRuntimeCapabilityIds.includes("cap_pattern_relation_validator"),true,id);
    assert.equal(mapping.optionalRuntimeCapabilityIds.includes("cap_symbolic_relation_reasoning"),true,id);
  }
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.equal(p.runtimeCapabilityAuthority.symbolicRelationReasoningRequiredByFrozenQueue,false);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q017 semantic locks separate geometric generalization and input-output rule from Q015/Q018 ownership",()=>{
  const g=p.semanticProfileLock.knowledgePointSemanticLocks[GEO];
  assert.equal(g.stageFigureCountGeneralizationIsCore,true);
  assert.equal(g.stageIndexFormulaRepresentationIsCore,true);
  assert.equal(g.fixedPartAndPerStageIncrementMustRemainSeparated,true);
  assert.equal(g.directNthTermSequenceShortcutIsCore,false);
  assert.equal(g.relationEquationUnknownSolvingIsCore,false);
  assert.equal(g.genericSymbolicQuantityRelationReownershipAllowed,false);
  const io=p.semanticProfileLock.knowledgePointSemanticLocks[IO];
  assert.equal(io.inferRuleFromMultipleKnownPairsIsCore,true);
  assert.equal(io.generalRuleMustExplainAllKnownPairs,true);
  assert.equal(io.inputOutputCorrespondenceMustBePreserved,true);
  assert.equal(io.directNthTermSequenceReasoningIsCore,false);
  assert.equal(io.relationEquationUnknownSolvingIsCore,false);
  assert.equal(io.genericSymbolicQuantityRelationReownershipAllowed,false);
  assert.deepEqual([...p.r02ReviewedCandidateAuthority.reservedQ018KnowledgePointIds].sort(),[...Q018].sort());
  assert.deepEqual(p.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,["kp_g6a_u03_symbolic_quantity_relation"]);
  assert.equal(p.r02ReviewedCandidateAuthority.remainingCandidateCountAfterQ017,2);
});

test("W6 Q017 remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q017ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q017ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q017ScopeLock.q001ToQ016ProductMutationAllowed,false);
  assert.equal(p.q017ScopeLock.q018OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice017Implementation");
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
