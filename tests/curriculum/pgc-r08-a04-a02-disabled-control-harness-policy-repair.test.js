import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { classifyDisabledControlSelection } from "../../tools/curriculum/pgc-r08-disabled-control-browser-policy.mjs";

const plan=JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A02.disabled-control-harness-policy-repair-plan.json","utf8"));
const readback=JSON.parse(await readFile(plan.sourceReadbackPath,"utf8"));
const queues=await Promise.all(plan.targetFamilies.map(async(family)=>JSON.parse(await readFile(family.queuePath,"utf8"))));
const policySource=await readFile("tools/curriculum/pgc-r08-disabled-control-browser-policy.mjs","utf8");
const runnerSource=await readFile("tools/curriculum/run-pgc-r08-a04-a02-disabled-control-family-replay.mjs","utf8");

test("PGC-R08 A04 A02 consumes the exact A01 harness-only authorization",()=>{
  assert.equal(readback.repairDecision.classification,"HARNESS_DISABLED_CURRENT_VALUE_POLICY_CONFIRMED");
  assert.equal(readback.repairDecision.productMutationAuthorized,false);
  assert.equal(readback.repairDecision.harnessMutationAuthorized,true);
  assert.equal(readback.repairDecision.affectedFamilyReplayRouteCount,180);
  assert.equal(plan.repairPolicy.productMutationAuthorized,false);
  assert.equal(plan.repairPolicy.capacityAuthorityMutationAuthorized,false);
  assert.equal(plan.repairPolicy.perRoutePatchAuthorized,false);
});

test("PGC-R08 A04 A02 targets exactly 176 question-type and 4 context-mode routes",()=>{
  assert.deepEqual(plan.targetFamilies.map((row)=>[row.failureFamily,row.routeCount]),[
    ["QUESTION_TYPE_CONTROL_DISABLED",176],
    ["CONTEXT_MODE_CONTROL_DISABLED",4],
  ]);
  assert.equal(queues[0].failureFamily,"QUESTION_TYPE_CONTROL_DISABLED");
  assert.equal(queues[0].rows.length,176);
  assert.equal(queues[1].failureFamily,"CONTEXT_MODE_CONTROL_DISABLED");
  assert.equal(queues[1].rows.length,4);
  assert.equal(plan.targetRouteCount,180);
});

test("disabled-control selection policy accepts only an already-equal current value",()=>{
  assert.equal(classifyDisabledControlSelection({disabled:false,currentValue:"numeric",requestedValue:"application"}),"SELECT_REQUIRED");
  assert.equal(classifyDisabledControlSelection({disabled:true,currentValue:"numeric",requestedValue:"numeric"}),"ACCEPT_CURRENT_VALUE");
  assert.equal(classifyDisabledControlSelection({disabled:true,currentValue:"numeric",requestedValue:"application"}),"FAIL_DISABLED_VALUE_MISMATCH");
  assert.match(policySource,/PGC_R08_DISABLED_CONTROL_VALUE_MISMATCH/);
  assert.match(policySource,/return \[currentValue\]/);
});

test("A02 replay reuses the canonical A03 nine-gate route executor",()=>{
  assert.match(runnerSource,/executeRoute/);
  assert.match(runnerSource,/wrapBrowserWithDisabledControlSelectionPolicy/);
  assert.match(runnerSource,/GATE_CODES/);
  assert.match(runnerSource,/targetRouteCount/);
  assert.match(runnerSource,/PASS_180_DISABLED_CONTROL_ROUTES_ALL_NINE_GATES/);
  assert.doesNotMatch(runnerSource,/writeFile\([^\n]*site[\\/]index\.html/);
  assert.doesNotMatch(runnerSource,/writeFile\([^\n]*generator_capacity_contract\.json/);
});

test("A02 admits only the exact reproducible route-297 regenerate handoff",()=>{
  assert.equal(plan.overlappingFailurePolicy.finalNineGateObligationRetained,true);
  assert.equal(plan.overlappingFailurePolicy.unlistedFailure,"CI_BLOCKING");
  assert.equal(plan.overlappingFailurePolicy.allowedHandoffs.length,1);
  const [handoff]=plan.overlappingFailurePolicy.allowedHandoffs;
  assert.equal(handoff.routeIndex,297);
  assert.equal(handoff.routeId,"pgc_r03_g4b_u06_4b06_application_243390fad850");
  assert.equal(handoff.downstreamFailureFamily,"REGENERATE_IDENTITY_TIMEOUT");
  assert.equal(handoff.requiredPendingGateCode,"REGENERATE_PASS");
  assert.deepEqual(handoff.requiredPassedGateCodes.sort(),[
    "ANSWER_KEY_PASS",
    "ANSWER_VALIDATION_PASS",
    "GENERATE_BUTTON_PASS",
    "HTML_PASS",
    "PDF_PASS",
    "QUESTION_COUNT_PASS",
    "QUESTION_IDENTITY_PASS",
    "UI_OPTIONS_PASS",
  ]);
  assert.match(runnerSource,/classifyAllowedHandoff/);
  assert.match(runnerSource,/unclassifiedFailures/);
  assert.match(runnerSource,/PASS_DISABLED_CONTROL_FAMILIES_WITH_CLASSIFIED_DOWNSTREAM_HANDOFF/);
  assert.match(runnerSource,/finalNineGateObligationRetained/);
});
