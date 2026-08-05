import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice022-e6-d0-v1.json", import.meta.url), "utf8"));
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice023-reciprocal-concept-authority.json", import.meta.url), "utf8"));
test("P03F23 frozen queue position 23 is exact G6A-U02 reciprocal cohort", () => {
  const slice = materializeP03EW3DirectProductVerticalSliceQueue().queueEntries[22];
  assert.equal(slice.queuePosition, 23);
  assert.equal(slice.sliceId, "p03e_q023_r7_g6a_u02_6a02_profile_fraction_c1");
  assert.equal(slice.previousSliceId, "p03e_q022_r7_g5a_u04_5a04_profile_fraction_c1");
  assert.equal(slice.primarySourceNodeId, "g6a_u02_6a02");
  assert.deepEqual(slice.knowledgePointIds, ["kp_g6a_u02_reciprocal_concept"]);
  assert.deepEqual(slice.requiredW3CapabilityIds, ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"]);
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
});
test("P03F23 source evidence and application boundary are explicit", () => {
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(authority.knowledgePoints[0].applicationClassification, "APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED");
  assert.equal(authority.patternSurface.applicationPatternSpecCount, 0);
  assert.equal(authority.productBoundary.globalContextOntologyExpansionAllowed, false);
});
test("P03F23 reuses Node Test for Chromium acceptance and artifact upload", () => {
  const workflow = readFileSync(new URL("../../.github/workflows/node-test.yml", import.meta.url), "utf8");
  assert.match(workflow, /Run P03F slice023 Chromium product acceptance/);
  assert.match(workflow, /node tools\/curriculum\/render-p03f-slice023-product-acceptance\.mjs/);
  assert.match(workflow, /name: p03f-slice023-product-acceptance/);
  assert.match(workflow, /path: tmp\/p03f-slice023-product-acceptance/);
});
