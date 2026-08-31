export * from "./g3a-u08-current-coordinator.js";
import * as base from "./g3a-u08-current-coordinator.js";
import {G3A_U08_SOURCE_ID} from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {G3A_U08_P04F24_KP_ID,G3A_U08_P04F24_GROUP_ID,G3A_U08_P04F24_SPEC_ID} from "../registry/g3a-u08-measurement-fraction-selector-projection-p04f24.js";
import {generateG3AU08MeasurementFractionQuestions,validateG3AU08MeasurementFractionQuestion} from "./measurement-fraction-runtime-p04f24.js";

const issue=(code,path)=>({code,severity:"error",path,message:code});
const BASE_KP_SET=new Set(base.G3A_U08_CURRENT_KP_IDS);
export const G3A_U08_P04F24_CURRENT_KP_IDS=Object.freeze([...base.G3A_U08_CURRENT_KP_IDS,G3A_U08_P04F24_KP_ID]);
const CURRENT_KP_SET=new Set(G3A_U08_P04F24_CURRENT_KP_IDS);

const requestsQ024=(options={})=>options.sourceId===G3A_U08_SOURCE_ID&&((options.selectedKnowledgePointIds??[]).includes(G3A_U08_P04F24_KP_ID)||(options.patternSpecIds??[]).includes(G3A_U08_P04F24_SPEC_ID)||(options.selectedPatternGroupIds??[]).includes(G3A_U08_P04F24_GROUP_ID));
const requestsMixedQ024=(options={})=>options.sourceId===G3A_U08_SOURCE_ID&&options.selectionMode==="mixedKnowledgePointsSameUnit"&&options.questionMode==="mixed"&&(options.selectedKnowledgePointIds??[]).includes(G3A_U08_P04F24_KP_ID)&&(options.selectedKnowledgePointIds??[]).some(id=>BASE_KP_SET.has(id));
const planIsMixedQ024=(plan={})=>plan.sourceId===G3A_U08_SOURCE_ID&&plan.selectionMode==="mixedKnowledgePointsSameUnit"&&plan.questionMode==="mixed"&&Array.isArray(plan.selectedKnowledgePointIds)&&plan.selectedKnowledgePointIds.includes(G3A_U08_P04F24_KP_ID)&&plan.selectedKnowledgePointIds.some(id=>BASE_KP_SET.has(id))&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.includes(G3A_U08_P04F24_SPEC_ID);
const planIsSingleQ024=(plan={})=>plan.sourceId===G3A_U08_SOURCE_ID&&plan.selectionMode==="singleKnowledgePoint"&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.length===1&&plan.patternSpecIds[0]===G3A_U08_P04F24_SPEC_ID;

function unique(values=[]){return[...new Set((Array.isArray(values)?values:[]).filter(Boolean))];}
function allocateAcrossKnowledgePoints(knowledgePointIds,questionCount){const baseCount=Math.floor(questionCount/knowledgePointIds.length);let remainder=questionCount%knowledgePointIds.length;return knowledgePointIds.map(knowledgePointId=>{const allocated=baseCount+(remainder>0?1:0);if(remainder>0)remainder-=1;return Object.freeze({knowledgePointId,questionCount:allocated});}).filter(entry=>entry.questionCount>0);}
function hashSeed(value){let hash=2166136261;for(const character of String(value)){hash^=character.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
function mix32(value){let mixed=value>>>0;mixed^=mixed<<13;mixed^=mixed>>>17;mixed^=mixed<<5;return mixed>>>0;}
function groupedByPattern(questions,patternSpecIds){const order=new Map(patternSpecIds.map((id,index)=>[id,index]));return questions.map((question,index)=>({question,index})).sort((left,right)=>(order.get(left.question.patternSpecId)??999)-(order.get(right.question.patternSpecId)??999)||left.index-right.index).map(entry=>entry.question);}
function shuffleAcrossPatterns(questions,generationSeed){const shuffled=[...questions];let state=hashSeed(`${generationSeed}:g3a-u08-p04f24-ordering`);for(let index=shuffled.length-1;index>0;index-=1){state=mix32(state+index);const swapIndex=state%(index+1);[shuffled[index],shuffled[swapIndex]]=[shuffled[swapIndex],shuffled[index]];}return shuffled;}
function applyOrdering(questions,plan){return plan.ordering==="shuffleAcrossPatterns"?shuffleAcrossPatterns(questions,plan.generationSeed):groupedByPattern(questions,plan.patternSpecIds);}

function buildMixedQ024Plan(options={}){
  const selectedKnowledgePointIds=unique(options.selectedKnowledgePointIds).filter(id=>CURRENT_KP_SET.has(id));
  const baseKnowledgePointIds=selectedKnowledgePointIds.filter(id=>BASE_KP_SET.has(id));
  const basePlan=base.buildG3AU08CurrentPlan({...options,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:baseKnowledgePointIds,selectedPatternGroupIds:[],patternSpecIds:undefined,questionMode:"mixed"});
  return Object.freeze({
    ...basePlan,
    sourceId:G3A_U08_SOURCE_ID,
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:Object.freeze([...selectedKnowledgePointIds]),
    requestedKnowledgePointIds:Object.freeze([...selectedKnowledgePointIds]),
    selectedPatternGroupIds:Object.freeze(unique([...(options.selectedPatternGroupIds??[]),G3A_U08_P04F24_GROUP_ID])),
    patternSpecIds:Object.freeze([...basePlan.patternSpecIds,G3A_U08_P04F24_SPEC_ID]),
    questionCount:Number(options.questionCount??basePlan.questionCount??20),
    questionMode:"mixed",
    ordering:options.ordering==="shuffleAcrossPatterns"?"shuffleAcrossPatterns":"groupedByPattern",
    generationSeed:String(options.generationSeed??basePlan.generationSeed??"g3a-u08-p04f24-mixed"),
    allocation:null,
    genericFallbackAllowed:false,
    productAdmissionTask:"G3A_U08_POSTMERGE_P04F24_5KP_MIXED_ROUTING_HOTFIX",
  });
}

export function buildG3AU08CurrentPlan(options={}){
  if(requestsMixedQ024(options))return buildMixedQ024Plan(options);
  if(!requestsQ024(options))return base.buildG3AU08CurrentPlan(options);
  return Object.freeze({sourceId:G3A_U08_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([G3A_U08_P04F24_KP_ID]),requestedKnowledgePointIds:Object.freeze([G3A_U08_P04F24_KP_ID]),selectedPatternGroupIds:Object.freeze([G3A_U08_P04F24_GROUP_ID]),patternSpecIds:Object.freeze([G3A_U08_P04F24_SPEC_ID]),questionCount:Number(options.questionCount??8),questionMode:"application",ordering:options.ordering==="shuffleAcrossPatterns"?"shuffleAcrossPatterns":"groupedByPattern",generationSeed:String(options.generationSeed??"p04f24-measurement-fraction"),allocation:null,genericFallbackAllowed:false,productAdmissionTask:"P04F_W4DirectProductVerticalSlice024Implementation"});
}

export function validateG3AU08CurrentPlan(plan={}){
  if(planIsMixedQ024(plan)){
    const errors=[];
    if(!Number.isInteger(plan.questionCount)||plan.questionCount<1||plan.questionCount>120)errors.push(issue("p04f24_mixed_question_count_invalid","questionCount"));
    if(!Array.isArray(plan.selectedKnowledgePointIds)||plan.selectedKnowledgePointIds.length<2||plan.selectedKnowledgePointIds.some(id=>!CURRENT_KP_SET.has(id)))errors.push(issue("p04f24_mixed_kp_selection_invalid","selectedKnowledgePointIds"));
    if(plan.selectedKnowledgePointIds.filter(id=>id===G3A_U08_P04F24_KP_ID).length!==1)errors.push(issue("p04f24_mixed_measurement_kp_invalid","selectedKnowledgePointIds"));
    const baseIds=plan.selectedKnowledgePointIds.filter(id=>BASE_KP_SET.has(id));
    const expectedBase=base.buildG3AU08CurrentPlan({sourceId:G3A_U08_SOURCE_ID,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:baseIds,questionMode:"mixed",questionCount:plan.questionCount,ordering:plan.ordering,generationSeed:plan.generationSeed});
    const expectedPatternSpecIds=[...expectedBase.patternSpecIds,G3A_U08_P04F24_SPEC_ID];
    if(JSON.stringify(plan.patternSpecIds)!==JSON.stringify(expectedPatternSpecIds))errors.push(issue("p04f24_mixed_pattern_set_invalid","patternSpecIds"));
    if(plan.genericFallbackAllowed!==false)errors.push(issue("p04f24_generic_fallback_must_be_disabled","genericFallbackAllowed"));
    return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([])});
  }
  if(!planIsSingleQ024(plan))return base.validateG3AU08CurrentPlan(plan);
  const errors=[];
  if(plan.selectionMode!=="singleKnowledgePoint")errors.push(issue("p04f24_selection_mode_invalid","selectionMode"));
  if(plan.questionMode!=="application")errors.push(issue("p04f24_requires_application_surface","questionMode"));
  if(!Number.isInteger(plan.questionCount)||plan.questionCount<1||plan.questionCount>24)errors.push(issue("p04f24_question_count_invalid","questionCount"));
  if(plan.patternSpecIds.length!==1||plan.patternSpecIds[0]!==G3A_U08_P04F24_SPEC_ID)errors.push(issue("p04f24_pattern_set_invalid","patternSpecIds"));
  if(plan.genericFallbackAllowed!==false)errors.push(issue("p04f24_generic_fallback_must_be_disabled","genericFallbackAllowed"));
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([])});
}

function generateMixedQ024Questions(options,plan){
  const pv=validateG3AU08CurrentPlan(plan);
  if(!pv.ok)return Object.freeze({ok:false,errors:pv.errors,warnings:pv.warnings,questions:Object.freeze([]),allocation:Object.freeze([]),knowledgePointAllocation:Object.freeze([]),plan});
  const knowledgePointAllocation=allocateAcrossKnowledgePoints(plan.selectedKnowledgePointIds,plan.questionCount);
  const generatedQuestions=[];
  const errors=[];
  for(const entry of knowledgePointAllocation){
    let generation;
    if(entry.knowledgePointId===G3A_U08_P04F24_KP_ID){
      generation=generateG3AU08MeasurementFractionQuestions({...options,plan:undefined,sourceId:G3A_U08_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3A_U08_P04F24_KP_ID],selectedPatternGroupIds:[G3A_U08_P04F24_GROUP_ID],patternSpecIds:[G3A_U08_P04F24_SPEC_ID],questionMode:"application",questionCount:entry.questionCount,ordering:"groupedByPattern",generationSeed:`${plan.generationSeed}:${entry.knowledgePointId}:application`});
    }else{
      generation=base.generateG3AU08CurrentQuestions({...options,plan:undefined,sourceId:G3A_U08_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[entry.knowledgePointId],selectedPatternGroupIds:[],patternSpecIds:undefined,questionMode:"mixed",questionCount:entry.questionCount,ordering:"groupedByPattern",generationSeed:`${plan.generationSeed}:${entry.knowledgePointId}:mixed`});
    }
    if(!generation.ok){errors.push(...(generation.errors??[]).map(error=>({...error,path:`${entry.knowledgePointId}.${error.path}`})));continue;}
    generatedQuestions.push(...generation.questions);
  }
  if(generatedQuestions.length!==plan.questionCount)errors.push(issue("p04f24_mixed_output_count_mismatch","questions"));
  const orderedQuestions=applyOrdering(generatedQuestions,plan);
  const validation=validateG3AU08CurrentQuestions(orderedQuestions);
  errors.push(...validation.errors);
  const allocation=plan.patternSpecIds.map(patternSpecId=>Object.freeze({patternSpecId,questionCount:orderedQuestions.filter(question=>question.patternSpecId===patternSpecId).length})).filter(entry=>entry.questionCount>0);
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([]),questions:Object.freeze(orderedQuestions),allocation:Object.freeze(allocation),knowledgePointAllocation:Object.freeze(knowledgePointAllocation),plan});
}

export function generateG3AU08CurrentQuestions(options={}){
  const plan=options.plan??buildG3AU08CurrentPlan(options);
  if(planIsMixedQ024(plan))return generateMixedQ024Questions(options,plan);
  if(!planIsSingleQ024(plan))return base.generateG3AU08CurrentQuestions({...options,plan});
  const pv=validateG3AU08CurrentPlan(plan);
  if(!pv.ok)return Object.freeze({ok:false,errors:pv.errors,warnings:pv.warnings,questions:Object.freeze([]),allocation:Object.freeze([]),plan});
  return generateG3AU08MeasurementFractionQuestions({...options,plan,questionMode:"application",questionCount:plan.questionCount,generationSeed:plan.generationSeed});
}

export function validateG3AU08CurrentQuestion(question={}){return (question.patternSpecId??question.metadata?.patternId)===G3A_U08_P04F24_SPEC_ID?validateG3AU08MeasurementFractionQuestion(question):base.validateG3AU08CurrentQuestion(question);}
export function validateG3AU08CurrentQuestions(questions=[]){if(!questions.some(q=>(q.patternSpecId??q.metadata?.patternId)===G3A_U08_P04F24_SPEC_ID))return base.validateG3AU08CurrentQuestions(questions);const errors=[];questions.forEach((q,index)=>{const r=validateG3AU08CurrentQuestion(q);errors.push(...(r.errors??[]).map(e=>({...e,path:`questions[${index}].${e.path}`})));});const prompts=questions.map(q=>String(q.blankedDisplayText??q.promptText??"").trim());if(new Set(prompts).size!==prompts.length)errors.push(issue("p04f24_duplicate_prompt_detected","questions"));const ids=questions.map(q=>q.id);if(new Set(ids).size!==ids.length)errors.push(issue("p04f24_duplicate_question_id","questions"));return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([]),infos:Object.freeze([]),validatorVersion:"g3a-u08-current-coordinator-p04f24-v2",validatedAt:null});}
