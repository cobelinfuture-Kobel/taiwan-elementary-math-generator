import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const plan=JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A01.disabled-control-focused-reproduction-plan.json","utf8"));
const authority=JSON.parse(await readFile(plan.authorityPath,"utf8"));
const readback=JSON.parse(await readFile(plan.readbackPath,"utf8"));
const runner=await readFile("tools/curriculum/run-pgc-r08-a04-a01-disabled-control-reproduction.mjs","utf8");
const temporaryWorkflowPath=".github/workflows/pgc-r08-a04-a01-disabled-control-reproduction.yml";

test("PGC-R08 A04 A01 targets exactly the eight frozen disabled-control canaries",()=>{
  const families=authority.failureFamilies.filter((family)=>plan.targetFamilies.includes(family.failureFamily));
  assert.equal(families.length,2);
  assert.equal(families.reduce((sum,family)=>sum+family.canaries.length,0),8);
  assert.equal(plan.targetFamilyRouteCount,180);
  assert.equal(plan.canaryCount,8);
});

test("PGC-R08 A04 A01 exact browser evidence classifies both families as harness policy",()=>{
  assert.equal(plan.status,"PASS_FOCUSED_REPRODUCTION_CLASSIFIED");
  assert.equal(readback.status,"PASS_FOCUSED_REPRODUCTION_CLASSIFIED_HARNESS_POLICY_REPAIR_AUTHORIZED");
  assert.equal(readback.sourceEvidence.headSha,"37a45718f7fbaee6f61c95edb867a39b1ab87df4");
  assert.equal(readback.sourceEvidence.workflowRunId,30599279607);
  assert.equal(readback.sourceEvidence.artifactId,8781288076);
  assert.equal(readback.classificationCounts.DISABLED_CURRENT_VALUE_MATCH,8);
  assert.equal(readback.classificationCounts.ENABLED_SELECTION_PASS,0);
  assert.equal(readback.classificationCounts.DISABLED_VALUE_MISMATCH,0);
  assert.equal(readback.classificationCounts.SYSTEM_FAILURE,0);
  assert.equal(readback.familyResults.length,2);
  assert.ok(readback.familyResults.every((family)=>family.verdict==="HARNESS_POLICY_DEFECT"));
  assert.equal(readback.repairDecision.productMutationAuthorized,false);
  assert.equal(readback.repairDecision.harnessMutationAuthorized,true);
  assert.equal(readback.repairDecision.affectedFamilyReplayRouteCount,180);
});

test("PGC-R08 A04 A01 is diagnostic-only and stops before route binding or generation",()=>{
  assert.equal(plan.probeBoundary,"public controls only; stop before capacity route binding and generation");
  assert.equal(plan.acceptance.productMutationPerformed,false);
  assert.equal(plan.acceptance.capacityAuthorityMutationPerformed,false);
  assert.match(runner,/probeControl/);
  assert.match(runner,/DISABLED_CURRENT_VALUE_MATCH/);
  assert.match(runner,/DISABLED_VALUE_MISMATCH/);
  assert.doesNotMatch(runner,/page\.click\(S\.generate/);
  assert.doesNotMatch(runner,/bindRoute/);
});

test("PGC-R08 A04 A01 temporary browser workflow is removed before merge",async()=>{
  await assert.rejects(access(temporaryWorkflowPath),(error)=>error?.code==="ENOENT");
  assert.equal(readback.temporaryWorkflowRemovedBeforeMerge,true);
});
