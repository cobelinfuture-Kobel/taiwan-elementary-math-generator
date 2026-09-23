export * from "./batch-a-browser-validator-p03f33.js";
import { validateBatchABrowserPlan as basePlan, validateBatchABrowserQuestion as baseQuestion, validateBatchABrowserQuestions as baseQuestions } from "./batch-a-browser-validator-p03f33.js";
import { G4A_U09_P03F34_PATTERN_SPEC_ID, G4A_U09_P03F34_SOURCE_ID } from "../registry/g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";
import { validateG4AU09P03F34Question } from "./g4a-u09-rank9-missing-digit-inequality-runtime-p03f34.js";
const issue=(code,path)=>({code,severity:"error",path,message:code});
const id=(question)=>question.patternSpecId??question.metadata?.patternId;
const isTarget=(question)=>id(question)===G4A_U09_P03F34_PATTERN_SPEC_ID;
export function validateBatchABrowserPlan(plan={}){
  if(plan.sourceId!==G4A_U09_P03F34_SOURCE_ID||!plan.patternSpecIds?.includes(G4A_U09_P03F34_PATTERN_SPEC_ID)) return basePlan(plan);
  const errors=[];
  if(!Array.isArray(plan.patternSpecIds)||plan.patternSpecIds.length<1) errors.push(issue("p03f34_pattern_set_invalid","patternSpecIds"));
  if(!Number.isInteger(plan.questionCount)||plan.questionCount<1||plan.questionCount>240) errors.push(issue("p03f34_question_count_invalid","questionCount"));
  if(plan.questionMode!=="numeric") errors.push(issue("p03f34_question_mode_invalid","questionMode"));
  if(plan.genericFallbackAllowed!==false) errors.push(issue("p03f34_generic_fallback_must_be_disabled","genericFallbackAllowed"));
  return {ok:errors.length===0,errors,warnings:[]};
}
export function validateBatchABrowserQuestion(question={}){ return isTarget(question)?validateG4AU09P03F34Question(question):baseQuestion(question); }
export function validateBatchABrowserQuestions(questions=[]){
  if(!questions.some(isTarget)) return baseQuestions(questions);
  const errors=[];
  questions.forEach((question,index)=>{
    const validation=isTarget(question)?validateG4AU09P03F34Question(question):baseQuestion(question);
    errors.push(...(validation.errors??[]).map((error)=>({...error,path:`questions[${index}].${error.path}`})));
  });
  return {ok:errors.length===0,errors,warnings:[],infos:[],validatorVersion:"p03f34-g4a-u09-rank9-missing-digit-inequality-v1",validatedAt:null};
}
