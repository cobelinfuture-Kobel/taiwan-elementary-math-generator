import {
  G6A_U08_P08F22_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U08_P08F22_FORMAL_MAPPING as MAPPING,G6A_U08_P08F22_KP_ID as KP,
  G6A_U08_P08F22_PATTERN_GROUP as GROUP,G6A_U08_P08F22_PATTERN_SPECS as SPECS,G6A_U08_P08F22_SOURCE_ID as SRC,
  G6A_U08_P08F22_SPEC_IDS as SPEC_IDS
} from "../registry/g6a-u08-speed-unit-conversion-selector-projection-p08f22.js";
export const G6A_U08_P08F22_MAX_QUESTION_COUNT=240;
export const G6A_U08_P08F22_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const UNITS=Object.freeze({
  KMH:Object.freeze({id:"KMH",label:"公里/小時",distanceMeters:1000,timeSeconds:3600}),
  MMIN:Object.freeze({id:"MMIN",label:"公尺/分鐘",distanceMeters:1,timeSeconds:60}),
  MPS:Object.freeze({id:"MPS",label:"公尺/秒",distanceMeters:1,timeSeconds:1})
});
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function equivalentRate(sourceValue,sourceUnit,targetValue,targetUnit){
  return sourceValue*sourceUnit.distanceMeters*targetUnit.timeSeconds===targetValue*targetUnit.distanceMeters*sourceUnit.timeSeconds;
}
function targetValueFor(sourceValue,sourceUnit,targetUnit){
  return sourceValue*sourceUnit.distanceMeters*targetUnit.timeSeconds/(targetUnit.distanceMeters*sourceUnit.timeSeconds);
}
function payload(spec,v){
  const variant=mod(v,240),sourceUnit=UNITS[spec.sourceUnitId],targetUnit=UNITS[spec.targetUnitId],
    sourceValue=spec.sourceStep*(variant+1),targetValue=targetValueFor(sourceValue,sourceUnit,targetUnit),
    promptText="將 "+sourceValue+" "+sourceUnit.label+"換算成"+targetUnit.label+"。",
    equalityLeft=sourceValue*sourceUnit.distanceMeters*targetUnit.timeSeconds,
    equalityRight=targetValue*targetUnit.distanceMeters*sourceUnit.timeSeconds;
  return Object.freeze({
    variant,semanticCore:spec.semanticCore,sourceUnitId:sourceUnit.id,targetUnitId:targetUnit.id,sourceUnitLabel:sourceUnit.label,targetUnitLabel:targetUnit.label,
    sourceValue,targetValue,promptText,answerText:String(targetValue),answerWithUnitText:String(targetValue)+" "+targetUnit.label,
    conversionWitness:Object.freeze({sourceDistanceMeters:sourceUnit.distanceMeters,sourceTimeSeconds:sourceUnit.timeSeconds,targetDistanceMeters:targetUnit.distanceMeters,targetTimeSeconds:targetUnit.timeSeconds,equalityLeft,equalityRight}),
    coupledDistanceTimeScalingVerified:true,equivalentRateInvariantVerified:equivalentRate(sourceValue,sourceUnit,targetValue,targetUnit),
    sourceAndTargetRateUnitsVerified:true,answerBackConversionVerified:equivalentRate(sourceValue,sourceUnit,targetValue,targetUnit),
    sourceVisualExactText:false,sourceBackedRelationFamily:true
  });
}
const normalize=x=>String(x??"").replace(/\s+/g,"").trim();
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU08P08F22Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;const p=payload(spec,o.variant??0);
  const q={id:"p08f22-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p08f22-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,supportingSourceNodeIds:Object.freeze(["g6b_u02_6b02"]),knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,
    relation:spec.relation,questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerWithUnitText,
    answerText:p.answerText,answerValue:p.targetValue,answerUnit:p.targetUnitLabel,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p08f22-public",
    metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice022Implementation",authority:MAPPING.semanticAuthority,r02EvidencePages:MAPPING.r02EvidencePages,
      sharedRuntimeScope:G6A_U08_P08F22_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_speed_rate",classificationRuleId:"rule_speed_rate",appliedRuntimeModifierIds:MODIFIERS,
      speedRateReasoningBound:true,ratioRateValidatorBound:true,quantityDimensionUnitIdentityBound:true,textApplicationRepresentationBound:true,
      unitConversionBound:true,mixedUnitNormalizationBound:true,quantitySemanticRoleBindingBound:true,speedUnitConversionOwnership:true,
      coupledDistanceTimeScalingRequired:true,equivalentRateInvariantRequired:true,sourceAndTargetRateUnitsRequired:true,answerBackConversionRequired:true,
      speedDistanceTimeRelationPrerequisiteConsumed:true,speedDistanceTimeRelationTeachingReowned:false,averageSpeedReowned:false,
      relativeSpeedMeetingChasingReowned:false,effectiveSpeedCurrentWindReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,
      finalFrozenW8Slice:true,w8FrozenQueueComplete:true,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU08P08F22Answer(q,submitted){
  const e=[],actual=normalize(submitted),expected=normalize(q?.answerText);
  if(!actual)e.push("P08F22_ANSWER_EMPTY");else if(!/^\d+$/.test(actual)||Number(actual)<=0)e.push("P08F22_ANSWER_NOT_POSITIVE_INTEGER");else if(actual!==expected)e.push("P08F22_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual||null});
}
export function validateG6AU08P08F22Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P08F22_PATTERN_SPEC_INVALID");if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F22_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P08F22_KP_INVALID");if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P08F22_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P08F22_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P08F22_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P08F22_PROMPT_ANSWER_SIGNATURE_INVALID");
    const su=UNITS[p.sourceUnitId],tu=UNITS[p.targetUnitId];
    if(!su||!tu||!Number.isInteger(p.sourceValue)||p.sourceValue<=0||!Number.isInteger(p.targetValue)||p.targetValue<=0||
      !equivalentRate(p.sourceValue,su,p.targetValue,tu)||!p.coupledDistanceTimeScalingVerified||!p.equivalentRateInvariantVerified||
      !p.sourceAndTargetRateUnitsVerified||!p.answerBackConversionVerified)e.push("P08F22_EQUIVALENT_RATE_INVARIANT_INVALID");
    if(Number(q.answerText)!==p.targetValue)e.push("P08F22_TARGET_ANSWER_INVALID");if(!validateG6AU08P08F22Answer(q,q.answerText).ok)e.push("P08F22_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_speed_rate"||m.classificationRuleId!=="rule_speed_rate"||(m.appliedRuntimeModifierIds??[]).join("|")!=="mod_unit_conversion|mod_quantity_relation_semantics"||
    !m.speedRateReasoningBound||!m.ratioRateValidatorBound||!m.quantityDimensionUnitIdentityBound||!m.textApplicationRepresentationBound||
    !m.unitConversionBound||!m.mixedUnitNormalizationBound||!m.quantitySemanticRoleBindingBound||!m.speedUnitConversionOwnership||
    !m.coupledDistanceTimeScalingRequired||!m.equivalentRateInvariantRequired||!m.sourceAndTargetRateUnitsRequired||!m.answerBackConversionRequired||
    !m.speedDistanceTimeRelationPrerequisiteConsumed||m.speedDistanceTimeRelationTeachingReowned||m.averageSpeedReowned||m.relativeSpeedMeetingChasingReowned||
    m.effectiveSpeedCurrentWindReowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||!m.finalFrozenW8Slice||!m.w8FrozenQueueComplete||m.r04Reclassified)e.push("P08F22_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU08P08F22Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F22_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F22_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F22_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p08f22-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*37)%240;
    questions.push(buildG6AU08P08F22Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU08P08F22Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F22_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
