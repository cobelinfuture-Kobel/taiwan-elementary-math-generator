import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p08f17.js";
import {generateG6BU06P08F18Questions,G6B_U06_P08F18_MAX_QUESTION_COUNT} from "./g6b-u06-pie-chart-percent-angle-conversion-runtime-p08f18.js";
import {G6B_U06_P08F18_KP_ID as KP,G6B_U06_P08F18_PATTERN_GROUP as GROUP,G6B_U06_P08F18_SOURCE_ID as SRC,G6B_U06_P08F18_SPEC_IDS as SPEC_IDS} from "../registry/g6b-u06-pie-chart-percent-angle-conversion-selector-projection-p08f18.js";

function target(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return false;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  if((o.selectedPatternGroupIds??[]).includes(GROUP.patternGroupId))return true;
  const specs=o.patternSpecIds??[];
  return specs.length>0&&specs.every(id=>SPEC_IDS.includes(id));
}
export const requestsP08F18=o=>target(o);
export function buildBatchABrowserPlan(o={}){
  if(!target(o))return baseBuildPlan(o);
  const base=baseBuildPlan(o),requested=Array.isArray(o.patternSpecIds)?SPEC_IDS.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:SPEC_IDS;
  return Object.freeze({
    ...base,
    sourceId:SRC,
    sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"lower",unitCode:"6B-U06",title:"圓形圖",domain:"ratio_percent"}),
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:Object.freeze([KP]),
    knowledgePointIds:Object.freeze([KP]),
    requestedKnowledgePointIds:Object.freeze([KP]),
    selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
    requestedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
    patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"numeric",
    requestedQuestionType:"numeric",
    questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,
    questionCountMax:G6B_U06_P08F18_MAX_QUESTION_COUNT,
    generationSeed:String(o.generationSeed??"p08f18-pie-percent-angle"),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P08F",productAdmissionTask:"P08F_W8DirectProductVerticalSlice018Implementation"}),
    publicPatternSpecInjectionUsed:false,
    genericFallback:false,
    genericFallbackAllowed:false,
    freeFormAI:false,
    applicationContextMode:"NOT_ADMITTED",
    sameUnitMixedMode:"NOT_ADMITTED",
    crossUnitMixedMode:"NOT_ADMITTED",
    sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",
    frozenRuntimeProfile:"profile_ratio_percent"
  });
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  if(!target(o))return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG6BU06P08F18Questions({...plan,knowledgePointId:KP});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
