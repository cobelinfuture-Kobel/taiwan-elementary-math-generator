import test from "node:test";
import assert from "node:assert/strict";
import {
  PATH1_PUBLIC_WORKSHEET_BLOCKS,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  PATH1_P1_03_DIVERSITY_PROFILE_ID,
  PATH1_P1_03_KNOWLEDGE_POINT_ID,
  PATH1_P1_03_PATTERN_FAMILIES,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-diversity.js";
import {
  buildPath1P103AssessmentFamilyCandidates,
  PATH1_P1_03_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY,
  PATH1_P1_03_ASSESSMENT_CANDIDATE_PROFILE_ID,
  PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES,
  PATH1_P1_03_DEFERRED_ASSESSMENT_FAMILIES,
  validatePath1P103AssessmentFamilyCandidate,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-assessment-family-candidates-v2.js";

const CANDIDATE_IDS = [
  "C2_PARTIAL_PRODUCT_SLOT_COMPLETION",
  "C3_EQUIVALENT_PARTIAL_PRODUCT_EXPRESSION",
  "C4_TENS_PARTIAL_PRODUCT_ALIGNMENT_JUDGEMENT",
];

const DEFERRED_IDS = [
  "MISSING_DIGIT_INFERENCE",
  "RELATED_PRODUCT_NEAR_ROUND_NUMBER",
  "APPLICATION_WORD_PROBLEM",
  "MULTI_STEP_APPLICATION",
];

function assertOperandScope(entry) {
  const { leftFactor, rightFactor, product } = entry.metadata;
  assert.ok(leftFactor >= 11 && leftFactor <= 99);
  assert.ok(rightFactor >= 11 && rightFactor <= 99);
  assert.notEqual(leftFactor % 10, 0);
  assert.notEqual(rightFactor % 10, 0);
  assert.equal(product, leftFactor * rightFactor);
}

test("P1-03 candidate materialization leaves current public C0-C1 V1 profile unchanged", () => {
  const block = PATH1_PUBLIC_WORKSHEET_BLOCKS.find((entry) => entry.blockId === "P1-03");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, [PATH1_P1_03_KNOWLEDGE_POINT_ID]);
  assert.equal(block.diversityProfileId, PATH1_P1_03_DIVERSITY_PROFILE_ID);
  assert.equal(block.diversityProfileId, "PATH1_P1_03_TWO_DIGIT_BY_TWO_DIGIT_DIVERSITY_V1");
  assert.deepEqual(
    PATH1_P1_03_PATTERN_FAMILIES.map((family) => family.familyId),
    ["C0_DIRECT_TWO_DIGIT_BY_TWO_DIGIT", "C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT"],
  );
});

test("P1-03 candidate registry contains only approved C2-C4 and preserves frozen source/KP boundary", () => {
  assert.equal(PATH1_P1_03_ASSESSMENT_CANDIDATE_PROFILE_ID, "PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES_V2");
  assert.deepEqual(
    PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.map((family) => family.familyId),
    CANDIDATE_IDS,
  );
  for (const family of PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES) {
    assert.ok(family.primarySourceEvidence.includes("batchA_02-題型總覽-4a02-整數的乘法.pdf"));
    assert.ok(family.sourceEvidence.includes("ps_g4a_u02_2digit_by_2digit"));
  }
  assert.deepEqual(
    PATH1_P1_03_DEFERRED_ASSESSMENT_FAMILIES.map((family) => family.familyId),
    DEFERRED_IDS,
  );
  assert.ok(PATH1_P1_03_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY >= 360);
});

test("P1-03 candidate generator supports 120 distinct items balanced across C2-C4", () => {
  const result = buildPath1P103AssessmentFamilyCandidates({
    count: 120,
    seed: "path1-p1-03-assessment-candidate-capacity-v2",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.items.length, 120);
  assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, 120);
  assert.equal(result.summary.candidateFamilyCount, 3);
  assert.equal(result.summary.publicCutoverApproved, false);
  assert.deepEqual(Object.values(result.summary.familyCounts), [40, 40, 40]);
  assert.equal(result.summary.knowledgePointCounts[PATH1_P1_03_KNOWLEDGE_POINT_ID], 120);

  for (const entry of result.items) {
    assertOperandScope(entry);
    const validation = validatePath1P103AssessmentFamilyCandidate(entry);
    assert.equal(validation.ok, true, `${entry.generatedItemId}: ${JSON.stringify(validation.errors)}`);
    assert.equal(entry.knowledgePointId, PATH1_P1_03_KNOWLEDGE_POINT_ID);
    assert.equal(entry.metadata.canonicalKnowledgePointId, PATH1_P1_03_KNOWLEDGE_POINT_ID);
    assert.equal(entry.metadata.candidateOnly, true);
    assert.equal(entry.metadata.publicCutoverApproved, false);
    assert.equal(entry.metadata.canonicalKnowledgePointMinted, false);
    assert.equal(entry.metadata.missingDigitInferenceUsed, false);
    assert.equal(entry.metadata.applicationPromptUsed, false);
    assert.equal(entry.metadata.relationPromptUsed, false);
    assert.equal(entry.metadata.relatedProductCompensationUsed, false);
    assert.equal(entry.metadata.multiStepApplicationUsed, false);
  }
});

test("P1-03 C2 completes exactly one partial-product slot and preserves tens-place shift", () => {
  const result = buildPath1P103AssessmentFamilyCandidates({ count: 60, seed: "path1-p1-03-c2-slot" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const entries = result.items.filter((entry) => entry.metadata.path1PatternFamilyId === "C2_PARTIAL_PRODUCT_SLOT_COMPLETION");
  assert.equal(entries.length, 20);
  assert.ok(entries.some((entry) => entry.metadata.missingSlot === "TENS_PARTIAL_PRODUCT"));
  assert.ok(entries.some((entry) => entry.metadata.missingSlot === "ONES_PARTIAL_PRODUCT"));
  for (const entry of entries) {
    const metadata = entry.metadata;
    const expected = metadata.missingSlot === "TENS_PARTIAL_PRODUCT"
      ? metadata.tensPartialProduct
      : metadata.onesPartialProduct;
    assert.equal(metadata.expectedSlotValue, expected);
    assert.equal(entry.answerText, String(expected));
    assert.equal(metadata.tensPartialProduct, metadata.leftFactor * metadata.tensFactor);
    assert.equal(metadata.tensPartialProductIncludesPlaceShift, true);
    assert.equal(metadata.reconstructedProduct, metadata.product);
  }
});

test("P1-03 C3 offers one and only one equivalent partial-product expression", () => {
  const result = buildPath1P103AssessmentFamilyCandidates({ count: 60, seed: "path1-p1-03-c3-expression" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const entries = result.items.filter((entry) => entry.metadata.path1PatternFamilyId === "C3_EQUIVALENT_PARTIAL_PRODUCT_EXPRESSION");
  assert.equal(entries.length, 20);
  for (const entry of entries) {
    const metadata = entry.metadata;
    assert.equal(entry.mode, "choice");
    assert.equal(metadata.optionValues.length, 4);
    assert.equal(metadata.optionValues.filter((value) => value === metadata.product).length, 1);
    assert.equal(metadata.optionExpressions.length, 4);
    assert.ok(metadata.optionExpressions.includes(metadata.correctExpression));
    assert.equal(entry.answerText, metadata.correctOptionLabel);
    assert.ok(["A", "B", "C", "D"].includes(entry.answerText));
    assert.equal(metadata.tensPartialProductIncludesPlaceShift, true);
  }
});

test("P1-03 C4 isolates tens partial-product alignment judgement without general error-diagnosis expansion", () => {
  const result = buildPath1P103AssessmentFamilyCandidates({ count: 120, seed: "path1-p1-03-c4-alignment" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const entries = result.items.filter((entry) => entry.metadata.path1PatternFamilyId === "C4_TENS_PARTIAL_PRODUCT_ALIGNMENT_JUDGEMENT");
  assert.equal(entries.length, 40);
  assert.ok(entries.some((entry) => entry.answerText === "甲"));
  assert.ok(entries.some((entry) => entry.answerText === "乙"));
  for (const entry of entries) {
    const metadata = entry.metadata;
    assert.equal(entry.mode, "choice");
    assert.equal(metadata.alignmentChoiceTexts.length, 2);
    assert.ok(["甲", "乙"].includes(metadata.correctChoiceLabel));
    assert.equal(entry.answerText, metadata.correctChoiceLabel);
    assert.equal(metadata.tensPartialProduct, metadata.leftFactor * metadata.tensFactor);
    assert.equal(metadata.tensPartialProductIncludesPlaceShift, true);
    assert.ok(metadata.assessmentEvidence.includes("ASSESSMENT_FORMAT_ONLY"));
    assert.equal(metadata.missingDigitInferenceUsed, false);
    assert.equal(metadata.relatedProductCompensationUsed, false);
  }
});

test("P1-03 deferred families remain explicit and are not materialized by this milestone", () => {
  const reasons = Object.fromEntries(PATH1_P1_03_DEFERRED_ASSESSMENT_FAMILIES.map((entry) => [entry.familyId, entry.reason]));
  assert.equal(reasons.MISSING_DIGIT_INFERENCE, "CONSTRAINT_REASONING_EXCEEDS_P1_03_PRODUCT_AND_PARTIAL_PRODUCT_BOUNDARY");
  assert.equal(reasons.RELATED_PRODUCT_NEAR_ROUND_NUMBER, "DISTRIBUTIVE_COMPENSATION_TRANSFER_IS_NOT_THE_FROZEN_P1_03_PARTIAL_PRODUCT_CORE");
  assert.equal(reasons.APPLICATION_WORD_PROBLEM, "P1_03_FUSION_GATE_IS_NOT_APPLICABLE");
  assert.equal(reasons.MULTI_STEP_APPLICATION, "MULTI_STEP_MODELING_IS_OUTSIDE_P1_03_CORE_SCOPE");
});
