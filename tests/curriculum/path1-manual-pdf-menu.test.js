import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PATH1_PUBLIC_WORKSHEET_BLOCKS,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  buildPath1P101DiversityItems,
  PATH1_P1_01_DISTINCT_PROMPT_CAPACITY,
  PATH1_P1_01_DIVERSITY_PROFILE_ID,
  PATH1_P1_01_KNOWLEDGE_POINT_ID,
  PATH1_P1_01_PATTERN_FAMILIES,
  validatePath1P101DiversityItem,
} from "../../site/modules/curriculum/learning-paths/path1-p1-01-diversity.js";
import {
  buildPath1P102DiversityItems,
  PATH1_P1_02_DISTINCT_PROMPT_CAPACITY,
  PATH1_P1_02_DIVERSITY_PROFILE_ID,
  PATH1_P1_02_KNOWLEDGE_POINT_IDS,
  PATH1_P1_02_PATTERN_FAMILIES,
  PATH1_P1_02_RELATION_MODES,
  validatePath1P102DiversityItem,
} from "../../site/modules/curriculum/learning-paths/path1-p1-02-diversity.js";
import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";

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

function answerKeyItemCount(worksheetDocument) {
  return answerKeyItemsFromPages(worksheetDocument).length;
}

function assertNonEmptyRenderableBodies(worksheetDocument, expectedCount, label) {
  const displayModels = questionDisplayModelsFromPages(worksheetDocument);
  const answerKeyItems = answerKeyItemsFromPages(worksheetDocument);
  assert.equal(worksheetDocument.questions.length, expectedCount, `${label}: question count`);
  assert.equal(displayModels.length, expectedCount, `${label}: rendered display-model count`);
  assert.equal(answerKeyItems.length, expectedCount, `${label}: rendered answer-item count`);
  for (let index = 0; index < expectedCount; index += 1) {
    const question = worksheetDocument.questions[index];
    const displayModel = displayModels[index];
    const answer = answerKeyItems[index];
    assert.ok(String(question?.prompt ?? "").trim().length > 0, `${label}: question ${index + 1} raw prompt empty`);
    assert.ok(String(question?.answerText ?? "").trim().length > 0, `${label}: question ${index + 1} raw answer empty`);
    assert.ok(String(displayModel?.blankedDisplayText ?? "").trim().length > 0, `${label}: question ${index + 1} rendered body empty`);
    assert.ok(String(answer?.answerText ?? "").trim().length > 0, `${label}: answer ${index + 1} rendered body empty`);
  }
  return { displayModels, answerKeyItems };
}

function assertP102OperandScope(knowledgePointId, operand, label) {
  assert.ok(operand, `${label}: operand missing`);
  assert.ok(Number.isInteger(operand.multiplicand), `${label}: multiplicand`);
  assert.ok(Number.isInteger(operand.digit), `${label}: digit`);
  assert.equal(operand.product, operand.multiplicand * operand.digit, `${label}: product invariant`);
  assert.ok(operand.digit >= 2 && operand.digit <= 9, `${label}: one-digit multiplier`);
  if (knowledgePointId === PATH1_P1_02_KNOWLEDGE_POINT_IDS[0]) {
    assert.ok(operand.multiplicand >= 10 && operand.multiplicand <= 99, `${label}: two-digit range`);
    assert.ok((operand.multiplicand % 10) * operand.digit >= 10, `${label}: source-backed direct carry`);
  } else {
    assert.ok(operand.multiplicand >= 100 && operand.multiplicand <= 999, `${label}: three-digit range`);
    assert.notEqual(Math.floor(operand.multiplicand / 10) % 10, 0, `${label}: zero-middle routed to P1-05`);
    assert.notEqual(operand.multiplicand % 10, 0, `${label}: trailing-zero special excluded from P1-02`);
  }
}

test("Path1 manual menu exposes exactly P1-01 through P1-27", () => {
  assert.equal(PATH1_PUBLIC_WORKSHEET_BLOCKS.length, 27);
  assert.deepEqual(
    PATH1_PUBLIC_WORKSHEET_BLOCKS.map((block) => block.blockId),
    Array.from({ length: 27 }, (_, index) => `P1-${String(index + 1).padStart(2, "0")}`),
  );
  assert.equal(new Set(PATH1_PUBLIC_WORKSHEET_BLOCKS.map((block) => block.blockId)).size, 27);
  assert.equal(PATH1_PUBLIC_WORKSHEET_BLOCKS.some((block) => block.blockId === "P1-00"), false);
});

test("P1-01 stays anchored to one canonical KP and the approved C0-C5 diversity profile", () => {
  const block = PATH1_PUBLIC_WORKSHEET_BLOCKS.find((entry) => entry.blockId === "P1-01");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, [PATH1_P1_01_KNOWLEDGE_POINT_ID]);
  assert.equal(block.diversityProfileId, PATH1_P1_01_DIVERSITY_PROFILE_ID);
  assert.deepEqual(
    PATH1_P1_01_PATTERN_FAMILIES.map((family) => family.familyId),
    [
      "C0_DIRECT_TENS_MULTIPLICATION",
      "C1_BASE_FACT_TO_TENS_SCALE",
      "C2_NUMBER_OF_TENS_REPRESENTATION",
      "C3_DECOMPOSITION_EQUIVALENT_EXPRESSION",
      "C4_PARTIAL_PRODUCT_MISSING_DIGIT",
      "C5_MISCONCEPTION_DIAGNOSIS",
    ],
  );
  assert.ok(PATH1_P1_01_DISTINCT_PROMPT_CAPACITY >= 432);
});

test("P1-01 diversity generator supports 120 distinct questions with balanced C0-C5 coverage", () => {
  const result = buildPath1P101DiversityItems({
    count: 120,
    seed: "path1-p1-01-capacity-gate",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.items.length, 120);
  assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, 120);
  assert.equal(result.summary.patternFamilyCount, 6);
  assert.ok(result.summary.distinctPromptCapacity >= 432);
  assert.deepEqual(Object.values(result.summary.familyCounts), [20, 20, 20, 20, 20, 20]);
  for (const entry of result.items) {
    assert.equal(entry.knowledgePointId, PATH1_P1_01_KNOWLEDGE_POINT_ID);
    assert.equal(entry.metadata.canonicalKnowledgePointMinted, false);
    assert.equal(validatePath1P101DiversityItem(entry).ok, true, JSON.stringify(entry));
  }

  const second = buildPath1P101DiversityItems({
    count: 120,
    seed: "path1-p1-01-capacity-gate-second-session",
  });
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  const repeatedPracticeUnion = new Set([
    ...result.items.map((entry) => entry.prompt),
    ...second.items.map((entry) => entry.prompt),
  ]);
  assert.ok(repeatedPracticeUnion.size >= 180, `repeated-practice union=${repeatedPracticeUnion.size}`);
});

test("P1-01 public worksheet materializes 120 distinct printable questions and answers", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-01",
    questionCount: 120,
    generationSeed: "path1-p1-01-public-120",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.questions;
  assert.equal(questions.length, 120);
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 120);
  assert.deepEqual(
    [...new Set(questions.map((question) => question.metadata.path1PatternFamilyId))].sort(),
    PATH1_P1_01_PATTERN_FAMILIES.map((family) => family.familyId).sort(),
  );
  assert.deepEqual(
    Object.values(result.worksheetDocument.report.summary.familyCounts),
    [20, 20, 20, 20, 20, 20],
  );
  assert.equal(result.worksheetDocument.report.summary.diversityProfileId, PATH1_P1_01_DIVERSITY_PROFILE_ID);
  assert.ok(result.worksheetDocument.report.summary.distinctPromptCapacity >= 432);
  assertNonEmptyRenderableBodies(result.worksheetDocument, 120, "P1-01-120");
});

test("P1-01 six-question browser smoke input covers every approved diversity family", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-01",
    questionCount: 6,
    generationSeed: "path1-p1-01-renderable-body-gate",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const { displayModels } = assertNonEmptyRenderableBodies(result.worksheetDocument, 6, "P1-01");
  assert.equal(new Set(result.worksheetDocument.questions.map((question) => question.metadata.path1PatternFamilyId)).size, 6);
  assert.ok(displayModels.some((displayModel) => displayModel.blankedDisplayText.includes("判斷並改正")));
  assert.ok(displayModels.every((displayModel) => String(displayModel.blankedDisplayText ?? "").trim().length > 0));
});

test("P1-02 stays anchored to the two canonical multi-digit-by-one-digit KPs and approved C0-C1 only", () => {
  const block = PATH1_PUBLIC_WORKSHEET_BLOCKS.find((entry) => entry.blockId === "P1-02");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, PATH1_P1_02_KNOWLEDGE_POINT_IDS);
  assert.equal(block.diversityProfileId, PATH1_P1_02_DIVERSITY_PROFILE_ID);
  assert.deepEqual(
    PATH1_P1_02_PATTERN_FAMILIES.map((family) => family.familyId),
    ["C0_DIRECT_MULTI_DIGIT_BY_ONE_DIGIT", "C1_PRODUCT_RELATION_SELECTION"],
  );
  assert.equal(PATH1_P1_02_PATTERN_FAMILIES.some((family) => family.familyId.includes("MISCONCEPTION")), false);
  assert.ok(PATH1_P1_02_DISTINCT_PROMPT_CAPACITY >= 120);
});

test("P1-02 diversity generator supports 120 distinct questions with balanced KP and C0-C1 coverage", () => {
  const result = buildPath1P102DiversityItems({
    count: 120,
    seed: "path1-p1-02-capacity-gate",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.items.length, 120);
  assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, 120);
  assert.equal(result.summary.patternFamilyCount, 2);
  assert.ok(result.summary.distinctPromptCapacity >= 120);
  assert.deepEqual(Object.values(result.summary.familyCounts), [60, 60]);
  assert.deepEqual(Object.values(result.summary.knowledgePointCounts), [60, 60]);
  for (const relationMode of PATH1_P1_02_RELATION_MODES) {
    assert.ok(result.summary.relationModeCounts[relationMode] > 0, relationMode);
  }

  for (const entry of result.items) {
    assert.equal(entry.metadata.canonicalKnowledgePointMinted, false);
    assert.equal(entry.metadata.missingDigitInferenceUsed, false);
    assert.equal(entry.metadata.zeroSpecialCaseRoutedHere, false);
    assert.equal(validatePath1P102DiversityItem(entry).ok, true, JSON.stringify(entry));
    if (entry.metadata.path1PatternFamilyId === "C0_DIRECT_MULTI_DIGIT_BY_ONE_DIGIT") {
      assertP102OperandScope(entry.knowledgePointId, {
        multiplicand: entry.metadata.multiplicand,
        digit: entry.metadata.digit,
        product: entry.metadata.product,
      }, entry.generatedItemId);
    } else {
      assertP102OperandScope(entry.knowledgePointId, entry.metadata.left, `${entry.generatedItemId}:left`);
      assertP102OperandScope(entry.knowledgePointId, entry.metadata.right, `${entry.generatedItemId}:right`);
      assert.ok(PATH1_P1_02_RELATION_MODES.includes(entry.metadata.relationMode));
    }
  }

  const second = buildPath1P102DiversityItems({
    count: 120,
    seed: "path1-p1-02-capacity-gate-second-session",
  });
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  const repeatedPracticeUnion = new Set([
    ...result.items.map((entry) => entry.prompt),
    ...second.items.map((entry) => entry.prompt),
  ]);
  assert.ok(repeatedPracticeUnion.size >= 180, `repeated-practice union=${repeatedPracticeUnion.size}`);
});

test("P1-02 public worksheet materializes 120 distinct printable questions without P1-05 or missing-digit leakage", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-02",
    questionCount: 120,
    generationSeed: "path1-p1-02-public-120",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.questions;
  assert.equal(questions.length, 120);
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 120);
  assert.deepEqual(
    [...new Set(questions.map((question) => question.metadata.path1PatternFamilyId))].sort(),
    PATH1_P1_02_PATTERN_FAMILIES.map((family) => family.familyId).sort(),
  );
  assert.deepEqual(Object.values(result.worksheetDocument.report.summary.familyCounts), [60, 60]);
  assert.equal(result.worksheetDocument.report.summary.diversityProfileId, PATH1_P1_02_DIVERSITY_PROFILE_ID);
  assert.ok(result.worksheetDocument.report.summary.distinctPromptCapacity >= 120);
  assert.equal(questions.some((question) => question.knowledgePointId === "kp_g3a_u03_3digit_zero_middle_by_1digit"), false);
  assert.equal(questions.some((question) => question.knowledgePointId === "kp_g3a_u03_multiplication_missing_digit_inference"), false);
  assert.ok(questions.every((question) => question.metadata.missingDigitInferenceUsed === false));
  assertNonEmptyRenderableBodies(result.worksheetDocument, 120, "P1-02-120");
});

test("P1-02 six-question browser smoke input renders both approved families", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-02",
    questionCount: 6,
    generationSeed: "path1-p1-02-renderable-body-gate",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const { displayModels } = assertNonEmptyRenderableBodies(result.worksheetDocument, 6, "P1-02");
  assert.equal(new Set(result.worksheetDocument.questions.map((question) => question.metadata.path1PatternFamilyId)).size, 2);
  assert.ok(displayModels.some((displayModel) => (
    displayModel.blankedDisplayText.includes("○") || displayModel.blankedDisplayText.includes("相同／不同")
  )));
});

test("P1-09 is a non-KP difficulty expansion with valid four-digit by two-digit division", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-09",
    questionCount: 20,
    generationSeed: "path1-p1-09-focused",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questions.length, 20);
  assert.equal(answerKeyItemCount(result.worksheetDocument), 20);
  const questions = result.worksheetDocument.questions;
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 20);
  for (const question of questions) {
    assert.equal(question.knowledgePointId ?? null, null);
    assert.equal(question.metadata.pathDifficultyExpansionId, "path1_four_digit_by_two_digit_division");
    assert.equal(question.metadata.canonicalKnowledgePointMinted, false);
    assert.equal(question.metadata.invariantPassed, true);
    assert.ok(question.metadata.dividend >= 1000 && question.metadata.dividend <= 9999);
    assert.ok(question.metadata.divisor >= 10 && question.metadata.divisor <= 99);
    assert.ok(question.metadata.remainder >= 0 && question.metadata.remainder < question.metadata.divisor);
  }
  assertNonEmptyRenderableBodies(result.worksheetDocument, 20, "P1-09");
});

test("every Path1 block can materialize a focused printable worksheet with non-empty question and answer bodies", () => {
  for (const block of PATH1_PUBLIC_WORKSHEET_BLOCKS) {
    const questionCount = Math.max(6, block.knowledgePointIds.length);
    const result = buildPath1ManualWorksheet({
      blockId: block.blockId,
      questionCount,
      generationSeed: `path1-all-blocks-${block.blockId}`,
      includeAnswerKey: true,
      printLayout: { paperSize: "A4", columns: 3, rowsPerPage: 5, showQuestionNumbers: true },
    });
    assert.equal(result.ok, true, `${block.blockId}: ${JSON.stringify(result.errors)}`);
    assert.ok(result.worksheetDocument, block.blockId);
    assert.equal(result.worksheetDocument.questions.length, questionCount, block.blockId);
    assert.equal(answerKeyItemCount(result.worksheetDocument), questionCount, block.blockId);
    assertNonEmptyRenderableBodies(result.worksheetDocument, questionCount, block.blockId);
    assert.match(result.worksheetDocument.configSnapshot.title, new RegExp(block.blockId));
    assert.equal(result.worksheetDocument.configSnapshot.metadata.path1BlockId, block.blockId);
    assert.equal(result.worksheetDocument.configSnapshot.metadata.manualProgression, true);
    assert.equal(result.worksheetDocument.configSnapshot.metadata.automaticNPlus1, false);
    assert.equal(result.worksheetDocument.report.summary.questionCount, questionCount, block.blockId);
  }
});

test("Classic page links to Path1 page and Path1 page exposes manual PDF controls", () => {
  const classic = fs.readFileSync("site/index.html", "utf8");
  const page = fs.readFileSync("site/path1/index.html", "utf8");
  assert.match(classic, /href="\.\/path1\/"/);
  for (const id of [
    "path1-block-select",
    "path1-question-count",
    "path1-generate-button",
    "path1-print-button",
    "path1-preview-frame",
  ]) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
  assert.match(page, /P1-00 是入口診斷/);
  assert.match(page, /不使用自動 N→N\+1/);
  assert.match(page, /列印 \/ 另存 PDF/);
});
