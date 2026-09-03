import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const authority = read("data/curriculum/full-product/p04f/slice039-g6b-u01-mixed-domain-expression-preflight-authority.json");
const q038Authority = read("data/curriculum/full-product/p04f/slice038-g6b-u01-mixed-decimal-fraction-mul-div-authority.json");
const queue = read("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const r02 = read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");

const TARGET_KP = "kp_g6b_u01_mixed_domain_expression";
const source = r02.sourceRecords.find((row) => row.sourceNodeId === "g6b_u01_6b01");
const target = source?.candidates.find((row) => row.knowledgePointId === TARGET_KP);
const mapping = authority.formalMappings[0];

test("q039 frozen queue identity is exact and closes the W4 queue", () => {
  assert.equal(queue.orderedSliceIds[38], authority.queue.sliceId);
  assert.equal(queue.lastSliceId, authority.queue.sliceId);
  assert.deepEqual(authority.queue.knowledgePointIds, [TARGET_KP]);
  assert.equal(queue.orderedKnowledgePointIds.at(-1), TARGET_KP);
  assert.equal(authority.queue.queuePosition, 39);
  assert.equal(authority.queue.intraWavePrerequisiteRank, 13);
  assert.equal(authority.queue.primaryRuntimeProfileId, "profile_mixed_number_domain");
  assert.equal(authority.queue.previousSliceId, q038Authority.sliceId);
  assert.equal(authority.queue.nextSliceId, null);
  assert.equal(authority.queue.isFinalQueueSlice, true);
});

test("q039 reuses reviewed G6B-U01 page-1 authority without inventing a new source", () => {
  assert.ok(source);
  assert.ok(target);
  assert.equal(authority.sourceAuthority.sourceFile, "meow911_6b01_source.pdf");
  assert.equal(authority.sourceAuthority.sourceTitle, "小數與分數的計算");
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1]);
  assert.equal(authority.sourceAuthority.visualVerificationStatus, "REUSED_FROM_P04F38_FULL_PAGE_VISUAL_READBACK");
  assert.equal(q038Authority.sourceId, authority.queue.primarySourceNodeId);
  assert.equal(q038Authority.sourceTitle, authority.sourceAuthority.sourceTitle);
  assert.equal(target.canonicalNameZh, "小數分數混合算式");
  assert.equal(target.capabilityStatement, "學生能依運算順序完成含小數與分數的算式。");
  assert.equal(target.reasoningInvariant, "每步轉換與運算皆須等值並遵守括號及乘除優先。");
  assert.deepEqual(target.evidencePages, [1]);
  assert.equal(authority.knowledgePoints[0].capabilityStatement, target.capabilityStatement);
  assert.equal(authority.knowledgePoints[0].reasoningInvariant, target.reasoningInvariant);
});

test("q039 FormalMapping is distinct multi-step mixed-domain expression evaluation", () => {
  assert.equal(mapping.knowledgePointId, TARGET_KP);
  assert.equal(mapping.classification, "NEW_RELATION_CANDIDATE");
  assert.equal(mapping.relationFamilyId, "MIXED_DOMAIN_EXPRESSION_EVALUATION");
  assert.deepEqual(mapping.knownRoleIds, ["MIXED_DOMAIN_OPERANDS", "ORDERED_ARITHMETIC_OPERATORS", "OPTIONAL_PARENTHESES"]);
  assert.equal(mapping.targetRoleId, "EXACT_RATIONAL_RESULT");
  assert.equal(mapping.invariants.valuePreservingRepresentationConversionRequired, true);
  assert.equal(mapping.invariants.parenthesesEvaluatedFirst, true);
  assert.equal(mapping.invariants.multiplicationDivisionBeforeAdditionSubtraction, true);
  assert.equal(mapping.invariants.samePrecedenceEvaluatedLeftToRight, true);
  assert.equal(mapping.invariants.divisionByZeroForbidden, true);
  assert.equal(mapping.invariants.exactRationalArithmeticRequired, true);
  assert.equal(mapping.invariants.roundingAllowed, false);
});

test("q039 stays planning-only and does not mutate q038 semantic implementation", () => {
  assert.equal(authority.boundary.planningOnly, true);
  assert.equal(authority.boundary.patternSpecMaterialized, false);
  assert.equal(authority.boundary.generatorMaterialized, false);
  assert.equal(authority.boundary.validatorMaterialized, false);
  assert.equal(authority.boundary.selectorPromoted, false);
  assert.equal(authority.boundary.worksheetEnabled, false);
  assert.equal(authority.boundary.q038RuntimeTouched, false);
  assert.equal(authority.reconciliation.q038Touched, false);
  assert.equal(authority.reconciliation.recommendedImplementationScope, "SHARED_RUNTIME_BOUNDED");
  assert.equal(authority.boundary.implementationApprovalRequired, true);
  assert.equal(authority.boundary.fullRepositoryRegressionAllowed, false);
  assert.equal(authority.boundary.globalBrowserReplayAllowed, false);
});

test("q039 preflight names exact predecessor capabilities and no future G6B-U01 KP", () => {
  assert.deepEqual(authority.reconciliation.predecessorG6BU01KnowledgePointIds, [
    "kp_g6b_u01_decimal_fraction_conversion",
    "kp_g6b_u01_mixed_decimal_fraction_add_sub",
    "kp_g6b_u01_mixed_decimal_fraction_mul_div",
    "kp_g6b_u01_mixed_number_domain_order"
  ]);
  assert.deepEqual(authority.reconciliation.futureG6BU01KnowledgePointIds, []);
  assert.ok(mapping.supportingCapabilities.includes("MIXED_DECIMAL_FRACTION_MULTIPLY_DIVIDE"));
  assert.ok(mapping.supportingCapabilities.includes("ARITHMETIC_OPERATION_PRECEDENCE"));
});
