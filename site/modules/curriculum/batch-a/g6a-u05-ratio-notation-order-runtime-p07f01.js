import {G6A_U05_P07F01_FORMAL_MAPPING as MAPPING,G6A_U05_P07F01_KP_ID as KP,G6A_U05_P07F01_PATTERN_GROUP as GROUP,G6A_U05_P07F01_PATTERN_SPECS as SPECS,G6A_U05_P07F01_SOURCE_ID as SRC,G6A_U05_P07F01_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u05-ratio-notation-order-selector-projection-p07f01.js";
export const G6A_U05_P07F01_MAX_QUESTION_COUNT=240;
export const G6A_U05_P07F01_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function payload(spec,v){
  const u=mod(v,240),low=2+(u%24),high=30+Math.floor(u/24),a=u%2===0?low:high,b=u%2===0?high:low;
  const notation=a+":"+b,verbal=a+" 比 "+b,antecedent=a,consequent=b,swappedNotation=b+":"+a;
  let promptText,answer;
  if(spec.targetKind==="RATIO_NOTATION"){promptText="把「"+verbal+"」寫成比的記號：____";answer=notation;}
  else if(spec.targetKind==="ANTECEDENT"){promptText="在比 "+notation+" 中，前項是多少？";answer=antecedent;}
  else {promptText="在比 "+notation+" 中，後項是多少？";answer=consequent;}
  return Object.freeze({
    variant:u,
    semanticCore:"ORDERED_RATIO_NOTATION_WITH_FIXED_ANTECEDENT_CONSEQUENT_ROLES",
    targetKind:spec.targetKind,
    a,b,notation,verbal,antecedent,consequent,swappedNotation,
    roleOrderPreserved:notation===antecedent+":"+consequent,
    swappedChangesRelation:swappedNotation!==notation,
    answer,promptText
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU05P07F01Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0),answerText=String(p.answer);
  const q={
    id:"p07f01-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p07f01-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,
    relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+answerText,
    answerText,answerValue:p.answer,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f01-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice001Implementation",
      authority:"Q001_G6A_U05_CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI",
      sourcePages:MAPPING.sourcePages,r02EvidencePages:MAPPING.r02EvidencePages,
      sharedRuntimeScope:G6A_U05_P07F01_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:Object.freeze([]),
      ratioPercentReasoningUsed:true,ratioRateValidatorUsed:true,textApplicationRepresentationCapabilityUsed:true,
      orderedRatioNotationValidated:true,antecedentFirstValidated:true,consequentSecondValidated:true,swappedTermsChangeRelationValidated:true,roleOrderBackSubstitutionValidated:true,
      ratioValueReowned:false,equivalentRatioReowned:false,simplestIntegerRatioReowned:false,ratioPartitionApplicationReowned:false,proportionCrossMultiplicationReowned:false,percentConversionReowned:false,
      applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,laterW7SliceTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
function normalizeRatio(v){return String(v??"").trim().replace(/：/g,":").replace(/\s+/g,"");}
export function validateG6AU05P07F01Answer(q,submitted){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)return Object.freeze({ok:false,errors:Object.freeze(["P07F01_PATTERN_SPEC_INVALID"]),normalizedAnswer:null});
  if(spec.targetKind==="RATIO_NOTATION"){
    const n=normalizeRatio(submitted),expected=normalizeRatio(q?.answerText);
    if(!/^\d+:\d+$/.test(n))e.push("P07F01_ANSWER_NOT_RATIO_NOTATION");
    if(n!==expected)e.push("P07F01_ANSWER_RATIO_ORDER_MISMATCH");
    return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:n||null});
  }
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim());
  if(!Number.isInteger(n)||n<=0)e.push("P07F01_ANSWER_NOT_POSITIVE_INTEGER_TERM");
  if(Number.isInteger(n)&&n>0&&n!==q?.answerValue)e.push("P07F01_ANSWER_TERM_ROLE_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)&&n>0?n:null});
}
export function validateG6AU05P07F01Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P07F01_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F01_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F01_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F01_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F01_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F01_RATIO_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||String(q.answerText)!==String(expected.answer)||String(q.answerValue)!==String(expected.answer)||q.questionSignature!==signature(q))e.push("P07F01_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(p.notation!==p.a+":"+p.b||p.antecedent!==p.a||p.consequent!==p.b||p.roleOrderPreserved!==true)e.push("P07F01_ROLE_ORDER_INVALID");
    if(p.swappedNotation!==p.b+":"+p.a||p.swappedNotation===p.notation||p.swappedChangesRelation!==true)e.push("P07F01_SWAP_RELATION_INVALID");
    if(spec.targetKind==="RATIO_NOTATION"&&p.answer!==p.notation)e.push("P07F01_NOTATION_TARGET_INVALID");
    if(spec.targetKind==="ANTECEDENT"&&p.answer!==p.antecedent)e.push("P07F01_ANTECEDENT_TARGET_INVALID");
    if(spec.targetKind==="CONSEQUENT"&&p.answer!==p.consequent)e.push("P07F01_CONSEQUENT_TARGET_INVALID");
    if(!validateG6AU05P07F01Answer(q,q.answerValue).ok)e.push("P07F01_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.ratioPercentReasoningUsed||!m.ratioRateValidatorUsed||!m.textApplicationRepresentationCapabilityUsed||!m.orderedRatioNotationValidated||!m.antecedentFirstValidated||!m.consequentSecondValidated||!m.swappedTermsChangeRelationValidated||!m.roleOrderBackSubstitutionValidated||m.ratioValueReowned||m.equivalentRatioReowned||m.simplestIntegerRatioReowned||m.ratioPartitionApplicationReowned||m.proportionCrossMultiplicationReowned||m.percentConversionReowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.laterW7SliceTouched||m.r04Reclassified)e.push("P07F01_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU05P07F01Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F01_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F01_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F01_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f01-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*83)%240;questions.push(buildG6AU05P07F01Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU05P07F01Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F01_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
