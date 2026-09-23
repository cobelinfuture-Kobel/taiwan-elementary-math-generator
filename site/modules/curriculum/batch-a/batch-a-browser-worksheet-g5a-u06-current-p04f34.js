import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/index.js";
import {buildG5AU06InlineMathModel} from "./g5a-u06-inline-fraction-display.js";
import {
  buildG5AU06CurrentMixedPlan,
  generateG5AU06CurrentMixedQuestions,
  requestsG5AU06CurrentNumericApplicationMix,
  validateG5AU06CurrentMixedPlan,
  validateG5AU06CurrentMixedQuestions,
} from "./g5a-u06-current-coordinator-p04f34.js";
import {G5A_U06_P03F30_SOURCE_ID} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";

export const G5A_U06_CURRENT_MIXED_WORKSHEET_ADAPTER = Object.freeze({
  task:"G5A_U06_P03F30_FourDirectNumericCapacityAndExistingApplicationMixedFullFix",
  status:"existing_public_numeric_and_application_same_unit_mix_connected",
  sourceId:G5A_U06_P03F30_SOURCE_ID,
  fourDirectNumericCapacity:240,
  hiddenApplicationLineagePromoted:false,
  publicApplicationKnowledgePointCount:1,
  sharedPagination:true,
  sharedRenderer:true,
  structuredFractionDisplay:true,
  parallelPipeline:false,
});

function knowledgePointId(question) {
  return question.knowledgePointId ?? question.metadata?.knowledgePointId;
}

function patternGroupId(question) {
  return question.patternGroupId ?? question.metadata?.patternGroupId;
}

export function buildG5AU06CurrentMixedWorksheetDocument(options = {}) {
  if (!requestsG5AU06CurrentNumericApplicationMix(options)) return null;
  const plan = buildG5AU06CurrentMixedPlan(options);
  const planValidation = validateG5AU06CurrentMixedPlan(plan);
  if (!planValidation.ok) return Object.freeze({ ok:false, errors:planValidation.errors, warnings:Object.freeze([]), worksheetDocument:null, plan, validation:planValidation });
  const generation = generateG5AU06CurrentMixedQuestions({ ...options, plan });
  const validation = validateG5AU06CurrentMixedQuestions(generation.questions ?? []);
  if (!generation.ok || !validation.ok) return Object.freeze({ ok:false, errors:Object.freeze([...(generation.errors ?? []), ...(validation.errors ?? [])]), warnings:Object.freeze([]), worksheetDocument:null, plan, generation, validation });
  const layout = Object.freeze({ paperSize:options.printLayout?.paperSize ?? "A4", columns:Math.min(options.printLayout?.columns ?? 2, 2), rowsPerPage:Math.min(options.printLayout?.rowsPerPage ?? 4, 4), showQuestionNumbers:options.printLayout?.showQuestionNumbers !== false, showAnswerKeyPage:options.includeAnswerKey !== false && options.printLayout?.showAnswerKeyPage !== false, longTextCardPolicy:"avoidSplit", questionMode:"mixed" });
  const models = generation.questions.map((question, index) => Object.freeze({
    questionId:question.id,
    questionNumber:index + 1,
    patternId:question.patternSpecId,
    knowledgePointId:knowledgePointId(question),
    patternGroupId:patternGroupId(question),
    questionNumberText:layout.showQuestionNumbers ? `${index + 1}.` : null,
    promptText:question.blankedDisplayText,
    displayText:question.displayText,
    blankedDisplayText:question.blankedDisplayText,
    answerText:question.answerText,
    promptInlineMath:buildG5AU06InlineMathModel({ sourceId:G5A_U06_P03F30_SOURCE_ID, plainText:question.blankedDisplayText }),
    metadataSnapshot:question.metadata,
    layoutHints:Object.freeze({ estimatedTextLength:question.blankedDisplayText.length, hasGrouping:false, avoidPageBreakInside:true, representation:question.questionMode === "application" ? "measurement_fraction_application" : "fraction_numeric", longTextCardPolicy:"avoidSplit" }),
  }));
  const answers = layout.showAnswerKeyPage ? generation.questions.map((question, index) => Object.freeze({
    questionId:question.id,
    questionNumber:index + 1,
    patternId:question.patternSpecId,
    knowledgePointId:knowledgePointId(question),
    patternGroupId:patternGroupId(question),
    promptText:question.blankedDisplayText,
    answerText:question.answerText,
    promptInlineMath:buildG5AU06InlineMathModel({ sourceId:G5A_U06_P03F30_SOURCE_ID, plainText:question.blankedDisplayText }),
    answerInlineMath:buildG5AU06InlineMathModel({ sourceId:G5A_U06_P03F30_SOURCE_ID, plainText:question.answerText }),
    metadataSnapshot:question.metadata,
    layoutHints:Object.freeze({ avoidPageBreakInside:true, representation:question.questionMode === "application" ? "fraction_measure_answer" : "fraction_numeric_answer" }),
  })) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...layout, columns:2, rowsPerPage:4 }) : [];
  const numericQuestionCount = generation.questions.filter((question) => question.questionMode === "numeric").length;
  const applicationQuestionCount = generation.questions.filter((question) => question.questionMode === "application").length;
  const document = Object.freeze({
    schemaVersion:"worksheet-document-v1",
    version:"1",
    worksheetId:`g5a-u06-current-mixed-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind:"batchAWorksheet",
    title:options.title ?? "五年級上｜異分母分數加減",
    subtitle:"數字題＋既有應用題",
    generatedAt:"DETERMINISTIC",
    configSnapshot:Object.freeze({ ...plan, printLayout:layout }),
    orderingMode:plan.ordering,
    questionCount:generation.questions.length,
    questionPages:Object.freeze(questionPages),
    answerKeyPages:Object.freeze(answerKeyPages),
    sections:Object.freeze([]),
    generatedQuestions:generation.questions,
    questions:generation.questions,
    questionDisplayModels:Object.freeze(models),
    answerKeyItems:Object.freeze(answers),
    printOptions:Object.freeze({ ...layout, answerKeyColumns:2, answerKeyRowsPerPage:4, showAnswerKey:layout.showAnswerKeyPage, answerKeyPlacement:layout.showAnswerKeyPage ? "afterQuestions" : "none" }),
    publicControls:Object.freeze({ sourceId:G5A_U06_P03F30_SOURCE_ID, questionMode:"mixed", requestedQuestionType:"mixed", productAdmissionTask:G5A_U06_CURRENT_MIXED_WORKSHEET_ADAPTER.task, globalContextRegistry:null }),
    metadata:Object.freeze({ sourceId:G5A_U06_P03F30_SOURCE_ID, knowledgePointIds:plan.selectedKnowledgePointIds, patternSpecIds:plan.patternSpecIds, existingPublicNumericApplicationComposition:true, hiddenApplicationLineagePromoted:false, sharedFractionArithmetic:true, structuredFractionDisplay:true, worksheetAdapter:G5A_U06_CURRENT_MIXED_WORKSHEET_ADAPTER }),
    batchA:Object.freeze({ sourceId:G5A_U06_P03F30_SOURCE_ID, questionMode:"mixed", selectionMode:plan.selectionMode }),
    report:Object.freeze({ ok:true, errors:Object.freeze([]), warnings:Object.freeze([]), summary:Object.freeze({ questionCount:generation.questions.length, questionPageCount:questionPages.length, answerKeyPageCount:answerKeyPages.length }) }),
    summary:Object.freeze({ questionCount:generation.questions.length, questionPageCount:questionPages.length, answerKeyPageCount:answerKeyPages.length, numericQuestionCount, applicationQuestionCount }),
  });
  return Object.freeze({ ok:true, errors:Object.freeze([]), warnings:Object.freeze([]), worksheetDocument:document, plan, generation, validation, g5aU06CurrentMixedWorksheetAdapter:G5A_U06_CURRENT_MIXED_WORKSHEET_ADAPTER });
}
