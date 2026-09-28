import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q006-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q006_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q006_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q6I="data/curriculum/full-product/p08f/q006-g5a-u05a1-combined-sector-angle-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q6I);

test("Q006 final learner-visual D0 is granted only after exact actual-print operator acceptance",()=>{
  assert.equal(c.status,"Q006_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形OK");
  assert.equal(c.operatorAcceptance.exactArtifactId,10952605180);
  assert.equal(c.finalProductAuthority.implementationPr,1105);
  assert.equal(c.finalProductAuthority.implementationPrGateRunId,36379375826);
  assert.equal(c.finalProductAuthority.deployPagesRunNumber,2387);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36379473762);
  assert.equal(c.finalProductAuthority.pagesE2EJobId,108792051936);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"b06d8dbb2f3b8a213e85e8ca62d3b0bdb8b66f0b");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"b06d8dbb2f3b8a213e85e8ca62d3b0bdb8b66f0b");
});

test("Q006 final learner-facing combined-sector evidence is print-safe and semantically bounded",()=>{
  const e=c.finalLearnerFacingEvidence.combinedSectorAngle;
  assert.equal(e.questionCount,15);
  assert.equal(e.answerCount,15);
  assert.equal(e.diagramCount,30);
  assert.equal(e.questionPageCount,3);
  assert.equal(e.answerPageCount,3);
  assert.equal(e.allPageCount,6);
  assert.equal(e.worksheetColumns,2);
  assert.equal(e.rowsPerPage,3);
  assert.equal(e.clippedCellCount,0);
  assert.equal(e.overflowPageCount,0);
  assert.equal(e.degreeAnswerCount,15);
  assert.equal(e.responseLineCount,15);
  assert.equal(e.printInvocationCount,1);
  assert.deepEqual(e.diagramModes,["ROTATED_UNKNOWN_REMAINDER","THREE_KNOWN_ONE_UNKNOWN","TWO_KNOWN_ONE_UNKNOWN"]);
  assert.deepEqual(e.patternSpecIds,[
    "ps_g5a_u05a1_unknown_sector_from_three_known",
    "ps_g5a_u05a1_unknown_sector_from_two_known",
    "ps_g5a_u05a1_unknown_sector_rotation_invariant"
  ]);
  for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"])assert.equal(c.finalLearnerFacingEvidence[key],0,key);
  for(const key of ["sameCircleCenter","nonOverlappingCentralAngles","fullCircleDegrees360","unknownEquals360MinusKnownSum","twoColumnPrintLayout","printSafePagination","responseLineVisible","priorSameSourceOwnersPreserved","laterSameSourceSemanticsHidden","sameUnitMixedModeFailClosed"])assert.equal(c.learnerVisualContract[key],true,key);
});

test("Q006 D0 closeout is governance-only and preserves Q007 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q007OrLaterProductChanged"])assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ007,false);
  assert.deepEqual(c.distance.remainingQ006Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q006_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q007SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q007_SourceAuthorityPreflight");
  assert.equal(c.q007SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice007Implementation");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q006 product merge does not mutate Q006 runtime or identity",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductMergeSha,"b06d8dbb2f3b8a213e85e8ca62d3b0bdb8b66f0b");
  assert.equal(m.commitsAfterExactProductMerge,8);
  assert.equal(m.q006RuntimeFilesChanged,false);
  assert.equal(m.q006CurriculumIdentityFilesChanged,false);
  assert.ok(m.changedFilesAfterExactProductMerge.every(p=>p.startsWith("docs/ci/")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q006 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_g5a_u05a1_combined_sector_angle");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_g5a_u05a1_combined_sector_angle"]);
  assert.deepEqual(impact.changeImpact,{
    sharedExecutableChange:false,
    publicAuthorityCutover:false,
    legalRouteSemanticsChanged:false,
    affectedRoutes:"BOUNDED",
    globalReleaseCheckpoint:false,
    currentAuthorityChanged:false
  });
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
