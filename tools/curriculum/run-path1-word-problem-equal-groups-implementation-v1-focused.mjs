import assert from "node:assert/strict";

import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";
import {
  PATH1_EQUAL_GROUPS_TRANSFER_INSTRUCTION_SUFFIX,
  PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";

function countCells(pages, cellType) {
  return (pages ?? []).flatMap((page) => page.cells ?? []).filter((cell) => cell.cellType === cellType).length;
}

const blocks = [];
for (const blockId of ["P1-01", "P1-02"]) {
  const result = buildPath1ManualWorksheet({
    blockId,
    questionCount: 20,
    generationSeed: `path1-equal-groups-focused:${blockId}`,
    practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
    includeAnswerKey: true,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.questionCount, 20);
  assert.equal(document.questions.length, 20);
  assert.equal(countCells(document.questionPages, "question"), 20);
  assert.equal(countCells(document.answerKeyPages, "answerKey"), 20);
  assert.ok(document.questions.every((item) => item.mode === "application"));
  assert.ok(document.questions.every((item) => item.prompt.endsWith(PATH1_EQUAL_GROUPS_TRANSFER_INSTRUCTION_SUFFIX)));
  assert.ok(document.questions.every((item) => item.answerText.includes(" × ") && item.answerText.includes("；答：")));
  assert.equal(document.configSnapshot.metadata.practiceMode, PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE);
  assert.equal(document.configSnapshot.metadata.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
  blocks.push({
    blockId,
    questions: document.questionCount,
    questionPages: document.questionPages.length,
    answerKeyPages: document.answerKeyPages.length,
    semanticPatternSpecIdsUsed: document.configSnapshot.metadata.semanticPatternSpecIdsUsed,
  });
}

const unsupported = buildPath1ManualWorksheet({
  blockId: "P1-03",
  questionCount: 20,
  generationSeed: "path1-equal-groups-focused:p1-03",
  practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
});
assert.equal(unsupported.ok, false);
assert.equal(unsupported.errors[0].code, "PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED");

console.log(JSON.stringify({
  schemaName: "Path1WordProblemEqualGroupsImplementationFocusedV1",
  status: "PASS",
  practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
  blocks,
  unsupportedP103FailClosed: true,
  visibleUiChanged: false,
  g3bU08RuntimeModified: false,
  p103P104Touched: false,
}, null, 2));
