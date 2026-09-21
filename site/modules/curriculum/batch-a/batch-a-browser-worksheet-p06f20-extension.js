import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions} from "./batch-a-browser-generator-p06f20.js";
import {validateG6BU05P06F20Question} from "./g6b-u05-age-repeated-relation-runtime-p06f20.js";
import {G6B_U05_P06F20_KP_ID as KP,G6B_U05_P06F20_SOURCE_ID as SRC} from "../registry/g6b-u05-age-repeated-relation-selector-projection-p06f20.js";
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),3):2,rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),6):4,showQuestionNumbers:p.showQuestionNumbers!==false,showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,patternGroupId:q.patternGroupId,promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"numeric"}),layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"numeric",representation:"text-numeric-age-relation"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,answerText:q.answerText,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"numeric",representation:"text-numeric-age-relation"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P06F20_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6BU05P06F20Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P06F20_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",
    worksheetId:"p06f20-"+SRC+"-"+(o.generationSeed??"public"),
    title:"怎樣解題｜年齡與不變差關係",
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
      taskId:"P06F_W6DirectProductVerticalSlice020Implementation",
      sourceId:SRC,
      knowledgePointId:KP,
      questionMode:"numeric",
      sourceWordProblemContextIsCore:true,
      ageDifferenceInvariantValidated:true,
      bothAgesUseSameTimeShift:true,
      shiftedMultiplicativeRelationValidated:true,
      currentAndShiftedBackSubstitutionValidated:true,
      positiveAgeStateValidated:true,
      q019SumDifferenceCoreReowned:false,
      generalSumMultipleProblemReowned:false,
      generalDifferenceMultipleProblemReowned:false,
      workOrDistributionStrategyReowned:false,
      genericSequenceOrRecurrenceReowned:false,
      genericApplicationOverlayUsed:false,
      globalContextBindingUsed:false,
      pblProjectionUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      laterW6SliceTouched:false,
      sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
      frozenRuntimeProfile:"profile_word_problem"
    }),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,sourceWordProblemQuestionCount:generation.questions.length,genericApplicationOverlayQuestionCount:0})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p06f20Implemented:true,laterW6SliceTouched:false});
}
