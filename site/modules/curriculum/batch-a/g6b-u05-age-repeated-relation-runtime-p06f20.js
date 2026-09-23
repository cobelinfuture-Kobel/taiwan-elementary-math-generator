import {G6B_U05_P06F20_FORMAL_MAPPING as MAPPING,G6B_U05_P06F20_KP_ID as KP,G6B_U05_P06F20_PATTERN_GROUP as GROUP,G6B_U05_P06F20_PATTERN_SPECS as SPECS,G6B_U05_P06F20_SOURCE_ID as SRC,G6B_U05_P06F20_SPEC_IDS as SPEC_IDS} from "../registry/g6b-u05-age-repeated-relation-selector-projection-p06f20.js";
export const G6B_U05_P06F20_MAX_QUESTION_COUNT=240;
export const G6B_U05_P06F20_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function payload(spec,v){
  const u=mod(v,240);
  const multiplier=2+(u%3);
  const shiftYears=1+(Math.floor(u/3)%10);
  const band=Math.floor(u/30);
  const isFuture=spec.timeDirection==="FUTURE";
  const shiftedYounger=isFuture?12+band*2:6+band*2;
  const signedShiftYears=isFuture?shiftYears:-shiftYears;
  const currentYounger=shiftedYounger-signedShiftYears;
  const difference=(multiplier-1)*shiftedYounger;
  const currentOlder=currentYounger+difference;
  const shiftedOlder=currentOlder+signedShiftYears;
  const reconstructedCurrentDifference=currentOlder-currentYounger;
  const reconstructedShiftedDifference=shiftedOlder-shiftedYounger;
  const shiftedRelationValue=multiplier*shiftedYounger;
  const ageDifferenceInvariant=reconstructedCurrentDifference===reconstructedShiftedDifference&&reconstructedCurrentDifference===difference;
  const shiftedRelationValid=shiftedOlder===shiftedRelationValue;
  const positiveAgeState=[currentYounger,currentOlder,shiftedYounger,shiftedOlder].every(n=>Number.isInteger(n)&&n>0);
  const answer=spec.targetQuantity==="CURRENT_OLDER"?currentOlder:currentYounger;
  const promptText=isFuture
    ?"甲現在比乙大 "+difference+" 歲。"+shiftYears+" 年後，甲的年齡是乙的 "+multiplier+" 倍。乙現在幾歲？"
    :"甲現在比乙大 "+difference+" 歲。"+shiftYears+" 年前，甲的年齡是乙的 "+multiplier+" 倍。甲現在幾歲？";
  return Object.freeze({
    variant:u,
    semanticCore:"AGE_DIFFERENCE_INVARIANT_UNDER_EQUAL_TIME_SHIFT",
    timeDirection:spec.timeDirection,
    targetQuantity:spec.targetQuantity,
    multiplier,
    shiftYears,
    signedShiftYears,
    currentYounger,
    currentOlder,
    shiftedYounger,
    shiftedOlder,
    difference,
    reconstructedCurrentDifference,
    reconstructedShiftedDifference,
    shiftedRelationValue,
    ageDifferenceInvariant,
    shiftedRelationValid,
    positiveAgeState,
    answer,
    promptText
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6BU05P06F20Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0),answerText=String(p.answer);
  const q={
    id:"p06f20-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p06f20-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,
    sourceNodeId:SRC,
    knowledgePointId:KP,
    patternGroupId:GROUP.patternGroupId,
    patternSpecId,
    relation:spec.relation,
    shiftedRelation:spec.shiftedRelation,
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
    generationSeed:o.generationSeed??"p06f20-public",
    metadata:Object.freeze({
      taskId:"P06F_W6DirectProductVerticalSlice020Implementation",
      authority:"Q020_REUSED_G6B_U05_FULL_PAGE_VISUAL_READBACK_200_DPI",
      sourcePages:MAPPING.sourcePages,
      r02EvidencePages:MAPPING.r02EvidencePages,
      sharedRuntimeScope:G6B_U05_P06F20_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_word_problem",
      classificationRuleId:"rule_word_problem",
      appliedRuntimeModifierIds:Object.freeze(["mod_application_semantics"]),
      symbolicRelationReasoningUsed:true,
      relationModelBindingUsed:true,
      wordProblemSemanticValidationUsed:true,
      textApplicationRepresentationUsed:true,
      sourceWordProblemContextIsCore:true,
      ageDifferenceInvariantValidated:true,
      bothAgesUseSameTimeShift:true,
      shiftedMultiplicativeRelationValidated:true,
      currentAndShiftedBackSubstitutionValidated:true,
      positiveAgeStateValidated:true,
      q019SumDifferenceCoreReowned:false,
      generalSumMultipleProblemReowned:false,
      generalDifferenceMultipleProblemReowned:false,
      workOrDistributionStrategyReowned:false,
      genericSequenceOrRecurrenceReowned:false,
      genericApplicationOverlayUsed:false,
      globalContextBindingUsed:false,
      pblProjectionUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      laterW6SliceTouched:false,
      r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6BU05P06F20Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isInteger(n)||n<=0)e.push("P06F20_ANSWER_NOT_POSITIVE_INTEGER_AGE");
  if(Number.isInteger(n)&&n>0&&n!==q?.answerValue)e.push("P06F20_ANSWER_AGE_RELATION_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)&&n>0?n:null});
}
export function validateG6BU05P06F20Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P06F20_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P06F20_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P06F20_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P06F20_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P06F20_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P06F20_AGE_RELATION_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerValue!==expected.answer||q.answerText!==String(expected.answer)||q.questionSignature!==signature(q))e.push("P06F20_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(p.signedShiftYears!==(spec.timeDirection==="FUTURE"?p.shiftYears:-p.shiftYears))e.push("P06F20_TIME_SHIFT_DIRECTION_INVALID");
    if(p.shiftedYounger!==p.currentYounger+p.signedShiftYears||p.shiftedOlder!==p.currentOlder+p.signedShiftYears)e.push("P06F20_EQUAL_TIME_SHIFT_INVALID");
    if(p.currentOlder-p.currentYounger!==p.difference||p.shiftedOlder-p.shiftedYounger!==p.difference||p.ageDifferenceInvariant!==true)e.push("P06F20_AGE_DIFFERENCE_INVARIANT_INVALID");
    if(p.shiftedOlder!==p.multiplier*p.shiftedYounger||p.shiftedRelationValid!==true)e.push("P06F20_SHIFTED_MULTIPLE_RELATION_INVALID");
    if(![p.currentYounger,p.currentOlder,p.shiftedYounger,p.shiftedOlder].every(n=>Number.isInteger(n)&&n>0)||p.positiveAgeState!==true)e.push("P06F20_POSITIVE_AGE_STATE_INVALID");
    if(spec.targetQuantity==="CURRENT_YOUNGER"&&p.answer!==p.currentYounger)e.push("P06F20_CURRENT_YOUNGER_TARGET_INVALID");
    if(spec.targetQuantity==="CURRENT_OLDER"&&p.answer!==p.currentOlder)e.push("P06F20_CURRENT_OLDER_TARGET_INVALID");
    if(!validateG6BU05P06F20Answer(q,q.answerValue).ok)e.push("P06F20_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_word_problem"||m.classificationRuleId!=="rule_word_problem"||!m.symbolicRelationReasoningUsed||!m.relationModelBindingUsed||!m.wordProblemSemanticValidationUsed||!m.textApplicationRepresentationUsed||!m.sourceWordProblemContextIsCore||!m.ageDifferenceInvariantValidated||!m.bothAgesUseSameTimeShift||!m.shiftedMultiplicativeRelationValidated||!m.currentAndShiftedBackSubstitutionValidated||!m.positiveAgeStateValidated||m.q019SumDifferenceCoreReowned||m.generalSumMultipleProblemReowned||m.generalDifferenceMultipleProblemReowned||m.workOrDistributionStrategyReowned||m.genericSequenceOrRecurrenceReowned||m.genericApplicationOverlayUsed||m.globalContextBindingUsed||m.pblProjectionUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.laterW6SliceTouched||m.r04Reclassified)e.push("P06F20_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU05P06F20Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F20_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F20_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F20_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p06f20-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*101)%240;questions.push(buildG6BU05P06F20Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6BU05P06F20Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P06F20_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
