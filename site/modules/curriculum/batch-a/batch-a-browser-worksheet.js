import {
  createAnswerKeyItem,
  createQuestionDisplayModel,
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "../../core/index.js";
import { generateBatchABrowserQuestions } from "./g3a-u06-division-generator.js";
import { validateBatchABrowserQuestions } from "./batch-a-browser-validator.js";
import { BATCH_A_BROWSER_SCOPE } from "./production-eligibility.js";

const DEFAULT_PRINT_LAYOUT = Object.freeze({
  paperSize: "A4",
  columns: 4,
  rowsPerPage: 10,
  showQuestionNumbers: true,
  showAnswerKeyPage: true
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function isTextDisplayQuestion(question) {
  return typeof question?.blankedDisplayText === "string" && typeof question?.answerText === "string";
}

function displayModelForTextQuestion(question, questionNumber, showQuestionNumbers = true) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    answerText: question.answerText,
    questionNumberText: showQuestionNumbers === false ? null : `${questionNumber}.`,
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: question.displayText.length,
      hasGrouping: false
    }
  };
}

function answerKeyItemForTextQuestion(question, displayModel) {
  return {
    questionId: question.id,
    questionNumber: displayModel.questionNumber,
    patternId: question.patternSpecId,
    promptText: displayModel.blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: cloneValue(question.metadata)
  };
}

function createDisplayModels(questions, printLayout) {
  return questions.map((question, index) => {
    const questionNumber = index + 1;
    return isTextDisplayQuestion(question)
      ? displayModelForTextQuestion(question, questionNumber, printLayout.showQuestionNumbers)
      : createQuestionDisplayModel(question, questionNumber, { showQuestionNumbers: printLayout.showQuestionNumbers });
  });
}

function createAnswerKeyItems(questions, displayModels) {
  return questions.map((question, index) => isTextDisplayQuestion(question)
    ? answerKeyItemForTextQuestion(question, displayModels[index])
    : createAnswerKeyItem(question, displayModels[index]));
}

function createGenerationReport({ plan, allocation, questions, errors, warnings }) {
  return {
    requestedQuestionCount: plan.questionCount,
    generatedQuestionCount: questions.length,
    totalAttempts: questions.length,
    duplicateRejectCount: 0,
    constraintRejectCount: 0,
    patternReports: allocation.map((entry) => ({
      patternId: entry.patternSpecId,
      requestedQuestionCount: entry.questionCount,
      generatedQuestionCount: questions.filter((question) => question?.metadata?.patternId === entry.patternSpecId).length,
      failureCount: 0,
      warnings: []
    })),
    validationWarnings: warnings,
    generationWarnings: warnings,
    errors
  };
}

function createWorksheetTitle(options, plan) {
  if (plan.worksheetMode === "batchAKnowledgePoint") {
    return options.title ?? `Batch A ${plan.sourceUnit?.unitCode ?? ""} 知識點加強`.trim();
  }
  return options.title ?? `Batch A ${plan.sourceUnit?.unitCode ?? ""} ${plan.sourceUnit?.title ?? "數學練習卷"}`.trim();
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const generated = generateBatchABrowserQuestions(options);
  if (!generated.ok) {
    return {
      ok: false,
      worksheetDocument: null,
      validation: { ok: false, errors: generated.errors, warnings: generated.warnings, infos: [], validatorVersion: "s42b10-batch-a-browser-worksheet-v1", validatedAt: null },
      errors: generated.errors,
      warnings: generated.warnings
    };
  }

  const printLayout = {
    ...DEFAULT_PRINT_LAYOUT,
    ...(options.printLayout ?? {}),
    showAnswerKeyPage: options.includeAnswerKey !== false
  };
  const validation = validateBatchABrowserQuestions(generated.questions);
  if (!validation.ok) {
    return { ok: false, worksheetDocument: null, validation, errors: validation.errors, warnings: validation.warnings };
  }

  const questionDisplayModels = createDisplayModels(generated.questions, printLayout);
  const answerKeyItems = printLayout.showAnswerKeyPage ? createAnswerKeyItems(generated.questions, questionDisplayModels) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answerKeyItems, printLayout) : [];
  const plan = generated.plan;
  const title = createWorksheetTitle(options, plan);
  const generationMode = plan.worksheetMode === "batchAKnowledgePoint" ? "batchAKnowledgePoint" : "batchASourceId";

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-a-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title,
    subtitle: plan.worksheetMode === "batchAKnowledgePoint" ? "Batch A visible KnowledgePoint browser worksheet bridge" : "Batch A sourceId browser worksheet bridge",
    locale: "zh-Hant",
    generatedAt: null,
    curriculumInfo: {
      publisher: "Batch A",
      grade: plan.sourceUnit?.grade ?? null,
      semester: plan.sourceUnit?.semester ?? null,
      unitNumber: plan.sourceUnit?.unitCode ?? null,
      unitTitle: plan.sourceUnit?.title ?? null,
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: []
    },
    studentFields: {
      showName: true,
      showDate: true,
      showClass: false,
      showScore: false,
      labels: { name: "姓名", date: "日期", className: "班級", score: "分數" }
    },
    printOptions: {
      paperSize: printLayout.paperSize,
      orientation: "portrait",
      columns: printLayout.columns,
      rowsPerPage: printLayout.rowsPerPage,
      fontSizeMode: "normal",
      showQuestionNumbers: printLayout.showQuestionNumbers,
      showAnswerKey: printLayout.showAnswerKeyPage,
      answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none",
      pageBreakMode: "fixedGrid",
      marginMode: "default",
      debugDataAttributes: false
    },
    validationSummary: validation,
    batchA: {
      sourceId: plan.sourceId,
      selectionMode: plan.selectionMode,
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      patternSpecIds: [...plan.patternSpecIds],
      allocation: cloneValue(generated.allocation)
    },
    provenance: {
      sourceType: "batch_a_browser_bridge",
      sourceTaskIds: ["S42B10_CreateBatchASiteBridgeFiles", "S43C13_G3AU02_HTMLSingleVisibleKPEnablement", "S43G5B_G3AU03MultiplicationGeneratorQualityFix", "S44_G3AU06DivisionKPMappingFix"],
      patternSpecIds: [...plan.patternSpecIds],
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      productionStorageCategory: "none",
      notes: [BATCH_A_BROWSER_SCOPE.limit]
    },
    sections: [{
      sectionId: `section-${plan.sourceId}`,
      title: plan.worksheetMode === "batchAKnowledgePoint" ? "知識點加強" : (plan.sourceUnit?.title ?? plan.sourceId),
      description: null,
      patternIds: [...plan.patternSpecIds],
      questionIds: generated.questions.map((question) => question.id),
      orderingIndex: 0
    }],
    configSnapshot: {
      schemaVersion: "s42b10.batch_a.browser_worksheet_plan.v1",
      sourceId: plan.sourceId,
      questionCount: plan.questionCount,
      ordering: plan.ordering,
      includeAnswerKey: printLayout.showAnswerKeyPage,
      generationSeed: plan.generationSeed,
      selectionMode: plan.selectionMode,
      selectedKnowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      selectedPatternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      printLayout
    },
    generationContext: {
      questionKind: "batchAWorksheet",
      generationMode,
      questionCount: generated.questions.length,
      generationSeed: plan.generationSeed,
      orderingSeed: plan.generationSeed,
      resolvedOrderingSeed: plan.generationSeed,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: [...plan.patternSpecIds]
    },
    allocationResult: cloneValue(generated.allocation),
    generatedQuestions: cloneValue(generated.questions),
    orderedQuestionIds: generated.questions.map((question) => question.id),
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    summary: {
      questionCount: generated.questions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: [...plan.patternSpecIds]
    },
    generationReport: createGenerationReport({ plan, allocation: generated.allocation, questions: generated.questions, errors: generated.errors, warnings: generated.warnings })
  };

  return { ok: true, worksheetDocument, validation, errors: [], warnings: validation.warnings };
}
