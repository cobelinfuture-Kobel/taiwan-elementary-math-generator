import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBase } from "./batch-a-browser-worksheet-p03f16-extension.js";
import { buildBatchABrowserPlan, requestsP03F17 } from "./batch-a-browser-generator-p03f17.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f17.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f17.js";
import { G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID } from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";

export const P03F17_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice017Implementation",
  status: "bounded_shared_fraction_classification_worksheet_adapter_connected",
  sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  knowledgePointCount: 1,
  patternSpecCount: 3,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});
const failed = (errors, warnings = [], details = {}) => Object.freeze({ ok: false, errors: Object.freeze([...(errors ?? [])]), warnings: Object.freeze([...(warnings ?? [])]), worksheetDocument: null, ...details });

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F17(options)) return buildBase(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return failed(planValidation.errors, planValidation.warnings, { plan, validation: planValidation });
  const generation = generateBatchABrowserQuestions(options);
  if (!generation.ok) return failed(generation.errors, generation.warnings, { plan, generation });
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!validation.ok) return failed(validation.errors, validation.warnings, { plan, generation, validation });

  const requested = options.printLayout ?? {};
  const printLayout = Object.freeze({
    paperSize: requested.paperSize ?? "A4",
    columns: Math.min(Number.isInteger(requested.columns) ? requested.columns : 2, 2),
    rowsPerPage: Math.min(Number.isInteger(requested.rowsPerPage) ? requested.rowsPerPage : 6, 6),
    showQuestionNumbers: requested.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit",
    questionMode: "numeric",
  });
  const models = generation.questions.map((question, index) => Object.freeze({
    questionId: question.id,
    questionNumber: index + 1,
    patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId,
    patternGroupId: question.metadata.patternGroupId,
    questionNumberText: printLayout.showQuestionNumbers ? `${index + 1}.` : null,
    promptText: question.blankedDisplayText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: Object.freeze({ ...question.metadata }),
    layoutHints: Object.freeze({ estimatedTextLength: String(question.blankedDisplayText).length, hasGrouping: false, avoidPageBreakInside: true, representation: "fraction_type_classification", longTextCardPolicy: "avoidSplit" }),
  }));
  const answers = printLayout.showAnswerKeyPage ? generation.questions.map((question, index) => Object.freeze({
    questionId: question.id,
    questionNumber: index + 1,
    patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId,
    patternGroupId: question.metadata.patternGroupId,
    promptText: models[index].blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: models[index].metadataSnapshot,
    layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: "fraction_type_classification_answer" }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...printLayout, columns: 2, rowsPerPage: 6 }) : [];
  const knowledgePointIds = [...new Set(generation.questions.map((question) => question.metadata.knowledgePointId))];
  const document = Object.freeze({
    schemaVersion: "worksheet-document-v1", version: "1",
    worksheetId: `p03f17-fraction-classification-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "四年級｜假分數與帶分數｜分數分類",
    subtitle: "依分子、分母與整數部分辨認真分數、假分數與帶分數",
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({ ...plan, printLayout }),
    orderingMode: plan.ordering,
    questionCount: generation.questions.length,
    questionPages: Object.freeze(questionPages), answerKeyPages: Object.freeze(answerKeyPages), sections: Object.freeze([]),
    generatedQuestions: Object.freeze(generation.questions), questions: Object.freeze(generation.questions),
    questionDisplayModels: Object.freeze(models), answerKeyItems: Object.freeze(answers),
    printOptions: Object.freeze({ ...printLayout, answerKeyColumns: 2, answerKeyRowsPerPage: 6, showAnswerKey: printLayout.showAnswerKeyPage, answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none" }),
    publicControls: Object.freeze({ sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID, questionMode: "numeric", productAdmissionTask: P03F17_WORKSHEET_ADAPTER.task, globalContextRegistry: null }),
    metadata: Object.freeze({ sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID, knowledgePointIds: Object.freeze(knowledgePointIds), applicationExpansion: false, worksheetAdapter: P03F17_WORKSHEET_ADAPTER }),
    batchA: Object.freeze({ sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID, questionMode: "numeric", selectionMode: plan.selectionMode }),
    report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }),
    summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: generation.questions.length, applicationQuestionCount: 0 }),
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p03f17WorksheetAdapter: P03F17_WORKSHEET_ADAPTER });
}
