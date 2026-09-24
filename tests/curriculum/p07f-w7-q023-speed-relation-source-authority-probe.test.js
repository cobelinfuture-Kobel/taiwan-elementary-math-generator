import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const q022=JSON.parse(readFileSync(new URL("../../docs/ci/latest-p07f-w7-q022-pages-e2e.json",import.meta.url),"utf8"));
test("Q023 exact frozen successor is speed-distance-time relation after Q022 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[22];
  assert.equal(q022.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q022.exactHeadSha,"db1b1ab9f11bb160dcc6f07981946a8385921d6b");
  assert.equal(row.queuePosition,23);
  assert.equal(row.sliceId,"p07e_q023_r13_g6a_u08_6a08_profile_speed_rate_c1");
  assert.equal(row.previousSliceId,"p07e_q022_r12_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.equal(row.primarySourceNodeId,"g6a_u08_6a08");
  assert.deepEqual([...row.supportingSourceNodeIds],["g6a_u08_6a08","g6b_u02_6b02"]);
  assert.equal(row.primaryRuntimeProfileId,"profile_speed_rate");
  assert.equal(row.intraWavePrerequisiteRank,13);
  assert.deepEqual([...row.knowledgePointIds],["kp_speed_distance_time_relation"]);
  assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_speed_rate_reasoning"]);
});
