import assert from "node:assert/strict";

import {
  buildPath1P112InverseEqualGroupsWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-12-inverse-equal-groups-worksheet.js";
import {
  PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-p1-12-inverse-equal-groups-generator.js";
import {
  buildPath1EqualGroupsTransferItems,
  PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";

function countCells(pages, cellType) {
  return (pages ?? []).flatMap((page) => page.cells ?? []).filter((cell) => cell.cellType === cellType).length;
}

const result = buildPath1P112InverseEqualGroupsWorksheet({
  questionCount: 36,
  generationSeed: "path1-p112-inverse-focused",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
});
assert.equal(result.ok, true, JSON.stringify(result.errors));
const document = result.worksheetDocument;
assert.equal(document.questionCount, 36);
assert.equal(document.questions.length, 36);
assert.equal(countCells(document.questionPages, "question"), 36);
assert.equal(countCells(document.answerKeyPages, "answerKey"), 36);
assert.equal(document.configSnapshot.metadata.practiceMode, PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE);
assert.equal(document.configSnapshot.metadata.publicCutoverApplied, false);
assert.deepEqual(new Set(document.configSnapshot.metadata.unknownRolesUsed), new Set(["totalAmount", "groupCount", "amountPerGroup"]));
assert.equal(document.configSnapshot.metadata.semanticPatternSpecIdsUsed.length, 12);
assert.ok(document.questions.every((item) => item.mode === "application"));
assert.ok(document.questions.every((item) => item.answerText.includes("；答：")));

const byRole = new Map();
for (const question of document.questions) {
  if (!byRole.has(question.unknownRole)) byRole.set(question.unknownRole, []);
  byRole.get(question.unknownRole).push(question);
}
assert.equal(byRole.size, 3);
for (const question of byRole.get("totalAmount")) {
  assert.equal(question.totalAmount, question.amountPerGroup * question.groupCount);
  assert.equal(question.finalAnswer, question.totalAmount);
  assert.equal(question.equationModel, `${question.amountPerGroup} × ${question.groupCount} = ${question.totalAmount}`);
}
for (const question of byRole.get("groupCount")) {
  assert.equal(question.totalAmount % question.amountPerGroup, 0);
  assert.equal(question.finalAnswer, question.groupCount);
  assert.equal(question.equationModel, `${question.totalAmount} ÷ ${question.amountPerGroup} = ${question.groupCount}`);
}
for (const question of byRole.get("amountPerGroup")) {
  assert.equal(question.totalAmount % question.groupCount, 0);
  assert.equal(question.finalAnswer, question.amountPerGroup);
  assert.equal(question.equationModel, `${question.totalAmount} ÷ ${question.groupCount} = ${question.amountPerGroup}`);
}

const unsupported = buildPath1P112InverseEqualGroupsWorksheet({
  blockId: "P1-03",
  questionCount: 12,
  generationSeed: "path1-p112-inverse-focused:unsupported",
});
assert.equal(unsupported.ok, false);
assert.equal(unsupported.errors[0].code, "PATH1_P112_INVERSE_MODE_BLOCK_NOT_SUPPORTED");

const earlyP101 = buildPath1EqualGroupsTransferItems({
  blockId: "P1-01",
  count: 12,
  seed: "path1-p112-inverse-focused:early-p101",
  practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
});
assert.equal(earlyP101.ok, true, JSON.stringify(earlyP101.errors));
assert.ok(earlyP101.items.every((item) => item.unknownRole === "totalAmount"));

console.log(JSON.stringify({
  schemaName: "Path1WordProblemP112InverseEqualGroupsImplementationFocusedV1",
  status: "PASS",
  blockId: "P1-12",
  practiceMode: PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
  questions: document.questionCount,
  questionPages: document.questionPages.length,
  answerKeyPages: document.answerKeyPages.length,
  unknownRolesUsed: document.configSnapshot.metadata.unknownRolesUsed,
  semanticPatternSpecIdsUsed: document.configSnapshot.metadata.semanticPatternSpecIdsUsed,
  unsupportedP103FailClosed: true,
  earlyP101TransferPreserved: true,
  publicCutoverApplied: false,
  visibleUiChanged: false,
  fullRegressionRun: false,
  globalReplayRun: false,
}, null, 2));
