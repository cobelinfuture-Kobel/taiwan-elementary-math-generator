import {G6A_U05_P07F03_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U05_P07F03_FORMAL_MAPPING as MAPPING,G6A_U05_P07F03_KP_ID as KP,G6A_U05_P07F03_PATTERN_GROUP as GROUP,G6A_U05_P07F03_PATTERN_SPECS as SPECS,G6A_U05_P07F03_SOURCE_ID as SRC,G6A_U05_P07F03_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u05-equivalent-ratio-selector-projection-p07f03.js";
export const G6A_U05_P07F03_MAX_QUESTION_COUNT=240;
export const G6A_U05_P07F03_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function payload(spec,v){
  const u=mod(v,240),a=2+(u%20),b=23+Math.floor(u/20),k=2+((u*7)%11),scaledA=a*k,scaledB=b*k;
  const baseRatio=a+":"+b,scaledRatio=scaledA+":"+scaledB;
  let answer,answerText,promptText,missingSide=null;
  if(spec.targetKind==="FORWARD_SCALE"){
    answer=scaledRatio;answerText=scaledRatio;promptText="比 "+baseRatio+" 的前項和後項同乘 "+k+"，得到的比是？";
  }else if(spec.targetKind==="REVERSE_SCALE"){
    answer=baseRatio;answerText=baseRatio;promptText="比 "+scaledRatio+" 的前項和後項同除以 "+k+"，得到的比是？";
  }else{
    missingSide=u%2===0?"CONSEQUENT":"ANTECEDENT";
    if(missingSide==="CONSEQUENT"){answer=scaledB;answerText=String(scaledB);promptText=baseRatio+" = "+scaledA+":□，□ 應填多少？";}
    else{answer=scaledA;answerText=String(scaledA);promptText=baseRatio+" = □:"+scaledB+"，□ 應填多少？";}
  }
  return Object.freeze({
    variant:u,targetKind:spec.targetKind,semanticCore:"EQUIVALENT_RATIO_PRESERVES_RATIO_VALUE_UNDER_COMMON_NONZERO_SCALE_FACTOR",
    a,b,k,scaledA,scaledB,baseRatio,scaledRatio,missingSide,
    commonScaleFactorAppliedToBothTerms:scaledA===a*k&&scaledB===b*k,
    commonScaleFactorNonzero:k!==0,reverseDivisionExact:scaledA%k===0&&scaledB%k===0,
    ratioValueInvariant:a*scaledB===b*scaledA,
    antecedentConsequentOrderPreserved:true,
    crossProductEqualityInternal:a*scaledB===b*scaledA,
    answer,answerText,promptText
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU05P07F03Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f03-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f03-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.patternFamilyId,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f03-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice003Implementation",authority:"Q003_G6A_U05_R02_PAGE3_PLUS_Q001_CURRENT_FULL_PAGE_VISUAL_READBACK",sourcePages:MAPPING.sourcePages,r02EvidencePages:MAPPING.r02EvidencePages,sharedRuntimeScope:G6A_U05_P07F03_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_integer_operations",classificationRuleId:"rule_integer_operations",appliedRuntimeModifierIds:MODIFIERS,semanticProfileInterpretation:"EXECUTION_ENVELOPE_ONLY_NOT_KNOWLEDGE_POINT_SEMANTIC_OWNER",
      integerDomainValidatorBound:true,textNumericRepresentationBound:true,integerAddSubCapabilityBound:true,integerMultiplicationCapabilityBound:true,
      q001OrderedRolePrerequisitePreserved:true,q002RatioValuePrerequisitePreserved:true,equivalentRatioOwned:true,commonScaleFactorBothTermsValidated:true,commonScaleFactorNonzeroValidated:true,ratioValueInvariantValidated:true,reverseExactDivisionValidated:true,crossProductValidatorInternalOnly:true,crossMultiplicationTaught:false,
      q001RatioNotationReowned:false,q002RatioValueReowned:false,simplestIntegerRatioReowned:false,ratioPartitionApplicationReowned:false,percentConversionReowned:false,applicationContextUsed:false,genericIntegerOperationsDrillUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q004OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
function parseRatio(v){
  const m=String(v??"").trim().match(/^([+-]?\d+)\s*:\s*([+-]?\d+)$/);
  if(!m)return null;
  const a=Number(m[1]),b=Number(m[2]);if(!Number.isInteger(a)||!Number.isInteger(b)||a<=0||b<=0)return null;
  return {a,b};
}
export function validateG6AU05P07F03Answer(q,submitted){
  const spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,e=[];
  if(!spec||!p)return Object.freeze({ok:false,errors:Object.freeze(["P07F03_QUESTION_INVALID"]),normalizedAnswer:null});
  if(spec.targetKind==="MISSING_TERM"){
    const n=typeof submitted==="number"?submitted:Number(String(submitted).trim());
    if(!Number.isInteger(n)||n<=0)e.push("P07F03_ANSWER_NOT_POSITIVE_INTEGER");
    else if(n!==p.answer)e.push("P07F03_ANSWER_EQUIVALENT_RATIO_MISMATCH");
    return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)?n:null});
  }
  const r=parseRatio(submitted);
  if(!r)e.push("P07F03_ANSWER_NOT_RATIO");
  else{
    const expected=spec.targetKind==="FORWARD_SCALE"?{a:p.scaledA,b:p.scaledB}:{a:p.a,b:p.b};
    if(r.a!==expected.a||r.b!==expected.b)e.push("P07F03_ANSWER_EQUIVALENT_RATIO_MISMATCH");
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:r?r.a+":"+r.b:null});
}
export function validateG6AU05P07F03Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P07F03_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F03_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F03_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F03_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F03_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F03_EQUIVALENT_RATIO_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||String(q.answerText)!==String(expected.answerText)||String(q.answerValue)!==String(expected.answer)||q.questionSignature!==signature(q))e.push("P07F03_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.a)||p.a<=0||!Number.isInteger(p.b)||p.b<=0||!Number.isInteger(p.k)||p.k<=1||!Number.isInteger(p.scaledA)||!Number.isInteger(p.scaledB))e.push("P07F03_DOMAIN_INVALID");
    if(!p.commonScaleFactorAppliedToBothTerms||!p.commonScaleFactorNonzero||!p.reverseDivisionExact||!p.ratioValueInvariant||!p.antecedentConsequentOrderPreserved||!p.crossProductEqualityInternal)e.push("P07F03_EQUIVALENCE_INVARIANT_INVALID");
    if(!validateG6AU05P07F03Answer(q,q.answerValue).ok)e.push("P07F03_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_integer_operations"||m.classificationRuleId!=="rule_integer_operations"||(m.appliedRuntimeModifierIds??[]).join("|")!==MODIFIERS.join("|")||m.semanticProfileInterpretation!=="EXECUTION_ENVELOPE_ONLY_NOT_KNOWLEDGE_POINT_SEMANTIC_OWNER"||!m.integerDomainValidatorBound||!m.textNumericRepresentationBound||!m.integerAddSubCapabilityBound||!m.integerMultiplicationCapabilityBound||!m.q001OrderedRolePrerequisitePreserved||!m.q002RatioValuePrerequisitePreserved||!m.equivalentRatioOwned||!m.commonScaleFactorBothTermsValidated||!m.commonScaleFactorNonzeroValidated||!m.ratioValueInvariantValidated||!m.reverseExactDivisionValidated||!m.crossProductValidatorInternalOnly||m.crossMultiplicationTaught||m.q001RatioNotationReowned||m.q002RatioValueReowned||m.simplestIntegerRatioReowned||m.ratioPartitionApplicationReowned||m.percentConversionReowned||m.applicationContextUsed||m.genericIntegerOperationsDrillUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q004OrLaterTouched||m.r04Reclassified)e.push("P07F03_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU05P07F03Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F03_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F03_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F03_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f03-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*79)%240;questions.push(buildG6AU05P07F03Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU05P07F03Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F03_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
