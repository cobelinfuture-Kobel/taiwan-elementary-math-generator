import {
  G6B_U05_P07F20_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U05_P07F20_FORMAL_MAPPING as MAPPING,
  G6B_U05_P07F20_KP_ID as KP,
  G6B_U05_P07F20_PATTERN_GROUP as GROUP,
  G6B_U05_P07F20_PATTERN_SPECS as SPECS,
  G6B_U05_P07F20_SOURCE_ID as SRC,
  G6B_U05_P07F20_SPEC_IDS as SPEC_IDS
} from "../registry/g6b-u05-work-distribution-selector-projection-p07f20.js";
export const G6B_U05_P07F20_MAX_QUESTION_COUNT=240;
export const G6B_U05_P07F20_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function boatPayload(u){
  if(u===0)return Object.freeze({
    variant:0,family:"BOAT_CAPACITY_DISTRIBUTION",highCapacity:15,lowCapacity:8,totalUnits:7,highCount:5,lowCount:2,weightedTotal:91,
    answer:5,answerText:"5",sourceParameterCarrier:"SOURCE_PAGE2_BOAT_15_8_91_7_EXACT",sourceVisualExactNumericCarrier:true,
    conditionsBound:true,totalCountBackSubstitution:true,weightedTotalBackSubstitution:true,promptText:"遊艇公司有15人座和8人座兩種快艇。旅行團有91人，共租7艘，而且剛好坐滿。15人座快艇租了幾艘？"
  });
  const totalUnits=6+(u%20),lowCapacity=6+Math.floor(u/20),gap=3+((u*7)%8),highCapacity=lowCapacity+gap;
  const highCount=1+((u*5+3)%(totalUnits-1)),lowCount=totalUnits-highCount,weightedTotal=highCapacity*highCount+lowCapacity*lowCount;
  return Object.freeze({variant:u,family:"BOAT_CAPACITY_DISTRIBUTION",highCapacity,lowCapacity,totalUnits,highCount,lowCount,weightedTotal,
    answer:highCount,answerText:String(highCount),sourceParameterCarrier:"CONTROLLED_BOAT_DISTRIBUTION_VARIANT",sourceVisualExactNumericCarrier:false,
    conditionsBound:true,totalCountBackSubstitution:highCount+lowCount===totalUnits,weightedTotalBackSubstitution:highCapacity*highCount+lowCapacity*lowCount===weightedTotal,
    promptText:"遊艇公司有"+highCapacity+"人座和"+lowCapacity+"人座兩種快艇。旅行團有"+weightedTotal+"人，共租"+totalUnits+"艘，而且剛好坐滿。"+highCapacity+"人座快艇租了幾艘？"});
}
function transportPayload(u){
  if(u===0)return Object.freeze({
    variant:0,family:"TRANSPORT_COST_DISTRIBUTION",highFare:1500,lowFare:495,totalTrips:8,highTrips:5,lowTrips:3,totalCost:8985,
    answer:5,answerText:"5",sourceParameterCarrier:"SOURCE_PAGE2_TRANSPORT_1500_495_8_8985_EXACT",sourceVisualExactNumericCarrier:true,
    conditionsBound:true,totalTripsBackSubstitution:true,totalCostBackSubstitution:true,promptText:"琳怡往返兩市共搭車8趟，高速列車每趟1500元，火車每趟495元，總費用8985元。她搭高速列車幾趟？"
  });
  const totalTrips=6+(u%20),lowFare=300+25*Math.floor(u/20),fareGap=350+25*((u*3)%10),highFare=lowFare+fareGap;
  const highTrips=1+((u*7+1)%(totalTrips-1)),lowTrips=totalTrips-highTrips,totalCost=highFare*highTrips+lowFare*lowTrips;
  return Object.freeze({variant:u,family:"TRANSPORT_COST_DISTRIBUTION",highFare,lowFare,totalTrips,highTrips,lowTrips,totalCost,
    answer:highTrips,answerText:String(highTrips),sourceParameterCarrier:"CONTROLLED_TRANSPORT_DISTRIBUTION_VARIANT",sourceVisualExactNumericCarrier:false,
    conditionsBound:true,totalTripsBackSubstitution:highTrips+lowTrips===totalTrips,totalCostBackSubstitution:highFare*highTrips+lowFare*lowTrips===totalCost,
    promptText:"某人往返兩市共搭車"+totalTrips+"趟，高速列車每趟"+highFare+"元，火車每趟"+lowFare+"元，總費用"+totalCost+"元。她搭高速列車幾趟？"});
}
function pricePayload(u){
  if(u===0)return Object.freeze({
    variant:0,family:"AFFINE_PRICE_COMPOSITE_PURCHASE",multiplier:9,offset:5,basePrice:18,highPrice:157,priceDifference:139,highQuantity:2,baseQuantity:3,totalPurchase:368,
    answer:368,answerText:"368",sourceParameterCarrier:"SOURCE_PAGE2_PEN_9X_MINUS5_DIFF139_Q2_Q3_EXACT",sourceVisualExactNumericCarrier:true,
    conditionsBound:true,affineRelationBackSubstitution:true,differenceBackSubstitution:true,purchaseTotalBackSubstitution:true,
    promptText:"一枝麥克筆的價錢是一枝中性筆的9倍少5元，而且麥克筆比中性筆貴139元。買2枝麥克筆和3枝中性筆共要付幾元？"
  });
  const basePrice=12+u,multiplier=3+(u%7),offset=2+(u%9),highPrice=multiplier*basePrice-offset,priceDifference=highPrice-basePrice;
  const highQuantity=1+(u%4),baseQuantity=2+((u*3)%5),totalPurchase=highQuantity*highPrice+baseQuantity*basePrice;
  return Object.freeze({variant:u,family:"AFFINE_PRICE_COMPOSITE_PURCHASE",multiplier,offset,basePrice,highPrice,priceDifference,highQuantity,baseQuantity,totalPurchase,
    answer:totalPurchase,answerText:String(totalPurchase),sourceParameterCarrier:"CONTROLLED_AFFINE_PRICE_VARIANT",sourceVisualExactNumericCarrier:false,
    conditionsBound:true,affineRelationBackSubstitution:highPrice===multiplier*basePrice-offset,differenceBackSubstitution:highPrice-basePrice===priceDifference,
    purchaseTotalBackSubstitution:highQuantity*highPrice+baseQuantity*basePrice===totalPurchase,
    promptText:"一枝麥克筆的價錢是一枝中性筆的"+multiplier+"倍少"+offset+"元，而且麥克筆比中性筆貴"+priceDifference+"元。買"+highQuantity+"枝麥克筆和"+baseQuantity+"枝中性筆共要付幾元？"});
}
function payload(spec,v){
  const u=mod(v,240);
  if(spec.patternFamilyId==="BOAT_CAPACITY_DISTRIBUTION")return boatPayload(u);
  if(spec.patternFamilyId==="TRANSPORT_COST_DISTRIBUTION")return transportPayload(u);
  return pricePayload(u);
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6BU05P07F20Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f20-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f20-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,
    patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f20-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice020Implementation",authority:MAPPING.authority,sharedRuntimeScope:G6B_U05_P07F20_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_factor_multiple",classificationRuleId:"rule_factor_multiple",appliedRuntimeModifierIds:MODIFIERS,
      patternFactorCollisionPolicy:"EXPLICIT_PATTERN_RELATION_OVERRIDES_FACTOR_MULTIPLE",factorMultipleProfileRuntimeEnvelopeOnly:true,
      factorMultipleReasoningBound:true,factorMultipleValidatorBound:true,integerDivisionClosureConsumed:true,textNumericRepresentationBound:true,
      mixedOperationOrderPrerequisiteConsumed:true,differenceMultiplePrerequisiteConsumed:true,sumMultiplePrerequisiteConsumed:true,
      priorKnowledgePointOwnershipReowned:false,workDistributionStrategyOwned:true,multipleConditionsBound:true,allConditionsBackSubstituted:true,
      sumDifferenceProblemReowned:false,sumMultipleProblemReowned:false,differenceMultipleProblemReowned:false,ageOrRepeatedRelationProblemReowned:false,
      pureCombinatoricsUsed:false,routeCountingUsed:false,genericApplicationOverlayUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,
      q021OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6BU05P07F20Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isInteger(n)||n<=0)e.push("P07F20_ANSWER_NOT_POSITIVE_INTEGER");
  else if(n!==q?.answerValue)e.push("P07F20_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)&&n>0?n:null});
}
export function validateG6BU05P07F20Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P07F20_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F20_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F20_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F20_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F20_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F20_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.answerValue!==expected.answer||q.questionSignature!==signature(q))e.push("P07F20_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!p.conditionsBound)e.push("P07F20_CONDITIONS_NOT_BOUND");
    if(spec.patternFamilyId==="BOAT_CAPACITY_DISTRIBUTION"){
      if(!Number.isInteger(p.highCount)||!Number.isInteger(p.lowCount)||p.highCount<=0||p.lowCount<=0||p.highCapacity<=p.lowCapacity||
        p.highCount+p.lowCount!==p.totalUnits||p.highCapacity*p.highCount+p.lowCapacity*p.lowCount!==p.weightedTotal||
        !p.totalCountBackSubstitution||!p.weightedTotalBackSubstitution||p.answer!==p.highCount)e.push("P07F20_BOAT_MODEL_INVALID");
    }else if(spec.patternFamilyId==="TRANSPORT_COST_DISTRIBUTION"){
      if(!Number.isInteger(p.highTrips)||!Number.isInteger(p.lowTrips)||p.highTrips<=0||p.lowTrips<=0||p.highFare<=p.lowFare||
        p.highTrips+p.lowTrips!==p.totalTrips||p.highFare*p.highTrips+p.lowFare*p.lowTrips!==p.totalCost||
        !p.totalTripsBackSubstitution||!p.totalCostBackSubstitution||p.answer!==p.highTrips)e.push("P07F20_TRANSPORT_MODEL_INVALID");
    }else{
      if(!Number.isInteger(p.basePrice)||!Number.isInteger(p.highPrice)||p.basePrice<=0||p.highPrice<=p.basePrice||p.multiplier<2||p.offset<=0||
        p.highPrice!==p.multiplier*p.basePrice-p.offset||p.highPrice-p.basePrice!==p.priceDifference||
        p.totalPurchase!==p.highQuantity*p.highPrice+p.baseQuantity*p.basePrice||!p.affineRelationBackSubstitution||!p.differenceBackSubstitution||
        !p.purchaseTotalBackSubstitution||p.answer!==p.totalPurchase)e.push("P07F20_AFFINE_PRICE_MODEL_INVALID");
    }
    if(!validateG6BU05P07F20Answer(q,q.answerValue).ok)e.push("P07F20_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_factor_multiple"||m.classificationRuleId!=="rule_factor_multiple"||(m.appliedRuntimeModifierIds??[]).length!==0||
    m.patternFactorCollisionPolicy!=="EXPLICIT_PATTERN_RELATION_OVERRIDES_FACTOR_MULTIPLE"||!m.factorMultipleProfileRuntimeEnvelopeOnly||
    !m.factorMultipleReasoningBound||!m.factorMultipleValidatorBound||!m.integerDivisionClosureConsumed||!m.textNumericRepresentationBound||
    !m.mixedOperationOrderPrerequisiteConsumed||!m.differenceMultiplePrerequisiteConsumed||!m.sumMultiplePrerequisiteConsumed||
    m.priorKnowledgePointOwnershipReowned||!m.workDistributionStrategyOwned||!m.multipleConditionsBound||!m.allConditionsBackSubstituted||
    m.sumDifferenceProblemReowned||m.sumMultipleProblemReowned||m.differenceMultipleProblemReowned||m.ageOrRepeatedRelationProblemReowned||
    m.pureCombinatoricsUsed||m.routeCountingUsed||m.genericApplicationOverlayUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q021OrLaterTouched||m.r04Reclassified)e.push("P07F20_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU05P07F20Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F20_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F20_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F20_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f20-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*83)%240;
    questions.push(buildG6BU05P07F20Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6BU05P07F20Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F20_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
