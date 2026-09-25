import {
  G6A_U08_P07F23_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U08_P07F23_FORMAL_MAPPING as MAPPING,
  G6A_U08_P07F23_KP_ID as KP,
  G6A_U08_P07F23_PATTERN_GROUP as GROUP,
  G6A_U08_P07F23_PATTERN_SPECS as SPECS,
  G6A_U08_P07F23_SOURCE_ID as SRC,
  G6A_U08_P07F23_SPEC_IDS as SPEC_IDS
} from "../registry/g6a-u08-speed-distance-time-selector-projection-p07f23.js";
export const G6A_U08_P07F23_MAX_QUESTION_COUNT=240;
export const G6A_U08_P07F23_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const UNIT_FAMILIES=Object.freeze([
  Object.freeze({distanceUnit:"公里",timeUnit:"小時",speedUnit:"公里/小時",speedBase:20,speedSpan:40,timeBase:1,timeSpan:6}),
  Object.freeze({distanceUnit:"公尺",timeUnit:"分鐘",speedUnit:"公尺/分鐘",speedBase:30,speedSpan:50,timeBase:2,timeSpan:8}),
  Object.freeze({distanceUnit:"公尺",timeUnit:"秒",speedUnit:"公尺/秒",speedBase:2,speedSpan:18,timeBase:5,timeSpan:12})
]);
const CONTEXTS=Object.freeze([
  "一輛車","一列火車","一艘船","一台接駁車","一位騎自行車的人","一台搬運車",
  "一台巡檢車","一台配送車","一台電動車","一台工程車","一台遊園車","一台測試車"
]);
function payload(spec,v){
  const u=mod(v,240),family=UNIT_FAMILIES[Math.floor(u/80)%UNIT_FAMILIES.length],context=CONTEXTS[u%CONTEXTS.length];
  const speed=family.speedBase+(u%family.speedSpan),time=family.timeBase+(Math.floor(u/family.speedSpan)%family.timeSpan),distance=speed*time;
  let promptText,answerText,answerKind;
  if(spec.targetKind==="DISTANCE"){
    promptText=context+"以固定速率每"+family.timeUnit.replace("小時","小時").replace("分鐘","分鐘").replace("秒","秒")+"行駛"+speed+family.distanceUnit+"，連續行駛"+time+family.timeUnit+"，共行駛多少"+family.distanceUnit+"？";
    answerText=String(distance);answerKind="DISTANCE";
  }else if(spec.targetKind==="SPEED"){
    promptText=context+"以固定速率行駛"+distance+family.distanceUnit+"，用了"+time+family.timeUnit+"。速率是多少"+family.speedUnit+"？";
    answerText=String(speed);answerKind="SPEED";
  }else{
    promptText=context+"以固定速率"+speed+family.speedUnit+"行駛，共行駛"+distance+family.distanceUnit+"。需要多少"+family.timeUnit+"？";
    answerText=String(time);answerKind="TIME";
  }
  return Object.freeze({
    variant:u,targetKind:spec.targetKind,semanticCore:spec.semanticCore,context,distanceUnit:family.distanceUnit,timeUnit:family.timeUnit,speedUnit:family.speedUnit,
    speed,time,distance,promptText,answerText,answerKind,fixedSpeedContextVerified:true,compatibleUnitsVerified:true,quantitySemanticRolesVerified:true,
    distanceEqualsSpeedTimesTimeVerified:distance===speed*time,answerBackSubstitutionVerified:true,sourceVisualExactText:false,sourceBackedRelationFamily:true
  });
}
const normalize=x=>String(x??"").replace(/\s+/g,"").trim();
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU08P07F23Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f23-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f23-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,supportingSourceNodeIds:Object.freeze(["g6b_u02_6b02"]),knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,
    patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,
    displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:Number(p.answerText),patternRepresentation:p,formalMappingId:MAPPING.mappingId,
    generationSeed:o.generationSeed??"p07f23-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice023Implementation",authority:MAPPING.semanticAuthority,r02EvidencePages:MAPPING.r02EvidencePages,
      sharedRuntimeScope:G6A_U08_P07F23_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_speed_rate",classificationRuleId:"rule_speed_rate",
      appliedRuntimeModifierIds:MODIFIERS,speedRateReasoningBound:true,ratioRateValidatorBound:true,quantityDimensionUnitIdentityBound:true,
      textApplicationRepresentationBound:true,quantitySemanticRoleBindingBound:true,decimalRatePrerequisiteConsumed:true,baseComparisonRateRolePrerequisiteConsumed:true,
      speedDistanceTimeRelationOwnership:true,speedUnitConversionOwnership:false,averageSpeedOwnership:false,relativeSpeedMeetingChasingOwnership:false,
      effectiveSpeedCurrentWindOwnership:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q024OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU08P07F23Answer(q,submitted){
  const e=[],actual=normalize(submitted),expected=normalize(q?.answerText);
  if(!actual)e.push("P07F23_ANSWER_EMPTY");else if(!/^\d+$/.test(actual)||Number(actual)<=0)e.push("P07F23_ANSWER_NOT_POSITIVE_INTEGER");else if(actual!==expected)e.push("P07F23_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual||null});
}
export function validateG6AU08P07F23Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P07F23_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F23_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F23_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F23_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F23_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F23_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F23_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.speed)||p.speed<=0||!Number.isInteger(p.time)||p.time<=0||!Number.isInteger(p.distance)||p.distance<=0||
      p.distance!==p.speed*p.time||!p.fixedSpeedContextVerified||!p.compatibleUnitsVerified||!p.quantitySemanticRolesVerified||
      !p.distanceEqualsSpeedTimesTimeVerified||!p.answerBackSubstitutionVerified)e.push("P07F23_RELATION_INVARIANT_INVALID");
    const expectedAnswer=spec.targetKind==="DISTANCE"?p.distance:spec.targetKind==="SPEED"?p.speed:p.time;
    if(Number(q.answerText)!==expectedAnswer)e.push("P07F23_TARGET_ANSWER_INVALID");
    if(!validateG6AU08P07F23Answer(q,q.answerText).ok)e.push("P07F23_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_speed_rate"||m.classificationRuleId!=="rule_speed_rate"||(m.appliedRuntimeModifierIds??[]).join("|")!=="mod_quantity_relation_semantics"||
    !m.speedRateReasoningBound||!m.ratioRateValidatorBound||!m.quantityDimensionUnitIdentityBound||!m.textApplicationRepresentationBound||
    !m.quantitySemanticRoleBindingBound||!m.decimalRatePrerequisiteConsumed||!m.baseComparisonRateRolePrerequisiteConsumed||!m.speedDistanceTimeRelationOwnership||
    m.speedUnitConversionOwnership||m.averageSpeedOwnership||m.relativeSpeedMeetingChasingOwnership||m.effectiveSpeedCurrentWindOwnership||
    m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q024OrLaterTouched||m.r04Reclassified)e.push("P07F23_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["平均速率","追趕","相遇","順流","逆流","風速","換算成"])if(learner.includes(term))e.push("P07F23_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU08P07F23Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F23_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],
    specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F23_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F23_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f23-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*79)%240;
    questions.push(buildG6AU08P07F23Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6AU08P07F23Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F23_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
