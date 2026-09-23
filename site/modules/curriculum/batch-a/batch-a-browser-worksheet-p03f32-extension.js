import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p03f31-extension.js";
import { buildBatchABrowserPlan, requestsP03F32 } from "./batch-a-browser-generator-p03f32.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f32.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f32.js";
import {
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
  G6B_U01_P03F32_SPEC_IDS,
} from "../registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";

export const P03F32_WORKSHEET_ADAPTER = Object.freeze({
  task:"P03F_W3DirectProductVerticalSlice032Implementation",
  status:"bounded_shared_mixed_domain_conversion_source_connected",
  sourceId:G6B_U01_P03F32_SOURCE_ID,
  currentVisibleKnowledgePointCount:1,
  currentHiddenKnowledgePointCount:4,
  addedKnowledgePointCount:1,
  addedPatternSpecCount:2,
  numericPatternSpecCount:2,
  applicationPatternSpecCount:0,
  sharedMixedDomainNormalizer:true,
  sharedPagination:true,
  sharedRenderer:true,
  parallelPipeline:false,
});

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP03F32(options)) return baseBuild(options);
  const plan = buildBatchABrowserPlan(options);
  const planValidation = validateBatchABrowserPlan(plan);
  if (!planValidation.ok) return { ok:false, errors:planValidation.errors, warnings:[], worksheetDocument:null, plan, validation:planValidation };
  const generation = generateBatchABrowserQuestions({ ...options, plan });
  const validation = validateBatchABrowserQuestions(generation.questions);
  if (!generation.ok || !validation.ok) return { ok:false, errors:[...(generation.errors ?? []), ...(validation.errors ?? [])], warnings:[], worksheetDocument:null, plan, generation, validation };

  const layout = Object.freeze({
    paperSize:options.printLayout?.paperSize ?? "A4",
    columns:Math.min(options.printLayout?.columns ?? 2, 2),
    rowsPerPage:Math.min(options.printLayout?.rowsPerPage ?? 4, 4),
    showQuestionNumbers:options.printLayout?.showQuestionNumbers !== false,
    showAnswerKeyPage:options.includeAnswerKey !== false && options.printLayout?.showAnswerKeyPage !== false,
    longTextCardPolicy:"avoidSplit",
    questionMode:"numeric",
  });
  const models = generation.questions.map((question, index) => Object.freeze({
    questionId:question.id,
    questionNumber:index+1,
    patternId:question.patternSpecId,
    knowledgePointId:question.metadata.knowledgePointId,
    patternGroupId:question.metadata.patternGroupId,
    questionNumberText:layout.showQuestionNumbers ? `${index+1}.` : null,
    promptText:question.blankedDisplayText,
    displayText:question.displayText,
    blankedDisplayText:question.blankedDisplayText,
    answerText:question.answerText,
    metadataSnapshot:question.metadata,
    layoutHints:Object.freeze({ estimatedTextLength:question.blankedDisplayText.length, hasGrouping:false, avoidPageBreakInside:true, representation:"mixed_decimal_fraction_conversion_numeric", longTextCardPolicy:"avoidSplit" }),
  }));
  const answers = layout.showAnswerKeyPage ? generation.questions.map((question, index) => Object.freeze({
    questionId:question.id,
    questionNumber:index+1,
    patternId:question.patternSpecId,
    knowledgePointId:question.metadata.knowledgePointId,
    patternGroupId:question.metadata.patternGroupId,
    promptText:question.blankedDisplayText,
    answerText:question.answerText,
    metadataSnapshot:question.metadata,
    layoutHints:Object.freeze({ avoidPageBreakInside:true, representation:"mixed_decimal_fraction_conversion_numeric_answer" }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...layout, columns:2, rowsPerPage:4 }) : [];
  const document = Object.freeze({
    schemaVersion:"worksheet-document-v1",
    version:"1",
    worksheetId:`p03f32-g6b-u01-mixed-domain-conversion-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind:"batchAWorksheet",
    title:options.title ?? "六年級下｜小數與分數的計算｜小數分數互換",
    subtitle:"有限小數與可除盡分數的精確互換",
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
    publicControls:Object.freeze({ sourceId:G6B_U01_P03F32_SOURCE_ID, questionMode:"numeric", productAdmissionTask:P03F32_WORKSHEET_ADAPTER.task, globalContextRegistry:null }),
    metadata:Object.freeze({ sourceId:G6B_U01_P03F32_SOURCE_ID, knowledgePointIds:Object.freeze([G6B_U01_P03F32_KP_ID]), hiddenKnowledgePointCount:4, applicationExpansion:false, worksheetAdapter:P03F32_WORKSHEET_ADAPTER }),
    batchA:Object.freeze({ sourceId:G6B_U01_P03F32_SOURCE_ID, questionMode:"numeric", selectionMode:plan.selectionMode }),
    report:Object.freeze({ ok:true, errors:Object.freeze([]), warnings:Object.freeze([]), summary:Object.freeze({ questionCount:generation.questions.length, questionPageCount:questionPages.length, answerKeyPageCount:answerKeyPages.length }) }),
    summary:Object.freeze({ questionCount:generation.questions.length, questionPageCount:questionPages.length, answerKeyPageCount:answerKeyPages.length, numericQuestionCount:generation.questions.length, applicationQuestionCount:0 }),
  });
  return Object.freeze({ ok:true, errors:Object.freeze([]), warnings:Object.freeze([]), worksheetDocument:document, plan, generation, validation, p03f32WorksheetAdapter:P03F32_WORKSHEET_ADAPTER });
}

export const P03F32_CURRENT_ADDED_KP_IDS = Object.freeze([G6B_U01_P03F32_KP_ID]);
export const P03F32_CURRENT_ADDED_SPEC_IDS = G6B_U01_P03F32_SPEC_IDS;
