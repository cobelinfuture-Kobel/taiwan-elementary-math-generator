import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions} from "./batch-a-browser-generator-p05f3.js";
import {validateG3BU05P05F3Question} from "./g3b-u05-square-centimeter-unit-runtime-p05f3.js";
import {G3B_U05_P05F3_KP_ID,G3B_U05_P05F3_SOURCE_ID} from "../registry/g3b-u05-square-centimeter-unit-selector-projection-p05f3.js";

function printLayout(options={}) {
  const input=options.printLayout??{};
  return Object.freeze({
    paperSize:input.paperSize??"A4",
    columns:Number.isInteger(input.columns)?input.columns:2,
    rowsPerPage:Number.isInteger(input.rowsPerPage)?input.rowsPerPage:4,
    showQuestionNumbers:input.showQuestionNumbers!==false,
    showAnswerKeyPage:options.includeAnswerKey!==false&&input.showAnswerKeyPage!==false,
  });
}
function displayModels(questions,layout) {
  return questions.map((question,index)=>Object.freeze({
    questionId:question.id,
    questionNumber:index+1,
    patternId:question.patternSpecId,
    displayText:question.displayText,
    blankedDisplayText:question.blankedDisplayText,
    answerText:question.answerText,
    questionNumberText:layout.showQuestionNumbers?`${index+1}.`:null,
    geometryDiagram:question.geometryDiagram,
    metadataSnapshot:Object.freeze({...question.metadata,questionSignature:question.questionSignature,sourceId:question.sourceId,knowledgePointId:question.knowledgePointId,questionMode:"diagram"}),
    layoutHints:Object.freeze({estimatedTextLength:question.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"diagram",representation:"square_centimeter_unit_diagram"}),
  }));
}
function answerItems(questions,models) {
  return questions.map((question,index)=>Object.freeze({
    questionId:question.id,
    questionNumber:index+1,
    patternId:question.patternSpecId,
    promptText:question.blankedDisplayText,
    answerText:question.answerText,
    geometryDiagram:question.geometryDiagram,
    metadataSnapshot:models[index].metadataSnapshot,
    layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"diagram",representation:"square_centimeter_unit_diagram"}),
  }));
}

export function buildBatchABrowserWorksheetDocument(options={}) {
  const generation=generateBatchABrowserQuestions(options);
  if (!generation?.ok) return Object.freeze({ok:false,errors:generation?.errors??["P05F3_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const validationErrors=generation.questions.flatMap((question)=>validateG3BU05P05F3Question(question).errors);
  if (validationErrors.length>0) return Object.freeze({ok:false,errors:Object.freeze(validationErrors),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const layout=printLayout(options),models=displayModels(generation.questions,layout),answers=layout.showAnswerKeyPage?answerItems(generation.questions,models):[];
  const questionPages=paginateQuestionDisplayModels(models,layout),answerKeyPages=layout.showAnswerKeyPage?paginateAnswerKeyItems(answers,layout):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",
    worksheetId:`p05f3-${G3B_U05_P05F3_SOURCE_ID}-${options.generationSeed??"public"}`,
    title:"面積與平方公分",
    generatedQuestions:generation.questions,
    questions:generation.questions,
    questionDisplayModels:Object.freeze(models),
    answerKeyItems:Object.freeze(answers),
    questionPages:Object.freeze(questionPages),
    answerKeyPages:Object.freeze(answerKeyPages),
    questionCount:generation.questions.length,
    printOptions:Object.freeze({...layout,showAnswerKey:layout.showAnswerKeyPage,answerKeyPlacement:layout.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:G3B_U05_P05F3_SOURCE_ID,questionMode:"diagram",questionCountMax:240}),
    configSnapshot:Object.freeze({questionMode:"diagram",printLayout:layout}),
    batchA:Object.freeze({sourceId:G3B_U05_P05F3_SOURCE_ID,questionMode:"diagram",selectionMode:options.selectionMode??"sourceUnit"}),
    metadata:Object.freeze({taskId:"P05F_W5DirectProductVerticalSlice003Implementation",sourceId:G3B_U05_P05F3_SOURCE_ID,knowledgePointId:G3B_U05_P05F3_KP_ID,questionMode:"diagram",sourceBackedDiagram:true,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",q001SemanticsTouched:false,q002SemanticsTouched:false,applicationContextUsed:false,gridCountingUsed:false,areaFormulaUsed:false,perimeterComputationUsed:false}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,diagramQuestionCount:generation.questions.length,applicationQuestionCount:0}),
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p05f3Implemented:true,q001SemanticsTouched:false,q002SemanticsTouched:false});
}
