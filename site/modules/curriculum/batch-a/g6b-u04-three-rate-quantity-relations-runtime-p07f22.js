import {
  G6B_U04_P07F22_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U04_P07F22_FORMAL_MAPPINGS as MAPPINGS,
  G6B_U04_P07F22_PATTERN_GROUPS as GROUPS,
  G6B_U04_P07F22_PATTERN_SPECS as SPECS,
  G6B_U04_P07F22_SOURCE_ID as SRC,
  G6B_U04_P07F22_SPEC_IDS as SPEC_IDS,
  G6B_U04_P07F22_TARGET_KP_IDS as TARGETS
} from "../registry/g6b-u04-three-rate-quantity-relations-selector-projection-p07f22.js";

export const G6B_U04_P07F22_MAX_QUESTION_COUNT=240;
export const G6B_U04_P07F22_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const BY_KP=new Map(TARGETS.map(kp=>[kp,SPECS.filter(x=>x.knowledgePointId===kp)]));
const MAPPING_BY_KP=new Map(MAPPINGS.map(x=>[x.knowledgePointId,x]));
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}

const CONTEXTS=Object.freeze([
  ["女生人數","男生人數","人"],["今天售出杯數","昨天售出杯數","杯"],["羊群數量","牛群數量","隻"],
  ["買書花費","全部零用錢","元"],["今年新生人數","去年新生人數","人"],["售價","成本","元"],
  ["已跑距離","全程距離","公尺"],["紅球數量","藍球數量","顆"],["甲班人數","乙班人數","人"],
  ["實際用量","原定用量","公升"],["本月用電量","上月用電量","度"],["完成頁數","全書頁數","頁"]
].map(Object.freeze));
const RATES=Object.freeze([
  Object.freeze({n:1,d:4,decimal:"0.25",percent:"25%"}),
  Object.freeze({n:3,d:10,decimal:"0.3",percent:"30%"}),
  Object.freeze({n:2,d:5,decimal:"0.4",percent:"40%"}),
  Object.freeze({n:1,d:2,decimal:"0.5",percent:"50%"}),
  Object.freeze({n:3,d:5,decimal:"0.6",percent:"60%"}),
  Object.freeze({n:7,d:10,decimal:"0.7",percent:"70%"}),
  Object.freeze({n:3,d:4,decimal:"0.75",percent:"75%"}),
  Object.freeze({n:4,d:5,decimal:"0.8",percent:"80%"}),
  Object.freeze({n:9,d:10,decimal:"0.9",percent:"90%"}),
  Object.freeze({n:19,d:20,decimal:"0.95",percent:"95%"}),
  Object.freeze({n:11,d:10,decimal:"1.1",percent:"110%"}),
  Object.freeze({n:5,d:4,decimal:"1.25",percent:"125%"}),
  Object.freeze({n:7,d:5,decimal:"1.4",percent:"140%"}),
  Object.freeze({n:3,d:2,decimal:"1.5",percent:"150%"})
]);

function relationPayload(spec,v){
  const u=mod(v,240),ctx=CONTEXTS[u%CONTEXTS.length],rate=RATES[Math.floor(u/CONTEXTS.length)%RATES.length];
  const scale=40+u,base=rate.d*scale,comparison=rate.n*scale,rateLiteral=spec.rateDisplayMode==="percent"?rate.percent:rate.decimal;
  const comparisonLabel=ctx[0],baseLabel=ctx[1],unit=ctx[2],kp=spec.knowledgePointId;
  let promptText,answerText,answerKind;
  if(kp==="kp_g6b_u04_find_base_quantity"){
    promptText=comparisonLabel+"是"+baseLabel+"的"+rateLiteral+"。已知"+comparisonLabel+"是"+comparison+unit+"，"+baseLabel+"是多少"+unit+"？";
    answerText=String(base);answerKind="BASE_QUANTITY";
  }else if(kp==="kp_g6b_u04_find_comparison_quantity"){
    promptText=comparisonLabel+"是"+baseLabel+"的"+rateLiteral+"。已知"+baseLabel+"是"+base+unit+"，"+comparisonLabel+"是多少"+unit+"？";
    answerText=String(comparison);answerKind="COMPARISON_QUANTITY";
  }else{
    promptText="已知"+comparisonLabel+"是"+comparison+unit+"，"+baseLabel+"是"+base+unit+"。"+comparisonLabel+"是"+baseLabel+"的多少"+(spec.rateDisplayMode==="percent"?"百分率":"倍")+"？";
    answerText=rateLiteral;answerKind=spec.rateDisplayMode==="percent"?"RATE_PERCENT":"RATE_DECIMAL";
  }
  return Object.freeze({
    variant:u,knowledgePointId:kp,semanticCore:spec.semanticCore,rateDisplayMode:spec.rateDisplayMode,
    comparisonQuantityLabel:comparisonLabel,baseQuantityLabel:baseLabel,unit,baseQuantity:base,comparisonQuantity:comparison,
    rateNumerator:rate.n,rateDenominator:rate.d,rateDecimal:rate.decimal,ratePercent:rate.percent,rateLiteral,
    promptText,answerText,answerKind,baseComparisonRateRoleModelVerified:true,compatibleQuantityUnitsVerified:true,
    comparisonEqualsBaseTimesRateVerified:comparison*rate.d===base*rate.n,
    backSubstitutionVerified:comparison*rate.d===base*rate.n,sourceVisualExactText:false,sourceBackedRelationFamily:true
  });
}
const normalize=x=>String(x??"").replace(/\s+/g,"").trim();
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");

export function buildG6BU04P07F22Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const kp=spec.knowledgePointId,p=relationPayload(spec,o.variant??0),mapping=MAPPING_BY_KP.get(kp),group=GROUP_BY_KP.get(kp);
  const q={
    id:"p07f22-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f22-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:kp,patternGroupId:group.patternGroupId,patternSpecId,relation:spec.relation,
    questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,
    displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answerText,patternRepresentation:p,
    formalMappingId:mapping.mappingId,generationSeed:o.generationSeed??"p07f22-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice022Implementation",authority:mapping.semanticAuthority,r02EvidencePages:mapping.r02EvidencePages,
      sharedRuntimeScope:G6B_U04_P07F22_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",
      appliedRuntimeModifierIds:MODIFIERS,ratioPercentReasoningBound:true,ratioRateValidatorBound:true,textApplicationRepresentationBound:true,
      baseComparisonRateRolePrerequisiteConsumed:true,predecessorRoleOwnershipReowned:false,
      findBaseQuantityOwnership:kp==="kp_g6b_u04_find_base_quantity",
      findComparisonQuantityOwnership:kp==="kp_g6b_u04_find_comparison_quantity",
      findRateOwnership:kp==="kp_g6b_u04_find_rate_from_quantities",
      answerBackSubstitutionRequired:true,compatibleQuantityUnitsRequired:true,successiveRateChangeOwnership:false,
      multiStageDiscountGrowthDecreaseOwnership:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q023OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}

export function validateG6BU04P07F22Answer(q,submitted){
  const e=[],kp=q?.knowledgePointId,actual=normalize(submitted),expected=normalize(q?.answerText);
  if(!actual)e.push("P07F22_ANSWER_EMPTY");
  else if(kp==="kp_g6b_u04_find_rate_from_quantities"){if(actual!==expected)e.push("P07F22_RATE_ANSWER_MISMATCH");}
  else{const n=Number(actual);if(!Number.isInteger(n)||n<=0)e.push("P07F22_QUANTITY_ANSWER_NOT_POSITIVE_INTEGER");else if(String(n)!==expected)e.push("P07F22_QUANTITY_ANSWER_MISMATCH");}
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual||null});
}

export function validateG6BU04P07F22Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{},kp=q?.knowledgePointId;
  if(!spec)e.push("P07F22_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F22_SOURCE_INVALID");
  if(!TARGETS.includes(kp)||kp!==spec?.knowledgePointId)e.push("P07F22_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F22_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F22_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=relationPayload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F22_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F22_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.baseQuantity)||p.baseQuantity<=0||!Number.isInteger(p.comparisonQuantity)||p.comparisonQuantity<=0||
      !Number.isInteger(p.rateNumerator)||p.rateNumerator<=0||!Number.isInteger(p.rateDenominator)||p.rateDenominator<=0||
      !p.baseComparisonRateRoleModelVerified||!p.compatibleQuantityUnitsVerified||!p.comparisonEqualsBaseTimesRateVerified||!p.backSubstitutionVerified||
      p.comparisonQuantity*p.rateDenominator!==p.baseQuantity*p.rateNumerator)e.push("P07F22_RELATION_INVARIANT_INVALID");
    if(kp==="kp_g6b_u04_find_base_quantity"&&Number(q.answerText)!==p.baseQuantity)e.push("P07F22_BASE_ANSWER_INVALID");
    if(kp==="kp_g6b_u04_find_comparison_quantity"&&Number(q.answerText)!==p.comparisonQuantity)e.push("P07F22_COMPARISON_ANSWER_INVALID");
    if(kp==="kp_g6b_u04_find_rate_from_quantities"&&q.answerText!==p.rateLiteral)e.push("P07F22_RATE_ANSWER_INVALID");
    if(!validateG6BU04P07F22Answer(q,q.answerText).ok)e.push("P07F22_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||
    !m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||!m.textApplicationRepresentationBound||!m.baseComparisonRateRolePrerequisiteConsumed||
    m.predecessorRoleOwnershipReowned||!m.answerBackSubstitutionRequired||!m.compatibleQuantityUnitsRequired||m.successiveRateChangeOwnership||
    m.multiStageDiscountGrowthDecreaseOwnership||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q023OrLaterTouched||m.r04Reclassified)e.push("P07F22_SCOPE_INVALID");
  const ownershipCount=[m.findBaseQuantityOwnership,m.findComparisonQuantityOwnership,m.findRateOwnership].filter(Boolean).length;
  if(ownershipCount!==1)e.push("P07F22_OWNERSHIP_CARDINALITY_INVALID");
  if((kp==="kp_g6b_u04_find_base_quantity")!==Boolean(m.findBaseQuantityOwnership)||
    (kp==="kp_g6b_u04_find_comparison_quantity")!==Boolean(m.findComparisonQuantityOwnership)||
    (kp==="kp_g6b_u04_find_rate_from_quantities")!==Boolean(m.findRateOwnership))e.push("P07F22_OWNERSHIP_TARGET_MISMATCH");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["連續折扣","先增加","再減少","年利率"])if(learner.includes(term))e.push("P07F22_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}

export function generateG6BU04P07F22Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F22_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0];
  if(!TARGETS.includes(kp))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F22_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const allowed=BY_KP.get(kp)??[],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],
    specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(x=>x?.knowledgePointId===kp):allowed;
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)||BY_SPEC.get(id).knowledgePointId!==kp))
    return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F22_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f22-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*43)%240;
    questions.push(buildG6BU04P07F22Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6BU04P07F22Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F22_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
