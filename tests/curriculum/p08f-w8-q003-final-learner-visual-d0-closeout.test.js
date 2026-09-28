import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q003-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q003_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q003_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q3I="data/curriculum/full-product/p08f/q003-g4a-u03-angle-composition-rotation-clock-implementation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q3I);

test("Q003 final learner-visual D0 is granted only after exact actual-print operator acceptance",()=>{
  assert.equal(c.status,"Q003_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形檢查 OK");
  assert.equal(c.operatorAcceptance.exactArtifactId,10946607637);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36362656798);
  assert.equal(c.finalProductAuthority.pagesE2ERunAttempt,2);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"20b5c2dbacecdf96a414ea8ec70ad3f26ae6cc00");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"20b5c2dbacecdf96a414ea8ec70ad3f26ae6cc00");
});

test("Q003 final learner-facing evidence is print-safe for both angle and clock KPs",()=>{
  for(const e of [c.finalLearnerFacingEvidence.angleCompositionDecomposition,c.finalLearnerFacingEvidence.rotationAngleClock]){
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
    assert.equal(e.degreeAnswerCount,15);
    assert.equal(e.responseLineCount,15);
  }
  assert.deepEqual(c.finalLearnerFacingEvidence.angleCompositionDecomposition.diagramModes,["ADJACENT_COMPOSITION","NAMED_RAY_MISSING_PART","WHOLE_PART_DECOMPOSITION"]);
  assert.deepEqual(c.finalLearnerFacingEvidence.rotationAngleClock.diagramModes,["CLOCK_HANDS","CLOCK_STEP","ROTATION_TURN"]);
  assert.equal(c.finalLearnerFacingEvidence.rotationAngleClock.clockwiseAndCounterclockwiseBothCovered,true);
  assert.equal(c.finalLearnerFacingEvidence.browserConsoleErrorCount,0);
  assert.equal(c.finalLearnerFacingEvidence.browserPageErrorCount,0);
  assert.equal(c.finalLearnerFacingEvidence.browserRequestFailureCount,0);
  assert.equal(c.finalLearnerFacingEvidence.browserAssetHttpFailureCount,0);
});

test("Q003 D0 closeout is governance-only and preserves Q004 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q004OrLaterProductChanged"]){
    assert.equal(c.scope[key],false,key);
  }
  assert.equal(c.antiScopeCreep.implementQ004,false);
  assert.deepEqual(c.distance.remainingQ003Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q003_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q004SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q004_SourceAuthorityPreflight");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q003 product merge is CI evidence only",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductMergeSha,"20b5c2dbacecdf96a414ea8ec70ad3f26ae6cc00");
  assert.equal(m.commitsAfterExactProductMerge,9);
  assert.equal(m.onlyCiEvidenceFilesChanged,true);
  assert.equal(m.productRuntimeFilesChanged,false);
  assert.equal(m.curriculumRuntimeFilesChanged,false);
  assert.ok(m.changedFilesAfterExactProductMerge.every(p=>p.startsWith("docs/ci/")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q003 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_angle_composition_decomposition","kp_rotation_angle_clock"]);
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
