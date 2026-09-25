import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP07F25} from "./batch-a-browser-generator-p07f25.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p07f24-extension.js";
import {validateG6AU08P07F25Question} from "./g6a-u08-average-relative-speed-runtime-p07f25.js";
import {G6A_U08_P07F25_AVERAGE_KP_ID as AVG_KP,G6A_U08_P07F25_KP_IDS as KPS,G6A_U08_P07F25_SOURCE_ID as SRC} from "../registry/g6a-u08-average-relative-speed-selector-projection-p07f25.js";
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),2):2,
  rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),5):4,showQuestionNumbers:p.showQuestionNumbers!==false,
  showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,
  patternGroupId:q.patternGroupId,promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,
  questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,
  knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"numeric"}),layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,
  avoidPageBreakInside:true,questionMode:"numeric",representation:"text_application_average_relative_speed"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,
  answerText:q.answerText,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"numeric",representation:"text_application_average_relative_speed"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP07F25(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P07F25_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6AU08P07F25Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const kp=generation.plan?.selectedKnowledgePointIds?.[0];if(!KPS.includes(kp)||generation.questions.some(q=>q.knowledgePointId!==kp))
    return Object.freeze({ok:false,errors:Object.freeze(["P07F25_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],
    questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[],avg=kp===AVG_KP;
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",worksheetId:"p07f25-"+SRC+"-"+kp+"-"+(o.generationSeed??"public"),title:"認識速率｜"+(avg?"全程平均速率":"相遇與追趕"),
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(m),answerKeyItems:Object.freeze(a),
    questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",questionCountMax:240}),configSnapshot:Object.freeze({questionMode:"numeric",printLayout:l}),
    batchA:Object.freeze({sourceId:SRC,questionMode:"numeric",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice025Implementation",sourceId:SRC,knowledgePointId:kp,questionMode:"numeric",frozenRuntimeProfile:"profile_speed_rate",
      averageSpeedOwnership:avg,relativeSpeedMeetingChasingOwnership:!avg,totalDistanceOverTotalTimeRequired:avg,directSegmentSpeedArithmeticMeanAllowed:false,
      meetingUsesSpeedSumRequired:!avg,chasingUsesPositiveSpeedDifferenceRequired:!avg,answerBackSubstitutionRequired:true,
      speedUnitConversionOwnership:false,effectiveSpeedCurrentWindOwnership:false,predecessorSpeedRelationReowned:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,
      q026Touched:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,applicationQuestionCount:generation.questions.length})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p07f25Implemented:true,q024ProductMutation:false,q026Touched:false});
}
