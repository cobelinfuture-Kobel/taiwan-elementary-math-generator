import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as baseBuild } from "./batch-a-browser-worksheet-p03f32-extension.js";
import { G4A_U06_P03F33_KP_IDS, G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS, G4A_U06_P03F33_SOURCE_ID } from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";
import { buildG4AU06InlineMathModel } from "./g4a-u06-inline-fraction-display.js";
import {
  buildG4AU06CurrentPlan,
  generateG4AU06CurrentQuestions,
  validateG4AU06CurrentPlan,
  validateG4AU06CurrentQuestions,
} from "./g4a-u06-current-coordinator.js";
export const P03F33_WORKSHEET_ADAPTER=Object.freeze({task:"P03F_W3DirectProductVerticalSlice033Implementation",status:"bounded_shared_rank9_fraction_existing_source_connected",sourceId:G4A_U06_P03F33_SOURCE_ID,currentVisibleKnowledgePointCount:5,currentHiddenKnowledgePointCount:1,addedKnowledgePointCount:3,addedPatternSpecCount:4,numericPatternSpecCount:4,applicationPatternSpecCount:0,sharedFractionArithmetic:true,sharedPagination:true,sharedRenderer:true,parallelPipeline:false});
export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (
    options.sourceId
    !== G4A_U06_P03F33_SOURCE_ID
  ) {
    return baseBuild(options);
  }

  const plan =
    buildG4AU06CurrentPlan(options);

  const planValidation =
    validateG4AU06CurrentPlan(plan);

  if (!planValidation.ok) {
    return {
      ok: false,
      errors: planValidation.errors,
      warnings: planValidation.warnings,
      worksheetDocument: null,
      plan,
      validation: planValidation,
    };
  }

  const generation =
    generateG4AU06CurrentQuestions({
      ...options,
      plan,
    });

  const validation =
    validateG4AU06CurrentQuestions(
      generation.questions,
    );

  if (!generation.ok || !validation.ok) {
    return {
      ok: false,
      errors: [
        ...(generation.errors ?? []),
        ...(validation.errors ?? []),
      ],
      warnings: [
        ...(generation.warnings ?? []),
        ...(validation.warnings ?? []),
      ],
      worksheetDocument: null,
      plan,
      generation,
      validation,
    };
  }
  const layout=Object.freeze({paperSize:options.printLayout?.paperSize??"A4",columns:Math.min(options.printLayout?.columns??2,2),rowsPerPage:Math.min(options.printLayout?.rowsPerPage??4,4),showQuestionNumbers:options.printLayout?.showQuestionNumbers!==false,showAnswerKeyPage:options.includeAnswerKey!==false&&options.printLayout?.showAnswerKeyPage!==false,longTextCardPolicy:"avoidSplit",questionMode:"numeric"});
  const models=generation.questions.map((question,index)=>Object.freeze({questionId:question.id,questionNumber:index+1,patternId:question.patternSpecId,knowledgePointId:question.metadata.knowledgePointId,patternGroupId:question.metadata.patternGroupId,questionNumberText:layout.showQuestionNumbers?`${index+1}.`:null,promptText:question.blankedDisplayText,displayText:question.displayText,blankedDisplayText:question.blankedDisplayText,answerText:question.answerText,promptInlineMath:buildG4AU06InlineMathModel({sourceId:G4A_U06_P03F33_SOURCE_ID,plainText:question.blankedDisplayText}),metadataSnapshot:question.metadata,layoutHints:Object.freeze({estimatedTextLength:question.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,representation:"rank9_fraction_numeric",longTextCardPolicy:"avoidSplit"})}));
  const answers=layout.showAnswerKeyPage?generation.questions.map((question,index)=>Object.freeze({questionId:question.id,questionNumber:index+1,patternId:question.patternSpecId,knowledgePointId:question.metadata.knowledgePointId,patternGroupId:question.metadata.patternGroupId,promptText:question.blankedDisplayText,answerText:question.answerText,promptInlineMath:buildG4AU06InlineMathModel({sourceId:G4A_U06_P03F33_SOURCE_ID,plainText:question.blankedDisplayText}),answerInlineMath:buildG4AU06InlineMathModel({sourceId:G4A_U06_P03F33_SOURCE_ID,plainText:question.answerText}),metadataSnapshot:question.metadata,layoutHints:Object.freeze({avoidPageBreakInside:true,representation:"rank9_fraction_numeric_answer"})})):[];
  const questionPages=paginateQuestionDisplayModels(models,layout); const answerKeyPages=layout.showAnswerKeyPage?paginateAnswerKeyItems(answers,{...layout,columns:2,rowsPerPage:4}):[]; const selectedKps=Object.freeze([...new Set(generation.questions.map((q)=>q.metadata.knowledgePointId))]);
  const document=Object.freeze({schemaVersion:"worksheet-document-v1",version:"1",worksheetId:g4a-u06-current-${plan.questionCount}-${plan.generationSeed}`,worksheetKind:"batchAWorksheet",title:options.title??"四年級上｜假分數與帶分數｜比較、數線與加減",subtitle:"假分數與帶分數比較、數線定位、同分母帶分數加減",generatedAt:"DETERMINISTIC",configSnapshot:Object.freeze({...plan,printLayout:layout}),orderingMode:plan.ordering,questionCount:generation.questions.length,questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),sections:Object.freeze([]),generatedQuestions:Object.freeze(generation.questions),questions:Object.freeze(generation.questions),questionDisplayModels:Object.freeze(models),answerKeyItems:Object.freeze(answers),printOptions:Object.freeze({...layout,answerKeyColumns:2,answerKeyRowsPerPage:4,showAnswerKey:layout.showAnswerKeyPage,answerKeyPlacement:layout.showAnswerKeyPage?"afterQuestions":"none"}),publicControls:Object.freeze({sourceId:G4A_U06_P03F33_SOURCE_ID,questionMode:"numeric",productAdmissionTask:P03F33_WORKSHEET_ADAPTER.task,globalContextRegistry:null}),metadata:Object.freeze({sourceId:G4A_U06_P03F33_SOURCE_ID,knowledgePointIds:selectedKps,applicationExpansion:false,hiddenApplicationLineagePreserved:true,worksheetAdapter:P03F33_WORKSHEET_ADAPTER}),batchA:Object.freeze({sourceId:G4A_U06_P03F33_SOURCE_ID,questionMode:"numeric",selectionMode:plan.selectionMode}),report:Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length})}),summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,numericQuestionCount:generation.questions.length,applicationQuestionCount:0})});
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument:document,plan,generation,validation,p03f33WorksheetAdapter:P03F33_WORKSHEET_ADAPTER});
}
export const P03F33_CURRENT_ADDED_KP_IDS=G4A_U06_P03F33_KP_IDS; export const P03F33_CURRENT_ADDED_SPEC_IDS=G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS;
