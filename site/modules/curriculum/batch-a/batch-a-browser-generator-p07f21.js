import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p07f20.js";
import {generateG6BU06P07F21Questions,G6B_U06_P07F21_MAX_QUESTION_COUNT} from "./g6b-u06-pie-chart-quantity-from-rate-runtime-p07f21.js";
import {G6B_U06_P07F21_KP_ID as KP,G6B_U06_P07F21_PATTERN_GROUP as GROUP,G6B_U06_P07F21_PATTERN_SPECS as SPECS,G6B_U06_P07F21_SOURCE_ID as SRC,G6B_U06_P07F21_SPEC_IDS as SPEC_IDS} from "../registry/g6b-u06-pie-chart-quantity-from-rate-selector-projection-p07f21.js";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
export function requestsP07F21(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return false;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=o.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=o.patternSpecIds??[];return ss.length>0&&ss.every(id=>BY_SPEC.has(id));
}
export function buildBatchABrowserPlan(o={}){
  if(!requestsP07F21(o))return baseBuildPlan(o);
  const base=baseBuildPlan(o),requested=Array.isArray(o.patternSpecIds)?SPEC_IDS.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:SPEC_IDS;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"lower",unitCode:"6B-U06",title:"圓形圖",domain:"chart_data"}),
    selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),knowledgePointIds:Object.freeze([KP]),requestedKnowledgePointIds:Object.freeze([KP]),
    selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),requestedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G6B_U06_P07F21_MAX_QUESTION_COUNT,
    generationSeed:String(o.generationSeed??"p07f21-pie-quantity-rate"),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P07F",productAdmissionTask:"P07F_W7DirectProductVerticalSlice021Implementation"}),
    publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,
    applicationContextMode:"SOURCE_BACKED_PIE_RATE_TO_QUANTITY",sameUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_ratio_percent"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  if(!requestsP07F21(o))return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG6BU06P07F21Questions({...plan,knowledgePointId:KP});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
