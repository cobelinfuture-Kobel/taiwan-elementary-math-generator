import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p07f11.js";
import {generateG6AU09P07F12Questions,G6A_U09_P07F12_MAX_QUESTION_COUNT} from "./g6a-u09-scale-area-change-runtime-p07f12.js";
import {G6A_U09_P07F12_KP_ID as KP,G6A_U09_P07F12_PATTERN_GROUP as GROUP,G6A_U09_P07F12_PATTERN_SPECS as SPECS,G6A_U09_P07F12_SOURCE_ID as SRC} from "../registry/g6a-u09-scale-area-change-selector-projection-p07f12.js";
const SPEC_IDS=SPECS.map(x=>x.patternSpecId);
function target(o={}){if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return false;const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;const gs=o.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;const ss=o.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));}
export const requestsP07F12=o=>target(o);
export function buildBatchABrowserPlan(o={}){
  if(!target(o))return baseBuildPlan(o);
  const base=baseBuildPlan(o),requested=Array.isArray(o.patternSpecIds)?SPEC_IDS.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:SPEC_IDS;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"upper",unitCode:"6A-U09",title:"放大圖縮圖與比例尺",domain:"quantity_measurement"}),selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),knowledgePointIds:Object.freeze([KP]),requestedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),requestedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),questionMode:"diagram",requestedQuestionType:"diagram",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G6A_U09_P07F12_MAX_QUESTION_COUNT,generationSeed:String(o.generationSeed??"p07f12-scale-area-change"),publicControls:Object.freeze({sourceId:SRC,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P07F",productAdmissionTask:"P07F_W7DirectProductVerticalSlice012Implementation"}),publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"SOURCE_BACKED_RECTANGLE_ALLOWED",sameUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_geometry_formula"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  if(!target(o))return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG6AU09P07F12Questions({...plan,knowledgePointId:KP});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"diagram"});
}
