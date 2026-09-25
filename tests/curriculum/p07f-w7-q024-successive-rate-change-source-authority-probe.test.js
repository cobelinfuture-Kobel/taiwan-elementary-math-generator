import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const q023=JSON.parse(readFileSync(new URL("../../docs/ci/latest-p07f-w7-q023-pages-e2e.json",import.meta.url),"utf8"));
test("Q024 exact frozen successor is successive-rate-change after Q023 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[23];
  assert.equal(q023.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q023.exactHeadSha,"65fbe2def3f6705752f8f8cf20738faaf358849f");
  assert.equal(row.queuePosition,24);
  assert.equal(row.sliceId,"p07e_q024_r13_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.equal(row.previousSliceId,"p07e_q023_r13_g6a_u08_6a08_profile_speed_rate_c1");
  assert.equal(row.primarySourceNodeId,"g6b_u04_6b04");
  assert.deepEqual([...row.supportingSourceNodeIds],["g6b_u04_6b04"]);
  assert.equal(row.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(row.intraWavePrerequisiteRank,13);
  assert.deepEqual([...row.knowledgePointIds],["kp_g6b_u04_successive_rate_change"]);
  assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
});
