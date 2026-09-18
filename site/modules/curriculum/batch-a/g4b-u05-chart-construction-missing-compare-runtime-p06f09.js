import {G4B_U05_P06F09_COMPARE_KP_ID as COMPARE_KP,G4B_U05_P06F09_CONSTRUCTION_KP_ID as CONSTRUCT_KP,G4B_U05_P06F09_FORMAL_MAPPINGS as MAPPINGS,G4B_U05_P06F09_MISSING_KP_ID as MISSING_KP,G4B_U05_P06F09_PATTERN_GROUPS as GROUPS,G4B_U05_P06F09_PATTERN_SPECS as SPECS,G4B_U05_P06F09_QUEUE_REQUIRED_CAPABILITY_IDS as REQUIRED,G4B_U05_P06F09_SOURCE_ID as SRC,G4B_U05_P06F09_SPEC_IDS as SPEC_IDS,G4B_U05_P06F09_TARGET_KP_IDS as TARGETS} from "../registry/g4b-u05-chart-construction-missing-compare-selector-projection-p06f09.js";
export const G4B_U05_P06F09_MAX_QUESTION_COUNT=240;
export const G4B_U05_P06F09_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x])),GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
const mod=(n,m)=>((n%m)+m)%m;
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const LABELS=Object.freeze(["甲","乙","丙","丁"]);
function params(v){
  const u=mod(v,240),steps=[2,5,10,20],scaleStep=steps[u%steps.length],tickCount=4+(Math.floor(u/4)%3),targetIndex=Math.floor(u/12)%4;
  const shift=Math.floor(u/48)%tickCount;
  const levels=Object.freeze(LABELS.map((_,i)=>1+mod(shift+i,tickCount)));
  const values=Object.freeze(levels.map(x=>x*scaleStep));
  const pairA=(targetIndex+1)%4,pairB=(pairA+1+(Math.floor(u/3)%2))%4;
  return Object.freeze({variant:u,scaleStep,tickCount,targetIndex,levels,values,pairA,pairB});
}
function chartModel(p,semanticCore,{maskedIndex=null}={}){
  return Object.freeze({kind:"bar_chart_data",title:"長條圖",xAxisLabel:"類別",yAxisLabel:"數量",scaleStep:p.scaleStep,tickCount:p.tickCount,maxValue:p.scaleStep*p.tickCount,bars:Object.freeze(LABELS.map((label,i)=>Object.freeze({label,value:p.values[i],level:p.levels[i],masked:i===maskedIndex}))),semanticCore,axisScaleMode:"COMMON_SCALE",ariaLabel:semanticCore==="BAR_CHART_CONSTRUCTION"?"依資料繪製長條圖":semanticCore==="CHART_MISSING_VALUE_TOTAL"?"長條圖缺值":"多類別長條圖比較"});
}
function sourceTable(p){
  return Object.freeze({kind:"one_way_statistics_table",headers:Object.freeze(["類別","數量"]),rows:Object.freeze(LABELS.map((category,i)=>Object.freeze({category,value:p.values[i],displayCategory:category,displayValue:String(p.values[i])}))),semanticCore:"BAR_CHART_CONSTRUCTION_SOURCE_TABLE",chartRepresentationRendered:false,ariaLabel:"長條圖來源資料表"});
}
function payload(kp,v){
  const spec=SPECS.find(x=>x.knowledgePointId===kp);
  if(!spec)throw new Error(`P06F09_UNKNOWN_KP:${kp}`);
  const p=params(v);
  if(kp===CONSTRUCT_KP){
    const tableData=sourceTable(p),chartData=chartModel(p,spec.semanticCore,{maskedIndex:p.targetIndex}),answerChartData=chartModel(p,spec.semanticCore),answer=p.values[p.targetIndex];
    return Object.freeze({p,spec,tableData,chartData,answerChartData,promptText:`依資料表與共同刻度完成長條圖。「${LABELS[p.targetIndex]}」的長條應畫到多少？`,answer});
  }
  if(kp===MISSING_KP){
    const chartData=chartModel(p,spec.semanticCore,{maskedIndex:p.targetIndex}),answerChartData=chartModel(p,spec.semanticCore),total=p.values.reduce((a,b)=>a+b,0),answer=p.values[p.targetIndex];
    return Object.freeze({p,spec,tableData:null,chartData,answerChartData,total,promptText:`圖中四類合計是 ${total}。「${LABELS[p.targetIndex]}」的缺值是多少？`,answer});
  }
  const chartData=chartModel(p,spec.semanticCore),a=p.values[p.pairA],b=p.values[p.pairB],answer=Math.abs(a-b);
  return Object.freeze({p,spec,tableData:null,chartData,answerChartData:chartData,promptText:`依相同刻度比較「${LABELS[p.pairA]}」與「${LABELS[p.pairB]}」，兩者相差多少？`,answer});
}
function signature(x){return [x.spec.patternSpecId,x.p.variant,x.p.scaleStep,x.p.tickCount,x.p.targetIndex,x.p.values.join(","),x.p.pairA,x.p.pairB,x.total??"n"].join("|");}
function maskedCount(c){return c?.bars?.filter(b=>b.masked===true).length??0;}
function chartValid(c,core,{masked=null}={}){
  if(!c||c.kind!=="bar_chart_data"||c.semanticCore!==core||c.axisScaleMode!=="COMMON_SCALE"||!Number.isInteger(c.scaleStep)||c.scaleStep<=0||!Number.isInteger(c.tickCount)||c.tickCount<2||c.tickCount>8||c.maxValue!==c.scaleStep*c.tickCount||!Array.isArray(c.bars)||c.bars.length!==4)return false;
  if(c.bars.some((b,i)=>b.label!==LABELS[i]||!Number.isInteger(b.value)||b.value<0||b.value>c.maxValue||b.value%c.scaleStep!==0||!Number.isInteger(b.level)||b.value!==b.level*c.scaleStep||typeof b.masked!=="boolean"))return false;
  if(masked!==null&&maskedCount(c)!==masked)return false;
  return true;
}
function tableValid(t,p){
  return Boolean(t&&t.kind==="one_way_statistics_table"&&t.semanticCore==="BAR_CHART_CONSTRUCTION_SOURCE_TABLE"&&t.chartRepresentationRendered===false&&Array.isArray(t.rows)&&t.rows.length===4&&t.rows.every((r,i)=>r.category===LABELS[i]&&r.value===p.values[i]&&r.displayCategory===LABELS[i]&&r.displayValue===String(p.values[i])));
}
export function buildG4BU05P06F09Question({knowledgePointId=CONSTRUCT_KP,variant=0}={}){
  if(!TARGETS.includes(knowledgePointId))throw new Error(`P06F09_UNKNOWN_KP:${knowledgePointId}`);
  const x=payload(knowledgePointId,variant),spec=x.spec,group=GROUP_BY_KP.get(knowledgePointId),answer=x.answer;
  return Object.freeze({id:`p06f09-${spec.patternSpecId}-v${x.p.variant}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId,patternGroupId:group.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,variant:x.p.variant,questionMode:"numeric",mode:"numeric",promptText:x.promptText,blankedDisplayText:x.promptText,displayText:`${x.promptText} 答案：${answer}`,answerValue:answer,answerText:String(answer),tableData:x.tableData,chartData:x.chartData,answerChartData:x.answerChartData,questionSignature:signature(x),metadata:Object.freeze({taskId:"P06F_W6DirectProductVerticalSlice009Implementation",sourceId:SRC,knowledgePointId,runtimeProfileId:"profile_chart_data",sourceEvidencePages:Object.freeze([1,2]),sourceSemanticCore:spec.semanticCore,requiredW6CapabilityIds:REQUIRED,chartDataModelUsed:true,dataDomainValidatorUsed:true,chartRepresentationUsed:true,tableDataDependencyClosureUsed:true,sourceTableProjectionUsed:knowledgePointId===CONSTRUCT_KP,commonScaleUsed:true,barChartConstructionUsed:knowledgePointId===CONSTRUCT_KP,missingValueTotalUsed:knowledgePointId===MISSING_KP,multiCategoryComparisonUsed:knowledgePointId===COMPARE_KP,q007PredecessorReowned:false,lineChartUsed:false,pieChartUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q010OrLaterTouched:false,r04Reclassified:false,sharedRuntimeScope:G4B_U05_P06F09_SHARED_RUNTIME_SCOPE})});
}
export function validateG4BU05P06F09Question(q){
  const e=[];
  if(!q||q.sourceId!==SRC||q.sourceNodeId!==SRC||!TARGETS.includes(q.knowledgePointId)||!SPEC_IDS.includes(q.patternSpecId))e.push("P06F09_IDENTITY_INVALID");
  const spec=BY_SPEC.get(q?.patternSpecId);
  if(spec&&(q.knowledgePointId!==spec.knowledgePointId||q.relation!==spec.relation))e.push("P06F09_RELATION_INVALID");
  const p=params(q?.variant??0),core=spec?.semanticCore;
  const expectedMasked=q?.knowledgePointId===COMPARE_KP?0:1;
  if(!chartValid(q?.chartData,core,{masked:expectedMasked})||!chartValid(q?.answerChartData,core,{masked:0}))e.push("P06F09_CHART_MODEL_INVALID");
  if(q?.knowledgePointId===CONSTRUCT_KP&&!tableValid(q?.tableData,p))e.push("P06F09_SOURCE_TABLE_INVALID");
  if(q?.knowledgePointId!==CONSTRUCT_KP&&q?.tableData!==null)e.push("P06F09_UNEXPECTED_TABLE");
  if(q?.chartData&&q?.answerChartData){
    const qValues=q.chartData.bars.map(b=>b.value),aValues=q.answerChartData.bars.map(b=>b.value);
    if(JSON.stringify(qValues)!==JSON.stringify(aValues))e.push("P06F09_CHART_ANSWER_PARITY_INVALID");
  }
  let expectedAnswer=null;
  if(q?.knowledgePointId===CONSTRUCT_KP)expectedAnswer=p.values[p.targetIndex];
  else if(q?.knowledgePointId===MISSING_KP)expectedAnswer=p.values[p.targetIndex];
  else if(q?.knowledgePointId===COMPARE_KP)expectedAnswer=Math.abs(p.values[p.pairA]-p.values[p.pairB]);
  if(!Number.isInteger(q?.answerValue)||q.answerText!==String(q.answerValue)||q.answerValue!==expectedAnswer)e.push("P06F09_ANSWER_INVALID");
  const md=q?.metadata??{};
  if(md.runtimeProfileId!=="profile_chart_data"||md.sourceSemanticCore!==core||JSON.stringify(md.requiredW6CapabilityIds)!==JSON.stringify(REQUIRED)||!md.chartDataModelUsed||!md.dataDomainValidatorUsed||!md.chartRepresentationUsed||!md.tableDataDependencyClosureUsed||!md.commonScaleUsed||md.q007PredecessorReowned||md.lineChartUsed||md.pieChartUsed||md.applicationContextUsed||md.sameUnitMixedUsed||md.crossUnitMixedUsed||md.q010OrLaterTouched||md.r04Reclassified)e.push("P06F09_SCOPE_INVALID");
  if(q?.knowledgePointId===CONSTRUCT_KP&&(!md.sourceTableProjectionUsed||!md.barChartConstructionUsed||md.missingValueTotalUsed||md.multiCategoryComparisonUsed))e.push("P06F09_CONSTRUCTION_SCOPE_INVALID");
  if(q?.knowledgePointId===MISSING_KP&&(md.sourceTableProjectionUsed||md.barChartConstructionUsed||!md.missingValueTotalUsed||md.multiCategoryComparisonUsed))e.push("P06F09_MISSING_SCOPE_INVALID");
  if(q?.knowledgePointId===COMPARE_KP&&(md.sourceTableProjectionUsed||md.barChartConstructionUsed||md.missingValueTotalUsed||!md.multiCategoryComparisonUsed))e.push("P06F09_COMPARE_SCOPE_INVALID");
  if(spec){
    const expected=buildG4BU05P06F09Question({knowledgePointId:q.knowledgePointId,variant:q.variant});
    if(q.questionSignature!==expected.questionSignature||q.promptText!==expected.promptText||q.answerValue!==expected.answerValue||JSON.stringify(q.tableData)!==JSON.stringify(expected.tableData)||JSON.stringify(q.chartData)!==JSON.stringify(expected.chartData)||JSON.stringify(q.answerChartData)!==JSON.stringify(expected.answerChartData))e.push("P06F09_DETERMINISTIC_CONTRACT_INVALID");
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG4BU05P06F09Answer(q,answer){const v=validateG4BU05P06F09Question(q),n=typeof answer==="number"?answer:Number(String(answer).trim());return Object.freeze({ok:v.ok&&Number.isInteger(n)&&n===q.answerValue,errors:v.ok?(Number.isInteger(n)&&n===q.answerValue?Object.freeze([]):Object.freeze(["P06F09_ANSWER_MISMATCH"])):v.errors});}
export function generateG4BU05P06F09Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:20;
  if(count<1||count>G4B_U05_P06F09_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F09_QUESTION_COUNT_INVALID"]),warnings:Object.freeze([])});
  const kp=TARGETS.includes(o.knowledgePointId)?o.knowledgePointId:TARGETS[0],start=hash(o.generationSeed??"p06f09-chart-data")%240,questions=[];
  for(let i=0;i<count;i++)questions.push(buildG4BU05P06F09Question({knowledgePointId:kp,variant:(start+i)%240}));
  const errors=questions.flatMap(q=>validateG4BU05P06F09Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P06F09_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),formalMappings:MAPPINGS.filter(x=>x.knowledgePointId===kp),patternSpecs:SPECS.filter(x=>x.knowledgePointId===kp)});
}
