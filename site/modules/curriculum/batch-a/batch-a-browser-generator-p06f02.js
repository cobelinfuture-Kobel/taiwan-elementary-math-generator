import {buildBatchABrowserPlan as baseBuildPlan} from "./batch-a-browser-generator-p06f01.js";
import {generateG3AU07P06F02Questions,G3A_U07_P06F02_MAX_QUESTION_COUNT} from "./g3a-u07-tabular-pattern-runtime-p06f02.js";
import {G3A_U07_P06F02_KP_ID as KP,G3A_U07_P06F02_PATTERN_GROUP as GROUP,G3A_U07_P06F02_PATTERN_SPECS as SPECS,G3A_U07_P06F02_SOURCE_ID as SRC} from "../registry/g3a-u07-tabular-pattern-selector-projection-p06f02.js";
const SPEC_IDS=SPECS.map(x=>x.patternSpecId);
function target(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return false;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=o.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=o.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
export const requestsP06F02=o=>target(o);
export function buildBatchABrowserPlan(o={}){
  if(!target(o))return baseBuildPlan(o);
  const base=baseBuildPlan(o),requested=Array.isArray(o.patternSpecIds)?SPEC_IDS.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:SPEC_IDS;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:3,semester:"upper",unitCode:"3A-U07",title:"尋找規律",domain:"table_data"}),selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),knowledgePointIds:Object.freeze([KP]),requestedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),requestedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G3A_U07_P06F02_MAX_QUESTION_COUNT,generationSeed:String(o.generationSeed??"p06f02-tabular-pattern"),publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P06F",productAdmissionTask:"P06F_W6DirectProductVerticalSlice002Implementation"}),publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  if(!target(o))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F02_REQUEST_NOT_MATCHED"]),warnings:Object.freeze([])});
  const plan=buildBatchABrowserPlan(o),generated=generateG3AU07P06F02Questions({...plan});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
