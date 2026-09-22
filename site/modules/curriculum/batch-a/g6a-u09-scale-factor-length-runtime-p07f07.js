import {G6A_U09_P07F07_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U09_P07F07_FORMAL_MAPPING as MAPPING,G6A_U09_P07F07_KP_ID as KP,G6A_U09_P07F07_PATTERN_GROUP as GROUP,G6A_U09_P07F07_PATTERN_SPECS as SPECS,G6A_U09_P07F07_SOURCE_ID as SRC,G6A_U09_P07F07_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u09-scale-factor-length-selector-projection-p07f07.js";
export const G6A_U09_P07F07_MAX_QUESTION_COUNT=240;
export const G6A_U09_P07F07_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const FACTORS=Object.freeze([
  Object.freeze({num:1,den:2,text:"1/2",value:0.5}),
  Object.freeze({num:2,den:3,text:"2/3",value:2/3}),
  Object.freeze({num:3,den:4,text:"3/4",value:0.75}),
  Object.freeze({num:4,den:5,text:"0.8",value:0.8}),
  Object.freeze({num:5,den:4,text:"1.25",value:1.25}),
  Object.freeze({num:4,den:3,text:"4/3",value:4/3}),
  Object.freeze({num:3,den:2,text:"1.5",value:1.5}),
  Object.freeze({num:2,den:1,text:"2",value:2}),
  Object.freeze({num:5,den:2,text:"2.5",value:2.5}),
  Object.freeze({num:3,den:1,text:"3",value:3}),
  Object.freeze({num:7,den:4,text:"7/4",value:1.75}),
  Object.freeze({num:5,den:3,text:"5/3",value:5/3})
]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1;};
const factorClass=f=>f.value>1?"ENLARGEMENT":"REDUCTION";
function parseNumeric(v){
  if(typeof v==="number")return Number.isFinite(v)?v:null;
  const s=String(v??"").trim();
  const m=s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if(m){const d=Number(m[2]);return d===0?null:Number(m[1])/d;}
  const n=Number(s);return Number.isFinite(n)?n:null;
}
function payload(spec,v){
  const u=mod(v,240),f=FACTORS[u%FACTORS.length],m=3+Math.floor(u/FACTORS.length),sourceA=f.den*m,targetA=f.num*m,sourceB=f.den*(m+2),targetB=f.num*(m+2),classification=factorClass(f);
  let promptText,answer,answerText,targetKind=spec.targetKind;
  if(targetKind==="INFER_FACTOR"){
    promptText="原圖的一條邊長是 "+sourceA+" 公分，對應到新圖後是 "+targetA+" 公分。新圖是原圖的幾倍？";
    answer=f.value;answerText=f.text;
  }else if(targetKind==="TARGET_LENGTH"){
    promptText="原圖的一條邊長是 "+sourceA+" 公分，新圖的所有對應邊長都是原圖的 "+f.text+" 倍。這條對應邊長是多少公分？";
    answer=targetA;answerText=String(targetA);
  }else{
    promptText="同一組放大或縮小圖中，一條對應邊由 "+sourceA+" 公分變成 "+targetA+" 公分。另一條原邊長是 "+sourceB+" 公分，依同一比例倍數後應是多少公分？";
    answer=targetB;answerText=String(targetB);
  }
  return Object.freeze({
    variant:u,targetKind,semanticCore:"CORRESPONDING_LENGTHS_SHARE_ONE_POSITIVE_NONZERO_SCALE_FACTOR",
    scaleFactorNumerator:f.num,scaleFactorDenominator:f.den,scaleFactorText:f.text,scaleFactorValue:f.value,scaleClassification:classification,
    sourceLengthA:sourceA,targetLengthA:targetA,sourceLengthB:sourceB,targetLengthB:targetB,
    ratioInvariantA:targetA/sourceA,ratioInvariantB:targetB/sourceB,commonScaleFactorVerified:Math.abs(targetA/sourceA-targetB/sourceB)<1e-12,
    positiveScaleFactor:f.value>0,nonzeroScaleFactor:f.value!==0,sameUnit:"cm",
    promptText,answer,answerText
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU09P07F07Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f07-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f07-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f07-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice007Implementation",
      authority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_LENGTH_SCALE_FACTOR_EVIDENCE",
      r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,currentVisualSupportLevel:MAPPING.currentVisualSupportLevel,
      sharedRuntimeScope:G6A_U09_P07F07_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_quantity_measurement",classificationRuleId:"rule_quantity_measurement",appliedRuntimeModifierIds:MODIFIERS,
      quantityDimensionUnitIdentityBound:true,quantityDomainValidatorBound:true,textNumericRepresentationBound:true,equivalentRatioPrerequisiteRequired:true,scaleFactorLengthOwned:true,
      oneCommonScaleFactorValidated:true,positiveNonzeroScaleFactorValidated:true,sameUnitLengthPairOnly:true,
      unitConversionUsed:false,anglePreservationTeachingReowned:false,scaleDrawingConstructionReowned:false,mapScaleDistanceReowned:false,scaleAreaChangeReowned:false,mapScaleBarInterpretationUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q008OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU09P07F07Answer(q,submitted){
  const n=parseNumeric(submitted),expected=Number(q?.patternRepresentation?.answer),e=[];
  if(n===null)e.push("P07F07_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-expected)>1e-9)e.push("P07F07_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:n});
}
export function validateG6AU09P07F07Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation;
  if(!spec)e.push("P07F07_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F07_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F07_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F07_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F07_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F07_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||Math.abs(Number(q.answerValue)-Number(expected.answer))>1e-9||q.questionSignature!==signature(q))e.push("P07F07_PROMPT_ANSWER_SIGNATURE_INVALID");
    const g=gcd(p.scaleFactorNumerator,p.scaleFactorDenominator);
    if(p.scaleFactorNumerator<=0||p.scaleFactorDenominator<=0||g!==1||!p.positiveScaleFactor||!p.nonzeroScaleFactor||p.sameUnit!=="cm")e.push("P07F07_SCALE_FACTOR_DOMAIN_INVALID");
    if(Math.abs(p.targetLengthA/p.sourceLengthA-p.scaleFactorValue)>1e-12||Math.abs(p.targetLengthB/p.sourceLengthB-p.scaleFactorValue)>1e-12||!p.commonScaleFactorVerified)e.push("P07F07_COMMON_SCALE_FACTOR_INVALID");
    if(p.scaleClassification!==(p.scaleFactorValue>1?"ENLARGEMENT":"REDUCTION"))e.push("P07F07_SCALE_CLASS_INVALID");
    if(!validateG6AU09P07F07Answer(q,q.answerValue).ok)e.push("P07F07_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_quantity_measurement"||m.classificationRuleId!=="rule_quantity_measurement"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.quantityDimensionUnitIdentityBound||!m.quantityDomainValidatorBound||!m.textNumericRepresentationBound||!m.equivalentRatioPrerequisiteRequired||!m.scaleFactorLengthOwned||!m.oneCommonScaleFactorValidated||!m.positiveNonzeroScaleFactorValidated||!m.sameUnitLengthPairOnly||m.unitConversionUsed||m.anglePreservationTeachingReowned||m.scaleDrawingConstructionReowned||m.mapScaleDistanceReowned||m.scaleAreaChangeReowned||m.mapScaleBarInterpretationUsed||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q008OrLaterTouched||m.r04Reclassified)e.push("P07F07_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["角度","方格","實際距離","地圖","面積"])if(learner.includes(term))e.push("P07F07_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU09P07F07Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F07_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F07_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F07_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f07-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*83)%240;questions.push(buildG6AU09P07F07Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU09P07F07Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F07_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
