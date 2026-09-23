import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions} from "./batch-a-browser-generator-p05f13.js";
import {validateG4AU05P05F13Question} from "./g4a-u05-triangle-elements-naming-runtime-p05f13.js";
import {G4A_U05_P05F13_KP_ID,G4A_U05_P05F13_SOURCE_ID} from "../registry/g4a-u05-triangle-elements-naming-selector-projection-p05f13.js";

function printLayout(options={}){const input=options.printLayout??{};return Object.freeze({paperSize:input.paperSize??"A4",columns:Number.isInteger(input.columns)?Math.min(input.columns,2):2,rowsPerPage:Number.isInteger(input.rowsPerPage)?Math.min(input.rowsPerPage,4):4,showQuestionNumbers:input.showQuestionNumbers!==false,showAnswerKeyPage:options.includeAnswerKey!==false&&input.showAnswerKeyPage!==false});}
function displayModels(questions,layout){return questions.map((question,index)=>Object.freeze({questionId:question.id,questionNumber:index+1,patternId:question.patternSpecId,displayText:question.displayText,blankedDisplayText:question.blankedDisplayText,answerText:question.answerText,questionNumberText:layout.showQuestionNumbers?`${index+1}.`:null,geometryDiagram:question.geometryDiagram,metadataSnapshot:Object.freeze({...question.metadata,questionSignature:question.questionSignature,sourceId:question.sourceId,knowledgePointId:question.knowledgePointId,questionMode:"diagram"}),layoutHints:Object.freeze({estimatedTextLength:question.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"diagram",representation:"triangle_elements_naming_diagram"})}));}
function answerItems(questions,models){return questions.map((question,index)=>Object.freeze({questionId:question.id,questionNumber:index+1,patternId:question.patternSpecId,promptText:question.blankedDisplayText,answerText:question.answerText,geometryDiagram:question.geometryDiagram,metadataSnapshot:models[index].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"diagram",representation:"triangle_elements_naming_diagram"})}));}
export function buildBatchABrowserWorksheetDocument(options={}){
  const generation=generateBatchABrowserQuestions(options);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P05F13_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const validationErrors=generation.questions.flatMap(question=>validateG4AU05P05F13Question(question).errors);
  if(validationErrors.length)return Object.freeze({ok:false,errors:Object.freeze(validationErrors),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const layout=printLayout(options),models=displayModels(generation.questions,layout),answers=layout.showAnswerKeyPage?answerItems(generation.questions,models):[],questionPages=paginateQuestionDisplayModels(models,layout),answerKeyPages=layout.showAnswerKeyPage?paginateAnswerKeyItems(answers,layout):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",worksheetId:`p05f13-${G4A_U05_P05F13_SOURCE_ID}-${options.generationSeed??"public"}`,title:"三角形與全等",
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(models),answerKeyItems:Object.freeze(answers),questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,
    printOptions:Object.freeze({...layout,showAnswerKey:layout.showAnswerKeyPage,answerKeyPlacement:layout.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:G4A_U05_P05F13_SOURCE_ID,questionMode:"diagram",questionCountMax:240}),
    configSnapshot:Object.freeze({questionMode:"diagram",printLayout:layout}),
    batchA:Object.freeze({sourceId:G4A_U05_P05F13_SOURCE_ID,questionMode:"diagram",selectionMode:options.selectionMode==="sourceUnit"?"sourceUnit":"singleKnowledgePoint"}),
    metadata:Object.freeze({taskId:"P05F_W5DirectProductVerticalSlice013Implementation",sourceId:G4A_U05_P05F13_SOURCE_ID,knowledgePointId:G4A_U05_P05F13_KP_ID,questionMode:"diagram",sourceBackedTriangleElementsNamingDiagram:true,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",sourceMetadataMismatchPreserved:true,sideClassificationUsed:false,angleClassificationUsed:false,triangleInequalityUsed:false,congruenceCorrespondenceUsed:false,geometryConstructionUsed:false,applicationContextUsed:false,q014OrLaterTouched:false}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,diagramQuestionCount:generation.questions.length,applicationQuestionCount:0}),
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p05f13Implemented:true,q014OrLaterTouched:false});
}
