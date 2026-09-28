import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q007-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q007_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q007_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q7I="data/curriculum/full-product/p08f/q007-g4a-u03-unknown-angle-linear-full-vertical-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q7I);

test("Q007 final learner-visual D0 is granted only after exact actual-print operator acceptance",()=>{
  assert.equal(c.status,"Q007_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形OK");
  assert.equal(c.operatorAcceptance.exactArtifactId,10959480331);
  assert.equal(c.finalProductAuthority.implementationPr,1108);
  assert.equal(c.finalProductAuthority.implementationPrGateRunId,36396662496);
  assert.equal(c.finalProductAuthority.implementationPrGateRunNumber,1000);
  assert.equal(c.finalProductAuthority.deployPagesRunNumber,2390);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36396807578);
  assert.equal(c.finalProductAuthority.pagesE2EJobId,108845034780);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"4a74414a2836f4289a5e50cdbfcb85f2cd62e8eb");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"4a74414a2836f4289a5e50cdbfcb85f2cd62e8eb");
});

test("Q007 final learner-facing unknown-angle evidence is print-safe and semantically bounded",()=>{
  const e=c.finalLearnerFacingEvidence.unknownAngleLinearFullVertical;
  assert.equal(e.questionCount,15);assert.equal(e.answerCount,15);assert.equal(e.diagramCount,30);
  assert.equal(e.questionPageCount,3);assert.equal(e.answerPageCount,3);assert.equal(e.allPageCount,6);
  assert.equal(e.worksheetColumns,2);assert.equal(e.rowsPerPage,3);assert.equal(e.clippedCellCount,0);assert.equal(e.overflowPageCount,0);assert.equal(e.internalDiagramClippingCount,0);
  assert.equal(e.degreeAnswerCount,15);assert.equal(e.responseLineCount,15);assert.equal(e.printInvocationCount,1);
  assert.deepEqual(e.diagramModes,["FULL_TURN_REMAINDER","LINEAR_PAIR_REMAINDER","VERTICAL_OPPOSITE_EQUAL"]);
  assert.deepEqual(e.patternSpecIds,["ps_g4a_u03_unknown_angle_full_turn","ps_g4a_u03_unknown_angle_linear_pair","ps_g4a_u03_unknown_angle_vertical_pair"]);
  for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
  for(const key of ["linearAdjacentAnglesSum180","fullTurnAnglesSum360","verticalAnglesEqual","explicitRelationRequired","twoColumnPrintLayout","printSafePagination","responseLineVisible","priorG4AU03OwnersPreserved","sameSourceW8CandidateSetComplete","sameUnitMixedModeFailClosed"])assert.equal(c.learnerVisualContract[key],true,key);
});

test("Q007 D0 closeout is governance-only and preserves Q008 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q008OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ008,false);
  assert.deepEqual(c.distance.remainingQ007Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q007_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q008SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q008_SourceAuthorityPreflight");
  assert.equal(c.q008SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice008Implementation");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q007 product merge does not mutate Q007 runtime or identity",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductMergeSha,"4a74414a2836f4289a5e50cdbfcb85f2cd62e8eb");
  assert.equal(m.commitsAfterExactProductMerge,9);
  assert.equal(m.q007RuntimeFilesChanged,false);assert.equal(m.q007CurriculumIdentityFilesChanged,false);
  assert.ok(m.changedFilesAfterExactProductMerge.every(p=>p.startsWith("docs/ci/")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q007 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_unknown_angle_linear_full_vertical");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_unknown_angle_linear_full_vertical"]);
  assert.deepEqual(impact.changeImpact,{sharedExecutableChange:false,publicAuthorityCutover:false,legalRouteSemanticsChanged:false,affectedRoutes:"BOUNDED",globalReleaseCheckpoint:false,currentAuthorityChanged:false});
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
