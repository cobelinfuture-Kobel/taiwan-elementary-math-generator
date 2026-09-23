import test from "node:test";
import assert from "node:assert/strict";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  PATH1_P1_02_KNOWLEDGE_POINT_IDS,
} from "../../site/modules/curriculum/learning-paths/path1-p1-02-diversity.js";
import {
  buildPath1P102PublicDiversityItems,
  PATH1_P1_02_PUBLIC_DISTINCT_PROMPT_CAPACITY,
  PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID,
  PATH1_P1_02_PUBLIC_PATTERN_FAMILIES,
  validatePath1P102PublicDiversityItem,
} from "../../site/modules/curriculum/learning-paths/path1-p1-02-public-diversity-v2.js";
import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";

const EXPECTED_FAMILIES = [
  "C0_DIRECT_MULTI_DIGIT_BY_ONE_DIGIT",
  "C1_PRODUCT_RELATION_SELECTION",
  "C2_PLACE_VALUE_DECOMPOSITION_PRODUCT",
  "C3_COLUMN_CARRY_TRACE_PRODUCT",
];

function questionDisplayModels(worksheetDocument) {
  return (worksheetDocument.questionPages ?? [])
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "question" && cell.displayModel)
    .map((cell) => cell.displayModel);
}

function answerKeyItems(worksheetDocument) {
  return (worksheetDocument.answerKeyPages ?? [])
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "answerKey" && cell.answerKeyItem)
    .map((cell) => cell.answerKeyItem);
}

test("P1-02 public binding cuts over only to V2 C0-C3 with the same two canonical KPs", () => {
  const block = getPath1PublicWorksheetBlock("P1-02");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, PATH1_P1_02_KNOWLEDGE_POINT_IDS);
  assert.equal(block.diversityProfileId, PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID);
  assert.deepEqual(PATH1_P1_02_PUBLIC_PATTERN_FAMILIES.map((family) => family.familyId), EXPECTED_FAMILIES);
  assert.ok(PATH1_P1_02_PUBLIC_DISTINCT_PROMPT_CAPACITY >= 240);
});

test("P1-02 public V2 generates 120 distinct items balanced across C0-C3 and both canonical KPs", () => {
  const result = buildPath1P102PublicDiversityItems({
    count: 120,
    seed: "p1-02-public-cutover-v2-focused-capacity",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.items.length, 120);
  assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, 120);
  assert.equal(result.summary.patternFamilyCount, 4);
  assert.deepEqual(Object.values(result.summary.familyCounts), [30, 30, 30, 30]);
  assert.deepEqual(Object.values(result.summary.knowledgePointCounts), [60, 60]);
  for (const entry of result.items) {
    const validation = validatePath1P102PublicDiversityItem(entry);
    assert.equal(validation.ok, true, `${entry.generatedItemId}: ${JSON.stringify(validation.errors)}`);
    assert.equal(entry.metadata.candidateOnly, false);
    assert.equal(entry.metadata.publicCutoverApproved, true);
    assert.equal(entry.metadata.missingDigitInferenceUsed, false);
    assert.equal(entry.metadata.zeroSpecialCaseRoutedHere, false);
  }
});

test("P1-02 C2 public items preserve place-value decomposition invariants", () => {
  const result = buildPath1P102PublicDiversityItems({ count: 40, seed: "p1-02-c2-focused" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const items = result.items.filter((entry) => entry.metadata.path1PatternFamilyId === "C2_PLACE_VALUE_DECOMPOSITION_PRODUCT");
  assert.equal(items.length, 10);
  for (const entry of items) {
    assert.equal(entry.metadata.partialProducts.reduce((sum, value) => sum + value, 0), entry.metadata.product);
    assert.equal(entry.metadata.reconstructedProduct, entry.metadata.product);
    assert.equal(entry.answerText, String(entry.metadata.product));
    assert.ok(entry.prompt.includes(" + "));
  }
});

test("P1-02 C3 public items preserve column carry trace invariants without missing-digit inference", () => {
  const result = buildPath1P102PublicDiversityItems({ count: 40, seed: "p1-02-c3-focused" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const items = result.items.filter((entry) => entry.metadata.path1PatternFamilyId === "C3_COLUMN_CARRY_TRACE_PRODUCT");
  assert.equal(items.length, 10);
  for (const entry of items) {
    const trace = entry.metadata.columnTrace;
    assert.equal(trace.onesTotal, trace.onesDigit * entry.metadata.digit);
    assert.equal(trace.carryToTens, Math.floor(trace.onesTotal / 10));
    assert.equal(trace.tensTotal, trace.tensDigit * entry.metadata.digit + trace.carryToTens);
    assert.equal(trace.carryToHundreds, Math.floor(trace.tensTotal / 10));
    assert.equal(entry.metadata.missingDigitInferenceUsed, false);
    assert.equal(entry.answerText, String(entry.metadata.product));
    assert.ok(entry.prompt.includes("乘積 = ______"));
  }
});

test("P1-02 public worksheet renders all four families with questions and answer key", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-02",
    questionCount: 8,
    generationSeed: "p1-02-public-cutover-v2-render",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.questions;
  assert.equal(questions.length, 8);
  assert.deepEqual(
    [...new Set(questions.map((entry) => entry.metadata.path1PatternFamilyId))].sort(),
    [...EXPECTED_FAMILIES].sort(),
  );
  assert.equal(questionDisplayModels(result.worksheetDocument).length, 8);
  assert.equal(answerKeyItems(result.worksheetDocument).length, 8);
  assert.ok(questionDisplayModels(result.worksheetDocument).every((entry) => String(entry.blankedDisplayText ?? "").trim().length > 0));
  assert.ok(answerKeyItems(result.worksheetDocument).every((entry) => String(entry.answerText ?? "").trim().length > 0));
  assert.equal(questions.some((entry) => entry.knowledgePointId === "kp_g3a_u03_multiplication_missing_digit_inference"), false);
  assert.equal(questions.some((entry) => entry.knowledgePointId === "kp_g3a_u03_3digit_zero_middle_by_1digit"), false);
});
