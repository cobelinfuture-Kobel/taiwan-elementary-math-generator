import test from "node:test";
import assert from "node:assert/strict";

import {
  renderAnswerKeyPage,
  renderQuestionPage,
  renderWorksheetDocumentToHtml
} from "../../src/renderer/html-renderer.js";

function createQuestionCell({
  questionId,
  questionNumber,
  questionNumberText,
  blankedDisplayText,
  patternId = "pattern_a",
  cellIndex
}) {
  return {
    pageNumber: 1,
    rowIndex: 0,
    columnIndex: cellIndex,
    cellIndex,
    cellType: "question",
    questionId,
    questionNumber,
    displayModel: {
      questionId,
      questionNumber,
      patternId,
      displayText: `${blankedDisplayText.replace("___", "42")}`,
      blankedDisplayText,
      answerText: "42",
      questionNumberText,
      metadataSnapshot: {
        patternId,
        patternTags: [],
        skillTags: [],
        difficultyTags: [],
        curriculumNodeIds: [],
        canonicalSkillIds: [],
        precedenceMode: null,
        parenthesesMode: null,
        blankTarget: { type: "finalAnswer" },
        duplicateKey: `dup-${questionId}`
      },
      layoutHints: {
        operandCount: 2,
        operatorCount: 1,
        estimatedTextLength: blankedDisplayText.length,
        hasGrouping: false
      }
    },
    answerKeyItem: null
  };
}

function createAnswerKeyCell({
  questionId,
  questionNumber,
  promptText,
  answerText,
  patternId = "pattern_a",
  cellIndex
}) {
  return {
    pageNumber: 1,
    rowIndex: 0,
    columnIndex: cellIndex,
    cellIndex,
    cellType: "answerKey",
    questionId,
    questionNumber,
    displayModel: null,
    answerKeyItem: {
      questionId,
      questionNumber,
      patternId,
      promptText,
      answerText,
      metadataSnapshot: {
        patternId,
        patternTags: [],
        skillTags: [],
        difficultyTags: [],
        curriculumNodeIds: [],
        canonicalSkillIds: [],
        precedenceMode: null,
        parenthesesMode: null,
        blankTarget: { type: "finalAnswer" },
        duplicateKey: `dup-${questionId}`
      }
    }
  };
}

function createFillerCell(cellIndex) {
  return {
    pageNumber: 1,
    rowIndex: 0,
    columnIndex: cellIndex,
    cellIndex,
    cellType: "filler",
    questionId: null,
    questionNumber: null,
    displayModel: null,
    answerKeyItem: null
  };
}

function createPage(pageNumber, pageType, cells, columns = 2) {
  return {
    pageNumber,
    pageType,
    paperSize: "A4",
    columns,
    rowsPerPage: 1,
    cellsPerPage: cells.length + 99,
    cells,
    fillerCellCount: cells.filter((cell) => cell.cellType === "filler").length
  };
}

function createWorksheetDocument(overrides = {}) {
  return {
    version: "1",
    worksheetKind: "expressionWorksheet",
    configSnapshot: {
      printLayout: {
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 1,
        showQuestionNumbers: true,
        showAnswerKeyPage: true
      }
    },
    generationContext: {
      questionKind: "expression",
      generationMode: "mixedPattern",
      generationSeed: "gen-seed",
      orderingSeed: "order-seed",
      resolvedOrderingSeed: "order-seed",
      orderingMode: "groupedByPattern"
    },
    orderedQuestionIds: ["q1", "q2"],
    questionPages: [
      createPage(1, "questions", [
        createQuestionCell({
          questionId: "q1",
          questionNumber: 1,
          questionNumberText: "A-1",
          blankedDisplayText: "8 + 5 = ___",
          cellIndex: 0
        }),
        createFillerCell(1)
      ]),
      createPage(2, "questions", [
        createQuestionCell({
          questionId: "q2",
          questionNumber: 2,
          questionNumberText: "B-2",
          blankedDisplayText: "9 - 2 = ___",
          patternId: "pattern_b",
          cellIndex: 0
        }),
        createQuestionCell({
          questionId: "q3",
          questionNumber: 3,
          questionNumberText: "C-3",
          blankedDisplayText: "4 + 4 = ___",
          patternId: "pattern_c",
          cellIndex: 1
        })
      ])
    ],
    answerKeyPages: [
      createPage(1, "answerKey", [
        createAnswerKeyCell({
          questionId: "q1",
          questionNumber: 1,
          promptText: "8 + 5 = 13",
          answerText: "13",
          cellIndex: 0
        }),
        createFillerCell(1)
      ])
    ],
    summary: {
      questionCount: 3,
      questionPageCount: 2,
      answerKeyPageCount: 1,
      orderingMode: "groupedByPattern",
      patternIdsInRenderOrder: ["pattern_a", "pattern_b", "pattern_c"]
    },
    report: { requestedQuestionCount: 3 },
    ...overrides
  };
}

test("renders one page container per question page", () => {
  const html = renderWorksheetDocumentToHtml(createWorksheetDocument());
  assert.equal((html.match(/worksheet-page worksheet-page--questions print-page/g) ?? []).length, 2);
});

test("renders one page container per answer-key page when present", () => {
  const html = renderWorksheetDocumentToHtml(createWorksheetDocument());
  assert.equal((html.match(/worksheet-page worksheet-page--answer-key print-page/g) ?? []).length, 1);
});

test("does not render answer-key section when answerKeyPages is empty", () => {
  const html = renderWorksheetDocumentToHtml(createWorksheetDocument({ answerKeyPages: [] }));
  assert.equal(html.includes("worksheet-section--answer-key"), false);
});

test("renders question cells using blankedDisplayText", () => {
  const html = renderQuestionPage(createWorksheetDocument().questionPages[0]);
  assert.equal(html.includes("8 + 5 = ___"), true);
  assert.equal(html.includes("8 + 5 = 13"), false);
});

test("renders answer-key cells using promptText and answerText", () => {
  const html = renderAnswerKeyPage(createWorksheetDocument().answerKeyPages[0]);
  assert.equal(html.includes("8 + 5 = 13"), true);
  assert.equal(html.includes(">13<"), true);
});

test("renders filler cells as empty structural cells", () => {
  const html = renderQuestionPage(createWorksheetDocument().questionPages[0]);
  assert.equal(html.includes('worksheet-cell worksheet-cell--filler'), true);
  assert.equal(html.includes('worksheet-cell worksheet-cell--filler" data-cell-index="1"></div>'), false);
  assert.match(html, /<div class="worksheet-cell worksheet-cell--filler"[^>]*><\/div>/);
});

test("preserves cell order exactly as page.cells order", () => {
  const page = createPage(1, "questions", [
    createQuestionCell({
      questionId: "q2",
      questionNumber: 2,
      questionNumberText: "two",
      blankedDisplayText: "second = ___",
      cellIndex: 1
    }),
    createQuestionCell({
      questionId: "q1",
      questionNumber: 1,
      questionNumberText: "one",
      blankedDisplayText: "first = ___",
      cellIndex: 0
    })
  ]);

  const html = renderQuestionPage(page);
  assert.equal(html.indexOf("second = ___") < html.indexOf("first = ___"), true);
});

test("preserves questionNumberText exactly", () => {
  const html = renderQuestionPage(createWorksheetDocument().questionPages[0]);
  assert.equal(html.includes(">A-1<"), true);
});

test("does not mutate WorksheetDocument", () => {
  const document = createWorksheetDocument();
  const before = JSON.parse(JSON.stringify(document));

  renderWorksheetDocumentToHtml(document);

  assert.deepEqual(document, before);
});

test("does not require generatedQuestions as renderer input", () => {
  const document = createWorksheetDocument();
  delete document.generatedQuestions;

  const html = renderWorksheetDocumentToHtml(document);
  assert.equal(html.includes("worksheet-document"), true);
});

test("emits safe data attributes mirroring page cell and question metadata", () => {
  const html = renderWorksheetDocumentToHtml(createWorksheetDocument());
  assert.equal(html.includes('data-page-number="1"'), true);
  assert.equal(html.includes('data-page-type="questions"'), true);
  assert.equal(html.includes('data-cell-index="0"'), true);
  assert.equal(html.includes('data-question-id="q1"'), true);
  assert.equal(html.includes('data-question-number="1"'), true);
  assert.equal(html.includes('data-pattern-id="pattern_a"'), true);
});

test("does not compute or alter cellsPerPage in renderer path", () => {
  const document = createWorksheetDocument({
    questionPages: [
      createPage(1, "questions", [
        createQuestionCell({
          questionId: "q1",
          questionNumber: 1,
          questionNumberText: "one",
          blankedDisplayText: "only = ___",
          cellIndex: 0
        })
      ])
    ]
  });

  const html = renderWorksheetDocumentToHtml(document);
  assert.equal(html.includes("only = ___"), true);
  assert.equal((html.match(/worksheet-cell--question/g) ?? []).length, 1);
});
