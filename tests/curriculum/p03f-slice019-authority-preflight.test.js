import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeW02AtomicContextSingleApplicationCandidatePack } from "../../src/curriculum/application/w02-atomic-context-single-application-candidate-pack.mjs";

const expectedKpIds = [
  "kp_g4b_u06_rate_distance_context",
  "kp_g4b_u06_two_decimal_times_integer",
];
const expectedApplicationPatternSpecIds = [
  "ps_g4b_u06_rate_distance_context_combined_application",
  "ps_g4b_u06_rate_distance_context_total_application",
  "ps_g4b_u06_two_decimal_times_integer_product_application",
];

const slice018Claim = JSON.parse(readFileSync(
  new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice018-e6-d0-v1.json", import.meta.url),
  "utf8",
));

test("P03F19 frozen queue position 19 is exact G4B-U06 rank-7 decimal cohort", () => {
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[18];
  assert.equal(slice.queuePosition, 19);
  assert.equal(slice.sliceId, "p03e_q019_r7_g4b_u06_4b06_profile_decimal_c1");
  assert.equal(slice.previousSliceId, "p03e_q018_r7_g4a_u09_4a09_profile_decimal_c1");
  assert.equal(slice.primarySourceNodeId, "g4b_u06_4b06");
  assert.equal(slice.intraWavePrerequisiteRank, 7);
  assert.equal(slice.primaryRuntimeProfileId, "profile_decimal");
  assert.deepEqual([...slice.knowledgePointIds].sort(), [...expectedKpIds].sort());
  assert.equal(slice.knowledgePointCount, 2);
  assert.equal(slice018Claim.status, "PASS_D0_CLOSED");
  assert.equal(slice018Claim.goalDistance, "D0");
  console.log(`P03F19_QUEUE=${JSON.stringify({
    queuePosition: slice.queuePosition,
    sliceId: slice.sliceId,
    previousSliceId: slice.previousSliceId,
    knowledgePointIds: slice.knowledgePointIds,
    requiredW3CapabilityIds: slice.requiredW3CapabilityIds,
    supportingSourceNodeIds: slice.supportingSourceNodeIds,
  })}`);
});

test("P03F19 consumes exactly the existing W02 A02 application context candidates", () => {
  const pack = materializeW02AtomicContextSingleApplicationCandidatePack();
  const rows = pack.candidates
    .filter((row) => row.sourceId === "g4b_u06_4b06" && expectedKpIds.includes(row.knowledgePointId))
    .sort((a, b) => a.patternSpecId.localeCompare(b.patternSpecId));
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((row) => row.patternSpecId), expectedApplicationPatternSpecIds);
  assert.ok(rows.every((row) => row.productionAdmissionAllowed === false));
  assert.ok(rows.every((row) => row.contextSelection?.atomicEpisodeId));
  assert.ok(rows.every((row) => row.contextSelection?.surfaceTemplateId));
  console.log(`P03F19_CONTEXTS=${JSON.stringify(rows.map((row) => ({
    bindingCandidateId: row.bindingCandidateId,
    itemCandidateId: row.itemCandidateId,
    knowledgePointId: row.knowledgePointId,
    patternSpecId: row.patternSpecId,
    requestedUnknownRole: row.requestedUnknownRole,
    macroContextId: row.contextSelection.macroContextId,
    mesoSituationId: row.contextSelection.mesoSituationId,
    microScenarioId: row.contextSelection.microScenarioId,
    atomicEpisodeId: row.contextSelection.atomicEpisodeId,
    surfaceTemplateId: row.contextSelection.surfaceTemplateId,
    roleBindingCandidates: row.roleBindingCandidates,
    targetRoleCandidate: row.targetRoleCandidate,
  })))}`);
});
