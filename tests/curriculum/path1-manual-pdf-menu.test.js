import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PATH1_PUBLIC_WORKSHEET_BLOCKS,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";

function answerKeyItemCount(worksheetDocument) {
  return (worksheetDocument.answerKeyPages ?? [])
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "answerKey" && cell.answerKeyItem)
    .length;
}

function assertNonEmptyRenderableBodies(worksheetDocument, expectedCount, label) {
  assert.equal(worksheetDocument.questions.length, expectedCount, `${label}: question count`);
  assert.equal(worksheetDocument.questionDisplayModels.length, expectedCount, `${label}: display-model count`);
  assert.equal(worksheetDocument.answerKeyItems.length, expectedCount, `${label}: answer-item count`);
  for (let index = 0; index < expectedCount; index += 1) {
    const question = worksheetDocument.questions[index];
    const displayModel = worksheetDocument.questionDisplayModels[index];
    const answer = worksheetDocument.answerKeyItems[index];
    assert.ok(String(question?.prompt ?? "").trim().length > 0, `${label}: question ${index + 1} raw prompt empty`);
    assert.ok(String(question?.answerText ?? "").trim().length > 0, `${label}: question ${index + 1} raw answer empty`);
    assert.ok(String(displayModel?.blankedDisplayText ?? "").trim().length > 0, `${label}: question ${index + 1} rendered body empty`);
    assert.ok(String(answer?.answerText ?? "").trim().length > 0, `${label}: answer ${index + 1} rendered body empty`);
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

test("P1-01 projects expression questions into non-empty renderable bodies", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-01",
    questionCount: 6,
    generationSeed: "path1-p1-01-renderable-body-gate",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assertNonEmptyRenderableBodies(result.worksheetDocument, 6, "P1-01");
  assert.match(result.worksheetDocument.questionDisplayModels[0].blankedDisplayText, /×/);
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
