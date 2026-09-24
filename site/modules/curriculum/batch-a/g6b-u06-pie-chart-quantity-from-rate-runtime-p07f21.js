import {
  G6B_U06_P07F21_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U06_P07F21_FORMAL_MAPPING as MAPPING,
  G6B_U06_P07F21_KP_ID as KP,
  G6B_U06_P07F21_PATTERN_GROUP as GROUP,
  G6B_U06_P07F21_PATTERN_SPECS as SPECS,
  G6B_U06_P07F21_SOURCE_ID as SRC,
  G6B_U06_P07F21_SPEC_IDS as SPEC_IDS
} from "../registry/g6b-u06-pie-chart-quantity-from-rate-selector-projection-p07f21.js";
export const G6B_U06_P07F21_MAX_QUESTION_COUNT=240;
export const G6B_U06_P07F21_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const PERCENTS=Object.freeze([5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90]);
const CONTEXTS=Object.freeze([
  Object.freeze({whole:"六年級學生",part:"參加球類社團的學生",unit:"人"}),
  Object.freeze({whole:"圖書館本月借閱書籍",part:"自然科學類書籍",unit:"本"}),
  Object.freeze({whole:"果汁店本日售出飲料",part:"蘋果汁",unit:"杯"}),
  Object.freeze({whole:"農場採收水果",part:"橘子",unit:"公斤"}),
  Object.freeze({whole:"園遊會售出餐券",part:"飲料餐券",unit:"張"}),
  Object.freeze({whole:"校慶到場人數",part:"家長",unit:"人"})
]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function decimalLiteral(percent){return String(percent/100);}
function genericPayload(spec,u){
  const ctx=CONTEXTS[u%CONTEXTS.length],percent=PERCENTS[Math.floor(u/CONTEXTS.length)%PERCENTS.length],total=200+20*u,answer=total*percent/100;
  const rateLiteral=spec.rateDisplayMode==="decimal"?decimalLiteral(percent):percent+"%";
  const promptText="圓形圖顯示「"+ctx.part+"」占「"+ctx.whole+"」的"+rateLiteral+"。若總量是"+total+ctx.unit+"，"+ctx.part+"有多少"+ctx.unit+"？";
  return Object.freeze({
    variant:u,contextKind:spec.contextKind,rateDisplayMode:spec.rateDisplayMode,totalQuantity:total,sectorPercent:percent,rateLiteral,
    answer,answerText:String(answer),unit:ctx.unit,wholeLabel:ctx.whole,partLabel:ctx.part,promptText,
    totalQuantityGiven:true,pieChartSectorRateGiven:true,partQuantitySolved:true,answerEqualsTotalTimesRate:answer*100===total*percent,
    backSubstitutionVerified:answer*100===total*percent,sourceStructuralCarrier:false,sourceVisualExactNumericCarrier:false
  });
}
function householdPayload(spec,u){
  const percent=PERCENTS[u%PERCENTS.length],total=u===0?80000:10000+100*u,answer=total*percent/100;
  const item=["房貸","飲食費","雜支","交通費"][u%4];
  const promptText="2月份家用支出的圓形圖中，「"+item+"」占"+percent+"%。若2月份總支出是"+total+"元，"+item+"支出是多少元？";
  return Object.freeze({
    variant:u,contextKind:spec.contextKind,rateDisplayMode:"percent",totalQuantity:total,sectorPercent:percent,rateLiteral:percent+"%",
    answer,answerText:String(answer),unit:"元",wholeLabel:"2月份家用總支出",partLabel:item,promptText,
    totalQuantityGiven:true,pieChartSectorRateGiven:true,partQuantitySolved:true,answerEqualsTotalTimesRate:answer*100===total*percent,
    backSubstitutionVerified:answer*100===total*percent,sourceStructuralCarrier:true,sourceStructuralTotalCarrier:u===0?80000:null,
    sourceVisualExactNumericCarrier:false
  });
}
function payload(spec,v){const u=mod(v,240);return spec.contextKind==="household_expense"?householdPayload(spec,u):genericPayload(spec,u);}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6BU06P07F21Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f21-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f21-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,
    patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f21-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice021Implementation",authority:MAPPING.semanticAuthority,sharedRuntimeScope:G6B_U06_P07F21_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:MODIFIERS,
      ratioPercentReasoningBound:true,ratioRateValidatorBound:true,textApplicationRepresentationBound:true,
      percentageOfQuantityPrerequisiteConsumed:true,pieChartPartWholePrerequisiteConsumed:true,priorKnowledgePointOwnershipReowned:false,
      pieChartQuantityFromRateOwned:true,totalQuantityGiven:true,pieChartSectorRateGiven:true,answerBackSubstitutionRequired:true,
      piePartWholeReowned:false,comparePieChartsReowned:false,explicitPercentAngleConversionUsed:false,pieChartConstructionUsed:false,
      crossChartComparisonUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q022OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6BU06P07F21Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isInteger(n)||n<=0)e.push("P07F21_ANSWER_NOT_POSITIVE_INTEGER");
  else if(n!==q?.answerValue)e.push("P07F21_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)&&n>0?n:null});
}
export function validateG6BU06P07F21Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P07F21_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F21_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F21_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F21_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F21_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F21_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.answerValue!==expected.answer||q.questionSignature!==signature(q))
      e.push("P07F21_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.totalQuantity)||p.totalQuantity<=0||!Number.isInteger(p.sectorPercent)||p.sectorPercent<=0||p.sectorPercent>=100||
      !Number.isInteger(p.answer)||p.answer<=0||p.answer*100!==p.totalQuantity*p.sectorPercent||
      !p.totalQuantityGiven||!p.pieChartSectorRateGiven||!p.partQuantitySolved||!p.answerEqualsTotalTimesRate||!p.backSubstitutionVerified)
      e.push("P07F21_TOTAL_RATE_QUANTITY_INVARIANT_INVALID");
    if(spec.rateDisplayMode==="decimal"&&p.rateLiteral!==decimalLiteral(p.sectorPercent))e.push("P07F21_DECIMAL_RATE_LITERAL_INVALID");
    if(spec.rateDisplayMode==="percent"&&p.rateLiteral!==p.sectorPercent+"%")e.push("P07F21_PERCENT_RATE_LITERAL_INVALID");
    if(!validateG6BU06P07F21Answer(q,q.answerValue).ok)e.push("P07F21_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||
    !m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||!m.textApplicationRepresentationBound||
    !m.percentageOfQuantityPrerequisiteConsumed||!m.pieChartPartWholePrerequisiteConsumed||m.priorKnowledgePointOwnershipReowned||
    !m.pieChartQuantityFromRateOwned||!m.totalQuantityGiven||!m.pieChartSectorRateGiven||!m.answerBackSubstitutionRequired||
    m.piePartWholeReowned||m.comparePieChartsReowned||m.explicitPercentAngleConversionUsed||m.pieChartConstructionUsed||m.crossChartComparisonUsed||
    m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q022OrLaterTouched||m.r04Reclassified)e.push("P07F21_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["圓心角","畫出圓形圖","比較兩個圓形圖"])if(learner.includes(term))e.push("P07F21_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU06P07F21Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F21_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F21_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F21_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f21-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*79)%240;
    questions.push(buildG6BU06P07F21Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6BU06P07F21Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F21_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
