import {
  G5B_U08_P07F13_APPLIED_MODIFIER_IDS as MODIFIERS,
  G5B_U08_P07F13_FORMAL_MAPPINGS as MAPPINGS,
  G5B_U08_P07F13_KP_IDS as KPS,
  G5B_U08_P07F13_PATTERN_GROUPS as GROUPS,
  G5B_U08_P07F13_PATTERN_SPECS as SPECS,
  G5B_U08_P07F13_RATE_KP_ID as RATE_KP,
  G5B_U08_P07F13_QUANTITY_KP_ID as QUANTITY_KP,
  G5B_U08_P07F13_SOURCE_ID as SRC,
  G5B_U08_P07F13_SPEC_IDS_BY_KP as SPEC_IDS_BY_KP
} from "../registry/g5b-u08-rate-percentage-quantity-selector-projection-p07f13.js";
export const G5B_U08_P07F13_MAX_QUESTION_COUNT=240;
export const G5B_U08_P07F13_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
const MAPPING_BY_KP=new Map(MAPPINGS.map(x=>[x.knowledgePointId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const trim=n=>Number(Number(n).toFixed(2)).toString();
function standardPair(v){
  const u=mod(v,240),idx=u%19,m=Math.floor(u/19)+1,ratePercent=5*(idx+1),baseQuantity=20*m,comparisonQuantity=m*(idx+1);
  return Object.freeze({variant:u,ratePercent,baseQuantity,comparisonQuantity});
}
function rateDirect(v){
  const p=standardPair(v);
  return Object.freeze({...p,targetKind:"PERCENTAGE_RATE",semanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    promptText:"某班共有 "+p.baseQuantity+" 人，其中 "+p.comparisonQuantity+" 人完成挑戰。完成人數占全班的百分率是多少？",
    answerValue:p.ratePercent,answerText:trim(p.ratePercent)+"%",answerKind:"PERCENT",
    baseQuantity:p.baseQuantity,comparisonQuantity:p.comparisonQuantity,ratePercent:p.ratePercent,
    denominatorIsBaseQuantityVerified:true,sourceContext:"GENERIC_RATE_FROM_TWO_QUANTITIES",sourceExemplarMatch:false
  });
}
function errorRate(v){
  const u=mod(v,240);
  if(u===0)return Object.freeze({variant:u,targetKind:"ERROR_RATE_PERCENT",semanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    promptText:"一次數學考試中，小安答對 38 題、答錯 12 題。答錯率是多少？",
    answerValue:24,answerText:"24%",answerKind:"PERCENT",correctCount:38,wrongCount:12,baseQuantity:50,comparisonQuantity:12,ratePercent:24,
    denominatorIsBaseQuantityVerified:true,sourceContext:"SOURCE_ERROR_RATE",sourceExemplarMatch:true});
  const p=standardPair(u-1),wrongCount=p.comparisonQuantity,correctCount=p.baseQuantity-wrongCount;
  return Object.freeze({variant:u,targetKind:"ERROR_RATE_PERCENT",semanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    promptText:"一次測驗中，答對 "+correctCount+" 題、答錯 "+wrongCount+" 題。答錯率是多少？",
    answerValue:p.ratePercent,answerText:trim(p.ratePercent)+"%",answerKind:"PERCENT",correctCount,wrongCount,baseQuantity:p.baseQuantity,comparisonQuantity:wrongCount,ratePercent:p.ratePercent,
    denominatorIsBaseQuantityVerified:true,sourceContext:"SOURCE_ERROR_RATE",sourceExemplarMatch:false});
}
function updatedShooting(v){
  const u=mod(v,240);
  if(u===0)return Object.freeze({variant:u,targetKind:"UPDATED_RATE_PERCENT",semanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    promptText:"小明前 100 球的進球率是 42%，接著再投 20 球，投進 12 球。現在總進球率是多少？",
    answerValue:45,answerText:"45%",answerKind:"PERCENT",initialAttempts:100,initialRatePercent:42,initialMade:42,additionalAttempts:20,additionalMade:12,totalAttempts:120,totalMade:54,ratePercent:45,
    denominatorIsBaseQuantityVerified:true,reconstructedComparisonQuantityVerified:true,sourceContext:"SOURCE_UPDATED_SHOOTING_RATE",sourceExemplarMatch:true});
  const t=u-1,idx=t%19,m=Math.floor(t/19)+1,initialAttempts=100+20*m,initialRatePercent=5*(idx+1),initialMade=initialAttempts*initialRatePercent/100,additionalAttempts=20+5*(m%4),additionalMade=1+mod(idx*3+m,additionalAttempts),totalAttempts=initialAttempts+additionalAttempts,totalMade=initialMade+additionalMade,ratePercent=Number((totalMade/totalAttempts*100).toFixed(2));
  return Object.freeze({variant:u,targetKind:"UPDATED_RATE_PERCENT",semanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    promptText:"某球員前 "+initialAttempts+" 球的進球率是 "+initialRatePercent+"%，接著再投 "+additionalAttempts+" 球，投進 "+additionalMade+" 球。現在總進球率是多少？（百分率四捨五入到小數點後兩位）",
    answerValue:ratePercent,answerText:trim(ratePercent)+"%",answerKind:"PERCENT",initialAttempts,initialRatePercent,initialMade,additionalAttempts,additionalMade,totalAttempts,totalMade,ratePercent,
    denominatorIsBaseQuantityVerified:true,reconstructedComparisonQuantityVerified:Number.isInteger(initialMade),sourceContext:"SOURCE_UPDATED_SHOOTING_RATE",sourceExemplarMatch:false});
}
function quantityDirect(v){
  const u=mod(v,240);
  if(u===0)return Object.freeze({variant:u,targetKind:"COMPARISON_QUANTITY",semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    promptText:"投 100 球，進球率是 42%。共投進幾球？",
    answerValue:42,answerText:"42",answerKind:"QUANTITY",baseQuantity:100,ratePercent:42,comparisonQuantity:42,
    baseTimesRateVerified:true,sourceContext:"SOURCE_RECONSTRUCT_MADE_QUANTITY",sourceExemplarMatch:true});
  const p=standardPair(u-1);
  return Object.freeze({variant:u,targetKind:"COMPARISON_QUANTITY",semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    promptText:"一共有 "+p.baseQuantity+" 個物件，其中 "+p.ratePercent+"% 符合條件。符合條件的有幾個？",
    answerValue:p.comparisonQuantity,answerText:String(p.comparisonQuantity),answerKind:"QUANTITY",baseQuantity:p.baseQuantity,ratePercent:p.ratePercent,comparisonQuantity:p.comparisonQuantity,
    baseTimesRateVerified:true,sourceContext:"GENERIC_PERCENTAGE_OF_QUANTITY",sourceExemplarMatch:false});
}
function complementQuantity(v){
  const u=mod(v,240);
  if(u===0)return Object.freeze({variant:u,targetKind:"COMPLEMENT_QUANTITY",semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    promptText:"數學作業共有 20 題，答錯率是 5%。答對幾題？",
    answerValue:19,answerText:"19",answerKind:"QUANTITY",baseQuantity:20,ratePercent:5,comparisonQuantity:1,complementQuantity:19,
    baseTimesRateVerified:true,complementStepVerified:true,sourceContext:"SOURCE_CORRECT_QUANTITY_FROM_ERROR_RATE",sourceExemplarMatch:true});
  const p=standardPair(u-1),complementQuantity=p.baseQuantity-p.comparisonQuantity;
  return Object.freeze({variant:u,targetKind:"COMPLEMENT_QUANTITY",semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    promptText:"一次作業共有 "+p.baseQuantity+" 題，答錯率是 "+p.ratePercent+"%。答對幾題？",
    answerValue:complementQuantity,answerText:String(complementQuantity),answerKind:"QUANTITY",baseQuantity:p.baseQuantity,ratePercent:p.ratePercent,comparisonQuantity:p.comparisonQuantity,complementQuantity,
    baseTimesRateVerified:true,complementStepVerified:true,sourceContext:"SOURCE_CORRECT_QUANTITY_FROM_ERROR_RATE",sourceExemplarMatch:false});
}
function reconstructMade(v){
  const u=mod(v,240);
  if(u===0)return Object.freeze({variant:u,targetKind:"RECONSTRUCTED_COMPARISON_QUANTITY",semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    promptText:"前 100 球的進球率是 42%。前 100 球共投進幾球？",
    answerValue:42,answerText:"42",answerKind:"QUANTITY",baseQuantity:100,ratePercent:42,comparisonQuantity:42,
    baseTimesRateVerified:true,reconstructionStepVerified:true,sourceContext:"SOURCE_RECONSTRUCT_MADE_QUANTITY",sourceExemplarMatch:true});
  const p=standardPair(u-1);
  return Object.freeze({variant:u,targetKind:"RECONSTRUCTED_COMPARISON_QUANTITY",semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    promptText:"前 "+p.baseQuantity+" 次投球的進球率是 "+p.ratePercent+"%。共投進幾球？",
    answerValue:p.comparisonQuantity,answerText:String(p.comparisonQuantity),answerKind:"QUANTITY",baseQuantity:p.baseQuantity,ratePercent:p.ratePercent,comparisonQuantity:p.comparisonQuantity,
    baseTimesRateVerified:true,reconstructionStepVerified:true,sourceContext:"SOURCE_RECONSTRUCT_MADE_QUANTITY",sourceExemplarMatch:false});
}
function payload(spec,v){
  if(spec.patternSpecId==="ps_g5b_u08_rate_from_comparison_base")return rateDirect(v);
  if(spec.patternSpecId==="ps_g5b_u08_error_rate_from_correct_wrong")return errorRate(v);
  if(spec.patternSpecId==="ps_g5b_u08_updated_shooting_rate")return updatedShooting(v);
  if(spec.patternSpecId==="ps_g5b_u08_percentage_of_base_quantity")return quantityDirect(v);
  if(spec.patternSpecId==="ps_g5b_u08_correct_quantity_from_error_rate")return complementQuantity(v);
  return reconstructMade(v);
}
function parseAnswer(value,kind){
  if(kind==="PERCENT"){
    if(typeof value==="number")return Number.isFinite(value)?value:null;
    const s=String(value??"").trim(),n=Number(s.endsWith("%")?s.slice(0,-1):s);
    return Number.isFinite(n)?n:null;
  }
  const n=Number(String(value??"").trim());return Number.isFinite(n)?n:null;
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG5BU08P07F13Question(o={}){
  const kp=o.knowledgePointId??RATE_KP,specIds=SPEC_IDS_BY_KP[kp]??[],patternSpecId=o.patternSpecId??specIds[0],spec=BY_SPEC.get(patternSpecId);
  if(!spec||spec.knowledgePointId!==kp)return null;
  const p=payload(spec,o.variant??0),g=GROUP_BY_KP.get(kp),m=MAPPING_BY_KP.get(kp);
  const q={
    id:"p07f13-"+(KPS.indexOf(kp)+1)+"-"+(specIds.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p07f13-"+(KPS.indexOf(kp)+1)+"-"+(specIds.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:kp,patternGroupId:g.patternGroupId,patternSpecId,relation:spec.relation,
    questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,
    displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answerValue,patternRepresentation:p,
    formalMappingId:m.mappingId,generationSeed:o.generationSeed??"p07f13-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice013Implementation",
      authority:m.semanticAuthority,r02EvidencePages:m.r02EvidencePages,currentVisualSupportingPages:m.currentVisualSupportingPages,currentVisualSupportLevel:m.currentVisualSupportLevel,
      sharedRuntimeScope:G5B_U08_P07F13_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:MODIFIERS,
      ratioPercentReasoningBound:true,ratioRateValidatorBound:true,textApplicationRepresentationBound:true,
      q008RepresentationConversionTeachingReowned:false,q016FindBaseQuantityUsed:false,q016DiscountIncreaseApplicationUsed:false,
      sourceBackedApplicationContextUsed:true,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q014OrLaterTouched:false,r04Reclassified:false,
      rateOwnership:kp===RATE_KP,percentageQuantityOwnership:kp===QUANTITY_KP,
      denominatorMustBeBaseQuantity:kp===RATE_KP,
      comparisonQuantityEqualsBaseTimesRate:kp===QUANTITY_KP
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG5BU08P07F13Answer(q,submitted){
  const p=q?.patternRepresentation,e=[],actual=parseAnswer(submitted,p?.answerKind),expected=Number(p?.answerValue);
  if(actual===null)e.push("P07F13_ANSWER_NOT_NUMERIC");
  else if(Math.abs(actual-expected)>1e-9)e.push("P07F13_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual});
}
export function validateG5BU08P07F13Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation;
  if(!spec)e.push("P07F13_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F13_SOURCE_INVALID");
  if(!KPS.includes(q?.knowledgePointId)||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F13_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F13_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F13_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F13_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F13_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!(Number(p.baseQuantity)>0)||!(Number(p.ratePercent)>=0)||!(Number(p.ratePercent)<=100))e.push("P07F13_DOMAIN_INVALID");
    if(q.knowledgePointId===RATE_KP){
      if(!(Number(p.comparisonQuantity)>=0)||Number(p.comparisonQuantity)>Number(p.baseQuantity)||!p.denominatorIsBaseQuantityVerified)e.push("P07F13_RATE_ROLE_INVALID");
      if(p.targetKind!=="UPDATED_RATE_PERCENT"&&Math.abs(Number(p.comparisonQuantity)/Number(p.baseQuantity)*100-Number(p.ratePercent))>1e-9)e.push("P07F13_RATE_INVARIANT_INVALID");
      if(p.targetKind==="UPDATED_RATE_PERCENT"&&(!p.reconstructedComparisonQuantityVerified||Math.abs(Number(p.totalMade)/Number(p.totalAttempts)*100-Number(p.answerValue))>0.011))e.push("P07F13_UPDATED_RATE_INVARIANT_INVALID");
    }else{
      if(!p.baseTimesRateVerified||Math.abs(Number(p.baseQuantity)*Number(p.ratePercent)/100-Number(p.comparisonQuantity))>1e-9)e.push("P07F13_QUANTITY_INVARIANT_INVALID");
      if(p.targetKind==="COMPLEMENT_QUANTITY"&&(!p.complementStepVerified||Number(p.complementQuantity)!==Number(p.baseQuantity)-Number(p.comparisonQuantity)))e.push("P07F13_COMPLEMENT_INVALID");
      if(p.targetKind==="RECONSTRUCTED_COMPARISON_QUANTITY"&&!p.reconstructionStepVerified)e.push("P07F13_RECONSTRUCTION_INVALID");
    }
    if(!validateG5BU08P07F13Answer(q,q.answerText).ok)e.push("P07F13_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||!m.textApplicationRepresentationBound||m.q008RepresentationConversionTeachingReowned||m.q016FindBaseQuantityUsed||m.q016DiscountIncreaseApplicationUsed||!m.sourceBackedApplicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q014OrLaterTouched||m.r04Reclassified)e.push("P07F13_SCOPE_INVALID");
  if(q?.knowledgePointId===RATE_KP&&(!m.rateOwnership||m.percentageQuantityOwnership||!m.denominatorMustBeBaseQuantity))e.push("P07F13_RATE_OWNERSHIP_INVALID");
  if(q?.knowledgePointId===QUANTITY_KP&&(!m.percentageQuantityOwnership||m.rateOwnership||!m.comparisonQuantityEqualsBaseTimesRate))e.push("P07F13_QUANTITY_OWNERSHIP_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["折扣","打折","原價","售價","漲價","加成","糖水"])if(learner.includes(term))e.push("P07F13_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG5BU08P07F13Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F13_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0];
  if(!KPS.includes(kp))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F13_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const allIds=SPEC_IDS_BY_KP[kp],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):allIds.map(id=>BY_SPEC.get(id));
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)||BY_SPEC.get(id).knowledgePointId!==kp))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F13_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f13-public")+n+allIds.indexOf(spec.patternSpecId)*71)%240;
    questions.push(buildG5BU08P07F13Question({knowledgePointId:kp,patternSpecId:spec.patternSpecId,variant,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG5BU08P07F13Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F13_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
