import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f27.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f27-extension.js";
import {
  G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS,
  G4B_U08_P03F27_SOURCE_ID,
} from "../registry/g4b-u08-rank8-fraction-selector-projection-p03f27.js";

const ALL_IDS = new Set(G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS);
const DENOMINATOR_PAIRS = Object.freeze([[3,4],[4,5],[5,6],[6,8],[8,12],[5,10],[7,9],[9,12]]);
const EQUAL_PAIRS = Object.freeze([[1,2,2,4],[2,3,4,6],[3,4,6,8],[2,5,4,10],[3,5,6,10]]);
const seedOffset = (seed, size) => [...String(seed ?? "p03f27")].reduce((sum, char) => (sum + char.charCodeAt(0)) % Math.max(1, size), 0);
const gcd = (a, b) => { let x=Math.abs(a), y=Math.abs(b); while(y){ [x,y]=[y,x%y]; } return x || 1; };
function normalize(numerator, denominator){
  if(denominator===0) throw new Error("P03F27_ZERO_DENOMINATOR");
  const sign=denominator<0?-1:1; const n=numerator*sign; const d=Math.abs(denominator); const g=gcd(n,d);
  return Object.freeze({ numerator:n/g, denominator:d/g });
}
const fractionText = ({numerator,denominator}) => denominator===1 ? String(numerator) : `${numerator}/${denominator}`;
const compareProducts = (leftNumerator,leftDenominator,rightNumerator,rightDenominator) => {
  const left=leftNumerator*rightDenominator; const right=rightNumerator*leftDenominator;
  return left<right?"<":left>right?">":"=";
};
const NON_EQUAL_COMPARISON_FIXTURES = Object.freeze(DENOMINATOR_PAIRS.flatMap(([leftDenominator,rightDenominator]) => {
  const rows=[];
  for(let leftNumerator=1;leftNumerator<leftDenominator;leftNumerator+=1){
    for(let rightNumerator=1;rightNumerator<rightDenominator;rightNumerator+=1){
      if(compareProducts(leftNumerator,leftDenominator,rightNumerator,rightDenominator)!=="=") {
        rows.push(Object.freeze({leftNumerator,leftDenominator,rightNumerator,rightDenominator}));
      }
    }
  }
  return rows;
}));

function compareFixture(ordinal, seed){
  const offset=seedOffset(seed,97);
  if(ordinal%5===0){
    const equalityOrdinal=Math.floor(ordinal/5);
    const row=EQUAL_PAIRS[(equalityOrdinal+offset)%EQUAL_PAIRS.length];
    return {leftNumerator:row[0],leftDenominator:row[1],rightNumerator:row[2],rightDenominator:row[3]};
  }
  const row=NON_EQUAL_COMPARISON_FIXTURES[(ordinal*17+offset)%NON_EQUAL_COMPARISON_FIXTURES.length];
  return {leftNumerator:row.leftNumerator,leftDenominator:row.leftDenominator,rightNumerator:row.rightNumerator,rightDenominator:row.rightDenominator};
}

function addSubFixture(ordinal, seed){
  const offset=seedOffset(seed,89);
  const [firstDenominator,secondDenominator]=DENOMINATOR_PAIRS[(ordinal+offset)%DENOMINATOR_PAIRS.length];
  let leftNumerator=1+((ordinal*5+offset)%Math.max(1,firstDenominator-1));
  let rightNumerator=1+((ordinal*7+offset+1)%Math.max(1,secondDenominator-1));
  let leftDenominator=firstDenominator, rightDenominator=secondDenominator;
  const arithmeticOperation=ordinal%2===0?"add":"sub";
  if(arithmeticOperation==="sub"){
    const relation=compareProducts(leftNumerator,leftDenominator,rightNumerator,rightDenominator);
    if(relation==="<") [leftNumerator,leftDenominator,rightNumerator,rightDenominator]=[rightNumerator,rightDenominator,leftNumerator,leftDenominator];
    if(compareProducts(leftNumerator,leftDenominator,rightNumerator,rightDenominator)==="=") {
      if(leftNumerator<leftDenominator-1) leftNumerator+=1;
      else if(rightNumerator>1) rightNumerator-=1;
    }
  }
  return {arithmeticOperation,leftNumerator,leftDenominator,rightNumerator,rightDenominator};
}

function metadata(definition){
  return Object.freeze({
    patternId:definition.patternSpecId,
    sourceId:G4B_U08_P03F27_SOURCE_ID,
    patternTags:Object.freeze(["full_product_w3_slice027",definition.patternSpecId]),
    skillTags:definition.skillTags,
    difficultyTags:definition.difficultyTags,
    curriculumNodeIds:Object.freeze([G4B_U08_P03F27_SOURCE_ID]),
    canonicalSkillIds:definition.canonicalSkillIds,
    knowledgePointId:definition.knowledgePointId,
    patternGroupId:definition.patternGroupId,
    operationFamilyId:definition.operationFamilyId,
    requestedUnknownRole:definition.requestedUnknownRole,
    requiredCapabilityIds:definition.requiredCapabilityIds,
    applicationClassification:definition.applicationClassification,
    productAdmissionTask:"P03F_W3DirectProductVerticalSlice027Implementation",
    generatorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath:null,
  });
}

function buildQuestion(patternSpecId, ordinal, seed){
  const definition=getBatchABrowserPatternDefinition(patternSpecId);
  if(definition.operation==="fraction_compare"){
    const fixture=compareFixture(ordinal,seed);
    const answerText=compareProducts(fixture.leftNumerator,fixture.leftDenominator,fixture.rightNumerator,fixture.rightDenominator);
    const promptText=`${fixture.leftNumerator}/${fixture.leftDenominator} ○ ${fixture.rightNumerator}/${fixture.rightDenominator}，請填入 <、= 或 >。`;
    return Object.freeze({
      id:`${patternSpecId}-${ordinal+1}`,sourceId:G4B_U08_P03F27_SOURCE_ID,patternSpecId,kind:definition.kind,operation:definition.operation,operationFamilyId:definition.operationFamilyId,
      questionMode:"numeric",mode:"NUMERIC",promptText,questionText:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,finalAnswer:answerText,
      ...fixture,comparison:answerText,metadata:metadata(definition),globalContextProduction:null,
    });
  }
  const fixture=addSubFixture(ordinal,seed);
  const commonDenominator=fixture.leftDenominator*fixture.rightDenominator;
  const rawNumerator=fixture.arithmeticOperation==="add"
    ? fixture.leftNumerator*fixture.rightDenominator+fixture.rightNumerator*fixture.leftDenominator
    : fixture.leftNumerator*fixture.rightDenominator-fixture.rightNumerator*fixture.leftDenominator;
  const normalized=normalize(rawNumerator,commonDenominator);
  const answerText=fractionText(normalized);
  const symbol=fixture.arithmeticOperation==="add"?"+":"−";
  const promptText=`${fixture.leftNumerator}/${fixture.leftDenominator} ${symbol} ${fixture.rightNumerator}/${fixture.rightDenominator} = ?`;
  return Object.freeze({
    id:`${patternSpecId}-${ordinal+1}`,sourceId:G4B_U08_P03F27_SOURCE_ID,patternSpecId,kind:definition.kind,operation:definition.operation,operationFamilyId:definition.operationFamilyId,
    questionMode:"numeric",mode:"NUMERIC",promptText,questionText:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,finalAnswer:answerText,
    ...fixture,resultNumerator:normalized.numerator,resultDenominator:normalized.denominator,metadata:metadata(definition),globalContextProduction:null,
  });
}

export function canGenerateG4BU08P03F27Questions(plan={}){
  return plan.sourceId===G4B_U08_P03F27_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length>0 && plan.patternSpecIds.every((id)=>ALL_IDS.has(id));
}

export function validateG4BU08P03F27Question(question={}){
  const errors=[]; const add=(code,path)=>errors.push({code,severity:"error",path,message:code});
  const id=question.patternSpecId??question.metadata?.patternId; const definition=getBatchABrowserPatternDefinition(id);
  if(!ALL_IDS.has(id)||!definition) add("p03f27_pattern_invalid","patternSpecId");
  if(question.sourceId!==G4B_U08_P03F27_SOURCE_ID||question.metadata?.sourceId!==G4B_U08_P03F27_SOURCE_ID) add("p03f27_source_mismatch","sourceId");
  if(question.questionMode!=="numeric"||question.globalContextProduction!=null||question.metadata?.globalContextAuthorityPath!=null) add("p03f27_application_scope_leak","questionMode");
  if(question.metadata?.knowledgePointId!==definition?.knowledgePointId||question.metadata?.patternGroupId!==definition?.patternGroupId) add("p03f27_lineage_mismatch","metadata");
  const caps=question.metadata?.requiredCapabilityIds??[];
  for(const cap of ["cap_fraction_arithmetic","cap_fraction_domain_validator","cap_fraction_number_system"]) if(!caps.includes(cap)) add("p03f27_fraction_capability_missing","metadata.requiredCapabilityIds");
  const ints=[question.leftNumerator,question.leftDenominator,question.rightNumerator,question.rightDenominator];
  if(!ints.every(Number.isSafeInteger)||question.leftDenominator<=0||question.rightDenominator<=0||question.leftDenominator===question.rightDenominator) add("p03f27_fraction_operand_invalid","fractionOperands");
  if(definition?.operation==="fraction_compare"){
    const expected=compareProducts(question.leftNumerator,question.leftDenominator,question.rightNumerator,question.rightDenominator);
    if(question.comparison!==expected||question.answerText!==expected||question.finalAnswer!==expected) add("p03f27_compare_answer_invalid","answerText");
  } else if(definition?.operation==="fraction_add_sub"){
    if(!["add","sub"].includes(question.arithmeticOperation)) add("p03f27_operation_invalid","arithmeticOperation");
    const rawNumerator=question.arithmeticOperation==="add"
      ? question.leftNumerator*question.rightDenominator+question.rightNumerator*question.leftDenominator
      : question.leftNumerator*question.rightDenominator-question.rightNumerator*question.leftDenominator;
    if(question.arithmeticOperation==="sub"&&rawNumerator<0) add("p03f27_negative_subtraction_invalid","resultNumerator");
    const expected=normalize(rawNumerator,question.leftDenominator*question.rightDenominator);
    if(question.resultNumerator!==expected.numerator||question.resultDenominator!==expected.denominator||question.answerText!==fractionText(expected)||question.finalAnswer!==question.answerText) add("p03f27_add_sub_answer_invalid","answerText");
  }
  return {ok:errors.length===0,errors,warnings:[]};
}

export function generateG4BU08P03F27Questions(options={}){
  const plan=buildBatchABrowserPlan(options);
  if(!canGenerateG4BU08P03F27Questions(plan)) return {ok:false,errors:[{code:"p03f27_plan_not_supported",severity:"error",path:"patternSpecIds",message:"p03f27_plan_not_supported"}],warnings:[],questions:[],plan};
  const count=Number.isInteger(plan.questionCount)?plan.questionCount:24;
  const ids=plan.patternSpecIds; const occurrenceBySpec=new Map(ids.map((patternSpecId)=>[patternSpecId,0]));
  const questions=Array.from({length:count},(_,index)=>{ const patternSpecId=ids[index%ids.length]; const ordinal=occurrenceBySpec.get(patternSpecId)??0; occurrenceBySpec.set(patternSpecId,ordinal+1); return buildQuestion(patternSpecId,ordinal,plan.generationSeed); });
  const validation=questions.map(validateG4BU08P03F27Question); const errors=validation.flatMap((row,index)=>row.errors.map((error)=>({...error,path:`questions[${index}].${error.path}`})));
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([]),questions:Object.freeze(questions),plan});
}
