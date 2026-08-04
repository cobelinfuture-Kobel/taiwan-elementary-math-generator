import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeW02AtomicContextSingleApplicationCandidatePack } from "../../src/curriculum/application/w02-atomic-context-single-application-candidate-pack.mjs";

const KP = "kp_g4b_u08_fraction_decimal_conversion";
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice019-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F20 frozen queue position 20 is exact G4B-U08 rank-7 fraction cohort", () => {
  const slice = materializeP03EW3DirectProductVerticalSliceQueue().queueEntries[19];
  assert.equal(slice.queuePosition, 20);
  assert.equal(slice.sliceId, "p03e_q020_r7_g4b_u08_4b08_profile_fraction_c1");
  assert.equal(slice.previousSliceId, "p03e_q019_r7_g4b_u06_4b06_profile_decimal_c1");
  assert.equal(slice.primarySourceNodeId, "g4b_u08_4b08");
  assert.deepEqual(slice.knowledgePointIds, [KP]);
  assert.deepEqual(slice.requiredW3CapabilityIds, ["cap_fraction_domain_validator", "cap_fraction_number_system"]);
  assert.equal(claim.status, "PASS_D0_CLOSED");
});

test("P03F20 has no W02 context candidate because conversion is application-not-applicable", () => {
  const rows = materializeW02AtomicContextSingleApplicationCandidatePack().candidates
    .filter((row) => row.sourceId === "g4b_u08_4b08" && row.knowledgePointId === KP);
  assert.deepEqual(rows, []);
});
