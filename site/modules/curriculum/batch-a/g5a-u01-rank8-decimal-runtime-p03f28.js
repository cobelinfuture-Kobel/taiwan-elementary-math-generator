import {
  G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,
  G5A_U01_SOURCE_ID,
} from "../registry/g5a-u01-decimal-read-place-selector-projection.js";
import {
  G5A_U01_P03F28_GROUP_ID,
  G5A_U01_P03F28_KP_ID,
  G5A_U01_P03F28_SPEC_ID,
} from "../registry/g5a-u01-rank8-decimal-selector-projection-p03f28.js";
import { P03F28_DECIMAL_CAPABILITY_IDS } from "./source-pattern-full-product-p03f28-extension.js";
import {
  generateG5AU01Slice021Questions,
  validateG5AU01Slice021Question,
} from "./decimal-read-place-runtime-p03f21.js";

export const G5A_U01_P03F28_VISIBLE_SPEC_IDS = Object.freeze([
  G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,
  G5A_U01_P03F28_SPEC_ID,
]);
const PLACE_UNITS = Object.freeze(["0.1","0.01","0.001","0.0001","0.00001","0.000001"]);
const hash = (value) => [...String(value)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);
const canonical = (whole,digits) => `${whole}.${digits.join("")}`;

function buildComposeCase(serial){
  const scale=3+(serial%4);
  const modulus=10**scale;
  const whole=(serial*37)%1000;
  const fractional=(serial*7919+104729)%modulus;
  const digits=String(fractional).padStart(scale,"0").split("").map(Number);
  if(serial%4===0 && digits.length>=4) digits[1]=0;
  if(serial%5===0) digits[digits.length-1]=0;
  return {whole,digits};
}
function composePrompt(whole,digits){
  const terms=[String(whole),...digits.map((digit,index)=>`${digit}×${PLACE_UNITS[index]}`)];
  return `把 ${terms.join(" + ")} 合起來，是多少？`;
}
function buildComposeQuestion({whole,digits},ordinal){
  const answer=canonical(whole,digits);
  const promptText=composePrompt(whole,digits);
  return Object.freeze({
    id:`${G5A_U01_P03F28_SPEC_ID}-${ordinal}`,
    sourceId:G5A_U01_SOURCE_ID,
    patternSpecId:G5A_U01_P03F28_SPEC_ID,
    kind:"g5aU01Rank8DecimalComposeDecompose",
    operation:"decimal_representation",
    operationFamilyId:"decimal_representation",
    questionMode:"numeric",
    mode:"NUMERIC",
    whole,
    digits:Object.freeze([...digits]),
    decimalScale:digits.length,
    promptText,
    questionText:promptText,
    blankedDisplayText:promptText,
    answerText:answer,
    displayText:`${promptText} ${answer}`,
    finalAnswer:Object.freeze({kind:"decimal",coefficient:`${whole}${digits.join("")}`,scale:digits.length,canonicalText:answer,exact:true}),
    globalContextProduction:null,
    metadata:Object.freeze({
      patternId:G5A_U01_P03F28_SPEC_ID,
      sourceId:G5A_U01_SOURCE_ID,
      knowledgePointId:G5A_U01_P03F28_KP_ID,
      patternGroupId:G5A_U01_P03F28_GROUP_ID,
      operationFamilyId:"decimal_representation",
      requestedUnknownRole:"decimal",
      requiredCapabilityIds:P03F28_DECIMAL_CAPABILITY_IDS,
      applicationClassification:"APPLICATION_NOT_APPLICABLE",
      contextAuthority:null,
      globalContextAuthorityPath:null,
      productAdmissionTask:"P03F_W3DirectProductVerticalSlice028Implementation",
      generatorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
      validatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    }),
  });
}

export function validateG5AU01P03F28Question(question={}){
  if(question.patternSpecId===G5A_U01_DECIMAL_READ_PLACE_SPEC_ID) return validateG5AU01Slice021Question(question);
  const errors=[];
  const add=(code,path)=>errors.push({code,severity:"error",path,message:code});
  if(question.sourceId!==G5A_U01_SOURCE_ID || question.metadata?.sourceId!==G5A_U01_SOURCE_ID) add("p03f28_source_mismatch","sourceId");
  if(question.patternSpecId!==G5A_U01_P03F28_SPEC_ID || question.metadata?.patternId!==G5A_U01_P03F28_SPEC_ID) add("p03f28_pattern_mismatch","patternSpecId");
  if(question.metadata?.knowledgePointId!==G5A_U01_P03F28_KP_ID || question.metadata?.patternGroupId!==G5A_U01_P03F28_GROUP_ID) add("p03f28_kp_group_mismatch","metadata");
  if(!Number.isInteger(question.whole)||question.whole<0||!Array.isArray(question.digits)||question.digits.length<3||question.digits.length>6||question.digits.some((digit)=>!Number.isInteger(digit)||digit<0||digit>9)) add("p03f28_place_digits_invalid","digits");
  const expected=Number.isInteger(question.whole)&&Array.isArray(question.digits)?canonical(question.whole,question.digits):null;
  if(question.answerText!==expected||question.finalAnswer?.canonicalText!==expected||question.finalAnswer?.coefficient!==`${question.whole}${question.digits?.join("")}`||question.finalAnswer?.scale!==question.digits?.length||question.finalAnswer?.exact!==true) add("p03f28_exact_decimal_identity_invalid","finalAnswer");
  if(JSON.stringify(question.metadata?.requiredCapabilityIds)!==JSON.stringify(P03F28_DECIMAL_CAPABILITY_IDS)) add("p03f28_capability_set_invalid","metadata.requiredCapabilityIds");
  if(question.questionMode!=="numeric"||question.globalContextProduction!==null||question.metadata?.contextAuthority!==null||question.metadata?.globalContextAuthorityPath!==null) add("p03f28_application_scope_violation","questionMode");
  return {ok:errors.length===0,errors,warnings:[]};
}

export function canGenerateG5AU01P03F28Questions(plan={}){
  return plan.sourceId===G5A_U01_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length>0
    && plan.patternSpecIds.includes(G5A_U01_P03F28_SPEC_ID)
    && plan.patternSpecIds.every((id)=>G5A_U01_P03F28_VISIBLE_SPEC_IDS.includes(id));
}

export function generateG5AU01P03F28Questions(options={}){
  const plan=options.plan??options;
  const count=Number(options.questionCount??plan.questionCount??8);
  if(!canGenerateG5AU01P03F28Questions(plan)||!Number.isInteger(count)||count<1||count>240){
    return {ok:false,plan,questions:[],allocation:[],errors:[{code:"p03f28_plan_not_supported",severity:"error",path:"plan",message:"P03F28 requires the G5A-U01 compose/decompose spec, optionally mixed with the existing read/place spec, and 1-240 questions."}],warnings:[]};
  }
  const requested=[...new Set(plan.patternSpecIds)];
  const counts=Object.fromEntries(requested.map((id)=>[id,0]));
  for(let index=0;index<count;index+=1) counts[requested[index%requested.length]]+=1;
  const seed=options.generationSeed??plan.generationSeed??"p03f28";
  const queues=new Map();
  if(counts[G5A_U01_DECIMAL_READ_PLACE_SPEC_ID]>0){
    const read=generateG5AU01Slice021Questions({
      sourceId:G5A_U01_SOURCE_ID,
      patternSpecIds:[G5A_U01_DECIMAL_READ_PLACE_SPEC_ID],
      questionCount:counts[G5A_U01_DECIMAL_READ_PLACE_SPEC_ID],
      generationSeed:`${seed}-read`,
    });
    if(!read.ok) return {...read,plan};
    queues.set(G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,[...read.questions]);
  }
  if(counts[G5A_U01_P03F28_SPEC_ID]>0){
    const offset=hash(`${seed}-compose`)%10000;
    queues.set(G5A_U01_P03F28_SPEC_ID,Array.from({length:counts[G5A_U01_P03F28_SPEC_ID]},(_,index)=>buildComposeQuestion(buildComposeCase(offset+index+1),index+1)));
  }
  const cursors=Object.fromEntries(requested.map((id)=>[id,0]));
  const questions=Array.from({length:count},(_,index)=>{
    const id=requested[index%requested.length];
    const question=queues.get(id)[cursors[id]];
    cursors[id]+=1;
    return question;
  });
  const errors=questions.flatMap((question,index)=>validateG5AU01P03F28Question(question).errors.map((error)=>({...error,path:`questions[${index}].${error.path}`})));
  if(new Set(questions.map((question)=>question.blankedDisplayText)).size!==questions.length) errors.push({code:"p03f28_duplicate_prompt_detected",severity:"error",path:"questions",message:"Duplicate prompts are forbidden."});
  return Object.freeze({
    ok:errors.length===0,
    plan,
    questions:Object.freeze(questions),
    allocation:Object.freeze(requested.map((patternSpecId)=>Object.freeze({patternSpecId,questionCount:counts[patternSpecId]}))),
    errors:Object.freeze(errors),
    warnings:Object.freeze([]),
  });
}
