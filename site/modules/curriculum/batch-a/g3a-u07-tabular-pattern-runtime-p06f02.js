import {G3A_U07_P06F02_FORMAL_MAPPING as MAPPING,G3A_U07_P06F02_INCLUDED_RELATIONS as RELATIONS,G3A_U07_P06F02_KP_ID as KP,G3A_U07_P06F02_PATTERN_GROUP as GROUP,G3A_U07_P06F02_PATTERN_SPECS as SPECS,G3A_U07_P06F02_SOURCE_ID as SRC,G3A_U07_P06F02_SPEC_IDS as SPEC_IDS} from "../registry/g3a-u07-tabular-pattern-selector-projection-p06f02.js";
export const G3A_U07_P06F02_MAX_QUESTION_COUNT=240;
export const G3A_U07_P06F02_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
function params(v){const u=mod(v,240);return Object.freeze({variant:u,factor:2+(u%8),offset:Math.floor(u/8)%10,band:Math.floor(u/80)});}
const output=(p,input)=>p.factor*input+p.offset;
function tableModel(headers,rows,p,target=null){
  return Object.freeze({
    kind:"tabular_pattern_table",
    headers:Object.freeze(headers),
    rows:Object.freeze(rows.map(r=>Object.freeze({...r}))),
    mapping:Object.freeze({kind:"AFFINE_INTEGER_CORRESPONDENCE",factor:p.factor,offset:p.offset,symbolicFormulaExposed:false}),
    target:target?Object.freeze({...target}):null,
    ariaLabel:"階段與數量對應表"
  });
}
function buildPayload(specId,v){
  const p=params(v),spec=BY_SPEC.get(specId);
  if(!spec)throw new Error(`P06F02_UNKNOWN_PATTERN_SPEC:${specId}`);
  if(specId===SPEC_IDS[0]){
    const inputs=[1+p.band,2+p.band,3+p.band,4+p.band],blankIndex=p.variant%4;
    const rows=inputs.map((input,i)=>{const y=output(p,input);return {input,output:y,displayInput:String(input),displayOutput:i===blankIndex?"□":String(y)};});
    const answer=rows[blankIndex].output;
    return Object.freeze({p,spec,tableData:tableModel(["階段","數量"],rows,p,{rowIndex:blankIndex,field:"output"}),promptText:"觀察表格，每一列都依照同一個對應規則。□ 應填多少？",answer});
  }
  if(specId===SPEC_IDS[1]){
    const inputs=[1+p.band,3+p.band,5+p.band,7+p.band],blankIndex=Math.floor(p.variant/4)%4;
    const rows=inputs.map((input,i)=>{const y=output(p,input);return {input,output:y,displayInput:i===blankIndex?"□":String(input),displayOutput:String(y)};});
    const answer=rows[blankIndex].input;
    return Object.freeze({p,spec,tableData:tableModel(["階段","數量"],rows,p,{rowIndex:blankIndex,field:"input"}),promptText:"觀察表格，每一列都依照同一個對應規則。□ 應填哪一個階段？",answer});
  }
  const inputs=[1+p.band,2+p.band,4+p.band],rows=inputs.map(input=>{const y=output(p,input);return {input,output:y,displayInput:String(input),displayOutput:String(y)};}),targetInput=6+p.band+(p.variant%2),answer=output(p,targetInput);
  return Object.freeze({p,spec,tableData:tableModel(["階段","數量"],rows,p,null),promptText:`觀察表格，每一列都依照同一個對應規則。階段 ${targetInput} 對應的數量是多少？`,answer,targetInput});
}
function signature(payload){const m=payload.tableData.mapping,t=payload.tableData.target;return [payload.spec.patternSpecId,m.factor,m.offset,payload.p.band,t?.rowIndex??"n",t?.field??"n",payload.targetInput??"n"].join("|");}
export function buildG3AU07P06F02Question({variant=0,patternSpecId=SPEC_IDS[0]}={}){
  const payload=buildPayload(patternSpecId,variant),spec=payload.spec,answer=payload.answer;
  return Object.freeze({
    id:`p06f02-${spec.patternSpecId}-v${payload.p.variant}`,
    sourceId:SRC,
    knowledgePointId:KP,
    patternGroupId:GROUP.patternGroupId,
    patternSpecId:spec.patternSpecId,
    relation:spec.relation,
    variant:payload.p.variant,
    promptText:payload.promptText,
    blankedDisplayText:payload.promptText,
    displayText:`${payload.promptText} 答案：${answer}`,
    answerValue:answer,
    answerText:String(answer),
    tableData:payload.tableData,
    questionSignature:signature(payload),
    metadata:Object.freeze({
      sourceId:SRC,
      knowledgePointId:KP,
      runtimeProfileId:"profile_table_data",
      sourceEvidencePage:1,
      sourceBackedTabularPatternRule:true,
      tableDataModelUsed:true,
      dataDomainValidatorUsed:true,
      tableRepresentationUsed:true,
      chartDataModelUsed:false,
      q001PatternRelationReowned:false,
      symbolicNthTermFormulaUsed:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q003OrLaterTouched:false,
      sharedRuntimeScope:G3A_U07_P06F02_SHARED_RUNTIME_SCOPE
    })
  });
}
export function validateG3AU07P06F02Question(q){
  const e=[];
  if(!q||q.sourceId!==SRC||q.knowledgePointId!==KP||q.patternGroupId!==GROUP.patternGroupId||!SPEC_IDS.includes(q.patternSpecId))e.push("P06F02_IDENTITY_INVALID");
  const spec=BY_SPEC.get(q?.patternSpecId);
  if(spec&&q.relation!==spec.relation)e.push("P06F02_RELATION_INVALID");
  const t=q?.tableData,m=t?.mapping;
  if(!t||t.kind!=="tabular_pattern_table"||!Array.isArray(t.rows)||t.rows.length<3||!m||m.kind!=="AFFINE_INTEGER_CORRESPONDENCE"||m.symbolicFormulaExposed!==false)e.push("P06F02_TABLE_MODEL_INVALID");
  if(m&&(!Number.isInteger(m.factor)||m.factor<2||m.factor>9||!Number.isInteger(m.offset)||m.offset<0||m.offset>9))e.push("P06F02_MAPPING_PARAMETER_INVALID");
  if(Array.isArray(t?.rows)&&m&&t.rows.some(r=>!Number.isInteger(r.input)||!Number.isInteger(r.output)||r.output!==m.factor*r.input+m.offset))e.push("P06F02_ROW_CORRESPONDENCE_INVALID");
  if(!Number.isInteger(q?.answerValue)||q.answerText!==String(q.answerValue))e.push("P06F02_ANSWER_INVALID");
  if(q?.metadata?.runtimeProfileId!=="profile_table_data"||!q?.metadata?.tableDataModelUsed||!q?.metadata?.dataDomainValidatorUsed||!q?.metadata?.tableRepresentationUsed||q?.metadata?.chartDataModelUsed||q?.metadata?.q001PatternRelationReowned||q?.metadata?.symbolicNthTermFormulaUsed||q?.metadata?.applicationContextUsed||q?.metadata?.sameUnitMixedUsed||q?.metadata?.crossUnitMixedUsed||q?.metadata?.q003OrLaterTouched)e.push("P06F02_SCOPE_INVALID");
  if(spec){
    const expected=buildG3AU07P06F02Question({variant:q.variant,patternSpecId:q.patternSpecId});
    if(q.questionSignature!==expected.questionSignature||q.promptText!==expected.promptText||q.answerValue!==expected.answerValue||JSON.stringify(q.tableData)!==JSON.stringify(expected.tableData))e.push("P06F02_DETERMINISTIC_CONTRACT_INVALID");
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG3AU07P06F02Answer(q,answer){
  const v=validateG3AU07P06F02Question(q),n=typeof answer==="number"?answer:Number(String(answer).trim());
  return Object.freeze({ok:v.ok&&Number.isInteger(n)&&n===q.answerValue,errors:v.ok?(Number.isInteger(n)&&n===q.answerValue?Object.freeze([]):Object.freeze(["P06F02_ANSWER_MISMATCH"])):v.errors});
}
export function generateG3AU07P06F02Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:20;
  if(count<1||count>G3A_U07_P06F02_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P06F02_QUESTION_COUNT_INVALID"]),warnings:Object.freeze([])});
  const requested=Array.isArray(o.patternSpecIds)?o.patternSpecIds.filter(id=>SPEC_IDS.includes(id)):[];
  const ids=requested.length?requested:[...SPEC_IDS],start=hash(o.generationSeed??"p06f02-tabular-pattern")%240,questions=[];
  for(let i=0;i<count;i++)questions.push(buildG3AU07P06F02Question({variant:(start+i)%240,patternSpecId:ids[i%ids.length]}));
  const errors=questions.flatMap(q=>validateG3AU07P06F02Question(q).errors);
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),formalMapping:MAPPING,patternSpecs:SPECS});
}
