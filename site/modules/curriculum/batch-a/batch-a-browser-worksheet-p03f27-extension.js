import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p03f26-extension.js";
import { buildBatchABrowserPlan, requestsP03F27 } from "./batch-a-browser-generator-p03f27.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f27.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f27.js";
import { G4B_U08_P03F27_KP_IDS, G4B_U08_P03F27_SOURCE_ID } from "../registry/g4b-u08-rank8-fraction-selector-projection-p03f27.js";

export const P03F27_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice027Implementation",
  status: "bounded_shared_rank8_fraction_connected",
  sourceId: G4B_U08_P03F27_SOURCE_ID,
  knowledgePointCount: 2,
  patternGroupCount: 2,
  patternSpecCount: 2,
  numericPatternSpecCount: 2,
  applicationPatternSpecCount: 0,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});

function representationFor(question) {
  return question.operation === "fraction_compare" ? "unlike_fraction_compare" : "unlike_fraction_add_sub";
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F27(options)) return baseBuild(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return { ok: false, errors: planValidation.errors, warnings: [], worksheetDocument: null, plan, validation: planValidation };
  const generation = generateBatchABrowserQuestions(options);
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!generation.ok || !validation.ok) return { ok: false, errors: [...(generation.errors ?? []), ...(validation.errors ?? [])], warnings: [], worksheetDocument: null, plan, generation, validation };
  const layout = Object.freeze({
    paperSize: options.printLayout?.paperSize ?? "A4",
    columns: Math.min(options.printLayout?.columns ?? 2, 2),
    rowsPerPage: Math.min(options.printLayout?.rowsPerPage ?? 5, 5),
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
    worksheetId: `p03f27-g4b-u08-rank8-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "四年級下｜等值分數｜異分母比較與加減",
    subtitle: "交叉乘積比較、通分加減與精確分數答案",
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
    publicControls: Object.freeze({ sourceId: G4B_U08_P03F27_SOURCE_ID, questionMode: "numeric", productAdmissionTask: P03F27_WORKSHEET_ADAPTER.task, globalContextRegistry: null }),
    metadata: Object.freeze({ sourceId: G4B_U08_P03F27_SOURCE_ID, knowledgePointIds: Object.freeze([...G4B_U08_P03F27_KP_IDS]), applicationExpansion: false, hiddenApplicationLineagePreserved: true, worksheetAdapter: P03F27_WORKSHEET_ADAPTER }),
    batchA: Object.freeze({ sourceId: G4B_U08_P03F27_SOURCE_ID, questionMode: "numeric", selectionMode: plan.selectionMode }),
    report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }),
    summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: generation.questions.length, applicationQuestionCount: 0 }),
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p03f27WorksheetAdapter: P03F27_WORKSHEET_ADAPTER });
}
