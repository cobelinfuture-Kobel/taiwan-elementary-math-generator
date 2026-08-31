import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const authority = read("data/curriculum/full-product/p04f/slice033-g6a-u02-fraction-divided-by-integer-preflight-authority.json");
const queue = read("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const r02 = read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");

const TARGET_KP = "kp_g6a_u02_fraction_divided_by_integer";
const FUTURE_G6A_U02_KPS = [
  "kp_g6a_u02_integer_divided_by_fraction",
  "kp_g6a_u02_fraction_divided_by_fraction",
  "kp_g6a_u02_fraction_division_application",
];

const r02Source = r02.sourceRecords.find((row) => row.sourceNodeId === "g6a_u02_6a02");
const r02Target = r02Source.candidates.find((row) => row.knowledgePointId === TARGET_KP);
const mapping = authority.formalMappings[0];

test("q033 frozen queue identity and single-KP membership are exact", () => {
  assert.equal(queue.orderedSliceIds[32], authority.queue.sliceId);
  assert.deepEqual(authority.queue.knowledgePointIds, [TARGET_KP]);
  assert.equal(queue.orderedKnowledgePointIds[46], TARGET_KP);
  assert.equal(authority.queue.intraWavePrerequisiteRank, 8);
  assert.equal(authority.queue.primaryRuntimeProfileId, "profile_fraction");
  assert.equal(authority.queue.previousSliceId, "p04e_q032_r8_g5b_u02_5b02_profile_fraction_c1");
  assert.equal(authority.queue.nextSliceId, "p04e_q034_r9_g5a_u06_5a06_profile_quantity_measurement_c1");
  assert.deepEqual(queue.orderedKnowledgePointIds.slice(48, 51), FUTURE_G6A_U02_KPS);
});

test("q033 source visual witness and R02 canonical semantics are locked", () => {
  assert.equal(authority.sourceAuthority.sourceFile, "meow911_6a02_source.pdf");
  assert.equal(authority.sourceAuthority.driveFileId, "1izlK6HrAU4m76SvYmH_ZUy-yvrqc9idM");
  assert.equal(authority.sourceAuthority.sourceTitle, "分數除法");
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(authority.sourceAuthority.visualVerificationStatus, "PASS_CURRENT_TASK");
  assert.equal(authority.sourceAuthority.r02AuthorityPath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
  assert.ok(authority.sourceAuthority.sourceGuideWitness.includes("把除法寫成分數型態"));
  assert.ok(authority.sourceAuthority.sourceGuideWitness.includes("÷m 商的變化"));

  assert.ok(r02Source);
  assert.equal(r02Source.sourceTitle, "分數除法");
  assert.ok(r02Target);
  assert.equal(r02Target.canonicalNameZh, "分數除以整數");
  assert.equal(r02Target.capabilityStatement, "學生能將分數除以整數並化簡。");
  assert.equal(r02Target.reasoningInvariant, "除以整數等於乘其倒數。");
  assert.deepEqual(r02Target.evidencePages, [1, 2]);

  assert.equal(authority.knowledgePoints[0].knowledgePointId, TARGET_KP);
  assert.equal(authority.knowledgePoints[0].capabilityStatement, r02Target.capabilityStatement);
  assert.equal(authority.knowledgePoints[0].reasoningInvariant, r02Target.reasoningInvariant);
});

test("q033 FormalMapping is a new reciprocal-transform relation, not a superficial division reuse", () => {
  assert.equal(mapping.knowledgePointId, TARGET_KP);
  assert.equal(mapping.classification, "NEW_RELATION_CANDIDATE");
  assert.equal(mapping.relationFamilyId, "FRACTION_DIVIDED_BY_INTEGER_QUOTIENT");
  assert.deepEqual(mapping.knownRoleIds, ["DIVIDEND_FRACTION", "INTEGER_DIVISOR"]);
  assert.equal(mapping.targetRoleId, "QUOTIENT_FRACTION");
  assert.equal(mapping.invariants.integerDivisorMustBeNonzero, true);
  assert.equal(mapping.invariants.divisionByIntegerEqualsMultiplyByReciprocal, true);
  assert.equal(mapping.invariants.quotientTimesDivisorReconstructsDividend, true);
  assert.equal(mapping.invariants.exactRationalArithmeticRequired, true);
  assert.equal(mapping.invariants.equivalentFractionReductionAllowed, true);
  assert.equal(mapping.invariants.roundingAllowed, false);
  assert.equal(mapping.supportingCapability, "RECIPROCAL_OF_NONZERO_INTEGER");

  assert.equal(authority.reconciliation.activeRelationReuseCount, 0);
  assert.equal(authority.reconciliation.newRelationCandidateCount, 1);
  assert.equal(authority.reconciliation.q025PartitiveTimeDivisionRelationReused, false);
  assert.equal(authority.reconciliation.q046DecimalDividedByIntegerRelationReused, false);
  assert.equal(authority.reconciliation.q031FractionTimesIntegerRelationReused, false);
  assert.equal(authority.reconciliation.q031Q032FractionMultiplicationPrimitiveReuseDeferredToImplementation, true);
  assert.equal(authority.reconciliation.reciprocalConceptPromotedAsStandaloneKnowledgePoint, false);
});

test("q033 preserves future G6A-U02 slice boundaries", () => {
  assert.deepEqual(authority.reconciliation.futureG6AU02KnowledgePointIds, FUTURE_G6A_U02_KPS);
  assert.equal(authority.reconciliation.q034Touched, false);
  assert.equal(authority.reconciliation.q035Touched, false);
  assert.equal(authority.reconciliation.q036Touched, false);
  assert.equal(authority.reconciliation.q037Touched, false);
});

test("q033 remains planning-only with no implementation surface", () => {
  const boundary = authority.boundary;
  assert.equal(boundary.planningOnly, true);
  assert.equal(boundary.patternSpecMaterialized, false);
  assert.equal(boundary.generatorMaterialized, false);
  assert.equal(boundary.validatorMaterialized, false);
  assert.equal(boundary.selectorPromoted, false);
  assert.equal(boundary.worksheetEnabled, false);
  assert.equal(boundary.q034Touched, false);
  assert.equal(boundary.q035Touched, false);
  assert.equal(boundary.q036Touched, false);
  assert.equal(boundary.q037Touched, false);
  assert.equal(boundary.implementationApprovalRequired, true);
});
