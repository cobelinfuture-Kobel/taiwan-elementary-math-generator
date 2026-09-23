import {
  G6B_U01_P03F41_GROUP_ID,
  G6B_U01_P03F41_KP_ID,
  G6B_U01_P03F41_SOURCE_ID,
  G6B_U01_P03F41_SPEC_ID,
  P03F41_REQUIRED_CAPABILITY_IDS,
} from "../registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js";
import {
  exactDecimalToFraction,
  exactMixedDomainCompare,
  parseExactFraction,
} from "../public/shared-mixed-domain-normalizer-p03f32.js";

const DENOMINATORS=Object.freeze([3,4,5,6,8,10,12,20,25,40]);
const RELATION_SYMBOL=Object.freeze({LESS_THAN:"<",EQUAL:"=",GREATER_THAN:">"});
const hash=value=>[...String(value??"p03f41")].reduce((total,char)=>((total*33)^char.charCodeAt(0))>>>0,5381);
const issue=(code,path)=>({code,severity:"error",path,message:code});

function decimalText(coefficient){
  const whole=Math.floor(coefficient/100);
  const fraction=String(coefficient%100).padStart(2,"0");
  return `${whole}.${fraction}`.replace(/0+$/u,"").replace(/\.$/u,"");
}
function fractionText(numerator,denominator){return denominator===1?String(numerator):`${numerator}/${denominator}`;}
function canonicalFraction(numerator,denominator){
  const parsed=parseExactFraction({numerator,denominator});
  return Object.freeze({numerator:parsed.canonical.numerator,denominator:parsed.canonical.denominator});
}
function fixture(ordinal,seed){
  const offset=hash(seed)%899;
  const coefficient=101+((ordinal*37+offset)%899);
  const decimal=decimalText(coefficient);
  const desired=ordinal%3===0?"LESS_THAN":ordinal%3===1?"GREATER_THAN":"EQUAL";
  let fraction;
  if(desired==="EQUAL"){
    const converted=exactDecimalToFraction(decimal);
    fraction=Object.freeze({numerator:converted.canonicalValue.numerator,denominator:converted.canonicalValue.denominator});
  }else{
    const denominator=DENOMINATORS[(ordinal+offset)%DENOMINATORS.length];
    const scaled=coefficient*denominator;
    const floor=Math.floor(scaled/100);
    const exact=scaled%100===0;
    const numerator=desired==="LESS_THAN"?floor+1:Math.max(1,exact?floor-1:floor);
    fraction=canonicalFraction(numerator,denominator);
  }
  const decimalLeft=(ordinal+offset)%2===0;
  return Object.freeze({decimal,fractionNumerator:fraction.numerator,fractionDenominator:fraction.denominator,decimalLeft});
}
function compareFixture(row){
  const fraction=Object.freeze({numerator:row.fractionNumerator,denominator:row.fractionDenominator});
  return row.decimalLeft
    ? exactMixedDomainCompare({leftDomain:"DECIMAL",leftValue:row.decimal,rightDomain:"FRACTION",rightValue:fraction})
    : exactMixedDomainCompare({leftDomain:"FRACTION",leftValue:fraction,rightDomain:"DECIMAL",rightValue:row.decimal});
}
function buildQuestion(ordinal,seed){
  const row=fixture(ordinal,seed),comparison=compareFixture(row),answerText=RELATION_SYMBOL[comparison.relation];
  const fraction=fractionText(row.fractionNumerator,row.fractionDenominator);
  const leftText=row.decimalLeft?row.decimal:fraction,rightText=row.decimalLeft?fraction:row.decimal;
  const promptText=`${leftText} ○ ${rightText}，請填入 <、= 或 >。`;
  return Object.freeze({
    id:`${G6B_U01_P03F41_SPEC_ID}-${ordinal+1}`,
    sourceId:G6B_U01_P03F41_SOURCE_ID,
    patternSpecId:G6B_U01_P03F41_SPEC_ID,
    kind:"g6bU01Rank9MixedNumberDomainOrder",
    operation:"mixed_domain_compare",
    operationFamilyId:"mixed_domain_compare",
    action:"COMPARE",
    questionMode:"numeric",
    mode:"NUMERIC",
    decimal:row.decimal,
    fractionNumerator:row.fractionNumerator,
    fractionDenominator:row.fractionDenominator,
    decimalLeft:row.decimalLeft,
    leftDomain:row.decimalLeft?"DECIMAL":"FRACTION",
    rightDomain:row.decimalLeft?"FRACTION":"DECIMAL",
    promptText,
    questionText:promptText,
    blankedDisplayText:promptText,
    displayText:`${promptText} ${answerText}`,
    answerText,
    finalAnswer:Object.freeze({kind:"relation",canonicalText:answerText,relation:comparison.relation,comparison:comparison.comparison,exact:true}),
    metadata:Object.freeze({
      patternId:G6B_U01_P03F41_SPEC_ID,
      sourceId:G6B_U01_P03F41_SOURCE_ID,
      knowledgePointId:G6B_U01_P03F41_KP_ID,
      patternGroupId:G6B_U01_P03F41_GROUP_ID,
      operationFamilyId:"mixed_domain_compare",
      requestedUnknownRole:"relation",
      requiredCapabilityIds:P03F41_REQUIRED_CAPABILITY_IDS,
      applicationClassification:"APPLICATION_COMPATIBLE_FUTURE_QUEUE_RESERVED",
      contextAuthority:null,
      globalContextProduction:null,
      sourceAuthorityMode:"R02_CANONICAL_PREREQUISITE_PROJECTION",
      directSourcePromptVerbatim:false,
      sourceReviewMethod:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_SLICE032_DIRECT_SOURCE_RECHECK",
      productAdmissionTask:"P03F_W3DirectProductVerticalSlice041Implementation",
      generatorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
      validatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
      mixedDomainNormalizerId:"shared-mixed-domain-normalizer-p03f32-v2",
    }),
    globalContextProduction:null,
  });
}

export function canGenerateG6BU01P03F41Questions(plan={}){return plan.sourceId===G6B_U01_P03F41_SOURCE_ID&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.length>0&&plan.patternSpecIds.every(id=>id===G6B_U01_P03F41_SPEC_ID);}
export function validateG6BU01P03F41Question(question={}){
  const errors=[];
  if(question.patternSpecId!==G6B_U01_P03F41_SPEC_ID)errors.push(issue("p03f41_pattern_not_admitted","patternSpecId"));
  if(question.sourceId!==G6B_U01_P03F41_SOURCE_ID||question.metadata?.sourceId!==G6B_U01_P03F41_SOURCE_ID)errors.push(issue("p03f41_source_mismatch","sourceId"));
  if(question.metadata?.knowledgePointId!==G6B_U01_P03F41_KP_ID||question.metadata?.patternGroupId!==G6B_U01_P03F41_GROUP_ID)errors.push(issue("p03f41_kp_group_mismatch","metadata"));
  if(question.questionMode!=="numeric"||question.globalContextProduction!=null||question.metadata?.contextAuthority!=null||question.metadata?.globalContextProduction!=null)errors.push(issue("p03f41_application_scope_violation","metadata.contextAuthority"));
  if(JSON.stringify(question.metadata?.requiredCapabilityIds)!==JSON.stringify(P03F41_REQUIRED_CAPABILITY_IDS))errors.push(issue("p03f41_capability_set_invalid","metadata.requiredCapabilityIds"));
  if(question.metadata?.directSourcePromptVerbatim!==false||question.metadata?.sourceAuthorityMode!=="R02_CANONICAL_PREREQUISITE_PROJECTION")errors.push(issue("p03f41_source_provenance_invalid","metadata.sourceAuthorityMode"));
  if(!["DECIMAL","FRACTION"].includes(question.leftDomain)||!["DECIMAL","FRACTION"].includes(question.rightDomain)||question.leftDomain===question.rightDomain)errors.push(issue("p03f41_cross_domain_operand_invalid","leftDomain"));
  try{
    const fraction={numerator:question.fractionNumerator,denominator:question.fractionDenominator};
    const expected=question.decimalLeft
      ? exactMixedDomainCompare({leftDomain:"DECIMAL",leftValue:question.decimal,rightDomain:"FRACTION",rightValue:fraction})
      : exactMixedDomainCompare({leftDomain:"FRACTION",leftValue:fraction,rightDomain:"DECIMAL",rightValue:question.decimal});
    const expectedText=RELATION_SYMBOL[expected.relation];
    if(question.action!=="COMPARE"||question.answerText!==expectedText||question.finalAnswer?.canonicalText!==expectedText||question.finalAnswer?.relation!==expected.relation||question.finalAnswer?.comparison!==expected.comparison||question.finalAnswer?.exact!==true)errors.push(issue("p03f41_compare_answer_invalid","finalAnswer"));
  }catch{errors.push(issue("p03f41_exact_compare_failed","finalAnswer"));}
  return{ok:errors.length===0,errors,warnings:[]};
}
export function generateG6BU01P03F41Questions(options={}){
  const plan=options.plan??options,questionCount=Number(options.questionCount??plan.questionCount??24);
  if(!canGenerateG6BU01P03F41Questions(plan)||!Number.isInteger(questionCount)||questionCount<1||questionCount>240)return{ok:false,plan,questions:[],allocation:[],errors:[issue("p03f41_plan_not_supported","plan")],warnings:[]};
  const seed=options.generationSeed??plan.generationSeed??"p03f41";
  const questions=Array.from({length:questionCount},(_,index)=>buildQuestion(index,seed));
  const errors=questions.flatMap((question,index)=>validateG6BU01P03F41Question(question).errors.map(error=>({...error,path:`questions[${index}].${error.path}`})));
  if(new Set(questions.map(question=>question.blankedDisplayText)).size!==questions.length)errors.push(issue("p03f41_duplicate_prompt_detected","questions"));
  return Object.freeze({ok:errors.length===0,plan,questions:Object.freeze(questions),allocation:Object.freeze([{patternSpecId:G6B_U01_P03F41_SPEC_ID,questionCount:questions.length}]),errors:Object.freeze(errors),warnings:Object.freeze([])});
}
