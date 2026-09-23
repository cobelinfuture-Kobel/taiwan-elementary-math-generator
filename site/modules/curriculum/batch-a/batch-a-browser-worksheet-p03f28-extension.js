import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p03f27-extension.js";
import { buildBatchABrowserPlan, requestsP03F28 } from "./batch-a-browser-generator-p03f28.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router-p03f28.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "./batch-a-browser-validator-p03f28.js";
import { G5A_U01_DECIMAL_READ_PLACE_KP_ID, G5A_U01_DECIMAL_READ_PLACE_SPEC_ID, G5A_U01_SOURCE_ID } from "../registry/g5a-u01-decimal-read-place-selector-projection.js";
import { G5A_U01_P03F28_KP_ID, G5A_U01_P03F28_SPEC_ID } from "../registry/g5a-u01-rank8-decimal-selector-projection-p03f28.js";

export const P03F28_WORKSHEET_ADAPTER=Object.freeze({
  task:"P03F_W3DirectProductVerticalSlice028Implementation",
  status:"bounded_shared_rank8_decimal_connected",
  sourceId:G5A_U01_SOURCE_ID,
  currentVisibleKnowledgePointCount:2,
  currentVisiblePatternSpecCount:2,
  addedKnowledgePointCount:1,
  addedPatternSpecCount:1,
  numericPatternSpecCount:2,
  applicationPatternSpecCount:0,
  sharedPagination:true,
  sharedRenderer:true,
  parallelPipeline:false,
});
const representationFor=(question)=>question.patternSpecId===G5A_U01_P03F28_SPEC_ID?"decimal_compose_decompose":"decimal_read_place";

export function buildBatchABrowserWorksheetDocument(options={}){
  if(!requestsP03F28(options)) return baseBuild(options);
  const plan=buildBatchABrowserPlan(options);
  const planValidation=validateBatchABrowserPlan(plan);
  if(!planValidation.ok) return {ok:false,errors:planValidation.errors,warnings:[],worksheetDocument:null,plan,validation:planValidation};
  const generation=generateBatchABrowserQuestions({...options,plan});
  const validation=validateBatchABrowserQuestions(generation.questions);
  if(!generation.ok||!validation.ok) return {ok:false,errors:[...(generation.errors??[]),...(validation.errors??[])],warnings:[],worksheetDocument:null,plan,generation,validation};
  const layout=Object.freeze({
    paperSize:options.printLayout?.paperSize??"A4",
    columns:Math.min(options.printLayout?.columns??2,2),
    rowsPerPage:Math.min(options.printLayout?.rowsPerPage??4,4),
    showQuestionNumbers:options.printLayout?.showQuestionNumbers!==false,
    showAnswerKeyPage:options.includeAnswerKey!==false&&options.printLayout?.showAnswerKeyPage!==false,
    longTextCardPolicy:"avoidSplit",
    questionMode:"numeric",
  });
  const models=generation.questions.map((question,index)=>Object.freeze({
    questionId:question.id,
    questionNumber:index+1,
    patternId:question.patternSpecId,
    knowledgePointId:question.metadata.knowledgePointId,
    patternGroupId:question.metadata.patternGroupId,
    questionNumberText:layout.showQuestionNumbers?`${index+1}.`:null,
    promptText:question.blankedDisplayText,
    displayText:question.displayText,
    blankedDisplayText:question.blankedDisplayText,
    answerText:question.answerText,
    metadataSnapshot:question.metadata,
    layoutHints:Object.freeze({estimatedTextLength:question.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,representation:representationFor(question),longTextCardPolicy:"avoidSplit"}),
  }));
  const answers=layout.showAnswerKeyPage?generation.questions.map((question,index)=>Object.freeze({
    questionId:question.id,
    questionNumber:index+1,
    patternId:question.patternSpecId,
    knowledgePointId:question.metadata.knowledgePointId,
    patternGroupId:question.metadata.patternGroupId,
    promptText:question.blankedDisplayText,
    answerText:question.answerText,
    metadataSnapshot:question.metadata,
    layoutHints:Object.freeze({avoidPageBreakInside:true,representation:`${representationFor(question)}_answer`}),
  })):[];
  const questionPages=paginateQuestionDisplayModels(models,layout);
  const answerKeyPages=layout.showAnswerKeyPage?paginateAnswerKeyItems(answers,{...layout,columns:2,rowsPerPage:4}):[];
  const observedKnowledgePointIds=[...new Set(generation.questions.map((question)=>question.metadata.knowledgePointId))];
  const document=Object.freeze({
    schemaVersion:"worksheet-document-v1",
    version:"1",
    worksheetId:`p03f28-g5a-u01-rank8-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind:"batchAWorksheet",
    title:options.title??"五年級上｜多位小數與加減｜位值讀法與組成分解",
    subtitle:"多位小數位名、展開式與精確組成",
    generatedAt:"DETERMINISTIC",
    configSnapshot:Object.freeze({...plan,printLayout:layout}),
    orderingMode:plan.ordering,
    questionCount:generation.questions.length,
    questionPages:Object.freeze(questionPages),
    answerKeyPages:Object.freeze(answerKeyPages),
    sections:Object.freeze([]),
    generatedQuestions:Object.freeze(generation.questions),
    questions:Object.freeze(generation.questions),
    questionDisplayModels:Object.freeze(models),
    answerKeyItems:Object.freeze(answers),
    printOptions:Object.freeze({...layout,answerKeyColumns:2,answerKeyRowsPerPage:4,showAnswerKey:layout.showAnswerKeyPage,answerKeyPlacement:layout.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:G5A_U01_SOURCE_ID,questionMode:"numeric",productAdmissionTask:P03F28_WORKSHEET_ADAPTER.task,globalContextRegistry:null}),
    metadata:Object.freeze({sourceId:G5A_U01_SOURCE_ID,knowledgePointIds:Object.freeze(observedKnowledgePointIds),applicationExpansion:false,hiddenApplicationLineagePreserved:true,worksheetAdapter:P03F28_WORKSHEET_ADAPTER}),
    batchA:Object.freeze({sourceId:G5A_U01_SOURCE_ID,questionMode:"numeric",selectionMode:plan.selectionMode}),
    report:Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length})}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,numericQuestionCount:generation.questions.length,applicationQuestionCount:0}),
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument:document,plan,generation,validation,p03f28WorksheetAdapter:P03F28_WORKSHEET_ADAPTER});
}

export const P03F28_CURRENT_VISIBLE_KP_IDS=Object.freeze([G5A_U01_DECIMAL_READ_PLACE_KP_ID,G5A_U01_P03F28_KP_ID]);
export const P03F28_CURRENT_VISIBLE_SPEC_IDS=Object.freeze([G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,G5A_U01_P03F28_SPEC_ID]);
