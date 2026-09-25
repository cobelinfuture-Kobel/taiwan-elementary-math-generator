import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const q025=JSON.parse(readFileSync(new URL("../../docs/ci/latest-p07f-w7-q025-pages-e2e.json",import.meta.url),"utf8"));

test("Q026 probe resolves exact frozen final successor after Q025 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[25];
  assert.equal(q025.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q025.exactHeadSha,"2f5a50b6284df48e16bcb6f23c8919fad7ed808d");
  assert.equal(row.queuePosition,26);
  assert.equal(row.sliceId,"p07e_q026_r15_g6a_u08_6a08_profile_speed_rate_c1");
  assert.equal(row.previousSliceId,"p07e_q025_r14_g6a_u08_6a08_profile_speed_rate_c1");
  assert.equal(row.primarySourceNodeId,"g6a_u08_6a08");
  assert.equal(row.primaryRuntimeProfileId,"profile_speed_rate");
  assert.equal(row.intraWavePrerequisiteRank,15);
  assert.equal(row.knowledgePointIds.length,row.knowledgePointCount);
  assert.ok(row.knowledgePointCount>=1);
  assert.ok(row.requiredW7CapabilityIds.includes("cap_speed_rate_reasoning"));
});
