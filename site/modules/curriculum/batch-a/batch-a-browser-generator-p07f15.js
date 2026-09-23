import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p07f14.js";
import {generateG6BU05P07F15Questions,G6B_U05_P07F15_MAX_QUESTION_COUNT} from "./g6b-u05-factor-multiple-runtime-p07f15.js";
import {G6B_U05_P07F15_PATTERN_GROUPS as GROUPS,G6B_U05_P07F15_PATTERN_SPECS as SPECS,G6B_U05_P07F15_SOURCE_ID as SRC,G6B_U05_P07F15_TARGET_KP_IDS as TARGETS} from "../registry/g6b-u05-factor-multiple-selector-projection-p07f15.js";
const GROUP_TO_KP=new Map(GROUPS.map(x=>[x.patternGroupId,x.primaryKnowledgePointId])),SPEC_TO_KP=new Map(SPECS.map(x=>[x.patternSpecId,x.knowledgePointId]));
function target(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return null;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&TARGETS.includes(ids[0])?ids[0]:null;
  const gk=[...new Set((o.selectedPatternGroupIds??[]).map(id=>GROUP_TO_KP.get(id)).filter(Boolean))];if(gk.length)return gk.length===1?gk[0]:null;
  const sk=[...new Set((o.patternSpecIds??[]).map(id=>SPEC_TO_KP.get(id)).filter(Boolean))];return sk.length===1?sk[0]:null;
}
export const requestsP07F15=o=>Boolean(target(o));
export function buildBatchABrowserPlan(o={}){
  const kp=target(o);if(!kp)return baseBuildPlan(o);
  const base=baseBuildPlan(o),g=GROUPS.find(x=>x.primaryKnowledgePointId===kp),own=SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId),requested=Array.isArray(o.patternSpecIds)?own.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:own;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"lower",unitCode:"6B-U05",title:"怎樣解題",domain:"problem_solving"}),selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),knowledgePointIds:Object.freeze([kp]),requestedKnowledgePointIds:Object.freeze([kp]),selectedPatternGroupIds:Object.freeze([g.patternGroupId]),requestedPatternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G6B_U05_P07F15_MAX_QUESTION_COUNT,generationSeed:String(o.generationSeed??"p07f15-factor-multiple"),publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P07F",productAdmissionTask:"P07F_W7DirectProductVerticalSlice015Implementation"}),publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"DIRECT_RELATION_TEXT_ONLY",sameUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  const kp=target(o);if(!kp)return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG6BU05P07F15Questions({...plan,knowledgePointId:kp});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
