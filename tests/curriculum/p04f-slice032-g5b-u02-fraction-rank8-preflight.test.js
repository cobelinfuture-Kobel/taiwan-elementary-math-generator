import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const authority = read("data/curriculum/full-product/p04f/slice032-g5b-u02-fraction-rank8-preflight-authority.json");
const queue = read("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const q024 = read("data/curriculum/full-product/p04f/slice024-g3a-u08-measurement-fraction-authority.json");
const q031 = read("data/curriculum/full-product/p04f/slice031-g5b-u02-fraction-times-integer-preflight-authority.json");

const expectedKps = [
  "kp_g5b_u02_fraction_multi_step_calculation",
  "kp_g5b_u02_fraction_multiplication_simplification",
  "kp_g5b_u02_fraction_of_quantity",
  "kp_g5b_u02_integer_times_fraction",
];

const mappingByKp = new Map(authority.formalMappings.map((row) => [row.knowledgePointId, row]));

test("q032 frozen queue identity and four-KP membership are exact", () => {
  assert.equal(queue.orderedSliceIds[31], authority.queue.sliceId);
  assert.deepEqual(authority.queue.knowledgePointIds, expectedKps);
  assert.deepEqual(queue.orderedKnowledgePointIds.slice(42, 46), expectedKps);
  assert.equal(authority.queue.intraWavePrerequisiteRank, 8);
  assert.equal(authority.queue.primaryRuntimeProfileId, "profile_fraction");
  assert.equal(authority.queue.previousSliceId, "p04e_q031_r7_g5b_u02_5b02_profile_fraction_c1");
  assert.equal(authority.queue.nextSliceId, "p04e_q033_r8_g6a_u02_6a02_profile_fraction_c1");
});

test("q032 source and R02 canonical semantics are locked", () => {
  assert.equal(authority.sourceAuthority.sourceFile, "meow911_5b02_source.pdf");
  assert.equal(authority.sourceAuthority.sourceTitle, "分數的計算");
  assert.equal(authority.sourceAuthority.r02AuthorityPath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-04.json");
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId), expectedKps);
  assert.equal(authority.knowledgePoints.find((row) => row.knowledgePointId === "kp_g5b_u02_integer_times_fraction").reasoningInvariant, "整數乘分數與分數乘整數數值相同。");
  assert.equal(authority.knowledgePoints.find((row) => row.knowledgePointId === "kp_g5b_u02_fraction_of_quantity").reasoningInvariant, "部分量等於全體量乘指定分率，答案單位沿用原量。");
});

test("q032 FormalMapping reuses only semantically equivalent active relations", () => {
  const quantity = mappingByKp.get("kp_g5b_u02_fraction_of_quantity");
  assert.equal(quantity.classification, "REUSE_ACTIVE_RELATION");
  assert.equal(quantity.relationFamilyId, "FRACTION_OF_QUANTITY");
  assert.deepEqual(quantity.knownRoleIds, ["WHOLE_QUANTITY", "FRACTION_OPERATOR"]);
  assert.equal(quantity.targetRoleId, "PART_QUANTITY");
  assert.equal(quantity.relationFamilyId, q024.formalMapping.relationFamilyId);
  assert.deepEqual(quantity.knownRoleIds, q024.formalMapping.knownRoleIds);
  assert.equal(quantity.targetRoleId, q024.formalMapping.targetRoleId);

  const commutative = mappingByKp.get("kp_g5b_u02_integer_times_fraction");
  assert.equal(commutative.classification, "REUSE_ACTIVE_RELATION_WITH_COMMUTATIVE_ROLE_NORMALIZATION");
  assert.equal(commutative.relationFamilyId, "FRACTION_TIMES_INTEGER_PRODUCT");
  assert.deepEqual(commutative.knownRoleIds, ["SOURCE_FRACTION", "INTEGER_MULTIPLIER"]);
  assert.equal(commutative.targetRoleId, "PRODUCT_FRACTION");
  assert.equal(commutative.relationFamilyId, q031.formalMappingCandidate.relationFamilyId);
  assert.deepEqual(commutative.knownRoleIds, q031.formalMappingCandidate.knownRoleIds);
  assert.equal(commutative.targetRoleId, q031.formalMappingCandidate.targetRoleId);
  assert.equal(commutative.surfaceOperandOrder, "INTEGER_THEN_FRACTION");
  assert.equal(commutative.roleNormalization, "COMMUTATIVE_SWAP_TO_SOURCE_FRACTION_TIMES_INTEGER_MULTIPLIER");
});

test("q032 simplification and multi-step semantics remain new FormalMapping candidates", () => {
  const simplification = mappingByKp.get("kp_g5b_u02_fraction_multiplication_simplification");
  assert.equal(simplification.classification, "NEW_RELATION_CANDIDATE");
  assert.equal(simplification.relationFamilyId, "FRACTION_PRODUCT_SIMPLIFICATION");
  assert.equal(simplification.invariants.productValuePreservedByCancellation, true);
  assert.equal(simplification.invariants.finalRepresentationReduced, true);

  const multiStep = mappingByKp.get("kp_g5b_u02_fraction_multi_step_calculation");
  assert.equal(multiStep.classification, "NEW_RELATION_CANDIDATE");
  assert.equal(multiStep.relationFamilyId, "FRACTION_MULTI_STEP_CALCULATION");
  assert.equal(multiStep.invariants.intermediateResultCarriesForward, true);
  assert.equal(multiStep.invariants.equivalencePreservedAtEveryStep, true);
  assert.equal(multiStep.invariants.parenthesesAndMulDivPrecedenceRequired, true);

  assert.equal(authority.reconciliation.activeRelationReuseCount, 2);
  assert.equal(authority.reconciliation.newRelationCandidateCount, 2);
  assert.equal(authority.reconciliation.q027FractionalQuantityScalingRelationReused, false);
});

test("q032 remains planning-only with no implementation surface", () => {
  const boundary = authority.boundary;
  assert.equal(boundary.planningOnly, true);
  assert.equal(boundary.patternSpecMaterialized, false);
  assert.equal(boundary.generatorMaterialized, false);
  assert.equal(boundary.validatorMaterialized, false);
  assert.equal(boundary.selectorPromoted, false);
  assert.equal(boundary.worksheetEnabled, false);
  assert.equal(boundary.q033Touched, false);
  assert.equal(boundary.implementationApprovalRequired, true);
});
