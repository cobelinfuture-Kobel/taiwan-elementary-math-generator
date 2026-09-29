import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP08F18} from "./batch-a-browser-generator-p08f18.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p08f17-extension.js";
import {validateG6BU06P08F18Question} from "./g6b-u06-pie-chart-percent-angle-conversion-runtime-p08f18.js";
import {G6B_U06_P08F18_KP_ID as KP,G6B_U06_P08F18_SOURCE_ID as SRC} from "../registry/g6b-u06-pie-chart-percent-angle-conversion-selector-projection-p08f18.js";

function layout(o={}){
  const p=o.printLayout??{},requestedColumns=Number.isInteger(p.columns)?Math.max(p.columns,1):2,requestedRows=Number.isInteger(p.rowsPerPage)?Math.max(p.rowsPerPage,1):4,columns=Math.min(requestedColumns,2),rowsPerPage=Math.min(requestedRows,4);
  return Object.freeze({paperSize:p.paperSize??"A4",columns,rowsPerPage,requestedColumns,requestedRowsPerPage:requestedRows,layoutAdjustedForP08F18:columns!==requestedColumns||rowsPerPage!==requestedRows,showQuestionNumbers:p.showQuestionNumbers!==false,showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});
}
function models(qs,l){
  return qs.map((q,i)=>Object.freeze({
    questionId:q.id,
    questionNumber:i+1,
    patternId:q.patternSpecId,
    knowledgePointId:q.knowledgePointId,
    patternGroupId:q.patternGroupId,
    promptText:q.blankedDisplayText,
    displayText:q.displayText,
    blankedDisplayText:q.blankedDisplayText,
    answerText:q.answerText,
    questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,
    metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"numeric"}),
    layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"numeric",representation:"text_application",maxSafeColumns:2,maxSafeRowsPerPage:4})
  }));
}
function answers(qs,m){
  return qs.map((q,i)=>Object.freeze({
    questionId:q.id,
    questionNumber:i+1,
    patternId:q.patternSpecId,
    promptText:q.blankedDisplayText,
    answerText:q.answerText,
    metadataSnapshot:m[i].metadataSnapshot,
    layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"numeric",representation:"text_application",maxSafeColumns:2,maxSafeRowsPerPage:4})
  }));
}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP08F18(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P08F18_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6BU06P08F18Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P08F18_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",
    worksheetId:"p08f18-"+SRC+"-"+String(o.generationSeed??"public"),
    title:"圓形圖｜百分率與圓心角換算",
    generatedQuestions:generation.questions,
    questions:generation.questions,
    questionDisplayModels:Object.freeze(m),
    answerKeyItems:Object.freeze(a),
    questionPages:Object.freeze(questionPages),
    answerKeyPages:Object.freeze(answerKeyPages),
    questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",questionCountMax:240}),
    configSnapshot:Object.freeze({questionMode:"numeric",printLayout:l}),
    batchA:Object.freeze({sourceId:SRC,questionMode:"numeric",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({
      taskId:"P08F_W8DirectProductVerticalSlice018Implementation",
      sourceId:SRC,
      knowledgePointId:KP,
      questionMode:"numeric",
      sourceBackedPercentAngleConversion:true,
      percentToCentralAngleIsCore:true,
      centralAngleToPercentIsCore:true,
      fullCircle100Percent360DegreesBound:true,
      q014PartWholeTeachingReowned:false,
      q016ComparePieChartsTeachingReowned:false,
      q021QuantityFromRateTeachingReowned:false,
      pieChartConstructionUsed:false,
      genericSectorGeometryTeachingUsed:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q019OrLaterTouched:false,
      sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
      frozenRuntimeProfile:"profile_ratio_percent",
      humanVisualReviewRequired:false
    }),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,numericQuestionCount:generation.questions.length,applicationQuestionCount:0,learnerVisualReviewRequired:false})
  });
  const warnings=l.layoutAdjustedForP08F18?Object.freeze(["P08F18_LAYOUT_CLAMPED_TO_TWO_COLUMNS_FOUR_ROWS"]):Object.freeze([]);
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings,worksheetDocument,generation,p08f18Implemented:true,q019OrLaterTouched:false,learnerVisualReviewRequired:false});
}
