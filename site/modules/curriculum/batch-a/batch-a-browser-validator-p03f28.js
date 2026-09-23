export * from "./batch-a-browser-validator-p03f27.js";
import { validateBatchABrowserPlan as basePlan, validateBatchABrowserQuestion as baseQuestion, validateBatchABrowserQuestions as baseQuestions } from "./batch-a-browser-validator-p03f27.js";
import { G5A_U01_DECIMAL_READ_PLACE_SPEC_ID, G5A_U01_SOURCE_ID } from "../registry/g5a-u01-decimal-read-place-selector-projection.js";
import { G5A_U01_P03F28_SPEC_ID } from "../registry/g5a-u01-rank8-decimal-selector-projection-p03f28.js";
import { validateG5AU01P03F28Question } from "./g5a-u01-rank8-decimal-runtime-p03f28.js";

const allowedIds=new Set([G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,G5A_U01_P03F28_SPEC_ID]);
const id=(question)=>question.patternSpecId??question.metadata?.patternId;
const isTarget=(question)=>id(question)===G5A_U01_P03F28_SPEC_ID;
const issue=(code,path)=>({code,severity:"error",path,message:code});

export function validateBatchABrowserPlan(plan={}){
  if(plan.sourceId!==G5A_U01_SOURCE_ID || !plan.patternSpecIds?.includes(G5A_U01_P03F28_SPEC_ID)) return basePlan(plan);
  const errors=[];
  if(!Array.isArray(plan.patternSpecIds)||plan.patternSpecIds.length<1||!plan.patternSpecIds.every((patternId)=>allowedIds.has(patternId))) errors.push(issue("p03f28_pattern_set_invalid","patternSpecIds"));
  if(!Number.isInteger(plan.questionCount)||plan.questionCount<1||plan.questionCount>240) errors.push(issue("p03f28_question_count_invalid","questionCount"));
  if(plan.questionMode!=="numeric") errors.push(issue("p03f28_question_mode_invalid","questionMode"));
  if(plan.genericFallbackAllowed!==false) errors.push(issue("p03f28_generic_fallback_must_be_disabled","genericFallbackAllowed"));
  return {ok:errors.length===0,errors,warnings:[]};
}
export function validateBatchABrowserQuestion(question={}){ return isTarget(question)?validateG5AU01P03F28Question(question):baseQuestion(question); }
export function validateBatchABrowserQuestions(questions=[]){
  if(!questions.some(isTarget)) return baseQuestions(questions);
  const errors=[];
  questions.forEach((question,index)=>errors.push(...validateBatchABrowserQuestion(question).errors.map((error)=>({...error,path:`questions[${index}].${error.path}`}))));
  return {ok:errors.length===0,errors,warnings:[],infos:[],validatorVersion:"p03f28-g5a-u01-rank8-decimal-v1",validatedAt:null};
}
