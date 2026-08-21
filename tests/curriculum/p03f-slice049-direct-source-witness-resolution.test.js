import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readJson = (path) => JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8"));

const resolution = readJson("data/curriculum/full-product/p03f/slice049-g5b-u04-direct-source-witness-resolution.json");
const queuePolicy = readJson("data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue-policy.json");
const q031 = readJson("data/curriculum/full-product/p03f/slice031-g5b-u04-rank8-decimal-multiplication-authority.json");
const q039 = readJson("data/curriculum/full-product/p03f/slice039-g5b-u04-rank9-integer-times-decimal-authority.json");
const q045 = readJson("data/curriculum/full-product/p03f/slice045-g5b-u04-rank10-decimal-times-decimal-authority.json");

const frozenIds = [
  "kp_g5b_u04_decimal_multiplication_application",
  "kp_g5b_u04_decimal_multiplication_estimation",
];

const delivered = [
  [31, "kp_g5b_u04_decimal_times_integer", q031],
  [39, "kp_g5b_u04_integer_times_decimal", q039],
  [45, "kp_g5b_u04_decimal_times_decimal", q045],
];

test("P03F49 direct-source resolution keeps frozen q049 fail-closed pending explicit allocation reconciliation", () => {
  assert.equal(resolution.status, "PASS_SOURCE_WITNESS_RESOLVED_QUEUE_RECONCILIATION_REQUIRED");
  assert.equal(resolution.queueAuthority.queuePosition, 49);
  assert.equal(resolution.queueAuthority.frozenSliceId, "p03e_q049_r11_g5b_u04_5b04_profile_decimal_c1");
  assert.deepEqual(resolution.queueAuthority.frozenKnowledgePointIds, frozenIds);
  assert.equal(resolution.queueAuthority.silentReorderAllowed, false);
  assert.equal(resolution.queueAuthority.queueChangeRequiresExplicitReconciliationTask, true);
  assert.equal(resolution.queueAuthority.queueMutationPerformedByThisTask, false);
  assert.equal(queuePolicy.sliceRules.silentReorderAllowed, false);
  assert.equal(queuePolicy.sliceRules.queueChangeRequiresExplicitReconciliationTask, true);
  assert.equal(resolution.resolution.implementationBranchMayStart, false);
  assert.equal(resolution.resolution.nextTask, "P03F49_Q049QueueAllocationReconciliation");
});

test("P03F49 source taxonomy has exactly one undelivered direct-source topic after q031 q039 q045", () => {
  assert.deepEqual(resolution.sourceAuthority.primarySourceTopicTaxonomy, [
    "三位小數×整數",
    "整數×小數",
    "小數×小數",
    "小數的乘積關係",
  ]);
  assert.deepEqual(resolution.deliveredSourceTopicLineage.map(({ queuePosition, knowledgePointId }) => [queuePosition, knowledgePointId]), delivered.map(([queuePosition, knowledgePointId]) => [queuePosition, knowledgePointId]));
  for (const [queuePosition, knowledgePointId, authority] of delivered) {
    assert.equal(authority.queueAuthority.queuePosition, queuePosition);
    const ids = authority.knowledgePointIds ?? authority.knowledgePoints.map((kp) => kp.knowledgePointId);
    assert.deepEqual(ids, [knowledgePointId]);
  }
  assert.equal(resolution.remainingSourceBackedConcept.canonicalSourceTopicZh, "小數的乘積關係");
  assert.equal(resolution.remainingSourceBackedConcept.directSourceWitnessFound, true);
  assert.equal(resolution.remainingSourceBackedConcept.page, 1);
  assert.equal(resolution.remainingSourceBackedConcept.knowledgePointIdentityStatus, "UNRESOLVED_PENDING_EXPLICIT_QUEUE_ALLOCATION_RECONCILIATION");
});

test("P03F49 does not promote unsupported R02 application or estimation candidates", () => {
  assert.deepEqual(resolution.frozenCandidateReview.map((row) => row.knowledgePointId), frozenIds);
  for (const row of resolution.frozenCandidateReview) {
    assert.equal(row.directSourceWitnessFound, false);
    assert.equal(row.primarySourceTaxonomyMatch, false);
    assert.equal(row.q049DeliveryStatus, "UNSUPPORTED_BY_CURRENT_PRIMARY_SOURCE");
  }
  assert.equal(resolution.r02CandidateAuthorityBoundary.applicationCandidateMayNotBePromotedByQ049, true);
  assert.equal(resolution.r02CandidateAuthorityBoundary.estimationCandidateMayNotBePromotedByQ049, true);
  assert.equal(resolution.r02CandidateAuthorityBoundary.globalR02MutationPerformedByThisTask, false);
  assert.equal(resolution.r02CandidateAuthorityBoundary.globalR03MutationPerformedByThisTask, false);
  assert.equal(resolution.r02CandidateAuthorityBoundary.globalR04MutationPerformedByThisTask, false);
  assert.equal(resolution.remainingSourceBackedConcept.newKnowledgePointIdCreatedByThisTask, false);
  assert.equal(resolution.remainingSourceBackedConcept.formalMappingCreatedByThisTask, false);
  assert.equal(resolution.remainingSourceBackedConcept.patternSpecCreatedByThisTask, false);
});
