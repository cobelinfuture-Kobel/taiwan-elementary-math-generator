import {
  G6A_U08_P07F26_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U08_P07F26_FORMAL_MAPPING as MAPPING,
  G6A_U08_P07F26_KP_ID as KP,
  G6A_U08_P07F26_PATTERN_GROUP as GROUP,
  G6A_U08_P07F26_PATTERN_SPECS as SPECS,
  G6A_U08_P07F26_SOURCE_ID as SRC,
  G6A_U08_P07F26_SPEC_IDS as SPEC_IDS
} from "../registry/g6a-u08-effective-speed-current-wind-selector-projection-p07f26.js";

export const G6A_U08_P07F26_MAX_QUESTION_COUNT=240;
export const G6A_U08_P07F26_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const WATER_CONTEXTS=Object.freeze(["一艘觀光船","一艘工作船","一艘渡船","一艘巡邏艇","一艘小船","一艘測量船"]);
const WIND_CONTEXTS=Object.freeze(["一架小型飛機","一架無人機","一艘風帆船","一架滑翔機","一架測量機","一架巡查機"]);
function payload(spec,v){
  const u=mod(v,240),ownSpeed=30+(u%120),externalSpeed=1+(u%10)+(Math.floor(u/120)*10),same=spec.direction==="SAME",
    effectiveSpeed=same?ownSpeed+externalSpeed:ownSpeed-externalSpeed,water=spec.medium==="CURRENT",
    context=(water?WATER_CONTEXTS:WIND_CONTEXTS)[u%6],externalLabel=water?"水流速率":"風速",directionLabel=water?(same?"順流":"逆流"):(same?"順風":"逆風"),
    promptText=context+"本身的速率是 "+ownSpeed+" 公里/小時，"+externalLabel+"是 "+externalSpeed+" 公里/小時。若"+directionLabel+"前進，有效速率是多少公里/小時？";
  return Object.freeze({
    variant:u,targetKind:"EFFECTIVE_SPEED",semanticCore:"SOLVE_EFFECTIVE_SPEED_FROM_OWN_SPEED_AND_CURRENT_OR_WIND",
    context,medium:spec.medium,direction:spec.direction,operation:spec.operation,distanceUnit:"公里",timeUnit:"小時",speedUnit:"公里/小時",
    ownSpeed,externalSpeed,effectiveSpeed,externalLabel,directionLabel,promptText,answerText:String(effectiveSpeed),answerValue:effectiveSpeed,answerKind:"SPEED",
    sameDirectionAdditionVerified:same?effectiveSpeed===ownSpeed+externalSpeed:true,
    oppositeDirectionSubtractionVerified:!same?effectiveSpeed===ownSpeed-externalSpeed:true,
    positiveOpposingEffectiveSpeedVerified:same?true:(ownSpeed>externalSpeed&&effectiveSpeed>0),
    computeEffectiveSpeedVerified:true,compatibleUnitsVerified:true,quantitySemanticRolesVerified:true,answerBackSubstitutionVerified:true,
    sourceVisualExactText:false,sourceBackedRelationFamily:true
  });
}
const normalize=x=>String(x??"").replace(/\s+/g,"").trim();
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU08P07F26Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={id:"p07f26-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f26-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,supportingSourceNodeIds:Object.freeze(["g6b_u02_6b02"]),knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,
    relation:spec.relation,questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,
    displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answerValue,patternRepresentation:p,formalMappingId:MAPPING.mappingId,
    generationSeed:o.generationSeed??"p07f26-public",
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice026Implementation",authority:MAPPING.semanticAuthority,r02EvidencePages:MAPPING.r02EvidencePages,
      sharedRuntimeScope:G6A_U08_P07F26_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_speed_rate",classificationRuleId:"rule_speed_rate",
      appliedRuntimeModifierIds:MODIFIERS,speedRateReasoningBound:true,ratioRateValidatorBound:true,quantityDimensionUnitIdentityBound:true,
      textApplicationRepresentationBound:true,quantitySemanticRoleBindingBound:true,relationModelBindingBound:true,wordProblemSemanticValidationBound:true,
      effectiveSpeedCurrentWindOwnership:true,computeEffectiveSpeedFromOwnAndCurrentWindRequired:true,sameDirectionAdditionRequired:true,
      oppositeDirectionSubtractionRequired:true,positiveOpposingEffectiveSpeedRequired:true,answerBackSubstitutionRequired:true,
      reverseSolveOwnSpeedAllowed:false,reverseSolveCurrentWindSpeedAllowed:false,speedUnitConversionOwnership:false,
      averageSpeedReowned:false,relativeSpeedMeetingChasingReowned:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,
      finalFrozenW7Slice:true,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU08P07F26Answer(q,submitted){
  const e=[],actual=normalize(submitted),expected=normalize(q?.answerText);
  if(!actual)e.push("P07F26_ANSWER_EMPTY");else if(!/^\d+$/.test(actual)||Number(actual)<=0)e.push("P07F26_ANSWER_NOT_POSITIVE_INTEGER");else if(actual!==expected)e.push("P07F26_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:actual||null});
}
export function validateG6AU08P07F26Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,m=q?.metadata??{};
  if(!spec)e.push("P07F26_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F26_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F26_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F26_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F26_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F26_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.questionSignature!==signature(q))e.push("P07F26_PROMPT_ANSWER_SIGNATURE_INVALID");
    const same=spec.direction==="SAME",calculated=same?p.ownSpeed+p.externalSpeed:p.ownSpeed-p.externalSpeed;
    if(p.effectiveSpeed!==calculated||p.effectiveSpeed<=0||!p.computeEffectiveSpeedVerified||!p.compatibleUnitsVerified||
      !p.quantitySemanticRolesVerified||!p.answerBackSubstitutionVerified||!p.sameDirectionAdditionVerified||!p.oppositeDirectionSubtractionVerified||
      !p.positiveOpposingEffectiveSpeedVerified)e.push("P07F26_EFFECTIVE_SPEED_INVARIANT_INVALID");
    if(!same&&!(p.ownSpeed>p.externalSpeed))e.push("P07F26_OPPOSING_SPEED_NONPOSITIVE");
    if(Number(q.answerText)!==p.effectiveSpeed)e.push("P07F26_ANSWER_VALUE_INVALID");
    if(!validateG6AU08P07F26Answer(q,q.answerText).ok)e.push("P07F26_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_speed_rate"||m.classificationRuleId!=="rule_speed_rate"||
    (m.appliedRuntimeModifierIds??[]).join("|")!=="mod_quantity_relation_semantics|mod_application_semantics"||
    !m.speedRateReasoningBound||!m.ratioRateValidatorBound||!m.quantityDimensionUnitIdentityBound||!m.textApplicationRepresentationBound||
    !m.quantitySemanticRoleBindingBound||!m.relationModelBindingBound||!m.wordProblemSemanticValidationBound||!m.effectiveSpeedCurrentWindOwnership||
    !m.computeEffectiveSpeedFromOwnAndCurrentWindRequired||!m.sameDirectionAdditionRequired||!m.oppositeDirectionSubtractionRequired||
    !m.positiveOpposingEffectiveSpeedRequired||!m.answerBackSubstitutionRequired||m.reverseSolveOwnSpeedAllowed||m.reverseSolveCurrentWindSpeedAllowed||
    m.speedUnitConversionOwnership||m.averageSpeedReowned||m.relativeSpeedMeetingChasingReowned||m.sameUnitMixedUsed||m.crossUnitMixedUsed||
    !m.finalFrozenW7Slice||m.r04Reclassified)e.push("P07F26_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU08P07F26Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F26_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],
    specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F26_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F26_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f26-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*61)%240;
    questions.push(buildG6AU08P07F26Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6AU08P07F26Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F26_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
