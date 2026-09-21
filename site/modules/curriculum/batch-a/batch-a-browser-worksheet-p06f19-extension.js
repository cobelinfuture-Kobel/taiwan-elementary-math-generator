import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions} from "./batch-a-browser-generator-p06f19.js";
import {validateG6BU05P06F19Question} from "./g6b-u05-sum-difference-runtime-p06f19.js";
import {G6B_U05_P06F19_KP_ID as KP,G6B_U05_P06F19_SOURCE_ID as SRC} from "../registry/g6b-u05-sum-difference-selector-projection-p06f19.js";
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),3):2,rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),6):4,showQuestionNumbers:p.showQuestionNumbers!==false,showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,patternGroupId:q.patternGroupId,promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"numeric"}),layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"numeric",representation:"text-numeric-sum-difference"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,answerText:q.answerText,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"numeric",representation:"text-numeric-sum-difference"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P06F19_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6BU05P06F19Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P06F19_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",
    worksheetId:"p06f19-"+SRC+"-"+(o.generationSeed??"public"),
    title:"怎樣解題｜和差問題",
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
      taskId:"P06F_W6DirectProductVerticalSlice019Implementation",
      sourceId:SRC,
      knowledgePointId:KP,
      questionMode:"numeric",
      knownSumAndDifferenceUsed:true,
      sumReconstructionValidated:true,
      differenceReconstructionValidated:true,
      exactIntegerPartitionValidated:true,
      profileIsRuntimeEnvelopeOnly:true,
      decimalPlaceValueSemanticCore:false,
      decimalNotationSemanticCore:false,
      sourceContextRepresentationOnly:true,
      sumMultipleProblemReowned:false,
      differenceMultipleProblemReowned:false,
      ageOrRepeatedRelationProblemReowned:false,
      workOrDistributionStrategyReowned:false,
      q020Reowned:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q020OrLaterTouched:false,
      sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
      frozenRuntimeProfile:"profile_decimal"
    }),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,applicationQuestionCount:0})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p06f19Implemented:true,q020OrLaterTouched:false});
}
