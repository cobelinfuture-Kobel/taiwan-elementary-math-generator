import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q004-final-learner-visual-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q004_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.impact.json";
const V="data/project/validation-plans/P08F_W8_Q004_FINAL_LEARNER_VISUAL_D0_CLOSEOUT.validation.json";
const Q4I="data/curriculum/full-product/p08f/q004-g5a-u05a1-central-angle-measurement-implementation.json";
const P="data/curriculum/full-product/p08f/q004-postmerge-full-regression-failure-set-parity-attribution.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V),implementation=read(Q4I),parity=read(P);

test("Q004 final learner-visual D0 is granted only after exact actual-print operator acceptance",()=>{
  assert.equal(c.status,"Q004_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.operatorAcceptance.required,true);
  assert.equal(c.operatorAcceptance.actualPrintAccepted,true);
  assert.equal(c.operatorAcceptance.learnerFacingAccepted,true);
  assert.equal(c.operatorAcceptance.d0Granted,true);
  assert.equal(c.operatorAcceptance.decisionTextZh,"圖形檢查 OK");
  assert.equal(c.operatorAcceptance.exactArtifactId,10947402867);
  assert.equal(c.finalProductAuthority.pagesE2ERunId,36366018910);
  assert.equal(c.finalProductAuthority.pagesE2ERunAttempt,1);
  assert.equal(c.finalProductAuthority.pagesE2EConclusion,"success");
  assert.equal(c.finalProductAuthority.implementationMergeSha,"393620f73b11822aa7f19f40cfd593bb0ecd1afa");
  assert.equal(c.finalProductAuthority.exactDeployedHeadSha,"393620f73b11822aa7f19f40cfd593bb0ecd1afa");
});

test("Q004 final learner-facing central-angle evidence is print-safe",()=>{
  const e=c.finalLearnerFacingEvidence.centralAngleMeasurement;
  assert.equal(e.questionCount,15);
  assert.equal(e.answerCount,15);
  assert.equal(e.diagramCount,30);
  assert.equal(e.questionPageCount,3);
  assert.equal(e.answerPageCount,3);
  assert.equal(e.worksheetColumns,2);
  assert.equal(e.rowsPerPage,3);
  assert.equal(e.clippedCellCount,0);
  assert.equal(e.overflowPageCount,0);
  assert.equal(e.degreeAnswerCount,15);
  assert.equal(e.responseLineCount,15);
  assert.deepEqual(e.markerModes,["CENTRAL_ANGLE_ARC"]);
  assert.deepEqual(e.patternSpecIds,[
    "ps_g5a_u05a1_measure_central_angle_between_radii",
    "ps_g5a_u05a1_read_central_angle_sector_diagram",
    "ps_g5a_u05a1_rotation_invariant_central_angle"
  ]);
  assert.equal(c.finalLearnerFacingEvidence.browserConsoleErrorCount,0);
  assert.equal(c.finalLearnerFacingEvidence.browserPageErrorCount,0);
  assert.equal(c.finalLearnerFacingEvidence.browserRequestFailureCount,0);
  assert.equal(c.finalLearnerFacingEvidence.browserAssetHttpFailureCount,0);
});

test("Q004 D0 consumes exact baseline-only post-merge failure-set attribution",()=>{
  assert.equal(parity.status,"PASS_BASELINE_ONLY_FAILURE_SET_PARITY");
  assert.equal(c.postMergeFailureAttribution.status,"PASS_BASELINE_ONLY_FAILURE_SET_PARITY");
  assert.equal(c.postMergeFailureAttribution.nodeLane.failDelta,0);
  assert.equal(c.postMergeFailureAttribution.nodeLane.exactNamedFailureSetParity,true);
  assert.equal(c.postMergeFailureAttribution.mathCiReadbackLane.failDelta,0);
  assert.equal(c.postMergeFailureAttribution.mathCiReadbackLane.exactNamedFailureSetParity,true);
  assert.equal(c.postMergeFailureAttribution.q004RegressionRepairRequired,false);
});

test("Q004 D0 closeout is governance-only and preserves Q005 boundary",()=>{
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","formalMappingIdentityChanged","patternSpecIdentityChanged","frozenQueueChanged","q005OrLaterProductChanged"]) assert.equal(c.scope[key],false,key);
  assert.equal(c.antiScopeCreep.implementQ005,false);
  assert.deepEqual(c.distance.remainingQ004Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q004_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(c.q005SuccessorReadiness.nextPreflightTaskId,"P08F_W8_Q005_SourceAuthorityPreflight");
  assert.equal(c.q005SuccessorReadiness.nextImplementationTaskId,"P08F_W8DirectProductVerticalSlice005Implementation");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
});

test("current-main movement after exact Q004 product merge contains no product runtime mutation",()=>{
  const m=c.currentMainReadbackAtMaterialization;
  assert.equal(m.exactProductMergeSha,"393620f73b11822aa7f19f40cfd593bb0ecd1afa");
  assert.equal(m.commitsAfterExactProductMerge,13);
  assert.equal(m.onlyApprovedQ004GovernanceAndCiEvidenceFilesChanged,true);
  assert.equal(m.productRuntimeFilesChanged,false);
  assert.equal(m.curriculumRuntimeFilesChanged,false);
  assert.ok(m.changedFilesAfterExactProductMerge.every(p=>p.startsWith("docs/ci/")||p.includes("Q004_POSTMERGE_FAILURE_PARITY")||p.includes("q004-postmerge-full-regression-failure-set-parity")));
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps Q004 final D0 closeout KP-focused",()=>{
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_g5a_u05a1_central_angle_measurement");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(impact.currentKnowledgePointIds,["kp_g5a_u05a1_central_angle_measurement"]);
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
