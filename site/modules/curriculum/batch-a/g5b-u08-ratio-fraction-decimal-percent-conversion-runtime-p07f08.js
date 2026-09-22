import {G5B_U08_P07F08_APPLIED_MODIFIER_IDS as MODIFIERS,G5B_U08_P07F08_FORMAL_MAPPING as MAPPING,G5B_U08_P07F08_KP_ID as KP,G5B_U08_P07F08_PATTERN_GROUP as GROUP,G5B_U08_P07F08_PATTERN_SPECS as SPECS,G5B_U08_P07F08_SOURCE_ID as SRC,G5B_U08_P07F08_SPEC_IDS as SPEC_IDS} from "../registry/g5b-u08-ratio-fraction-decimal-percent-conversion-selector-projection-p07f08.js";
export const G5B_U08_P07F08_MAX_QUESTION_COUNT=240;
export const G5B_U08_P07F08_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1;};
const trim=n=>{const s=Number(n.toFixed(3)).toString();return s;};
function ratioForVariant(v){
  const u=mod(v,240);
  const raw=u<160?100+u*5:1000+(u-160)*25;
  const den=1000,g=gcd(raw,den),num=raw/g,redDen=den/g,value=raw/den,percent=raw/10;
  return Object.freeze({variant:u,rawNumerator:raw,rawDenominator:den,numerator:num,denominator:redDen,fractionText:redDen===1?String(num):num+"/"+redDen,decimalValue:value,decimalText:trim(value),percentValue:percent,percentText:trim(percent)+"%",percentAbove100:percent>100,percentIdentityBase100Verified:Math.abs(value-percent/100)<1e-12});
}
function payload(spec,v){
  const r=ratioForVariant(v),k=spec.targetKind;
  let promptText,answerText,answerValue,answerKind;
  if(k==="FRACTION_TO_DECIMAL"){promptText="把分數 "+r.fractionText+" 化成小數。";answerText=r.decimalText;answerValue=r.decimalValue;answerKind="DECIMAL";}
  else if(k==="DECIMAL_TO_FRACTION"){promptText="把小數 "+r.decimalText+" 化成最簡分數。";answerText=r.fractionText;answerValue=r.decimalValue;answerKind="FRACTION";}
  else if(k==="DECIMAL_TO_PERCENT"){promptText="把小數 "+r.decimalText+" 化成百分率。";answerText=r.percentText;answerValue=r.percentValue;answerKind="PERCENT";}
  else if(k==="PERCENT_TO_DECIMAL"){promptText="把百分率 "+r.percentText+" 化成小數。";answerText=r.decimalText;answerValue=r.decimalValue;answerKind="DECIMAL";}
  else if(k==="FRACTION_TO_PERCENT"){promptText="把分數 "+r.fractionText+" 化成百分率。";answerText=r.percentText;answerValue=r.percentValue;answerKind="PERCENT";}
  else {promptText="把百分率 "+r.percentText+" 化成最簡分數。";answerText=r.fractionText;answerValue=r.decimalValue;answerKind="FRACTION";}
  return Object.freeze({...r,targetKind:k,semanticCore:"FRACTION_DECIMAL_PERCENT_REPRESENT_THE_SAME_RATIO",fractionValue:r.decimalValue,representationValueEquivalenceVerified:Math.abs((r.numerator/r.denominator)-r.decimalValue)<1e-12&&Math.abs(r.decimalValue-r.percentValue/100)<1e-12,promptText,answerText,answerValue,answerKind});
}
function parseAnswer(v,kind){
  if(kind==="PERCENT"){
    if(typeof v==="number")return Number.isFinite(v)?v:null;
    const s=String(v??"").trim();const has=s.endsWith("%"),n=Number(has?s.slice(0,-1):s);return Number.isFinite(n)?n:null;
  }
  if(kind==="FRACTION"){
    if(typeof v==="number")return Number.isFinite(v)?v:null;
    const s=String(v??"").trim(),m=s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if(m){const d=Number(m[2]);return d===0?null:Number(m[1])/d;}
    const n=Number(s);return Number.isFinite(n)?n:null;
  }
  const n=Number(String(v??"").trim());return Number.isFinite(n)?n:null;
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG5BU08P07F08Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f08-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f08-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answerValue,
    patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f08-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice008Implementation",authority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_FRACTION_DECIMAL_PERCENT_EQUIVALENCE_EVIDENCE",
      r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,currentVisualSupportLevel:MAPPING.currentVisualSupportLevel,
      sharedRuntimeScope:G5B_U08_P07F08_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:MODIFIERS,
      ratioPercentReasoningBound:true,ratioRateValidatorBound:true,textApplicationRepresentationBound:true,ratioValuePrerequisiteRequired:true,decimalFractionConversionPrerequisiteRequired:true,
      representationEquivalenceOwned:true,percentBase100IdentityValidated:true,percentAbove100Allowed:true,simplifiedFractionOutputRequired:true,
      findPercentageRateFromTwoQuantitiesUsed:false,percentageOfQuantityUsed:false,findBaseQuantityUsed:false,discountIncreaseApplicationUsed:false,roleBasedBaseComparisonQuantityTeachingReowned:false,
      applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q009OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG5BU08P07F08Answer(q,submitted){
  const p=q?.patternRepresentation,actual=parseAnswer(submitted,p?.answerKind),expected=Number(p?.answerValue),e=[];
  if(actual===null)e.push("P07F08_ANSWER_NOT_NUMERIC_EQUIVALENT");
  else if(Math.abs(actual-expected)>1e-9)e.push("P07F08_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual});
}
export function validateG5BU08P07F08Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation;
  if(!spec)e.push("P07F08_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F08_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F08_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F08_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F08_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F08_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F08_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(p.numerator<=0||p.denominator<=0||gcd(p.numerator,p.denominator)!==1||!p.percentIdentityBase100Verified||!p.representationValueEquivalenceVerified)e.push("P07F08_EQUIVALENCE_INVARIANT_INVALID");
    if(Math.abs(p.fractionValue-p.decimalValue)>1e-12||Math.abs(p.decimalValue-p.percentValue/100)>1e-12)e.push("P07F08_VALUE_EQUIVALENCE_INVALID");
    if(!validateG5BU08P07F08Answer(q,q.answerText).ok)e.push("P07F08_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||!m.textApplicationRepresentationBound||!m.ratioValuePrerequisiteRequired||!m.decimalFractionConversionPrerequisiteRequired||!m.representationEquivalenceOwned||!m.percentBase100IdentityValidated||!m.percentAbove100Allowed||!m.simplifiedFractionOutputRequired||m.findPercentageRateFromTwoQuantitiesUsed||m.percentageOfQuantityUsed||m.findBaseQuantityUsed||m.discountIncreaseApplicationUsed||m.roleBasedBaseComparisonQuantityTeachingReowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q009OrLaterTouched||m.r04Reclassified)e.push("P07F08_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["折扣","漲價","投票","命中率","錯誤率","原價","售價"])if(learner.includes(term))e.push("P07F08_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG5BU08P07F08Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F08_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F08_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F08_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f08-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*37)%240;questions.push(buildG5BU08P07F08Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG5BU08P07F08Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F08_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
