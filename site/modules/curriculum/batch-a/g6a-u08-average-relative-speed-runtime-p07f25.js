import {
  G6A_U08_P07F25_AVERAGE_KP_ID as AVG_KP,
  G6A_U08_P07F25_AVERAGE_MODIFIER_IDS as AVG_MODS,
  G6A_U08_P07F25_AVERAGE_SPEC_IDS as AVG_SPEC_IDS,
  G6A_U08_P07F25_FORMAL_MAPPINGS as MAPPINGS,
  G6A_U08_P07F25_PATTERN_GROUPS as GROUPS,
  G6A_U08_P07F25_PATTERN_SPECS as SPECS,
  G6A_U08_P07F25_RELATIVE_KP_ID as REL_KP,
  G6A_U08_P07F25_RELATIVE_MODIFIER_IDS as REL_MODS,
  G6A_U08_P07F25_RELATIVE_SPEC_IDS as REL_SPEC_IDS,
  G6A_U08_P07F25_SOURCE_ID as SRC
} from "../registry/g6a-u08-average-relative-speed-selector-projection-p07f25.js";

export const G6A_U08_P07F25_MAX_QUESTION_COUNT=240;
export const G6A_U08_P07F25_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x])),GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x])),
  MAP_BY_KP=new Map(MAPPINGS.map(x=>[x.knowledgePointId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const AVG_CONTEXTS=Object.freeze(["一輛遊覽車","一台接駁車","一列區間車","一位自行車手","一台配送車","一艘觀光船"]);
const MEET_CONTEXTS=Object.freeze([["甲車","乙車"],["小明","小華"],["A車","B車"],["兩台接駁車","兩台巡檢車"],["兩位自行車手","兩位跑者"]]);
const CHASE_CONTEXTS=Object.freeze([["甲車","乙車"],["哥哥","弟弟"],["快車","慢車"],["巡檢車","工程車"],["自行車手甲","自行車手乙"]]);

function averagePayload(v){
  const u=mod(v,240),averageSpeed=30+(u%60),delta=1+(Math.floor(u/60)%4),speed1=averageSpeed-2*delta,speed2=averageSpeed+delta,
    time1=1,time2=2,distance1=speed1*time1,distance2=speed2*time2,totalDistance=distance1+distance2,totalTime=time1+time2,
    arithmeticMean=(speed1+speed2)/2,context=AVG_CONTEXTS[u%AVG_CONTEXTS.length],
    promptText=context+"第一段以 "+speed1+" 公里/小時行駛 "+time1+" 小時，第二段以 "+speed2+" 公里/小時行駛 "+time2+" 小時。全程平均速率是多少公里/小時？";
  return Object.freeze({variant:u,targetKind:"AVERAGE_SPEED",semanticCore:"SOLVE_AVERAGE_SPEED_FROM_TOTAL_DISTANCE_AND_TOTAL_TIME",context,
    distanceUnit:"公里",timeUnit:"小時",speedUnit:"公里/小時",speed1,time1,distance1,speed2,time2,distance2,totalDistance,totalTime,averageSpeed,
    directSegmentSpeedArithmeticMean:arithmeticMean,promptText,answerText:String(averageSpeed),answerValue:averageSpeed,answerKind:"SPEED",
    totalDistanceOverTotalTimeVerified:totalDistance===averageSpeed*totalTime,directSegmentSpeedArithmeticMeanRejected:Math.abs(arithmeticMean-averageSpeed)>1e-9,
    compatibleUnitsVerified:true,quantitySemanticRolesVerified:true,answerBackSubstitutionVerified:true,sourceVisualExactText:false,sourceBackedRelationFamily:true});
}
function meetingPayload(v){
  const u=mod(v,240),speed1=20+(u%20),speed2=25+(Math.floor(u/20)%12),time=1+((u*7)%5),relativeSpeed=speed1+speed2,
    initialDistance=relativeSpeed*time,names=MEET_CONTEXTS[u%MEET_CONTEXTS.length],
    promptText=names[0]+"和"+names[1]+"相距 "+initialDistance+" 公里，同時相向而行，速率分別是 "+speed1+" 公里/小時和 "+speed2+" 公里/小時。幾小時後相遇？";
  return Object.freeze({variant:u,targetKind:"MEETING_TIME",semanticCore:"SOLVE_MEETING_CHASING_BY_RELATIVE_SPEED",relativeKind:"MEETING",
    actor1:names[0],actor2:names[1],distanceUnit:"公里",timeUnit:"小時",speedUnit:"公里/小時",speed1,speed2,relativeSpeed,initialDistance,time,
    promptText,answerText:String(time),answerValue:time,answerKind:"TIME",meetingSpeedSumVerified:relativeSpeed===speed1+speed2,
    relationVerified:initialDistance===relativeSpeed*time,compatibleUnitsVerified:true,quantitySemanticRolesVerified:true,answerBackSubstitutionVerified:true,
    sourceVisualExactText:false,sourceBackedRelationFamily:true});
}
function chasingPayload(v){
  const u=mod(v,240),slowSpeed=20+(u%20),difference=5+(Math.floor(u/20)%12),fastSpeed=slowSpeed+difference,time=1+((u*5)%6),
    leadDistance=difference*time,names=CHASE_CONTEXTS[u%CHASE_CONTEXTS.length],
    promptText=names[1]+"先行，領先 "+leadDistance+" 公里；"+names[0]+"和"+names[1]+"之後同方向前進，速率分別是 "+fastSpeed+" 公里/小時和 "+slowSpeed+" 公里/小時。"+names[0]+"幾小時後追上"+names[1]+"？";
  return Object.freeze({variant:u,targetKind:"CHASING_TIME",semanticCore:"SOLVE_MEETING_CHASING_BY_RELATIVE_SPEED",relativeKind:"CHASING",
    fasterActor:names[0],slowerActor:names[1],distanceUnit:"公里",timeUnit:"小時",speedUnit:"公里/小時",fastSpeed,slowSpeed,
    relativeSpeed:difference,leadDistance,time,promptText,answerText:String(time),answerValue:time,answerKind:"TIME",
    chasingSpeedDifferenceVerified:difference===fastSpeed-slowSpeed&&difference>0,relationVerified:leadDistance===difference*time,
    compatibleUnitsVerified:true,quantitySemanticRolesVerified:true,answerBackSubstitutionVerified:true,sourceVisualExactText:false,sourceBackedRelationFamily:true});
}
function payload(spec,v){
  if(spec.knowledgePointId===AVG_KP)return averagePayload(v);
  return spec.relativeKind==="MEETING"?meetingPayload(v):chasingPayload(v);
}
const normalize=x=>String(x??"").replace(/\s+/g,"").trim();
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU08P07F25Question(o={}){
  const patternSpecId=o.patternSpecId??AVG_SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const kp=spec.knowledgePointId,p=payload(spec,o.variant??0),group=GROUP_BY_KP.get(kp),mapping=MAP_BY_KP.get(kp),mods=kp===AVG_KP?AVG_MODS:REL_MODS;
  const q={id:"p07f25-"+(SPECS.findIndex(x=>x.patternSpecId===patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f25-"+(SPECS.findIndex(x=>x.patternSpecId===patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,supportingSourceNodeIds:Object.freeze(["g6b_u02_6b02"]),knowledgePointId:kp,patternGroupId:group.patternGroupId,patternSpecId,
    relation:spec.relation,questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,
    displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answerValue,patternRepresentation:p,formalMappingId:mapping.mappingId,
    generationSeed:o.generationSeed??"p07f25-public",
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice025Implementation",authority:mapping.semanticAuthority,r02EvidencePages:mapping.r02EvidencePages,
      sharedRuntimeScope:G6A_U08_P07F25_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_speed_rate",classificationRuleId:"rule_speed_rate",
      appliedRuntimeModifierIds:mods,speedRateReasoningBound:true,ratioRateValidatorBound:true,quantityDimensionUnitIdentityBound:true,
      textApplicationRepresentationBound:true,quantitySemanticRoleBindingBound:true,relationModelBindingBound:kp===REL_KP,wordProblemSemanticValidationBound:kp===REL_KP,
      averageSpeedOwnership:kp===AVG_KP,relativeSpeedMeetingChasingOwnership:kp===REL_KP,totalDistanceOverTotalTimeRequired:kp===AVG_KP,
      directSegmentSpeedArithmeticMeanAllowed:false,meetingUsesSpeedSumRequired:kp===REL_KP,chasingUsesPositiveSpeedDifferenceRequired:kp===REL_KP,
      answerBackSubstitutionRequired:true,speedUnitConversionOwnership:false,effectiveSpeedCurrentWindOwnership:false,predecessorSpeedRelationReowned:false,
      sameUnitMixedUsed:false,crossUnitMixedUsed:false,q026Touched:false,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU08P07F25Answer(q,submitted){
  const e=[],actual=normalize(submitted),expected=normalize(q?.answerText);
  if(!actual)e.push("P07F25_ANSWER_EMPTY");else if(!/^\d+$/.test(actual)||Number(actual)<=0)e.push("P07F25_ANSWER_NOT_POSITIVE_INTEGER");else if(actual!==expected)e.push("P07F25_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual||null});
}
export function validateG6AU08P07F25Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P07F25_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F25_SOURCE_INVALID");
  if(!spec||q?.knowledgePointId!==spec.knowledgePointId)e.push("P07F25_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F25_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F25_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F25_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F25_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(spec.knowledgePointId===AVG_KP){
      if(p.totalDistance!==p.distance1+p.distance2||p.totalTime!==p.time1+p.time2||p.totalDistance!==p.averageSpeed*p.totalTime||
        !p.totalDistanceOverTotalTimeVerified||!p.directSegmentSpeedArithmeticMeanRejected||Math.abs(p.directSegmentSpeedArithmeticMean-p.averageSpeed)<1e-9||
        !p.compatibleUnitsVerified||!p.quantitySemanticRolesVerified||!p.answerBackSubstitutionVerified)e.push("P07F25_AVERAGE_INVARIANT_INVALID");
      if(Number(q.answerText)!==p.averageSpeed)e.push("P07F25_AVERAGE_ANSWER_INVALID");
    }else if(spec.relativeKind==="MEETING"){
      if(p.relativeSpeed!==p.speed1+p.speed2||p.initialDistance!==p.relativeSpeed*p.time||!p.meetingSpeedSumVerified||!p.relationVerified||
        !p.compatibleUnitsVerified||!p.quantitySemanticRolesVerified||!p.answerBackSubstitutionVerified)e.push("P07F25_MEETING_INVARIANT_INVALID");
      if(Number(q.answerText)!==p.time)e.push("P07F25_MEETING_ANSWER_INVALID");
    }else{
      if(p.relativeSpeed!==p.fastSpeed-p.slowSpeed||p.relativeSpeed<=0||p.leadDistance!==p.relativeSpeed*p.time||!p.chasingSpeedDifferenceVerified||!p.relationVerified||
        !p.compatibleUnitsVerified||!p.quantitySemanticRolesVerified||!p.answerBackSubstitutionVerified)e.push("P07F25_CHASING_INVARIANT_INVALID");
      if(Number(q.answerText)!==p.time)e.push("P07F25_CHASING_ANSWER_INVALID");
    }
    if(!validateG6AU08P07F25Answer(q,q.answerText).ok)e.push("P07F25_SELF_ANSWER_INVALID");
  }
  const isAvg=q?.knowledgePointId===AVG_KP,isRel=q?.knowledgePointId===REL_KP;
  if(m.frozenRuntimeProfile!=="profile_speed_rate"||m.classificationRuleId!=="rule_speed_rate"||!m.speedRateReasoningBound||!m.ratioRateValidatorBound||
    !m.quantityDimensionUnitIdentityBound||!m.textApplicationRepresentationBound||!m.quantitySemanticRoleBindingBound||
    m.averageSpeedOwnership!==isAvg||m.relativeSpeedMeetingChasingOwnership!==isRel||m.totalDistanceOverTotalTimeRequired!==isAvg||
    m.directSegmentSpeedArithmeticMeanAllowed||m.meetingUsesSpeedSumRequired!==isRel||m.chasingUsesPositiveSpeedDifferenceRequired!==isRel||
    !m.answerBackSubstitutionRequired||m.speedUnitConversionOwnership||m.effectiveSpeedCurrentWindOwnership||m.predecessorSpeedRelationReowned||
    m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q026Touched||m.r04Reclassified)e.push("P07F25_SCOPE_INVALID");
  if(isRel&&(!m.relationModelBindingBound||!m.wordProblemSemanticValidationBound))e.push("P07F25_RELATIVE_CAPABILITY_BINDING_INVALID");
  if(isAvg&&(m.relationModelBindingBound||m.wordProblemSemanticValidationBound))e.push("P07F25_AVERAGE_CAPABILITY_BINDING_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["順流","逆流","風速","換算成"])if(learner.includes(term))e.push("P07F25_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU08P07F25Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F25_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],validKp=kp===AVG_KP||kp===REL_KP;
  if(!validKp)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F25_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const allowedIds=kp===AVG_KP?AVG_SPEC_IDS:REL_SPEC_IDS,requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],
    chosenIds=requested.length?requested:allowedIds,specs=chosenIds.map(id=>BY_SPEC.get(id)).filter(x=>x?.knowledgePointId===kp);
  if(!specs.length||chosenIds.length!==specs.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F25_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const globalIndex=SPECS.findIndex(x=>x.patternSpecId===spec.patternSpecId),variant=(hash(o.generationSeed??"p07f25-public")+n+globalIndex*83)%240;
    questions.push(buildG6AU08P07F25Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6AU08P07F25Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F25_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
