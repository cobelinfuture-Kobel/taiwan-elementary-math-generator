import test from "node:test";
import assert from "node:assert/strict";
import { PATH1_PUBLIC_WORKSHEET_BLOCKS } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  buildPath1P103DiversityItems,
  PATH1_P1_03_DISTINCT_PROMPT_CAPACITY,
  PATH1_P1_03_DIVERSITY_PROFILE_ID,
  PATH1_P1_03_KNOWLEDGE_POINT_ID,
  PATH1_P1_03_PATTERN_FAMILIES,
  validatePath1P103DiversityItem,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-diversity.js";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-p1-03-extension.js";

function questionDisplayModelsFromPages(worksheetDocument) {
  return (worksheetDocument.questionPages ?? [])
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "question" && cell.displayModel)
    .map((cell) => cell.displayModel);
}

function answerKeyItemsFromPages(worksheetDocument) {
  return (worksheetDocument.answerKeyPages ?? [])
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "answerKey" && cell.answerKeyItem)
    .map((cell) => cell.answerKeyItem);
}

function assertProductOnlyScope(entry) {
  assert.equal(entry.knowledgePointId, PATH1_P1_03_KNOWLEDGE_POINT_ID);
  assert.equal(entry.mode, "numeric");
  assert.equal(entry.metadata.canonicalKnowledgePointMinted, false);
  assert.equal(entry.metadata.answerRole, "product");
  assert.equal(entry.metadata.productOnlyAnswerRole, true);
  assert.equal(entry.metadata.missingDigitInferenceUsed, false);
  assert.equal(entry.metadata.applicationPromptUsed, false);
  assert.equal(entry.metadata.relationPromptUsed, false);
  assert.ok(entry.metadata.leftFactor >= 10 && entry.metadata.leftFactor <= 99);
  assert.ok(entry.metadata.rightFactor >= 10 && entry.metadata.rightFactor <= 99);
  assert.equal(entry.metadata.product, entry.metadata.leftFactor * entry.metadata.rightFactor);
  assert.equal(entry.answerText, String(entry.metadata.product));
}

test("P1-03 stays anchored to one canonical two-digit-by-two-digit KP and approved C0-C1 only", () => {
  const block = PATH1_PUBLIC_WORKSHEET_BLOCKS.find((entry) => entry.blockId === "P1-03");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, [PATH1_P1_03_KNOWLEDGE_POINT_ID]);
  assert.equal(block.diversityProfileId, PATH1_P1_03_DIVERSITY_PROFILE_ID);
  assert.deepEqual(
    PATH1_P1_03_PATTERN_FAMILIES.map((family) => family.familyId),
    ["C0_DIRECT_TWO_DIGIT_BY_TWO_DIGIT", "C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT"],
  );
  assert.equal(PATH1_P1_03_PATTERN_FAMILIES.some((family) => /MISSING|APPLICATION|RELATION/.test(family.familyId)), false);
  assert.ok(PATH1_P1_03_DISTINCT_PROMPT_CAPACITY >= 16200);
});

test("P1-03 diversity generator supports 120 distinct product-only questions with balanced C0-C1 coverage", () => {
  const result = buildPath1P103DiversityItems({
    count: 120,
    seed: "path1-p1-03-capacity-gate",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.items.length, 120);
  assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, 120);
  assert.equal(result.summary.patternFamilyCount, 2);
  assert.ok(result.summary.distinctPromptCapacity >= 16200);
  assert.deepEqual(Object.values(result.summary.familyCounts), [60, 60]);
  assert.equal(result.summary.knowledgePointCounts[PATH1_P1_03_KNOWLEDGE_POINT_ID], 120);
  assert.equal(result.summary.productOnlyAnswerCount, 120);

  for (const entry of result.items) {
    assertProductOnlyScope(entry);
    assert.equal(validatePath1P103DiversityItem(entry).ok, true, JSON.stringify(entry));
    if (entry.metadata.path1PatternFamilyId === "C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT") {
      assert.equal(entry.metadata.tensFactor + entry.metadata.onesFactor, entry.metadata.rightFactor);
      assert.equal(entry.metadata.tensPartialProduct, entry.metadata.leftFactor * entry.metadata.tensFactor);
      assert.equal(entry.metadata.onesPartialProduct, entry.metadata.leftFactor * entry.metadata.onesFactor);
      assert.equal(entry.metadata.reconstructedProduct, entry.metadata.product);
      assert.equal(entry.metadata.tensPartialProductIncludesPlaceShift, true);
    }
  }

  const second = buildPath1P103DiversityItems({
    count: 120,
    seed: "path1-p1-03-capacity-gate-second-session",
  });
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  const repeatedPracticeUnion = new Set([
    ...result.items.map((entry) => entry.prompt),
    ...second.items.map((entry) => entry.prompt),
  ]);
  assert.ok(repeatedPracticeUnion.size >= 180, `repeated-practice union=${repeatedPracticeUnion.size}`);
});

test("P1-03 public worksheet materializes 120 distinct printable product-only questions without scope leakage", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-03",
    questionCount: 120,
    generationSeed: "path1-p1-03-public-120",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.questions;
  assert.equal(questions.length, 120);
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 120);
  assert.deepEqual(
    [...new Set(questions.map((question) => question.metadata.path1PatternFamilyId))].sort(),
    PATH1_P1_03_PATTERN_FAMILIES.map((family) => family.familyId).sort(),
  );
  assert.deepEqual(Object.values(result.worksheetDocument.report.summary.familyCounts), [60, 60]);
  assert.equal(result.worksheetDocument.report.summary.diversityProfileId, PATH1_P1_03_DIVERSITY_PROFILE_ID);
  assert.ok(result.worksheetDocument.report.summary.distinctPromptCapacity >= 16200);
  assert.ok(questions.every((question) => question.knowledgePointId === PATH1_P1_03_KNOWLEDGE_POINT_ID));
  assert.ok(questions.every((question) => question.metadata.productOnlyAnswerRole === true));
  assert.ok(questions.every((question) => question.metadata.missingDigitInferenceUsed === false));
  assert.ok(questions.every((question) => question.metadata.applicationPromptUsed === false));
  assert.ok(questions.every((question) => question.metadata.relationPromptUsed === false));

  const displayModels = questionDisplayModelsFromPages(result.worksheetDocument);
  const answerItems = answerKeyItemsFromPages(result.worksheetDocument);
  assert.equal(displayModels.length, 120);
  assert.equal(answerItems.length, 120);
  assert.ok(displayModels.every((entry) => String(entry.blankedDisplayText ?? "").trim().length > 0));
  assert.ok(answerItems.every((entry) => String(entry.answerText ?? "").trim().length > 0));
});

test("P1-03 six-question browser smoke input renders direct and partial-products families", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-03",
    questionCount: 6,
    generationSeed: "path1-p1-03-renderable-body-gate",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.questions;
  assert.equal(questions.length, 6);
  assert.equal(new Set(questions.map((question) => question.metadata.path1PatternFamilyId)).size, 2);
  assert.ok(questions.some((question) => question.metadata.path1PatternFamilyId === "C0_DIRECT_TWO_DIGIT_BY_TWO_DIGIT"));
  assert.ok(questions.some((question) => question.metadata.path1PatternFamilyId === "C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT"));
  assert.ok(questions.some((question) => question.prompt.includes(" + ")));
  assert.equal(questionDisplayModelsFromPages(result.worksheetDocument).length, 6);
  assert.equal(answerKeyItemsFromPages(result.worksheetDocument).length, 6);
});
