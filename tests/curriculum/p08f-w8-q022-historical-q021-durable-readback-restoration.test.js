import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const r=read("data/curriculum/full-product/p08f/q022-historical-q021-durable-readback-restoration.json");
const live=read("docs/ci/latest-p08f-w8-q021-pages-e2e.json");
const impact=read("data/project/change-impact/P08F_W8_Q022_HISTORICAL_Q021_DURABLE_READBACK_RESTORATION.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q022_HISTORICAL_Q021_DURABLE_READBACK_RESTORATION.validation.json");
test("Q021 durable D0 evidence is restored exactly after Q022 successor overwrite",()=>{
  assert.equal(live.status,"PASS_E6_D0_COMPLETE");assert.equal(live.d0Granted,true);
  assert.equal(live.exactHeadSha,"0ef5d3c3e082db2cb1d950f5e271b749a2c62ee7");
  assert.equal(live.operatorHumanVisualReview.status,"PASS_OPERATOR_APPROVED");
  assert.equal(live.postMergeFullRegressionParity.status,"PASS_NO_NEW_FAILURES_BASELINE_ONLY");
  assert.equal(live.finalCloseout.status,"PASS_E6_D0_COMPLETE");
  assert.equal(live.historicalReadbackRestoration.overwrittenByRunId,36678795811);
});
test("restoration is evidence-only and resolves the sole new post-repair failure class",()=>{
  assert.equal(r.regressionAttributionAfterFirstCompatibilityRepair.node.addedFailureTitles.length,1);
  assert.equal(r.regressionAttributionAfterFirstCompatibilityRepair.mathCi.addedFailureTitles.length,1);
  assert.equal(r.regressionAttributionAfterFirstCompatibilityRepair.remainingNewFailureClass,"HISTORICAL_DURABLE_READBACK_OVERWRITE_ONLY");
  assert.equal(r.regressionAttributionAfterFirstCompatibilityRepair.q022ProductSemanticRegressionDetected,false);
  for(const [k,v] of Object.entries(r.repair))if(k!=="restoreAcceptedQ021DurableReadback")assert.equal(v,false,k);
});
test("restoration validation remains KP focused and does not absorb global baseline debt",()=>{
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
  assert.equal(r.antiScopeCreep.repairOtherBaselineFailures,false);
});
