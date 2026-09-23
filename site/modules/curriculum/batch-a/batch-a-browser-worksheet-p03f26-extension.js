import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p03f25-extension.js";
import { buildBatchABrowserPlan, requestsP03F26 } from "./batch-a-browser-generator-p03f26.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f26.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f26.js";
import { G4A_U09_P03F26_KP_IDS, G4A_U09_P03F26_SOURCE_ID } from "../registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";

export const P03F26_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice026Implementation",
  status: "bounded_shared_rank8_decimal_connected",
  sourceId: G4A_U09_P03F26_SOURCE_ID,
  knowledgePointCount: 4,
  patternGroupCount: 4,
  patternSpecCount: 5,
  numericPatternSpecCount: 5,
  applicationPatternSpecCount: 0,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});

function representationFor(question) {
  if (question.operation === "compare") return "two_decimal_compare";
  if (question.operation === "sequence") return "decimal_sequence";
  if (question.operation === "missing_digit") return "missing_decimal_column_digit";
  return "decimal_place_value_factor";
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F26(options)) return baseBuild(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return { ok: false, errors: planValidation.errors, warnings: [], worksheetDocument: null, plan, validation: planValidation };
  const generation = generateBatchABrowserQuestions(options);
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!generation.ok || !validation.ok) return { ok: false, errors: [...(generation.errors ?? []), ...(validation.errors ?? [])], warnings: [], worksheetDocument: null, plan, generation, validation };
  const layout = Object.freeze({
    paperSize: options.printLayout?.paperSize ?? "A4",
    columns: Math.min(options.printLayout?.columns ?? 2, 2),
    rowsPerPage: Math.min(options.printLayout?.rowsPerPage ?? 4, 5),
    showQuestionNumbers: options.printLayout?.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && options.printLayout?.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit",
    questionMode: "numeric",
  });
  const models = generation.questions.map((question, index) => Object.freeze({
    questionId: question.id,
    questionNumber: index + 1,
    patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId,
    patternGroupId: question.metadata.patternGroupId,
    questionNumberText: layout.showQuestionNumbers ? `${index + 1}.` : null,
    promptText: question.blankedDisplayText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: question.metadata,
    layoutHints: Object.freeze({ estimatedTextLength: question.blankedDisplayText.length, hasGrouping: false, avoidPageBreakInside: true, representation: representationFor(question), longTextCardPolicy: "avoidSplit" }),
  }));
  const answers = layout.showAnswerKeyPage ? generation.questions.map((question, index) => Object.freeze({
    questionId: question.id,
    questionNumber: index + 1,
    patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId,
    patternGroupId: question.metadata.patternGroupId,
    promptText: question.blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: question.metadata,
    layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: `${representationFor(question)}_answer` }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...layout, columns: 2, rowsPerPage: 5 }) : [];
  const document = Object.freeze({
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `p03f26-g4a-u09-rank8-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "四年級上｜2位小數｜比較、規律與位值推理",
    subtitle: "二位小數比較、數列、直式缺位與相鄰位值",
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({ ...plan, printLayout: layout }),
    orderingMode: plan.ordering,
    questionCount: generation.questions.length,
    questionPages: Object.freeze(questionPages),
    answerKeyPages: Object.freeze(answerKeyPages),
    sections: Object.freeze([]),
    generatedQuestions: Object.freeze(generation.questions),
    questions: Object.freeze(generation.questions),
    questionDisplayModels: Object.freeze(models),
    answerKeyItems: Object.freeze(answers),
    printOptions: Object.freeze({ ...layout, answerKeyColumns: 2, answerKeyRowsPerPage: 5, showAnswerKey: layout.showAnswerKeyPage, answerKeyPlacement: layout.showAnswerKeyPage ? "afterQuestions" : "none" }),
    publicControls: Object.freeze({ sourceId: G4A_U09_P03F26_SOURCE_ID, questionMode: "numeric", productAdmissionTask: P03F26_WORKSHEET_ADAPTER.task, globalContextRegistry: null }),
    metadata: Object.freeze({ sourceId: G4A_U09_P03F26_SOURCE_ID, knowledgePointIds: Object.freeze([...G4A_U09_P03F26_KP_IDS]), applicationExpansion: false, hiddenApplicationLineagePreserved: true, worksheetAdapter: P03F26_WORKSHEET_ADAPTER }),
    batchA: Object.freeze({ sourceId: G4A_U09_P03F26_SOURCE_ID, questionMode: "numeric", selectionMode: plan.selectionMode }),
    report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }),
    summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: generation.questions.length, applicationQuestionCount: 0 }),
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p03f26WorksheetAdapter: P03F26_WORKSHEET_ADAPTER });
}
