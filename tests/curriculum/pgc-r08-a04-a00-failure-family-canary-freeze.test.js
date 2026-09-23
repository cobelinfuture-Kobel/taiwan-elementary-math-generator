import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const plan=JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A00.failure-family-repair-canary-matrix.json","utf8"));
const sha256=(text)=>createHash("sha256").update(text).digest("hex");

test("PGC-R08 A04 A00 freezes the exact A03 queue counts",()=>{
  assert.equal(plan.status,"FROZEN_PENDING_FOCUSED_REPRODUCTION");
  assert.deepEqual(plan.frozenCounts,{legalRoutes:793,passRoutes:466,failedRoutes:327,failureFamilies:5,capacityReconciliationRoutes:35,failureCanaries:17,capacityCanaries:5});
  assert.equal(plan.failureFamilies.reduce((sum,row)=>sum+row.queueCount,0),327);
  assert.equal(plan.failureFamilies.reduce((sum,row)=>sum+row.canaries.length,0),17);
});

test("PGC-R08 A04 A00 canaries resolve inside every SHA-bound family queue",async()=>{
  for(const family of plan.failureFamilies){
    const content=await readFile(family.queuePath,"utf8");
    assert.equal(sha256(content),family.queueSha256);
    const queue=JSON.parse(content);
    const identities=new Set(queue.rows.map((row)=>`${row[0]}:${row[1]}`));
    for(const canary of family.canaries) assert.ok(identities.has(`${canary.routeIndex}:${canary.routeId}`));
  }
});

test("PGC-R08 A04 A00 retains all context and regenerate failures as canaries",()=>{
  const map=Object.fromEntries(plan.failureFamilies.map((row)=>[row.failureFamily,row]));
  assert.equal(map.CONTEXT_MODE_CONTROL_DISABLED.queueCount,4);
  assert.equal(map.CONTEXT_MODE_CONTROL_DISABLED.canaries.length,4);
  assert.equal(map.REGENERATE_IDENTITY_TIMEOUT.queueCount,2);
  assert.equal(map.REGENERATE_IDENTITY_TIMEOUT.canaries.length,2);
});

test("PGC-R08 A04 A00 enforces diagnostic-first family repair",()=>{
  assert.equal(plan.diagnosticPolicy.mode,"DIAGNOSTIC_FIRST");
  assert.equal(plan.diagnosticPolicy.productMutationBeforeFamilyClassification,"FORBIDDEN");
  assert.equal(plan.diagnosticPolicy.perRoutePatch,"FORBIDDEN");
  assert.equal(plan.diagnosticPolicy.familyRepairRequired,true);
  assert.equal(plan.diagnosticPolicy.full793ReplayAfterAllRepairs,true);
  assert.equal(plan.repairOrder.at(-1).familyGroup[0],"FULL_REPLAY");
});
