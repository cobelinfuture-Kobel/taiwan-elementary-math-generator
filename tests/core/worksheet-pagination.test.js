import test from "node:test";
import assert from "node:assert/strict";

import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "../../src/core/worksheet-pagination.js";

function createDisplayModel(questionNumber) {
  return {
    questionId: `q${questionNumber}`,
    questionNumber,
    patternId: "pattern_a",
    displayText: `${questionNumber} + 1 = ${questionNumber + 1}`,
    blankedDisplayText: `${questionNumber} + 1 = ___`,
    answerText: String(questionNumber + 1),
    questionNumberText: `${questionNumber}.`,
    metadataSnapshot: {
      patternId: "pattern_a",
      patternTags: [],
      skillTags: [],
      difficultyTags: [],
      curriculumNodeIds: [],
      canonicalSkillIds: [],
      precedenceMode: null,
      parenthesesMode: null,
      blankTarget: { type: "finalAnswer" },
      duplicateKey: `dup-${questionNumber}`
    },
    layoutHints: {
      operandCount: 2,
      operatorCount: 1,
      estimatedTextLength: 10,
      hasGrouping: false
    }
  };
}

function createAnswerKeyItem(questionNumber) {
  return {
    questionId: `q${questionNumber}`,
    questionNumber,
    patternId: "pattern_a",
    promptText: `${questionNumber} + 1 = ${questionNumber + 1}`,
    answerText: String(questionNumber + 1),
    metadataSnapshot: {
      patternId: "pattern_a",
      patternTags: [],
      skillTags: [],
      difficultyTags: [],
      curriculumNodeIds: [],
      canonicalSkillIds: [],
      precedenceMode: null,
      parenthesesMode: null,
      blankTarget: { type: "finalAnswer" },
      duplicateKey: `dup-${questionNumber}`
    }
  };
}

test("question pages paginate row-major", () => {
  const pages = paginateQuestionDisplayModels(
    [createDisplayModel(1), createDisplayModel(2), createDisplayModel(3)],
    { paperSize: "A4", columns: 2, rowsPerPage: 1, showAnswerKeyPage: true }
  );

  assert.equal(pages.length, 2);
  assert.equal(pages[0].cells[0].questionId, "q1");
  assert.equal(pages[0].cells[0].rowIndex, 0);
  assert.equal(pages[0].cells[0].columnIndex, 0);
  assert.equal(pages[0].cells[1].questionId, "q2");
  assert.equal(pages[1].cells[0].questionId, "q3");
});

test("cells.length equals columns times rowsPerPage", () => {
  const pages = paginateQuestionDisplayModels(
    [createDisplayModel(1)],
    { paperSize: "A4", columns: 3, rowsPerPage: 2, showAnswerKeyPage: true }
  );

  assert.equal(pages[0].cells.length, 6);
  assert.equal(pages[0].cellsPerPage, 6);
});

test("filler cells are explicit and null-backed", () => {
  const pages = paginateQuestionDisplayModels(
    [createDisplayModel(1)],
    { paperSize: "A4", columns: 2, rowsPerPage: 1, showAnswerKeyPage: true }
  );

  assert.equal(pages[0].fillerCellCount, 1);
  assert.deepEqual(pages[0].cells[1], {
    pageNumber: 1,
    rowIndex: 0,
    columnIndex: 1,
    cellIndex: 1,
    cellType: "filler",
    questionId: null,
    questionNumber: null,
    displayModel: null,
    answerKeyItem: null
  });
});

test("answer-key pages paginate independently", () => {
  const pages = paginateAnswerKeyItems(
    [
      createAnswerKeyItem(1),
      createAnswerKeyItem(2),
      createAnswerKeyItem(3)
    ],
    { paperSize: "A4", columns: 2, rowsPerPage: 1, showAnswerKeyPage: true }
  );

  assert.equal(pages.length, 2);
  assert.equal(pages[0].pageType, "answerKey");
  assert.equal(pages[0].cells[0].answerKeyItem.questionId, "q1");
  assert.equal(pages[1].cells[0].answerKeyItem.questionId, "q3");
});

test("answerKeyPages are empty when showAnswerKeyPage is false", () => {
  const pages = paginateAnswerKeyItems(
    [createAnswerKeyItem(1)],
    { paperSize: "A4", columns: 2, rowsPerPage: 1, showAnswerKeyPage: false }
  );

  assert.deepEqual(pages, []);
});
