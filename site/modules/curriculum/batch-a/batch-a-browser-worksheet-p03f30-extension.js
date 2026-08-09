import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p03f29-extension.js";
import { buildBatchABrowserPlan, requestsP03F30 } from "./batch-a-browser-generator-p03f30.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f30.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f30.js";
import {
  G5A_U06_P03F30_KP_IDS,
  G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U06_P03F30_SOURCE_ID,
} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";

export const P03F30_WORKSHEET_ADAPTER = Object.freeze({
  task: "P03F_W3DirectProductVerticalSlice030Implementation",
  status: "bounded_shared_rank8_fraction_source_connected",
  sourceId: G5A_U06_P03F30_SOURCE_ID,
  currentVisibleKnowledgePointCount: 4,
  currentHiddenKnowledgePointCount: 3,
  addedKnowledgePointCount: 4,
  addedPatternSpecCount: 4,
  numericPatternSpecCount: 4,
  applicationPatternSpecCount: 0,
  sharedPagination: true,
  sharedRenderer: true,
  parallelPipeline: false,
});

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F30(options)) return baseBuild(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return { ok:false, errors:planValidation.errors, warnings:[], worksheetDocument:null, plan, validation:planValidation };
  const generation = generateBatchABrowserQuestions({ ...options, plan });
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!generation.ok || !validation.ok) return { ok:false, errors:[...(generation.errors ?? []), ...(validation.errors ?? [])], warnings:[], worksheetDocument:null, plan, generation, validation };
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
    layoutHints: Object.freeze({ estimatedTextLength:question.blankedDisplayText.length, hasGrouping:false, avoidPageBreakInside:true, representation:"fraction_numeric", longTextCardPolicy:"avoidSplit" }),
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
    layoutHints: Object.freeze({ avoidPageBreakInside:true, representation:"fraction_numeric_answer" }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...layout, columns:2, rowsPerPage:4 }) : [];
  const selectedKps = Object.freeze([...new Set(generation.questions.map((q) => q.metadata.knowledgePointId))]);
  const document = Object.freeze({
    schemaVersion:"worksheet-document-v1",
    version:"1",
    worksheetId:`p03f30-g5a-u06-rank8-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind:"batchAWorksheet",
    title: options.title ?? "五年級上｜異分母分數加減｜分數運算",
    subtitle:"單位分數合計、異分母加減與比較",
    generatedAt:"DETERMINISTIC",
    configSnapshot:Object.freeze({ ...plan, printLayout:layout }),
    orderingMode:plan.ordering,
    questionCount:generation.questions.length,
    questionPages:Object.freeze(questionPages),
    answerKeyPages:Object.freeze(answerKeyPages),
    sections:Object.freeze([]),
    generatedQuestions:Object.freeze(generation.questions),
    questions:Object.freeze(generation.questions),
    questionDisplayModels:Object.freeze(models),
    answerKeyItems:Object.freeze(answers),
    printOptions:Object.freeze({ ...layout, answerKeyColumns:2, answerKeyRowsPerPage:4, showAnswerKey:layout.showAnswerKeyPage, answerKeyPlacement:layout.showAnswerKeyPage?"afterQuestions":"none" }),
    publicControls:Object.freeze({ sourceId:G5A_U06_P03F30_SOURCE_ID, questionMode:"numeric", productAdmissionTask:P03F30_WORKSHEET_ADAPTER.task, globalContextRegistry:null }),
    metadata:Object.freeze({ sourceId:G5A_U06_P03F30_SOURCE_ID, knowledgePointIds:selectedKps, applicationExpansion:false, hiddenApplicationLineagePreserved:true, worksheetAdapter:P03F30_WORKSHEET_ADAPTER }),
    batchA:Object.freeze({ sourceId:G5A_U06_P03F30_SOURCE_ID, questionMode:"numeric", selectionMode:plan.selectionMode }),
    report:Object.freeze({ ok:true, errors:Object.freeze([]), warnings:Object.freeze([]), summary:Object.freeze({ questionCount:generation.questions.length, questionPageCount:questionPages.length, answerKeyPageCount:answerKeyPages.length }) }),
    summary:Object.freeze({ questionCount:generation.questions.length, questionPageCount:questionPages.length, answerKeyPageCount:answerKeyPages.length, numericQuestionCount:generation.questions.length, applicationQuestionCount:0 }),
  });
  return Object.freeze({ ok:true, errors:Object.freeze([]), warnings:Object.freeze([]), worksheetDocument:document, plan, generation, validation, p03f30WorksheetAdapter:P03F30_WORKSHEET_ADAPTER });
}

export const P03F30_CURRENT_ADDED_KP_IDS = G5A_U06_P03F30_KP_IDS;
export const P03F30_CURRENT_ADDED_SPEC_IDS = G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS;
