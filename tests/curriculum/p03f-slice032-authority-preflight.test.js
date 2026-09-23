import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeP03B7MixedNumberDomainNormalizationConsumer } from "../../src/curriculum/full-product/p03b7-mixed-number-domain-normalization-consumer.mjs";

const readJson = (relativePath) => JSON.parse(fs.readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8"));
const authority = readJson("data/curriculum/full-product/p03f/slice032-g6b-u01-rank8-mixed-domain-authority.json");
const predecessor = readJson("data/curriculum/final-milestone-claims/p03f-w3-slice031-e6-d0-v1.json");
const r02Chunk = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");

const TARGET_KP = "kp_g6b_u01_decimal_fraction_conversion";
const EXPECTED_HIDDEN = [
  "kp_g6b_u01_mixed_decimal_fraction_add_sub",
  "kp_g6b_u01_mixed_decimal_fraction_mul_div",
  "kp_g6b_u01_mixed_number_domain_order",
  "kp_g6b_u01_mixed_domain_expression",
];
const EXPECTED_W3_CAPABILITIES = [
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
  "cap_mixed_number_domain_normalization",
];

test("P03F32 preflight consumes exact frozen queue position only after Slice031 D0", () => {
  assert.equal(predecessor.status, "PASS_D0_CLOSED");
  assert.equal(predecessor.goalDistance, "D0");
  assert.equal(predecessor.progression.nextTask, "P03F_W3DirectProductVerticalSlice032Implementation");

  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  assert.equal(queue.queueFrozen, true);
  const entry = queue.queueEntries.find((row) => row.queuePosition === 32);
  assert.ok(entry);
  assert.equal(entry.sliceId, "p03e_q032_r8_g6b_u01_6b01_profile_mixed_number_domain_c1");
  assert.equal(entry.previousSliceId, "p03e_q031_r8_g5b_u04_5b04_profile_decimal_c1");
  assert.equal(entry.primarySourceNodeId, "g6b_u01_6b01");
  assert.equal(entry.intraWavePrerequisiteRank, 8);
  assert.equal(entry.primaryRuntimeProfileId, "profile_mixed_number_domain");
  assert.deepEqual(entry.knowledgePointIds, [TARGET_KP]);
  assert.equal(entry.targetEvidenceLevel, "E6_D0_COMPLETE");
});

test("P03F32 source authority preserves R02 candidate identity and direct-PDF provenance boundary", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g6b_u01_6b01");
  assert.ok(source);
  assert.equal(source.sourceTitle, "小數與分數的計算");
  assert.equal(source.pageCount, 1);
  assert.deepEqual(source.reviewedPages, [1]);

  const target = source.candidates.find((row) => row.knowledgePointId === TARGET_KP);
  assert.ok(target);
  assert.equal(target.canonicalNameZh, "小數分數互換");
  assert.equal(target.capabilityStatement, "學生能將有限小數化為分數並將可除盡分數化為小數。");
  assert.equal(target.reasoningInvariant, "兩種表示必須具有相同數值。");
  assert.deepEqual(target.evidencePages, [1]);

  assert.equal(authority.sourceAuthority.r02CandidatePath, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
  assert.equal(authority.sourceAuthority.legacyKnowledgeOperationPath, null);
  assert.equal(authority.sourceAuthority.legacyCanonicalOperationPath, null);
  assert.equal(authority.sourceAuthority.directPdfWitness.standaloneConversionExerciseDirectlyVisible, false);
  assert.equal(authority.sourceAuthority.directPdfWitness.classification, "MIXED_DECIMAL_FRACTION_EXPRESSION_WITNESS");
  assert.match(authority.sourceAuthority.canonicalProjectionBoundary, /R02 canonical prerequisite projection/);
});

test("P03F32 admits one G6B-U01 KP while four siblings remain frozen outside this slice", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g6b_u01_6b01");
  const sourceIds = source.candidates.map((row) => row.knowledgePointId).sort();
  assert.deepEqual(sourceIds, [TARGET_KP, ...EXPECTED_HIDDEN].sort());
  assert.deepEqual(authority.sourceSiblingBoundary.visibleKnowledgePointIds, [TARGET_KP]);
  assert.deepEqual([...authority.sourceSiblingBoundary.hiddenKnowledgePointIds].sort(), [...EXPECTED_HIDDEN].sort());
  assert.deepEqual(authority.sourceSiblingBoundary.futureDirectQueue, {
    kp_g6b_u01_mixed_number_domain_order: 41,
    kp_g6b_u01_mixed_decimal_fraction_add_sub: 47,
  });
  assert.deepEqual(authority.sourceSiblingBoundary.laterWaveExcludedKnowledgePointIds.sort(), [
    "kp_g6b_u01_mixed_decimal_fraction_mul_div",
    "kp_g6b_u01_mixed_domain_expression",
  ].sort());
});

test("P03F32 exact W3 runtime boundary is mixed-domain normalization plus number/domain authorities, not arithmetic", () => {
  assert.deepEqual(authority.capabilityBoundary.requiredW3CapabilityIds, EXPECTED_W3_CAPABILITIES);
  assert.deepEqual(authority.knowledgePoints[0].requiredW3CapabilityIds, EXPECTED_W3_CAPABILITIES);
  assert.deepEqual(authority.capabilityBoundary.p03b7HardeningGateOnlyCapabilityIds, [
    "cap_decimal_arithmetic",
    "cap_fraction_arithmetic",
  ]);
  assert.ok(!authority.capabilityBoundary.requiredW3CapabilityIds.includes("cap_decimal_arithmetic"));
  assert.ok(!authority.capabilityBoundary.requiredW3CapabilityIds.includes("cap_fraction_arithmetic"));

  const mixed = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const descriptor = mixed.getDescriptor(TARGET_KP);
  assert.ok(descriptor);
  assert.equal(descriptor.productionAdmissionState, "PRODUCTION_ADMITTED");
  assert.equal(descriptor.crossDomainComparison, true);
  assert.equal(descriptor.crossDomainEquivalence, true);
  assert.equal(descriptor.recurringDecimalApproximationAllowed, false);
  assert.equal(descriptor.floatingPointApproximationAllowed, false);
  assert.equal(descriptor.arithmeticMutationAllowed, false);
});

test("P03F32 FormalMapping freezes exactly two learner conversion surfaces", () => {
  assert.equal(authority.knowledgePoints.length, 1);
  assert.equal(authority.patternSurfaces.length, 2);
  assert.deepEqual(authority.patternSurfaces.map((row) => row.action).sort(), ["TO_DECIMAL", "TO_FRACTION"]);
  assert.deepEqual(authority.formalMappingBoundary.learnerFacingActions.sort(), ["TO_DECIMAL", "TO_FRACTION"]);
  assert.deepEqual(authority.formalMappingBoundary.internalValidationActions, ["EQUIVALENCE"]);
  assert.equal(authority.formalMappingBoundary.compareLearnerSurfaceAllowed, false);
  assert.equal(authority.formalMappingBoundary.arithmeticMutationAllowed, false);
  assert.equal(authority.formalMappingBoundary.floatingPointApproximationAllowed, false);
  assert.equal(authority.formalMappingBoundary.recurringDecimalApproximationAllowed, false);
  assert.equal(authority.formalMappingBoundary.applicationRequired, false);
  assert.equal(authority.formalMappingBoundary.globalContextRequired, false);
});

test("P03F32 product admission remains fail-closed until one-visible/four-hidden 32/226 E2E target is reached", () => {
  assert.equal(authority.productBoundary.expectedSourceVisibleCountAfterAdmission, 1);
  assert.equal(authority.productBoundary.expectedSourceHiddenCountAfterAdmission, 4);
  assert.equal(authority.productBoundary.expectedPublicSourceCountAfterAdmission, 32);
  assert.equal(authority.productBoundary.expectedCurrentPublicKnowledgePointCountAfterAdmission, 226);
  assert.equal(authority.productBoundary.parallelPipelineAllowed, false);
  assert.equal(authority.productBoundary.applicationExpansionAllowed, false);
  assert.equal(authority.productBoundary.globalContextExpansionAllowed, false);
  assert.equal(authority.productBoundary.slice041LeakAllowed, false);
  assert.equal(authority.productBoundary.slice047LeakAllowed, false);
  assert.equal(authority.productBoundary.laterWaveLeakAllowed, false);
  assert.equal(authority.productBoundary.nextSliceMayStartBeforeD0Closeout, false);
});
