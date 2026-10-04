import { validateIntegerNumberLineModel } from "../../renderer/fraction-number-line.js";

export const G3A_U01_VISUAL_RANK04_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_VISUAL_RANK04_KP_ID = "kp_g3a_u01_integer_number_line_scale_location";
export const G3A_U01_VISUAL_RANK04_PATTERN_GROUP_ID = "pg_g3a_u01_visual_integer_number_line_complete_scale";
export const G3A_U01_VISUAL_RANK04_PATTERN_SPEC_ID = "ps_g3a_u01_visual_integer_number_line_complete_scale";
export const G3A_U01_VISUAL_RANK04_MAX_QUESTION_COUNT = 240;
export const G3A_U01_VISUAL_RANK04_PROMPT_VARIANTS = Object.freeze(["COMPLETE_MISSING_TICK_VALUES"]);

const STEPS = Object.freeze([1,2,5,10,20,25,50,100,200,500]);

function mod(n,m){ return ((n%m)+m)%m; }
function hash(value){
  let h=2166136261;
  for(const c of String(value??"")){
    h^=c.codePointAt(0);
    h=Math.imul(h,16777619);
  }
  return h>>>0;
}

function missingIndicesFor({stepIndex,tickBand,offsetBand,tickCount}){
  const interiorCount=tickCount-2;
  const missingCount=1+mod(stepIndex+offsetBand,3);
  const out=[];
  let cursor=mod(stepIndex*2+tickBand+offsetBand,interiorCount);
  while(out.length<missingCount){
    const index=1+cursor;
    if(!out.includes(index)) out.push(index);
    cursor=mod(cursor+2,interiorCount);
    if(out.length<missingCount && out.includes(1+cursor)) cursor=mod(cursor+1,interiorCount);
  }
  return Object.freeze(out.sort((a,b)=>a-b));
}

function parameters(variant){
  const u=mod(variant,G3A_U01_VISUAL_RANK04_MAX_QUESTION_COUNT);
  const stepIndex=u%STEPS.length;
  const step=STEPS[stepIndex];
  const tickBand=Math.floor(u/STEPS.length)%6;
  const tickCount=7+tickBand;
  const offsetBand=Math.floor(u/60);
  const last=tickCount-1;
  const maxStart=10000-last*step;
  const unitCapacity=Math.max(0,Math.floor(maxStart/step));
  const startUnits=mod(stepIndex*3+tickBand*5+offsetBand*2,unitCapacity+1);
  const startValue=startUnits*step;
  const values=Array.from({length:tickCount},(_,index)=>startValue+index*step);
  const missingTickIndices=missingIndicesFor({stepIndex,tickBand,offsetBand,tickCount});
  const missingSet=new Set(missingTickIndices);
  const questionVisibleAnchors=values
    .map((value,tickIndex)=>Object.freeze({tickIndex,value}))
    .filter((anchor)=>!missingSet.has(anchor.tickIndex));
  const answerVisibleAnchors=values.map((value,tickIndex)=>Object.freeze({tickIndex,value}));
  const missingValues=missingTickIndices.map((index)=>values[index]);
  return Object.freeze({
    variant:u,
    step,
    tickCount,
    startValue,
    values:Object.freeze(values),
    missingTickIndices,
    missingValues:Object.freeze(missingValues),
    questionVisibleAnchors:Object.freeze(questionVisibleAnchors),
    answerVisibleAnchors:Object.freeze(answerVisibleAnchors),
  });
}

function scaleModel(p,visibleAnchors,ariaLabel){
  return Object.freeze({
    kind:"integer_number_line",
    startValue:p.startValue,
    step:p.step,
    tickCount:p.tickCount,
    ticks:Object.freeze(p.values.map((value,index)=>Object.freeze({
      index,
      value,
      label:String(value),
    }))),
    visibleAnchors,
    markerPolicy:"forbidden",
    increasingLeftToRight:true,
    axisArrowAtRight:true,
    ariaLabel,
  });
}

function questionNumberLineModel(p){
  return scaleModel(
    p,
    p.questionVisibleAnchors,
    "整數數線，請填入缺少的刻度值",
  );
}

function answerNumberLineModel(p){
  return scaleModel(
    p,
    p.answerVisibleAnchors,
    "整數數線答案，已補回所有缺少的刻度值",
  );
}

function geometryIdentity(model){
  if(!model)return null;
  return JSON.stringify({
    kind:model.kind,
    startValue:model.startValue,
    step:model.step,
    tickCount:model.tickCount,
    ticks:model.ticks,
    increasingLeftToRight:model.increasingLeftToRight,
    axisArrowAtRight:model.axisArrowAtRight,
  });
}

function signature(p){
  return [
    p.startValue,
    p.step,
    p.tickCount,
    ...p.missingTickIndices,
    ...p.missingValues,
  ].join("|");
}

function promptFor(){
  return "在數線的空格中填入正確的數。";
}

export function buildG3AU01VisualRank04Question({
  variant=0,
  publicAdmission=false,
}={}){
  const p=parameters(variant);
  const questionNumberLine=questionNumberLineModel(p);
  const answerNumberLine=answerNumberLineModel(p);
  const promptText=promptFor();
  const answerText=p.missingValues.join("、");
  return Object.freeze({
    id:`g3a-u01-rank04-${p.variant}-complete-scale`,
    sourceId:G3A_U01_VISUAL_RANK04_SOURCE_ID,
    knowledgePointId:G3A_U01_VISUAL_RANK04_KP_ID,
    patternGroupId:G3A_U01_VISUAL_RANK04_PATTERN_GROUP_ID,
    patternSpecId:G3A_U01_VISUAL_RANK04_PATTERN_SPEC_ID,
    kind:"visualIntegerNumberLineCompleteScale",
    variant:p.variant,
    promptVariant:"COMPLETE_MISSING_TICK_VALUES",
    promptText,
    questionText:promptText,
    blankedDisplayText:promptText,
    displayText:`${promptText} 答案：${answerText}`,
    missingTickIndices:p.missingTickIndices,
    questionNumberLine,
    answerNumberLine,
    numberLine:questionNumberLine,
    answerModel:Object.freeze({
      missingTickIndices:p.missingTickIndices,
      missingValues:p.missingValues,
      completedAnchors:p.answerVisibleAnchors,
    }),
    answerValue:p.missingValues,
    answerText,
    finalAnswer:answerText,
    questionSignature:signature(p),
    metadata:Object.freeze({
      patternId:G3A_U01_VISUAL_RANK04_PATTERN_SPEC_ID,
      sourceId:G3A_U01_VISUAL_RANK04_SOURCE_ID,
      knowledgePointId:G3A_U01_VISUAL_RANK04_KP_ID,
      patternGroupId:G3A_U01_VISUAL_RANK04_PATTERN_GROUP_ID,
      canonicalSkillIds:Object.freeze(["integer_number_line_scale_location"]),
      skillTags:Object.freeze(["g3a_u01","integer_number_line","complete_missing_tick_values"]),
      difficultyTags:Object.freeze(["visual_completion","rank04"]),
      curriculumNodeIds:Object.freeze([G3A_U01_VISUAL_RANK04_SOURCE_ID]),
      representation:"integer-number-line",
      sourceSemanticCore:"COMPLETE_MISSING_TICK_VALUES",
      hiddenRuntime:!publicAdmission,
      selectorVisible:publicAdmission,
      productionUse:publicAdmission?"public_review":"forbidden",
    }),
  });
}

function exactMissingValues(question){
  const q=question?.questionNumberLine;
  if(!validateIntegerNumberLineModel(q)) return null;
  if(!Array.isArray(question?.missingTickIndices) || question.missingTickIndices.length<1) return null;
  if(new Set(question.missingTickIndices).size!==question.missingTickIndices.length) return null;
  const out=[];
  for(const index of question.missingTickIndices){
    if(!Number.isInteger(index)||index<0||index>=q.tickCount) return null;
    out.push(q.startValue+index*q.step);
  }
  return out;
}

function visibleIndexSet(model){
  return new Set((model?.visibleAnchors??[]).map((anchor)=>anchor.tickIndex));
}

export function validateG3AU01VisualRank04Question(question){
  const errors=[];
  if(
    !question
    || question.sourceId!==G3A_U01_VISUAL_RANK04_SOURCE_ID
    || question.knowledgePointId!==G3A_U01_VISUAL_RANK04_KP_ID
    || question.patternGroupId!==G3A_U01_VISUAL_RANK04_PATTERN_GROUP_ID
    || question.patternSpecId!==G3A_U01_VISUAL_RANK04_PATTERN_SPEC_ID
  ) errors.push("G3A_U01_RANK04_IDENTITY_INVALID");

  if(question?.promptVariant!=="COMPLETE_MISSING_TICK_VALUES"){
    errors.push("G3A_U01_RANK04_PROMPT_VARIANT_INVALID");
  }

  const qModel=question?.questionNumberLine;
  const aModel=question?.answerNumberLine;
  if(!validateIntegerNumberLineModel(qModel)||qModel?.markerPolicy!=="forbidden"||qModel?.targetMarker!=null){
    errors.push("G3A_U01_RANK04_QUESTION_NUMBER_LINE_INVALID");
  }
  if(!validateIntegerNumberLineModel(aModel)||aModel?.markerPolicy!=="forbidden"||aModel?.targetMarker!=null){
    errors.push("G3A_U01_RANK04_ANSWER_NUMBER_LINE_INVALID");
  }
  if(geometryIdentity(qModel)!==geometryIdentity(aModel)){
    errors.push("G3A_U01_RANK04_SCALE_GEOMETRY_INVALID");
  }

  const expected=exactMissingValues(question);
  const qVisible=visibleIndexSet(qModel);
  const aVisible=visibleIndexSet(aModel);
  const allIndices=Array.from({length:qModel?.tickCount??0},(_,index)=>index);
  const missingSet=new Set(question?.missingTickIndices??[]);
  const expectedQuestionVisible=allIndices.filter((index)=>!missingSet.has(index));

  if(
    !expected
    || question.missingTickIndices.some((index)=>qVisible.has(index))
    || expectedQuestionVisible.some((index)=>!qVisible.has(index))
    || qVisible.size!==expectedQuestionVisible.length
  ){
    errors.push("G3A_U01_RANK04_QUESTION_MISSING_LABEL_PROJECTION_INVALID");
  }

  if(
    allIndices.some((index)=>!aVisible.has(index))
    || aVisible.size!==allIndices.length
  ){
    errors.push("G3A_U01_RANK04_ANSWER_COMPLETION_PROJECTION_INVALID");
  }

  if(
    !expected
    || JSON.stringify(question?.answerModel?.missingTickIndices)!==JSON.stringify(question?.missingTickIndices)
    || JSON.stringify(question?.answerModel?.missingValues)!==JSON.stringify(expected)
    || JSON.stringify(question?.answerValue)!==JSON.stringify(expected)
    || JSON.stringify(question?.answerModel?.completedAnchors)!==JSON.stringify(aModel?.visibleAnchors)
  ){
    errors.push("G3A_U01_RANK04_ANSWER_MODEL_INVALID");
  }

  const scopeValid=
    question?.metadata?.representation==="integer-number-line"
    && question?.metadata?.sourceSemanticCore==="COMPLETE_MISSING_TICK_VALUES"
    && (
      question?.metadata?.selectorVisible===true
        ? question?.metadata?.hiddenRuntime===false&&question?.metadata?.productionUse==="public_review"
        : question?.metadata?.hiddenRuntime===true&&question?.metadata?.productionUse==="forbidden"
    );
  if(!scopeValid) errors.push("G3A_U01_RANK04_SCOPE_INVALID");

  if(Number.isInteger(question?.variant)){
    const rebuilt=buildG3AU01VisualRank04Question({
      variant:question.variant,
      publicAdmission:question?.metadata?.selectorVisible===true,
    });
    if(
      question.questionSignature!==rebuilt.questionSignature
      || JSON.stringify(question.questionNumberLine)!==JSON.stringify(rebuilt.questionNumberLine)
      || JSON.stringify(question.answerNumberLine)!==JSON.stringify(rebuilt.answerNumberLine)
      || JSON.stringify(question.answerModel)!==JSON.stringify(rebuilt.answerModel)
      || question.promptText!==rebuilt.promptText
    ){
      errors.push("G3A_U01_RANK04_DETERMINISTIC_CONTRACT_INVALID");
    }
  }

  return Object.freeze({
    ok:errors.length===0,
    errors:Object.freeze([...new Set(errors)]),
  });
}

export function validateG3AU01VisualRank04Answer(question,answer){
  const checked=validateG3AU01VisualRank04Question(question);
  if(!checked.ok)return checked;
  let candidate=answer;
  if(typeof answer==="string"){
    candidate=answer
      .split(/[、,，\s]+/)
      .filter(Boolean)
      .map((value)=>Number(value));
  }else if(answer&&typeof answer==="object"&&!Array.isArray(answer)){
    candidate=answer.missingValues;
  }
  const ok=Array.isArray(candidate)
    && candidate.every(Number.isInteger)
    && JSON.stringify(candidate)===JSON.stringify(question.answerModel.missingValues);
  return ok
    ? Object.freeze({ok:true,errors:Object.freeze([])})
    : Object.freeze({ok:false,errors:Object.freeze(["G3A_U01_RANK04_ANSWER_MISMATCH"])});
}

export function generateG3AU01VisualRank04Questions(options={}){
  const publicAdmission=options.publicAdmission===true;
  const count=Number.isInteger(options.questionCount)?options.questionCount:20;
  if(count<1||count>G3A_U01_VISUAL_RANK04_MAX_QUESTION_COUNT){
    return Object.freeze({
      ok:false,
      questions:Object.freeze([]),
      errors:Object.freeze(["G3A_U01_RANK04_QUESTION_COUNT_INVALID"]),
      warnings:Object.freeze([]),
    });
  }
  const start=hash(options.generationSeed??"g3a-u01-visual-rank04")%G3A_U01_VISUAL_RANK04_MAX_QUESTION_COUNT;
  const questions=[];
  for(let i=0;i<count;i++){
    questions.push(buildG3AU01VisualRank04Question({
      variant:(start+i)%G3A_U01_VISUAL_RANK04_MAX_QUESTION_COUNT,
      publicAdmission,
    }));
  }
  const errors=questions.flatMap((question)=>validateG3AU01VisualRank04Question(question).errors);
  return Object.freeze({
    ok:errors.length===0,
    questions:Object.freeze(questions),
    errors:Object.freeze(errors),
    warnings:Object.freeze([]),
    lifecycle:Object.freeze(publicAdmission
      ? {hiddenRuntime:false,selectorVisible:true,productionUse:"public_review"}
      : {hiddenRuntime:true,selectorVisible:false,productionUse:"forbidden"}),
  });
}
