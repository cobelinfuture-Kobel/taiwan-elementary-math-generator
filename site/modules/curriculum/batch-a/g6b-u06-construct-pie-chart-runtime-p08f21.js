import {
  G6B_U06_P08F21_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U06_P08F21_FORMAL_MAPPING as MAPPING,
  G6B_U06_P08F21_KP_ID as KP,
  G6B_U06_P08F21_PATTERN_GROUP as GROUP,
  G6B_U06_P08F21_PATTERN_SPECS as SPECS,
  G6B_U06_P08F21_SOURCE_ID as SRC,
  G6B_U06_P08F21_SPEC_IDS as SPEC_IDS,
  P08F21_TASK_ID
} from "../registry/g6b-u06-construct-pie-chart-selector-projection-p08f21.js";

export const G6B_U06_P08F21_MAX_QUESTION_COUNT=240;
export const G6B_U06_P08F21_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const LABELS=Object.freeze(["甲","乙","丙","丁"]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const UNIT_COMPOSITIONS=Object.freeze((()=>{
  const out=[];
  for(let a=2;a<=14;a++)for(let b=2;b<=14;b++)for(let c=2;c<=14;c++){const d=20-a-b-c;if(d>=2&&d<=14)out.push(Object.freeze([a,b,c,d]));}
  return out;
})());
if(UNIT_COMPOSITIONS.length<240)throw new Error("P08F21_COMPOSITION_POOL_TOO_SMALL");

function dataForVariant(v){
  const u=mod(v,240),units=UNIT_COMPOSITIONS[(u*37+11)%UNIT_COMPOSITIONS.length],percents=Object.freeze(units.map(x=>x*5)),
    angles=Object.freeze(percents.map(x=>x*3.6)),multiplier=1+Math.floor(u/60),counts=Object.freeze(units.map(x=>x*multiplier)),
    totalCount=counts.reduce((a,b)=>a+b,0);
  return Object.freeze({variant:u,units,percents,angles,multiplier,counts,totalCount});
}
function rows(spec,p){
  if(spec.inputMode==="COUNTS")return Object.freeze(LABELS.map((label,i)=>Object.freeze({category:label,value:p.counts[i],displayCategory:label,displayValue:String(p.counts[i])})));
  return Object.freeze(LABELS.map((label,i)=>Object.freeze({category:label,value:p.percents[i],displayCategory:label,displayValue:String(p.percents[i])+"%"})));
}
function table(spec,p){
  return Object.freeze({
    kind:"one_way_statistics_table",
    headers:Object.freeze(["類別",spec.inputMode==="COUNTS"?"數量":"百分率"]),
    rows:rows(spec,p),
    semanticCore:"PIE_CHART_CONSTRUCTION_SOURCE_TABLE",
    chartRepresentationRendered:false,
    ariaLabel:spec.inputMode==="COUNTS"?"圓形圖來源分類數量表":"圓形圖來源百分率表"
  });
}
function sectors(p){return Object.freeze(LABELS.map((label,i)=>Object.freeze({label,percent:p.percents[i],centralAngleDegrees:p.angles[i],count:p.counts[i]})));}
function chart(spec,p,phase){
  return Object.freeze({
    kind:"pie_chart_construction_data_p08f21",
    semanticCore:"CONSTRUCT_PIE_CHART_FROM_CLASSIFIED_DATA_BY_PERCENT_AND_CENTRAL_ANGLE_ALLOCATION",
    phase,
    inputMode:spec.inputMode,
    title:phase==="question"?"請依資料繪製圓形圖":"完成的圓形圖",
    wholePercent:100,
    wholeAngleDegrees:360,
    sectors:sectors(p),
    startDirection:"TWELVE_OCLOCK",
    clockwise:true,
    ariaLabel:phase==="question"?"圓形圖繪製空白作圖區":"圓形圖繪製答案"
  });
}
function payload(spec,v){
  const p=dataForVariant(v),tableData=table(spec,p),chartData=chart(spec,p,"question"),answerChartData=chart(spec,p,"answer"),
    promptText=spec.inputMode==="COUNTS"
      ? "依資料表先求各類占全體的百分率與圓心角，再從 12 點方向開始順時針完成圓形圖。"
      : "依資料表把各類百分率換算成圓心角，再從 12 點方向開始順時針完成圓形圖。",
    answerText=LABELS.map((label,i)=>label+" "+p.percents[i]+"%="+p.angles[i]+"°").join("；");
  return Object.freeze({p,tableData,chartData,answerChartData,promptText,answerText});
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.tableData),JSON.stringify(q.answerChartData)].join("|");
export function buildG6BU06P08F21Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const x=payload(spec,o.variant??0),q={
    id:"p08f21-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(x.p.variant+1),
    generatedItemId:"p08f21-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(x.p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,
    relation:spec.relation,questionMode:"diagram",mode:"diagram",
    promptText:x.promptText,prompt:x.promptText,blankedDisplayText:x.promptText,displayText:x.promptText+" "+x.answerText,
    answerText:x.answerText,answerValue:Object.freeze([...x.p.angles]),tableData:x.tableData,chartData:x.chartData,
    answerChartData:x.answerChartData,patternRepresentation:Object.freeze({...x.p,inputMode:spec.inputMode}),
    formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p08f21-public",
    metadata:Object.freeze({
      taskId:P08F21_TASK_ID,authority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_PIE_CHART_CONSTRUCTION_SECONDARY",
      sourcePages:Object.freeze([1]),sharedRuntimeScope:G6B_U06_P08F21_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",
      appliedRuntimeModifierIds:MODIFIERS,ratioPercentReasoningBound:true,ratioRateValidatorBound:true,
      fractionNumberSystemContractBound:true,textApplicationRepresentationBound:true,
      constructPieChartOwned:true,classifiedDataToProportionUsed:true,percentToCentralAngleConsumedAsPrerequisite:true,
      sectorAllocationByAngleUsed:true,fullCircle100Percent360DegreesBound:true,constructionChartRepresentationUsed:true,
      q014PartWholeTeachingReowned:false,q016ComparePieChartsTeachingReowned:false,q021W7QuantityFromRateTeachingReowned:false,
      q018PercentAngleTeachingReowned:false,genericSectorGeometryTeachingUsed:false,applicationContextUsed:false,
      sameUnitMixedUsed:false,crossUnitMixedUsed:false,q022OrLaterTouched:false,r04Reclassified:false,r05AssignmentMutated:false,
      humanVisualReviewRequired:true
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
function chartValid(c,phase){
  if(!c||c.kind!=="pie_chart_construction_data_p08f21"||c.semanticCore!=="CONSTRUCT_PIE_CHART_FROM_CLASSIFIED_DATA_BY_PERCENT_AND_CENTRAL_ANGLE_ALLOCATION"||
    c.phase!==phase||c.wholePercent!==100||c.wholeAngleDegrees!==360||c.startDirection!=="TWELVE_OCLOCK"||c.clockwise!==true||
    !Array.isArray(c.sectors)||c.sectors.length!==4)return false;
  const pct=c.sectors.reduce((n,s)=>n+s.percent,0),deg=c.sectors.reduce((n,s)=>n+s.centralAngleDegrees,0);
  return pct===100&&Math.abs(deg-360)<1e-9&&c.sectors.every((s,i)=>s.label===LABELS[i]&&Number.isInteger(s.percent)&&s.percent>=10&&
    Number.isInteger(s.centralAngleDegrees)&&s.centralAngleDegrees===s.percent*3.6&&Number.isInteger(s.count)&&s.count>0);
}
function tableValid(t,spec,p){
  return Boolean(t&&t.kind==="one_way_statistics_table"&&t.semanticCore==="PIE_CHART_CONSTRUCTION_SOURCE_TABLE"&&t.chartRepresentationRendered===false&&
    Array.isArray(t.rows)&&t.rows.length===4&&t.rows.every((r,i)=>r.displayCategory===LABELS[i]&&
      (spec.inputMode==="COUNTS"?r.displayValue===String(p.counts[i]):r.displayValue===String(p.percents[i])+"%")));
}
function normalizeAngles(submitted){
  if(Array.isArray(submitted))return submitted.map(Number);
  const s=String(submitted??"").trim();
  const nums=s.match(/\d+(?:\.\d+)?/g)?.map(Number)??[];
  return nums.length===4?nums:null;
}
export function validateG6BU06P08F21Answer(q,submitted){
  const a=normalizeAngles(submitted),e=[];
  if(!a||a.length!==4||a.some(x=>!Number.isInteger(x)))e.push("P08F21_ANSWER_ANGLE_PLAN_INVALID");
  if(a&&JSON.stringify(a)!==JSON.stringify(q?.answerValue))e.push("P08F21_ANSWER_ANGLE_PLAN_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:a?Object.freeze(a):null});
}
export function validateG6BU06P08F21Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P08F21_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F21_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P08F21_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F21_MODE_INVALID");
  const p=q?.patternRepresentation;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P08F21_REPRESENTATION_INVALID");
  if(spec&&p){
    const x=payload(spec,p.variant);
    if(p.inputMode!==spec.inputMode||JSON.stringify({...x.p,inputMode:spec.inputMode})!==JSON.stringify(p))e.push("P08F21_PAYLOAD_INVALID");
    if(!tableValid(q.tableData,spec,x.p)||JSON.stringify(q.tableData)!==JSON.stringify(x.tableData))e.push("P08F21_SOURCE_TABLE_INVALID");
    if(!chartValid(q.chartData,"question")||!chartValid(q.answerChartData,"answer"))e.push("P08F21_CHART_MODEL_INVALID");
    if(JSON.stringify(q.chartData)!==JSON.stringify(x.chartData)||JSON.stringify(q.answerChartData)!==JSON.stringify(x.answerChartData))e.push("P08F21_CHART_PARITY_INVALID");
    if(q.promptText!==x.promptText||q.answerText!==x.answerText||JSON.stringify(q.answerValue)!==JSON.stringify(x.p.angles)||q.questionSignature!==signature(q))e.push("P08F21_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(x.p.percents.reduce((a,b)=>a+b,0)!==100||x.p.angles.reduce((a,b)=>a+b,0)!==360)e.push("P08F21_CLOSURE_INVALID");
    if(spec.inputMode==="COUNTS"&&x.p.counts.reduce((a,b)=>a+b,0)!==x.p.totalCount)e.push("P08F21_COUNT_TOTAL_INVALID");
    if(!validateG6BU06P08F21Answer(q,q.answerValue).ok)e.push("P08F21_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||(m.appliedRuntimeModifierIds??[]).length!==0||
    !m.ratioPercentReasoningBound||!m.ratioRateValidatorBound||!m.fractionNumberSystemContractBound||!m.textApplicationRepresentationBound||
    !m.constructPieChartOwned||!m.classifiedDataToProportionUsed||!m.percentToCentralAngleConsumedAsPrerequisite||
    !m.sectorAllocationByAngleUsed||!m.fullCircle100Percent360DegreesBound||!m.constructionChartRepresentationUsed||
    m.q014PartWholeTeachingReowned||m.q016ComparePieChartsTeachingReowned||m.q021W7QuantityFromRateTeachingReowned||
    m.q018PercentAngleTeachingReowned||m.genericSectorGeometryTeachingUsed||m.applicationContextUsed||m.sameUnitMixedUsed||
    m.crossUnitMixedUsed||m.q022OrLaterTouched||m.r04Reclassified||m.r05AssignmentMutated||m.humanVisualReviewRequired!==true)
    e.push("P08F21_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["支出金額","比較兩個圓形圖","扇形面積"])if(learner.includes(term))e.push("P08F21_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU06P08F21Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F21_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],
    specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F21_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F21_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const v=(hash(o.generationSeed??"p08f21-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*97)%240;
    questions.push(buildG6BU06P08F21Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6BU06P08F21Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F21_DUPLICATE_SIGNATURE");
  return Object.freeze({
    ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240
  });
}
