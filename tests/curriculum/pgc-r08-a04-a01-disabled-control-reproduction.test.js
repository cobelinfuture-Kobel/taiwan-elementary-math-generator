import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const plan=JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A01.disabled-control-focused-reproduction-plan.json","utf8"));
const authority=JSON.parse(await readFile(plan.authorityPath,"utf8"));
const runner=await readFile("tools/curriculum/run-pgc-r08-a04-a01-disabled-control-reproduction.mjs","utf8");
const workflow=await readFile(".github/workflows/pgc-r08-a04-a01-disabled-control-reproduction.yml","utf8");

test("PGC-R08 A04 A01 targets exactly the eight frozen disabled-control canaries",()=>{
  const families=authority.failureFamilies.filter((family)=>plan.targetFamilies.includes(family.failureFamily));
  assert.equal(families.length,2);
  assert.equal(families.reduce((sum,family)=>sum+family.canaries.length,0),8);
  assert.equal(plan.targetFamilyRouteCount,180);
  assert.equal(plan.workerConcurrency,4);
});

test("PGC-R08 A04 A01 is diagnostic-only and stops before route binding or generation",()=>{
  assert.equal(plan.probeBoundary,"public controls only; stop before capacity route binding and generation");
  assert.equal(plan.acceptance.productMutationPerformed,false);
  assert.equal(plan.acceptance.capacityAuthorityMutationPerformed,false);
  assert.match(runner,/probeControl/);
  assert.match(runner,/DISABLED_CURRENT_VALUE_MATCH/);
  assert.match(runner,/ENABLED_SELECTION_PASS/);
  assert.match(runner,/DISABLED_VALUE_MISMATCH/);
  assert.doesNotMatch(runner,/page\.click\(S\.generate/);
  assert.doesNotMatch(runner,/bindRoute/);
});

test("PGC-R08 A04 A01 temporary workflow is branch-scoped and uploads only focused evidence",()=>{
  assert.match(workflow,/pgc-r08-a04-a01-disabled-control-reproduction/);
  assert.match(workflow,/run-pgc-r08-a04-a01-disabled-control-reproduction\.mjs/);
  assert.match(workflow,/pgc-r08-a04-a01-disabled-control-reproduction-artifact/);
  assert.match(workflow,/permissions:\s*\n\s*contents: read/);
});
