export const G3A_U01_VISUAL_RANK01_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_VISUAL_RANK01_KP_ID = "kp_g3a_u01_4digit_compare";
export const G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID = "pg_g3a_u01_visual_one_way_table_compare";
export const G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID = "ps_g3a_u01_visual_one_way_table_compare";
export const G3A_U01_VISUAL_RANK01_MAX_QUESTION_COUNT = 240;
export const G3A_U01_VISUAL_RANK01_PROMPT_VARIANTS = Object.freeze([
  "MAXIMUM_CATEGORY","MINIMUM_CATEGORY","COMPARE_TWO_ROWS","UNIQUE_THRESHOLD_MATCH"
]);

const CONTEXTS = Object.freeze([
  Object.freeze({headers:Object.freeze(["學校","學生人數"]),categoryLabel:"學校",measureLabel:"學生人數",labels:Object.freeze(["光明國小","和平國小","育才國小","信義國小","成功國小","仁愛國小","民生國小","東方國小"])}),
  Object.freeze({headers:Object.freeze(["班級","回收瓶數"]),categoryLabel:"班級",measureLabel:"回收瓶數",labels:Object.freeze(["三年一班","三年二班","三年三班","三年四班","三年五班","三年六班","三年七班","三年八班"])}),
  Object.freeze({headers:Object.freeze(["月份","借閱冊數"]),categoryLabel:"月份",measureLabel:"借閱冊數",labels:Object.freeze(["一月","二月","三月","四月","五月","六月","七月","八月"])}),
  Object.freeze({headers:Object.freeze(["館別","藏書冊數"]),categoryLabel:"館別",measureLabel:"藏書冊數",labels:Object.freeze(["東館","西館","南館","北館","中央館","兒童館","新館","舊館"])}),
  Object.freeze({headers:Object.freeze(["場次","參觀人數"]),categoryLabel:"場次",measureLabel:"參觀人數",labels:Object.freeze(["上午第一場","上午第二場","上午第三場","上午第四場","下午第一場","下午第二場","下午第三場","下午第四場"])})
]);

function mod(n,m){ return ((n%m)+m)%m; }
function hash(value){ let h=2166136261; for(const c of String(value??"")){ h^=c.codePointAt(0); h=Math.imul(h,16777619); } return h>>>0; }
function rotate(values,offset){ const n=values.length,shift=mod(offset,n); return [...values.slice(shift),...values.slice(0,shift)]; }

function parameters(variant){
  const u=mod(variant,G3A_U01_VISUAL_RANK01_MAX_QUESTION_COUNT);
  const context=CONTEXTS[u%CONTEXTS.length];
  const rowCount=3+(u%6);
  const base=1200+((u*23)%6000);
  const ascending=Array.from({length:rowCount},(_,i)=>base+i*137+((u*(i+3)*17)%83));
  let values=rotate(ascending,u%rowCount);
  if(Math.floor(u/rowCount)%2===1) values=[...values].reverse();
  return Object.freeze({variant:u,context,rowCount,values:Object.freeze(values)});
}

function tableModel(p){
  return Object.freeze({
    kind:"one_way_statistics_table",
    headers:p.context.headers,
    rows:Object.freeze(p.context.labels.slice(0,p.rowCount).map((category,i)=>Object.freeze({
      category,value:p.values[i],displayCategory:category,displayValue:String(p.values[i])
    }))),
    semanticCore:"TABLE_DATA_COMPARISON",
    chartRepresentationRendered:false,
    ariaLabel:String(p.rowCount)+"列"+p.context.measureLabel+"比較表"
  });
}

function extrema(rows,direction){
  return rows.reduce((best,row)=>direction==="max"?(row.value>best.value?row:best):(row.value<best.value?row:best));
}

function makePayload(variant,promptVariant){
  if(!G3A_U01_VISUAL_RANK01_PROMPT_VARIANTS.includes(promptVariant)) throw new Error("g3a_u01_visual_rank01_prompt_variant_invalid");
  const p=parameters(variant),tableData=tableModel(p),rows=tableData.rows,c=p.context;
  let promptText,answerModel,threshold=null;
  if(promptVariant==="MAXIMUM_CATEGORY"){
    const target=extrema(rows,"max");
    promptText="根據表格，"+c.measureLabel+"最多的是哪一個"+c.categoryLabel+"？";
    answerModel=Object.freeze({promptVariant,selectedCategory:target.category,selectedValue:target.value,comparisonSymbol:null,comparedCategories:null});
  }else if(promptVariant==="MINIMUM_CATEGORY"){
    const target=extrema(rows,"min");
    promptText="根據表格，"+c.measureLabel+"最少的是哪一個"+c.categoryLabel+"？";
    answerModel=Object.freeze({promptVariant,selectedCategory:target.category,selectedValue:target.value,comparisonSymbol:null,comparedCategories:null});
  }else if(promptVariant==="COMPARE_TWO_ROWS"){
    const aIndex=(p.variant*3)%p.rowCount;
    const bIndex=(aIndex+1+(p.variant%(p.rowCount-1)))%p.rowCount;
    const a=rows[aIndex],b=rows[bIndex],winner=a.value>b.value?a:b,symbol=a.value>b.value?">":"<";
    promptText="根據表格，"+a.category+"和"+b.category+"相比，哪一個的"+c.measureLabel+"比較多？";
    answerModel=Object.freeze({promptVariant,selectedCategory:winner.category,selectedValue:winner.value,comparisonSymbol:symbol,comparedCategories:Object.freeze([a.category,b.category])});
  }else{
    const sorted=[...rows].sort((a,b)=>a.value-b.value);
    const relation=p.variant%2===0?">":"<";
    const target=relation===">"?sorted.at(-1):sorted[0];
    const neighbor=relation===">"?sorted.at(-2):sorted[1];
    const thresholdValue=Math.floor((target.value+neighbor.value)/2);
    threshold=Object.freeze({relation,value:thresholdValue});
    promptText="根據表格，哪一個"+c.categoryLabel+"的"+c.measureLabel+(relation===">"?"超過":"少於")+" "+thresholdValue+"？";
    answerModel=Object.freeze({promptVariant,selectedCategory:target.category,selectedValue:target.value,comparisonSymbol:null,comparedCategories:null});
  }
  return Object.freeze({p,tableData,promptText,answerModel,threshold});
}

function signature(payload){
  return [payload.p.variant,payload.answerModel.promptVariant,...payload.tableData.rows.flatMap(r=>[r.category,r.value]),payload.threshold?.relation??"n",payload.threshold?.value??"n"].join("|");
}

export function buildG3AU01VisualRank01Question({variant=0,promptVariant="MAXIMUM_CATEGORY",publicAdmission=false}={}){
  const x=makePayload(variant,promptVariant),a=x.answerModel;
  const answerText=a.selectedCategory+"（"+a.selectedValue+"）";
  return Object.freeze({
    id:"g3a-u01-rank01-"+x.p.variant+"-"+promptVariant.toLowerCase(),
    sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,
    knowledgePointId:G3A_U01_VISUAL_RANK01_KP_ID,
    patternGroupId:G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
    patternSpecId:G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID,
    kind:"visualOneWayTableCompare",
    variant:x.p.variant,promptVariant,
    promptText:x.promptText,questionText:x.promptText,blankedDisplayText:x.promptText,
    displayText:x.promptText+" 答案："+answerText,
    tableData:x.tableData,threshold:x.threshold,answerModel:a,
    answerValue:a.selectedValue,answerText,finalAnswer:answerText,
    questionSignature:signature(x),
    metadata:Object.freeze({
      patternId:G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID,
      sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,
      knowledgePointId:G3A_U01_VISUAL_RANK01_KP_ID,
      patternGroupId:G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
      canonicalSkillIds:Object.freeze(["number_comparison"]),
      skillTags:Object.freeze(["g3a_u01","four_digit_compare","visual_table"]),
      difficultyTags:Object.freeze(["visual_reading","rank01"]),
      curriculumNodeIds:Object.freeze([G3A_U01_VISUAL_RANK01_SOURCE_ID]),
      representation:"one-way-statistics-table",sourceSemanticCore:"TABLE_DATA_COMPARISON",
      chartRepresentationRendered:false,hiddenRuntime:!publicAdmission,selectorVisible:publicAdmission,productionUse:publicAdmission?"public_review":"forbidden"
    })
  });
}

function validateTable(t){
  if(!t||t.kind!=="one_way_statistics_table"||t.semanticCore!=="TABLE_DATA_COMPARISON"||t.chartRepresentationRendered!==false) return false;
  if(!Array.isArray(t.headers)||t.headers.length!==2||!Array.isArray(t.rows)||t.rows.length<2||t.rows.length>8) return false;
  if(new Set(t.rows.map(r=>r.category)).size!==t.rows.length) return false;
  return t.rows.every(r=>typeof r.category==="string"&&r.category.length>0&&Number.isInteger(r.value)&&r.value>=1000&&r.value<=9999&&r.displayCategory===r.category&&r.displayValue===String(r.value));
}

function recomputeAnswer(q){
  const rows=q.tableData.rows;
  if(q.promptVariant==="MAXIMUM_CATEGORY"){
    const z=extrema(rows,"max"); if(rows.filter(r=>r.value===z.value).length!==1) return null;
    return {selectedCategory:z.category,selectedValue:z.value};
  }
  if(q.promptVariant==="MINIMUM_CATEGORY"){
    const z=extrema(rows,"min"); if(rows.filter(r=>r.value===z.value).length!==1) return null;
    return {selectedCategory:z.category,selectedValue:z.value};
  }
  if(q.promptVariant==="COMPARE_TWO_ROWS"){
    const names=q.answerModel?.comparedCategories;
    if(!Array.isArray(names)||names.length!==2||names[0]===names[1]) return null;
    const a=rows.find(r=>r.category===names[0]),b=rows.find(r=>r.category===names[1]);
    if(!a||!b||a.value===b.value) return null;
    const winner=a.value>b.value?a:b;
    return {selectedCategory:winner.category,selectedValue:winner.value,comparisonSymbol:a.value>b.value?">":"<",comparedCategories:names};
  }
  if(q.promptVariant==="UNIQUE_THRESHOLD_MATCH"){
    const rel=q.threshold?.relation,value=q.threshold?.value;
    if(![">","<"].includes(rel)||!Number.isInteger(value)) return null;
    const matches=rows.filter(r=>rel===">"?r.value>value:r.value<value);
    if(matches.length!==1) return null;
    return {selectedCategory:matches[0].category,selectedValue:matches[0].value};
  }
  return null;
}

export function validateG3AU01VisualRank01Question(q){
  const errors=[];
  if(!q||q.sourceId!==G3A_U01_VISUAL_RANK01_SOURCE_ID||q.knowledgePointId!==G3A_U01_VISUAL_RANK01_KP_ID||q.patternGroupId!==G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID||q.patternSpecId!==G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID) errors.push("G3A_U01_RANK01_IDENTITY_INVALID");
  if(!G3A_U01_VISUAL_RANK01_PROMPT_VARIANTS.includes(q?.promptVariant)) errors.push("G3A_U01_RANK01_PROMPT_VARIANT_INVALID");
  if(!validateTable(q?.tableData)) errors.push("G3A_U01_RANK01_TABLE_MODEL_INVALID");
  const expected=validateTable(q?.tableData)?recomputeAnswer(q):null;
  if(!expected||q?.answerModel?.selectedCategory!==expected.selectedCategory||q?.answerModel?.selectedValue!==expected.selectedValue) errors.push("G3A_U01_RANK01_ANSWER_INVALID");
  if(expected?.comparisonSymbol!==undefined&&q?.answerModel?.comparisonSymbol!==expected.comparisonSymbol) errors.push("G3A_U01_RANK01_COMPARISON_INVALID");
  if(q?.answerText!==(String(q?.answerModel?.selectedCategory)+"（"+String(q?.answerModel?.selectedValue)+"）")) errors.push("G3A_U01_RANK01_ANSWER_TEXT_INVALID");
  const publicAdmission=q?.metadata?.selectorVisible===true;
  const scopeValid=q?.metadata?.representation==="one-way-statistics-table"&&q?.metadata?.sourceSemanticCore==="TABLE_DATA_COMPARISON"&&q?.metadata?.chartRepresentationRendered===false&&(publicAdmission?(q?.metadata?.hiddenRuntime===false&&q?.metadata?.productionUse==="public_review"):(q?.metadata?.hiddenRuntime===true&&q?.metadata?.selectorVisible===false&&q?.metadata?.productionUse==="forbidden"));
  if(!scopeValid) errors.push("G3A_U01_RANK01_SCOPE_INVALID");
  if(Number.isInteger(q?.variant)&&G3A_U01_VISUAL_RANK01_PROMPT_VARIANTS.includes(q?.promptVariant)){
    const rebuilt=buildG3AU01VisualRank01Question({variant:q.variant,promptVariant:q.promptVariant,publicAdmission});
    if(q.questionSignature!==rebuilt.questionSignature||q.promptText!==rebuilt.promptText||JSON.stringify(q.tableData)!==JSON.stringify(rebuilt.tableData)||JSON.stringify(q.answerModel)!==JSON.stringify(rebuilt.answerModel)) errors.push("G3A_U01_RANK01_DETERMINISTIC_CONTRACT_INVALID");
  }
  return Object.freeze({ok:errors.length===0,errors:Object.freeze([...new Set(errors)])});
}

export function validateG3AU01VisualRank01Answer(q,answer){
  const checked=validateG3AU01VisualRank01Question(q);
  if(!checked.ok) return checked;
  const category=typeof answer==="string"?answer.trim():answer?.selectedCategory;
  return category===q.answerModel.selectedCategory
    ? Object.freeze({ok:true,errors:Object.freeze([])})
    : Object.freeze({ok:false,errors:Object.freeze(["G3A_U01_RANK01_ANSWER_MISMATCH"])});
}

export function generateG3AU01VisualRank01Questions(options={}){
  const publicAdmission=options.publicAdmission===true;
  const count=Number.isInteger(options.questionCount)?options.questionCount:20;
  if(count<1||count>G3A_U01_VISUAL_RANK01_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["G3A_U01_RANK01_QUESTION_COUNT_INVALID"]),warnings:Object.freeze([])});
  const requested=Array.isArray(options.promptVariants)?options.promptVariants.filter(x=>G3A_U01_VISUAL_RANK01_PROMPT_VARIANTS.includes(x)):[];
  const variants=requested.length?requested:G3A_U01_VISUAL_RANK01_PROMPT_VARIANTS;
  const start=hash(options.generationSeed??"g3a-u01-visual-rank01")%G3A_U01_VISUAL_RANK01_MAX_QUESTION_COUNT;
  const questions=[];
  for(let i=0;i<count;i++) questions.push(buildG3AU01VisualRank01Question({variant:(start+i)%G3A_U01_VISUAL_RANK01_MAX_QUESTION_COUNT,promptVariant:variants[i%variants.length],publicAdmission}));
  const errors=questions.flatMap(q=>validateG3AU01VisualRank01Question(q).errors);
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),lifecycle:Object.freeze(publicAdmission?{hiddenRuntime:false,selectorVisible:true,productionUse:"public_review"}:{hiddenRuntime:true,selectorVisible:false,productionUse:"forbidden"})});
}
