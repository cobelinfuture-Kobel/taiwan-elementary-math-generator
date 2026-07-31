import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const readJson=async(path)=>JSON.parse(await readFile(path,"utf8"));
const readback=await readJson("data/curriculum/public-generation/PGC-R08-A03.terminal-browser-execution-readback.json");
const repair=await readJson("data/curriculum/public-generation/PGC-R08-A03.repair-queue.json");
const capacity=await readJson("data/curriculum/public-generation/PGC-R08-A03.capacity-evidence-reconciliation-queue.json");
const workflow=await readFile(".github/workflows/node-test.yml","utf8");
const sha256=(text)=>createHash("sha256").update(text).digest("hex");

test("PGC-R08 A03 exact-head terminal readback is authoritative",()=>{
  assert.equal(readback.status,"PASS_TERMINAL_ARTIFACT_READ_AND_QUEUES_MATERIALIZED");
  assert.equal(readback.sourceArtifact.headSha,"3e4e843163fdc67d777657fdc329e35c9a9bbc23");
  assert.equal(readback.sourceArtifact.workflowRunId,30594944965);
  assert.equal(readback.sourceArtifact.artifactId,8780383150);
  assert.equal(readback.integrity.authoritativeFinalCheckpoint,true);
  assert.equal(readback.integrity.finalCheckpointExecutedRouteCount,793);
  assert.equal(readback.integrity.all16ShardSamplesPresent,true);
  assert.equal(readback.integrity.authoritativeRouteClassificationMutatedBySampleReplay,false);
  assert.equal(readback.executionSummary.passRouteCount,466);
  assert.equal(readback.executionSummary.failRouteCount,327);
});

test("PGC-R08 A03 repair queue is complete, hashed and grouped into five bounded families",async()=>{
  assert.equal(repair.summary.queueCount,327);
  assert.equal(repair.summary.failureFamilyCount,5);
  assert.equal(repair.summary.failedBeforeFirstGateCount,325);
  assert.equal(repair.summary.postGenerateFailureCount,2);
  let total=0;
  for(const family of repair.familyQueues){
    const content=await readFile(family.path,"utf8");
    assert.equal(sha256(content),family.sha256);
    const queue=JSON.parse(content);
    assert.equal(queue.failureFamily,family.failureFamily);
    assert.equal(queue.rows.length,family.count);
    total+=queue.rows.length;
  }
  assert.equal(total,327);
  assert.equal(repair.repairPolicy.productMutationAllowedInThisMaterializationTask,false);
  assert.equal(repair.repairPolicy.capacityAuthorityMutationAllowedInA03,false);
});

test("PGC-R08 A03 capacity queue preserves live-20 evidence without mutating authority",()=>{
  assert.equal(capacity.summary.queueCount,35);
  assert.equal(capacity.routes.length,35);
  assert.equal(capacity.summary.allObservedAtQuestionCount,20);
  assert.equal(capacity.summary.authorityMutationPerformedByA03,false);
  assert.equal(capacity.proposedCapacityStatus,"VERIFIED_20");
});

test("PGC-R08 A03 temporary Node workflow wiring is removed before merge",()=>{
  assert.doesNotMatch(workflow,/pgc-r08-a03-all-legal-routes-browser-execution/);
  assert.doesNotMatch(workflow,/Run PGC-R08 A03 all legal route browser execution/);
  assert.doesNotMatch(workflow,/Upload PGC-R08 A03 all legal route browser artifacts/);
});
