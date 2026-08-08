import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p03f28-extension.js";
import { buildBatchABrowserPlan, requestsP03F29 } from "./batch-a-browser-generator-p03f29.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f29.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f29.js";
import {
  G5A_U04_P03F29_KP_ID,
  G5A_U04_P03F29_SOURCE_ID,
  G5A_U04_P03F29_SPEC_ID,
} from "../registry/g5a-u04-rank8-fraction-selector-projection-p03f29.js";

export const P03F29_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice029Implementation",
  status: "bounded_shared_rank8_fraction_compare_connected",
  sourceId: G5A_U04_P03F29_SOURCE_ID,
  currentVisibleKnowledgePointCount: 5,
  currentHiddenKnowledgePointCount: 2,
  addedKnowledgePointCount: 1,
  addedPatternSpecCount: 1,
  numericPatternSpecCount: 1,
  applicationPatternSpecCount: 0,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F29(options)) return baseBuild(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return { ok: false, errors: planValidation.errors, warnings: [], worksheetDocument: null, plan, validation: planValidation };
  const generation = generateBatchABrowserQuestions({ ...options, plan });
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!generation.ok || !validation.ok) return { ok: false, errors: [...(generation.errors ?? []), ...(validation.errors ?? [])], warnings: [], worksheetDocument: null, plan, generation, validation };
  const layout = Object.freeze({
    paperSize: options.printLayout?.paperSize ?? "A4",
    columns: Math.min(options.printLayout?.columns ?? 2, 2),
    rowsPerPage: Math.min(options.printLayout?.rowsPerPage ?? 4, 4),
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
    layoutHints: Object.freeze({ estimatedTextLength: question.blankedDisplayText.length, hasGrouping: false, avoidPageBreakInside: true, representation: "unlike_fraction_compare", longTextCardPolicy: "avoidSplit" }),
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
    layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: "unlike_fraction_compare_answer" }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...layout, columns: 2, rowsPerPage: 4 }) : [];
  const document = Object.freeze({
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `p03f29-g5a-u04-rank8-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "五年級上｜擴分約分通分｜異分母分數比較",
    subtitle: "通分或交叉乘積後進行精確分數大小比較",
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
    printOptions: Object.freeze({ ...layout, answerKeyColumns: 2, answerKeyRowsPerPage: 4, showAnswerKey: layout.showAnswerKeyPage, answerKeyPlacement: layout.showAnswerKeyPage ? "afterQuestions" : "none" }),
    publicControls: Object.freeze({ sourceId: G5A_U04_P03F29_SOURCE_ID, questionMode: "numeric", productAdmissionTask: P03F29_WORKSHEET_ADAPTER.task, globalContextRegistry: null }),
    metadata: Object.freeze({ sourceId: G5A_U04_P03F29_SOURCE_ID, knowledgePointIds: Object.freeze([G5A_U04_P03F29_KP_ID]), applicationExpansion: false, hiddenApplicationLineagePreserved: true, worksheetAdapter: P03F29_WORKSHEET_ADAPTER }),
    batchA: Object.freeze({ sourceId: G5A_U04_P03F29_SOURCE_ID, questionMode: "numeric", selectionMode: plan.selectionMode }),
    report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }),
    summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: generation.questions.length, applicationQuestionCount: 0 }),
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p03f29WorksheetAdapter: P03F29_WORKSHEET_ADAPTER });
}

export const P03F29_CURRENT_ADDED_KP_IDS = Object.freeze([G5A_U04_P03F29_KP_ID]);
export const P03F29_CURRENT_ADDED_SPEC_IDS = Object.freeze([G5A_U04_P03F29_SPEC_ID]);
