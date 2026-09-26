import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const C="data/curriculum/full-product/p08f/q001-g4a-u03-protractor-angle-measurement-final-d0-closeout.json";
const I="data/project/change-impact/P08F_W8_Q001_FINAL_D0_CLOSEOUT_V1.impact.json";
const V="data/project/validation-plans/P08F_W8_Q001_FINAL_D0_CLOSEOUT_V1.validation.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read(C),impact=read(I),plan=read(V);

test("W8 Q001 final closeout preserves exact frozen owner and E6 product evidence",()=>{
  assert.equal(c.status,"Q001_PASS_E6_D0_EXACT_FAILURE_SET_PARITY_CLOSED");
  assert.equal(c.scope.queuePosition,1);
  assert.equal(c.scope.sliceId,"p08e_q001_r1_g4a_u03_4a03_profile_geometry_property_c1");
  assert.equal(c.scope.sourceId,"g4a_u03_4a03");
  assert.equal(c.scope.knowledgePointId,"kp_protractor_angle_measurement");
  assert.equal(c.productAuthority.implementationPr,1080);
  assert.equal(c.productAuthority.implementationPrGateConclusion,"success");
  assert.equal(c.productAuthority.implementationMergeSha,"2ddee98f99b4dec18ab6f24d9fb3acac31f18aa1");
  assert.equal(c.productAuthority.pagesE2EConclusion,"success");
  assert.equal(c.productAuthority.pagesE2EStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(c.productAuthority.classicUiAcceptanceStatus,"PASS_P08F_W8_Q001_CLASSIC_UI_ACCEPTANCE");
  assert.equal(c.productAuthority.questionCount,12);
  assert.equal(c.productAuthority.answerCount,12);
  assert.equal(c.productAuthority.diagramCount,24);
  assert.equal(c.productAuthority.consoleErrorCount,0);
  assert.equal(c.productAuthority.pageErrorCount,0);
});

test("Q023 ownership-isolation exact-head Node Test failure set is a strict subset with zero additions",()=>{
  const n=c.postMergeExactHeadFailureSetParity.nodeTest;
  assert.deepEqual({tests:n.baseline.tests,pass:n.baseline.pass,fail:n.baseline.fail},{tests:6112,pass:5939,fail:173});
  assert.deepEqual({tests:n.afterOwnershipIsolation.tests,pass:n.afterOwnershipIsolation.pass,fail:n.afterOwnershipIsolation.fail},{tests:6117,pass:5946,fail:171});
  assert.equal(n.exactSetDelta.overlapFailures,171);
  assert.equal(n.exactSetDelta.removedFailures,2);
  assert.equal(n.exactSetDelta.addedFailures,0);
  assert.deepEqual(n.exactSetDelta.removedFailureTitles,[
    "Q024 exact frozen successor follows Q023 D0",
    "Q024 exact identity consumes merged preflight and Q023 D0"
  ]);
  assert.deepEqual(n.exactSetDelta.addedFailureTitles,[]);
});

test("Math CI Readback independently proves the same two removals and zero additions",()=>{
  const r=c.postMergeExactHeadFailureSetParity.mathCiReadback;
  assert.deepEqual({tests:r.baseline.tests,pass:r.baseline.pass,fail:r.baseline.fail},{tests:6112,pass:5938,fail:174});
  assert.deepEqual({tests:r.afterOwnershipIsolation.tests,pass:r.afterOwnershipIsolation.pass,fail:r.afterOwnershipIsolation.fail},{tests:6117,pass:5945,fail:172});
  assert.equal(r.exactSetDelta.overlapFailures,172);
  assert.equal(r.exactSetDelta.removedFailures,2);
  assert.equal(r.exactSetDelta.addedFailures,0);
  assert.deepEqual(r.exactSetDelta.addedFailureTitles,[]);
  assert.equal(c.postMergeExactHeadFailureSetParity.causalNewFailures,0);
  assert.equal(c.postMergeExactHeadFailureSetParity.q023OwnershipFailuresRemoved,true);
});

test("main movement after exact ownership head is CI evidence only",()=>{
  const r=c.currentMainReadbackAtMaterialization;
  assert.equal(r.exactOwnershipRepairHeadSha,"40c65153ea5fad1a842602e271896b60220ccb7a");
  assert.equal(r.commitsAfterExactHead,6);
  assert.equal(r.onlyCiEvidenceFilesChanged,true);
  assert.equal(r.productRuntimeFilesChanged,false);
  assert.equal(r.curriculumRuntimeFilesChanged,false);
  assert.ok(r.changedFilesAfterExactHead.every(p=>p.startsWith("docs/ci/")));
});

test("Q001 closeout is evidence-only and does not absorb historical global debt or Q002",()=>{
  for(const v of Object.values(c.antiScopeCreep)) assert.equal(v,false);
  for(const key of ["productRuntimeChanged","publicBindingChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","sourceAuthorityChanged","patternSpecsChanged","frozenQueueChanged","q002OrLaterProductChanged"]){
    assert.equal(c.scope[key],false,key);
  }
  assert.deepEqual(c.distance.remainingQ001Blockers,[]);
  assert.equal(c.distance.goalDistanceAfter,"D0_Q001_FINAL_EXACT_PARITY_CLOSED");
  assert.equal(c.distance.nextShortestStep,"P08F_W8_Q002_SourceAuthorityPreflight");
});

test("UNIT_INCREMENTAL_VALIDATION_V1 keeps final closeout KP-focused",()=>{
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
