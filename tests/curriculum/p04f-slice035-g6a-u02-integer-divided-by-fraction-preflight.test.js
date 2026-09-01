import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { G6A_U02_P04F33_FUTURE_KP_IDS } from "../../site/modules/curriculum/registry/g6a-u02-fraction-divided-by-integer-selector-projection-p04f33.js";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const authority = read("data/curriculum/full-product/p04f/slice035-g6a-u02-integer-divided-by-fraction-preflight-authority.json");
const queue = read("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const r02 = read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const q033Authority = read("data/curriculum/full-product/p04f/slice033-g6a-u02-fraction-divided-by-integer-preflight-authority.json");

const TARGET_KP = "kp_g6a_u02_integer_divided_by_fraction";
const TARGET_SLICE = "p04e_q035_r9_g6a_u02_6a02_profile_fraction_c1";
const FUTURE_G6A_U02_KPS = [
  "kp_g6a_u02_fraction_divided_by_fraction",
  "kp_g6a_u02_fraction_division_application",
];
const r02Source = r02.sourceRecords.find((row) => row.sourceNodeId === "g6a_u02_6a02");
const r02Target = r02Source.candidates.find((row) => row.knowledgePointId === TARGET_KP);
const mapping = authority.formalMappings[0];

test("q035 frozen queue identity and single-KP membership are exact", () => {
  assert.equal(queue.orderedSliceIds[34], TARGET_SLICE);
  assert.equal(authority.queue.queuePosition, 35);
  assert.equal(authority.queue.sliceId, TARGET_SLICE);
  assert.deepEqual(authority.queue.knowledgePointIds, [TARGET_KP]);
  assert.equal(queue.orderedKnowledgePointIds[48], TARGET_KP);
  assert.equal(authority.queue.primarySourceNodeId, "g6a_u02_6a02");
  assert.equal(authority.queue.intraWavePrerequisiteRank, 9);
  assert.equal(authority.queue.primaryRuntimeProfileId, "profile_fraction");
  assert.equal(authority.queue.previousSliceId, "p04e_q034_r9_g5a_u06_5a06_profile_quantity_measurement_c1");
  assert.equal(authority.queue.nextSliceId, "p04e_q036_r10_g6a_u02_6a02_profile_fraction_c1");
  assert.deepEqual(queue.orderedKnowledgePointIds.slice(49, 51), FUTURE_G6A_U02_KPS);
});

test("q035 reuses accepted 6a02 source identity while locking exact R02 semantics", () => {
  assert.equal(authority.sourceAuthority.sourceFile, "meow911_6a02_source.pdf");
  assert.equal(authority.sourceAuthority.driveFileId, "1izlK6HrAU4m76SvYmH_ZUy-yvrqc9idM");
  assert.equal(authority.sourceAuthority.sourceTitle, "分數除法");
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(authority.sourceAuthority.visualVerificationStatus, "REUSED_ACCEPTED_Q033_SOURCE_READBACK");
  assert.equal(authority.sourceAuthority.r02AuthorityPath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
  assert.equal(authority.sourceAuthority.driveFileId, q033Authority.sourceAuthority.driveFileId);
  assert.deepEqual(authority.sourceAuthority.reviewedPages, q033Authority.sourceAuthority.reviewedPages);

  assert.ok(r02Source);
  assert.equal(r02Source.sourceTitle, "分數除法");
  assert.ok(r02Target);
  assert.equal(r02Target.canonicalNameZh, "整數除以分數");
  assert.equal(r02Target.capabilityStatement, "學生能計算整數除以分數。");
  assert.equal(r02Target.reasoningInvariant, "除以分數等於乘分數的倒數。");
  assert.deepEqual(r02Target.evidencePages, [1, 2]);
  assert.equal(r02Target.applicationSuitability, "APPLICATION_COMPATIBLE");

  assert.equal(authority.knowledgePoints[0].knowledgePointId, TARGET_KP);
  assert.equal(authority.knowledgePoints[0].capabilityStatement, r02Target.capabilityStatement);
  assert.equal(authority.knowledgePoints[0].reasoningInvariant, r02Target.reasoningInvariant);
});

test("q035 FormalMapping is a new operand-role relation with q033 reciprocal invariant reuse only", () => {
  assert.equal(mapping.knowledgePointId, TARGET_KP);
  assert.equal(mapping.classification, "NEW_RELATION_CANDIDATE");
  assert.equal(mapping.relationFamilyId, "INTEGER_DIVIDED_BY_FRACTION_QUOTIENT");
  assert.deepEqual(mapping.knownRoleIds, ["DIVIDEND_INTEGER", "DIVISOR_FRACTION"]);
  assert.equal(mapping.targetRoleId, "QUOTIENT_FRACTION");
  assert.equal(mapping.invariants.fractionDivisorMustBeNonzero, true);
  assert.equal(mapping.invariants.divisionByFractionEqualsMultiplyByReciprocal, true);
  assert.equal(mapping.invariants.quotientTimesDivisorReconstructsDividend, true);
  assert.equal(mapping.invariants.exactRationalArithmeticRequired, true);
  assert.equal(mapping.invariants.equivalentFractionReductionAllowed, true);
  assert.equal(mapping.invariants.roundingAllowed, false);
  assert.equal(mapping.supportingCapability, "RECIPROCAL_OF_NONZERO_FRACTION");

  const q033Mapping = q033Authority.formalMappings[0];
  assert.equal(q033Mapping.relationFamilyId, "FRACTION_DIVIDED_BY_INTEGER_QUOTIENT");
  assert.notDeepEqual(mapping.knownRoleIds, q033Mapping.knownRoleIds);
  assert.equal(authority.reconciliation.activeExactRelationReuseCount, 0);
  assert.equal(authority.reconciliation.newRelationCandidateCount, 1);
  assert.equal(authority.reconciliation.q033ExactRelationReused, false);
  assert.equal(authority.reconciliation.q033ReciprocalTransformInvariantReused, true);
  assert.equal(authority.reconciliation.reciprocalConceptPromotedAsNewKnowledgePoint, false);
});

test("q035 proposes one numeric PatternSpec surface without consuming q037 application scope", () => {
  assert.equal(authority.patternSurfacePlan.questionMode, "numeric");
  assert.deepEqual(authority.patternSurfacePlan.implementationCandidatePatternSpecIds, [
    "ps_g6a_u02_integer_divided_by_fraction_quotient_numeric",
  ]);
  assert.equal(authority.patternSurfacePlan.applicationPatternSpecPromoted, false);
  assert.equal(authority.patternSurfacePlan.q037ApplicationBoundaryPreserved, true);
});

test("q035 remains frozen in the current selector while q036-q037 boundaries stay untouched", () => {
  assert.ok(G6A_U02_P04F33_FUTURE_KP_IDS.includes(TARGET_KP));
  assert.ok(G6A_U02_P04F33_FUTURE_KP_IDS.includes("kp_g6a_u02_fraction_divided_by_fraction"));
  assert.ok(G6A_U02_P04F33_FUTURE_KP_IDS.includes("kp_g6a_u02_fraction_division_application"));
  assert.deepEqual(authority.reconciliation.futureG6AU02KnowledgePointIds, FUTURE_G6A_U02_KPS);
  assert.equal(authority.reconciliation.q034Touched, false);
  assert.equal(authority.reconciliation.q036Touched, false);
  assert.equal(authority.reconciliation.q037Touched, false);
});

test("q035 remains planning-only with no implementation surface", () => {
  const boundary = authority.boundary;
  assert.equal(boundary.planningOnly, true);
  assert.equal(boundary.patternSpecMaterialized, false);
  assert.equal(boundary.generatorMaterialized, false);
  assert.equal(boundary.validatorMaterialized, false);
  assert.equal(boundary.selectorPromoted, false);
  assert.equal(boundary.worksheetEnabled, false);
  assert.equal(boundary.q034Touched, false);
  assert.equal(boundary.q036Touched, false);
  assert.equal(boundary.q037Touched, false);
  assert.equal(boundary.implementationApprovalRequired, true);
});
