import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP07F12} from "./batch-a-browser-generator-p07f12.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p07f11-extension.js";
import {validateG6AU09P07F12Question} from "./g6a-u09-scale-area-change-runtime-p07f12.js";
import {G6A_U09_P07F12_KP_ID as KP,G6A_U09_P07F12_SOURCE_ID as SRC} from "../registry/g6a-u09-scale-area-change-selector-projection-p07f12.js";
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),2):2,rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),4):3,showQuestionNumbers:p.showQuestionNumbers!==false,showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,patternGroupId:q.patternGroupId,promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,geometryDiagram:q.geometryDiagram,metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"diagram"}),layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"diagram",representation:"scale-area-change-diagram"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,answerText:q.answerText,geometryDiagram:q.geometryDiagram,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"diagram",representation:"scale-area-change-diagram"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP07F12(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P07F12_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6AU09P07F12Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P07F12_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",worksheetId:"p07f12-"+SRC+"-"+(o.generationSeed??"public"),title:"放大圖縮圖與比例尺｜比例縮放與面積變化",
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(m),answerKeyItems:Object.freeze(a),questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"diagram",questionCountMax:240}),configSnapshot:Object.freeze({questionMode:"diagram",printLayout:l}),batchA:Object.freeze({sourceId:SRC,questionMode:"diagram",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice012Implementation",sourceId:SRC,knowledgePointId:KP,questionMode:"diagram",frozenRuntimeProfile:"profile_geometry_formula",rectangleAreaFormulaPrerequisitePreserved:true,scaleFactorLengthPrerequisitePreserved:true,scaleAreaChangeOwned:true,areaSquareRelationValidated:true,q007LengthScaleFactorPrerequisiteTeachingReowned:false,similarShapeAngleTeachingReowned:false,scaleDrawingConstructionReowned:false,mapScaleDistanceReowned:false,mapScaleBarInterpretationUsed:false,genericGeometryAreaFormulaReowned:false,sourceBackedRectangleApplicationAllowed:true,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q013OrLaterTouched:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,diagramQuestionCount:generation.questions.length,applicationQuestionCount:generation.questions.filter(q=>q.patternRepresentation.applicationContextUsed).length})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p07f12Implemented:true,q011ProductMutation:false,q013OrLaterTouched:false});
}
