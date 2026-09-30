import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP08F21} from "./batch-a-browser-generator-p08f21.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p08f20-extension.js";
import {validateG6BU06P08F21Question} from "./g6b-u06-construct-pie-chart-runtime-p08f21.js";
import {G6B_U06_P08F21_KP_ID as KP,G6B_U06_P08F21_SOURCE_ID as SRC} from "../registry/g6b-u06-construct-pie-chart-selector-projection-p08f21.js";
function layout(o={}){
  const p=o.printLayout??{},requestedColumns=Number.isInteger(p.columns)?Math.max(p.columns,1):2,requestedRows=Number.isInteger(p.rowsPerPage)?Math.max(p.rowsPerPage,1):2,
    columns=Math.min(requestedColumns,2),rowsPerPage=Math.min(requestedRows,2);
  return Object.freeze({paperSize:p.paperSize??"A4",columns,rowsPerPage,requestedColumns,requestedRowsPerPage:requestedRows,
    layoutAdjustedForP08F21:columns!==requestedColumns||rowsPerPage!==requestedRows,showQuestionNumbers:p.showQuestionNumbers!==false,
    showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});
}
function models(qs,l){return qs.map((q,i)=>Object.freeze({
  questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,patternGroupId:q.patternGroupId,
  promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,
  questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,tableData:q.tableData,chartData:q.chartData,
  metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"diagram"}),
  layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"diagram",
    representation:"pie_chart_construction_data_p08f21",maxSafeColumns:2,maxSafeRowsPerPage:2})
}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({
  questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,answerText:"答案見完成圖",
  tableData:q.tableData,chartData:q.answerChartData,metadataSnapshot:m[i].metadataSnapshot,
  layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"diagram",representation:"pie_chart_construction_data_p08f21",maxSafeColumns:2,maxSafeRowsPerPage:2})
}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP08F21(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P08F21_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6BU06P08F21Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P08F21_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],
    questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",worksheetId:"p08f21-"+SRC+"-"+String(o.generationSeed??"public"),title:"圓形圖｜繪製圓形圖",
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(m),answerKeyItems:Object.freeze(a),
    questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"diagram",questionCountMax:240}),
    configSnapshot:Object.freeze({questionMode:"diagram",printLayout:l}),batchA:Object.freeze({sourceId:SRC,questionMode:"diagram",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({
      taskId:"P08F_W8DirectProductVerticalSlice021Implementation",sourceId:SRC,knowledgePointId:KP,questionMode:"diagram",
      sourceBackedPieChartConstruction:true,classifiedDataToProportionIsCore:true,percentToCentralAnglePrerequisiteAllowed:true,
      sectorAllocationByAngleIsCore:true,fullCircle100Percent360DegreesBound:true,q014PartWholeTeachingReowned:false,
      q016ComparePieChartsTeachingReowned:false,q021W7QuantityFromRateTeachingReowned:false,q018PercentAngleTeachingReowned:false,
      genericSectorGeometryTeachingUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,
      q022OrLaterTouched:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_ratio_percent",humanVisualReviewRequired:true
    }),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,
      diagramQuestionCount:generation.questions.length,applicationQuestionCount:0,learnerVisualReviewRequired:true})
  });
  const warnings=l.layoutAdjustedForP08F21?Object.freeze(["P08F21_LAYOUT_CLAMPED_TO_TWO_COLUMNS_TWO_ROWS"]):Object.freeze([]);
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings,worksheetDocument,generation,p08f21Implemented:true,q022OrLaterTouched:false,learnerVisualReviewRequired:true});
}
