import {G4A_U07_P06F11_FORMAL_MAPPING as MAPPING,G4A_U07_P06F11_INCLUDED_RELATIONS as RELATIONS,G4A_U07_P06F11_KP_ID as KP,G4A_U07_P06F11_PATTERN_GROUP as GROUP,G4A_U07_P06F11_PATTERN_SPECS as SPECS,G4A_U07_P06F11_SOURCE_ID as SRC,G4A_U07_P06F11_SPEC_IDS as SPEC_IDS} from "../registry/g4a-u07-multiplicative-pattern-selector-projection-p06f11.js";
export const G4A_U07_P06F11_MAX_QUESTION_COUNT=240;
export const G4A_U07_P06F11_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const mod=(n,m)=>((n%m)+m)%m;
function params(v){
  const u=mod(v,240),factor=2+(u%4),direction=Math.floor(u/4)%2===0?"GROW":"SHRINK",base=1+(Math.floor(u/8)%30);
  const terms=direction==="GROW"
    ? Object.freeze([base,base*factor,base*factor**2,base*factor**3])
    : Object.freeze([base*factor**4,base*factor**3,base*factor**2,base*factor]);
  const next=direction==="GROW"?base*factor**4:base;
  return Object.freeze({variant:u,factor,direction,base,terms,next});
}
function payload(spec,v){
  const p=params(v);
  if(spec.relation===RELATIONS[0]){
    const promptText=p.direction==="GROW"
      ? `觀察固定倍數規律：${p.terms.join("、")}。相鄰後項都是前項乘以多少？`
      : `觀察固定倍數規律：${p.terms.join("、")}。相鄰前項都是後項的多少倍？`;
    return Object.freeze({kind:"FIXED_MULTIPLICATIVE_FACTOR_IDENTIFICATION",...p,promptText,answer:p.factor});
  }
  if(spec.relation===RELATIONS[1]){
    const promptText=`依照固定倍數規律：${p.terms.join("、")}。下一個數是多少？`;
    return Object.freeze({kind:"FIXED_MULTIPLICATIVE_SEQUENCE_EXTENSION",...p,promptText,answer:p.next});
  }
  return null;
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText].join("|");
export function buildG4AU07P06F11Question({variant=0,patternSpecId=SPEC_IDS[0],generationSeed="p06f11-public"}={}){
  const spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const v=mod(variant,240),p=payload(spec,v),answerText=String(p.answer);
  const q={id:`p06f11-pattern-${SPEC_IDS.indexOf(patternSpecId)+1}-${v+1}`,generatedItemId:`p06f11-${SPEC_IDS.indexOf(patternSpecId)+1}-${v+1}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:`${p.promptText} ${answerText}`,answerText,answerValue:p.answer,patternRepresentation:p,metadata:Object.freeze({taskId:"P06F_W6DirectProductVerticalSlice011Implementation",authority:"Q011_R02_FULL_PAGE_VISUAL_READBACK_REUSED_FROM_Q005_Q006",sourcePages:MAPPING.sourcePages,sharedRuntimeScope:G4A_U07_P06F11_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_pattern_relation",sourceBackedMultiplicativePattern:true,fixedMultiplicativeFactorCore:true,constantAdjacentRatioUsed:true,multiplicativeGrowthUsed:p.direction==="GROW",multiplicativeShrinkUsed:p.direction==="SHRINK",q005GeometricPatternReowned:false,q005AdditivePatternReowned:false,q006InputOutputTableReowned:false,q013MissingTermReasoningReowned:false,symbolicNthTermFormulaUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q012OrLaterTouched:false,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q),formalMappingId:MAPPING.mappingId,generationSeed});
}
export function validateG4AU07P06F11Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isInteger(n))e.push("P06F11_ANSWER_NOT_INTEGER");
  if(Number.isInteger(n)&&n!==q?.answerValue)e.push("P06F11_ANSWER_RELATION_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)?n:null});
}
export function validateG4AU07P06F11Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P06F11_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P06F11_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P06F11_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P06F11_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P06F11_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P06F11_RELATION_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerValue!==expected.answer||q.answerText!==String(expected.answer)||q.questionSignature!==signature(q))e.push("P06F11_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!validateG4AU07P06F11Answer(q,q.answerValue).ok)e.push("P06F11_SELF_ANSWER_INVALID");
    if(!Array.isArray(p.terms)||p.terms.length!==4||!Number.isInteger(p.factor)||p.factor<2||p.factor>5)e.push("P06F11_MULTIPLICATIVE_DATA_INVALID");
    if(p.direction==="GROW"&&p.terms.some((x,i)=>i>0&&x!==p.terms[i-1]*p.factor))e.push("P06F11_GROWTH_RATIO_INVALID");
    if(p.direction==="SHRINK"&&p.terms.some((x,i)=>i>0&&p.terms[i-1]!==x*p.factor))e.push("P06F11_SHRINK_RATIO_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_pattern_relation"||!m.sourceBackedMultiplicativePattern||!m.fixedMultiplicativeFactorCore||!m.constantAdjacentRatioUsed||m.q005GeometricPatternReowned||m.q005AdditivePatternReowned||m.q006InputOutputTableReowned||m.q013MissingTermReasoningReowned||m.symbolicNthTermFormulaUsed||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q012OrLaterTouched||m.r04Reclassified)e.push("P06F11_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG4AU07P06F11Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F11_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F11_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const v=(hash(o.generationSeed??"p06f11-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*71)%240;
    questions.push(buildG4AU07P06F11Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG4AU07P06F11Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P06F11_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
