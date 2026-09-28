import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q002-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q002_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q002_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q2I="data/curriculum/full-product/p08f/q002-g5a-u10a-solid-viewpoint-representation-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q2I);

test("Q002 final learner-visual D0 is granted only after exact actual-print operator acceptance",()=>{
  assert.equal(c.status,"Q002_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖行檢查Ok");
  assert.equal(c.operatorAcceptance.exactArtifactId,10936835243);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36332387867);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"a01573722def1d761fce0bb5591415bfa1773649");
});

test("Q002 final learner-facing evidence is print-safe and covers both turn directions",()=>{
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
  assert.ok(e.clockwiseQuestionCount>0);
  assert.ok(e.counterclockwiseQuestionCount>0);
  assert.deepEqual(e.diagramModes,["COMPLETE_ROTATED_VIEW","TRACK_FRONT_FACE","TURN_TO_FRONT_LABEL"]);
  assert.equal(e.responseLineCount,15);
  assert.equal(e.browserConsoleErrorCount,0);
  assert.equal(e.browserPageErrorCount,0);
});

test("Q002 D0 closeout is governance-only and preserves Q003 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q003OrLaterProductChanged"]){
    assert.equal(c.scope[key],false,key);
  }
  assert.equal(c.antiScopeCreep.implementQ003,false);
  assert.deepEqual(c.distance.remainingQ002Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q002_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q003SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q003_SourceAuthorityPreflight");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q002 product merge is CI evidence only",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductMergeSha,"a01573722def1d761fce0bb5591415bfa1773649");
  assert.equal(m.commitsAfterExactProductMerge,14);
  assert.equal(m.onlyCiEvidenceFilesChanged,true);
  assert.equal(m.productRuntimeFilesChanged,false);
  assert.equal(m.curriculumRuntimeFilesChanged,false);
  assert.ok(m.changedFilesAfterExactProductMerge.every(p=>p.startsWith("docs/ci/")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q002 final D0 closeout KP-focused",()=>{
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
