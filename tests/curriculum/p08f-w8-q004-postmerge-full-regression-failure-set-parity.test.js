import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const a=read("data/curriculum/full-product/p08f/q004-postmerge-full-regression-failure-set-parity-attribution.json");
const implementation=read("data/curriculum/full-product/p08f/q004-g5a-u05a1-central-angle-measurement-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q004_POSTMERGE_FAILURE_PARITY.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q004_POSTMERGE_FAILURE_PARITY.validation.json");

test("Q004 post-merge Node lane has exact baseline named-failure-set parity",()=>{
  const x=a.comparison.nodePostMergeLane;
  assert.equal(x.baseline.fail,173);
  assert.equal(x.q004PostMerge.fail,173);
  assert.equal(x.baseline.namedFailureCount,173);
  assert.equal(x.q004PostMerge.namedFailureCount,173);
  assert.equal(x.testCountDelta,16);
  assert.equal(x.passCountDelta,16);
  assert.equal(x.failCountDelta,0);
  assert.deepEqual(x.namedFailureAdded,[]);
  assert.deepEqual(x.namedFailureRemoved,[]);
  assert.equal(x.exactNamedFailureSetParity,true);
  assert.equal(x.attribution,"BASELINE_ONLY");
});

test("Q004 post-merge Math CI readback lane has exact baseline named-failure-set parity",()=>{
  const x=a.comparison.mathCiReadbackLane;
  assert.equal(x.baseline.fail,174);
  assert.equal(x.q004PostMerge.fail,174);
  assert.equal(x.baseline.namedFailureCount,174);
  assert.equal(x.q004PostMerge.namedFailureCount,174);
  assert.equal(x.testCountDelta,16);
  assert.equal(x.passCountDelta,16);
  assert.equal(x.failCountDelta,0);
  assert.deepEqual(x.namedFailureAdded,[]);
  assert.deepEqual(x.namedFailureRemoved,[]);
  assert.equal(x.exactNamedFailureSetParity,true);
  assert.equal(x.attribution,"BASELINE_ONLY");
});

test("Q004 exact product evidence is green despite baseline repository failures",()=>{
  assert.equal(a.q004ProductEvidence.prGateRunId,36365940382);
  assert.equal(a.q004ProductEvidence.prGateConclusion,"success");
  assert.equal(a.q004ProductEvidence.pagesDeployRunId,36366018905);
  assert.equal(a.q004ProductEvidence.pagesDeployConclusion,"success");
  assert.equal(a.q004ProductEvidence.livePagesE2ERunId,36366018910);
  assert.equal(a.q004ProductEvidence.livePagesE2EConclusion,"success");
  assert.equal(a.q004ProductEvidence.exactDeployedHeadSha,"393620f73b11822aa7f19f40cfd593bb0ecd1afa");
  assert.equal(a.q004ProductEvidence.livePagesArtifactId,10947402867);
  assert.equal(a.decision.q004IntroducedNewNamedRegression,false);
  assert.equal(a.decision.q004RegressionRepairRequired,false);
  assert.equal(a.decision.technicalE6BlockerCleared,true);
});

test("failure attribution is governance-only and does not mutate Q004 product scope",()=>{
  for(const key of ["productRuntimeChanged","selectorChanged","publicBindingChanged","generatorChanged","validatorChanged","worksheetChanged","rendererChanged","sourceAuthorityChanged","formalMappingChanged","patternSpecChanged","frozenQueueChanged","q005OrLaterProductChanged"])assert.equal(a.scope[key],false,key);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI_LIVE_E6_AND_ACTUAL_PRINT_REVIEW");
  assert.equal(a.currentMainReadbackAtAttribution.onlyCiEvidenceFilesChanged,true);
  assert.equal(a.currentMainReadbackAtAttribution.productRuntimeFilesChanged,false);
  assert.ok(a.currentMainReadbackAtAttribution.changedFilesAfterExactProductMerge.every(p=>p.startsWith("docs/ci/")));
});

test("Q004 parity attribution clears only the regression-attribution blocker and leaves human review pending",()=>{
  assert.equal(a.status,"PASS_BASELINE_ONLY_FAILURE_SET_PARITY");
  assert.deepEqual(a.distance.remainingQ004Blockers,["ACTUAL_PRINT_HUMAN_REVIEW_PENDING","FINAL_D0_CLOSEOUT_PENDING"]);
  assert.equal(a.distance.nextShortestStep,"P08F_W8_Q004_ActualPrintHumanReview");
  assert.equal(impact.currentScope,"KP_LEAF");
  assert.equal(impact.currentKnowledgePointId,"kp_g5a_u05a1_central_angle_measurement");
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
