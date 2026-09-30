import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP08F22} from "./batch-a-browser-generator-p08f22.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p08f21-extension.js";
import {validateG6AU08P08F22Question} from "./g6a-u08-speed-unit-conversion-runtime-p08f22.js";
import {G6A_U08_P08F22_KP_ID as KP,G6A_U08_P08F22_SOURCE_ID as SRC} from "../registry/g6a-u08-speed-unit-conversion-selector-projection-p08f22.js";
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),2):2,
  rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),5):4,showQuestionNumbers:p.showQuestionNumbers!==false,showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,patternGroupId:q.patternGroupId,
  promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,
  metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"numeric",answerUnit:q.answerUnit}),
  layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"numeric",representation:"speed_unit_conversion"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,
  answerText:q.patternRepresentation.answerWithUnitText,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"numeric",representation:"speed_unit_conversion"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP08F22(o))return baseWorksheet(o);const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P08F22_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6AU08P08F22Question(q).errors);if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P08F22_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({worksheetKind:"batch_a",worksheetId:"p08f22-"+SRC+"-"+String(o.generationSeed??"public"),title:"認識速率｜速率單位換算",
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(m),answerKeyItems:Object.freeze(a),questionPages:Object.freeze(questionPages),
    answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",questionCountMax:240}),configSnapshot:Object.freeze({questionMode:"numeric",printLayout:l}),
    batchA:Object.freeze({sourceId:SRC,questionMode:"numeric",selectionMode:"singleKnowledgePoint"}),metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice022Implementation",
      sourceId:SRC,knowledgePointId:KP,questionMode:"numeric",sourceBackedSpeedUnitConversion:true,coupledDistanceTimeScalingRequired:true,equivalentRateInvariantRequired:true,
      answerBackConversionRequired:true,speedDistanceTimeRelationTeachingReowned:false,averageSpeedReowned:false,relativeSpeedMeetingChasingReowned:false,
      effectiveSpeedCurrentWindReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
      frozenRuntimeProfile:"profile_speed_rate",finalFrozenW8Slice:true,w8FrozenQueueComplete:true}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,numericQuestionCount:generation.questions.length,applicationQuestionCount:0})});
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p08f22Implemented:true,postW8Touched:false});
}
