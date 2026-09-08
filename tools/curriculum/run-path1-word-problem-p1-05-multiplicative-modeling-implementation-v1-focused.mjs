import assert from "node:assert/strict";

import {
  buildPath1P105MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-generator.js";
import {
  validatePath1P105MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-validator.js";
import {
  buildPath1P105MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-05-zero-special-multiplicative-modeling-worksheet.js";
import {
  buildPath1EqualGroupsTransferItems,
} from "../../site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";
import {
  buildPath1P103MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-generator.js";
import {
  buildPath1P104MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-generator.js";

function countCells(pages, cellType) {
  return (pages ?? []).flatMap((page) => page.cells ?? []).filter((cell) => cell.cellType === cellType).length;
}

const generated = buildPath1P105MultiplicativeModelingItems({
  blockId: "P1-05",
  count: 120,
  seed: "path1-p105-implementation-focused-120",
});
assert.equal(generated.ok, true, JSON.stringify(generated.errors));
assert.equal(generated.items.length, 120);
assert.equal(generated.summary.distinctPromptCount, 120);
assert.deepEqual(Object.values(generated.summary.familyCounts).sort((a, b) => a - b), [30, 30, 30, 30]);
assert.equal(generated.summary.operandPairCapacityBeforeContextProjection, 648);
assert.equal(generated.summary.includesTotalAbove999, true);
assert.equal(generated.summary.includesLowBoundary, true);
assert.equal(generated.summary.includesHighBoundary, true);
assert.ok(generated.items.every((item) => Math.floor(item.amountPerGroup / 10) % 10 === 0));
assert.ok(generated.items.every((item) => Math.floor(item.amountPerGroup / 100) >= 1 && item.amountPerGroup % 10 >= 1));
assert.ok(generated.items.every((item) => item.groupCount >= 2 && item.groupCount <= 9));
assert.ok(generated.items.every((item) => item.totalAmount === item.amountPerGroup * item.groupCount));
assert.ok(generated.items.every((item) => item.metadata.g4bU01ModelingExpanded === false));
assert.ok(generated.items.every((item) => item.metadata.publicCutoverApplied === false));

const validation = validatePath1P105MultiplicativeModelingItems(generated.items);
assert.equal(validation.ok, true, JSON.stringify(validation.errors));

const worksheet = buildPath1P105MultiplicativeModelingWorksheet({
  blockId: "P1-05",
  questionCount: 36,
  generationSeed: "path1-p105-implementation-focused-worksheet",
  includeAnswerKey: true,
});
assert.equal(worksheet.ok, true, JSON.stringify(worksheet.errors));
const worksheetDocument = worksheet.worksheetDocument;
assert.equal(worksheetDocument.questionCount, 36);
assert.equal(worksheetDocument.questions.length, 36);
assert.equal(countCells(worksheetDocument.questionPages, "question"), 36);
assert.equal(countCells(worksheetDocument.answerKeyPages, "answerKey"), 36);
assert.equal(worksheetDocument.configSnapshot.metadata.publicCutoverApplied, false);
assert.equal(worksheetDocument.configSnapshot.metadata.publicBindingReconciled, false);
assert.ok(worksheetDocument.questions.every((entry) => /×/.test(entry.answerText) && /答：/.test(entry.answerText)));

const unsupported = buildPath1P105MultiplicativeModelingItems({ blockId: "P1-06", count: 8, seed: "p105-unsupported" });
assert.equal(unsupported.ok, false);
assert.equal(unsupported.errors[0].code, "PATH1_P105_MODELING_BLOCK_NOT_SUPPORTED");

for (const [label, result] of [
  ["P1-01", buildPath1EqualGroupsTransferItems({ blockId: "P1-01", count: 8, seed: "p105-focused-preserve-p101" })],
  ["P1-02", buildPath1EqualGroupsTransferItems({ blockId: "P1-02", count: 8, seed: "p105-focused-preserve-p102" })],
  ["P1-03", buildPath1P103MultiplicativeModelingItems({ blockId: "P1-03", count: 8, seed: "p105-focused-preserve-p103" })],
  ["P1-04", buildPath1P104MultiplicativeModelingItems({ blockId: "P1-04", count: 8, seed: "p105-focused-preserve-p104" })],
]) assert.equal(result.ok, true, `${label}: ${JSON.stringify(result.errors)}`);

console.log(JSON.stringify({
  taskId: "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1",
  status: "PASS",
  blockId: "P1-05",
  generated: generated.items.length,
  distinctPrompts: generated.summary.distinctPromptCount,
  familyCounts: generated.summary.familyCounts,
  operandPairCapacityBeforeContextProjection: generated.summary.operandPairCapacityBeforeContextProjection,
  includesTotalAbove999: generated.summary.includesTotalAbove999,
  includesLowBoundary: generated.summary.includesLowBoundary,
  includesHighBoundary: generated.summary.includesHighBoundary,
  worksheetQuestions: worksheetDocument.questionCount,
  worksheetAnswers: countCells(worksheetDocument.answerKeyPages, "answerKey"),
  publicCutoverApplied: false,
  publicBindingReconciled: false,
  g4bU01ModelingExpanded: false,
  fullRepositoryRegressionRun: false,
  globalBrowserReplayRun: false,
}, null, 2));
