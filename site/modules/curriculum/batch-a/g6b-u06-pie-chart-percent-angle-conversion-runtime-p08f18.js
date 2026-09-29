import {
  G6B_U06_P08F18_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U06_P08F18_FORMAL_MAPPING as MAPPING,
  G6B_U06_P08F18_KP_ID as KP,
  G6B_U06_P08F18_PATTERN_GROUP as GROUP,
  G6B_U06_P08F18_PATTERN_SPECS as SPECS,
  G6B_U06_P08F18_SOURCE_ID as SRC,
  G6B_U06_P08F18_SPEC_IDS as SPEC_IDS,
  P08F18_TASK_ID
} from "../registry/g6b-u06-pie-chart-percent-angle-conversion-selector-projection-p08f18.js";

export const G6B_U06_P08F18_MAX_QUESTION_COUNT=240;
export const G6B_U06_P08F18_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const PERCENTS=Object.freeze(Array.from({length:19},(_,i)=>(i+1)*5));
const LABELS=Object.freeze(["甲","乙","丙","丁","戊","己","庚","辛","壬","癸","子","丑","寅"]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}

function payload(spec,v){
  const u=mod(v,240);
  const percent=PERCENTS[u%PERCENTS.length];
  const sectorLabel=LABELS[Math.floor(u/PERCENTS.length)%LABELS.length];
  const angleDegrees=percent*360/100;
  const direction=spec.direction;
  const promptText=direction==="PERCENT_TO_ANGLE"
    ? "圓形圖中「"+sectorLabel+"」扇形占全體 "+percent+"%。整圓是 360°，這個扇形的圓心角是多少度？"
    : "圓形圖中「"+sectorLabel+"」扇形的圓心角是 "+angleDegrees+"°。整圓是 360°，這個扇形占全體百分之幾？";
  const answer=direction==="PERCENT_TO_ANGLE"?angleDegrees:percent;
  const answerText=direction==="PERCENT_TO_ANGLE"?String(angleDegrees)+"°":String(percent)+"%";
  return Object.freeze({
    variant:u,
    direction,
    sectorLabel,
    percent,
    angleDegrees,
    wholePercent:100,
    wholeAngleDegrees:360,
    percentRate:percent/100,
    percentToAngleRelationVerified:angleDegrees===percent*3.6,
    angleToPercentRelationVerified:percent===angleDegrees/3.6,
    equivalenceBackCheckVerified:true,
    promptText,
    answer,
    answerText
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");

export function buildG6BU06P08F18Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);
  if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p08f18-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p08f18-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,
    sourceNodeId:SRC,
    knowledgePointId:KP,
    patternGroupId:GROUP.patternGroupId,
    patternSpecId,
    relation:spec.relation,
    questionMode:"numeric",
    mode:"numeric",
    promptText:p.promptText,
    prompt:p.promptText,
    blankedDisplayText:p.promptText,
    displayText:p.promptText+" "+p.answerText,
    answerText:p.answerText,
    answerValue:p.answer,
    patternRepresentation:p,
    formalMappingId:MAPPING.mappingId,
    generationSeed:o.generationSeed??"p08f18-public",
    metadata:Object.freeze({
      taskId:P08F18_TASK_ID,
      authority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_PERCENT_ANGLE_CONVERSION_SECONDARY",
      sourcePages:Object.freeze([1]),
      sharedRuntimeScope:G6B_U06_P08F18_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_ratio_percent",
      classificationRuleId:"rule_ratio_percent",
      appliedRuntimeModifierIds:MODIFIERS,
      ratioPercentReasoningBound:true,
      ratioRateValidatorBound:true,
      fractionNumberSystemContractBound:true,
      textApplicationRepresentationBound:true,
      percentAngleConversionOwned:true,
      bidirectionalConversionValidated:true,
      fullCircle100Percent360DegreesBound:true,
      q014PartWholeTeachingReowned:false,
      q016ComparePieChartsTeachingReowned:false,
      q021QuantityFromRateTeachingReowned:false,
      pieChartConstructionUsed:false,
      genericSectorGeometryTeachingUsed:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q019OrLaterTouched:false,
      r04Reclassified:false,
      r05AssignmentMutated:false,
      pieChartGraphicUsed:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}

function normalizeSubmitted(submitted){
  if(typeof submitted==="number")return submitted;
  return Number(String(submitted??"").trim().replaceAll("％","%").replaceAll("度","").replaceAll("°","").replaceAll("%","").trim());
}
export function validateG6BU06P08F18Answer(q,submitted){
  const n=normalizeSubmitted(submitted),e=[];
  if(!Number.isInteger(n))e.push("P08F18_ANSWER_NOT_INTEGER");
  if(Number.isInteger(n)&&n!==q?.answerValue)e.push("P08F18_ANSWER_RELATION_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)?n:null});
}

export function validateG6BU06P08F18Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P08F18_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F18_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P08F18_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P08F18_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P08F18_REPRESENTATION_INVALID");
  if(spec&&p){
    const x=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(x))e.push("P08F18_PAYLOAD_INVALID");
    if(q.promptText!==x.promptText||q.answerText!==x.answerText||q.answerValue!==x.answer||q.questionSignature!==signature(q))e.push("P08F18_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(p.wholePercent!==100||p.wholeAngleDegrees!==360||!Number.isInteger(p.percent)||p.percent<=0||p.percent>=100||!Number.isInteger(p.angleDegrees)||p.angleDegrees!==p.percent*3.6||!p.percentToAngleRelationVerified||!p.angleToPercentRelationVerified||!p.equivalenceBackCheckVerified)e.push("P08F18_CONVERSION_INVARIANT_INVALID");
    if(spec.direction==="PERCENT_TO_ANGLE"&&q.answerValue!==p.angleDegrees)e.push("P08F18_PERCENT_TO_ANGLE_ANSWER_INVALID");
    if(spec.direction==="ANGLE_TO_PERCENT"&&q.answerValue!==p.percent)e.push("P08F18_ANGLE_TO_PERCENT_ANSWER_INVALID");
    if(!validateG6BU06P08F18Answer(q,q.answerText).ok)e.push("P08F18_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||
    !m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||!m.fractionNumberSystemContractBound||!m.textApplicationRepresentationBound||
    !m.percentAngleConversionOwned||!m.bidirectionalConversionValidated||!m.fullCircle100Percent360DegreesBound||
    m.q014PartWholeTeachingReowned||m.q016ComparePieChartsTeachingReowned||m.q021QuantityFromRateTeachingReowned||
    m.pieChartConstructionUsed||m.genericSectorGeometryTeachingUsed||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||
    m.q019OrLaterTouched||m.r04Reclassified||m.r05AssignmentMutated||m.pieChartGraphicUsed)e.push("P08F18_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["求數量","支出金額","比較兩個圓形圖","畫出圓形圖","繪製圓形圖","扇形面積"])if(learner.includes(term))e.push("P08F18_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}

export function generateG6BU06P08F18Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F18_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F18_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F18_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const v=(hash(o.generationSeed??"p08f18-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*73)%240;
    questions.push(buildG6BU06P08F18Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6BU06P08F18Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F18_DUPLICATE_SIGNATURE");
  return Object.freeze({
    ok:errors.length===0,
    questions:Object.freeze(questions),
    errors:Object.freeze(errors),
    warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),
    maxQuestionCount:240
  });
}
