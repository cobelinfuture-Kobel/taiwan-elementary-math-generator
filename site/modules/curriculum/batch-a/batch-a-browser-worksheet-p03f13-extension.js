import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBase } from "./batch-a-browser-worksheet-p03f12-extension.js";
import { buildBatchABrowserPlan, requestsP03F13 } from "./batch-a-browser-generator-p03f13.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f13.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_QUOTIENT_CONTEXT_KP_ID,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

export const P03F13_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice013Implementation",
  status: "bounded_shared_two_kp_numeric_application_worksheet_adapter_connected",
  sourceId: G5A_U04_SOURCE_ID,
  knowledgePointCount: 2,
  patternSpecCount: 5,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});
const failed = (errors, warnings = [], details = {}) => Object.freeze({ ok: false, errors: Object.freeze([...(errors ?? [])]), warnings: Object.freeze([...(warnings ?? [])]), worksheetDocument: null, ...details });

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F13(options)) return buildBase(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return failed(planValidation.errors, planValidation.warnings, { plan, validation: planValidation });
  const generation = generateBatchABrowserQuestions(options);
  if (!generation.ok) return failed(generation.errors, generation.warnings, { plan, generation });
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!validation.ok) return failed(validation.errors, validation.warnings, { plan, generation, validation });

  const quotient = plan.requestedKnowledgePointIds?.includes(G5A_U04_QUOTIENT_CONTEXT_KP_ID);
  const application = plan.questionMode === "application";
  const requested = options.printLayout ?? {};
  const printLayout = Object.freeze({
    paperSize: requested.paperSize ?? "A4",
    columns: Math.min(Number.isInteger(requested.columns) ? requested.columns : 2, 2),
    rowsPerPage: Math.min(Number.isInteger(requested.rowsPerPage) ? requested.rowsPerPage : (application ? 3 : 5), application ? 3 : 5),
    showQuestionNumbers: requested.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit",
    questionMode: plan.questionMode,
  });
  const representation = quotient ? (application ? "quotient_fraction_application" : "quotient_as_fraction") : "fraction_simplification";
  const models = generation.questions.map((question, index) => Object.freeze({
    questionId: question.id, questionNumber: index + 1, patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId, patternGroupId: question.metadata.patternGroupId,
    questionNumberText: printLayout.showQuestionNumbers ? `${index + 1}.` : null,
    promptText: question.blankedDisplayText, displayText: question.displayText, blankedDisplayText: question.blankedDisplayText,
    answerText: question.answerText, metadataSnapshot: Object.freeze({ ...question.metadata }),
    layoutHints: Object.freeze({ estimatedTextLength: String(question.blankedDisplayText).length, hasGrouping: false, avoidPageBreakInside: true, representation, longTextCardPolicy: "avoidSplit" }),
  }));
  const answers = printLayout.showAnswerKeyPage ? generation.questions.map((question, index) => Object.freeze({
    questionId: question.id, questionNumber: index + 1, patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId, patternGroupId: question.metadata.patternGroupId,
    promptText: models[index].blankedDisplayText, answerText: question.answerText,
    metadataSnapshot: models[index].metadataSnapshot,
    layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: `${representation}_answer` }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...printLayout, columns: 2, rowsPerPage: application ? 3 : 5 }) : [];
  const title = options.title ?? (quotient
    ? `五年級｜整數相除的分數商｜${application ? "應用題" : "數字題"}`
    : "五年級｜擴分、約分與最簡分數｜數字題");
  const subtitle = quotient
    ? (application ? "在農業生產情境中用最簡分數表示平均分配結果" : "把整數除法的商寫成最簡分數")
    : "利用最大公因數把分數約成最簡分數";
  const document = Object.freeze({
    schemaVersion: "worksheet-document-v1", version: "1",
    worksheetId: `p03f13-${quotient ? "quotient" : "simplest"}-${plan.questionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet", title, subtitle, generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({ ...plan, printLayout }), orderingMode: plan.ordering, questionCount: generation.questions.length,
    questionPages: Object.freeze(questionPages), answerKeyPages: Object.freeze(answerKeyPages), sections: Object.freeze([]),
    generatedQuestions: Object.freeze(generation.questions), questions: Object.freeze(generation.questions), questionDisplayModels: Object.freeze(models), answerKeyItems: Object.freeze(answers),
    printOptions: Object.freeze({ ...printLayout, answerKeyColumns: 2, answerKeyRowsPerPage: application ? 3 : 5, showAnswerKey: printLayout.showAnswerKeyPage, answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none" }),
    publicControls: Object.freeze({ sourceId: G5A_U04_SOURCE_ID, questionMode: plan.questionMode, productAdmissionTask: P03F13_WORKSHEET_ADAPTER.task, globalContextRegistry: application ? "W02_ATOMIC_CONTEXT_BINDING" : null }),
    metadata: Object.freeze({ sourceId: G5A_U04_SOURCE_ID, knowledgePointIds: Object.freeze([...(plan.requestedKnowledgePointIds ?? [])]), applicationClassification: quotient ? "APPLICATION_REQUIRED" : "APPLICATION_NOT_APPLICABLE", worksheetAdapter: P03F13_WORKSHEET_ADAPTER }),
    batchA: Object.freeze({ sourceId: G5A_U04_SOURCE_ID, questionMode: plan.questionMode, selectionMode: plan.selectionMode }),
    report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }),
    summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: application ? 0 : generation.questions.length, applicationQuestionCount: application ? generation.questions.length : 0 }),
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p03f13WorksheetAdapter: P03F13_WORKSHEET_ADAPTER });
}
