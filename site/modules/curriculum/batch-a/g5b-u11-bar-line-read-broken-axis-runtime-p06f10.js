import {G5B_U11_P06F10_FORMAL_MAPPINGS as MAPPINGS,G5B_U11_P06F10_PATTERN_GROUPS as GROUPS,G5B_U11_P06F10_PATTERN_SPECS as SPECS,G5B_U11_P06F10_QUEUE_REQUIRED_CAPABILITY_IDS as REQUIRED,G5B_U11_P06F10_READ_KP_ID as READ_KP,G5B_U11_P06F10_SCALE_KP_ID as SCALE_KP,G5B_U11_P06F10_SOURCE_ID as SRC,G5B_U11_P06F10_SPEC_IDS as SPEC_IDS,G5B_U11_P06F10_TARGET_KP_IDS as TARGETS} from "../registry/g5b-u11-bar-line-read-broken-axis-selector-projection-p06f10.js";
export const G5B_U11_P06F10_MAX_QUESTION_COUNT=240;
export const G5B_U11_P06F10_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x])),GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
const LABELS=Object.freeze(["一月","二月","三月","四月"]);
const mod=(n,m)=>((n%m)+m)%m;
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
function params(v,{omitted=false}={}){
  const u=mod(v,240),steps=[2,5,10,20],scaleStep=steps[u%4],tickCount=4+(Math.floor(u/4)%3);
  const axisStart=omitted?[20,50,100,200][Math.floor(u/12)%4]:0;
  const targetIndex=Math.floor(u/48)%4;
  const shift=Math.floor(u/16)%tickCount;
  const levels=Object.freeze(LABELS.map((_,i)=>1+mod(shift+i,tickCount)));
  const values=Object.freeze(levels.map(level=>axisStart+level*scaleStep));
  return Object.freeze({variant:u,scaleStep,tickCount,axisStart,targetIndex,levels,values,maxValue:axisStart+scaleStep*tickCount});
}
function barModel(p,core){
  return Object.freeze({kind:"bar_chart_data",title:"每月數量",xAxisLabel:"月份",yAxisLabel:"數量",legendLabel:"資料甲",scaleStep:p.scaleStep,tickCount:p.tickCount,axisStart:p.axisStart,maxValue:p.maxValue,omittedAxisStart:p.axisStart>0,bars:Object.freeze(LABELS.map((label,i)=>Object.freeze({label,value:p.values[i],level:p.levels[i],masked:false,highlighted:i===p.targetIndex}))),semanticCore:core,axisScaleMode:"LABELED_COMMON_SCALE",ariaLabel:"長條圖資料報讀"});
}
function lineModel(p,core){
  return Object.freeze({kind:"line_chart_data",title:"每月數量",xAxisLabel:"月份",yAxisLabel:"數量",legendLabel:"資料甲",scaleStep:p.scaleStep,tickCount:p.tickCount,axisStart:p.axisStart,maxValue:p.maxValue,omittedAxisStart:p.axisStart>0,points:Object.freeze(LABELS.map((label,i)=>Object.freeze({label,value:p.values[i],level:p.levels[i],highlighted:i===p.targetIndex}))),semanticCore:core,axisScaleMode:"LABELED_COMMON_SCALE",ariaLabel:"折線圖資料報讀"});
}
function payload(kp,specId,v){
  const spec=BY_SPEC.get(specId);
  if(!spec||spec.knowledgePointId!==kp)throw new Error(`P06F10_UNKNOWN_PATTERN_SPEC:${kp}:${specId}`);
  const p=params(v,{omitted:spec.omittedAxisStart});
  const chartData=spec.representation==="bar_chart_data"?barModel(p,spec.semanticCore):lineModel(p,spec.semanticCore);
  const answer=p.values[p.targetIndex];
  const kind=spec.representation==="bar_chart_data"?"長條圖":"折線圖";
  const promptText=spec.omittedAxisStart
    ?`注意縱軸起點省略。依${kind}的標題、座標軸、圖例與刻度，「${LABELS[p.targetIndex]}」的數值是多少？`
    :`依${kind}的標題、座標軸、圖例與每格 ${p.scaleStep} 的刻度，「${LABELS[p.targetIndex]}」的數值是多少？`;
  return Object.freeze({p,spec,chartData,promptText,answer});
}
function signature(x){return [x.spec.patternSpecId,x.p.variant,x.p.scaleStep,x.p.tickCount,x.p.axisStart,x.p.targetIndex,x.p.values.join(",")].join("|");}
function chartValid(c,spec){
  if(!c||c.kind!==spec.representation||c.semanticCore!==spec.semanticCore||c.axisScaleMode!=="LABELED_COMMON_SCALE"||c.title!=="每月數量"||c.xAxisLabel!=="月份"||c.yAxisLabel!=="數量"||c.legendLabel!=="資料甲")return false;
  if(!Number.isInteger(c.scaleStep)||c.scaleStep<=1||!Number.isInteger(c.tickCount)||c.tickCount<2||c.tickCount>8||!Number.isInteger(c.axisStart)||c.axisStart<0||c.maxValue!==c.axisStart+c.scaleStep*c.tickCount||c.omittedAxisStart!==(c.axisStart>0))return false;
  const items=c.kind==="bar_chart_data"?c.bars:c.points;
  if(!Array.isArray(items)||items.length!==4||items.some((x,i)=>x.label!==LABELS[i]||!Number.isInteger(x.value)||x.value<c.axisStart||x.value>c.maxValue||(x.value-c.axisStart)%c.scaleStep!==0||!Number.isInteger(x.level)||x.value!==c.axisStart+x.level*c.scaleStep||typeof x.highlighted!=="boolean"))return false;
  if(items.filter(x=>x.highlighted).length!==1)return false;
  if(c.kind==="bar_chart_data"&&items.some(x=>x.masked!==false))return false;
  return true;
}
export function buildG5BU11P06F10Question({knowledgePointId=READ_KP,variant=0,patternSpecId=null}={}){
  if(!TARGETS.includes(knowledgePointId))throw new Error(`P06F10_UNKNOWN_KP:${knowledgePointId}`);
  const own=SPECS.filter(x=>x.knowledgePointId===knowledgePointId),spec=patternSpecId?BY_SPEC.get(patternSpecId):own[0];
  const x=payload(knowledgePointId,spec?.patternSpecId,variant),group=GROUP_BY_KP.get(knowledgePointId),answer=x.answer;
  return Object.freeze({id:`p06f10-${x.spec.patternSpecId}-v${x.p.variant}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId,patternGroupId:group.patternGroupId,patternSpecId:x.spec.patternSpecId,relation:x.spec.relation,variant:x.p.variant,questionMode:"numeric",mode:"numeric",promptText:x.promptText,blankedDisplayText:x.promptText,displayText:`${x.promptText} 答案：${answer}`,answerValue:answer,answerText:String(answer),chartData:x.chartData,questionSignature:signature(x),metadata:Object.freeze({taskId:"P06F_W6DirectProductVerticalSlice010Implementation",sourceId:SRC,knowledgePointId,runtimeProfileId:"profile_chart_data",sourceEvidencePages:Object.freeze([1,2]),sourceSemanticCore:x.spec.semanticCore,requiredW6CapabilityIds:REQUIRED,chartDataModelUsed:true,dataDomainValidatorUsed:true,chartRepresentationUsed:true,tableDataDependencyClosureUsed:true,titleAxisLegendUsed:true,commonLabeledScaleUsed:true,nonUnitScaleUsed:true,omittedAxisStartUsed:x.spec.omittedAxisStart,visualHeightNotUsedAsValue:true,barChartReadingUsed:x.spec.representation==="bar_chart_data",lineChartPointReadingUsed:x.spec.representation==="line_chart_data",lineChartTrendAsTargetUsed:false,twoSeriesComparisonAsTargetUsed:false,lineChartConstructionAsTargetUsed:false,q012FutureKpReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q011OrLaterTouched:false,r04Reclassified:false,sharedRuntimeScope:G5B_U11_P06F10_SHARED_RUNTIME_SCOPE})});
}
export function validateG5BU11P06F10Question(q){
  const e=[];
  if(!q||q.sourceId!==SRC||q.sourceNodeId!==SRC||!TARGETS.includes(q.knowledgePointId)||!SPEC_IDS.includes(q.patternSpecId))e.push("P06F10_IDENTITY_INVALID");
  const spec=BY_SPEC.get(q?.patternSpecId);
  if(spec&&(q.knowledgePointId!==spec.knowledgePointId||q.relation!==spec.relation))e.push("P06F10_RELATION_INVALID");
  if(spec&&!chartValid(q?.chartData,spec))e.push("P06F10_CHART_MODEL_INVALID");
  const p=params(q?.variant??0,{omitted:spec?.omittedAxisStart===true}),expectedAnswer=p.values[p.targetIndex];
  if(!Number.isInteger(q?.answerValue)||q.answerText!==String(q.answerValue)||q.answerValue!==expectedAnswer)e.push("P06F10_ANSWER_INVALID");
  const md=q?.metadata??{};
  if(md.runtimeProfileId!=="profile_chart_data"||md.sourceSemanticCore!==spec?.semanticCore||JSON.stringify(md.requiredW6CapabilityIds)!==JSON.stringify(REQUIRED)||!md.chartDataModelUsed||!md.dataDomainValidatorUsed||!md.chartRepresentationUsed||!md.tableDataDependencyClosureUsed||!md.titleAxisLegendUsed||!md.commonLabeledScaleUsed||!md.nonUnitScaleUsed||!md.visualHeightNotUsedAsValue||md.omittedAxisStartUsed!==(spec?.omittedAxisStart===true)||md.barChartReadingUsed!==(spec?.representation==="bar_chart_data")||md.lineChartPointReadingUsed!==(spec?.representation==="line_chart_data")||md.lineChartTrendAsTargetUsed||md.twoSeriesComparisonAsTargetUsed||md.lineChartConstructionAsTargetUsed||md.q012FutureKpReowned||md.applicationContextUsed||md.sameUnitMixedUsed||md.crossUnitMixedUsed||md.q011OrLaterTouched||md.r04Reclassified)e.push("P06F10_SCOPE_INVALID");
  if(spec){
    const expected=buildG5BU11P06F10Question({knowledgePointId:q.knowledgePointId,variant:q.variant,patternSpecId:q.patternSpecId});
    if(q.questionSignature!==expected.questionSignature||q.promptText!==expected.promptText||q.answerValue!==expected.answerValue||JSON.stringify(q.chartData)!==JSON.stringify(expected.chartData))e.push("P06F10_DETERMINISTIC_CONTRACT_INVALID");
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG5BU11P06F10Answer(q,answer){const v=validateG5BU11P06F10Question(q),n=typeof answer==="number"?answer:Number(String(answer).trim());return Object.freeze({ok:v.ok&&Number.isInteger(n)&&n===q.answerValue,errors:v.ok?(Number.isInteger(n)&&n===q.answerValue?Object.freeze([]):Object.freeze(["P06F10_ANSWER_MISMATCH"])):v.errors});}
export function generateG5BU11P06F10Questions(o={}){
  const kp=TARGETS.includes(o.knowledgePointId)?o.knowledgePointId:READ_KP,count=Number.isInteger(o.questionCount)?o.questionCount:20;
  if(count<1||count>G5B_U11_P06F10_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F10_QUESTION_COUNT_INVALID"]),warnings:Object.freeze([])});
  const own=SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId),requested=Array.isArray(o.patternSpecIds)?o.patternSpecIds.filter(id=>own.includes(id)):[],ids=requested.length?requested:own,start=hash(o.generationSeed??`p06f10-${kp}`)%240,questions=[];
  for(let i=0;i<count;i++)questions.push(buildG5BU11P06F10Question({knowledgePointId:kp,variant:(start+i)%240,patternSpecId:ids[i%ids.length]}));
  const errors=questions.flatMap(q=>validateG5BU11P06F10Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P06F10_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),formalMappings:MAPPINGS.filter(x=>x.knowledgePointId===kp),patternSpecs:SPECS.filter(x=>x.knowledgePointId===kp)});
}
