import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBase } from "./batch-a-browser-worksheet-p03f18-extension.js";
import { buildBatchABrowserPlan, requestsP03F19 } from "./batch-a-browser-generator-p03f19.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f19.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f19.js";
import { G4B_U06_SLICE019_SOURCE_ID } from "../registry/g4b-u06-two-decimal-rate-selector-projection.js";

export const P03F19_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice019Implementation",
  status: "bounded_shared_two_decimal_rate_worksheet_adapter_connected",
  sourceId: G4B_U06_SLICE019_SOURCE_ID,
  knowledgePointCount: 2,
  patternGroupCount: 4,
  patternSpecCount: 6,
  existingApplicationContextCount: 3,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});

const failed = (errors, warnings = [], details = {}) => Object.freeze({ ok: false, errors: Object.freeze([...(errors ?? [])]), warnings: Object.freeze([...(warnings ?? [])]), worksheetDocument: null, ...details });

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F19(options)) return buildBase(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return failed(planValidation.errors, planValidation.warnings, { plan, validation: planValidation });
  const generation = generateBatchABrowserQuestions({ ...options, plan });
  if (!generation.ok) return failed(generation.errors, generation.warnings, { plan, generation });
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!validation.ok) return failed(validation.errors, validation.warnings, { plan, generation, validation });

  const requested = options.printLayout ?? {};
  const printLayout = Object.freeze({
    paperSize: requested.paperSize ?? "A4",
    columns: Math.min(Number.isInteger(requested.columns) ? requested.columns : (plan.questionMode === "application" ? 1 : 2), 2),
    rowsPerPage: Math.min(Number.isInteger(requested.rowsPerPage) ? requested.rowsPerPage : 6, 6),
    showQuestionNumbers: requested.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit",
    questionMode: plan.questionMode,
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
    layoutHints: Object.freeze({ estimatedTextLength: String(question.blankedDisplayText).length, hasGrouping: false, avoidPageBreakInside: true, representation: plan.questionMode === "application" ? "two_decimal_rate_application" : "two_decimal_rate_numeric", longTextCardPolicy: "avoidSplit" }),
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
    layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: "two_decimal_rate_answer" }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...printLayout, columns: 2, rowsPerPage: 6 }) : [];
  const knowledgePointIds = [...new Set(generation.questions.map((question) => question.metadata.knowledgePointId))];
  const numericQuestionCount = generation.questions.filter((row) => row.questionMode === "numeric").length;
  const applicationQuestionCount = generation.questions.length - numericQuestionCount;
  const document = Object.freeze({
    schemaVersion: "worksheet-document-v1", version: "1",
    worksheetId: `p03f19-two-decimal-rate-${plan.questionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "四年級｜小數乘法｜二位小數與單位率",
    subtitle: plan.questionMode === "application" ? "在既有生活情境中計算二位小數乘整數與總量" : "計算二位小數乘整數與單位率總量",
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({ ...plan, printLayout }),
    orderingMode: plan.ordering,
    questionCount: generation.questions.length,
    questionPages: Object.freeze(questionPages), answerKeyPages: Object.freeze(answerKeyPages), sections: Object.freeze([]),
    generatedQuestions: Object.freeze(generation.questions), questions: Object.freeze(generation.questions), questionDisplayModels: Object.freeze(models), answerKeyItems: Object.freeze(answers),
    printOptions: Object.freeze({ ...printLayout, answerKeyColumns: 2, answerKeyRowsPerPage: 6, showAnswerKey: printLayout.showAnswerKeyPage, answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none" }),
    publicControls: Object.freeze({ sourceId: G4B_U06_SLICE019_SOURCE_ID, questionMode: plan.questionMode, productAdmissionTask: P03F19_WORKSHEET_ADAPTER.task, globalContextRegistry: plan.questionMode === "application" ? plan.publicControls.globalContextAuthority : null }),
    metadata: Object.freeze({ sourceId: G4B_U06_SLICE019_SOURCE_ID, knowledgePointIds: Object.freeze(knowledgePointIds), applicationExpansion: false, existingContextCandidateConsumption: plan.questionMode === "application", worksheetAdapter: P03F19_WORKSHEET_ADAPTER }),
    batchA: Object.freeze({ sourceId: G4B_U06_SLICE019_SOURCE_ID, questionMode: plan.questionMode, selectionMode: plan.selectionMode }),
    report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }),
    summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount, applicationQuestionCount }),
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p03f19WorksheetAdapter: P03F19_WORKSHEET_ADAPTER });
}
