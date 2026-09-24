import {
  G6B_U04_P07F19_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U04_P07F19_FORMAL_MAPPING as MAPPING,
  G6B_U04_P07F19_KP_ID as KP,
  G6B_U04_P07F19_PATTERN_GROUP as GROUP,
  G6B_U04_P07F19_PATTERN_SPECS as SPECS,
  G6B_U04_P07F19_SOURCE_ID as SRC,
  G6B_U04_P07F19_SPEC_IDS as SPEC_IDS
} from "../registry/g6b-u04-base-comparison-rate-roles-selector-projection-p07f19.js";
export const G6B_U04_P07F19_MAX_QUESTION_COUNT=240;
export const G6B_U04_P07F19_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const CONTEXTS=Object.freeze([
  ["水壺容量","杯子容量"],["女生人數","男生人數"],["今天售出杯數","昨天售出杯數"],["羊群數量","牛群數量"],
  ["買書花費","全部零用錢"],["今年新生人數","去年新生人數"],["售價","成本"],["已跑距離","全程距離"],
  ["紅球數量","藍球數量"],["甲班人數","乙班人數"],["現在庫存","原有庫存"],["實際用量","原定用量"]
].map(Object.freeze));
const RATES=Object.freeze(["0.25","0.4","0.5","0.6","0.7","0.75","0.8","0.9","0.95","1.1","1.2","1.25","1.4","1.5","1.75","25%","35%","70%","95%","140%"]);
function rolePayload(spec,v){
  const u=mod(v,240),ctx=CONTEXTS[u%CONTEXTS.length],rate=RATES[Math.floor(u/CONTEXTS.length)%RATES.length],comparisonLabel=ctx[0],baseLabel=ctx[1];
  const statement=comparisonLabel+"是"+baseLabel+"的"+rate+"。";
  let promptText,answerText,answerKind;
  if(spec.targetKind==="BASE_QUANTITY_ROLE"){promptText=statement+" 哪一個量是基準量？";answerText=baseLabel;answerKind="BASE_QUANTITY_LABEL";}
  else if(spec.targetKind==="COMPARISON_QUANTITY_ROLE"){promptText=statement+" 哪一個量是比較量？";answerText=comparisonLabel;answerKind="COMPARISON_QUANTITY_LABEL";}
  else if(spec.targetKind==="RATE_ROLE"){promptText=statement+" 這個關係中的比率是多少？";answerText=rate;answerKind="RATE_LITERAL";}
  else{promptText=statement+" 請寫出正確的數量關係。";answerText=comparisonLabel+"＝"+baseLabel+"×"+rate;answerKind="ORIENTED_RELATION";}
  return Object.freeze({
    variant:u,targetKind:spec.targetKind,semanticCore:spec.semanticCore,comparisonQuantityLabel:comparisonLabel,baseQuantityLabel:baseLabel,rateLiteral:rate,
    sourceRelationStatement:statement,promptText,answerText,answerKind,baseQuantityIsDenominatorRoleVerified:true,comparisonEqualsBaseTimesRateVerified:true,
    rateEqualsComparisonDividedByBaseConceptualRoleVerified:true,roleDirectionVerified:true,sourceContextIndex:u%CONTEXTS.length,rateIndex:Math.floor(u/CONTEXTS.length)%RATES.length,
    sourceVisualExactText:false,sourceBackedRoleRelationFamily:true
  });
}
const normalize=x=>String(x??"").replace(/s+/g,"").replace(/=/g,"＝").trim();
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6BU04P07F19Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=rolePayload(spec,o.variant??0);
  const q={
    id:"p07f19-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f19-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answerText,
    patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f19-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice019Implementation",authority:MAPPING.semanticAuthority,r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,
      sharedRuntimeScope:G6B_U04_P07F19_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:MODIFIERS,
      ratioPercentReasoningBound:true,ratioRateValidatorBound:true,textApplicationRepresentationBound:true,percentageRatePrerequisiteConsumed:true,priorPercentageRateOwnershipReowned:false,
      baseComparisonRateRoleOwnership:true,findBaseQuantityOwnership:false,findComparisonQuantityOwnership:false,findRateOwnership:false,successiveRateChangeOwnership:false,
      multiStageDiscountInterestOwnership:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q020OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6BU04P07F19Answer(q,submitted){
  const e=[],actual=normalize(submitted),expected=normalize(q?.patternRepresentation?.answerText);
  if(!actual)e.push("P07F19_ANSWER_EMPTY");else if(actual!==expected)e.push("P07F19_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual||null});
}
export function validateG6BU04P07F19Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P07F19_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F19_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F19_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F19_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F19_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=rolePayload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F19_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F19_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!p.baseQuantityLabel||!p.comparisonQuantityLabel||p.baseQuantityLabel===p.comparisonQuantityLabel||!p.rateLiteral||
      !p.baseQuantityIsDenominatorRoleVerified||!p.comparisonEqualsBaseTimesRateVerified||!p.rateEqualsComparisonDividedByBaseConceptualRoleVerified||!p.roleDirectionVerified)e.push("P07F19_ROLE_INVARIANT_INVALID");
    if(spec.targetKind==="BASE_QUANTITY_ROLE"&&p.answerText!==p.baseQuantityLabel)e.push("P07F19_BASE_ROLE_ANSWER_INVALID");
    if(spec.targetKind==="COMPARISON_QUANTITY_ROLE"&&p.answerText!==p.comparisonQuantityLabel)e.push("P07F19_COMPARISON_ROLE_ANSWER_INVALID");
    if(spec.targetKind==="RATE_ROLE"&&p.answerText!==p.rateLiteral)e.push("P07F19_RATE_ROLE_ANSWER_INVALID");
    if(spec.targetKind==="RELATION_ORIENTATION"&&p.answerText!==p.comparisonQuantityLabel+"＝"+p.baseQuantityLabel+"×"+p.rateLiteral)e.push("P07F19_RELATION_ANSWER_INVALID");
    if(!validateG6BU04P07F19Answer(q,q.answerText).ok)e.push("P07F19_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||
    !m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||!m.textApplicationRepresentationBound||!m.percentageRatePrerequisiteConsumed||m.priorPercentageRateOwnershipReowned||
    !m.baseComparisonRateRoleOwnership||m.findBaseQuantityOwnership||m.findComparisonQuantityOwnership||m.findRateOwnership||m.successiveRateChangeOwnership||
    m.multiStageDiscountInterestOwnership||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q020OrLaterTouched||m.r04Reclassified)e.push("P07F19_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["折扣後","利息","連續折扣"])if(learner.includes(term))e.push("P07F19_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU04P07F19Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F19_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F19_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F19_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f19-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*61)%240;
    questions.push(buildG6BU04P07F19Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6BU04P07F19Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F19_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
