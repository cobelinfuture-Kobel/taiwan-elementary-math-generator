import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {generateBatchABrowserQuestions,requestsP07F22} from "./batch-a-browser-generator-p07f22.js";
import {buildBatchABrowserWorksheetDocument as baseWorksheet} from "./batch-a-browser-worksheet-p07f21-extension.js";
import {validateG6BU04P07F22Question} from "./g6b-u04-three-rate-quantity-relations-runtime-p07f22.js";
import {G6B_U04_P07F22_SOURCE_ID as SRC,G6B_U04_P07F22_TARGET_KP_IDS as TARGETS} from "../registry/g6b-u04-three-rate-quantity-relations-selector-projection-p07f22.js";
const TITLE=Object.freeze({
  "kp_g6b_u04_find_base_quantity":"求基準量",
  "kp_g6b_u04_find_comparison_quantity":"求比較量",
  "kp_g6b_u04_find_rate_from_quantities":"求比率"
});
function layout(o={}){const p=o.printLayout??{};return Object.freeze({paperSize:p.paperSize??"A4",columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),2):2,
  rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),5):4,showQuestionNumbers:p.showQuestionNumbers!==false,
  showAnswerKeyPage:o.includeAnswerKey!==false&&p.showAnswerKeyPage!==false});}
function models(qs,l){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,knowledgePointId:q.knowledgePointId,
  patternGroupId:q.patternGroupId,promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,answerText:q.answerText,
  questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,sourceId:q.sourceId,
  knowledgePointId:q.knowledgePointId,relation:q.relation,questionMode:"numeric"}),layoutHints:Object.freeze({estimatedTextLength:q.blankedDisplayText.length,hasGrouping:false,
  avoidPageBreakInside:true,questionMode:"numeric",representation:"text_application_rate_relation"})}));}
function answers(qs,m){return qs.map((q,i)=>Object.freeze({questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,
  answerText:q.answerText,metadataSnapshot:m[i].metadataSnapshot,layoutHints:Object.freeze({avoidPageBreakInside:true,questionMode:"numeric",representation:"text_application_rate_relation"})}));}
export function buildBatchABrowserWorksheetDocument(o={}){
  if(!requestsP07F22(o))return baseWorksheet(o);
  const generation=generateBatchABrowserQuestions(o);
  if(!generation?.ok)return Object.freeze({ok:false,errors:generation?.errors??["P07F22_GENERATION_FAILED"],warnings:generation?.warnings??[],worksheetDocument:null,generation});
  const ve=generation.questions.flatMap(q=>validateG6BU04P07F22Question(q).errors);
  if(ve.length)return Object.freeze({ok:false,errors:Object.freeze(ve),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const kp=generation.questions[0]?.knowledgePointId;
  if(!TARGETS.includes(kp)||generation.questions.some(q=>q.knowledgePointId!==kp))return Object.freeze({ok:false,errors:Object.freeze(["P07F22_WORKSHEET_KP_INVALID"]),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const l=layout(o),m=models(generation.questions,l),a=l.showAnswerKeyPage?answers(generation.questions,m):[],
    questionPages=paginateQuestionDisplayModels(m,l),answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(a,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",worksheetId:"p07f22-"+SRC+"-"+kp.replace("kp_g6b_u04_","")+"-"+(o.generationSeed??"public"),title:"基準量與比較量｜"+TITLE[kp],
    generatedQuestions:generation.questions,questions:generation.questions,questionDisplayModels:Object.freeze(m),answerKeyItems:Object.freeze(a),
    questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",questionCountMax:240}),configSnapshot:Object.freeze({questionMode:"numeric",printLayout:l}),
    batchA:Object.freeze({sourceId:SRC,questionMode:"numeric",selectionMode:"singleKnowledgePoint"}),
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice022Implementation",sourceId:SRC,knowledgePointId:kp,questionMode:"numeric",frozenRuntimeProfile:"profile_ratio_percent",
      baseComparisonRateRolePrerequisiteConsumed:true,predecessorRoleOwnershipReowned:false,
      findBaseQuantityOwnership:kp==="kp_g6b_u04_find_base_quantity",findComparisonQuantityOwnership:kp==="kp_g6b_u04_find_comparison_quantity",
      findRateOwnership:kp==="kp_g6b_u04_find_rate_from_quantities",answerBackSubstitutionRequired:true,compatibleQuantityUnitsRequired:true,
      successiveRateChangeOwnership:false,multiStageDiscountGrowthDecreaseOwnership:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q023OrLaterTouched:false,
      sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
    }),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,
      diagramQuestionCount:0,applicationQuestionCount:generation.questions.length})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),worksheetDocument,generation,p07f22Implemented:true,q021ProductMutation:false,q023OrLaterTouched:false});
}
