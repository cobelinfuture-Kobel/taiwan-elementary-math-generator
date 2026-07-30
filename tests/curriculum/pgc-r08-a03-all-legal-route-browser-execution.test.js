import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readJson=(relativePath)=>JSON.parse(readFileSync(new URL(relativePath,import.meta.url),"utf8"));
const a01=readJson("../../data/curriculum/public-generation/public_generate_button_acceptance.json");
const a02=readJson("../../data/curriculum/public-generation/PGC-R08-A02.public-generate-canary-harness.json");
const plan=readJson("../../data/curriculum/public-generation/PGC-R08-A03.all-legal-route-browser-execution-plan.json");
const runner=readFileSync(new URL("../../tools/curriculum/run-pgc-r08-a03-all-legal-routes.mjs",import.meta.url),"utf8");

test("PGC-R08 A03 starts from closed A02 and the 793-row A01 authority",()=>{
  assert.equal(a01.status,"PASS_MATRIX_MATERIALIZED_PENDING_BROWSER_EXECUTION");
  assert.equal(a01.summary.legalRouteCount,793);
  assert.equal(a01.summary.shardCount,16);
  assert.equal(a02.status,"PASS_R08_A02_PUBLIC_GENERATE_BUTTON_CANARY_HARNESS_QUALIFIED");
  assert.equal(plan.previousTaskId,"PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification");
});

test("PGC-R08 A03 preserves all deterministic shard identities",()=>{
  assert.equal(plan.shards.length,16);
  assert.deepEqual(plan.shards.map((row)=>row.shardId),a01.shards.map((row)=>row.shardId));
  assert.deepEqual(plan.shards.map((row)=>row.routeIdsSha256),a01.shards.map((row)=>row.routeIdsSha256));
  assert.equal(plan.shards.reduce((sum,row)=>sum+row.routeCount,0),793);
});

test("PGC-R08 A03 carries the A02 sentinel and live-20 handoff",()=>{
  assert.deepEqual(plan.mandatoryHandoffs.map((row)=>row.routeId),[
    "pgc_r03_g3a_u01_3a01_application_078745248eea",
    "pgc_r03_g3a_u08_3a08_numeric_32207c12fa17",
  ]);
  assert.equal(plan.mandatoryHandoffs[0].shardId,"PGC_R08_SHARD_01");
  assert.equal(plan.mandatoryHandoffs[1].shardId,"PGC_R08_SHARD_02");
});

test("PGC-R08 A03 executes every legal route and collects route failures instead of aborting",()=>{
  assert.equal(plan.executionPolicy.routeCount,793);
  assert.equal(plan.executionPolicy.workerConcurrency,4);
  assert.equal(plan.executionPolicy.sameRouteFailureDoesNotAbortMatrix,true);
  assert.equal(plan.executionPolicy.routeFailureDisposition,"COLLECT_IN_REPAIR_QUEUE");
  assert.equal(plan.executionPolicy.systemFailureDisposition,"FAIL_CI");
  assert.match(runner,/materializeMatrix/);
  assert.match(runner,/Promise\.all\(Array\.from\(\{length:plan\.executionPolicy\.workerConcurrency\}/);
  assert.match(runner,/PASS_EXECUTION_COMPLETE_WITH_REPAIR_QUEUE/);
  assert.match(runner,/repairQueue/);
  assert.match(runner,/capacityEvidenceReconciliationQueue/);
  assert.match(runner,/executedRouteCount!==793/);
});

test("PGC-R08 A03 uses the accepted nine-gate real-browser journey",()=>{
  for(const gate of a01.executionContract.gateCodes)assert.ok(plan.gateCodes.includes(gate));
  assert.match(runner,/#batch-a-source-select/);
  assert.match(runner,/data-capacity-route-ids/);
  assert.match(runner,/#regenerate-button/);
  assert.match(runner,/page\.pdf\(/);
  assert.match(runner,/PRINT_TARGET_NOT_INVOKED/);
  assert.match(runner,/ANSWER_BIJECTION_FAILED/);
  assert.match(runner,/REGENERATE_IDENTITY_UNCHANGED/);
});

test("PGC-R08 A03 remains inside the frozen product boundary",()=>{
  assert.deepEqual(plan.frozenBoundary,{
    productUiModificationAllowed:false,
    generatorModificationAllowed:false,
    validatorModificationAllowed:false,
    rendererModificationAllowed:false,
    capacityAuthorityMutationAllowed:false,
    newWorkflowAllowed:false,
    slice014Allowed:false,
  });
});
