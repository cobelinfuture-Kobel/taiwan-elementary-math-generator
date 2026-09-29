import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q012-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q012_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q012_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q12I="data/curriculum/full-product/p08f/q012-g5a-u05a1-sector-compare-same-circle-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q12I);

test("Q012 final learner-visual D0 is granted after exact operator visual acceptance and closeout authorization",()=>{
  assert.equal(c.status,"Q012_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.finalCloseoutResumeAuthorized,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形OK");
  assert.equal(c.operatorAcceptance.finalCloseoutResumeTask,"P08F_W8_Q012_FinalLearnerVisualD0Closeout_Then_Q013_SourceAuthorityPreflight");
  assert.equal(c.operatorAcceptance.exactArtifactId,10980853151);
  assert.equal(c.operatorAcceptance.exactArtifactZipSha256,"ffe008f053d4a9013ffc4473baf63e8487cfc8833e1603daf22bdc5920e3c6cb");
  assert.equal(c.finalProductAuthority.preflightPr,1127);
  assert.equal(c.finalProductAuthority.implementationPr,1128);
  assert.equal(c.finalProductAuthority.implementationPrGateRunId,36444991935);
  assert.equal(c.finalProductAuthority.implementationPrGateRunNumber,1031);
  assert.equal(c.finalProductAuthority.implementationMergeSha,"1c8cfcda54acab8b222cada5add1cc9413a35df4");
  assert.equal(c.finalProductAuthority.deployPagesRunId,36445250908);
  assert.equal(c.finalProductAuthority.deployPagesRunNumber,2410);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36445251573);
  assert.equal(c.finalProductAuthority.pagesE2ERunAttempt,1);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"1c8cfcda54acab8b222cada5add1cc9413a35df4");
});

test("Q012 final learner-facing sector-comparison evidence is explicit and print-safe",()=>{
  const e=c.finalLearnerFacingEvidence.sameCircleSectorComparison;
  assert.equal(e.questionCount,15);
  assert.equal(e.answerCount,15);
  assert.equal(e.diagramCount,30);
  assert.equal(e.questionPageCount,3);
  assert.equal(e.answerPageCount,3);
  assert.equal(e.allPageCount,6);
  assert.equal(e.worksheetColumns,2);
  assert.equal(e.maxRowsPerPage,3);
  assert.equal(e.clippedCellCount,0);
  assert.equal(e.overflowPageCount,0);
  assert.equal(e.internalDiagramClippingCount,0);
  assert.deepEqual(e.diagramModes,["EQUAL_ANGLE_EQUAL_SIZE","THREE_SECTORS_ORDER","TWO_SECTORS_COMPARE"]);
  assert.equal(e.nonEmptyAnswerCount,15);
  assert.equal(e.responseLineCount,15);
  assert.equal(e.coreHint,"半徑相同時，比較圓心角");
  for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
});

test("Q012 learner-visual contract stays same-radius comparison only",()=>{
  const v=c.learnerVisualContract;
  for(const key of ["sameCircleOrEqualRadiusRequired","comparedSectorCentralAnglesRequired","largerCentralAngleImpliesLargerArc","largerCentralAngleImpliesLargerSector","equalCentralAnglesImplyEqualSectorSize","noAreaFormulaRequired","noArcLengthFormulaRequired","twoColumnPrintLayout","printSafePagination","responseLineVisible","priorSameSourceOwnersPreserved","sameSourceCandidateSetComplete","sameUnitMixedModeFailClosed"])assert.equal(v[key],true,key);
  assert.equal(v.rulerMeasurementRequired,false);
  assert.equal(v.printScaleIsAnswerAuthority,false);
});

test("Q012 D0 closeout is governance-only and preserves Q013 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q013OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ013,false);
  assert.deepEqual(c.distance.remainingQ012Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q012_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q013SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q013_SourceAuthorityPreflight");
  assert.equal(c.q013SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice013Implementation");
  assert.equal(c.q013SuccessorReadiness.implementationRequiresSeparateOperatorApproval,true);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q012 product head does not mutate Q012 runtime or identity",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductHeadSha,"1c8cfcda54acab8b222cada5add1cc9413a35df4");
  assert.equal(m.commitsAfterExactProductHead,7);
  assert.equal(m.q012RuntimeFilesChanged,false);
  assert.equal(m.q012CurriculumIdentityFilesChanged,false);
  assert.equal(m.interveningUnrelatedEvidenceOnlyChanges,true);
  assert.ok(m.changedFilesAfterExactProductHead.every(p=>p.startsWith("docs/ci/")));
});

test("Q012 full-repository failure remains outside D0-required lane while Q012 contracts pass",()=>{
  const r=c.postMergeFullRegressionReadback;
  assert.equal(r.runId,36445251338);
  assert.equal(r.runNumber,5999);
  assert.equal(r.conclusion,"failure");
  assert.equal(r.d0Required,false);
  assert.equal(r.q012FocusedContractsObservedPassing,true);
  assert.equal(r.unrelatedRepositoryBaselineFailuresPresent,true);
  assert.equal(r.unrelatedFailureCount,173);
  assert.deepEqual(r.q012PreflightSubtestRange,[4463,4467]);
  assert.deepEqual(r.q012ImplementationSubtestRange,[4632,4648]);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q012 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_g5a_u05a1_sector_compare_same_circle");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_g5a_u05a1_sector_compare_same_circle"]);
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
