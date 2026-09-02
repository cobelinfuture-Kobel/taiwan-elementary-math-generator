import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const authority = read("data/curriculum/full-product/p04f/slice036-g6a-u02-fraction-divided-by-fraction-preflight-authority.json");
const q033Authority = read("data/curriculum/full-product/p04f/slice033-g6a-u02-fraction-divided-by-integer-preflight-authority.json");
const q035Preflight = read("data/curriculum/full-product/p04f/slice035-g6a-u02-integer-divided-by-fraction-preflight-authority.json");
const q035Authority = read("data/curriculum/full-product/p04f/slice035-g6a-u02-integer-divided-by-fraction-authority.json");
const queue = read("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const r02 = read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");

const TARGET_KP = "kp_g6a_u02_fraction_divided_by_fraction";
const FUTURE_G6A_U02_KPS = ["kp_g6a_u02_fraction_division_application"];
const r02Source = r02.sourceRecords.find((row) => row.sourceNodeId === "g6a_u02_6a02");
const r02Target = r02Source.candidates.find((row) => row.knowledgePointId === TARGET_KP);
const mapping = authority.formalMappings[0];

test("q036 frozen queue identity and single-KP membership are exact", () => {
  assert.equal(queue.orderedSliceIds[35], authority.queue.sliceId);
  assert.deepEqual(authority.queue.knowledgePointIds, [TARGET_KP]);
  assert.equal(queue.orderedKnowledgePointIds[49], TARGET_KP);
  assert.equal(authority.queue.intraWavePrerequisiteRank, 10);
  assert.equal(authority.queue.primaryRuntimeProfileId, "profile_fraction");
  assert.equal(authority.queue.previousSliceId, "p04e_q035_r9_g6a_u02_6a02_profile_fraction_c1");
  assert.equal(authority.queue.nextSliceId, "p04e_q037_r11_g6a_u02_6a02_profile_fraction_c1");
  assert.deepEqual(queue.orderedKnowledgePointIds.slice(50, 51), FUTURE_G6A_U02_KPS);
});

test("q036 reuses reviewed G6A-U02 source authority without inventing source evidence", () => {
  assert.equal(authority.sourceAuthority.sourceFile, "meow911_6a02_source.pdf");
  assert.equal(authority.sourceAuthority.driveFileId, "1izlK6HrAU4m76SvYmH_ZUy-yvrqc9idM");
  assert.equal(authority.sourceAuthority.sourceTitle, "分數除法");
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(authority.sourceAuthority.visualVerificationStatus, "REUSED_FROM_P04F33_FULL_PAGE_VISUAL_READBACK");
  assert.equal(q033Authority.sourceAuthority.driveFileId, authority.sourceAuthority.driveFileId);
  assert.deepEqual(q033Authority.sourceAuthority.reviewedPages, authority.sourceAuthority.reviewedPages);
  assert.equal(q035Preflight.sourceAuthority.driveFileId, authority.sourceAuthority.driveFileId);
  assert.equal(q035Authority.source.driveFileId, authority.sourceAuthority.driveFileId);

  assert.ok(r02Source);
  assert.ok(r02Target);
  assert.equal(r02Target.canonicalNameZh, "分數除以分數");
  assert.equal(r02Target.capabilityStatement, "學生能以乘倒數完成分數除法。");
  assert.equal(r02Target.reasoningInvariant, "商乘除數必須重建被除數。");
  assert.deepEqual(r02Target.evidencePages, [1, 2]);
  assert.equal(authority.knowledgePoints[0].capabilityStatement, r02Target.capabilityStatement);
  assert.equal(authority.knowledgePoints[0].reasoningInvariant, r02Target.reasoningInvariant);
});

test("q036 FormalMapping is a distinct fraction-dividend fraction-divisor relation", () => {
  assert.equal(mapping.knowledgePointId, TARGET_KP);
  assert.equal(mapping.classification, "NEW_RELATION_CANDIDATE");
  assert.equal(mapping.relationFamilyId, "FRACTION_DIVIDED_BY_FRACTION_QUOTIENT");
  assert.deepEqual(mapping.knownRoleIds, ["DIVIDEND_FRACTION", "DIVISOR_FRACTION"]);
  assert.equal(mapping.targetRoleId, "QUOTIENT_FRACTION");
  assert.equal(mapping.invariants.divisorFractionMustBeNonzero, true);
  assert.equal(mapping.invariants.divisionByFractionEqualsMultiplyByReciprocal, true);
  assert.equal(mapping.invariants.quotientTimesDivisorReconstructsDividend, true);
  assert.equal(mapping.invariants.exactRationalArithmeticRequired, true);
  assert.equal(mapping.invariants.equivalentFractionReductionAllowed, true);
  assert.equal(mapping.invariants.roundingAllowed, false);
  assert.equal(mapping.supportingCapability, "RECIPROCAL_OF_NONZERO_FRACTION");
});

test("q036 shares bounded primitives but does not reuse q033 or q035 relation identity", () => {
  assert.equal(authority.reconciliation.activeRelationReuseCount, 0);
  assert.equal(authority.reconciliation.newRelationCandidateCount, 1);
  assert.equal(authority.reconciliation.q033FractionDividedByIntegerRelationReused, false);
  assert.equal(authority.reconciliation.q035IntegerDividedByFractionRelationReused, false);
  assert.equal(authority.reconciliation.reciprocalTransformContractReuseCandidate, true);
  assert.equal(authority.reconciliation.exactRationalPrimitiveReuseCandidate, true);
  assert.equal(authority.reconciliation.recommendedImplementationScope, "SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(authority.reconciliation.predecessorG6AU02KnowledgePointIds, [
    "kp_g6a_u02_reciprocal_concept",
    "kp_g6a_u02_fraction_divided_by_integer",
    "kp_g6a_u02_integer_divided_by_fraction",
  ]);
  assert.deepEqual(authority.reconciliation.futureG6AU02KnowledgePointIds, FUTURE_G6A_U02_KPS);
  assert.equal(authority.reconciliation.q033Touched, false);
  assert.equal(authority.reconciliation.q035Touched, false);
  assert.equal(authority.reconciliation.q037Touched, false);
});

test("q036 remains planning-only and requires separate implementation approval", () => {
  const boundary = authority.boundary;
  assert.equal(boundary.planningOnly, true);
  assert.equal(boundary.patternSpecMaterialized, false);
  assert.equal(boundary.generatorMaterialized, false);
  assert.equal(boundary.validatorMaterialized, false);
  assert.equal(boundary.selectorPromoted, false);
  assert.equal(boundary.worksheetEnabled, false);
  assert.equal(boundary.q033RuntimeTouched, false);
  assert.equal(boundary.q035RuntimeTouched, false);
  assert.equal(boundary.q037Touched, false);
  assert.equal(boundary.implementationApprovalRequired, true);
});
