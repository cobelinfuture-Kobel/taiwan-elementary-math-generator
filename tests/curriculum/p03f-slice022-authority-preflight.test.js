import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeW02AtomicContextSingleApplicationCandidatePack } from "../../src/curriculum/application/w02-atomic-context-single-application-candidate-pack.mjs";

const KPS = ["kp_g5a_u04_common_denominator", "kp_g5a_u04_divisibility_supported_reduction"];
const CAPS = ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"];
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice021-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F22 frozen queue position 22 is exact G5A-U04 rank-7 fraction cohort", () => {
  const slice = materializeP03EW3DirectProductVerticalSliceQueue().queueEntries[21];
  assert.equal(slice.queuePosition, 22);
  assert.equal(slice.sliceId, "p03e_q022_r7_g5a_u04_5a04_profile_fraction_c1");
  assert.equal(slice.previousSliceId, "p03e_q021_r7_g5a_u01_5a01_profile_decimal_c1");
  assert.equal(slice.primarySourceNodeId, "g5a_u04_5a04");
  assert.deepEqual(slice.knowledgePointIds, KPS);
  assert.deepEqual(slice.requiredW3CapabilityIds, CAPS);
  assert.equal(claim.status, "PASS_D0_CLOSED");
});

test("P03F22 two numeric KPs have no W02 application candidate", () => {
  const rows = materializeW02AtomicContextSingleApplicationCandidatePack().candidates
    .filter((row) => row.sourceId === "g5a_u04_5a04" && KPS.includes(row.knowledgePointId));
  assert.deepEqual(rows, []);
});

test("P03F22 reuses Node Test for Chromium acceptance and artifact upload", () => {
  const workflow = readFileSync(new URL("../../.github/workflows/node-test.yml", import.meta.url), "utf8");
  assert.match(workflow, /Run P03F slice022 Chromium product acceptance/);
  assert.match(workflow, /node tools\/curriculum\/render-p03f-slice022-product-acceptance\.mjs/);
  assert.match(workflow, /name: p03f-slice022-product-acceptance/);
  assert.match(workflow, /path: tmp\/p03f-slice022-product-acceptance/);
});
