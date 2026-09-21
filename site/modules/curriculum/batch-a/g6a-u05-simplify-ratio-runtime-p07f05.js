import {G6A_U05_P07F05_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U05_P07F05_FORMAL_MAPPING as MAPPING,G6A_U05_P07F05_KP_ID as KP,G6A_U05_P07F05_PATTERN_GROUP as GROUP,G6A_U05_P07F05_PATTERN_SPECS as SPECS,G6A_U05_P07F05_SOURCE_ID as SRC,G6A_U05_P07F05_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u05-simplify-ratio-selector-projection-p07f05.js";
export const G6A_U05_P07F05_MAX_QUESTION_COUNT=240;
export const G6A_U05_P07F05_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a;};
const COPRIME_PAIRS=(()=>{
  const out=[];
  for(let a=2;a<=80&&out.length<240;a++)for(let b=2;b<=80&&out.length<240;b++)if(a!==b&&gcd(a,b)===1)out.push(Object.freeze([a,b]));
  if(out.length<240)throw new Error("P07F05_COPRIME_PAIR_POOL_TOO_SMALL");
  return Object.freeze(out);
})();
const REPEATED_FACTORS=Object.freeze([4,6,8,9,10,12,14,15,16,18,20,21]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function smallestPrimeDivisor(n){for(let d=2;d<=Math.sqrt(n);d++)if(n%d===0)return d;return n;}
function payload(spec,v){
  const u=mod(v,240),pair=COPRIME_PAIRS[u],outputA=pair[0],outputB=pair[1];
  const commonDivisor=spec.targetKind==="REPEATED_COMMON_FACTOR_REDUCTION"?REPEATED_FACTORS[u%REPEATED_FACTORS.length]:2+((u*7)%17);
  const inputA=outputA*commonDivisor,inputB=outputB*commonDivisor;
  const firstDivisor=spec.targetKind==="REPEATED_COMMON_FACTOR_REDUCTION"?smallestPrimeDivisor(commonDivisor):null;
  const intermediateA=firstDivisor?inputA/firstDivisor:null,intermediateB=firstDivisor?inputB/firstDivisor:null,remainingDivisor=firstDivisor?commonDivisor/firstDivisor:null;
  let promptText;
  if(spec.targetKind==="DIRECT_GCD_REDUCTION")promptText="把 "+inputA+":"+inputB+" 化成最簡整數比。";
  else if(spec.targetKind==="GIVEN_GCD_REDUCTION")promptText=inputA+":"+inputB+" 的最大公因數是 "+commonDivisor+"。前後項同除以 "+commonDivisor+"，寫出最簡整數比。";
  else promptText=inputA+":"+inputB+" 先同除以 "+firstDivisor+" 得 "+intermediateA+":"+intermediateB+"，還能再化簡。請繼續化成最簡整數比。";
  return Object.freeze({
    variant:u,targetKind:spec.targetKind,semanticCore:"SIMPLIFY_RATIO_TO_COPRIME_POSITIVE_INTEGER_TERMS",
    inputA,inputB,outputA,outputB,commonDivisor,firstDivisor,intermediateA,intermediateB,remainingDivisor,
    inputGcd:gcd(inputA,inputB),finalGcd:gcd(outputA,outputB),
    commonDivisorExactOnBothTerms:inputA%commonDivisor===0&&inputB%commonDivisor===0,
    outputTermsPositiveIntegers:Number.isInteger(outputA)&&Number.isInteger(outputB)&&outputA>0&&outputB>0,
    outputTermsCoprime:gcd(outputA,outputB)===1,
    ratioValueInvariant:inputA/outputA===inputB/outputB&&inputA/outputA===commonDivisor,
    antecedentConsequentOrderPreserved:true,
    promptText,answerText:outputA+":"+outputB
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
function parseRatio(v){
  const m=String(v??"").trim().match(/^(\d+)\s*:\s*(\d+)$/);
  if(!m)return null;
  return [Number(m[1]),Number(m[2])];
}
export function buildG6AU05P07F05Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f05-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f05-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answerText,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f05-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice005Implementation",authority:"R02_PAGE4_PRIMARY_CURRENT_VISUAL_PAGE1_SIMPLIFICATION_CONTEXT_WITHOUT_SILENT_RECONCILIATION",r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,evidenceLocalizationMismatchPreserved:true,sharedRuntimeScope:G6A_U05_P07F05_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_factor_multiple",classificationRuleId:"rule_factor_multiple",appliedRuntimeModifierIds:MODIFIERS,
      factorMultipleReasoningBound:true,factorMultipleValidatorBound:true,textNumericRepresentationBound:true,greatestCommonFactorPrerequisiteRequired:true,equivalentRatioPrerequisiteRequired:true,
      simplifyRatioOwned:true,positiveIntegerInputRatioOnly:true,commonDivisorExactOnBothTermsValidated:true,outputCoprimeValidated:true,finalGcdOneValidated:true,ratioValueInvariantValidated:true,antecedentConsequentOrderPreserved:true,
      q001RatioNotationReowned:false,q002RatioValueReowned:false,q003EquivalentRatioReowned:false,decimalRatioInputNormalizationUsed:false,fractionRatioInputNormalizationUsed:false,ratioPartitionApplicationReowned:false,proportionCrossMultiplicationInternalUsed:false,proportionCrossMultiplicationTaught:false,percentConversionReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q006OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU05P07F05Answer(q,submitted){
  const pair=parseRatio(submitted),e=[];
  if(!pair)e.push("P07F05_ANSWER_NOT_RATIO");
  else if(pair[0]!==q?.patternRepresentation?.outputA||pair[1]!==q?.patternRepresentation?.outputB)e.push("P07F05_ANSWER_RATIO_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:pair?pair[0]+":"+pair[1]:null});
}
export function validateG6AU05P07F05Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P07F05_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F05_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F05_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F05_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F05_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F05_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.answerValue!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F05_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.inputA)||!Number.isInteger(p.inputB)||p.inputA<=0||p.inputB<=0||!Number.isInteger(p.outputA)||!Number.isInteger(p.outputB)||p.outputA<=0||p.outputB<=0)e.push("P07F05_POSITIVE_INTEGER_DOMAIN_INVALID");
    if(p.inputGcd!==p.commonDivisor||p.commonDivisor<=1||p.inputA!==p.outputA*p.commonDivisor||p.inputB!==p.outputB*p.commonDivisor||!p.commonDivisorExactOnBothTerms)e.push("P07F05_COMMON_DIVISOR_INVALID");
    if(p.finalGcd!==1||gcd(p.outputA,p.outputB)!==1||!p.outputTermsCoprime||!p.outputTermsPositiveIntegers)e.push("P07F05_FINAL_COPRIME_INVALID");
    if(!p.ratioValueInvariant||!p.antecedentConsequentOrderPreserved)e.push("P07F05_RATIO_INVARIANT_INVALID");
    if(spec.targetKind==="REPEATED_COMMON_FACTOR_REDUCTION"&&(!Number.isInteger(p.firstDivisor)||p.firstDivisor<=1||!Number.isInteger(p.remainingDivisor)||p.remainingDivisor<=1||p.intermediateA!==p.outputA*p.remainingDivisor||p.intermediateB!==p.outputB*p.remainingDivisor))e.push("P07F05_REPEATED_REDUCTION_INVALID");
    if(!validateG6AU05P07F05Answer(q,q.answerValue).ok)e.push("P07F05_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_factor_multiple"||m.classificationRuleId!=="rule_factor_multiple"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.factorMultipleReasoningBound||!m.factorMultipleValidatorBound||!m.textNumericRepresentationBound||!m.greatestCommonFactorPrerequisiteRequired||!m.equivalentRatioPrerequisiteRequired||!m.simplifyRatioOwned||!m.positiveIntegerInputRatioOnly||!m.commonDivisorExactOnBothTermsValidated||!m.outputCoprimeValidated||!m.finalGcdOneValidated||!m.ratioValueInvariantValidated||!m.antecedentConsequentOrderPreserved||m.q001RatioNotationReowned||m.q002RatioValueReowned||m.q003EquivalentRatioReowned||m.decimalRatioInputNormalizationUsed||m.fractionRatioInputNormalizationUsed||m.ratioPartitionApplicationReowned||m.proportionCrossMultiplicationInternalUsed||m.proportionCrossMultiplicationTaught||m.percentConversionReowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q006OrLaterTouched||m.r04Reclassified)e.push("P07F05_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["小數比","分數比","按比分配","交叉相乘","百分率"])if(learner.includes(term))e.push("P07F05_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU05P07F05Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F05_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F05_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F05_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f05-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*83)%240;questions.push(buildG6AU05P07F05Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU05P07F05Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F05_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
