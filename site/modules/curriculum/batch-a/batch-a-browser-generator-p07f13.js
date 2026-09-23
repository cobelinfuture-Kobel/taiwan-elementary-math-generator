import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p07f12.js";
import {generateG5BU08P07F13Questions,G5B_U08_P07F13_MAX_QUESTION_COUNT} from "./g5b-u08-rate-percentage-quantity-runtime-p07f13.js";
import {
  G5B_U08_P07F13_KP_IDS as KPS,
  G5B_U08_P07F13_PATTERN_GROUPS as GROUPS,
  G5B_U08_P07F13_PATTERN_SPECS as SPECS,
  G5B_U08_P07F13_SOURCE_ID as SRC,
  G5B_U08_P07F13_SPEC_IDS_BY_KP as SPEC_IDS_BY_KP
} from "../registry/g5b-u08-rate-percentage-quantity-selector-projection-p07f13.js";
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x])),BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
function resolveKp(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return null;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&KPS.includes(ids[0])?ids[0]:null;
  const gs=o.selectedPatternGroupIds??[];
  if(gs.length===1){const g=GROUPS.find(x=>x.patternGroupId===gs[0]);if(g)return g.primaryKnowledgePointId;}
  const ss=o.patternSpecIds??[];
  if(ss.length){const k=[...new Set(ss.map(id=>BY_SPEC.get(id)?.knowledgePointId).filter(Boolean))];if(k.length===1&&ss.every(id=>BY_SPEC.has(id)))return k[0];}
  return null;
}
export const requestsP07F13=o=>resolveKp(o)!==null;
export function buildBatchABrowserPlan(o={}){
  const kp=resolveKp(o);if(!kp)return baseBuildPlan(o);
  const base=baseBuildPlan(o),group=GROUP_BY_KP.get(kp),ids=SPEC_IDS_BY_KP[kp],requested=Array.isArray(o.patternSpecIds)?ids.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:ids;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:5,semester:"lower",unitCode:"5B-U08",title:"比率與百分率",domain:"ratio_percent"}),
    selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),knowledgePointIds:Object.freeze([kp]),requestedKnowledgePointIds:Object.freeze([kp]),
    selectedPatternGroupIds:Object.freeze([group.patternGroupId]),requestedPatternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G5B_U08_P07F13_MAX_QUESTION_COUNT,
    generationSeed:String(o.generationSeed??"p07f13-rate-percentage-quantity"),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P07F",productAdmissionTask:"P07F_W7DirectProductVerticalSlice013Implementation"}),
    publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"SOURCE_BACKED_ADMITTED",
    sameUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_ratio_percent"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  const kp=resolveKp(o);if(!kp)return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG5BU08P07F13Questions({...plan,knowledgePointId:kp});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
