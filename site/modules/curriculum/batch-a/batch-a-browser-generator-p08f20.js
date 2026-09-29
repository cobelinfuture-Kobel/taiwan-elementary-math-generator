import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p08f19.js";
import {generateG6AU07P08F20Questions,G6A_U07_P08F20_MAX_QUESTION_COUNT} from "./g6a-u07-composite-circle-area-runtime-p08f20.js";
import {G6A_U07_P08F20_KP_ID as KP,G6A_U07_P08F20_PATTERN_GROUP as GROUP,G6A_U07_P08F20_SOURCE_ID as SRC,G6A_U07_P08F20_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u07-composite-circle-area-selector-projection-p08f20.js";

function target(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return false;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  if((o.selectedPatternGroupIds??[]).includes(GROUP.patternGroupId))return true;
  const specs=o.patternSpecIds??[];
  return specs.length>0&&specs.every(id=>SPEC_IDS.includes(id));
}
export const requestsP08F20=o=>target(o);
export function buildBatchABrowserPlan(o={}){
  if(!target(o))return baseBuildPlan(o);
  const base=baseBuildPlan(o),requested=Array.isArray(o.patternSpecIds)?SPEC_IDS.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:SPEC_IDS;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"upper",unitCode:"6A-U07",title:"圓面積和扇形面積",domain:"geometry"}),
    selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),knowledgePointIds:Object.freeze([KP]),requestedKnowledgePointIds:Object.freeze([KP]),
    selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),requestedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"diagram",requestedQuestionType:"diagram",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G6A_U07_P08F20_MAX_QUESTION_COUNT,
    generationSeed:String(o.generationSeed??"p08f20-composite-circle-area"),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P08F",productAdmissionTask:"P08F_W8DirectProductVerticalSlice020Implementation"}),
    publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"NOT_ADMITTED",
    sameUnitMixedMode:"NOT_ADMITTED",crossUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_geometry_formula"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  if(!target(o))return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG6AU07P08F20Questions({...plan,knowledgePointId:KP});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"diagram"});
}
