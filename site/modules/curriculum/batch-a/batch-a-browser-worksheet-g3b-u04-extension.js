import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-g3b-u04-extension.js";
import { validateBatchABrowserQuestions } from "./batch-a-browser-validator-g3b-u04-extension.js";
import { G3B_U04_HIDDEN_SEMANTIC_MODE } from "./g3b-u04-semantic-question-generator.js";

const DEFAULT_QUESTION_LAYOUT = Object.freeze({
  paperSize: "A4",
  columns: 2,
  rowsPerPage: 4,
  showQuestionNumbers: true,
  longTextCardPolicy: "avoidSplit"
});

const DEFAULT_ANSWER_LAYOUT = Object.freeze({
  paperSize: "A4",
  columns: 1,
  rowsPerPage: 8,
  showQuestionNumbers: true,
  longTextCardPolicy: "avoidSplit"
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function normalizeLayout(layout, fallback) {
  const columns = Number.isInteger(layout?.columns) && layout.columns > 0 ? layout.columns : fallback.columns;
  const rowsPerPage = Number.isInteger(layout?.rowsPerPage) && layout.rowsPerPage > 0
    ? layout.rowsPerPage
    : fallback.rowsPerPage;
  return {
    paperSize: layout?.paperSize ?? fallback.paperSize,
    columns,
    rowsPerPage,
    showQuestionNumbers: layout?.showQuestionNumbers !== false,
    longTextCardPolicy: "avoidSplit"
  };
}

function paginate(items, layout, kind) {
  const pageSize = Math.max(1, layout.columns * layout.rowsPerPage);
  const pages = [];
  for (let offset = 0; offset < items.length; offset += pageSize) {
    const pageItems = items.slice(offset, offset + pageSize);
    pages.push({
      pageNumber: pages.length + 1,
      kind,
      columns: layout.columns,
      rowsPerPage: layout.rowsPerPage,
      itemCount: pageItems.length,
      items: pageItems
    });
  }
  return pages;
}

function displayModel(question, questionNumber, showQuestionNumbers) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    templateFamilyId: question.templateFamilyId,
    questionNumberText: showQuestionNumbers ? `${questionNumber}.` : null,
    promptText: question.promptText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    equationModel: question.equationModel,
    answerText: question.answerText,
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(question.blankedDisplayText ?? "").length,
      hasGrouping: true,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem"
    }
  };
}

function answerKeyItem(question, questionNumber) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    templateFamilyId: question.templateFamilyId,
    promptText: question.blankedDisplayText,
    equationText: question.equationModel,
    answerText: question.answerText,
    eventSequence: cloneValue(question.eventSequence),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(`${question.blankedDisplayText}${question.equationModel}${question.answerText}`).length,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem_answer"
    }
  };
}

export function isG3BU04HiddenSemanticWorksheetOptions(options = {}) {
  return options.sourceId === "g3b_u04_3b04"
    && (options.hiddenSemanticMode === G3B_U04_HIDDEN_SEMANTIC_MODE || options.g3bU04Semantic === true);
}

export function buildG3BU04HiddenSemanticWorksheet(options = {}) {
  if (!isG3BU04HiddenSemanticWorksheetOptions(options)) {
    return {
      ok: false,
      worksheetDocument: null,
      errors: [{
        code: "G3B_U04_SEM_WORKSHEET_MODE_REQUIRED",
        severity: "error",
        path: "hiddenSemanticMode",
        message: "The hidden G3B-U04 semantic worksheet mode was not explicitly requested."
      }],
      warnings: []
    };
  }

  const generation = generateBatchABrowserQuestions({
    ...options,
    hiddenSemanticMode: G3B_U04_HIDDEN_SEMANTIC_MODE
  });
  if (!generation.ok) {
    return {
      ok: false,
      worksheetDocument: null,
      generation,
      errors: generation.errors,
      warnings: generation.warnings
    };
  }

  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!validation.ok) {
    return {
      ok: false,
      worksheetDocument: null,
      generation,
      validation,
      errors: validation.errors,
      warnings: [...generation.warnings, ...validation.warnings]
    };
  }

  const questionLayout = normalizeLayout(options.printLayout, DEFAULT_QUESTION_LAYOUT);
  const answerLayout = normalizeLayout(options.answerKeyLayout, DEFAULT_ANSWER_LAYOUT);
  const questionDisplayModels = generation.questions.map((question, index) => (
    displayModel(question, index + 1, questionLayout.showQuestionNumbers)
  ));
  const answerKeyItems = generation.questions.map((question, index) => answerKeyItem(question, index + 1));
  const questionPages = paginate(questionDisplayModels, questionLayout, "question_sheet");
  const answerKeyPages = generation.plan.includeAnswerKey
    ? paginate(answerKeyItems, answerLayout, "answer_key")
    : [];
  const uniqueKnowledgePointCount = new Set(generation.questions.map((question) => question.knowledgePointId)).size;
  const uniqueTemplateFamilyCount = new Set(generation.questions.map((question) => question.templateFamilyId)).size;

  const worksheetDocument = {
    schemaName: "G3BU04HiddenSemanticWorksheetDocument",
    schemaVersion: 1,
    sourceId: "g3b_u04_3b04",
    unitCode: "3B-U04",
    unitTitle: "兩步驟計算",
    worksheetMode: G3B_U04_HIDDEN_SEMANTIC_MODE,
    visibilityStatus: "hidden",
    selectorStatus: "hidden",
    productionUse: "forbidden",
    publicProjectionChanged: false,
    plan: cloneValue(generation.plan),
    allocation: cloneValue(generation.allocation),
    generatedQuestions: cloneValue(generation.questions),
    questionDisplayModels,
    answerKeyItems: generation.plan.includeAnswerKey ? answerKeyItems : [],
    questionPages,
    answerKeyPages,
    printLayout: questionLayout,
    answerKeyLayout: answerLayout,
    validation,
    summary: {
      questionCount: generation.questions.length,
      answerKeyItemCount: generation.plan.includeAnswerKey ? answerKeyItems.length : 0,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      knowledgePointCount: uniqueKnowledgePointCount,
      templateFamilyCount: uniqueTemplateFamilyCount,
      warningCount: generation.warnings.length + validation.warnings.length,
      errorCount: validation.errors.length
    }
  };

  return {
    ok: true,
    worksheetDocument,
    generation,
    validation,
    errors: [],
    warnings: [...generation.warnings, ...validation.warnings]
  };
}

export function renderG3BU04HiddenSemanticWorksheetText(worksheetDocument = {}) {
  if (worksheetDocument?.schemaName !== "G3BU04HiddenSemanticWorksheetDocument") return "";
  const questionLines = worksheetDocument.questionDisplayModels.map((item) => (
    `${item.questionNumber}. ${item.blankedDisplayText}`
  ));
  const answerLines = worksheetDocument.answerKeyItems.map((item) => (
    `${item.questionNumber}. ${item.equationText} = ${item.answerText}`
  ));
  return [
    `${worksheetDocument.unitCode} ${worksheetDocument.unitTitle}`,
    ...questionLines,
    ...(answerLines.length > 0 ? ["答案", ...answerLines] : [])
  ].join("\n");
}
