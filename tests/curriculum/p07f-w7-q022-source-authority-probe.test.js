import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const q021=JSON.parse(readFileSync(new URL("../../docs/ci/latest-p07f-w7-q021-pages-e2e.json",import.meta.url),"utf8"));
const candidates=new Set([
  "kp_g6b_u04_find_base_quantity",
  "kp_g6b_u04_find_comparison_quantity",
  "kp_g6b_u04_find_rate_from_quantities",
  "kp_g6b_u04_successive_rate_change"
]);
test("Q022 probe resolves exact frozen successor envelope after Q021 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[21];
  assert.equal(q021.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q021.exactHeadSha,"b5c106342e20cfcdcffe5f315499289cc569e63d");
  assert.equal(row.queuePosition,22);
  assert.equal(row.sliceId,"p07e_q022_r12_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.equal(row.previousSliceId,"p07e_q021_r11_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.equal(row.primarySourceNodeId,"g6b_u04_6b04");
  assert.equal(row.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(row.intraWavePrerequisiteRank,12);
  assert.equal(row.knowledgePointIds.length,1);
  assert.equal(candidates.has(row.knowledgePointIds[0]),true,row.knowledgePointIds[0]);
  assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
});
