import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p03f42-extension.js";
import { buildBatchABrowserPlan, requestsP03F43 } from "./batch-a-browser-generator-p03f43.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f43.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f43.js";
import {
  G4B_U08_P03F43_BOUNDS_SPEC_ID,
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_KP_IDS,
  P03F43_SPEC_IDS,
} from "../registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

export const P03F43_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice043Implementation",
  status: "q043_two_kp_shared_fraction_runtime_connected",
  sourceId: G4B_U08_P03F43_SOURCE_ID,
  currentVisibleKnowledgePointCount: 7,
  currentHiddenKnowledgePointCount: 0,
  currentNotSelectableKnowledgePointCount: 0,
  addedKnowledgePointCount: 2,
  addedPatternSpecCount: 3,
  numericPatternSpecCount: 3,
  applicationPatternSpecCount: 0,
  sharedFractionNumberLineRendererAdapter: true,
  sharedNumericRendererAdapter: true,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F43(options)) return baseBuild(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return { ok: false, errors: planValidation.errors, warnings: [], worksheetDocument: null, plan, validation: planValidation };
  const generation = generateBatchABrowserQuestions({ ...options, plan });
  const validation = validateBatchABrowserQuestions(generation.questions ?? []);
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
    numberLine: question.numberLine ?? null,
    metadataSnapshot: question.metadata,
    layoutHints: Object.freeze({
      estimatedTextLength: question.blankedDisplayText.length,
      hasGrouping: false,
      avoidPageBreakInside: true,
      representation: question.numberLine ? "fraction_number_line" : "numeric",
      longTextCardPolicy: "avoidSplit",
    }),
  }));
  const answers = layout.showAnswerKeyPage ? generation.questions.map((question, index) => Object.freeze({
    questionId: question.id,
    questionNumber: index + 1,
    patternId: question.patternSpecId,
    knowledgePointId: question.metadata.knowledgePointId,
    patternGroupId: question.metadata.patternGroupId,
    promptText: question.blankedDisplayText,
    answerText: question.answerText,
    numberLine: question.numberLine ?? null,
    metadataSnapshot: question.metadata,
    layoutHints: Object.freeze({ avoidPageBreakInside: true, representation: question.numberLine ? "fraction_number_line_answer" : "numeric_answer" }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...layout, columns: 2, rowsPerPage: 4 }) : [];
  const knowledgePointIds = Object.freeze([...new Set(generation.questions.map((question) => question.metadata.knowledgePointId))]);
  const numberLineQuestionCount = generation.questions.filter((question) => question.numberLine?.kind === "fraction_number_line").length;
  const boundsQuestionCount = generation.questions.filter((question) => question.patternSpecId === G4B_U08_P03F43_BOUNDS_SPEC_ID).length;
  const document = Object.freeze({
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `p03f43-g4b-u08-rank10-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "四年級下｜等值分數",
    subtitle: "q043｜分數數線與帶分數界限",
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
    publicControls: Object.freeze({ sourceId: G4B_U08_P03F43_SOURCE_ID, questionMode: "numeric", productAdmissionTask: P03F43_WORKSHEET_ADAPTER.task, globalContextRegistry: null }),
    metadata: Object.freeze({
      sourceId: G4B_U08_P03F43_SOURCE_ID,
      knowledgePointIds,
      applicationExpansion: false,
      globalContextExpansion: false,
      fractionArithmeticExpansion: false,
      slice044Expansion: false,
      fractionNumberLineRepresentation: numberLineQuestionCount > 0,
      mixedFractionBoundsRepresentation: boundsQuestionCount > 0,
      worksheetAdapter: P03F43_WORKSHEET_ADAPTER,
    }),
    batchA: Object.freeze({ sourceId: G4B_U08_P03F43_SOURCE_ID, questionMode: "numeric", selectionMode: plan.selectionMode }),
    report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }),
    summary: Object.freeze({
      questionCount: generation.questions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      numericQuestionCount: generation.questions.length,
      applicationQuestionCount: 0,
      fractionNumberLineQuestionCount: numberLineQuestionCount,
      mixedFractionBoundsQuestionCount: boundsQuestionCount,
    }),
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation, p03f43WorksheetAdapter: P03F43_WORKSHEET_ADAPTER });
}

export const P03F43_CURRENT_ADDED_KP_IDS = P03F43_KP_IDS;
export const P03F43_CURRENT_ADDED_SPEC_IDS = P03F43_SPEC_IDS;
