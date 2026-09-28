import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p08f02.js";
import {generateG4AU03P08F03Questions,G4A_U03_P08F03_MAX_QUESTION_COUNT} from "./g4a-u03-angle-composition-rotation-clock-runtime-p08f03.js";
import {G4A_U03_P08F03_KP_IDS as TARGETS,G4A_U03_P08F03_PATTERN_GROUPS as GROUPS,G4A_U03_P08F03_SOURCE_ID as SRC,G4A_U03_P08F03_SPEC_IDS_BY_KP as SPEC_IDS} from "../registry/g4a-u03-angle-composition-rotation-clock-selector-projection-p08f03.js";
const GROUP_TO_KP=new Map(GROUPS.map(x=>[x.patternGroupId,x.primaryKnowledgePointId])),SPEC_TO_KP=new Map(TARGETS.flatMap(kp=>SPEC_IDS[kp].map(id=>[id,kp])));
function target(o={}){
 if(o.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(o.selectionMode))return null;
 const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&TARGETS.includes(ids[0])?ids[0]:null;
 const groupKps=[...new Set((o.selectedPatternGroupIds??[]).map(id=>GROUP_TO_KP.get(id)).filter(Boolean))];if(groupKps.length)return groupKps.length===1?groupKps[0]:null;
 const specKps=[...new Set((o.patternSpecIds??[]).map(id=>SPEC_TO_KP.get(id)).filter(Boolean))];return specKps.length===1?specKps[0]:null;
}
export const requestsP08F03=o=>Boolean(target(o));
export function buildBatchABrowserPlan(o={}){
 const kp=target(o);if(!kp)return baseBuildPlan(o);
 const base=baseBuildPlan(o),group=GROUPS.find(x=>x.primaryKnowledgePointId===kp),own=SPEC_IDS[kp],requested=Array.isArray(o.patternSpecIds)?own.filter(id=>o.patternSpecIds.includes(id)):[],patternSpecIds=requested.length?requested:own;
 return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:4,semester:"upper",unitCode:"4A-U03",title:"角度",domain:"geometry_property"}),selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),knowledgePointIds:Object.freeze([kp]),requestedKnowledgePointIds:Object.freeze([kp]),selectedPatternGroupIds:Object.freeze([group.patternGroupId]),requestedPatternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:Object.freeze(patternSpecIds),questionMode:"diagram",requestedQuestionType:"diagram",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:G4A_U03_P08F03_MAX_QUESTION_COUNT,generationSeed:String(o.generationSeed??"p08f03-angle-clock"),publicControls:Object.freeze({sourceId:SRC,questionMode:"diagram",requestedQuestionType:"diagram",productWave:"P08F",productAdmissionTask:"P08F_W8DirectProductVerticalSlice003Implementation"}),publicPatternSpecInjectionUsed:false,genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"NOT_REQUIRED_CORE_DIAGRAM",sameUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){const kp=target(o);if(!kp)return baseGenerate(o);const plan=buildBatchABrowserPlan(o),generated=generateG4AU03P08F03Questions({...plan,knowledgePointId:kp});return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"diagram"});}
