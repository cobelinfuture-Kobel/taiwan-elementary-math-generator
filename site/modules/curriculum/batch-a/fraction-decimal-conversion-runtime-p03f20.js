import { G4B_U08_SOURCE_ID } from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";
import { G4B_U08_FRACTION_DECIMAL_KP_ID, G4B_U08_FRACTION_DECIMAL_GROUP_ID, G4B_U08_FRACTION_DECIMAL_SPEC_IDS } from "../registry/g4b-u08-fraction-decimal-conversion-selector-projection.js";

export const P03F20_REQUIRED_CAPABILITY_IDS = Object.freeze(["cap_fraction_domain_validator", "cap_fraction_number_system"]);
const CASES = Object.freeze([[3,10],[7,10],[9,20],[13,20],[7,25],[18,25],[23,50],[37,50],[41,100],[63,100],[76,100],[89,100],[1,20],[11,25],[17,50],[29,100],[54,100],[92,100],[4,10],[16,20],[21,25],[33,50],[67,100],[97,100]]);
const DECIMAL_SPEC = G4B_U08_FRACTION_DECIMAL_SPEC_IDS[0];
const NUMERATOR_SPEC = G4B_U08_FRACTION_DECIMAL_SPEC_IDS[1];
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const hash=(s)=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);
const decimalText=(n,d)=>{ const hundredths=n*(100/d); return `${Math.floor(hundredths/100)}.${String(hundredths%100).padStart(2,"0")}`; };
function build(patternSpecId,[numerator,denominator],ordinal){
  const decimal=decimalText(numerator,denominator); const askDecimal=patternSpecId===DECIMAL_SPEC;
  const promptText=askDecimal?`將 ${numerator}/${denominator} 化成小數。`:`${decimal} = ？/${denominator}，？是多少？`;
  return Object.freeze({
    id:`${patternSpecId}-${ordinal}`,sourceId:G4B_U08_SOURCE_ID,patternSpecId,kind:"g4bU08FractionDecimalConversionSlice020",
    operation:"fraction_decimal_conversion",operationFamilyId:"fraction_decimal_conversion",questionMode:"numeric",
    numerator,denominator,decimal,promptText,questionText:promptText,blankedDisplayText:promptText,
    answerText:askDecimal?decimal:String(numerator),displayText:`${promptText} ${askDecimal?decimal:numerator}`,
    finalAnswer:Object.freeze({kind:askDecimal?"decimal":"integer",canonicalText:askDecimal?decimal:String(numerator),exact:true,numerator,denominator,reducedNumerator:numerator/gcd(numerator,denominator),reducedDenominator:denominator/gcd(numerator,denominator)}),
    metadata:Object.freeze({patternId:patternSpecId,sourceId:G4B_U08_SOURCE_ID,knowledgePointId:G4B_U08_FRACTION_DECIMAL_KP_ID,patternGroupId:G4B_U08_FRACTION_DECIMAL_GROUP_ID,operationFamilyId:"fraction_decimal_conversion",requestedUnknownRole:askDecimal?"decimal":"numerator",requiredCapabilityIds:P03F20_REQUIRED_CAPABILITY_IDS,applicationClassification:"APPLICATION_NOT_APPLICABLE",contextAuthority:null,productAdmissionTask:"P03F_W3DirectProductVerticalSlice020Implementation",generatorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",validatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1"}),
  });
}
export function canGenerateG4BU08Slice020Questions(plan={}){ return plan.sourceId===G4B_U08_SOURCE_ID&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.length>0&&plan.patternSpecIds.every(id=>G4B_U08_FRACTION_DECIMAL_SPEC_IDS.includes(id)); }
export function validateG4BU08Slice020Question(q={}){
  const errors=[]; const add=(code,path)=>errors.push({code,severity:"error",path,message:code});
  if(!G4B_U08_FRACTION_DECIMAL_SPEC_IDS.includes(q.patternSpecId)) add("p03f20_pattern_not_admitted","patternSpecId");
  if(q.sourceId!==G4B_U08_SOURCE_ID||q.metadata?.sourceId!==G4B_U08_SOURCE_ID) add("p03f20_source_mismatch","sourceId");
  if(q.metadata?.knowledgePointId!==G4B_U08_FRACTION_DECIMAL_KP_ID||q.metadata?.patternGroupId!==G4B_U08_FRACTION_DECIMAL_GROUP_ID) add("p03f20_kp_group_mismatch","metadata");
  if(!CASES.some(([n,d])=>n===q.numerator&&d===q.denominator)) add("p03f20_operand_out_of_scope","numerator");
  const expectedDecimal=Number.isInteger(q.numerator)&&Number.isInteger(q.denominator)&&100%q.denominator===0?decimalText(q.numerator,q.denominator):null;
  if(q.decimal!==expectedDecimal) add("p03f20_exact_value_invalid","decimal");
  const answer=q.patternSpecId===DECIMAL_SPEC?expectedDecimal:String(q.numerator);
  if(q.answerText!==answer||q.finalAnswer?.canonicalText!==answer||q.finalAnswer?.exact!==true) add("p03f20_final_answer_invalid","finalAnswer");
  if(JSON.stringify(q.metadata?.requiredCapabilityIds)!==JSON.stringify(P03F20_REQUIRED_CAPABILITY_IDS)) add("p03f20_capability_set_invalid","metadata.requiredCapabilityIds");
  if(q.metadata?.contextAuthority!==null||q.questionMode!=="numeric") add("p03f20_application_scope_violation","metadata.contextAuthority");
  return {ok:errors.length===0,errors,warnings:[]};
}
export function generateG4BU08Slice020Questions(options={}){
  const plan=options.plan??options; const count=Number(options.questionCount??plan.questionCount??8);
  if(!canGenerateG4BU08Slice020Questions(plan)||!Number.isInteger(count)||count<1||count>24) return {ok:false,plan,questions:[],allocation:[],errors:[{code:"p03f20_plan_not_supported",severity:"error",path:"plan",message:"P03F20 requires its exact numeric conversion specs and 1-24 questions."}],warnings:[]};
  const ids=[...new Set(plan.patternSpecIds)]; const offset=hash(options.generationSeed??plan.generationSeed??"p03f20")%CASES.length;
  const questions=Array.from({length:count},(_,i)=>build(ids[i%ids.length],CASES[(offset+i)%CASES.length],i+1));
  const errors=questions.flatMap(q=>validateG4BU08Slice020Question(q).errors);
  return {ok:errors.length===0,plan,questions,allocation:ids.map(id=>({patternSpecId:id,questionCount:questions.filter(q=>q.patternSpecId===id).length})),errors,warnings:[]};
}
