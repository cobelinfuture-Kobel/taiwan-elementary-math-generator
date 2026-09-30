import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p08f21.js";
import {generateG6AU08P08F22Questions,G6A_U08_P08F22_MAX_QUESTION_COUNT} from "./g6a-u08-speed-unit-conversion-runtime-p08f22.js";
import {G6A_U08_P08F22_KP_ID as KP,G6A_U08_P08F22_PATTERN_GROUP as GROUP,G6A_U08_P08F22_PATTERN_SPECS as SPECS,G6A_U08_P08F22_SOURCE_ID as SRC,G6A_U08_P08F22_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u08-speed-unit-conversion-selector-projection-p08f22.js";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
export function requestsP08F22(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return false;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=o.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=o.patternSpecIds??[];return ss.length>0&&ss.every(id=>BY_SPEC.has(id));
}
export function buildBatchABrowserPlan(o={}){
  if(!requestsP08F22(o))return baseBuildPlan(o);
  const base=baseBuildPlan(o),requested=Array.isArray(o.patternSpecIds)?SPEC_IDS.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:SPEC_IDS;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"upper",unitCode:"6A-U08",title:"認識速率",domain:"speed_rate"}),
    selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),knowledgePointIds:Object.freeze([KP]),requestedKnowledgePointIds:Object.freeze([KP]),
    selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),requestedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G6A_U08_P08F22_MAX_QUESTION_COUNT,
    generationSeed:String(o.generationSeed??"p08f22-speed-unit-conversion"),publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P08F",productAdmissionTask:"P08F_W8DirectProductVerticalSlice022Implementation"}),
    publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"NOT_ADMITTED",
    sameUnitMixedMode:"NOT_ADMITTED",crossUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_speed_rate",
    finalFrozenW8Slice:true,w8FrozenQueueComplete:true});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  if(!requestsP08F22(o))return baseGenerate(o);const plan=buildBatchABrowserPlan(o),generated=generateG6AU08P08F22Questions({...plan,knowledgePointId:KP});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
