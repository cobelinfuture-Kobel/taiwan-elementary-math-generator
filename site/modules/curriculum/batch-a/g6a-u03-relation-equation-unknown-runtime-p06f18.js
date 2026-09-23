import {G6A_U03_P06F18_FORMAL_MAPPING as MAPPING,G6A_U03_P06F18_KP_ID as KP,G6A_U03_P06F18_PATTERN_GROUP as GROUP,G6A_U03_P06F18_PATTERN_SPECS as SPECS,G6A_U03_P06F18_SOURCE_ID as SRC,G6A_U03_P06F18_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u03-relation-equation-unknown-selector-projection-p06f18.js";
export const G6A_U03_P06F18_MAX_QUESTION_COUNT=240;
export const G6A_U03_P06F18_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function additivePayload(v){
  const u=mod(v,240),unknown=3+(u%40),operand=1+Math.floor(u/40),total=unknown+operand,answer=unknown;
  const equation="□ + "+operand+" = "+total;
  const promptText="關係式「"+equation+"」中的 □ 是未知量。請依關係式反向運算求出 □，再代回原式確認。□ = ？";
  return Object.freeze({variant:u,semanticCore:"RELATION_EQUATION_UNKNOWN_SOLVING",operation:"ADD",unknown,operand,total,equation,reverseOperation:"SUBTRACT_OPERAND_FROM_TOTAL",substitutionCheck:unknown+operand===total,answer,promptText});
}
function multiplicativePayload(v){
  const u=mod(v,240),unknown=2+(u%40),factor=2+Math.floor(u/40),total=unknown*factor,answer=unknown;
  const equation=factor+" × □ = "+total;
  const promptText="關係式「"+equation+"」中的 □ 是未知量。請依關係式反向運算求出 □，再代回原式確認。□ = ？";
  return Object.freeze({variant:u,semanticCore:"RELATION_EQUATION_UNKNOWN_SOLVING",operation:"MULTIPLY",unknown,factor,total,equation,reverseOperation:"DIVIDE_TOTAL_BY_FACTOR",substitutionCheck:factor*unknown===total,answer,promptText});
}
function payload(spec,v){if(spec.operation==="ADD")return additivePayload(v);if(spec.operation==="MULTIPLY")return multiplicativePayload(v);return null;}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU03P06F18Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0),answerText=String(p.answer);
  const q={id:"p06f18-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p06f18-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,validatorRelation:spec.validatorRelation,questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+answerText,answerText,answerValue:p.answer,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p06f18-public",metadata:Object.freeze({taskId:"P06F_W6DirectProductVerticalSlice018Implementation",authority:"Q018_R02_FULL_PAGE_VISUAL_READBACK_REUSED_FROM_Q015_Q017",sourcePages:MAPPING.sourcePages,sharedRuntimeScope:G6A_U03_P06F18_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_pattern_relation",patternSequenceReasoningCapabilityBound:true,patternRelationValidatorUsed:true,textNumericRepresentationUsed:true,reverseOperationUsed:true,substitutionBackValidated:true,originalRelationSatisfied:true,symbolicRelationReasoningPromotedToRequired:false,symbolicRelationReasoningOptionalSupport:true,genericSymbolicQuantityRelationReowned:false,geometricCountGeneralizationReowned:false,inputOutputGeneralRuleReowned:false,linearPatternNthTermReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q019OrLaterTouched:false,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU03P06F18Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isInteger(n))e.push("P06F18_ANSWER_NOT_INTEGER");
  if(Number.isInteger(n)&&n!==q?.answerValue)e.push("P06F18_ANSWER_RELATION_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)?n:null});
}
export function validateG6AU03P06F18Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P06F18_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P06F18_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P06F18_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P06F18_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P06F18_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P06F18_RELATION_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerValue!==expected.answer||q.answerText!==String(expected.answer)||q.questionSignature!==signature(q))e.push("P06F18_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(spec.operation==="ADD"&&(p.unknown+p.operand!==p.total||p.answer!==p.total-p.operand||p.reverseOperation!=="SUBTRACT_OPERAND_FROM_TOTAL"))e.push("P06F18_ADDITIVE_REVERSE_OPERATION_INVALID");
    if(spec.operation==="MULTIPLY"&&(p.factor*p.unknown!==p.total||p.answer!==p.total/p.factor||p.reverseOperation!=="DIVIDE_TOTAL_BY_FACTOR"))e.push("P06F18_MULTIPLICATIVE_REVERSE_OPERATION_INVALID");
    if(p.substitutionCheck!==true)e.push("P06F18_SUBSTITUTION_CHECK_INVALID");
    if(!validateG6AU03P06F18Answer(q,q.answerValue).ok)e.push("P06F18_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_pattern_relation"||!m.patternSequenceReasoningCapabilityBound||!m.patternRelationValidatorUsed||!m.textNumericRepresentationUsed||!m.reverseOperationUsed||!m.substitutionBackValidated||!m.originalRelationSatisfied||m.symbolicRelationReasoningPromotedToRequired||!m.symbolicRelationReasoningOptionalSupport||m.genericSymbolicQuantityRelationReowned||m.geometricCountGeneralizationReowned||m.inputOutputGeneralRuleReowned||m.linearPatternNthTermReowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q019OrLaterTouched||m.r04Reclassified)e.push("P06F18_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU03P06F18Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F18_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F18_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F18_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p06f18-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*97)%240;questions.push(buildG6AU03P06F18Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU03P06F18Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P06F18_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
