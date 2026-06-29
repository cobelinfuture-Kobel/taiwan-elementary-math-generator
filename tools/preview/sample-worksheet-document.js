export function createSampleWorksheetDocument() {
  return {
    version: "1",
    worksheetKind: "expressionWorksheet",
    configSnapshot: {
      printLayout: {
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 2,
        showQuestionNumbers: true,
        showAnswerKeyPage: true
      }
    },
    generationContext: {
      questionKind: "expression",
      generationMode: "mixedPattern",
      generationSeed: "sample-generation-seed",
      orderingSeed: "sample-ordering-seed",
      resolvedOrderingSeed: "sample-ordering-seed",
      orderingMode: "groupedByPattern"
    },
    orderedQuestionIds: ["q1", "q2", "q3", "q4", "q5"],
    questionDisplayModels: [],
    answerKeyItems: [],
    questionPages: [
      {
        pageNumber: 1,
        pageType: "questions",
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 2,
        cellsPerPage: 4,
        fillerCellCount: 0,
        cells: [
          createQuestionCell(1, "q1", "pattern_add", "1.", "8 + 5 = ___"),
          createQuestionCell(2, "q2", "pattern_sub", "2.", "14 - 6 = ___"),
          createQuestionCell(3, "q3", "pattern_add", "3.", "9 + 7 = ___"),
          createQuestionCell(4, "q4", "pattern_sub", "4.", "13 - 4 = ___")
        ]
      },
      {
        pageNumber: 2,
        pageType: "questions",
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 2,
        cellsPerPage: 4,
        fillerCellCount: 3,
        cells: [
          createQuestionCell(5, "q5", "pattern_mix", "5.", "(8 + 5) - 4 = ___"),
          createFillerCell(1, 0, 1),
          createFillerCell(2, 1, 0),
          createFillerCell(3, 1, 1)
        ]
      }
    ],
    answerKeyPages: [
      {
        pageNumber: 1,
        pageType: "answerKey",
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 2,
        cellsPerPage: 4,
        fillerCellCount: 3,
        cells: [
          createAnswerKeyCell(1, "q1", "pattern_add", "8 + 5 = 13", "13"),
          createFillerCell(1, 0, 1),
          createFillerCell(2, 1, 0),
          createFillerCell(3, 1, 1)
        ]
      }
    ],
    summary: {
      questionCount: 5,
      questionPageCount: 2,
      answerKeyPageCount: 1,
      orderingMode: "groupedByPattern",
      patternIdsInRenderOrder: ["pattern_add", "pattern_sub", "pattern_mix"]
    },
    report: {
      requestedQuestionCount: 5,
      generatedQuestionCount: 5,
      totalAttempts: 5,
      duplicateRejectCount: 0,
      constraintRejectCount: 0,
      patternReports: [],
      validationWarnings: [],
      generationWarnings: []
    }
  };
}

function createQuestionCell(questionNumber, questionId, patternId, questionNumberText, blankedDisplayText) {
  return {
    pageNumber: questionNumber <= 4 ? 1 : 2,
    rowIndex: questionNumber <= 2 ? 0 : questionNumber === 5 ? 0 : 1,
    columnIndex: (questionNumber - 1) % 2,
    cellIndex: questionNumber <= 4 ? questionNumber - 1 : 0,
    cellType: "question",
    questionId,
    questionNumber,
    displayModel: {
      questionId,
      questionNumber,
      patternId,
      displayText: blankedDisplayText.replace("___", String(resolveAnswer(blankedDisplayText))),
      blankedDisplayText,
      answerText: String(resolveAnswer(blankedDisplayText)),
      questionNumberText,
      metadataSnapshot: {
        patternId,
        patternTags: [patternId],
        skillTags: [],
        difficultyTags: [],
        curriculumNodeIds: [],
        canonicalSkillIds: [],
        precedenceMode: "standard",
        parenthesesMode: blankedDisplayText.includes("(") ? "required" : "none",
        blankTarget: { type: "finalAnswer" },
        duplicateKey: `${questionId}-dup`
      },
      layoutHints: {
        operandCount: blankedDisplayText.includes("(") ? 3 : 2,
        operatorCount: blankedDisplayText.includes("(") ? 2 : 1,
        estimatedTextLength: blankedDisplayText.length,
        hasGrouping: blankedDisplayText.includes("(")
      }
    },
    answerKeyItem: null
  };
}

function createAnswerKeyCell(questionNumber, questionId, patternId, promptText, answerText) {
  return {
    pageNumber: 1,
    rowIndex: 0,
    columnIndex: 0,
    cellIndex: 0,
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
        patternTags: [patternId],
        skillTags: [],
        difficultyTags: [],
        curriculumNodeIds: [],
        canonicalSkillIds: [],
        precedenceMode: "standard",
        parenthesesMode: "none",
        blankTarget: { type: "finalAnswer" },
        duplicateKey: `${questionId}-dup`
      }
    }
  };
}

function createFillerCell(cellIndex, rowIndex, columnIndex) {
  return {
    pageNumber: 1,
    rowIndex,
    columnIndex,
    cellIndex,
    cellType: "filler",
    questionId: null,
    questionNumber: null,
    displayModel: null,
    answerKeyItem: null
  };
}

function resolveAnswer(blankedDisplayText) {
  const table = new Map([
    ["8 + 5 = ___", 13],
    ["14 - 6 = ___", 8],
    ["9 + 7 = ___", 16],
    ["13 - 4 = ___", 9],
    ["(8 + 5) - 4 = ___", 9]
  ]);
  return table.get(blankedDisplayText) ?? "";
}
