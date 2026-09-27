import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q001-final-learner-visual-d0-closeout-v2.json";
const R="data/curriculum/full-product/p08f/q001-learner-visual-acceptance-reopen.json";
const Q2="data/curriculum/full-product/p08f/q002-g5a-u10a-solid-viewpoint-representation-source-authority-preflight.json";
const I="data/project/change-impact/P08F_W8_Q001_FINAL_LEARNER_VISUAL_D0_CLOSEOUT_V2.impact.json";
const V="data/project/validation-plans/P08F_W8_Q001_FINAL_LEARNER_VISUAL_D0_CLOSEOUT_V2.validation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),r=read(R),q2=read(Q2),impact=read(I),plan=read(V);

test("Q001 final learner-visual D0 is granted only after exact actual-print operator acceptance",()=>{
  assert.equal(c.status,"Q001_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"核準。可驗收");
  assert.equal(c.operatorAcceptance.exactArtifactId,10930718075);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36316887176);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.humanReviewRepairMergeSha,"a70869c489eb39ec484772d7382c3a2bccedf0cf");
  assert.equal(r.status,"OPERATOR_SECOND_ACTUAL_PRINT_HUMAN_REVIEW_ACCEPTED_D0_ELIGIBLE");
  assert.equal(r.operatorFinalHumanReviewDecision.d0Eligible,true);
});

test("Q001 final learner-facing evidence has no clipping overflow or instrument flip",()=>{
  const e=c.finalLearnerFacingEvidence;
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
  assert.equal(e.instrumentHorizontalCount,30);
  assert.equal(e.baselineRayExplicitCount,30);
  assert.equal(e.dualScaleDiagramCount,30);
  assert.equal(e.rotatedScaleLabelCount,0);
  assert.deepEqual(e.angleCoverageBuckets,["ACUTE","NEAR_RIGHT","OBTUSE"]);
  assert.deepEqual(e.alignmentAnswerStates,["A","B","C","D"]);
  assert.equal(c.learnerVisualContract.noInstrumentFlip,true);
});

test("Q001 D0 closeout is governance-only and preserves Q002 product boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q002OrLaterProductChanged"]){
    assert.equal(c.scope[key],false,key);
  }
  assert.equal(c.antiScopeCreep.implementQ002,false);
  assert.deepEqual(c.distance.remainingQ001Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q001_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q2.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(q2.preflightDecision.nextTask,"P08F_W8DirectProductVerticalSlice002Implementation");
});

test("current-main movement after exact Q001 product merge is CI evidence only",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductMergeSha,"a70869c489eb39ec484772d7382c3a2bccedf0cf");
  assert.equal(m.commitsAfterExactProductMerge,6);
  assert.equal(m.onlyCiEvidenceFilesChanged,true);
  assert.equal(m.productRuntimeFilesChanged,false);
  assert.equal(m.curriculumRuntimeFilesChanged,false);
  assert.ok(m.changedFilesAfterExactProductMerge.every(p=>p.startsWith("docs/ci/")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
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
