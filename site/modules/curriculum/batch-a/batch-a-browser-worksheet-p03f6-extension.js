import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBase } from "./batch-a-browser-worksheet-p03f5-extension.js";
import { G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  buildG3AU08CurrentPlan,
  generateG3AU08CurrentQuestions,
  validateG3AU08CurrentPlan,
  validateG3AU08CurrentQuestions,
} from "./g3a-u08-current-coordinator.js";
import { buildG3AU08InlineMathModel } from "./g3a-u08-inline-fraction-display.js";

export const P03F6_WORKSHEET_ADAPTER = Object.freeze({
  task: "G3A-U08_CurrentUnitCapacityRendererOrderingRepair",
  status: "bounded_g3a_u08_current_unit_adapter_connected",
  sourceId: G3A_U08_SOURCE_ID,
  knowledgePointCount: 4,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});
const failed = (errors, warnings = [], details = {}) => Object.freeze({
  ok: false, errors: Object.freeze([...(errors ?? [])]), warnings: Object.freeze([...(warnings ?? [])]),
  worksheetDocument: null, ...details,
});
function layout(options, mode) {
  const requested = options.printLayout ?? {};
  return Object.freeze({
    paperSize: requested.paperSize ?? "A4",
    columns: Math.min(Number.isInteger(requested.columns) ? requested.columns : 2, 2),
    rowsPerPage: Math.min(Number.isInteger(requested.rowsPerPage) ? requested.rowsPerPage : 3, 3),
    showQuestionNumbers: requested.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit", questionMode: mode,
  });
}
function model(question, index, showNumbers) {
  const promptText = question.blankedDisplayText ?? question.promptText ?? "";
  return Object.freeze({
    questionId: question.id, questionNumber: index + 1, patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId, patternGroupId: question.metadata.patternGroupId,
    questionNumberText: showNumbers ? `${index + 1}.` : null, promptText,
    displayText: question.displayText, blankedDisplayText: promptText, answerText: question.answerText,
    promptInlineMath: buildG3AU08InlineMathModel({ sourceId: G3A_U08_SOURCE_ID, plainText: promptText }),
    metadataSnapshot: Object.freeze({ ...question.metadata, globalContextProduction: question.globalContextProduction }),
    layoutHints: Object.freeze({
      estimatedTextLength: String(promptText).length, hasGrouping: false, avoidPageBreakInside: true,
      representation: `g3a_u08_${question.questionMode}`, longTextCardPolicy: "avoidSplit",
    }),
  });
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (options.sourceId !== G3A_U08_SOURCE_ID) return buildBase(options);
  const plan = buildG3AU08CurrentPlan(options);
  const planValidation = validateG3AU08CurrentPlan(plan);
  if (!planValidation.ok) return failed(planValidation.errors, planValidation.warnings, { plan, validation: planValidation });
  const generation = generateG3AU08CurrentQuestions({ ...options, plan });
  if (!generation.ok) return failed(generation.errors, generation.warnings, { plan, generation });
  const validation = validateG3AU08CurrentQuestions(generation.questions);
  if (!validation.ok) return failed(validation.errors, validation.warnings, { plan, generation, validation });

  const printLayout = layout(options, plan.questionMode);
  const questionDisplayModels = generation.questions.map((question, index) => model(question, index, printLayout.showQuestionNumbers));
  const answerKeyItems = printLayout.showAnswerKeyPage ? generation.questions.map((question, index) => Object.freeze({
    questionId: question.id, questionNumber: index + 1, patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId, patternGroupId: question.metadata.patternGroupId,
    promptText: questionDisplayModels[index].blankedDisplayText, answerText: question.answerText,
    promptInlineMath: buildG3AU08InlineMathModel({ sourceId: G3A_U08_SOURCE_ID, plainText: questionDisplayModels[index].blankedDisplayText }),
    answerInlineMath: buildG3AU08InlineMathModel({ sourceId: G3A_U08_SOURCE_ID, plainText: question.answerText }),
    metadataSnapshot: questionDisplayModels[index].metadataSnapshot,
    layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: "g3a_u08_answer" }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage
    ? paginateAnswerKeyItems(answerKeyItems, { ...printLayout, columns: 2, rowsPerPage: 3 }) : [];
  const selectedKnowledgePointIds = Object.freeze([...new Set(
    generation.questions.map((question) => question.metadata.knowledgePointId),
  )]);
  const document = Object.freeze({
    schemaVersion: "worksheet-document-v1", version: "1",
    worksheetId: `g3a-u08-current-${plan.questionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? `三年級｜分數｜${plan.questionMode === "application" ? "應用題" : "數字題"}`,
    subtitle: "等分、單位分數、離散集合換算與同分母比較", generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({ ...plan, printLayout }), orderingMode: plan.ordering,
    questionCount: generation.questions.length, questionPages: Object.freeze(questionPages),
    answerKeyPages: Object.freeze(answerKeyPages), sections: Object.freeze([]),
    generatedQuestions: Object.freeze(generation.questions), questions: Object.freeze(generation.questions),
    questionDisplayModels: Object.freeze(questionDisplayModels), answerKeyItems: Object.freeze(answerKeyItems),
    printOptions: Object.freeze({
      ...printLayout, answerKeyColumns: 2, answerKeyRowsPerPage: 3,
      showAnswerKey: printLayout.showAnswerKeyPage,
      answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none",
    }),
    publicControls: Object.freeze({
      sourceId: G3A_U08_SOURCE_ID, questionMode: plan.questionMode,
      productAdmissionTask: P03F6_WORKSHEET_ADAPTER.task,
      globalContextRegistry: plan.questionMode === "application" ? "W02_ATOMIC_CONTEXT_BINDING" : null,
    }),
    metadata: Object.freeze({
      sourceId: G3A_U08_SOURCE_ID, knowledgePointIds: selectedKnowledgePointIds,
      worksheetAdapter: P03F6_WORKSHEET_ADAPTER,
    }),
    batchA: Object.freeze({ sourceId: G3A_U08_SOURCE_ID, questionMode: plan.questionMode, selectionMode: plan.selectionMode }),
    report: Object.freeze({
      ok: true, errors: Object.freeze([]), warnings: Object.freeze([]),
      summary: Object.freeze({
        questionCount: generation.questions.length, questionPageCount: questionPages.length,
        answerKeyPageCount: answerKeyPages.length,
      }),
    }),
    summary: Object.freeze({
      questionCount: generation.questions.length, questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      numericQuestionCount: plan.questionMode === "numeric" ? generation.questions.length : 0,
      applicationQuestionCount: plan.questionMode === "application" ? generation.questions.length : 0,
    }),
  });
  return Object.freeze({
    ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document,
    plan, generation, validation, p03f6WorksheetAdapter: P03F6_WORKSHEET_ADAPTER,
  });
}
