import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const authority = read("data/curriculum/full-product/p04f/slice035-g6a-u02-integer-divided-by-fraction-preflight-authority.json");
const predecessorAuthority = read("data/curriculum/full-product/p04f/slice033-g6a-u02-fraction-divided-by-integer-preflight-authority.json");
const queue = read("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const r02 = read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");

const TARGET_KP = "kp_g6a_u02_integer_divided_by_fraction";
const FUTURE_G6A_U02_KPS = [
  "kp_g6a_u02_fraction_divided_by_fraction",
  "kp_g6a_u02_fraction_division_application",
];

const r02Source = r02.sourceRecords.find((row) => row.sourceNodeId === "g6a_u02_6a02");
const r02Target = r02Source.candidates.find((row) => row.knowledgePointId === TARGET_KP);
const mapping = authority.formalMappings[0];

test("q035 frozen queue identity and single-KP membership are exact", () => {
  assert.equal(queue.orderedSliceIds[34], authority.queue.sliceId);
  assert.deepEqual(authority.queue.knowledgePointIds, [TARGET_KP]);
  assert.equal(queue.orderedKnowledgePointIds[48], TARGET_KP);
  assert.equal(authority.queue.intraWavePrerequisiteRank, 9);
  assert.equal(authority.queue.primaryRuntimeProfileId, "profile_fraction");
  assert.equal(authority.queue.previousSliceId, "p04e_q034_r9_g5a_u06_5a06_profile_quantity_measurement_c1");
  assert.equal(authority.queue.nextSliceId, "p04e_q036_r10_g6a_u02_6a02_profile_fraction_c1");
  assert.deepEqual(queue.orderedKnowledgePointIds.slice(49, 51), FUTURE_G6A_U02_KPS);
});

test("q035 reuses the reviewed G6A-U02 source authority without inventing new source evidence", () => {
  assert.equal(authority.sourceAuthority.sourceFile, "meow911_6a02_source.pdf");
  assert.equal(authority.sourceAuthority.driveFileId, "1izlK6HrAU4m76SvYmH_ZUy-yvrqc9idM");
  assert.equal(authority.sourceAuthority.sourceTitle, "分數除法");
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(authority.sourceAuthority.visualVerificationStatus, "REUSED_FROM_P04F33_FULL_PAGE_VISUAL_READBACK");
  assert.equal(authority.sourceAuthority.predecessorAuthorityPath, "data/curriculum/full-product/p04f/slice033-g6a-u02-fraction-divided-by-integer-preflight-authority.json");
  assert.equal(predecessorAuthority.sourceAuthority.driveFileId, authority.sourceAuthority.driveFileId);
  assert.deepEqual(predecessorAuthority.sourceAuthority.reviewedPages, authority.sourceAuthority.reviewedPages);

  assert.ok(r02Source);
  assert.equal(r02Source.sourceTitle, "分數除法");
  assert.ok(r02Target);
  assert.equal(r02Target.canonicalNameZh, "整數除以分數");
  assert.equal(r02Target.capabilityStatement, "學生能計算整數除以分數。");
  assert.equal(r02Target.reasoningInvariant, "除以分數等於乘分數的倒數。");
  assert.deepEqual(r02Target.evidencePages, [1, 2]);

  assert.equal(authority.knowledgePoints[0].knowledgePointId, TARGET_KP);
  assert.equal(authority.knowledgePoints[0].capabilityStatement, r02Target.capabilityStatement);
  assert.equal(authority.knowledgePoints[0].reasoningInvariant, r02Target.reasoningInvariant);
});

test("q035 FormalMapping is a distinct integer-dividend fraction-divisor reciprocal relation", () => {
  assert.equal(mapping.knowledgePointId, TARGET_KP);
  assert.equal(mapping.classification, "NEW_RELATION_CANDIDATE");
  assert.equal(mapping.relationFamilyId, "INTEGER_DIVIDED_BY_FRACTION_QUOTIENT");
  assert.deepEqual(mapping.knownRoleIds, ["DIVIDEND_INTEGER", "DIVISOR_FRACTION"]);
  assert.equal(mapping.targetRoleId, "QUOTIENT_FRACTION");
  assert.equal(mapping.invariants.divisorFractionMustBeNonzero, true);
  assert.equal(mapping.invariants.divisionByFractionEqualsMultiplyByReciprocal, true);
  assert.equal(mapping.invariants.quotientTimesDivisorReconstructsDividend, true);
  assert.equal(mapping.invariants.exactRationalArithmeticRequired, true);
  assert.equal(mapping.invariants.equivalentFractionReductionAllowed, true);
  assert.equal(mapping.invariants.roundingAllowed, false);
  assert.equal(mapping.supportingCapability, "RECIPROCAL_OF_NONZERO_FRACTION");

  assert.equal(authority.reconciliation.activeRelationReuseCount, 0);
  assert.equal(authority.reconciliation.newRelationCandidateCount, 1);
  assert.equal(authority.reconciliation.q033FractionDividedByIntegerRelationReused, false);
  assert.equal(authority.reconciliation.q031FractionTimesIntegerRelationReused, false);
  assert.equal(authority.reconciliation.reciprocalTransformContractReuseCandidate, true);
  assert.equal(authority.reconciliation.exactRationalPrimitiveReuseDeferredToImplementation, true);
});

test("q035 preserves predecessor and future G6A-U02 slice boundaries", () => {
  assert.deepEqual(authority.reconciliation.predecessorG6AU02KnowledgePointIds, [
    "kp_g6a_u02_reciprocal_concept",
    "kp_g6a_u02_fraction_divided_by_integer",
  ]);
  assert.deepEqual(authority.reconciliation.futureG6AU02KnowledgePointIds, FUTURE_G6A_U02_KPS);
  assert.equal(authority.reconciliation.q034Touched, false);
  assert.equal(authority.reconciliation.q036Touched, false);
  assert.equal(authority.reconciliation.q037Touched, false);
});

test("q035 remains planning-only with no runtime or public promotion", () => {
  const boundary = authority.boundary;
  assert.equal(boundary.planningOnly, true);
  assert.equal(boundary.patternSpecMaterialized, false);
  assert.equal(boundary.generatorMaterialized, false);
  assert.equal(boundary.validatorMaterialized, false);
  assert.equal(boundary.selectorPromoted, false);
  assert.equal(boundary.worksheetEnabled, false);
  assert.equal(boundary.q033RuntimeTouched, false);
  assert.equal(boundary.q034Touched, false);
  assert.equal(boundary.q036Touched, false);
  assert.equal(boundary.q037Touched, false);
  assert.equal(boundary.implementationApprovalRequired, true);
});
