import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));

const resolution = readJson("../../data/curriculum/full-product/p03f/slice052-g6a-u04-direct-source-witness-resolution.json");
const queue = readJson("../../data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json");
const q051Claim = readJson("../../data/curriculum/final-milestone-claims/p03f-w3-slice051-e6-d0-v1.json");
const r02 = readJson("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");

const Q052_ID = "p03e_q052_r12_g6a_u04_6a04_profile_decimal_c1";
const Q053_ID = "p03e_q053_r13_g6a_u04_6a04_profile_decimal_c1";
const Q052_KPS = [
  "kp_g6a_u04_decimal_division_decimal_shift",
  "kp_g6a_u04_decimal_division_quotient_precision",
  "kp_g6a_u04_decimal_division_rate_application",
];
const Q053_KP = "kp_g6a_u04_decimal_division_rounding";
const SOURCE_SHA = "1e1790a2fe9a91e4d819d0c9ff93d3065dde536887d93c5e20323f7011df8f50";

test("P03F52 source-witness resolution binds exact frozen q052 after q051 D0", () => {
  assert.equal(q051Claim.status, "PASS_D0_CLOSED");
  assert.equal(q051Claim.goalDistance, "D0");
  assert.equal(resolution.queueAuthority.queuePosition, 52);
  assert.equal(resolution.queueAuthority.frozenSliceId, Q052_ID);
  assert.deepEqual(resolution.queueAuthority.frozenKnowledgePointIds, Q052_KPS);
  assert.deepEqual(resolution.queueAuthority.reservedNextSliceKnowledgePointIds, [Q053_KP]);
  assert.equal(queue.orderedSliceIds[51], Q052_ID);
  assert.equal(queue.orderedSliceIds[52], Q053_ID);
  assert.equal(resolution.queueAuthority.queueMutationPerformedByThisTask, false);
});

test("P03F52 source lineage uses reconciled canonical G6A-U04 binary", () => {
  const source = resolution.sourceAuthority;
  assert.equal(source.sourceNodeId, "g6a_u04_6a04");
  assert.equal(source.sourceDriveFileId, "1jFp8TvNtrECiCMuYCENyPeZNbb3fQNM1");
  assert.equal(source.sourceSha256, SOURCE_SHA);
  assert.equal(source.sourceByteLength, 482611);
  assert.equal(source.sourceRevisionCount, 1);
  assert.equal(source.publicMirrorDriveFileId, "17lSzcLixlux4hVNJNwPqARGaoE-3gZyR");
  assert.equal(source.publicMirrorSha256, SOURCE_SHA);
  assert.equal(source.binaryIdentityStatus, "PASS_CANONICAL_AND_PUBLIC_MIRROR_BYTE_IDENTICAL");
  assert.equal(q051Claim.sourceEvidence.sourceSha256, SOURCE_SHA);
  assert.equal(q051Claim.sourceEvidence.binaryIdentityStatus, "PASS_CANONICAL_AND_PUBLIC_MIRROR_BYTE_IDENTICAL");
});

test("P03F52 preserves R02 membership for all three frozen KPs", () => {
  const g6aU04 = r02.sourceRecords.find((row) => row.sourceNodeId === "g6a_u04_6a04");
  assert.ok(g6aU04);
  for (const kp of Q052_KPS) {
    const candidate = g6aU04.candidates.find((row) => row.knowledgePointId === kp);
    assert.ok(candidate, `missing R02 candidate ${kp}`);
    assert.deepEqual(candidate.evidencePages, [1, 2]);
  }
});

test("P03F52 direct witnesses and extension gaps are stated without textbook overclaim", () => {
  const byKp = Object.fromEntries(resolution.frozenCandidateReview.map((row) => [row.knowledgePointId, row]));

  assert.equal(byKp[Q052_KPS[0]].directSourceWitnessFound, true);
  assert.equal(byKp[Q052_KPS[0]].extensionRequired, false);
  assert.equal(byKp[Q052_KPS[0]].q052DeliveryStatus, "DIRECT_SOURCE_PROCEDURAL_WITNESS_SUPPORTED");

  assert.equal(byKp[Q052_KPS[1]].directPrecisionWitnessFound, true);
  assert.equal(byKp[Q052_KPS[1]].directZeroFillWitnessFound, false);
  assert.equal(byKp[Q052_KPS[1]].extensionRequired, true);
  assert.equal(byKp[Q052_KPS[1]].q052DeliveryStatus, "DIRECT_PRECISION_WITNESS_PLUS_OPERATOR_APPROVED_ZERO_FILL_EXTENSION");
  assert.equal(byKp[Q052_KPS[1]].generatedExampleClaimedAsTextbook, false);

  assert.equal(byKp[Q052_KPS[2]].directSourceWitnessFound, false);
  assert.equal(byKp[Q052_KPS[2]].extensionRequired, true);
  assert.equal(byKp[Q052_KPS[2]].q052DeliveryStatus, "OPERATOR_APPROVED_CURRICULUM_EXTENSION");
  assert.equal(byKp[Q052_KPS[2]].generatedExampleClaimedAsTextbook, false);

  assert.equal(resolution.extensionGuardrails.operatorApprovedExtensionLabelRequired, true);
  assert.equal(resolution.extensionGuardrails.textbookLiteralClaimAllowed, false);
  assert.equal(resolution.extensionGuardrails.generatedExampleMustNotBeAttributedToTextbook, true);
});

test("P03F52 resolution releases implementation but does not consume q053 rounding", () => {
  assert.equal(resolution.status, "PASS_SOURCE_WITNESS_RESOLVED_WITH_OPERATOR_APPROVED_EXTENSIONS");
  assert.equal(resolution.resolution.sourceWitnessGapResolved, true);
  assert.equal(resolution.resolution.quotientPrecisionZeroFillOperatorApprovedExtension, true);
  assert.equal(resolution.resolution.rateApplicationOperatorApprovedExtension, true);
  assert.equal(resolution.resolution.queueMutationRequired, false);
  assert.equal(resolution.resolution.implementationBranchMayProceed, true);
  assert.equal(resolution.extensionGuardrails.q053RoundingMayBeConsumed, false);
  assert.equal(resolution.resolution.nextTask, "P03F_W3DirectProductVerticalSlice052Implementation");
});
