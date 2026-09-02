import {G6A_U02_P04F36_SOURCE_ID,G6A_U02_P04F36_KP_ID,G6A_U02_P04F36_GROUP_ID,G6A_U02_P04F36_SPEC_ID,G6A_U02_P04F36_FUTURE_KP_IDS} from "../registry/g6a-u02-fraction-divided-by-fraction-selector-projection-p04f36.js";

export const P04F36_SHARED_RUNTIME_DECISION=Object.freeze({scope:"SHARED_RUNTIME_BOUNDED",q033RuntimeTouched:false,q035RuntimeTouched:false,directPrivateHelperImportUsed:false,contractReuse:true,contract:"INTEGER_NUMERATOR_DENOMINATOR_EXACT_RATIONAL_WITH_GCD_REDUCTION",inlineFractionRendererReused:true});
const issue=(code,path)=>Object.freeze({code,severity:"error",path,message:code});
const gcd=(a,b)=>{let x=Math.abs(Number(a)),y=Math.abs(Number(b));while(y)[x,y]=[y,x%y];return x||1;};
const rat=(numerator,denominator=1)=>{let n=Number(numerator),d=Number(denominator);if(!Number.isInteger(n)||!Number.isInteger(d)||d===0)throw new RangeError("p04f36_rational_invalid");if(d<0){n=-n;d=-d;}const g=gcd(n,d);return Object.freeze({numerator:n/g,denominator:d/g});};
const mul=(a,b)=>rat(a.numerator*b.numerator,a.denominator*b.denominator);
const format=value=>value.denominator===1?String(value.numerator):`${value.numerator}/${value.denominator}`;
function hashSeed(value){let hash=2166136261;for(const ch of String(value??"p04f36")){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
function mix32(value){let x=value>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
function shuffle(rows,seed){const result=[...rows];let state=hashSeed(seed);for(let index=result.length-1;index>0;index-=1){state=mix32(state+index);const swapIndex=state%(index+1);[result[index],result[swapIndex]]=[result[swapIndex],result[index]];}return result;}
function reducedProperFractions(maxDenominator=18){const rows=[];for(let denominator=2;denominator<=maxDenominator;denominator+=1)for(let numerator=1;numerator<denominator;numerator+=1)if(gcd(numerator,denominator)===1)rows.push(Object.freeze({numerator,denominator}));return rows;}
function buildCases(){const fractions=reducedProperFractions(),rows=[];for(const dividend of fractions)for(const divisor of fractions){const quotient=mul(rat(dividend.numerator,dividend.denominator),rat(divisor.denominator,divisor.numerator));if(quotient.denominator===1)continue;rows.push(Object.freeze({dividendNumerator:dividend.numerator,dividendDenominator:dividend.denominator,divisorNumerator:divisor.numerator,divisorDenominator:divisor.denominator}));}return Object.freeze(rows);}
const CASES=buildCases();
export const P04F36_DISTINCT_CASE_CAPACITY=CASES.length;

function makeQuestion(row,index,seed){
  const dividend=rat(row.dividendNumerator,row.dividendDenominator),divisor=rat(row.divisorNumerator,row.divisorDenominator),reciprocal=rat(row.divisorDenominator,row.divisorNumerator),quotient=mul(dividend,reciprocal),prompt=`${dividend.numerator}/${dividend.denominator} ÷ ${divisor.numerator}/${divisor.denominator} =（　）`,answerText=format(quotient),id=`p04f36-${seed}-${index+1}-${dividend.numerator}-${dividend.denominator}-${divisor.numerator}-${divisor.denominator}`;
  return Object.freeze({id,generatedItemId:id,sourceId:G6A_U02_P04F36_SOURCE_ID,sourceNodeId:G6A_U02_P04F36_SOURCE_ID,knowledgePointId:G6A_U02_P04F36_KP_ID,patternGroupId:G6A_U02_P04F36_GROUP_ID,patternSpecId:G6A_U02_P04F36_SPEC_ID,questionMode:"numeric",mode:"numeric",representation:"fraction_divided_by_fraction_numeric",displayText:`${prompt} ${answerText}`,blankedDisplayText:prompt,promptText:`計算 ${dividend.numerator}/${dividend.denominator} ÷ ${divisor.numerator}/${divisor.denominator}。`,answerText,answer:answerText,finalAnswer:Object.freeze({canonicalText:answerText,numerator:quotient.numerator,denominator:quotient.denominator,exact:true}),metadata:Object.freeze({sourceId:G6A_U02_P04F36_SOURCE_ID,sourcePdfTitle:"meow911_6a02_source.pdf",sourceEvidencePages:Object.freeze([1,2]),knowledgePointId:G6A_U02_P04F36_KP_ID,patternGroupId:G6A_U02_P04F36_GROUP_ID,patternId:G6A_U02_P04F36_SPEC_ID,relationFamilyId:"FRACTION_DIVIDED_BY_FRACTION_QUOTIENT",knownRoleIds:Object.freeze(["DIVIDEND_FRACTION","DIVISOR_FRACTION"]),targetRoleId:"QUOTIENT_FRACTION",dividendNumerator:dividend.numerator,dividendDenominator:dividend.denominator,divisorNumerator:divisor.numerator,divisorDenominator:divisor.denominator,reciprocalNumerator:reciprocal.numerator,reciprocalDenominator:reciprocal.denominator,rawProductNumerator:dividend.numerator*divisor.denominator,rawProductDenominator:dividend.denominator*divisor.numerator,reducedQuotientNumerator:quotient.numerator,reducedQuotientDenominator:quotient.denominator,divisorFractionMustBeNonzero:true,divisionByFractionEqualsMultiplyByReciprocal:true,quotientTimesDivisorReconstructsDividend:true,exactRationalArithmetic:true,equivalentFractionReductionAllowed:true,roundingUsed:false,applicationRequired:false,structuredFractionDisplay:true,sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",q033RuntimeTouched:false,q034Touched:false,q035RuntimeTouched:false,q036Implemented:true,q037Touched:false})});
}

export function validateG6AU02P04F36Question(question={}){
  const errors=[],metadata=question.metadata??{};
  if(question.sourceId!==G6A_U02_P04F36_SOURCE_ID||metadata.sourceId!==G6A_U02_P04F36_SOURCE_ID)errors.push(issue("p04f36_source_invalid","sourceId"));
  if(question.knowledgePointId!==G6A_U02_P04F36_KP_ID||metadata.knowledgePointId!==G6A_U02_P04F36_KP_ID)errors.push(issue("p04f36_kp_invalid","knowledgePointId"));
  if(question.patternGroupId!==G6A_U02_P04F36_GROUP_ID||question.patternSpecId!==G6A_U02_P04F36_SPEC_ID||metadata.patternId!==G6A_U02_P04F36_SPEC_ID)errors.push(issue("p04f36_pattern_invalid","patternSpecId"));
  const dn=Number(metadata.dividendNumerator),dd=Number(metadata.dividendDenominator),sn=Number(metadata.divisorNumerator),sd=Number(metadata.divisorDenominator);
  if(!Number.isInteger(dn)||!Number.isInteger(dd)||!Number.isInteger(sn)||!Number.isInteger(sd)||dn<=0||dd<=dn||sn<=0||sd<=sn||gcd(dn,dd)!==1||gcd(sn,sd)!==1)errors.push(issue("p04f36_operands_invalid","metadata"));
  else{
    const dividend=rat(dn,dd),divisor=rat(sn,sd),reciprocal=rat(sd,sn),quotient=mul(dividend,reciprocal),reconstructed=mul(quotient,divisor),expected=format(quotient);
    if(metadata.reciprocalNumerator!==reciprocal.numerator||metadata.reciprocalDenominator!==reciprocal.denominator||metadata.rawProductNumerator!==dn*sd||metadata.rawProductDenominator!==dd*sn||metadata.reducedQuotientNumerator!==quotient.numerator||metadata.reducedQuotientDenominator!==quotient.denominator||question.answerText!==expected||question.answer!==expected||question.finalAnswer?.canonicalText!==expected||question.finalAnswer?.numerator!==quotient.numerator||question.finalAnswer?.denominator!==quotient.denominator||question.finalAnswer?.exact!==true||reconstructed.numerator!==dividend.numerator||reconstructed.denominator!==dividend.denominator)errors.push(issue("p04f36_exact_quotient_invalid","answerText"));
  }
  if(metadata.relationFamilyId!=="FRACTION_DIVIDED_BY_FRACTION_QUOTIENT"||metadata.knownRoleIds?.join("|")!=="DIVIDEND_FRACTION|DIVISOR_FRACTION"||metadata.targetRoleId!=="QUOTIENT_FRACTION"||metadata.divisorFractionMustBeNonzero!==true||metadata.divisionByFractionEqualsMultiplyByReciprocal!==true||metadata.quotientTimesDivisorReconstructsDividend!==true||metadata.exactRationalArithmetic!==true||metadata.equivalentFractionReductionAllowed!==true||metadata.roundingUsed!==false||metadata.applicationRequired!==false||metadata.structuredFractionDisplay!==true||metadata.sharedRuntimeScope!=="SHARED_RUNTIME_BOUNDED"||metadata.q033RuntimeTouched!==false||metadata.q034Touched!==false||metadata.q035RuntimeTouched!==false||metadata.q036Implemented!==true||metadata.q037Touched!==false)errors.push(issue("p04f36_semantic_boundary_invalid","metadata"));
  if(G6A_U02_P04F36_FUTURE_KP_IDS.includes(question.knowledgePointId))errors.push(issue("p04f36_future_kp_leak","knowledgePointId"));
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([])});
}

export function generateG6AU02P04F36Questions(options={}){
  const plan=options.plan??options,count=Number(options.questionCount??plan.questionCount??20),seed=String(options.generationSeed??plan.generationSeed??"p04f36-fraction-divided-by-fraction"),ids=Array.isArray(plan.patternSpecIds)?[...new Set(plan.patternSpecIds)]:[G6A_U02_P04F36_SPEC_ID],errors=[];
  if(plan.sourceId!==G6A_U02_P04F36_SOURCE_ID)errors.push(issue("p04f36_source_invalid","sourceId"));
  if(plan.selectionMode!=="singleKnowledgePoint")errors.push(issue("p04f36_selection_mode_invalid","selectionMode"));
  if(!Number.isInteger(count)||count<1||count>240||count>CASES.length)errors.push(issue("p04f36_question_count_invalid","questionCount"));
  if(ids.length!==1||ids[0]!==G6A_U02_P04F36_SPEC_ID)errors.push(issue("p04f36_pattern_spec_invalid","patternSpecIds"));
  if(errors.length)return Object.freeze({ok:false,errors:Object.freeze(errors),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),distinctCapacity:CASES.length});
  const questions=shuffle(CASES,seed).slice(0,count).map((row,index)=>makeQuestion(row,index,seed));
  questions.forEach((question,index)=>errors.push(...validateG6AU02P04F36Question(question).errors.map(error=>({...error,path:`questions[${index}].${error.path}`}))));
  if(new Set(questions.map(question=>question.blankedDisplayText)).size!==questions.length)errors.push(issue("p04f36_duplicate_question","questions"));
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([]),questions:Object.freeze(questions),allocation:Object.freeze([{patternSpecId:G6A_U02_P04F36_SPEC_ID,questionCount:questions.length}]),distinctCapacity:CASES.length});
}
