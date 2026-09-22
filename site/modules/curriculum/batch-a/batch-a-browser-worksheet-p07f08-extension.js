import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP07F08} from "./batch-a-browser-generator-p07f08.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p07f07-extension.js";
import {validateG5BU08P07F08Question} from "./g5b-u08-ratio-fraction-decimal-percent-conversion-runtime-p07f08.js";
import {G5B_U08_P07F08_KP_ID as KP,G5B_U08_P07F08_SOURCE_ID as SRC} from "../registry/g5b-u08-ratio-fraction-decimal-percent-conversion-selector-projection-p07f08.js";
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),3):2,rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),8):6,showQuestionNumbers:p.showQuestionNumbers!==false,showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,patternGroupId:q.patternGroupId,promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"numeric"}),layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,avoidPageBreakInside:true,questionMode:"numeric",representation:"fraction_decimal_percent_equivalence"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,answerText:q.answerText,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"numeric",representation:"fraction_decimal_percent_equivalence"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP07F08(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P07F08_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG5BU08P07F08Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  if(generation.questions.some(q=>q.knowledgePointId!==KP))return Object.freeze({ok:false,errors:Object.freeze(["P07F08_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",worksheetId:"p07f08-"+SRC+"-"+(o.generationSeed??"public"),title:"比率與百分率｜分數小數百分率互換",
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(m),answerKeyItems:Object.freeze(a),questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",questionCountMax:240}),configSnapshot:Object.freeze({questionMode:"numeric",printLayout:l}),batchA:Object.freeze({sourceId:SRC,questionMode:"numeric",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice008Implementation",sourceId:SRC,knowledgePointId:KP,questionMode:"numeric",frozenRuntimeProfile:"profile_ratio_percent",ratioValuePrerequisitePreserved:true,decimalFractionConversionPrerequisitePreserved:true,representationEquivalenceOwned:true,percentAbove100Allowed:true,percentBase100IdentityValidated:true,simplifiedFractionOutputRequired:true,findPercentageRateFromTwoQuantitiesUsed:false,percentageOfQuantityUsed:false,findBaseQuantityUsed:false,discountIncreaseApplicationUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q009OrLaterTouched:false,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"}),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,diagramQuestionCount:0,applicationQuestionCount:0})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p07f08Implemented:true,q007ProductMutation:false,q009OrLaterTouched:false});
}
