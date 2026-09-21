import {G6A_U05_P07F02_FORMAL_MAPPING as MAPPING,G6A_U05_P07F02_KP_ID as KP,G6A_U05_P07F02_PATTERN_GROUP as GROUP,G6A_U05_P07F02_PATTERN_SPECS as SPECS,G6A_U05_P07F02_SOURCE_ID as SRC,G6A_U05_P07F02_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u05-ratio-value-selector-projection-p07f02.js";
export const G6A_U05_P07F02_MAX_QUESTION_COUNT=240;
export const G6A_U05_P07F02_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function payload(spec,v){
  const u=mod(v,240);
  let a,b,answer,answerText,promptText;
  if(spec.targetKind==="FRACTION"){
    a=2+(u%24);b=31+Math.floor(u/24);answerText=a+"/"+b;answer=answerText;
    promptText="比 "+a+":"+b+" 的比值是多少？（用分數 "+a+"/"+b+" 的形式表示）";
  }else if(spec.targetKind==="INTEGER"){
    b=2+(u%20);const k=1+Math.floor(u/20);a=b*k;answer=k;answerText=String(k);
    promptText="比 "+a+":"+b+" 的比值是多少？";
  }else{
    b=10;a=u+1;answer=a/b;answerText=String(answer);
    promptText="比 "+a+":"+b+" 的比值是多少？（用小數表示）";
  }
  const notation=a+":"+b,fractionExpression=a+"/"+b,quotientValue=a/b;
  return Object.freeze({
    variant:u,
    semanticCore:"RATIO_VALUE_EQUALS_ANTECEDENT_DIVIDED_BY_NONZERO_CONSEQUENT",
    targetKind:spec.targetKind,
    a,b,notation,fractionExpression,quotientValue,
    quotientDirection:"ANTECEDENT_DIVIDED_BY_CONSEQUENT",
    consequentNonzero:b!==0,
    roleOrderPreserved:true,
    answer,answerText,promptText
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU05P07F02Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f02-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p07f02-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,
    relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,
    answerText:p.answerText,answerValue:p.answer,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f02-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice002Implementation",
      authority:"Q002_G6A_U05_R02_PAGE2_PLUS_Q001_CURRENT_FULL_PAGE_VISUAL_READBACK",
      sourcePages:MAPPING.sourcePages,r02EvidencePages:MAPPING.r02EvidencePages,
      sharedRuntimeScope:G6A_U05_P07F02_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:Object.freeze([]),
      ratioPercentReasoningUsed:true,ratioRateValidatorUsed:true,textApplicationRepresentationCapabilityUsed:true,
      q001OrderedRolePrerequisitePreserved:true,ratioValueComputationOwned:true,consequentNonzeroValidated:true,fractionEquivalenceValidated:true,quotientDirectionValidated:true,
      q001RatioNotationReowned:false,equivalentRatioReowned:false,simplestIntegerRatioReowned:false,ratioPartitionApplicationReowned:false,proportionCrossMultiplicationReowned:false,directProportionTableOrGraphUsed:false,percentConversionReowned:false,
      applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q003OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
function parseFraction(v){
  const m=String(v??"").trim().match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
  if(!m)return null;
  const n=Number(m[1]),d=Number(m[2]);if(!Number.isInteger(n)||!Number.isInteger(d)||d===0)return null;
  return {n,d};
}
export function validateG6AU05P07F02Answer(q,submitted){
  const spec=BY_SPEC.get(q?.patternSpecId),e=[];
  if(!spec)return Object.freeze({ok:false,errors:Object.freeze(["P07F02_PATTERN_SPEC_INVALID"]),normalizedAnswer:null});
  const p=q?.patternRepresentation;
  if(spec.targetKind==="FRACTION"){
    const f=parseFraction(submitted);
    if(!f)e.push("P07F02_ANSWER_NOT_FRACTION");
    else if(f.n*p.b!==p.a*f.d)e.push("P07F02_ANSWER_RATIO_VALUE_MISMATCH");
    return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:f?f.n+"/"+f.d:null});
  }
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim());
  if(!Number.isFinite(n))e.push("P07F02_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-p.quotientValue)>1e-12)e.push("P07F02_ANSWER_RATIO_VALUE_MISMATCH");
  if(spec.targetKind==="INTEGER"&&Number.isFinite(n)&&!Number.isInteger(n))e.push("P07F02_ANSWER_NOT_INTEGER");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}
export function validateG6AU05P07F02Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P07F02_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F02_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F02_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F02_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F02_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F02_RATIO_VALUE_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||String(q.answerText)!==String(expected.answerText)||String(q.answerValue)!==String(expected.answer)||q.questionSignature!==signature(q))e.push("P07F02_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.a)||p.a<=0||!Number.isInteger(p.b)||p.b<=0||p.consequentNonzero!==true)e.push("P07F02_DOMAIN_INVALID");
    if(p.notation!==p.a+":"+p.b||p.fractionExpression!==p.a+"/"+p.b||p.quotientDirection!=="ANTECEDENT_DIVIDED_BY_CONSEQUENT"||p.roleOrderPreserved!==true)e.push("P07F02_ORDER_OR_QUOTIENT_DIRECTION_INVALID");
    if(Math.abs(p.quotientValue-p.a/p.b)>1e-12)e.push("P07F02_QUOTIENT_VALUE_INVALID");
    if(!validateG6AU05P07F02Answer(q,q.answerValue).ok)e.push("P07F02_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.ratioPercentReasoningUsed||!m.ratioRateValidatorUsed||!m.textApplicationRepresentationCapabilityUsed||!m.q001OrderedRolePrerequisitePreserved||!m.ratioValueComputationOwned||!m.consequentNonzeroValidated||!m.fractionEquivalenceValidated||!m.quotientDirectionValidated||m.q001RatioNotationReowned||m.equivalentRatioReowned||m.simplestIntegerRatioReowned||m.ratioPartitionApplicationReowned||m.proportionCrossMultiplicationReowned||m.directProportionTableOrGraphUsed||m.percentConversionReowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q003OrLaterTouched||m.r04Reclassified)e.push("P07F02_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU05P07F02Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F02_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F02_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F02_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f02-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*79)%240;questions.push(buildG6AU05P07F02Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU05P07F02Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F02_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
