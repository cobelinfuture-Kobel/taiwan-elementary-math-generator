import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p08f15.js";
import {generateG6AU09P08F16Questions,G6A_U09_P08F16_MAX_QUESTION_COUNT} from "./g6a-u09-scale-drawing-similarity-runtime-p08f16.js";
import {G6A_U09_P08F16_PATTERN_GROUPS as GROUPS,G6A_U09_P08F16_PATTERN_SPECS as SPECS,G6A_U09_P08F16_SOURCE_ID as SRC,G6A_U09_P08F16_TARGET_KP_IDS as TARGETS} from "../registry/g6a-u09-scale-drawing-similarity-selector-projection-p08f16.js";
const GROUP_TO_KP=new Map(GROUPS.map(x=>[x.patternGroupId,x.primaryKnowledgePointId])),SPEC_TO_KP=new Map(SPECS.map(x=>[x.patternSpecId,x.knowledgePointId]));
function target(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return null;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&TARGETS.includes(ids[0])?ids[0]:null;
  const groupKps=[...new Set((o.selectedPatternGroupIds??[]).map(id=>GROUP_TO_KP.get(id)).filter(Boolean))];
  if(groupKps.length)return groupKps.length===1?groupKps[0]:null;
  const specKps=[...new Set((o.patternSpecIds??[]).map(id=>SPEC_TO_KP.get(id)).filter(Boolean))];
  return specKps.length===1?specKps[0]:null;
}
export const requestsP08F16=o=>Boolean(target(o));
export function buildBatchABrowserPlan(o={}){
  const kp=target(o);if(!kp)return baseBuildPlan(o);
  const base=baseBuildPlan(o),group=GROUPS.find(x=>x.primaryKnowledgePointId===kp),own=SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId),requested=Array.isArray(o.patternSpecIds)?own.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:own;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"upper",unitCode:"6A-U09",title:"放大圖縮圖與比例尺",domain:"geometry_property"}),selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),knowledgePointIds:Object.freeze([kp]),requestedKnowledgePointIds:Object.freeze([kp]),selectedPatternGroupIds:Object.freeze([group.patternGroupId]),requestedPatternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),questionMode:"diagram",requestedQuestionType:"diagram",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G6A_U09_P08F16_MAX_QUESTION_COUNT,generationSeed:String(o.generationSeed??"p08f16-scale-transform"),publicControls:Object.freeze({sourceId:SRC,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P08F",productAdmissionTask:"P08F_W8DirectProductVerticalSlice016Implementation"}),publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"NOT_ADMITTED",sameUnitMixedMode:"NOT_ADMITTED",crossUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  const kp=target(o);if(!kp)return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG6AU09P08F16Questions({...plan,knowledgePointId:kp});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"diagram"});
}
