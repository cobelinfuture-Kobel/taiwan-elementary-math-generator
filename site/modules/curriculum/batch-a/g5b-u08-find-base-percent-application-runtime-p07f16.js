import {
  G5B_U08_P07F16_APPLICATION_KP_ID as APP_KP,
  G5B_U08_P07F16_APPLIED_MODIFIER_IDS_BY_KP as MODIFIERS_BY_KP,
  G5B_U08_P07F16_FIND_BASE_KP_ID as FIND_KP,
  G5B_U08_P07F16_FORMAL_MAPPINGS as MAPPINGS,
  G5B_U08_P07F16_PATTERN_GROUPS as GROUPS,
  G5B_U08_P07F16_PATTERN_SPECS as SPECS,
  G5B_U08_P07F16_SOURCE_ID as SRC,
  G5B_U08_P07F16_SPEC_IDS_BY_KP as SPEC_IDS_BY_KP,
  G5B_U08_P07F16_TARGET_KP_IDS as KPS
} from "../registry/g5b-u08-find-base-percent-application-selector-projection-p07f16.js";
export const G5B_U08_P07F16_MAX_QUESTION_COUNT=240;
export const G5B_U08_P07F16_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
const MAPPING_BY_KP=new Map(MAPPINGS.map(x=>[x.knowledgePointId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const trim=n=>Number(Number(n).toFixed(2)).toString();
const reverseRates=Object.freeze([1.5,2,2.5,4,5,6.25,10,12.5,15,20,25,30,40,50,60,75]);
function reversePair(v){
  const u=mod(v,240),ratePercent=reverseRates[u%reverseRates.length],m=Math.floor(u/reverseRates.length)+1,baseQuantity=400*m,comparisonQuantity=baseQuantity*ratePercent/100;
  return Object.freeze({variant:u,ratePercent,comparisonQuantity,baseQuantity});
}
function findBaseDirect(v){
  const p=reversePair(v);
  return Object.freeze({...p,targetKind:"BASE_QUANTITY",semanticCore:"FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE",
    promptText:"某批物品中有 "+trim(p.comparisonQuantity)+" 個符合條件，占全部的 "+trim(p.ratePercent)+"%。這批物品原有多少個？",
    answerValue:p.baseQuantity,answerText:String(p.baseQuantity),answerKind:"QUANTITY",
    comparisonDividedByRateVerified:true,reconstructComparisonVerified:true,sourceContext:"GENERIC_REVERSE_BASE_PERCENT",sourceExemplarMatch:false,supplementaryEvidenceCarrier:false});
}
function brokenEggs(v){
  const u=mod(v,240);
  if(u===0)return Object.freeze({variant:0,targetKind:"BASE_QUANTITY",semanticCore:"FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE",
    promptText:"貨車運送雞蛋的途中，不小心打破了 9 顆，占全部的 1.5％，請問原有幾顆雞蛋？",
    answerValue:600,answerText:"600",answerKind:"QUANTITY",ratePercent:1.5,comparisonQuantity:9,baseQuantity:600,
    comparisonDividedByRateVerified:true,reconstructComparisonVerified:true,sourceContext:"SUPPLEMENTARY_GRADE5_EXAM_BROKEN_EGGS",
    sourceExemplarMatch:true,supplementaryEvidenceCarrier:true,sourceParameterCarrier:"SUPPLEMENTARY_EXAM_PAGE1_ITEM15_EXACT"});
  const p=reversePair(u);
  return Object.freeze({...p,targetKind:"BASE_QUANTITY",semanticCore:"FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE",
    promptText:"運送雞蛋途中打破了 "+trim(p.comparisonQuantity)+" 顆，占全部的 "+trim(p.ratePercent)+"％。原有幾顆雞蛋？",
    answerValue:p.baseQuantity,answerText:String(p.baseQuantity),answerKind:"QUANTITY",
    comparisonDividedByRateVerified:true,reconstructComparisonVerified:true,sourceContext:"SUPPLEMENTARY_REVERSE_BASE_FAMILY",
    sourceExemplarMatch:false,supplementaryEvidenceCarrier:true});
}
const discountRates=Object.freeze([5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80]);
function discount(v){
  const u=mod(v,240),rate=discountRates[u%discountRates.length],m=Math.floor(u/discountRates.length)+1,original=400*m,retention=100-rate,newQuantity=original*retention/100;
  return Object.freeze({variant:u,targetKind:"DISCOUNTED_NEW_QUANTITY",semanticCore:"PERCENT_DISCOUNT_INCREASE_APPLICATION",
    promptText:"一件商品定價 "+original+" 元，特價 "+rate+"％ off。售價是多少元？",answerValue:newQuantity,answerText:trim(newQuantity),answerKind:"MONEY",
    originalQuantity:original,percentRate:rate,percentRole:"DISCOUNT_RATE",retentionRatePercent:retention,newQuantity,
    forwardApplicationVerified:true,percentRoleVerified:true,sourceContext:"PRIMARY_SOURCE_DISCOUNT_APPLICATION",sourceExemplarMatch:rate===15});
}
const markupRates=Object.freeze([5,10,15,20,25,30,35,40,45,50,60,75,80,100,125,150]);
function markup(v){
  const u=mod(v,240),rate=markupRates[u%markupRates.length],m=Math.floor(u/markupRates.length)+1,original=400*m,growth=100+rate,newQuantity=original*growth/100;
  return Object.freeze({variant:u,targetKind:"INCREASED_NEW_QUANTITY",semanticCore:"PERCENT_DISCOUNT_INCREASE_APPLICATION",
    promptText:"一件商品成本 "+original+" 元，加成 "+rate+"％ 作為定價。定價是多少元？",answerValue:newQuantity,answerText:trim(newQuantity),answerKind:"MONEY",
    originalQuantity:original,percentRate:rate,percentRole:"INCREASE_RATE",growthRatePercent:growth,newQuantity,
    forwardApplicationVerified:true,percentRoleVerified:true,sourceContext:"PRIMARY_SOURCE_MARKUP_APPLICATION",sourceExemplarMatch:rate===20});
}
const markups=Object.freeze([10,20,30,40,50]),discounts=Object.freeze([5,10,15,20,25,30]);
function markupThenDiscount(v){
  const u=mod(v,240),markupRate=markups[u%markups.length],discountRate=discounts[Math.floor(u/markups.length)%discounts.length],m=Math.floor(u/(markups.length*discounts.length))+1;
  const cost=400*m,listed=cost*(100+markupRate)/100,retention=100-discountRate,sale=listed*retention/100;
  return Object.freeze({variant:u,targetKind:"TWO_STEP_NEW_QUANTITY",semanticCore:"PERCENT_DISCOUNT_INCREASE_APPLICATION",
    promptText:"一件商品成本 "+cost+" 元，先加成 "+markupRate+"％ 作為定價，再依定價 "+discountRate+"％ off 出售。售價是多少元？",
    answerValue:sale,answerText:trim(sale),answerKind:"MONEY",originalQuantity:cost,markupRatePercent:markupRate,growthRatePercent:100+markupRate,intermediateQuantity:listed,
    discountRatePercent:discountRate,retentionRatePercent:retention,newQuantity:sale,percentRole:"MARKUP_THEN_DISCOUNT",
    forwardApplicationVerified:true,percentRoleVerified:true,twoStepOrderVerified:true,sourceContext:"PRIMARY_SOURCE_MARKUP_THEN_DISCOUNT_APPLICATION",sourceExemplarMatch:markupRate===30&&discountRate===15});
}
function payload(spec,v){
  if(spec.patternSpecId==="ps_g5b_u08_find_base_from_comparison_percent")return findBaseDirect(v);
  if(spec.patternSpecId==="ps_g5b_u08_find_base_source_broken_eggs")return brokenEggs(v);
  if(spec.patternSpecId==="ps_g5b_u08_discount_sale_price")return discount(v);
  if(spec.patternSpecId==="ps_g5b_u08_markup_new_price")return markup(v);
  return markupThenDiscount(v);
}
function parseAnswer(value){
  if(typeof value==="number")return Number.isFinite(value)?value:null;
  const s=String(value??"").trim().replace(/元$/,"").replace(/,/g,""),n=Number(s);
  return Number.isFinite(n)?n:null;
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG5BU08P07F16Question(o={}){
  const kp=o.knowledgePointId??FIND_KP,specIds=SPEC_IDS_BY_KP[kp]??[],patternSpecId=o.patternSpecId??specIds[0],spec=BY_SPEC.get(patternSpecId);
  if(!spec||spec.knowledgePointId!==kp)return null;
  const p=payload(spec,o.variant??0),g=GROUP_BY_KP.get(kp),m=MAPPING_BY_KP.get(kp),mods=MODIFIERS_BY_KP[kp]??[];
  const q={id:"p07f16-"+(KPS.indexOf(kp)+1)+"-"+(specIds.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f16-"+(KPS.indexOf(kp)+1)+"-"+(specIds.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:kp,patternGroupId:g.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answerValue,patternRepresentation:p,
    formalMappingId:m.mappingId,generationSeed:o.generationSeed??"p07f16-public",
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice016Implementation",authority:m.semanticAuthority,r02EvidencePages:m.r02EvidencePages,
      primarySourceDirectSupportingPages:m.primarySourceDirectSupportingPages??[],supplementaryEvidenceDriveFileId:m.supplementaryEvidenceDriveFileId??null,supplementaryEvidencePage:m.supplementaryEvidencePage??null,
      sharedRuntimeScope:G5B_U08_P07F16_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:mods,
      ratioPercentReasoningBound:true,ratioRateValidatorBound:true,textApplicationRepresentationBound:true,
      findBaseOwnership:kp===FIND_KP,discountIncreaseApplicationOwnership:kp===APP_KP,
      q008ConversionReowned:false,q013FindRateReowned:false,q013PercentageQuantityReowned:false,genericRatioApplicationReowned:false,sugarWaterRatioAsCoreUsed:false,
      sameUnitMixedUsed:false,crossUnitMixedUsed:false,q017OrLaterTouched:false,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG5BU08P07F16Answer(q,submitted){
  const e=[],actual=parseAnswer(submitted),expected=Number(q?.patternRepresentation?.answerValue);
  if(actual===null)e.push("P07F16_ANSWER_NOT_NUMERIC");else if(Math.abs(actual-expected)>1e-9)e.push("P07F16_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual});
}
export function validateG5BU08P07F16Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P07F16_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F16_SOURCE_INVALID");
  if(!KPS.includes(q?.knowledgePointId)||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F16_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F16_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F16_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F16_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F16_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(q.knowledgePointId===FIND_KP){
      if(!(Number(p.baseQuantity)>0)||!(Number(p.comparisonQuantity)>0)||!(Number(p.ratePercent)>0)||Number(p.ratePercent)>=100)e.push("P07F16_FIND_BASE_DOMAIN_INVALID");
      if(!p.comparisonDividedByRateVerified||Math.abs(Number(p.comparisonQuantity)/(Number(p.ratePercent)/100)-Number(p.baseQuantity))>1e-9)e.push("P07F16_FIND_BASE_INVARIANT_INVALID");
      if(!p.reconstructComparisonVerified||Math.abs(Number(p.baseQuantity)*Number(p.ratePercent)/100-Number(p.comparisonQuantity))>1e-9)e.push("P07F16_FIND_BASE_RECONSTRUCTION_INVALID");
    }else{
      if(!(Number(p.originalQuantity)>0)||!p.forwardApplicationVerified||!p.percentRoleVerified)e.push("P07F16_APPLICATION_DOMAIN_INVALID");
      if(p.targetKind==="DISCOUNTED_NEW_QUANTITY"&&Math.abs(Number(p.originalQuantity)*Number(p.retentionRatePercent)/100-Number(p.newQuantity))>1e-9)e.push("P07F16_DISCOUNT_INVARIANT_INVALID");
      if(p.targetKind==="INCREASED_NEW_QUANTITY"&&Math.abs(Number(p.originalQuantity)*Number(p.growthRatePercent)/100-Number(p.newQuantity))>1e-9)e.push("P07F16_MARKUP_INVARIANT_INVALID");
      if(p.targetKind==="TWO_STEP_NEW_QUANTITY"&&(!p.twoStepOrderVerified||Math.abs(Number(p.originalQuantity)*Number(p.growthRatePercent)/100-Number(p.intermediateQuantity))>1e-9||Math.abs(Number(p.intermediateQuantity)*Number(p.retentionRatePercent)/100-Number(p.newQuantity))>1e-9))e.push("P07F16_TWO_STEP_INVARIANT_INVALID");
    }
    if(!validateG5BU08P07F16Answer(q,q.answerText).ok)e.push("P07F16_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||!m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||!m.textApplicationRepresentationBound||m.q008ConversionReowned||m.q013FindRateReowned||m.q013PercentageQuantityReowned||m.genericRatioApplicationReowned||m.sugarWaterRatioAsCoreUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q017OrLaterTouched||m.r04Reclassified)e.push("P07F16_SCOPE_INVALID");
  if(q?.knowledgePointId===FIND_KP&&(!m.findBaseOwnership||m.discountIncreaseApplicationOwnership||(m.appliedRuntimeModifierIds??[]).length!==0))e.push("P07F16_FIND_BASE_OWNERSHIP_INVALID");
  if(q?.knowledgePointId===APP_KP&&(!m.discountIncreaseApplicationOwnership||m.findBaseOwnership||JSON.stringify(m.appliedRuntimeModifierIds)!==JSON.stringify(["mod_application_semantics"])))e.push("P07F16_APPLICATION_OWNERSHIP_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  if(q?.knowledgePointId===FIND_KP)for(const term of ["加成","定價打","售價"])if(learner.includes(term))e.push("P07F16_FIND_BASE_FORBIDDEN_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG5BU08P07F16Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F16_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0];
  if(!KPS.includes(kp))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F16_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const allIds=SPEC_IDS_BY_KP[kp],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):allIds.map(id=>BY_SPEC.get(id));
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)||BY_SPEC.get(id).knowledgePointId!==kp))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F16_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const variant=(hash(o.generationSeed??"p07f16-public")+n+allIds.indexOf(spec.patternSpecId)*73)%240;questions.push(buildG5BU08P07F16Question({knowledgePointId:kp,patternSpecId:spec.patternSpecId,variant,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG5BU08P07F16Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F16_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
