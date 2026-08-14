import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f34.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f34-extension.js";
import {
  generateG4AU09P03F26Questions,
  validateG4AU09P03F26Question,
} from "./g4a-u09-rank8-decimal-runtime-p03f26.js";
import { G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS } from "../registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";
import {
  G4A_U09_P03F34_KP_ID,
  G4A_U09_P03F34_PATTERN_GROUP_ID,
  G4A_U09_P03F34_PATTERN_SPEC_ID,
  G4A_U09_P03F34_SOURCE_ID,
  P03F34_REQUIRED_CAPABILITY_IDS,
} from "../registry/g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";

const ALL_IDS=new Set([...G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS,G4A_U09_P03F34_PATTERN_SPEC_ID]);
const seedOffset=(seed,size)=>[...String(seed??"p03f34")].reduce((sum,char)=>(sum+char.charCodeAt(0))%Math.max(1,size),0);
const pad2=(value)=>String(value).padStart(2,"0");
const decimal2=(hundredths)=>`${Math.floor(hundredths/100)}.${pad2(Math.abs(hundredths%100))}`;
const relationPass=(left,right,relation)=>relation==="<"?left<right:left>right;
const leftValueForDigit=(fixture,digit)=>fixture.missingPlace==="tenths"
  ? fixture.whole*100+digit*10+fixture.fixedDigit
  : fixture.whole*100+fixture.fixedDigit*10+digit;
const completeDigitSet=(fixture)=>Array.from({length:10},(_,digit)=>digit).filter((digit)=>relationPass(leftValueForDigit(fixture,digit),fixture.rightHundredths,fixture.relation));
function fixtureFor(ordinal,seed){
  const offset=seedOffset(seed,11);
  const missingPlace=ordinal%2===0?"tenths":"hundredths";
  const relation=ordinal%4<2?"<":">";
  const whole=1+((ordinal*3+offset)%8);
  if(missingPlace==="tenths"){
    const threshold=2+((ordinal+offset)%6);
    const fixedDigit=(ordinal*7+offset)%10;
    const rightLast=(ordinal*5+offset+3)%10;
    return {missingPlace,relation,whole,fixedDigit,rightHundredths:whole*100+threshold*10+rightLast};
  }
  const fixedDigit=1+((ordinal*3+offset)%8);
  const threshold=1+((ordinal+offset)%8);
  return {missingPlace,relation,whole,fixedDigit,rightHundredths:whole*100+fixedDigit*10+threshold};
}
function metadata(definition){
  return Object.freeze({
    patternId:G4A_U09_P03F34_PATTERN_SPEC_ID,
    sourceId:G4A_U09_P03F34_SOURCE_ID,
    patternTags:Object.freeze(["full_product_w3_slice034",G4A_U09_P03F34_PATTERN_SPEC_ID]),
    skillTags:definition.skillTags,
    difficultyTags:definition.difficultyTags,
    curriculumNodeIds:Object.freeze([G4A_U09_P03F34_SOURCE_ID]),
    canonicalSkillIds:definition.canonicalSkillIds,
    knowledgePointId:G4A_U09_P03F34_KP_ID,
    patternGroupId:G4A_U09_P03F34_PATTERN_GROUP_ID,
    operationFamilyId:"missing_digit_inequality",
    requestedUnknownRole:"possibleDigits",
    requiredCapabilityIds:P03F34_REQUIRED_CAPABILITY_IDS,
    applicationClassification:"APPLICATION_NOT_APPLICABLE",
    productAdmissionTask:"P03F_W3DirectProductVerticalSlice034Implementation",
    generatorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath:null,
  });
}
function buildTargetQuestion(ordinal,seed){
  const definition=getBatchABrowserPatternDefinition(G4A_U09_P03F34_PATTERN_SPEC_ID);
  const fixture=fixtureFor(ordinal,seed);
  const possibleDigits=Object.freeze(completeDigitSet(fixture));
  const leftTemplate=fixture.missingPlace==="tenths"?`${fixture.whole}.□${fixture.fixedDigit}`:`${fixture.whole}.${fixture.fixedDigit}□`;
  const rightDecimal=decimal2(fixture.rightHundredths);
  const answerText=possibleDigits.join("、");
  const promptText=`${leftTemplate} ${fixture.relation} ${rightDecimal}，□ 可以填哪些數字？`;
  return Object.freeze({
    id:`${G4A_U09_P03F34_PATTERN_SPEC_ID}-${ordinal+1}`,
    sourceId:G4A_U09_P03F34_SOURCE_ID,
    patternSpecId:G4A_U09_P03F34_PATTERN_SPEC_ID,
    kind:definition.kind,
    operation:"missing_digit_inequality",
    operationFamilyId:"missing_digit_inequality",
    questionMode:"numeric",mode:"NUMERIC",
    promptText,questionText:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,
    answerText,finalAnswer:answerText,answerType:"digit_set",
    possibleDigits,
    missingPlace:fixture.missingPlace,
    relation:fixture.relation,
    whole:fixture.whole,
    fixedDigit:fixture.fixedDigit,
    rightHundredths:fixture.rightHundredths,
    rightDecimal,leftTemplate,decimalPlaces:2,
    metadata:metadata(definition),
    globalContextProduction:null,
  });
}
function buildPriorQuestion(patternSpecId,ordinal,seed){
  const result=generateG4AU09P03F26Questions({sourceId:G4A_U09_P03F34_SOURCE_ID,patternSpecIds:[patternSpecId],questionMode:"numeric",questionCount:1,generationSeed:`${seed}-p03f34-${patternSpecId}-${ordinal}`});
  if(!result.ok||!result.questions?.[0]) return null;
  return Object.freeze({...result.questions[0],id:`${patternSpecId}-p03f34-${ordinal+1}`});
}
export function canGenerateG4AU09P03F34Questions(plan={}){
  return plan.sourceId===G4A_U09_P03F34_SOURCE_ID&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.length>0&&plan.patternSpecIds.includes(G4A_U09_P03F34_PATTERN_SPEC_ID)&&plan.patternSpecIds.every((id)=>ALL_IDS.has(id));
}
export function validateG4AU09P03F34Question(question={}){
  const id=question.patternSpecId??question.metadata?.patternId;
  if(id!==G4A_U09_P03F34_PATTERN_SPEC_ID) return validateG4AU09P03F26Question(question);
  const errors=[];
  const add=(code,path)=>errors.push({code,severity:"error",path,message:code});
  if(question.sourceId!==G4A_U09_P03F34_SOURCE_ID||question.metadata?.sourceId!==G4A_U09_P03F34_SOURCE_ID) add("p03f34_source_mismatch","sourceId");
  if(question.metadata?.knowledgePointId!==G4A_U09_P03F34_KP_ID||question.metadata?.patternGroupId!==G4A_U09_P03F34_PATTERN_GROUP_ID) add("p03f34_lineage_mismatch","metadata");
  if(question.questionMode!=="numeric"||question.globalContextProduction!=null||question.metadata?.globalContextAuthorityPath!=null) add("p03f34_application_scope_leak","questionMode");
  if(JSON.stringify(question.metadata?.requiredCapabilityIds??[])!==JSON.stringify(P03F34_REQUIRED_CAPABILITY_IDS)) add("p03f34_capability_set_invalid","metadata.requiredCapabilityIds");
  if((question.metadata?.requiredCapabilityIds??[]).includes("cap_decimal_arithmetic")) add("p03f34_arithmetic_capability_leak","metadata.requiredCapabilityIds");
  if(!["tenths","hundredths"].includes(question.missingPlace)||!["<",">"].includes(question.relation)||!Number.isSafeInteger(question.whole)||!Number.isSafeInteger(question.fixedDigit)||!Number.isSafeInteger(question.rightHundredths)) add("p03f34_fixture_invalid","decimalConstraint");
  const fixture={missingPlace:question.missingPlace,relation:question.relation,whole:question.whole,fixedDigit:question.fixedDigit,rightHundredths:question.rightHundredths};
  const expected=completeDigitSet(fixture);
  if(expected.length===0||expected.length===10) add("p03f34_digit_set_not_discriminating","possibleDigits");
  if(!Array.isArray(question.possibleDigits)||JSON.stringify(question.possibleDigits)!==JSON.stringify(expected)) add("p03f34_digit_set_incomplete","possibleDigits");
  if(question.answerText!==expected.join("、")||question.finalAnswer!==question.answerText||question.answerType!=="digit_set") add("p03f34_answer_invalid","answerText");
  if(!String(question.leftTemplate??"").includes("□")) add("p03f34_missing_digit_mask_invalid","leftTemplate");
  return {ok:errors.length===0,errors,warnings:[]};
}
export function generateG4AU09P03F34Questions(options={}){
  const plan=options.plan??buildBatchABrowserPlan(options);
  if(!canGenerateG4AU09P03F34Questions(plan)) return {ok:false,errors:[{code:"p03f34_plan_not_supported",severity:"error",path:"patternSpecIds",message:"p03f34_plan_not_supported"}],warnings:[],questions:[],plan};
  const count=Number.isInteger(plan.questionCount)?plan.questionCount:24;
  const occurrence=new Map(plan.patternSpecIds.map((id)=>[id,0]));
  const questions=[];
  for(let index=0;index<count;index+=1){
    const patternSpecId=plan.patternSpecIds[index%plan.patternSpecIds.length];
    const ordinal=occurrence.get(patternSpecId)??0; occurrence.set(patternSpecId,ordinal+1);
    const question=patternSpecId===G4A_U09_P03F34_PATTERN_SPEC_ID?buildTargetQuestion(ordinal,plan.generationSeed):buildPriorQuestion(patternSpecId,ordinal,plan.generationSeed);
    if(!question) return {ok:false,errors:[{code:"p03f34_prior_runtime_failed",severity:"error",path:`questions[${index}]`,message:"p03f34_prior_runtime_failed"}],warnings:[],questions,plan};
    questions.push(question);
  }
  const errors=[];
  questions.forEach((question,index)=>errors.push(...validateG4AU09P03F34Question(question).errors.map((error)=>({...error,path:`questions[${index}].${error.path}`}))));
  const allocation=Object.freeze(plan.patternSpecIds.map((patternSpecId)=>Object.freeze({patternSpecId,questionCount:questions.filter((row)=>row.patternSpecId===patternSpecId).length})));
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([]),questions:Object.freeze(questions),plan,allocation});
}
