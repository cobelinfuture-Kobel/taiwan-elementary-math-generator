
import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBase } from "./batch-a-browser-worksheet-p03f5-extension.js";
import { buildBatchABrowserPlan, requestsP03F6SameDenominatorCompare } from "./batch-a-browser-generator-p03f6.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f6.js";
import { G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import { G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID } from "../registry/g3a-u08-same-denominator-compare-selector-projection.js";

export const P03F6_WORKSHEET_ADAPTER = Object.freeze({ task: "P03F_W3DirectProductVerticalSlice006Implementation", status: "bounded_shared_numeric_application_worksheet_adapter_connected", sourceId: G3A_U08_SOURCE_ID, patternSpecCount: 2, sharedPagination: true, sharedRenderer: true, parallelPipeline: false });
const failed = (errors, warnings = [], details = {}) => Object.freeze({ ok: false, errors: Object.freeze([...(errors ?? [])]), warnings: Object.freeze([...(warnings ?? [])]), worksheetDocument: null, ...details });
function layout(options, mode) {
  const requested = options.printLayout ?? {};
  return Object.freeze({ paperSize: requested.paperSize ?? "A4", columns: Math.min(Number.isInteger(requested.columns) ? requested.columns : 2, 2), rowsPerPage: Math.min(Number.isInteger(requested.rowsPerPage) ? requested.rowsPerPage : 3, 3), showQuestionNumbers: requested.showQuestionNumbers !== false, showAnswerKeyPage: options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false, longTextCardPolicy: "avoidSplit", questionMode: mode });
}
function model(question, index, showNumbers) {
  const promptText = question.blankedDisplayText ?? question.promptText ?? "";
  return Object.freeze({ questionId: question.id, questionNumber: index + 1, patternId: question.patternSpecId, knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID, patternGroupId: question.metadata.patternGroupId, questionNumberText: showNumbers ? `${index + 1}.` : null, promptText, displayText: question.displayText, blankedDisplayText: promptText, answerText: question.answerText, metadataSnapshot: Object.freeze({ ...question.metadata, globalContextProduction: question.globalContextProduction }), layoutHints: Object.freeze({ estimatedTextLength: String(promptText).length, hasGrouping: false, avoidPageBreakInside: true, representation: question.questionMode === "application" ? "same_denominator_compare_application" : "same_denominator_compare_numeric", longTextCardPolicy: "avoidSplit" }) });
}
export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F6SameDenominatorCompare(options)) return buildBase(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return failed(planValidation.errors, planValidation.warnings, { plan, validation: planValidation });
  const generation = generateBatchABrowserQuestions(options);
  if (!generation.ok) return failed(generation.errors, generation.warnings, { plan, generation });
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!validation.ok) return failed(validation.errors, validation.warnings, { plan, generation, validation });
  const printLayout = layout(options, plan.questionMode);
  const questionDisplayModels = generation.questions.map((q, i) => model(q, i, printLayout.showQuestionNumbers));
  const answerKeyItems = printLayout.showAnswerKeyPage ? generation.questions.map((q, i) => Object.freeze({ questionId: q.id, questionNumber: i + 1, patternId: q.patternSpecId, knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID, patternGroupId: q.metadata.patternGroupId, promptText: questionDisplayModels[i].blankedDisplayText, answerText: q.answerText, metadataSnapshot: questionDisplayModels[i].metadataSnapshot, layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: "same_denominator_compare_answer" }) })) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answerKeyItems, { ...printLayout, columns: 2, rowsPerPage: 3 }) : [];
  const document = Object.freeze({ schemaVersion: "worksheet-document-v1", version: "1", worksheetId: `p03f6-${plan.questionMode}-${plan.questionCount}-${plan.generationSeed}`, worksheetKind: "batchAWorksheet", title: options.title ?? `三年級｜同分母分數比較｜${plan.questionMode === "application" ? "應用題" : "數字題"}`, subtitle: "同分母分數及其與 1 的大小", generatedAt: "DETERMINISTIC", configSnapshot: Object.freeze({ ...plan, printLayout }), orderingMode: plan.ordering, questionCount: generation.questions.length, questionPages: Object.freeze(questionPages), answerKeyPages: Object.freeze(answerKeyPages), sections: Object.freeze([]), generatedQuestions: Object.freeze(generation.questions), questions: Object.freeze(generation.questions), questionDisplayModels: Object.freeze(questionDisplayModels), answerKeyItems: Object.freeze(answerKeyItems), printOptions: Object.freeze({ ...printLayout, answerKeyColumns: 2, answerKeyRowsPerPage: 3, showAnswerKey: printLayout.showAnswerKeyPage, answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none" }), publicControls: Object.freeze({ sourceId: G3A_U08_SOURCE_ID, questionMode: plan.questionMode, productAdmissionTask: P03F6_WORKSHEET_ADAPTER.task, globalContextRegistry: plan.questionMode === "application" ? "W02_ATOMIC_CONTEXT_BINDING" : null }), metadata: Object.freeze({ sourceId: G3A_U08_SOURCE_ID, knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID, applicationClassification: "APPLICATION_COMPATIBLE", worksheetAdapter: P03F6_WORKSHEET_ADAPTER }), batchA: Object.freeze({ sourceId: G3A_U08_SOURCE_ID, questionMode: plan.questionMode, selectionMode: plan.selectionMode }), report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: plan.questionMode === "numeric" ? generation.questions.length : 0, applicationQuestionCount: plan.questionMode === "application" ? generation.questions.length : 0 }) });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p03f6WorksheetAdapter: P03F6_WORKSHEET_ADAPTER });
}
