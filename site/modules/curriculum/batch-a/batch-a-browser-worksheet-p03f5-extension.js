import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet-p03f4-extension.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f5.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f5.js";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_KP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
} from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";

export const P03F5_EQUIVALENT_FRACTION_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice005Implementation",
  status: "bounded_shared_worksheet_adapter_connected",
  sourceId: G4B_U08_SOURCE_ID,
  patternSpecCount: 3,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});

function printLayout(options = {}) {
  const requested = options.printLayout ?? {};
  return Object.freeze({
    paperSize: requested.paperSize ?? "A4",
    columns: Math.min(Number.isInteger(requested.columns) ? requested.columns : 2, 2),
    rowsPerPage: Math.min(Number.isInteger(requested.rowsPerPage) ? requested.rowsPerPage : 5, 5),
    showQuestionNumbers: requested.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit",
  });
}
function displayModel(question, index, showQuestionNumbers) {
  const promptText = question.blankedDisplayText ?? question.promptText ?? "";
  return Object.freeze({
    questionId: question.id,
    questionNumber: index + 1,
    patternId: question.patternSpecId,
    knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID,
    patternGroupId: G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
    questionNumberText: showQuestionNumbers ? `${index + 1}.` : null,
    promptText,
    displayText: question.displayText ?? `${promptText} ${question.answerText}`,
    blankedDisplayText: promptText,
    answerText: question.answerText,
    metadataSnapshot: Object.freeze({ ...(question.metadata ?? {}) }),
    layoutHints: Object.freeze({
      estimatedTextLength: String(promptText).length,
      hasGrouping: false,
      avoidPageBreakInside: true,
      representation: "equivalent_fraction_numeric",
      longTextCardPolicy: "avoidSplit",
    }),
  });
}
function answerKeyItem(question, model) {
  return Object.freeze({
    questionId: question.id,
    questionNumber: model.questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID,
    patternGroupId: G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
    promptText: model.blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: model.metadataSnapshot,
    layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: "equivalent_fraction_numeric_answer" }),
  });
}
function failed(errors, warnings = [], details = {}) {
  return Object.freeze({ ok: false, errors: Object.freeze([...(errors ?? [])]), warnings: Object.freeze([...(warnings ?? [])]), worksheetDocument: null, ...details });
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (options.sourceId !== G4B_U08_SOURCE_ID) return buildBaseBatchABrowserWorksheetDocument(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return failed(planValidation.errors, planValidation.warnings, { plan, validation: planValidation });
  const generation = generateBatchABrowserQuestions(options);
  if (!generation.ok) return failed(generation.errors, generation.warnings, { plan, generation });
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!validation.ok) return failed(validation.errors, validation.warnings, { plan, generation, validation });

  const layout = printLayout(options);
  const questionDisplayModels = generation.questions.map((question, index) => displayModel(question, index, layout.showQuestionNumbers));
  const answerKeyItems = layout.showAnswerKeyPage ? generation.questions.map((question, index) => answerKeyItem(question, questionDisplayModels[index])) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, layout);
  const answerKeyPages = layout.showAnswerKeyPage
    ? paginateAnswerKeyItems(answerKeyItems, { ...layout, columns: 2, rowsPerPage: 5 })
    : [];
  const worksheetDocument = Object.freeze({
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `p03f5-${G4B_U08_SOURCE_ID}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "四年級｜擴分與約分產生等值分數",
    subtitle: "等值分數結構題",
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({ ...plan, printLayout: layout }),
    orderingMode: plan.ordering,
    questionCount: generation.questions.length,
    questionPages: Object.freeze(questionPages),
    answerKeyPages: Object.freeze(answerKeyPages),
    sections: Object.freeze([]),
    generatedQuestions: Object.freeze(generation.questions.map((question) => Object.freeze({ ...question }))),
    questions: Object.freeze(generation.questions.map((question) => Object.freeze({ ...question }))),
    questionDisplayModels: Object.freeze(questionDisplayModels),
    answerKeyItems: Object.freeze(answerKeyItems),
    printOptions: Object.freeze({
      ...layout,
      answerKeyColumns: 2,
      answerKeyRowsPerPage: 5,
      showAnswerKey: layout.showAnswerKeyPage,
      answerKeyPlacement: layout.showAnswerKeyPage ? "afterQuestions" : "none",
    }),
    publicControls: Object.freeze({ sourceId: G4B_U08_SOURCE_ID, questionMode: "numeric", productAdmissionTask: P03F5_EQUIVALENT_FRACTION_WORKSHEET_ADAPTER.task }),
    metadata: Object.freeze({ sourceId: G4B_U08_SOURCE_ID, knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID, applicationClassification: "APPLICATION_NOT_APPLICABLE", worksheetAdapter: P03F5_EQUIVALENT_FRACTION_WORKSHEET_ADAPTER }),
    batchA: Object.freeze({ sourceId: G4B_U08_SOURCE_ID, questionMode: "numeric", selectionMode: plan.selectionMode }),
    report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([...(generation.warnings ?? []), ...(validation.warnings ?? [])]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }),
    summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: generation.questions.length, applicationQuestionCount: 0 }),
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([...(generation.warnings ?? []), ...(validation.warnings ?? [])]), worksheetDocument, plan, generation, validation, p03f5WorksheetAdapter: P03F5_EQUIVALENT_FRACTION_WORKSHEET_ADAPTER });
}
