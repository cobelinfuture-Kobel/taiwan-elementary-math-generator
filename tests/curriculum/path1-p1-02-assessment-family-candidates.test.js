import test from "node:test";
import assert from "node:assert/strict";
import {
  PATH1_PUBLIC_WORKSHEET_BLOCKS,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  PATH1_P1_02_KNOWLEDGE_POINT_IDS,
  PATH1_P1_02_PATTERN_FAMILIES,
} from "../../site/modules/curriculum/learning-paths/path1-p1-02-diversity.js";
import {
  buildPath1P102AssessmentFamilyCandidates,
  PATH1_P1_02_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY,
  PATH1_P1_02_ASSESSMENT_CANDIDATE_PROFILE_ID,
  PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES,
  PATH1_P1_02_DEFERRED_ASSESSMENT_FAMILIES,
  validatePath1P102AssessmentFamilyCandidate,
} from "../../site/modules/curriculum/learning-paths/path1-p1-02-assessment-family-candidates.js";

const CANDIDATE_IDS = [
  "C2_PLACE_VALUE_DECOMPOSITION_PRODUCT",
  "C3_COLUMN_CARRY_TRACE_PRODUCT",
];

const DEFERRED_IDS = [
  "PRODUCT_DIGIT_COMPLETION",
  "ESTIMATION",
  "TWO_STEP_CONTINUOUS_MULTIPLICATION",
  "ALGORITHM_JUDGEMENT_OR_ERROR_DIAGNOSIS",
];

function assertOperandScope(entry) {
  const { multiplicand, digit, product } = entry.metadata;
  assert.ok(Number.isInteger(multiplicand));
  assert.ok(Number.isInteger(digit));
  assert.equal(product, multiplicand * digit);
  assert.ok(digit >= 2 && digit <= 9);
  if (entry.knowledgePointId === PATH1_P1_02_KNOWLEDGE_POINT_IDS[0]) {
    assert.ok(multiplicand >= 10 && multiplicand <= 99);
    assert.ok((multiplicand % 10) * digit >= 10);
  } else {
    assert.ok(multiplicand >= 100 && multiplicand <= 999);
    assert.notEqual(Math.floor(multiplicand / 10) % 10, 0);
    assert.notEqual(multiplicand % 10, 0);
  }
}

test("P1-02 candidate materialization does not cut over the current public C0-C1 profile", () => {
  const block = PATH1_PUBLIC_WORKSHEET_BLOCKS.find((entry) => entry.blockId === "P1-02");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, PATH1_P1_02_KNOWLEDGE_POINT_IDS);
  assert.deepEqual(
    PATH1_P1_02_PATTERN_FAMILIES.map((family) => family.familyId),
    ["C0_DIRECT_MULTI_DIGIT_BY_ONE_DIGIT", "C1_PRODUCT_RELATION_SELECTION"],
  );
  assert.equal(block.diversityProfileId, "PATH1_P1_02_MULTI_DIGIT_BY_ONE_DIGIT_DIVERSITY_V1");
});

test("P1-02 source-backed candidate registry contains only decomposition and column-trace families", () => {
  assert.equal(PATH1_P1_02_ASSESSMENT_CANDIDATE_PROFILE_ID, "PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES_V1");
  assert.deepEqual(
    PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.map((family) => family.familyId),
    CANDIDATE_IDS,
  );
  assert.ok(PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.every((family) => (
    family.sourceEvidence.includes("batchA_01-題型總覽-3a03-乘法.pdf:p1")
  )));
  assert.deepEqual(
    PATH1_P1_02_DEFERRED_ASSESSMENT_FAMILIES.map((family) => family.familyId),
    DEFERRED_IDS,
  );
  assert.ok(PATH1_P1_02_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY >= 240);
});

test("P1-02 candidate generator supports 120 distinct questions balanced across two families and two canonical KPs", () => {
  const result = buildPath1P102AssessmentFamilyCandidates({
    count: 120,
    seed: "path1-p1-02-assessment-candidate-capacity",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.items.length, 120);
  assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, 120);
  assert.equal(result.summary.candidateFamilyCount, 2);
  assert.equal(result.summary.publicCutoverApproved, false);
  assert.deepEqual(Object.values(result.summary.familyCounts), [60, 60]);
  assert.deepEqual(Object.values(result.summary.knowledgePointCounts), [60, 60]);

  for (const entry of result.items) {
    assertOperandScope(entry);
    assert.equal(validatePath1P102AssessmentFamilyCandidate(entry).ok, true, JSON.stringify(entry));
    assert.equal(entry.metadata.candidateOnly, true);
    assert.equal(entry.metadata.publicCutoverApproved, false);
    assert.equal(entry.metadata.canonicalKnowledgePointMinted, false);
    assert.equal(entry.metadata.missingDigitInferenceUsed, false);
    assert.equal(entry.metadata.estimationUsed, false);
    assert.equal(entry.metadata.multiStepApplicationUsed, false);
    assert.equal(entry.metadata.zeroSpecialCaseRoutedHere, false);
    assert.equal(entry.metadata.answerRole, "product");
    assert.equal(entry.answerText, String(entry.metadata.product));
  }
});

test("P1-02 decomposition candidate exposes source-backed place-value partial products without minting a new KP", () => {
  const result = buildPath1P102AssessmentFamilyCandidates({
    count: 40,
    seed: "path1-p1-02-decomposition-evidence",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const entries = result.items.filter((entry) => entry.metadata.path1PatternFamilyId === "C2_PLACE_VALUE_DECOMPOSITION_PRODUCT");
  assert.equal(entries.length, 20);
  assert.ok(entries.some((entry) => entry.knowledgePointId === PATH1_P1_02_KNOWLEDGE_POINT_IDS[0]));
  assert.ok(entries.some((entry) => entry.knowledgePointId === PATH1_P1_02_KNOWLEDGE_POINT_IDS[1]));
  for (const entry of entries) {
    const reconstructed = entry.metadata.partialProducts.reduce((sum, value) => sum + value, 0);
    assert.equal(reconstructed, entry.metadata.product);
    assert.equal(entry.metadata.reconstructedProduct, entry.metadata.product);
    assert.ok(entry.prompt.includes(" + "));
    assert.ok(entry.prompt.endsWith("= ______"));
  }
});

test("P1-02 column-trace candidate preserves carry arithmetic and never becomes missing-digit inference", () => {
  const result = buildPath1P102AssessmentFamilyCandidates({
    count: 40,
    seed: "path1-p1-02-column-trace-evidence",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const entries = result.items.filter((entry) => entry.metadata.path1PatternFamilyId === "C3_COLUMN_CARRY_TRACE_PRODUCT");
  assert.equal(entries.length, 20);
  assert.ok(entries.some((entry) => entry.knowledgePointId === PATH1_P1_02_KNOWLEDGE_POINT_IDS[0]));
  assert.ok(entries.some((entry) => entry.knowledgePointId === PATH1_P1_02_KNOWLEDGE_POINT_IDS[1]));
  for (const entry of entries) {
    const trace = entry.metadata.columnTrace;
    assert.equal(trace.onesTotal, trace.onesDigit * entry.metadata.digit);
    assert.equal(trace.onesWritten, trace.onesTotal % 10);
    assert.equal(trace.carryToTens, Math.floor(trace.onesTotal / 10));
    assert.equal(trace.tensTotal, trace.tensDigit * entry.metadata.digit + trace.carryToTens);
    assert.equal(trace.tensWritten, trace.tensTotal % 10);
    assert.equal(trace.carryToHundreds, Math.floor(trace.tensTotal / 10));
    assert.equal(entry.metadata.missingDigitInferenceUsed, false);
    assert.ok(entry.prompt.includes("乘積 = ______"));
  }
});

test("P1-02 deferred families remain explicitly outside this milestone", () => {
  const reasons = Object.fromEntries(PATH1_P1_02_DEFERRED_ASSESSMENT_FAMILIES.map((entry) => [entry.familyId, entry.reason]));
  assert.equal(reasons.PRODUCT_DIGIT_COMPLETION, "BOUNDARY_AMBIGUOUS_WITH_KP_G3A_U03_MULTIPLICATION_MISSING_DIGIT_INFERENCE");
  assert.equal(reasons.ESTIMATION, "SOURCE_PRESENT_BUT_NOT_PART_OF_CURRENT_P1_02_CANONICAL_KP_BINDING");
  assert.equal(reasons.TWO_STEP_CONTINUOUS_MULTIPLICATION, "SOURCE_PRESENT_BUT_CROSS_STEP_APPLICATION_IS_OUTSIDE_P1_02_CORE_SCOPE");
  assert.equal(reasons.ALGORITHM_JUDGEMENT_OR_ERROR_DIAGNOSIS, "PRIMARY_3A_U03_SOURCE_DOES_NOT_ESTABLISH_THIS_AS_A_CORE_ASSESSMENT_FAMILY");
});
