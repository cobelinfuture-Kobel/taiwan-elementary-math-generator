import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP08F17} from "./batch-a-browser-generator-p08f17.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p08f16-extension.js";
import {validateG6AU06P08F17Question} from "./g6a-u06-composite-arc-perimeter-runtime-p08f17.js";
import {G6A_U06_P08F17_KP_ID as KP,G6A_U06_P08F17_SOURCE_ID as SRC} from "../registry/g6a-u06-composite-arc-perimeter-selector-projection-p08f17.js";

function layout(o={}){
  const p=o.printLayout??{},requestedColumns=Number.isInteger(p.columns)?Math.max(p.columns,1):2,requestedRows=Number.isInteger(p.rowsPerPage)?Math.max(p.rowsPerPage,1):3,columns=Math.min(requestedColumns,2),rowsPerPage=Math.min(requestedRows,3);
  return Object.freeze({paperSize:p.paperSize??"A4",columns,rowsPerPage,requestedColumns,requestedRowsPerPage:requestedRows,layoutAdjustedForP08F17:columns!==requestedColumns||rowsPerPage!==requestedRows,showQuestionNumbers:p.showQuestionNumbers!==false,showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});
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
    geometryDiagram:q.geometryDiagram,
    metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"diagram"}),
    layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"diagram",representation:"composite_arc_perimeter_diagram",maxSafeColumns:2,maxSafeRowsPerPage:3})
  }));
}
function answers(qs,m){
  return qs.map((q,i)=>Object.freeze({
    questionId:q.id,
    questionNumber:i+1,
    patternId:q.patternSpecId,
    promptText:q.blankedDisplayText,
    answerText:q.answerText,
    geometryDiagram:Object.freeze({...q.geometryDiagram,answerKeyCompact:true}),
    metadataSnapshot:m[i].metadataSnapshot,
    layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"diagram",representation:"composite_arc_perimeter_diagram",maxSafeColumns:2,maxSafeRowsPerPage:3})
  }));
}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP08F17(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P08F17_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6AU06P08F17Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P08F17_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",
    worksheetId:"p08f17-"+SRC+"-"+String(o.generationSeed??"public"),
    title:"圓周長與扇形周長｜複合弧形周長",
    generatedQuestions:generation.questions,
    questions:generation.questions,
    questionDisplayModels:Object.freeze(m),
    answerKeyItems:Object.freeze(a),
    questionPages:Object.freeze(questionPages),
    answerKeyPages:Object.freeze(answerKeyPages),
    questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"diagram",questionCountMax:240}),
    configSnapshot:Object.freeze({questionMode:"diagram",printLayout:l}),
    batchA:Object.freeze({sourceId:SRC,questionMode:"diagram",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({
      taskId:"P08F_W8DirectProductVerticalSlice017Implementation",
      sourceId:SRC,
      knowledgePointId:KP,
      questionMode:"diagram",
      sourceBackedCompositeArcPerimeter:true,
      externalBoundaryOnly:true,
      internalSharedEdgesExcluded:true,
      q004PiCircumferenceRelationTeachingReowned:false,
      q006CircleCircumferenceFormulaTeachingReowned:false,
      q010SemicirclePerimeterTeachingReowned:false,
      q015SectorArcLengthTeachingReowned:false,
      sectorAreaUsed:false,
      compositeCircleAreaUsed:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q018OrLaterTouched:false,
      sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
      frozenRuntimeProfile:"profile_geometry_formula",
      humanVisualReviewRequired:true
    }),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,diagramQuestionCount:generation.questions.length,applicationQuestionCount:0,learnerVisualReviewRequired:true})
  });
  const warnings=l.layoutAdjustedForP08F17?Object.freeze(["P08F17_DIAGRAM_LAYOUT_FORCED_TO_TWO_COLUMNS_THREE_ROWS_FOR_HUMAN_READABILITY"]):Object.freeze([]);
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings,worksheetDocument,generation,p08f17Implemented:true,q018OrLaterTouched:false,learnerVisualReviewRequired:true});
}
