import {buildBatchABrowserPlan as baseBuildPlan,generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-generator-p08f22.js";
import {generateG3AU08P09A02Questions,P09_A02_MAX_QUESTION_COUNT} from "./g3a-u08-two-kp-runtime-p09-a02.js";
import {G3A_U08_P09_A02_SOURCE_ID as SRC,G3A_U08_P09_A02_TARGET_KP_IDS as TARGETS,resolveG3AU08P09A02PatternSpecIds,listG3AU08P09A02PatternGroups} from "../registry/g3a-u08-two-kp-selector-projection-p09-a02.js";
const unique=v=>[...new Set((Array.isArray(v)?v:[]).filter(Boolean))];
export function requestsP09A02(o={}){
  if(o.sourceId!==SRC||o.selectionMode!=="singleKnowledgePoint")return false;
  const ids=unique(o.selectedKnowledgePointIds??o.knowledgePointIds??[]);
  return ids.length===1&&TARGETS.includes(ids[0]);
}
export function buildBatchABrowserPlan(o={}){
  if(!requestsP09A02(o))return baseBuildPlan(o);
  const kp=unique(o.selectedKnowledgePointIds??o.knowledgePointIds??[])[0];
  const base=baseBuildPlan({...o,sourceId:SRC});
  const groups=listG3AU08P09A02PatternGroups(kp),allowed=resolveG3AU08P09A02PatternSpecIds(kp),requested=unique(o.patternSpecIds).filter(id=>allowed.includes(id)),patternSpecIds=requested.length?requested:allowed;
  return Object.freeze({...base,sourceId:SRC,sourceUnit:Object.freeze({sourceId:SRC,grade:3,semester:"upper",unitCode:"3A-U08",title:"分數",domain:"fraction_representation_and_part_whole"}),
    selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([kp]),knowledgePointIds:Object.freeze([kp]),requestedKnowledgePointIds:Object.freeze([kp]),
    selectedPatternGroupIds:Object.freeze(groups.map(g=>g.patternGroupId)),requestedPatternGroupIds:Object.freeze(groups.map(g=>g.patternGroupId)),patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"numeric",requestedQuestionType:"numeric",questionCount:Number.isInteger(o.questionCount)?o.questionCount:20,questionCountMax:P09_A02_MAX_QUESTION_COUNT,
    ordering:o.ordering==="shuffleAcrossPatterns"?"shuffleAcrossPatterns":"groupedByPattern",generationSeed:String(o.generationSeed??"p09-a02-g3a-u08"),
    publicControls:Object.freeze({sourceId:SRC,questionMode:"numeric",requestedQuestionType:"numeric",productWave:"P09",productAdmissionTask:"P09_UI_A02_G3AU08_WholeAsFraction_And_UnlikeDenominatorComparisonLimit_TwoKPProductAdmission"}),
    genericFallback:false,genericFallbackAllowed:false,freeFormAI:false,applicationContextMode:"NOT_APPLICABLE",sameUnitMixedMode:"NOT_ADMITTED",crossUnitMixedMode:"NOT_ADMITTED",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_number_representation"});
}
export const buildBatchABrowserGenerationPlan=buildBatchABrowserPlan;
export function generateBatchABrowserQuestions(o={}){
  if(!requestsP09A02(o))return baseGenerate(o);
  const plan=buildBatchABrowserPlan(o),generated=generateG3AU08P09A02Questions(plan);
  return Object.freeze({...generated,plan,sourceId:SRC,questionMode:"numeric"});
}
