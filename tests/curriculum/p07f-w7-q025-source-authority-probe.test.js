import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const q024=JSON.parse(readFileSync(new URL("../../docs/ci/latest-p07f-w7-q024-pages-e2e.json",import.meta.url),"utf8"));

test("Q025 probe resolves exact frozen successor after Q024 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[24];
  assert.equal(q024.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q024.exactHeadSha,"23654f2af6f638a52ea0ed0b3a934e0f874e9194");
  assert.equal(row.queuePosition,25);
  assert.equal(row.sliceId,"p07e_q025_r14_g6a_u08_6a08_profile_speed_rate_c1");
  assert.equal(row.previousSliceId,"p07e_q024_r13_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.equal(row.primarySourceNodeId,"g6a_u08_6a08");
  assert.equal(row.primaryRuntimeProfileId,"profile_speed_rate");
  assert.equal(row.intraWavePrerequisiteRank,14);
  assert.ok(row.knowledgePointCount>=1);
  assert.equal(row.knowledgePointIds.length,row.knowledgePointCount);
  assert.ok(row.requiredW7CapabilityIds.includes("cap_speed_rate_reasoning"));
});
