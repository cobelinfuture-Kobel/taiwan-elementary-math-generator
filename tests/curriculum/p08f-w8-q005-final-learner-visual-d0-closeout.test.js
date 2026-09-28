import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q005-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q005_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q005_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q5I="data/curriculum/full-product/p08f/q005-g4a-u03-angle-estimation-classification-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q5I);

test("Q005 final learner-visual D0 is granted only after exact actual-print operator acceptance",()=>{
  assert.equal(c.status,"Q005_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形OK");
  assert.equal(c.operatorAcceptance.exactArtifactId,10950544289);
  assert.equal(c.finalProductAuthority.implementationPr,1101);
  assert.equal(c.finalProductAuthority.implementationPrGateRunId,36375162629);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36375250958);
  assert.equal(c.finalProductAuthority.pagesE2EJobId,108779654955);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"682920d960927ebf1ed6ea29ab2cd3197a90b457");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"682920d960927ebf1ed6ea29ab2cd3197a90b457");
});

test("Q005 final learner-facing angle evidence is print-safe and semantically bounded",()=>{
  const e=c.finalLearnerFacingEvidence.angleEstimationAndClassification;
  assert.equal(e.questionCount,15);
  assert.equal(e.answerCount,15);
  assert.equal(e.diagramCount,30);
  assert.equal(e.questionPageCount,3);
  assert.equal(e.answerPageCount,3);
  assert.equal(e.worksheetColumns,2);
  assert.equal(e.rowsPerPage,3);
  assert.equal(e.clippedCellCount,0);
  assert.equal(e.overflowPageCount,0);
  assert.equal(e.internalDiagramClippingCount,0);
  assert.equal(e.degreeAnswerCount,5);
  assert.equal(e.classificationAnswerCount,10);
  assert.equal(e.responseLineCount,15);
  assert.equal(e.printInvocationCount,1);
  assert.deepEqual(e.diagramModes,["ARM_LENGTH_INVARIANT_PAIR","CLASSIFY_SINGLE","ESTIMATE_REFERENCE_90"]);
  assert.deepEqual(e.patternSpecIds,[
    "ps_g4a_u03_arm_length_invariant_classification",
    "ps_g4a_u03_classify_angle_by_magnitude",
    "ps_g4a_u03_estimate_angle_from_right_angle_reference"
  ]);
  for(const key of ["browserConsoleErrorCount","browserPageErrorCount","browserRequestFailureCount","browserAssetHttpFailureCount"]) assert.equal(c.finalLearnerFacingEvidence[key],0,key);
  for(const key of ["referenceAngle90UsedForEstimation","classificationByMagnitudeRange","classificationIndependentOfArmLength","noProtractorProcedure","twoColumnPrintLayout","printSafePagination","responseLineVisible","priorG4AU03OwnersPreserved","laterSameSourceSemanticsHidden","sameUnitMixedModeFailClosed"]) assert.equal(c.learnerVisualContract[key],true,key);
});

test("Q005 D0 closeout is governance-only and preserves Q006 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q006OrLaterProductChanged"]) assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ006,false);
  assert.deepEqual(c.distance.remainingQ005Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q005_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q006SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q006_SourceAuthorityPreflight");
  assert.equal(c.q006SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice006Implementation");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q005 product merge does not mutate Q005 runtime or identity",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductMergeSha,"682920d960927ebf1ed6ea29ab2cd3197a90b457");
  assert.equal(m.commitsAfterExactProductMerge,13);
  assert.equal(m.q005RuntimeFilesChanged,false);
  assert.equal(m.q005CurriculumIdentityFilesChanged,false);
  assert.ok(m.changedFilesAfterExactProductMerge.every(p=>!p.includes("p08f05")&&!p.includes("q005-")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q005 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_angle_estimation_and_classification");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_angle_estimation_and_classification"]);
  assert.deepEqual(impact.changeImpact,{
    sharedExecutableChange:false,
    publicAuthorityCutover:false,
    legalRouteSemanticsChanged:false,
    affectedRoutes:"BOUNDED",
    globalReleaseCheckpoint:false,
    currentAuthorityChanged:false
  });
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
