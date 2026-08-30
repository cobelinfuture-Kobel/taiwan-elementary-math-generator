import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p04f26-extension.js";
import { buildBatchABrowserPlan, requestsP04F27 } from "./batch-a-browser-generator-p04f27.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p04f27.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p04f27.js";
import { buildG4AU06InlineMathModel } from "./g4a-u06-inline-fraction-display.js";
import { buildBatchABrowserWorksheetDocument as buildG4AU06CurrentWorksheetDocument } from "./batch-a-browser-worksheet-p03f33-extension.js";
import { G4A_U06_P04F27_SOURCE_ID, G4A_U06_P04F27_KP_ID } from "../registry/g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";
export const P04F27_WORKSHEET_ADAPTER = Object.freeze({
  task: "P04F_W4DirectProductVerticalSlice027Implementation",
  status: "bounded_g4a_u06_fraction_quantity_application_connected",
  sourceId: G4A_U06_P04F27_SOURCE_ID,
  knowledgePointId: G4A_U06_P04F27_KP_ID,
  currentVisibleKnowledgePointCount: 6,
  currentHiddenKnowledgePointCount: 0,
  sharedFractionArithmetic: true,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
  parallelFractionEngine: false,
});
export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP04F27(options)) return baseBuild(options);
  if (options.selectionMode === "mixedKnowledgePointsSameUnit" && (options.selectedKnowledgePointIds ?? []).length > 1) {
    return buildG4AU06CurrentWorksheetDocument(options);
  }
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return { ok: false, errors: planValidation.errors, warnings: planValidation.warnings, worksheetDocument: null, plan, validation: planValidation };
  const generation = generateBatchABrowserQuestions({ ...options, plan });
  const validation = validateBatchABrowserQuestions(generation.questions ?? []);
  if (!generation.ok || !validation.ok) return { ok: false, errors: [...(generation.errors ?? []), ...(validation.errors ?? [])], warnings: [...(generation.warnings ?? []), ...(validation.warnings ?? [])], worksheetDocument: null, plan, generation, validation };
  const layout = Object.freeze({ paperSize: options.printLayout?.paperSize ?? "A4", columns: Math.min(options.printLayout?.columns ?? 2, 2), rowsPerPage: Math.min(options.printLayout?.rowsPerPage ?? 4, 4), showQuestionNumbers: options.printLayout?.showQuestionNumbers !== false, showAnswerKeyPage: options.includeAnswerKey !== false && options.printLayout?.showAnswerKeyPage !== false, longTextCardPolicy: "avoidSplit", questionMode: "application" });
  const questions = generation.questions;
  const models = questions.map((question, index) => Object.freeze({ questionId: question.id, questionNumber: index + 1, patternId: question.patternSpecId, knowledgePointId: question.knowledgePointId, patternGroupId: question.patternGroupId, questionNumberText: layout.showQuestionNumbers ? `${index + 1}.` : null, promptText: question.blankedDisplayText, displayText: question.displayText, blankedDisplayText: question.blankedDisplayText, answerText: question.answerText, promptInlineMath: buildG4AU06InlineMathModel({ sourceId: G4A_U06_P04F27_SOURCE_ID, plainText: question.blankedDisplayText }), metadataSnapshot: question.metadata, layoutHints: Object.freeze({ estimatedTextLength: question.blankedDisplayText.length, hasGrouping: false, avoidPageBreakInside: true, representation: "fraction_quantity_scaling_application", longTextCardPolicy: "avoidSplit" }) }));
  const answers = layout.showAnswerKeyPage ? questions.map((question, index) => Object.freeze({ questionId: question.id, questionNumber: index + 1, patternId: question.patternSpecId, knowledgePointId: question.knowledgePointId, patternGroupId: question.patternGroupId, promptText: question.blankedDisplayText, answerText: question.answerText, promptInlineMath: buildG4AU06InlineMathModel({ sourceId: G4A_U06_P04F27_SOURCE_ID, plainText: question.blankedDisplayText }), answerInlineMath: buildG4AU06InlineMathModel({ sourceId: G4A_U06_P04F27_SOURCE_ID, plainText: question.answerText }), metadataSnapshot: question.metadata, layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: "fraction_quantity_scaling_application_answer" }) })) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...layout, columns: 2, rowsPerPage: 4 }) : [];
  const document = Object.freeze({ schemaVersion: "worksheet-document-v1", version: "1", worksheetId: `g4a-u06-p04f27-${plan.questionCount}-${plan.generationSeed}`, worksheetKind: "batchAWorksheet", title: options.title ?? "四年級上｜假分數與帶分數｜分數量乘整數", subtitle: "分數量與帶分數量的整數倍", generatedAt: "DETERMINISTIC", configSnapshot: Object.freeze({ ...plan, printLayout: layout }), orderingMode: plan.ordering ?? "groupedByPattern", questionCount: questions.length, questionPages: Object.freeze(questionPages), answerKeyPages: Object.freeze(answerKeyPages), sections: Object.freeze([]), generatedQuestions: Object.freeze(questions), questions: Object.freeze(questions), questionDisplayModels: Object.freeze(models), answerKeyItems: Object.freeze(answers), printOptions: Object.freeze({ ...layout, answerKeyColumns: 2, answerKeyRowsPerPage: 4, showAnswerKey: layout.showAnswerKeyPage, answerKeyPlacement: layout.showAnswerKeyPage ? "afterQuestions" : "none" }), publicControls: Object.freeze({ sourceId: G4A_U06_P04F27_SOURCE_ID, questionMode: "application", productAdmissionTask: P04F27_WORKSHEET_ADAPTER.task, globalContextRegistry: null }), metadata: Object.freeze({ sourceId: G4A_U06_P04F27_SOURCE_ID, knowledgePointIds: Object.freeze([G4A_U06_P04F27_KP_ID]), sourceEvidencePages: Object.freeze([3]), aliasReconciled: true, worksheetAdapter: P04F27_WORKSHEET_ADAPTER }), batchA: Object.freeze({ sourceId: G4A_U06_P04F27_SOURCE_ID, questionMode: "application", selectionMode: "singleKnowledgePoint" }), report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }), summary: Object.freeze({ questionCount: questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: 0, applicationQuestionCount: questions.length }) });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p04f27WorksheetAdapter: P04F27_WORKSHEET_ADAPTER });
}
