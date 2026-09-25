import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p07f24.js";
import {generateG6AU08P07F25Questions,G6A_U08_P07F25_MAX_QUESTION_COUNT} from "./g6a-u08-average-relative-speed-runtime-p07f25.js";
import {
  G6A_U08_P07F25_AVERAGE_KP_ID as AVG_KP,
  G6A_U08_P07F25_AVERAGE_SPEC_IDS as AVG_SPECS,
  G6A_U08_P07F25_KP_IDS as KPS,
  G6A_U08_P07F25_PATTERN_GROUPS as GROUPS,
  G6A_U08_P07F25_RELATIVE_KP_ID as REL_KP,
  G6A_U08_P07F25_RELATIVE_SPEC_IDS as REL_SPECS,
  G6A_U08_P07F25_SOURCE_ID as SRC
} from "../registry/g6a-u08-average-relative-speed-selector-projection-p07f25.js";

const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
function requestedKp(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return null;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&KPS.includes(ids[0])?ids[0]:null;
  const gs=o.selectedPatternGroupIds??[];if(gs.length===1){const g=GROUPS.find(x=>x.patternGroupId===gs[0]);return g?.primaryKnowledgePointId??null;}
  const ss=o.patternSpecIds??[];if(ss.length&&ss.every(id=>AVG_SPECS.includes(id)))return AVG_KP;if(ss.length&&ss.every(id=>REL_SPECS.includes(id)))return REL_KP;
  return null;
}
export function requestsP07F25(o={}){return Boolean(requestedKp(o));}
export function buildBatchABrowserPlan(o={}){
  const kp=requestedKp(o);if(!kp)return baseBuildPlan(o);
  const base=baseBuildPlan(o),group=GROUP_BY_KP.get(kp),allowed=kp===AVG_KP?AVG_SPECS:REL_SPECS,
    requested=Array.isArray(o.patternSpecIds)?allowed.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:allowed;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"upper",unitCode:"6A-U08",title:"認識速率",domain:"speed_rate"}),
    selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),knowledgePointIds:Object.freeze([kp]),requestedKnowledgePointIds:Object.freeze([kp]),
    selectedPatternGroupIds:Object.freeze([group.patternGroupId]),requestedPatternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:Object.freeze([...patternSpecIds]),
    questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G6A_U08_P07F25_MAX_QUESTION_COUNT,
    generationSeed:String(o.generationSeed??"p07f25-average-relative-speed"),publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P07F",productAdmissionTask:"P07F_W7DirectProductVerticalSlice025Implementation"}),
    publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,
    applicationContextMode:kp===AVG_KP?"SOURCE_BACKED_TOTAL_DISTANCE_TOTAL_TIME":"SOURCE_BACKED_MEETING_CHASING_RELATIVE_SPEED",
    sameUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_speed_rate"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  const kp=requestedKp(o);if(!kp)return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG6AU08P07F25Questions({...plan,knowledgePointId:kp});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
