import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP07F06} from "./batch-a-browser-generator-p07f06.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p07f05-extension.js";
import {validateG6AU06P07F06Question} from "./g6a-u06-circle-circumference-formula-runtime-p07f06.js";
import {G6A_U06_P07F06_KP_ID as KP,G6A_U06_P07F06_SOURCE_ID as SRC} from "../registry/g6a-u06-circle-circumference-formula-selector-projection-p07f06.js";
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),3):2,rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),6):4,showQuestionNumbers:p.showQuestionNumbers!==false,showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,patternGroupId:q.patternGroupId,promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,geometryDiagram:q.geometryDiagram,metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"diagram"}),layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"diagram",representation:"circle_parts_diagram"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,answerText:q.answerText,geometryDiagram:q.geometryDiagram,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"diagram",representation:"circle_parts_diagram"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP07F06(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P07F06_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6AU06P07F06Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P07F06_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",worksheetId:"p07f06-"+SRC+"-"+(o.generationSeed??"public"),title:"圓周長與扇形周長｜圓周長公式",
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(m),answerKeyItems:Object.freeze(a),questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"diagram",questionCountMax:240}),configSnapshot:Object.freeze({questionMode:"diagram",printLayout:l}),batchA:Object.freeze({sourceId:SRC,questionMode:"diagram",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice006Implementation",sourceId:SRC,knowledgePointId:KP,questionMode:"diagram",sourceBackedDiagram:true,frozenRuntimeProfile:"profile_geometry_formula",q004PiRelationPrerequisitePreserved:true,multiplicationPrerequisitePreserved:true,circleCircumferenceFormulaOwned:true,semicirclePerimeterReowned:false,sectorArcLengthReowned:false,compositeArcPerimeterReowned:false,rollingWheelDistanceApplicationUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q007OrLaterTouched:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,diagramQuestionCount:generation.questions.length,applicationQuestionCount:0})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p07f06Implemented:true,q004ProductMutation:false,q005ProductMutation:false,q007OrLaterTouched:false});
}
