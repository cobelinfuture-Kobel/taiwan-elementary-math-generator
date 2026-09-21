import {G6B_U05_P06F19_FORMAL_MAPPING as MAPPING,G6B_U05_P06F19_KP_ID as KP,G6B_U05_P06F19_PATTERN_GROUP as GROUP,G6B_U05_P06F19_PATTERN_SPECS as SPECS,G6B_U05_P06F19_SOURCE_ID as SRC,G6B_U05_P06F19_SPEC_IDS as SPEC_IDS} from "../registry/g6b-u05-sum-difference-selector-projection-p06f19.js";
export const G6B_U05_P06F19_MAX_QUESTION_COUNT=240;
export const G6B_U05_P06F19_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function payload(spec,v){
  const u=mod(v,240);
  const smaller=10+(u%40);
  const difference=2+2*Math.floor(u/40);
  const larger=smaller+difference;
  const sum=larger+smaller;
  const largerFormulaValue=(sum+difference)/2;
  const smallerFormulaValue=(sum-difference)/2;
  const answer=spec.targetQuantity==="LARGER"?larger:smaller;
  const targetLabel=spec.targetQuantity==="LARGER"?"較大數":"較小數";
  const promptText="兩個數的和是 "+sum+"，較大數比另一個數多 "+difference+"。請用和差關係求"+targetLabel+"。"+targetLabel+" = ？";
  return Object.freeze({
    variant:u,
    semanticCore:"SUM_DIFFERENCE_TWO_QUANTITY_DECOMPOSITION",
    targetQuantity:spec.targetQuantity,
    sum,
    difference,
    larger,
    smaller,
    largerFormulaValue,
    smallerFormulaValue,
    sumReconstruction:larger+smaller,
    differenceReconstruction:larger-smaller,
    exactIntegerPartition:Number.isInteger(largerFormulaValue)&&Number.isInteger(smallerFormulaValue),
    answer,
    promptText
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6BU05P06F19Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0),answerText=String(p.answer);
  const q={
    id:"p06f19-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p06f19-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,
    sourceNodeId:SRC,
    knowledgePointId:KP,
    patternGroupId:GROUP.patternGroupId,
    patternSpecId,
    relation:spec.relation,
    validatorRelation:spec.validatorRelation,
    questionMode:"numeric",
    mode:"numeric",
    promptText:p.promptText,
    prompt:p.promptText,
    blankedDisplayText:p.promptText,
    displayText:p.promptText+" "+answerText,
    answerText,
    answerValue:p.answer,
    patternRepresentation:p,
    formalMappingId:MAPPING.mappingId,
    generationSeed:o.generationSeed??"p06f19-public",
    metadata:Object.freeze({
      taskId:"P06F_W6DirectProductVerticalSlice019Implementation",
      authority:"Q019_R02_FULL_PAGE_VISUAL_READBACK_200_DPI",
      sourcePages:MAPPING.sourcePages,
      sharedRuntimeScope:G6B_U05_P06F19_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_decimal",
      profileIsRuntimeEnvelopeOnly:true,
      decimalNumberSystemBoundAsEnvelope:true,
      decimalDomainValidatorBoundAsEnvelope:true,
      textNumericRepresentationUsed:true,
      decimalPlaceValueSemanticCore:false,
      decimalNotationSemanticCore:false,
      knownSumAndDifferenceUsed:true,
      largerFormulaUsed:true,
      smallerFormulaUsed:true,
      sumReconstructionValidated:true,
      differenceReconstructionValidated:true,
      exactIntegerPartitionValidated:true,
      sourceContextRepresentationOnly:true,
      sumMultipleProblemReowned:false,
      differenceMultipleProblemReowned:false,
      ageOrRepeatedRelationProblemReowned:false,
      workOrDistributionStrategyReowned:false,
      q020Reowned:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q020OrLaterTouched:false,
      r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6BU05P06F19Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isInteger(n))e.push("P06F19_ANSWER_NOT_INTEGER");
  if(Number.isInteger(n)&&n!==q?.answerValue)e.push("P06F19_ANSWER_SUM_DIFFERENCE_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)?n:null});
}
export function validateG6BU05P06F19Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P06F19_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P06F19_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P06F19_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P06F19_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P06F19_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P06F19_SUM_DIFFERENCE_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerValue!==expected.answer||q.answerText!==String(expected.answer)||q.questionSignature!==signature(q))e.push("P06F19_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(p.sum!==p.larger+p.smaller||p.difference!==p.larger-p.smaller)e.push("P06F19_RECONSTRUCTION_INVALID");
    if(p.largerFormulaValue!==(p.sum+p.difference)/2||p.smallerFormulaValue!==(p.sum-p.difference)/2)e.push("P06F19_FORMULA_INVALID");
    if(!Number.isInteger(p.largerFormulaValue)||!Number.isInteger(p.smallerFormulaValue)||p.exactIntegerPartition!==true)e.push("P06F19_EXACT_PARTITION_INVALID");
    if(spec.targetQuantity==="LARGER"&&p.answer!==p.larger)e.push("P06F19_LARGER_TARGET_INVALID");
    if(spec.targetQuantity==="SMALLER"&&p.answer!==p.smaller)e.push("P06F19_SMALLER_TARGET_INVALID");
    if(!validateG6BU05P06F19Answer(q,q.answerValue).ok)e.push("P06F19_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_decimal"||!m.profileIsRuntimeEnvelopeOnly||!m.decimalNumberSystemBoundAsEnvelope||!m.decimalDomainValidatorBoundAsEnvelope||!m.textNumericRepresentationUsed||m.decimalPlaceValueSemanticCore||m.decimalNotationSemanticCore||!m.knownSumAndDifferenceUsed||!m.largerFormulaUsed||!m.smallerFormulaUsed||!m.sumReconstructionValidated||!m.differenceReconstructionValidated||!m.exactIntegerPartitionValidated||!m.sourceContextRepresentationOnly||m.sumMultipleProblemReowned||m.differenceMultipleProblemReowned||m.ageOrRepeatedRelationProblemReowned||m.workOrDistributionStrategyReowned||m.q020Reowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q020OrLaterTouched||m.r04Reclassified)e.push("P06F19_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU05P06F19Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F19_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F19_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F19_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p06f19-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*97)%240;questions.push(buildG6BU05P06F19Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6BU05P06F19Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P06F19_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
