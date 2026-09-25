import {
  G6B_U04_P07F24_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U04_P07F24_FORMAL_MAPPING as MAPPING,
  G6B_U04_P07F24_KP_ID as KP,
  G6B_U04_P07F24_PATTERN_GROUP as GROUP,
  G6B_U04_P07F24_PATTERN_SPECS as SPECS,
  G6B_U04_P07F24_SOURCE_ID as SRC,
  G6B_U04_P07F24_SPEC_IDS as SPEC_IDS
} from "../registry/g6b-u04-successive-rate-change-selector-projection-p07f24.js";

export const G6B_U04_P07F24_MAX_QUESTION_COUNT=240;
export const G6B_U04_P07F24_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const RATES=Object.freeze([5,10,15,20,25,30,35,40,45,50,55,60]);
const CONTEXTS=Object.freeze([
  Object.freeze({subject:"某商品價格",unit:"元"}),
  Object.freeze({subject:"某活動參加人數",unit:"人"}),
  Object.freeze({subject:"某工廠產量",unit:"件"}),
  Object.freeze({subject:"某批物資數量",unit:"箱"}),
  Object.freeze({subject:"某店本月銷售量",unit:"份"}),
  Object.freeze({subject:"某地區用水量",unit:"公噸"})
]);
const stageFactor=(type,rate)=>type==="INCREASE"?100+rate:100-rate;
const stageVerb=(type,rate)=>type==="INCREASE"?"增加 "+rate+"%":"減少 "+rate+"%";
function payload(spec,v){
  const u=mod(v,240),r1=RATES[u%RATES.length],r2=RATES[(Math.floor(u/RATES.length)+3)%RATES.length],
    ctx=CONTEXTS[u%CONTEXTS.length],original=10000*(u+1),f1=stageFactor(spec.stage1ChangeType,r1),f2=stageFactor(spec.stage2ChangeType,r2),
    stage1=original*f1/100,final=stage1*f2/100;
  const signed1=spec.stage1ChangeType==="INCREASE"?r1:-r1,signed2=spec.stage2ChangeType==="INCREASE"?r2:-r2,
    directPercent=signed1+signed2,directAdditionQuantity=original*(100+directPercent)/100;
  const promptText=ctx.subject+"原來是 "+original+ctx.unit+"，第一階段"+stageVerb(spec.stage1ChangeType,r1)+"；第二階段以第一階段變化後的數量為基準，再"+stageVerb(spec.stage2ChangeType,r2)+"。最後是多少"+ctx.unit+"？";
  return Object.freeze({
    variant:u,targetKind:"FINAL_QUANTITY_AFTER_SUCCESSIVE_RATE_CHANGE",semanticCore:spec.semanticCore,
    contextSubject:ctx.subject,unit:ctx.unit,originalQuantity:original,
    stage1ChangeType:spec.stage1ChangeType,stage1RatePercent:r1,stage1FactorPercent:f1,stage1Quantity:stage1,
    stage2ChangeType:spec.stage2ChangeType,stage2RatePercent:r2,stage2FactorPercent:f2,finalQuantity:final,
    directSignedRateSumPercent:directPercent,directPercentageAdditionQuantity:directAdditionQuantity,
    promptText,answerValue:final,answerText:String(final),answerKind:"QUANTITY",
    stageFactorMultiplicationVerified:true,stage1OutputBecomesStage2BaseVerified:true,
    finalRelationVerified:final*10000===original*f1*f2,directPercentageAdditionRejected:Math.abs(final-directAdditionQuantity)>1e-9,
    answerBackSubstitutionVerified:true,sourceVisualExactText:false,sourceBackedRelationFamily:true
  });
}
const parseAnswer=v=>{if(typeof v==="number")return Number.isFinite(v)?v:null;const s=String(v??"").trim().replace(/,/g,""),n=Number(s);return Number.isFinite(n)?n:null;};
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6BU04P07F24Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={id:"p07f24-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f24-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,
    questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,
    answerText:p.answerText,answerValue:p.answerValue,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f24-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice024Implementation",authority:MAPPING.semanticAuthority,r02EvidencePages:MAPPING.r02EvidencePages,
      sharedRuntimeScope:G6B_U04_P07F24_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",
      appliedRuntimeModifierIds:MODIFIERS,ratioPercentReasoningBound:true,ratioRateValidatorBound:true,textApplicationRepresentationBound:true,
      relationModelBindingBound:true,wordProblemSemanticValidationBound:true,successiveRateChangeOwnership:true,
      stageFactorMultiplicationRequired:true,stage1OutputBecomesStage2BaseRequired:true,answerBackSubstitutionRequired:true,
      directPercentageAdditionAllowed:false,predecessorKnowledgePointReowned:false,simpleSingleStageDiscountIncreaseReowned:false,
      sameUnitMixedUsed:false,crossUnitMixedUsed:false,q025OrLaterTouched:false,r04Reclassified:false
    })};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6BU04P07F24Answer(q,submitted){
  const e=[],actual=parseAnswer(submitted),expected=Number(q?.patternRepresentation?.answerValue);
  if(actual===null)e.push("P07F24_ANSWER_NOT_NUMERIC");else if(Math.abs(actual-expected)>1e-9)e.push("P07F24_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual});
}
export function validateG6BU04P07F24Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P07F24_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F24_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F24_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F24_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F24_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F24_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F24_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!(Number(p.originalQuantity)>0)||!(Number(p.stage1Quantity)>0)||!(Number(p.finalQuantity)>0)||
      p.stage1Quantity!==p.originalQuantity*p.stage1FactorPercent/100||
      p.finalQuantity!==p.stage1Quantity*p.stage2FactorPercent/100||
      p.finalQuantity*10000!==p.originalQuantity*p.stage1FactorPercent*p.stage2FactorPercent||
      !p.stageFactorMultiplicationVerified||!p.stage1OutputBecomesStage2BaseVerified||!p.finalRelationVerified||
      !p.directPercentageAdditionRejected||!p.answerBackSubstitutionVerified)e.push("P07F24_SUCCESSIVE_RATE_INVARIANT_INVALID");
    if(Math.abs(Number(q.answerText)-p.finalQuantity)>1e-9)e.push("P07F24_FINAL_ANSWER_INVALID");
    if(!validateG6BU04P07F24Answer(q,q.answerText).ok)e.push("P07F24_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||
    (m.appliedRuntimeModifierIds??[]).join("|")!=="mod_application_semantics"||!m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||
    !m.textApplicationRepresentationBound||!m.relationModelBindingBound||!m.wordProblemSemanticValidationBound||!m.successiveRateChangeOwnership||
    !m.stageFactorMultiplicationRequired||!m.stage1OutputBecomesStage2BaseRequired||!m.answerBackSubstitutionRequired||m.directPercentageAdditionAllowed||
    m.predecessorKnowledgePointReowned||m.simpleSingleStageDiscountIncreaseReowned||m.sameUnitMixedUsed||m.crossUnitMixedUsed||
    m.q025OrLaterTouched||m.r04Reclassified)e.push("P07F24_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["百分率直接相加","相加百分率"])if(learner.includes(term))e.push("P07F24_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU04P07F24Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F24_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],
    specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F24_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F24_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f24-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*61)%240;
    questions.push(buildG6BU04P07F24Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6BU04P07F24Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F24_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
