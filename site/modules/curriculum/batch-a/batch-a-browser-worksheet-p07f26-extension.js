import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP07F26} from "./batch-a-browser-generator-p07f26.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p07f25-extension.js";
import {validateG6AU08P07F26Question} from "./g6a-u08-effective-speed-current-wind-runtime-p07f26.js";
import {G6A_U08_P07F26_KP_ID as KP,G6A_U08_P07F26_SOURCE_ID as SRC} from "../registry/g6a-u08-effective-speed-current-wind-selector-projection-p07f26.js";
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),2):2,
  rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),5):4,showQuestionNumbers:p.showQuestionNumbers!==false,
  showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,
  patternGroupId:q.patternGroupId,promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,
  questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,
  knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"numeric"}),layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,
  avoidPageBreakInside:true,questionMode:"numeric",representation:"text_application_effective_speed_current_wind"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,
  answerText:q.answerText,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"numeric",representation:"text_application_effective_speed_current_wind"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP07F26(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P07F26_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6AU08P07F26Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P07F26_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],
    questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",worksheetId:"p07f26-"+SRC+"-"+(o.generationSeed??"public"),title:"認識速率｜順逆流與有效速率",
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(m),answerKeyItems:Object.freeze(a),
    questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",questionCountMax:240}),configSnapshot:Object.freeze({questionMode:"numeric",printLayout:l}),
    batchA:Object.freeze({sourceId:SRC,questionMode:"numeric",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice026Implementation",sourceId:SRC,knowledgePointId:KP,questionMode:"numeric",frozenRuntimeProfile:"profile_speed_rate",
      effectiveSpeedCurrentWindOwnership:true,computeEffectiveSpeedFromOwnAndCurrentWindRequired:true,sameDirectionAdditionRequired:true,oppositeDirectionSubtractionRequired:true,
      positiveOpposingEffectiveSpeedRequired:true,answerBackSubstitutionRequired:true,reverseSolveOwnSpeedAllowed:false,reverseSolveCurrentWindSpeedAllowed:false,
      speedUnitConversionOwnership:false,averageSpeedReowned:false,relativeSpeedMeetingChasingReowned:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,
      finalFrozenW7Slice:true,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,applicationQuestionCount:generation.questions.length})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p07f26Implemented:true,q025ProductMutation:false,w7FrozenQueueComplete:true});
}
