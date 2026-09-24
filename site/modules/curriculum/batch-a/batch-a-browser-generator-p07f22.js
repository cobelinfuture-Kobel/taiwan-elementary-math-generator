import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p07f21.js";
import {generateG6BU04P07F22Questions,G6B_U04_P07F22_MAX_QUESTION_COUNT} from "./g6b-u04-three-rate-quantity-relations-runtime-p07f22.js";
import {G6B_U04_P07F22_PATTERN_GROUPS as GROUPS,G6B_U04_P07F22_PATTERN_SPECS as SPECS,G6B_U04_P07F22_SOURCE_ID as SRC,G6B_U04_P07F22_TARGET_KP_IDS as TARGETS} from "../registry/g6b-u04-three-rate-quantity-relations-selector-projection-p07f22.js";
const GROUP_TO_KP=new Map(GROUPS.map(x=>[x.patternGroupId,x.primaryKnowledgePointId])),SPEC_TO_KP=new Map(SPECS.map(x=>[x.patternSpecId,x.knowledgePointId]));
function target(o={}){
  if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return null;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&TARGETS.includes(ids[0])?ids[0]:null;
  const g=[...new Set((o.selectedPatternGroupIds??[]).map(id=>GROUP_TO_KP.get(id)).filter(Boolean))];if(g.length)return g.length===1?g[0]:null;
  const s=[...new Set((o.patternSpecIds??[]).map(id=>SPEC_TO_KP.get(id)).filter(Boolean))];return s.length===1?s[0]:null;
}
export const requestsP07F22=o=>Boolean(target(o));
export function buildBatchABrowserPlan(o={}){
  const kp=target(o);if(!kp)return baseBuildPlan(o);
  const group=GROUPS.find(x=>x.primaryKnowledgePointId===kp),own=SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId),
    requested=Array.isArray(o.patternSpecIds)?own.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:own;
  const base=baseBuildPlan(o);
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:6,semester:"lower",unitCode:"6B-U04",title:"基準量與比較量",domain:"ratio_percent"}),
    selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),knowledgePointIds:Object.freeze([kp]),requestedKnowledgePointIds:Object.freeze([kp]),
    selectedPatternGroupIds:Object.freeze([group.patternGroupId]),requestedPatternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G6B_U04_P07F22_MAX_QUESTION_COUNT,
    generationSeed:String(o.generationSeed??"p07f22-three-rate-quantity-relations"),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P07F",productAdmissionTask:"P07F_W7DirectProductVerticalSlice022Implementation"}),
    publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,
    applicationContextMode:"SOURCE_BACKED_BASE_COMPARISON_RATE_RELATION",sameUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_ratio_percent"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  const kp=target(o);if(!kp)return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG6BU04P07F22Questions({...plan,knowledgePointId:kp});
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
