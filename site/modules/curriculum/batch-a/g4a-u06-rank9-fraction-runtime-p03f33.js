import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f33.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f33-extension.js";
import {
  G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U06_P03F33_SOURCE_ID,
  P03F33_REQUIRED_CAPABILITY_IDS,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const ALL_IDS=new Set(G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS);
const COMPARE_SPEC="ps_g4a_u06_fraction_compare_order_comparison_numeric";
const COORDINATE_SPEC="ps_g4a_u06_fraction_number_line_coordinate_numeric";
const DISTANCE_SPEC="ps_g4a_u06_fraction_number_line_distance_numeric";
const ADD_SUB_SPEC="ps_g4a_u06_mixed_fraction_add_sub_result_numeric";
const DENOMINATORS=Object.freeze([2,3,4,5,6,8,10,12]);
const COMPARE_FRACTION_PARTS = Object.freeze([
  Object.freeze([1, 2]),
  Object.freeze([1, 3]),
  Object.freeze([3, 4]),
  Object.freeze([2, 5]),
  Object.freeze([5, 6]),
  Object.freeze([3, 7]),
  Object.freeze([5, 8]),
  Object.freeze([4, 9]),
]);
const seedOffset=(seed,size)=>[...String(seed??"p03f33")].reduce((sum,char)=>(sum+char.charCodeAt(0))%Math.max(1,size),0);
const gcd=(a,b)=>{let x=Math.abs(a),y=Math.abs(b);while(y)[x,y]=[y,x%y];return x||1;};
function normalize(numerator,denominator){
  if(!Number.isSafeInteger(numerator)||!Number.isSafeInteger(denominator)||denominator===0) throw new Error("P03F33_INVALID_RATIONAL");
  const sign=denominator<0?-1:1; const n=numerator*sign; const d=Math.abs(denominator); const g=gcd(n,d);
  return Object.freeze({numerator:n/g,denominator:d/g});
}
function fractionText(value){ return value.denominator===1?String(value.numerator):`${value.numerator}/${value.denominator}`; }
function mixedText(value){
  const normalized=normalize(value.numerator,value.denominator);
  if(normalized.numerator<normalized.denominator) return fractionText(normalized);
  const whole=Math.floor(normalized.numerator/normalized.denominator); const remainder=normalized.numerator%normalized.denominator;
  return remainder===0?String(whole):`${whole} ${remainder}/${normalized.denominator}`;
}
function mixedTextWithDenominator(numerator,denominator){
  if(!Number.isSafeInteger(numerator)||!Number.isSafeInteger(denominator)||numerator<0||denominator<=0) throw new Error("P03F33_INVALID_MIXED_OPERAND");
  const whole=Math.floor(numerator/denominator); const remainder=numerator%denominator;
  if(whole===0) return remainder===0?"0":`${remainder}/${denominator}`;
  return remainder===0?String(whole):`${whole} ${remainder}/${denominator}`;
}
const compare=(ln,ld,rn,rd)=>ln*rd<rn*ld?"<":ln*rd>rn*ld?">":"=";
const issue=(code,path)=>({code,severity:"error",path,message:code});
function metadata(definition){ return Object.freeze({
  patternId:definition.patternSpecId,sourceId:G4A_U06_P03F33_SOURCE_ID,
  patternTags:Object.freeze(["full_product_w3_slice033",definition.patternSpecId]),
  skillTags:definition.skillTags,difficultyTags:definition.difficultyTags,
  curriculumNodeIds:Object.freeze([G4A_U06_P03F33_SOURCE_ID]),canonicalSkillIds:definition.canonicalSkillIds,
  knowledgePointId:definition.knowledgePointId,sourceCanonicalKnowledgePointId:definition.sourceCanonicalKnowledgePointId,
  patternGroupId:definition.patternGroupId,operationFamilyId:definition.operationFamilyId,requestedUnknownRole:definition.requestedUnknownRole,
  requiredCapabilityIds:P03F33_REQUIRED_CAPABILITY_IDS,applicationClassification:definition.applicationClassification,
  productAdmissionTask:"P03F_W3DirectProductVerticalSlice033Implementation",
  generatorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",validatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",globalContextAuthorityPath:null,
}); }
function compareFixture(ordinal, seed) {
  const seedKey = String(seed ?? "p03f33");

  /*
   * 240 個唯一組合：
   *
   * 10 個整數層
   * × 8 個不同分數部分
   * × 3 種比較關係
   * = 240
   */

  const relationIndex =
    (
      ordinal
      + seedOffset(`${seedKey}:relation`, 3)
    ) % 3;

  const fractionPartIndex =
    (
      Math.floor(ordinal / 3)
      + seedOffset(
        `${seedKey}:fraction-part`,
        COMPARE_FRACTION_PARTS.length,
      )
    ) % COMPARE_FRACTION_PARTS.length;

  const uniquenessBand = Math.floor(
    ordinal
    / (COMPARE_FRACTION_PARTS.length * 3),
  );

  const whole =
    1 + (
      (
        uniquenessBand
        + seedOffset(`${seedKey}:whole`, 10)
      ) % 10
    );

  const [
    fractionNumerator,
    denominator,
  ] = COMPARE_FRACTION_PARTS[fractionPartIndex];

  const baseNumerator =
    whole * denominator + fractionNumerator;

  // 小於
  if (relationIndex === 0) {
    return {
      leftNumerator: baseNumerator,
      leftDenominator: denominator,
      rightNumerator: baseNumerator + 1,
      rightDenominator: denominator,
    };
  }

  // 大於
  if (relationIndex === 1) {
    return {
      leftNumerator: baseNumerator + 1,
      leftDenominator: denominator,
      rightNumerator: baseNumerator,
      rightDenominator: denominator,
    };
  }

  // 等於：右邊使用二倍分子及二倍分母。
  return {
    leftNumerator: baseNumerator,
    leftDenominator: denominator,
    rightNumerator: baseNumerator * 2,
    rightDenominator: denominator * 2,
  };
}
function buildCompare(definition,ordinal,seed){
  const f=compareFixture(ordinal,seed); const answerText=compare(f.leftNumerator,f.leftDenominator,f.rightNumerator,f.rightDenominator);
  const leftText=mixedText({numerator:f.leftNumerator,denominator:f.leftDenominator}); const rightText=mixedText({numerator:f.rightNumerator,denominator:f.rightDenominator});
  const promptText=`${leftText} ○ ${rightText}，請填入 <、= 或 >。`;
  return Object.freeze({id:`${definition.patternSpecId}-${ordinal+1}`,sourceId:G4A_U06_P03F33_SOURCE_ID,patternSpecId:definition.patternSpecId,kind:definition.kind,operation:"fraction_compare",operationFamilyId:"fraction_compare",questionMode:"numeric",mode:"NUMERIC",promptText,questionText:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,finalAnswer:answerText,...f,comparison:answerText,metadata:metadata(definition),globalContextProduction:null});
}
function buildCoordinate(definition,ordinal,seed){
  const offset=seedOffset(seed,83); const denominator=DENOMINATORS[(ordinal+offset)%DENOMINATORS.length]; const stepCount=denominator+1+((ordinal*3+offset)%denominator);
  const coordinate=normalize(stepCount,denominator); const answerText=mixedText(coordinate); const promptText=`數線每一小格代表 1/${denominator}，從 0 向右第 ${stepCount} 格的位置是多少？`;
  return Object.freeze({id:`${definition.patternSpecId}-${ordinal+1}`,sourceId:G4A_U06_P03F33_SOURCE_ID,patternSpecId:definition.patternSpecId,kind:definition.kind,operation:"number_line",operationFamilyId:"number_line",numberLineTask:"coordinate",questionMode:"numeric",mode:"NUMERIC",promptText,questionText:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,finalAnswer:answerText,originNumerator:0,originDenominator:1,unitStepNumerator:1,unitStepDenominator:denominator,stepCount,coordinateNumerator:coordinate.numerator,coordinateDenominator:coordinate.denominator,metadata:metadata(definition),globalContextProduction:null});
}
function buildDistance(definition,ordinal,seed){
  const offset=seedOffset(seed,71); const denominator=DENOMINATORS[(ordinal*3+offset)%DENOMINATORS.length]; const leftStep=denominator-1+((ordinal+offset)%3); const rightStep=leftStep+1+((ordinal*2+offset)%4);
  const left=normalize(leftStep,denominator); const right=normalize(rightStep,denominator); const distance=normalize(rightStep-leftStep,denominator); const answerText=mixedText(distance);
  const promptText=`數線上 A=${mixedText(left)}、B=${mixedText(right)}，A 到 B 的距離是多少？`;
  return Object.freeze({id:`${definition.patternSpecId}-${ordinal+1}`,sourceId:G4A_U06_P03F33_SOURCE_ID,patternSpecId:definition.patternSpecId,kind:definition.kind,operation:"number_line",operationFamilyId:"number_line",numberLineTask:"distance",questionMode:"numeric",mode:"NUMERIC",promptText,questionText:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,finalAnswer:answerText,leftCoordinateNumerator:left.numerator,leftCoordinateDenominator:left.denominator,rightCoordinateNumerator:right.numerator,rightCoordinateDenominator:right.denominator,distanceNumerator:distance.numerator,distanceDenominator:distance.denominator,metadata:metadata(definition),globalContextProduction:null});
}
function buildAddSub(definition,ordinal,seed){
  const offset=seedOffset(seed,61); const denominator=DENOMINATORS[(Math.floor(ordinal/2)+offset)%DENOMINATORS.length]; const operation=ordinal%2===0?"add":"sub";
  const uniquenessBand=Math.floor(ordinal/(DENOMINATORS.length*2)); const remainderSpan=Math.max(1,denominator-1);
  const leftRemainder=1+((ordinal*5+offset)%remainderSpan); const rightRemainder=1+((ordinal*7+offset+2)%remainderSpan);
  let leftNumerator=(uniquenessBand+2)*denominator+leftRemainder; const rightNumerator=(uniquenessBand+1)*denominator+rightRemainder;
  if(operation==="sub"&&leftNumerator<=rightNumerator) leftNumerator+=denominator;
  const raw=operation==="add"?leftNumerator+rightNumerator:leftNumerator-rightNumerator; const result=normalize(raw,denominator); const answerText=mixedText(result); const symbol=operation==="add"?"+":"−";
  const promptText=`${mixedTextWithDenominator(leftNumerator,denominator)} ${symbol} ${mixedTextWithDenominator(rightNumerator,denominator)} = ?`;
  return Object.freeze({id:`${definition.patternSpecId}-${ordinal+1}`,sourceId:G4A_U06_P03F33_SOURCE_ID,patternSpecId:definition.patternSpecId,kind:definition.kind,operation:"fraction_add_sub",operationFamilyId:"fraction_add_sub",arithmeticOperation:operation,questionMode:"numeric",mode:"NUMERIC",promptText,questionText:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,finalAnswer:answerText,leftNumerator,leftDenominator:denominator,rightNumerator,rightDenominator:denominator,resultNumerator:result.numerator,resultDenominator:result.denominator,metadata:metadata(definition),globalContextProduction:null});
}
function buildQuestion(patternSpecId,ordinal,seed){ const definition=getBatchABrowserPatternDefinition(patternSpecId); if(patternSpecId===COMPARE_SPEC)return buildCompare(definition,ordinal,seed); if(patternSpecId===COORDINATE_SPEC)return buildCoordinate(definition,ordinal,seed); if(patternSpecId===DISTANCE_SPEC)return buildDistance(definition,ordinal,seed); if(patternSpecId===ADD_SUB_SPEC)return buildAddSub(definition,ordinal,seed); throw new Error("P03F33_PATTERN_NOT_SUPPORTED"); }
export function canGenerateG4AU06P03F33Questions(plan={}){ return plan.sourceId===G4A_U06_P03F33_SOURCE_ID&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.length>0&&plan.patternSpecIds.every((id)=>ALL_IDS.has(id)); }
export function validateG4AU06P03F33Question(question={}){
  const errors=[]; const patternSpecId=question.patternSpecId??question.metadata?.patternId; const definition=getBatchABrowserPatternDefinition(patternSpecId);
  if(!ALL_IDS.has(patternSpecId)||!definition) errors.push(issue("p03f33_pattern_invalid","patternSpecId"));
  if(question.sourceId!==G4A_U06_P03F33_SOURCE_ID||question.metadata?.sourceId!==G4A_U06_P03F33_SOURCE_ID) errors.push(issue("p03f33_source_mismatch","sourceId"));
  if(question.questionMode!=="numeric"||question.globalContextProduction!=null||question.metadata?.globalContextAuthorityPath!=null) errors.push(issue("p03f33_application_scope_leak","questionMode"));
  if(JSON.stringify(question.metadata?.requiredCapabilityIds)!==JSON.stringify(P03F33_REQUIRED_CAPABILITY_IDS)) errors.push(issue("p03f33_capability_set_invalid","metadata.requiredCapabilityIds"));
  if(question.metadata?.knowledgePointId!==definition?.knowledgePointId||question.metadata?.sourceCanonicalKnowledgePointId!==definition?.sourceCanonicalKnowledgePointId) errors.push(issue("p03f33_lineage_mismatch","metadata"));
  if(patternSpecId===COMPARE_SPEC){ const expected=compare(question.leftNumerator,question.leftDenominator,question.rightNumerator,question.rightDenominator); if(question.leftDenominator<=0||question.rightDenominator<=0||question.answerText!==expected||question.finalAnswer!==expected||question.comparison!==expected) errors.push(issue("p03f33_compare_answer_invalid","answerText")); }
  else if(patternSpecId===COORDINATE_SPEC){ const expected=normalize(question.stepCount*question.unitStepNumerator,question.unitStepDenominator); if(question.unitStepDenominator<=0||question.stepCount<0||question.coordinateNumerator!==expected.numerator||question.coordinateDenominator!==expected.denominator||question.answerText!==mixedText(expected)) errors.push(issue("p03f33_number_line_coordinate_invalid","answerText")); }
  else if(patternSpecId===DISTANCE_SPEC){ const rawNumerator=Math.abs(question.rightCoordinateNumerator*question.leftCoordinateDenominator-question.leftCoordinateNumerator*question.rightCoordinateDenominator); const rawDenominator=question.leftCoordinateDenominator*question.rightCoordinateDenominator; const expected=normalize(rawNumerator,rawDenominator); if(question.leftCoordinateDenominator<=0||question.rightCoordinateDenominator<=0||question.distanceNumerator!==expected.numerator||question.distanceDenominator!==expected.denominator||question.answerText!==mixedText(expected)) errors.push(issue("p03f33_number_line_distance_invalid","answerText")); }
  else if(patternSpecId===ADD_SUB_SPEC){ if(question.leftDenominator<=0||question.leftDenominator!==question.rightDenominator) errors.push(issue("p03f33_same_denominator_required","fractionOperands")); const raw=question.arithmeticOperation==="add"?question.leftNumerator+question.rightNumerator:question.leftNumerator-question.rightNumerator; if(!["add","sub"].includes(question.arithmeticOperation)||raw<0) errors.push(issue("p03f33_add_sub_operation_invalid","arithmeticOperation")); else { const expected=normalize(raw,question.leftDenominator); if(question.resultNumerator!==expected.numerator||question.resultDenominator!==expected.denominator||question.answerText!==mixedText(expected)||question.finalAnswer!==question.answerText) errors.push(issue("p03f33_add_sub_answer_invalid","answerText")); } }
  return {ok:errors.length===0,errors,warnings:[]};
}
export function generateG4AU06P03F33Questions(options={}){
  const plan=options.plan??buildBatchABrowserPlan(options); if(!canGenerateG4AU06P03F33Questions(plan)) return {ok:false,errors:[issue("p03f33_plan_not_supported","patternSpecIds")],warnings:[],questions:[],plan};
  const count=Number(options.questionCount??plan.questionCount??24); if(!Number.isInteger(count)||count<1||count>240) return {ok:false,errors:[issue("p03f33_question_count_invalid","questionCount")],warnings:[],questions:[],plan};
  const occurrences=new Map(plan.patternSpecIds.map((id)=>[id,0])); const seed=options.generationSeed??plan.generationSeed;
  const questions=Array.from({length:count},(_,index)=>{const patternSpecId=plan.patternSpecIds[index%plan.patternSpecIds.length]; const ordinal=occurrences.get(patternSpecId)??0; occurrences.set(patternSpecId,ordinal+1); return buildQuestion(patternSpecId,ordinal,seed);});
  const errors=questions.flatMap((question,index)=>validateG4AU06P03F33Question(question).errors.map((error)=>({...error,path:`questions[${index}].${error.path}`})));
  if(new Set(questions.map((question)=>question.blankedDisplayText)).size!==questions.length) errors.push(issue("p03f33_duplicate_prompt_detected","questions"));
  const allocation=plan.patternSpecIds.map((patternSpecId)=>Object.freeze({patternSpecId,questionCount:questions.filter((q)=>q.patternSpecId===patternSpecId).length}));
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([]),questions:Object.freeze(questions),allocation:Object.freeze(allocation),plan});
}
