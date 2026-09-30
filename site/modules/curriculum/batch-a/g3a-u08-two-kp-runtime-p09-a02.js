import {
  G3A_U08_P09_A02_SOURCE_ID as SRC,
  G3A_U08_P09_A02_TARGET_KP_IDS as TARGETS,
  G3A_U08_P09_A02_WHOLE_KP_ID as WHOLE,
  G3A_U08_P09_A02_UNLIKE_KP_ID as UNLIKE,
  G3A_U08_P09_A02_WHOLE_COMPLETE_SPEC_ID as WHOLE_COMPLETE,
  G3A_U08_P09_A02_WHOLE_RECOGNIZE_SPEC_ID as WHOLE_RECOGNIZE,
  G3A_U08_P09_A02_UNLIKE_METHOD_SPEC_ID as UNLIKE_METHOD,
  G3A_U08_P09_A02_UNLIKE_REASON_SPEC_ID as UNLIKE_REASON,
  getG3AU08P09A02PatternSpec
} from "../registry/g3a-u08-two-kp-selector-projection-p09-a02.js";

export const P09_A02_MAX_QUESTION_COUNT=120;
const INVALID_METHOD_ANSWER="不可以，只比較分子不足以判斷異分母分數大小。";
const gcd=(a,b)=>{let x=Math.abs(a),y=Math.abs(b);while(y)[x,y]=[y,x%y];return x||1;};
function hashSeed(value){let h=2166136261;for(const c of String(value??"p09-a02")){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h||1;}
function coprimeStep(size){for(const n of [131,127,113,109,103,101,97,89,83,79,73,71,67,61])if(gcd(n,size)===1)return n;return 1;}
function pick(fixtures,index,seed,channel){const offset=hashSeed(seed+":"+channel)%fixtures.length;return fixtures[(offset+index*coprimeStep(fixtures.length))%fixtures.length];}
function allocate(specIds,count){const base=Math.floor(count/specIds.length),rem=count%specIds.length;return specIds.map((patternSpecId,i)=>({patternSpecId,questionCount:base+(i<rem?1:0)})).filter(x=>x.questionCount>0);}
const WHOLE_DENOMINATORS=Object.freeze(Array.from({length:19},(_,i)=>i+2));
const wholeFixturesForSpec=specId=>Object.freeze(WHOLE_DENOMINATORS.flatMap(denominator=>Array.from({length:4},(_,surface)=>Object.freeze({denominator,surface}))));

function fractionPairs(){
  const fractions=[];
  for(let d=2;d<=12;d+=1)for(let n=1;n<d;n+=1)fractions.push({n,d});
  const rows=[];
  for(const left of fractions)for(const right of fractions)if(left.d!==right.d)rows.push(Object.freeze({leftNumerator:left.n,leftDenominator:left.d,rightNumerator:right.n,rightDenominator:right.d}));
  return rows;
}
const unlikeFixtures=Object.freeze(fractionPairs());
function metadata(kp,groupId,specId){return Object.freeze({
  patternId:specId,sourceId:SRC,knowledgePointId:kp,patternGroupId:groupId,
  curriculumNodeIds:Object.freeze([SRC]),canonicalSkillIds:Object.freeze([kp]),
  patternTags:Object.freeze(["p09_ui_a02",specId]),skillTags:Object.freeze(["fraction_concept_boundary"]),
  difficultyTags:Object.freeze(["grade3","source_backed"]),questionMode:"numeric",
  applicationClassification:"APPLICATION_NOT_APPLICABLE",productAdmissionTask:"P09_UI_A02_G3AU08_WholeAsFraction_And_UnlikeDenominatorComparisonLimit_TwoKPProductAdmission",
  generatorAdapterId:"P09_A02_G3A_U08_TWO_KP_GENERATOR",validatorAdapterId:"P09_A02_G3A_U08_TWO_KP_VALIDATOR"
});}
function wholePrompt(f,specId){
  const d=f.denominator;
  if(specId===WHOLE_RECOGNIZE){
    switch(f.surface){
      case 0:return {prompt:`${d}/${d} = □，□ 應填多少？`,answer:"1",role:"WHOLE_VALUE"};
      case 1:return {prompt:`分數 ${d}/${d} 代表幾個完整的整體？`,answer:"1",role:"WHOLE_VALUE"};
      case 2:return {prompt:`${d}/${d} 的值是多少？`,answer:"1",role:"WHOLE_VALUE"};
      default:return {prompt:`把 ${d}/${d} 寫成整數，答案是多少？`,answer:"1",role:"WHOLE_VALUE"};
    }
  }
  switch(f.surface){
    case 0:return {prompt:`1 = □/${d}，□ 應填多少？`,answer:String(d),role:"MATCHING_NUMERATOR"};
    case 1:return {prompt:`把 1 寫成分母為 ${d} 的分數：1 = □/${d}。分子是多少？`,answer:String(d),role:"MATCHING_NUMERATOR"};
    case 2:return {prompt:`分母是 ${d}，要寫成一個完整的 1，分子應是多少？`,answer:String(d),role:"MATCHING_NUMERATOR"};
    default:return {prompt:`請補成等於 1 的分數：${d}/□ = 1。□ 是多少？`,answer:String(d),role:"MATCHING_DENOMINATOR"};
  }
}
function buildWhole(specId,ordinal,seed){
  const fixture=pick(wholeFixturesForSpec(specId),ordinal,seed,specId);
  const surface=wholePrompt(fixture,specId);
  const groupId="pg_g3a_u08_whole_as_fraction_numeric";
  const question=Object.freeze({
    id:`${specId}-${ordinal+1}`,sourceId:SRC,knowledgePointId:WHOLE,patternSpecId:specId,patternGroupId:groupId,
    kind:"g3aU08WholeAsFraction",operation:"whole_as_fraction",operationFamilyId:"whole_as_fraction",
    questionMode:"numeric",mode:"NUMERIC",promptText:surface.prompt,questionText:surface.prompt,blankedDisplayText:surface.prompt,
    displayText:`${surface.prompt} ${surface.answer}`,answerText:surface.answer,finalAnswer:Number(surface.answer),
    denominator:fixture.denominator,numerator:fixture.denominator,answerRole:surface.role,wholeValue:1,
    metadata:metadata(WHOLE,groupId,specId)
  });
  return question;
}
function unlikePrompt(f,specId,ordinal){
  const a=`${f.leftNumerator}/${f.leftDenominator}`,b=`${f.rightNumerator}/${f.rightDenominator}`;
  const v=ordinal%4;
  if(specId===UNLIKE_REASON){
    const prompts=[
      `比較 ${a} 和 ${b} 時，為什麼不能只比較分子？`,
      `${a} 和 ${b} 的分母不同。只看分子大小能直接判斷兩個分數大小嗎？請說明。`,
      `有人比較 ${a} 和 ${b} 時只比較分子。這個方法少考慮了什麼？`,
      `面對 ${a} 和 ${b} 這兩個異分母分數，只比較分子是否足夠？為什麼？`
    ];
    return prompts[v];
  }
  const prompts=[
    `比較 ${a} 和 ${b} 時，只比較分子就直接判斷大小，這個方法可以嗎？`,
    `有人說：「${a} 和 ${b} 只要看分子大小就能比較。」這個方法正確嗎？`,
    `${a} 和 ${b} 的分母不同，可以只比較分子就決定大小嗎？`,
    `要比較 ${a} 和 ${b}，若只看分子，能保證判斷正確嗎？`
  ];
  return prompts[v];
}
function buildUnlike(specId,ordinal,seed){
  const f=pick(unlikeFixtures,ordinal,seed,specId);
  const prompt=unlikePrompt(f,specId,ordinal);
  const groupId="pg_g3a_u08_unlike_denominator_comparison_limit_numeric";
  return Object.freeze({
    id:`${specId}-${ordinal+1}`,sourceId:SRC,knowledgePointId:UNLIKE,patternSpecId:specId,patternGroupId:groupId,
    kind:"g3aU08UnlikeDenominatorComparisonLimit",operation:"comparison_method_validity",operationFamilyId:"fraction_comparison_boundary",
    questionMode:"numeric",mode:"NUMERIC",promptText:prompt,questionText:prompt,blankedDisplayText:prompt,
    displayText:`${prompt} ${INVALID_METHOD_ANSWER}`,answerText:INVALID_METHOD_ANSWER,finalAnswer:"METHOD_INVALID",
    leftNumerator:f.leftNumerator,leftDenominator:f.leftDenominator,rightNumerator:f.rightNumerator,rightDenominator:f.rightDenominator,
    proposedMethod:"COMPARE_NUMERATORS_ONLY",methodValid:false,actualFractionRelationRequested:false,
    metadata:metadata(UNLIKE,groupId,specId)
  });
}
export function validateG3AU08P09A02Question(q={}){
  const errors=[],add=(code,path)=>errors.push({code,severity:"error",path,message:code});
  const spec=getG3AU08P09A02PatternSpec(q.patternSpecId??q.metadata?.patternId);
  if(!spec)add("p09_a02_pattern_invalid","patternSpecId");
  if(q.sourceId!==SRC||q.metadata?.sourceId!==SRC)add("p09_a02_source_mismatch","sourceId");
  if(!TARGETS.includes(q.knowledgePointId)||q.metadata?.knowledgePointId!==q.knowledgePointId)add("p09_a02_kp_mismatch","knowledgePointId");
  if(q.questionMode!=="numeric"||q.metadata?.applicationClassification!=="APPLICATION_NOT_APPLICABLE")add("p09_a02_scope_invalid","questionMode");
  if(q.knowledgePointId===WHOLE){
    if(!Number.isSafeInteger(q.denominator)||q.denominator<2||q.denominator>20)add("p09_a02_whole_denominator_invalid","denominator");
    if(q.numerator!==q.denominator||q.wholeValue!==1)add("p09_a02_whole_invariant_invalid","numerator");
    const expected=q.answerRole==="WHOLE_VALUE"?1:q.denominator;
    if(q.finalAnswer!==expected||q.answerText!==String(expected))add("p09_a02_whole_answer_invalid","answerText");
  }else if(q.knowledgePointId===UNLIKE){
    if(![q.leftNumerator,q.leftDenominator,q.rightNumerator,q.rightDenominator].every(Number.isSafeInteger))add("p09_a02_unlike_fraction_invalid","fractions");
    if(q.leftDenominator===q.rightDenominator||q.leftDenominator<2||q.rightDenominator<2)add("p09_a02_unlike_denominator_must_differ","denominators");
    if(q.leftNumerator<=0||q.leftNumerator>=q.leftDenominator||q.rightNumerator<=0||q.rightNumerator>=q.rightDenominator)add("p09_a02_unlike_requires_proper_fraction","fractions");
    if(q.proposedMethod!=="COMPARE_NUMERATORS_ONLY"||q.methodValid!==false||q.actualFractionRelationRequested!==false)add("p09_a02_unlike_method_contract_invalid","proposedMethod");
    if(q.answerText!==INVALID_METHOD_ANSWER||q.finalAnswer!=="METHOD_INVALID")add("p09_a02_unlike_answer_invalid","answerText");
    if(/[<>＝=]/.test(String(q.answerText)))add("p09_a02_actual_relation_leak","answerText");
  }
  if(/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(q.blankedDisplayText??"")))add("p09_a02_forbidden_surface","blankedDisplayText");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([])});
}
export function generateG3AU08P09A02Questions(plan={}){
  const kp=plan.selectedKnowledgePointIds?.[0];
  if(plan.sourceId!==SRC||plan.selectionMode!=="singleKnowledgePoint"||!TARGETS.includes(kp))return Object.freeze({ok:false,errors:Object.freeze([{code:"p09_a02_plan_not_supported",severity:"error",path:"plan",message:"p09_a02_plan_not_supported"}]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});
  const count=Number(plan.questionCount);
  if(!Number.isInteger(count)||count<1||count>P09_A02_MAX_QUESTION_COUNT)return Object.freeze({ok:false,errors:Object.freeze([{code:"p09_a02_question_count_invalid",severity:"error",path:"questionCount",message:"p09_a02_question_count_invalid"}]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});
  const specIds=kp===WHOLE?[WHOLE_COMPLETE,WHOLE_RECOGNIZE]:[UNLIKE_METHOD,UNLIKE_REASON];
  const requested=(plan.patternSpecIds??[]).filter(id=>specIds.includes(id));
  const active=requested.length?requested:specIds;
  const allocation=allocate(active,count),questions=[];let ordinal=0;
  for(const row of allocation)for(let i=0;i<row.questionCount;i+=1){questions.push(kp===WHOLE?buildWhole(row.patternSpecId,ordinal,plan.generationSeed):buildUnlike(row.patternSpecId,ordinal,plan.generationSeed));ordinal+=1;}
  const prompts=questions.map(q=>q.blankedDisplayText),errors=[];
  if(new Set(prompts).size!==prompts.length)errors.push({code:"p09_a02_duplicate_prompt",severity:"error",path:"questions",message:"p09_a02_duplicate_prompt"});
  questions.forEach((q,i)=>errors.push(...validateG3AU08P09A02Question(q).errors.map(e=>({...e,path:`questions[${i}].${e.path}`}))));
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([]),questions:Object.freeze(questions),allocation:Object.freeze(allocation.map(Object.freeze)),plan});
}
export {INVALID_METHOD_ANSWER as G3A_U08_P09_A02_INVALID_METHOD_ANSWER};
